import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshTokenString,
  hashRefreshToken,
  ACCESS_TOKEN_EXPIRATION_SECONDS
} from '../../src/features/auth/utils/token.utils';

describe('Token Utilities Unit Suite', () => {
  it('should generate a valid JWT access token with required payload', () => {
    const payload = {
      userId: '6710ea1b8f14c2d3a1e94b10',
      role: 'patient',
      tokenVersion: 0
    };

    const token = generateAccessToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // Header.Payload.Signature

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.tokenVersion).toBe(payload.tokenVersion);
  });

  it('should generate a 64-character (256-bit) hex string for refresh tokens', () => {
    const token1 = generateRefreshTokenString();
    const token2 = generateRefreshTokenString();

    expect(typeof token1).toBe('string');
    expect(token1.length).toBe(64);
    expect(/^[a-f0-9]{64}$/.test(token1)).toBe(true);
    expect(token1).not.toBe(token2);
  });

  it('should deterministically hash refresh tokens via SHA-256', () => {
    const token = 'sample_refresh_token_string_12345';
    const hash1 = hashRefreshToken(token);
    const hash2 = hashRefreshToken(token);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

  it('should throw an error when verifying an invalid or tampered token', () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
    expect(() => verifyAccessToken(invalidToken)).toThrow();
  });

  it('should enforce 15-minute (900s) access token expiration constant', () => {
    expect(ACCESS_TOKEN_EXPIRATION_SECONDS).toBe(900);
  });
});
