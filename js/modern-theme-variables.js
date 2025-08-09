/**
 * 🚀 متغیرهای تم مدرن CPA Forex
 * دسترسی به رنگ‌ها و استایل‌های Glassmorphism
 */

window.MODERN_THEME = {
  colors: {
    primary: '#667eea',
    secondary: '#f093fb',
    accent: '#4facfe',
    success: '#43e97b',
    warning: '#fa709a',
    danger: '#ff9a9e',
    info: '#4facfe',
    
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      success: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      danger: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    },
    
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.9)',
    textMuted: 'rgba(255, 255, 255, 0.7)',
    textDisabled: 'rgba(255, 255, 255, 0.5)'
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px'
  },
  
  radius: {
    xs: '6px',
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
    full: '50%'
  },
  
  blur: {
    xs: 'blur(4px)',
    sm: 'blur(8px)',
    md: 'blur(12px)',
    lg: 'blur(16px)',
    xl: 'blur(24px)'
  },
  
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem'
  },
  
  transition: {
    fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)'
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
 * تابع کمکی برای اعمال افکت Glassmorphism
 */
window.applyGlassEffect = function(element, blurLevel = 'md') {
  const blur = window.MODERN_THEME.blur[blurLevel] || window.MODERN_THEME.blur.md;
  element.style.backdropFilter = blur;
  element.style.webkitBackdropFilter = blur;
  element.style.background = 'rgba(255, 255, 255, 0.1)';
  element.style.border = '1px solid rgba(255, 255, 255, 0.18)';
  element.style.borderRadius = window.MODERN_THEME.radius.lg;
};

/**
 * تابع کمکی برای اعمال گرادیان متحرک
 */
window.applyAnimatedGradient = function(element, gradient = 'primary') {
  const gradientValue = window.MODERN_THEME.colors.gradients[gradient] || 
                       window.MODERN_THEME.colors.gradients.primary;
  element.style.background = gradientValue;
  element.style.backgroundSize = '400% 400%';
  element.style.animation = 'modernGradientShift 4s ease infinite';
};

/**
 * تابع کمکی برای ایجاد انیمیشن ورود
 */
window.animateEntrance = function(element, type = 'slideIn') {
  element.classList.add(`modern-animate-${type}`);
  setTimeout(() => {
    element.classList.remove(`modern-animate-${type}`);
  }, 600);
};

/**
 * اعمال تم مدرن به المنت‌های موجود
 */
window.applyModernTheme = function() {
  // تبدیل کلاس‌های قدیمی به جدید
  const classMap = {
    'cpa-btn': 'modern-btn',
    'cpa-card': 'modern-card',
    'cpa-modal': 'modern-modal',
    'cpa-input': 'modern-input',
    'cpa-grid': 'modern-grid',
    'cpa-flex': 'modern-flex'
  };
  
  Object.keys(classMap).forEach(oldClass => {
    const elements = document.getElementsByClassName(oldClass);
    Array.from(elements).forEach(element => {
      element.classList.remove(oldClass);
      element.classList.add(classMap[oldClass]);
    });
  });
  
  console.log('🎨 Modern theme applied to existing elements');
};

/**
 * تغییر پس‌زمینه انیمیشن دار
 */
window.changeAnimatedBackground = function(colors = ['#667eea', '#764ba2', '#f093fb']) {
  document.body.style.background = `
    linear-gradient(-45deg, ${colors.join(', ')})
  `;
  document.body.style.backgroundSize = '400% 400%';
  document.body.style.animation = 'modernBackgroundShift 15s ease infinite';
};

// اضافه کردن انیمیشن‌های CSS پویا
const modernAnimations = `
@keyframes modernGradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes modernBackgroundShift {
  0% { background-position: 0% 50%; }
  25% { background-position: 100% 50%; }
  50% { background-position: 100% 100%; }
  75% { background-position: 0% 100%; }
  100% { background-position: 0% 50%; }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = modernAnimations;
document.head.appendChild(styleSheet);

// اعمال تم در بارگذاری صفحه
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Modern theme variables loaded');
  
  // اعمال پس‌زمینه انیمیشن دار
  window.changeAnimatedBackground();
  
  // اعمال افکت‌های ویژه به کارت‌های موجود
  setTimeout(() => {
    const cards = document.querySelectorAll('.modern-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        window.animateEntrance(card, 'slideIn');
      }, index * 100);
    });
  }, 500);
});

console.log('🌟 Modern Glassmorphism theme loaded');