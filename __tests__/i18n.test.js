import { I18n } from '../lib/i18n';

describe('I18n Localization Engine', () => {
  beforeAll(() => {
    I18n.registerLocale('en', { welcome: 'Hello {{name}}', submit: 'Submit' });
    I18n.registerLocale('es', { welcome: 'Hola {{name}}', submit: 'Enviar' });
  });

  test('resolves translation in default language', () => {
    I18n.setLocale('en');
    expect(I18n.t('submit')).toBe('Submit');
    expect(I18n.t('welcome', { name: 'Ali' })).toBe('Hello Ali');
  });

  test('switches language cleanly', () => {
    I18n.setLocale('es');
    expect(I18n.t('submit')).toBe('Enviar');
  });
});
