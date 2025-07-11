import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en/translation.json';
import ru from '../locales/ru/translation.json';
import uz from '../locales/uz/translation.json';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  uz: { translation: uz },
};

// Get initial language from URL params, localStorage, or default to 'en'
const getInitialLanguage = () => {
  // First check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const langFromUrl = urlParams.get('lang');
  
  if (langFromUrl && ['en', 'uz', 'ru'].includes(langFromUrl)) {
    return langFromUrl;
  }
  
  // Then check localStorage
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && ['en', 'uz', 'ru'].includes(savedLanguage)) {
    return savedLanguage;
  }
  
  // Default to English
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;