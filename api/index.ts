import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server';

export default function handler(req: any, res: any) {
  // If req.url was rewritten to /api or /api/index, restore original URL
  if (req.url === '/api' || req.url === '/api/index' || req.url.startsWith('/api/index?') || req.url === '/') {
    const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'] || req.headers['x-original-uri'] || req.headers['x-forwarded-uri'];
    if (matchedPath && typeof matchedPath === 'string' && matchedPath.startsWith('/api/') && matchedPath !== '/api/index') {
      req.url = matchedPath;
    }
  }
  return (app as any)(req, res);
}

