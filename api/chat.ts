import type { IncomingMessage, ServerResponse } from 'http';
import { apiApp } from '../server/apiApp';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  apiApp(req, res);
}
