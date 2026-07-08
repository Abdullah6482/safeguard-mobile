import { AuthManager } from '../lib/authManager';

describe('Auth Session Manager', () => {
  test('evaluates expired sessions correctly', () => {
    AuthManager.setSession({ expiresAt: Date.now() - 1000 });
    expect(AuthManager.isExpired()).toBe(true);

    AuthManager.setSession({ expiresAt: Date.now() + 100000 });
    expect(AuthManager.isExpired()).toBe(false);
  });

  test('validates user role authorizations', () => {
    AuthManager.setSession({ user: { role: 'investigator' } });
    expect(AuthManager.hasRole('investigator')).toBe(true);
    expect(AuthManager.hasRole('admin')).toBe(false);
  });
});
