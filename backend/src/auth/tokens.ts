import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AuthTokenPayload } from '../types.js';

export function signToken(payload: AuthTokenPayload): string {
  // @ts-ignore
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}
