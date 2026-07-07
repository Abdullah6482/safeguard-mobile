export const AuthManager = {
  session: null,

  setSession(userSession) {
    this.session = userSession;
  },

  getSession() {
    return this.session;
  },

  isExpired() {
    if (!this.session || !this.session.expiresAt) return true;
    return new Date().getTime() > this.session.expiresAt;
  },

  hasRole(requiredRole) {
    if (!this.session || !this.session.user) return false;
    return this.session.user.role === requiredRole;
  },

  logout() {
    this.session = null;
  },
};
