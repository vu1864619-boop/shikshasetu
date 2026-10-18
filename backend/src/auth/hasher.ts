import crypto from 'node:crypto';

/**
 * Hashes a student/staff PIN using PBKDF2 with HMAC-SHA512 and a cryptographically secure random salt.
 * Uses 100,000 iterations to ensure resistance to brute-force attacks on short numeric PINs.
 */
export function hashPin(pin: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(32).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(pin, salt, 100000, 64, 'sha512');
  return {
    hash: derivedKey.toString('hex'),
    salt,
  };
}

/**
 * Verifies a PIN against the stored hash and salt using constant-time comparison
 * to eliminate timing attack vulnerabilities.
 */
export function verifyPin(pin: string, storedHash: string, salt: string): boolean {
  if (!pin || !storedHash || !salt) return false;
  const derivedKey = crypto.pbkdf2Sync(pin, salt, 100000, 64, 'sha512');
  const derivedBuffer = Buffer.from(derivedKey.toString('hex'), 'utf8');
  const storedBuffer = Buffer.from(storedHash, 'utf8');

  if (derivedBuffer.length !== storedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(derivedBuffer, storedBuffer);
}
