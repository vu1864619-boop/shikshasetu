import { config } from '../config.js';

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  lastAttemptAt: number;
  lockoutUntil: number | null;
}

// In-memory tracker keyed by identifier (IP address, student ID or IP+ID composite)
class RateLimiter {
  private attempts: Map<string, AttemptRecord> = new Map();

  /**
   * Checks whether the given key is currently locked out.
   * Returns remaining lockout seconds if locked, or null if permitted.
   */
  isLocked(key: string): { locked: boolean; remainingSeconds: number } {
    const record = this.attempts.get(key);
    if (!record || !record.lockoutUntil) {
      return { locked: false, remainingSeconds: 0 };
    }

    const now = Date.now();
    if (now < record.lockoutUntil) {
      const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
      return { locked: true, remainingSeconds };
    }

    // Lockout has expired, reset attempt count
    this.attempts.delete(key);
    return { locked: false, remainingSeconds: 0 };
  }

  /**
   * Registers a failed attempt. Calculates escalating delay and sets lockout if threshold is exceeded.
   */
  recordFailedAttempt(key: string): { locked: boolean; remainingAttempts: number; lockoutSeconds: number } {
    const now = Date.now();
    let record = this.attempts.get(key);

    if (!record) {
      record = {
        count: 1,
        firstAttemptAt: now,
        lastAttemptAt: now,
        lockoutUntil: null,
      };
      this.attempts.set(key, record);
    } else {
      record.count += 1;
      record.lastAttemptAt = now;
    }

    if (record.count >= config.maxFailedAttempts) {
      // Escalating lockout: 1st tier is config duration (15m), further strikes double it
      const multiplier = Math.max(1, record.count - config.maxFailedAttempts + 1);
      const lockoutMs = config.lockoutDurationMinutes * 60 * 1000 * multiplier;
      record.lockoutUntil = now + lockoutMs;
      return {
        locked: true,
        remainingAttempts: 0,
        lockoutSeconds: Math.ceil(lockoutMs / 1000),
      };
    }

    const remainingAttempts = config.maxFailedAttempts - record.count;
    return {
      locked: false,
      remainingAttempts,
      lockoutSeconds: 0,
    };
  }

  /**
   * Clears failed attempts upon successful authentication or teacher reset.
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Clean up expired tracking records
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      // If no lockout and no activity for 30 minutes, or lockout expired
      if (
        (!record.lockoutUntil && now - record.lastAttemptAt > 30 * 60 * 1000) ||
        (record.lockoutUntil && now > record.lockoutUntil)
      ) {
        this.attempts.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Periodically clean up stale records every 10 minutes
setInterval(() => rateLimiter.cleanup(), 10 * 60 * 1000).unref();
