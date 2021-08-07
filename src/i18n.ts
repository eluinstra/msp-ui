import i18n from "i18next"
import { initReactI18next } from "react-i18next"
​import LanguageDetector from 'i18next-electron-language-detector'
const en = require('./translations/en.json')

const resources = {
  en: {
    translation: en
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
​    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  })
​
  export default i18n