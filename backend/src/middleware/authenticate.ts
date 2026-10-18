import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth/tokens.js';
import { AuthTokenPayload } from '../types.js';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid authentication token.'
    });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Session has expired or is invalid. Please sign in again.'
    });
    return;
  }

  req.user = payload;
  next();
}
