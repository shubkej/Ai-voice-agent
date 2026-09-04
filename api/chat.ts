import type { IncomingMessage, ServerResponse } from 'http';
import {
  ADESH_SYSTEM_INSTRUCTION,
  handleToolExecution,
  toolsConfig,
} from '../server/apiApp';
import { getGenAI } from '../server/gemini';

type ChatRequest = {
  message?: string;
  conversationHistory?: Array<{ role?: string; text?: string }>;
};

async function readBody(req: IncomingMessage): Promise<ChatRequest> {
  const requestWithBody = req as IncomingMessage & { body?: ChatRequest };
  if (requestWithBody.body) return requestWithBody.body;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as ChatRequest;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const ai = getGenAI();
    if (!ai) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }));
      return;
    }

    const body = await readBody(req);
    const contents = [
      ...(body.conversationHistory || []).map((item) => ({
        role: item.role === 'user' ? 'user' : 'model',
        parts: [{ text: item.text || '' }],
      })),
      { role: 'user', parts: [{ text: body.message || 'Hello' }] },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction: ADESH_SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: toolsConfig }],
      },
    });

    let toolResult: { tool: string; args: unknown; result: unknown } | null = null;
    for (const functionCall of response.functionCalls || []) {
      if (!functionCall.name) continue;
      toolResult = {
        tool: functionCall.name,
        args: functionCall.args,
        result: handleToolExecution(functionCall.name, functionCall.args as Record<string, unknown>),
      };
    }

    const toolMessage = toolResult?.result && typeof toolResult.result === 'object' && 'message' in toolResult.result
      ? String(toolResult.result.message)
      : undefined;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      reply: response.text || toolMessage || "Understood! I've noted that down for you. How else can I assist your team today?",
      toolResult,
    }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Chat function error:', message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Failed to process chat request' }));
  }
}
