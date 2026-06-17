export function createAuditEvent(action, user, details = '') {
  return {
    id: 'audit_' + Date.now(),
    action,
    user: user || 'Anonymous User',
    details,
    timestamp: new Date().toISOString(),
  };
}
