let currentLocale = 'en';
const translations = {};

export const I18n = {
  setLocale(locale) {
    currentLocale = locale;
  },

  registerLocale(locale, strings) {
    translations[locale] = strings;
  },

  t(key, params = {}) {
    const dict = translations[currentLocale] || translations['en'] || {};
    let text = dict[key] || key;
    Object.keys(params).forEach(k => {
      text = text.split('{{' + k + '}}').join(params[k]);
    });
    return text;
  },
};
