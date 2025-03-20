import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import tr from './locales/tr.json';
import fr from './locales/fr.json';
import zh from './locales/zh.json';

async function detectLangByIP() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.country_code === 'TR') return 'tr';
        if (data.country_code === 'FR') return 'fr';
        if (data.country_code === 'CN') return 'zh'; // China
        return 'en';
    } catch {
        return 'en'; // fallback
    }
}

(async () => {
    const detectedLang = await detectLangByIP();
    i18n
        .use(initReactI18next)
        .init({
            resources: {
                en: { translation: en },
                tr: { translation: tr },
                fr: { translation: fr },
                zh: { translation: zh }
            },
            lng: detectedLang,
            fallbackLng: 'en',
            interpolation: { escapeValue: false }
        });
})();
export default i18n;
