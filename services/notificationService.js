export const NotificationService = {
  pushToken: null,

  async registerToken(token) {
    this.pushToken = token;
    return true;
  },

  getToken() {
    return this.pushToken;
  },
};
