import en from '../locales/en.json';
import es from '../locales/es.json';
import ar from '../locales/ar.json';

let currentLocale = 'en';
const translations = {};

translations.en = en;
translations.es = es;
translations.ar = ar;

const deviceLocale = Intl.DateTimeFormat().resolvedOptions().locale?.split('-')[0];
if (translations[deviceLocale]) currentLocale = deviceLocale;

export const I18n = {
  setLocale(locale) {
    currentLocale = translations[locale] ? locale : 'en';
  },

  getLocale() { return currentLocale; },

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
