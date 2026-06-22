import { createAuditEvent } from '../utils/auditLogger';

describe('Audit Logger Tests', () => {
  test('creates audit event with timestamp and action name', () => {
    const event = createAuditEvent('Report Submitted', 'Officer Ahmed', 'Priority High');
    expect(event.action).toBe('Report Submitted');
    expect(event.user).toBe('Officer Ahmed');
    expect(event.timestamp).toBeDefined();
  });
});
