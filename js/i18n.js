// i18n.js - Simple language loader (manual only)

// Simple translation dictionary (expand as needed)
const translations = {
    fa: {
        'قیمت لحظه‌ای': 'قیمت لحظه‌ای',
        'سواپ توکن': 'سواپ توکن',
        'شبکه زیرمجموعه': 'شبکه زیرمجموعه',
        'ثبت‌نام و فعال‌سازی': 'ثبت‌نام و فعال‌سازی',
        'آمار و تحلیل': 'آمار و تحلیل',
        // ... add more Persian keys
    },
    en: {
        'قیمت لحظه‌ای': 'Live Price',
        'سواپ توکن': 'Token Swap',
        'شبکه زیرمجموعه': 'Network',
        'ثبت‌نام و فعال‌سازی': 'Register & Activate',
        'آمار و تحلیل': 'Analytics',
        // ... add more English keys
    },
    de: {
        'قیمت لحظه‌ای': 'Live-Preis',
        'سواپ توکن': 'Token-Tausch',
        'شبکه زیرمجموعه': 'Netzwerk',
        'ثبت‌نام و فعال‌سازی': 'Registrieren & Aktivieren',
        'آمار و تحلیل': 'Analyse',
        // ...
    },
    tr: {
        'قیمت لحظه‌ای': 'Canlı Fiyat',
        'سواپ توکن': 'Token Takası',
        'شبکه زیرمجموعه': 'Ağ',
        'ثبت‌نام و فعال‌سازی': 'Kayıt & Aktivasyon',
        'آمار و تحلیل': 'Analitik',
        // ...
    },
    fr: {
        'قیمت لحظه‌ای': 'Prix en direct',
        'سواپ توکن': 'Échange de jetons',
        'شبکه زیرمجموعه': 'Réseau',
        'ثبت‌نام و فعال‌سازی': 'Inscription & Activation',
        'آمار و تحلیل': 'Analytique',
        // ...
    }
};

function setLanguage(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem('selectedLang', lang);
    // Find all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
}

// مقدار پیش‌فرض فقط بر اساس html یا فارسی
window.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('selectedLang');
    setLanguage(savedLang || document.documentElement.lang || 'fa');
});
