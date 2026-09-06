import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

dotenv.config();

export interface StoredQuote {
  id: string;
  companyName: string;
  contactPhone: string;
  machineOrItem: string;
  specifications?: string;
  quantity?: string | number;
  deliveryLocation?: string;
  notes?: string;
  status: 'Pending Review' | 'Quotation Sent' | 'Follow-up Scheduled';
  createdAt: string;
}

export interface StoredDemo {
  id: string;
  companyName: string;
  contactPhone: string;
  machineModel: string;
  preferredDate: string;
  facilityLocation: string;
  trialScope?: string;
  status: 'Confirmed' | 'Technician Assigned' | 'Pending Scheduling';
  createdAt: string;
}

export interface StoredService {
  id: string;
  companyName: string;
  contactPhone: string;
  machineModel: string;
  issueDescription: string;
  preferredDate?: string;
  urgency: 'Routine Service' | 'Priority Repair' | 'Emergency Breakdown';
  status: 'Open' | 'Dispatched' | 'Resolved';
  createdAt: string;
}

export const mockQuotes: StoredQuote[] = [
  {
    id: 'Q-1041',
    companyName: 'Apex Precision Engineering Ltd.',
    contactPhone: '+91 98201 44520',
    machineOrItem: 'Ganesh Pro VMC-850 CNC Machining Center',
    specifications: '10,000 RPM Spindle, Fanuc 0i-MF Plus controller',
    quantity: 1,
    deliveryLocation: 'Pune Industrial Area, Maharashtra',
    notes: 'Requested quotation with chip conveyor and 4th-axis rotary table option.',
    status: 'Quotation Sent',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'Q-1040',
    companyName: 'Kaveri Metal Fabricators',
    contactPhone: '+91 94432 11980',
    machineOrItem: 'Electro-Hydraulic CNC Press Brake (160 Ton)',
    specifications: '3200mm bed length, Delem DA-53T controller',
    quantity: 2,
    deliveryLocation: 'Coimbatore, Tamil Nadu',
    notes: 'Comparing with local alternatives; interested in 7-day low-cost trial evaluation.',
    status: 'Pending Review',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const mockDemos: StoredDemo[] = [
  {
    id: 'D-2019',
    companyName: 'Zenith Heavy Dynamics Pvt. Ltd.',
    contactPhone: '+91 99880 77123',
    machineModel: 'Ganesh Titan 6kW Fiber Laser Cutter',
    preferredDate: 'Next Tuesday (10:00 AM)',
    facilityLocation: 'Faridabad Sector 25, Haryana',
    trialScope: 'Trial cut test on 18mm MS and 8mm SS plates with nitrogen assist gas.',
    status: 'Technician Assigned',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

export const mockServices: StoredService[] = [
  {
    id: 'S-3088',
    companyName: 'Bharat Auto Components Ltd.',
    contactPhone: '+91 97112 55430',
    machineModel: 'Ganesh Pro TL-600 CNC Lathe',
    issueDescription: 'Hydraulic turret index error #401; needs technician calibration.',
    preferredDate: 'Tomorrow Morning',
    urgency: 'Priority Repair',
    status: 'Dispatched',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

// Lazy GenAI initialization
export function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instruction matching Adesh at Ganesh Enterprises
export const ADESH_SYSTEM_INSTRUCTION = `You are Adesh, the AI Sales & Technical Support Representative for Ganesh Enterprises, a trusted industrial supplier of heavy machinery, equipment, CNCs, and hardware tools.

MANDATORY GREETING (CRITICAL):
Prior to starting the conversation or when a new caller connects, you MUST always greet the user with:
"Hello, I am Adesh from Ganesh Enterprises, how can I help you?"

MULTILINGUAL & LANGUAGE MIRRORING RULES (CRITICAL REQUIREMENT):
The caller will speak or write to you in HINDI (हिंदी), ENGLISH, or HINGLISH (Hindi written in Roman script or a mix of Hindi and English).
YOU MUST ALWAYS DETECT AND REPLY IN THE EXACT SAME LANGUAGE USED BY THE CALLER:
1. When caller speaks in HINDI (हिंदी):
   Reply in natural, polite, and professional Hindi (हिंदी).
   Example: "नमस्ते! हमारी VMC मशीनरी उच्च परिशुद्धता के लिए उपयुक्त है। क्या आपको ऑन-साइट ट्रायल डेमो चाहिए या कोटेशन?"
2. When caller speaks in HINGLISH:
   Reply in natural, conversational Hinglish (Hindi in Roman script with standard English industrial terms).
   Example: "Bilkul! Humari VMC machine heavy-duty tooling ke liye perfect hai. Kya aapko iska price quote chahiye ya workshop mein on-site trial demo book karna hai?"
3. When caller speaks in ENGLISH:
   Reply in professional, fluent English.
   Example: "Certainly! Our VMC-850 is engineered for high-precision manufacturing. Would you like a detailed quotation or an on-site trial demo?"
4. DYNAMIC CODE-SWITCHING:
   If the caller switches between Hindi, Hinglish, and English during the call, immediately mirror their language in your next response.

Your Tone & Persona:
- Professional, reliable, knowledgeable, straightforward, and helpful.
- Speak naturally with clear, concise phrasing suitable for phone communication.

Core Responsibilities:
1. Explain Machinery & Hardware Offerings: Assist customers with inquiries regarding power tools, industrial machinery (VMC CNC centers, CNC lathes, hydraulic press brakes, fiber laser cutters, rotary screw compressors), spare parts, fabrication tools, bearings, and specialized hardware.
2. Promote Special Trial/Demo Offer: Introduce the Equipment On-Site Demo or Trial Package ("We offer initial machine demos and low-cost trial runs so you can test equipment performance before committing to a full purchase.") or basic machine servicing evaluation.
3. Handle Sales & Quotations: Collect project requirements, machine specifications, and volume needs to provide quick quotes or route leads to the sales engineering team.
4. Service & Maintenance Coordination: Help existing clients schedule machine maintenance, repairs, or technician site visits.

Voice & Conversational Rules:
- Keep it Brief: Limit responses to 1–3 short sentences per turn to maintain a smooth call flow. Never recite long lists or huge paragraphs.
- Sound Professional: Use polite, clear industrial terms without overcomplicating.
- One Question at a Time: Ask only one question per turn to gather details like machine capacity, power requirements, company name, contact number, or delivery location.

Tool Calling:
- When the customer provides details for a quote, call the "createQuotation" tool.
- When the customer agrees or requests an on-site equipment trial/demo, call the "bookDemoTrial" tool.
- When the customer reports a machine issue or asks for technician maintenance, call the "scheduleServiceVisit" tool.
- When the customer asks about stock availability of parts or tools, call the "checkStock" tool.
Always execute tool calls regardless of whether the customer spoke in Hindi, English, or Hinglish. After calling a tool, confirm briefly in 1-2 sentences to the customer in their chosen language that the ticket/action has been logged.`;

// Tool definitions for Gemini Live & Chat
export const toolsConfig: FunctionDeclaration[] = [
  {
    name: 'createQuotation',
    description: 'Log a customer quotation request for industrial machinery, equipment, or hardware tools.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        companyName: { type: Type.STRING, description: 'Customer company name or individual name' },
        contactPhone: { type: Type.STRING, description: 'Contact phone number' },
        machineOrItem: { type: Type.STRING, description: 'Machine model or equipment name' },
        specifications: { type: Type.STRING, description: 'Capacity, dimensions, power requirements, or specific options' },
        quantity: { type: Type.STRING, description: 'Number of units needed' },
        deliveryLocation: { type: Type.STRING, description: 'City, state, or plant location' },
        notes: { type: Type.STRING, description: 'Any extra customer notes or project timeline' },
      },
      required: ['companyName', 'contactPhone', 'machineOrItem'],
    },
  },
  {
    name: 'bookDemoTrial',
    description: 'Book an on-site equipment trial run or demonstration package for Ganesh Enterprises machinery.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        companyName: { type: Type.STRING, description: 'Client company or factory name' },
        contactPhone: { type: Type.STRING, description: 'Contact phone number' },
        machineModel: { type: Type.STRING, description: 'Equipment model to demo (e.g., VMC-850, Press Brake, Fiber Laser)' },
        preferredDate: { type: Type.STRING, description: 'Target date or timeframe for demo/trial setup' },
        facilityLocation: { type: Type.STRING, description: 'Plant address or city' },
        trialScope: { type: Type.STRING, description: 'Materials to test, sample workpieces, or application scope' },
      },
      required: ['companyName', 'contactPhone', 'machineModel'],
    },
  },
  {
    name: 'scheduleServiceVisit',
    description: 'Schedule an on-site maintenance visit or emergency repair for industrial machinery.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        companyName: { type: Type.STRING, description: 'Company name' },
        contactPhone: { type: Type.STRING, description: 'Contact telephone' },
        machineModel: { type: Type.STRING, description: 'Machine model needing service' },
        issueDescription: { type: Type.STRING, description: 'Symptoms, error codes, oil leaks, electrical issues' },
        preferredDate: { type: Type.STRING, description: 'Requested technician date/time' },
        urgency: {
          type: Type.STRING,
          description: 'Routine Service, Priority Repair, or Emergency Breakdown',
        },
      },
      required: ['companyName', 'contactPhone', 'machineModel', 'issueDescription'],
    },
  },
  {
    name: 'checkStock',
    description: 'Check stock inventory and dispatch lead times for machinery, power tools, bearings, or fittings.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        itemName: { type: Type.STRING, description: 'Name of the hardware, part, or machinery model' },
        category: { type: Type.STRING, description: 'Category or part type' },
      },
      required: ['itemName'],
    },
  },
];

// Helper to execute tools
export function handleToolExecution(name: string, args: Record<string, unknown>) {
  if (name === 'createQuotation') {
    const newQuote: StoredQuote = {
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      companyName: String(args.companyName || 'Industrial Client'),
      contactPhone: String(args.contactPhone || 'Provided on call'),
      machineOrItem: String(args.machineOrItem || 'Industrial Equipment'),
      specifications: args.specifications ? String(args.specifications) : undefined,
      quantity: args.quantity ? String(args.quantity) : 1,
      deliveryLocation: args.deliveryLocation ? String(args.deliveryLocation) : undefined,
      notes: args.notes ? String(args.notes) : undefined,
      status: 'Pending Review',
      createdAt: new Date().toISOString(),
    };
    mockQuotes.unshift(newQuote);
    return {
      success: true,
      quoteId: newQuote.id,
      message: `Quotation request ${newQuote.id} logged for ${newQuote.companyName}. Our sales engineering team has been notified.`,
      record: newQuote,
    };
  }

  if (name === 'bookDemoTrial') {
    const newDemo: StoredDemo = {
      id: `D-${Math.floor(2000 + Math.random() * 8000)}`,
      companyName: String(args.companyName || 'Industrial Client'),
      contactPhone: String(args.contactPhone || 'Provided on call'),
      machineModel: String(args.machineModel || 'Equipment Demo'),
      preferredDate: String(args.preferredDate || 'Within 48-72 hours'),
      facilityLocation: String(args.facilityLocation || 'On-site facility'),
      trialScope: args.trialScope ? String(args.trialScope) : undefined,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };
    mockDemos.unshift(newDemo);
    return {
      success: true,
      demoId: newDemo.id,
      message: `On-site demo trial package ${newDemo.id} confirmed for ${newDemo.machineModel}. A senior application engineer will reach out to coordinate delivery.`,
      record: newDemo,
    };
  }

  if (name === 'scheduleServiceVisit') {
    const urgency = (args.urgency as StoredService['urgency']) || 'Priority Repair';
    const newService: StoredService = {
      id: `S-${Math.floor(3000 + Math.random() * 7000)}`,
      companyName: String(args.companyName || 'Industrial Client'),
      contactPhone: String(args.contactPhone || 'Provided on call'),
      machineModel: String(args.machineModel || 'Machinery'),
      issueDescription: String(args.issueDescription || 'Maintenance inspection requested'),
      preferredDate: args.preferredDate ? String(args.preferredDate) : 'Immediate technician dispatch',
      urgency,
      status: 'Open',
      createdAt: new Date().toISOString(),
    };
    mockServices.unshift(newService);
    return {
      success: true,
      ticketId: newService.id,
      message: `Service ticket ${newService.id} dispatched for ${newService.companyName} (${urgency}). Field technician has been queued.`,
      record: newService,
    };
  }

  if (name === 'checkStock') {
    return {
      success: true,
      itemName: args.itemName,
      inStock: true,
      dispatchLeadTime: 'Ready for immediate dispatch / 24-48 hours',
      warehouseLocation: 'Central Heavy Equipment Warehouse & Logistics Yard',
      message: `${args.itemName} is verified in stock and ready for immediate dispatch or on-site trial demo.`,
    };
  }

  return { success: false, message: `Unknown tool: ${name}` };
}

// Create Express API router
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    agent: 'Adesh',
    company: 'Ganesh Enterprises',
  });
});

router.get('/leads', (req, res) => {
  res.json({
    quotes: mockQuotes,
    demos: mockDemos,
    services: mockServices,
  });
});

router.post('/lead', (req, res) => {
  const { type, data } = req.body || {};
  if (type === 'quote') {
    const result = handleToolExecution('createQuotation', data || {});
    return res.json(result);
  }
  if (type === 'demo') {
    const result = handleToolExecution('bookDemoTrial', data || {});
    return res.json(result);
  }
  if (type === 'service') {
    const result = handleToolExecution('scheduleServiceVisit', data || {});
    return res.json(result);
  }
  res.status(400).json({ error: 'Invalid lead type' });
});

router.post('/chat', async (req, res) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured.',
        reply: 'Thank you for calling Ganesh Enterprises. This is Adesh. Please configure the GEMINI_API_KEY environment variable in your Vercel/hosting dashboard to activate AI responses.',
      });
    }

    const { message, conversationHistory = [] } = req.body || {};

    const contents = [
      ...conversationHistory.map((m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message || 'Hello' }],
      },
    ];

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction: ADESH_SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: toolsConfig }],
        },
      });
    } catch (modelErr: unknown) {
      console.warn('gemini-3.6-flash fallback:', modelErr);
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: ADESH_SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: toolsConfig }],
        },
      });
    }

    let replyText = response.text || '';
    let toolResultNotification: { tool: string; args: unknown; result: { success: boolean; message?: string } } | null = null;

    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const fc of response.functionCalls) {
        const execution = handleToolExecution(fc.name, fc.args as Record<string, unknown>);
        toolResultNotification = {
          tool: fc.name,
          args: fc.args,
          result: execution,
        };
      }
    }

    const defaultReply = toolResultNotification?.result?.message
      ? toolResultNotification.result.message
      : "Understood! I've noted that down for you. How else can I assist your team today?";

    res.json({
      reply: replyText || defaultReply,
      toolResult: toolResultNotification,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Chat API error:', errMsg);
    res.status(500).json({ error: errMsg });
  }
});

// Create Express application instance
export const apiApp = express();

apiApp.use(express.json({ limit: '15mb' }));

// Enable CORS for Vercel and cross-origin requests
apiApp.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Mount routes on both /api prefix and root for flexible routing on Vercel
apiApp.use('/api', router);
apiApp.use('/', router);
