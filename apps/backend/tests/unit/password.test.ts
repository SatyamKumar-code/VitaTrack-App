import bcrypt from 'bcrypt';

describe('Password Security Unit Suite (TASK-P2-01 & SECURITY_PRIVACY.md)', () => {
  const plainPassword = 'SecurePassword123!';

  it('should hash passwords using bcrypt with cost factor >= 12', async () => {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(plainPassword, salt);

    // bcrypt hash starts with $2a$, $2b$, or $2y$ followed by the cost factor 12
    expect(hash).toMatch(/^\$2[aby]\$12\$/);

    const isMatch = await bcrypt.compare(plainPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare('WrongPassword456!', hash);
    expect(isWrongMatch).toBe(false);
  });
});
