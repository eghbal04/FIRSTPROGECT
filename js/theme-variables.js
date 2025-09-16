/**
 * 🎨 متغیرهای تم CPA Forex
 * دسترسی به رنگ‌ها و استایل‌ها از JavaScript
 */

window.CPA_THEME = {
  colors: {
    primary: '#a786ff',
    primaryHover: '#9575ff',
    secondary: '#00ff88',
    secondaryHover: '#00cc66',
    accent: '#ff6b9d',
    warning: '#ffa726',
    error: '#ff5252',
    info: '#42a5f5',
    
    bgPrimary: '#0f0f23',
    bgSecondary: '#181c2a',
    surface: '#232946',
    surfaceHover: '#2a3154',
    
    textPrimary: '#ffffff',
    textSecondary: '#e7ebff',
    textMuted: '#a6b0ff',
    textDisabled: '#6b7280'
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px'
  },
  
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '50%'
  },
  
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem'
  },
  
  transition: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease'
  },
  
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080
  }
};

/**
 * تابع کمکی برای دریافت رنگ از CSS Variables
 */
window.getCSSVariable = function(variableName) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
};

/**
 * تابع کمکی برای تنظیم رنگ در CSS Variables
 */
window.setCSSVariable = function(variableName, value) {
  document.documentElement.style.setProperty(variableName, value);
};

/**
 * اعمال تم تاریک/روشن
 */
window.applyTheme = function(theme = 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
  // No caching - theme is not persisted
};

/**
 * دریافت تم فعلی
 */
window.getCurrentTheme = function() {
  return 'dark'; // Default theme - no caching
};

// اعمال تم ذخیره شده در بارگذاری صفحه
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = window.getCurrentTheme();
  window.applyTheme(savedTheme);
});

console.log('🎨 CPA Theme variables loaded');