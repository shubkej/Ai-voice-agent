import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { Modality } from "@google/genai";
import {
  apiApp,
  getGenAI,
  ADESH_SYSTEM_INSTRUCTION,
  toolsConfig,
  handleToolExecution,
} from "./server/apiApp";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Mount shared API routes (/api/leads, /api/health, /api/chat, /api/lead)
app.use(apiApp);

// Set up WebSocket server for Gemini Live
const wss = new WebSocketServer({ server: httpServer, path: "/live" });

wss.on("connection", async (clientWs: WebSocket) => {
  console.log("Client connected to /live WebSocket");

  const ai = getGenAI();
  if (!ai) {
    clientWs.send(JSON.stringify({
      type: "error",
      message: "GEMINI_API_KEY environment variable is not configured. Please add it via the Secrets panel.",
    }));
    clientWs.close();
    return;
  }

  let session: Awaited<ReturnType<typeof ai.live.connect>> | null = null;

  try {
    session = await ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Fenrir", // Professional, reliable tone
            },
          },
        },
        systemInstruction: ADESH_SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: toolsConfig }],
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => {
          console.log("Gemini Live session opened successfully");
          clientWs.send(JSON.stringify({ type: "session_ready", message: "Connected to Adesh" }));
        },
        onmessage: (liveMsg) => {
          // Handle audio from model turn
          const parts = liveMsg.serverContent?.modelTurn?.parts;
          if (parts && parts.length > 0) {
            for (const part of parts) {
              if (part.inlineData && part.inlineData.data) {
                clientWs.send(JSON.stringify({
                  type: "audio",
                  audio: part.inlineData.data,
                }));
              }
              if (part.text) {
                clientWs.send(JSON.stringify({
                  type: "transcript_model",
                  text: part.text,
                }));
              }
            }
          }

          // Handle speech interruption
          if (liveMsg.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: "interrupted" }));
          }

          // Handle input transcription (caller)
          const inTranscript = liveMsg.serverContent?.inputTranscription || liveMsg.serverContent?.interimInputTranscription;
          if (inTranscript && inTranscript.text) {
            clientWs.send(JSON.stringify({ type: "transcript_user", text: inTranscript.text }));
          }

          // Handle output transcription (Adesh)
          const outTranscript = liveMsg.serverContent?.outputTranscription;
          if (outTranscript && outTranscript.text) {
            clientWs.send(JSON.stringify({ type: "transcript_model", text: outTranscript.text }));
          }

          // Handle function calling in Live API
          const toolCall = liveMsg.toolCall;
          if (toolCall && toolCall.functionCalls && toolCall.functionCalls.length > 0) {
            const functionResponses = [];
            for (const fc of toolCall.functionCalls) {
              console.log(`Live Tool Call: ${fc.name}`, fc.args);
              const execution = handleToolExecution(fc.name, fc.args as Record<string, unknown>);
              functionResponses.push({
                name: fc.name,
                id: fc.id,
                response: execution,
              });

              // Notify frontend to update UI records live
              clientWs.send(JSON.stringify({
                type: "tool_executed",
                tool: fc.name,
                args: fc.args,
                result: execution,
              }));
            }

            if (session) {
              session.sendToolResponse({ functionResponses });
            }
          }
        },
        onerror: (err) => {
          console.error("Gemini Live error:", err);
          clientWs.send(JSON.stringify({
            type: "error",
            message: err instanceof Error ? err.message : "Error in Gemini Live connection",
          }));
        },
        onclose: () => {
          console.log("Gemini Live session closed");
          clientWs.send(JSON.stringify({ type: "session_closed" }));
        },
      },
    });

    clientWs.on("message", (raw) => {
      try {
        const payload = JSON.parse(raw.toString());

        if (payload.type === "audio" && payload.audio) {
          // Send 16kHz PCM audio chunk
          if (session) {
            session.sendRealtimeInput({
              audio: {
                data: payload.audio,
                mimeType: "audio/pcm;rate=16000",
              },
            });
          }
        } else if (payload.type === "text" && payload.text) {
          // Send text prompt to live session
          if (session) {
            session.sendRealtimeInput({
              text: payload.text,
            });
          }
        } else if (payload.type === "start_call") {
          // Trigger initial greeting from Adesh
          if (session) {
            session.sendRealtimeInput({
              text: "A customer has connected. Greet the user immediately with: 'Hello, I am Adesh from Ganesh Enterprises, how can I help you?'",
            });
          }
        }
      } catch (e) {
        console.error("Error processing client WebSocket message:", e);
      }
    });

    clientWs.on("close", () => {
      console.log("Client disconnected from /live");
      if (session) {
        try {
          session.close();
        } catch (e) {
          // ignore cleanup error
        }
      }
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Failed to start Gemini Live session:", errMsg);
    clientWs.send(JSON.stringify({
      type: "error",
      message: `Failed to initialize Gemini Live: ${errMsg}`,
    }));
    clientWs.close();
  }
});

// Vite middleware or static serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Ganesh Enterprises Voice Agent server running at http://0.0.0.0:${PORT}`);
  });
}

start();
