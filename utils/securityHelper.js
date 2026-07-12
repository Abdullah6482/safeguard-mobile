export function maskEmail(email) {
  if (!email || !email.includes('@')) return '***';
  const [user, domain] = email.split('@');
  return `${user[0]}***@${domain}`;
}

export function maskPhone(phone) {
  if (!phone || phone.length < 4) return '***';
  return '***-***-' + phone.slice(-4);
}
