import type { IncomingMessage, ServerResponse } from 'http';
import { getGenAI } from '../server/gemini';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify({
    status: 'ok',
    geminiConfigured: Boolean(getGenAI()),
  }));
}
