import { validateEmail, validatePassword } from '../utils/authValidator';

describe('Auth Validator Tests', () => {
  test('validates correct email addresses', () => {
    expect(validateEmail('safety.officer@safeguard.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
  });

  test('enforces password minimum length', () => {
    expect(validatePassword('123').isValid).toBe(false);
    expect(validatePassword('secret123').isValid).toBe(true);
  });
});
