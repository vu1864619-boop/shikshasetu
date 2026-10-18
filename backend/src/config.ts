import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'shikshasetu-super-secure-dev-secret-change-in-prod-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  dbPath: process.env.DB_PATH || path.resolve(process.cwd(), 'shikshasetu.db'),
  maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS || '5', 10),
  lockoutDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10),
  isProduction: process.env.NODE_ENV === 'production',
};

// Security check: ensure default dev secret is not used in production
if (config.isProduction && config.jwtSecret.includes('dev-secret')) {
  throw new Error('SECURITY CRITICAL: Default development JWT secret cannot be used in production environment!');
}
