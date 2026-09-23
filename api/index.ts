import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server';

export default function handler(req: any, res: any) {
  // If rewritten by Vercel to /api/index, restore original URL so Express routes match correctly
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'];
  if (matchedPath && typeof matchedPath === 'string' && matchedPath.startsWith('/api/')) {
    req.url = matchedPath;
  }
  return (app as any)(req, res);
}

