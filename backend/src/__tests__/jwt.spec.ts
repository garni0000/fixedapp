import { describe, expect, it } from 'vitest';
import { signAccessToken, verifyAccessToken } from '../utils/jwt';

describe('JWT utilities', () => {
  it('signs and verifies an access token', () => {
    const token = signAccessToken({ userId: 'user_123', role: 'USER' });
    const payload = verifyAccessToken(token);
    expect(payload.userId).toBe('user_123');
    expect(payload.role).toBe('USER');
  });

  it('throws on invalid token', () => {
    expect(() => verifyAccessToken('invalid.token')).toThrow();
  });
});

