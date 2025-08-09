// Floating Token Growth Card - کارت شناور رشد توکن
// این فایل برای نمایش درصد رشد توکن در همه صفحات استفاده می‌شود

class FloatingTokenGrowthCard {
  constructor() {
    this.card = null;
    this.percentageElement = null;
    this.statusElement = null;
    this.isExpanded = false;
    this.lastTokenPrice = null;
    this.initialTokenPrice = null;
    this.updateInterval = null;
    this.isInitialized = false;
    
    this.init();
  }
  
  init() {
    // ایجاد کارت اگر وجود ندارد
    this.createCard();
    
    // اضافه کردن event listeners
    this.addEventListeners();
    
    // شروع به‌روزرسانی
    this.startUpdates();
    
    this.isInitialized = true;
  }
  
  createCard() {
    // بررسی اینکه آیا کارت قبلاً وجود دارد
    if (document.getElementById('floating-token-growth-card')) {
      this.card = document.getElementById('floating-token-growth-card');
      this.percentageElement = document.getElementById('token-growth-percentage');
      this.statusElement = document.getElementById('token-growth-status');
      return;
    }
    
    // محل هدف: ترجیحاً داخل Swap
    const swapContainer = document.querySelector('#main-swap .swap-container') || document.getElementById('main-swap');
    const inSwap = !!swapContainer;
    const positionStyle = inSwap
      ? 'position: absolute; bottom: 10px; right: 10px;'
      : 'position: fixed; bottom: 20px; right: 20px;';

    // ایجاد HTML کارت
    const cardHTML = `
      <div id="floating-token-growth-card" style="
        ${positionStyle}
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #00ff88, #00cc6a);
        border-radius: 50%;
        box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 3px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
      ">
        <div style="
          color: #1a1f2e;
          font-size: 0.9rem;
          font-weight: bold;
          text-align: center;
          margin-bottom: 5px;
          font-family: monospace;
        ">رشد</div>
        <div id="token-growth-percentage" style="
          color: #1a1f2e;
          font-size: 1.1rem;
          font-weight: bold;
          font-family: monospace;
          text-align: center;
        ">--%</div>
        <div id="token-growth-status" style="
          color: #1a1f2e;
          font-size: 0.6rem;
          font-weight: bold;
          text-align: center;
          margin-top: 2px;
        ">در حال بارگذاری...</div>
      </div>
    `;
    
    // اضافه کردن کارت
    if (inSwap) {
      // اطمینان از relative بودن والد
      const currentPos = window.getComputedStyle(swapContainer).position;
      if (!currentPos || currentPos === 'static') {
        swapContainer.style.position = 'relative';
      }
      swapContainer.insertAdjacentHTML('beforeend', cardHTML);
    } else {
      document.body.insertAdjacentHTML('beforeend', cardHTML);
    }
    
    // دریافت عناصر
    this.card = document.getElementById('floating-token-growth-card');
    this.percentageElement = document.getElementById('token-growth-percentage');
    this.statusElement = document.getElementById('token-growth-status');
  }
  
  addEventListeners() {
    if (!this.card) return;
    
    // اضافه کردن hover effects
    this.card.addEventListener('mouseenter', () => {
      this.card.style.transform = 'scale(1.1)';
      this.card.style.boxShadow = '0 12px 40px rgba(0, 255, 136, 0.4)';
    });
    
    this.card.addEventListener('mouseleave', () => {
      this.card.style.transform = 'scale(1)';
      this.card.style.boxShadow = '0 8px 32px rgba(0, 255, 136, 0.3)';
    });
    
    // اضافه کردن click to expand
    this.card.addEventListener('click', () => {
      this.toggleExpanded();
    });
  }
  
  toggleExpanded() {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  
  expand() {
    this.isExpanded = true;
    this.card.style.width = '134px';
    this.card.style.height = '134px';
    this.card.style.borderRadius = '20px';
    this.card.style.background = 'linear-gradient(135deg, #00ff88, #00cc6a, #00ff88)';
    this.card.style.backgroundSize = '200% 200%';
    this.card.style.animation = 'gradientShift 2s ease infinite';
    
    // اضافه کردن اطلاعات جزئی‌تر با فرمت علمی
    this.statusElement.innerHTML = `
      <div style="margin-bottom: 8px;">قیمت فعلی: <span id="current-token-price">--</span></div>
      <div>قیمت اولیه: <span id="initial-token-price">1e-15</span></div>
    `;
  }
  
  collapse() {
    this.isExpanded = false;
    this.card.style.width = '80px';
    this.card.style.height = '80px';
    this.card.style.borderRadius = '50%';
    this.card.style.background = 'linear-gradient(135deg, #00ff88, #00cc6a)';
    this.card.style.animation = 'none';
    
    this.statusElement.textContent = 'در حال بارگذاری...';
  }
  
  async getTokenGrowthData() {
    try {
      // قیمت اولیه ثابت
      const initialPrice = 1e-15;
      
      // دریافت قیمت فعلی - اولویت با منابع محلی سریع‌تر
      let currentPrice = null;
      
      // اولویت اول: تلاش برای دریافت از priceHistoryManager (سریع‌ترین)
      if (window.priceHistoryManager && window.priceHistoryManager.tokenHistory.length > 0) {
        const tokenHistory = window.priceHistoryManager.tokenHistory;
        currentPrice = tokenHistory[tokenHistory.length - 1];
        
        if (currentPrice && currentPrice > 0) {
          const growthPercentage = ((currentPrice - initialPrice) / initialPrice) * 100;
          return {
            currentPrice,
            initialPrice,
            growthPercentage,
            source: 'local'
          };
        }
      }
      
      // اولویت دوم: تلاش برای دریافت از localStorage (سریع)
      const storedTokenHistory = localStorage.getItem('tokenPriceHistory');
      if (storedTokenHistory) {
        try {
          const tokenHistory = JSON.parse(storedTokenHistory);
          if (tokenHistory.length > 0) {
            currentPrice = tokenHistory[tokenHistory.length - 1];
            
            if (currentPrice && currentPrice > 0) {
              const growthPercentage = ((currentPrice - initialPrice) / initialPrice) * 100;
              return {
                currentPrice,
                initialPrice,
                growthPercentage,
                source: 'localStorage'
              };
            }
          }
        } catch (localError) {
          console.warn('⚠️ خطا در خواندن از localStorage:', localError);
        }
      }
      
      // اولویت سوم: تلاش برای دریافت از contract.getTokenPrice (کندتر)
      if (window.contractConfig && window.contractConfig.contract && typeof window.contractConfig.contract.getTokenPrice === 'function') {
        try {
          const tokenPriceRaw = await window.contractConfig.contract.getTokenPrice();
          
          if (tokenPriceRaw) {
            // تبدیل از Wei به Ether (18 decimal)
            if (typeof ethers !== 'undefined') {
              currentPrice = parseFloat(ethers.formatUnits(tokenPriceRaw, 18));
            } else {
              // Fallback: تبدیل دستی از Wei به Ether
              currentPrice = parseFloat(tokenPriceRaw) / Math.pow(10, 18);
            }
            
            if (currentPrice > 0) {
              const growthPercentage = ((currentPrice - initialPrice) / initialPrice) * 100;
              return {
                currentPrice,
                initialPrice,
                growthPercentage,
                source: 'contract'
              };
            }
          }
        } catch (contractError) {
          console.warn('⚠️ خطا در دریافت قیمت از contract.getTokenPrice:', contractError);
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ خطا در دریافت داده‌های رشد توکن:', error);
      return null;
    }
  }
  
  updateDisplay(data) {
    if (!this.percentageElement || !this.statusElement) return;
    
    if (!data) {
      this.percentageElement.textContent = '--%';
      this.statusElement.textContent = 'داده در دسترس نیست';
      return;
    }
    
    const { currentPrice, initialPrice, growthPercentage, source } = data;
    
    // به‌روزرسانی درصد با رنگ‌بندی
    const formattedPercentage = growthPercentage >= 0 ? 
      `+${growthPercentage.toFixed(2)}%` : 
      `${growthPercentage.toFixed(2)}%`;
    
    this.percentageElement.textContent = formattedPercentage;
    
    // رنگ‌بندی بر اساس رشد
    if (growthPercentage > 0) {
      this.percentageElement.style.color = '#1a1f2e';
      this.card.style.background = 'linear-gradient(135deg, #00ff88, #00cc6a)';
    } else if (growthPercentage < 0) {
      this.percentageElement.style.color = '#ff4444';
      this.card.style.background = 'linear-gradient(135deg, #ff4444, #cc3333)';
    } else {
      this.percentageElement.style.color = '#1a1f2e';
      this.card.style.background = 'linear-gradient(135deg, #ffaa00, #ff8800)';
    }
    
    // به‌روزرسانی وضعیت
    if (this.isExpanded) {
      this.statusElement.innerHTML = `
        <div style="margin-bottom: 8px;">قیمت فعلی: <span style="font-weight: bold;">${currentPrice.toExponential(4)}</span></div>
        <div>قیمت اولیه: <span style="font-weight: bold;">1e-15</span></div>
        <div style="margin-top: 5px; font-size: 0.6rem; opacity: 0.8;">منبع: ${source}</div>
      `;
    } else {
      this.statusElement.textContent = source === 'firebase' ? 'Firebase' : 'Local';
    }
    
    // اضافه کردن انیمیشن pulse برای تغییرات مهم
    if (Math.abs(growthPercentage) > 5) {
      this.card.style.animation = 'pulse 1s ease-in-out';
      setTimeout(() => {
        this.card.style.animation = '';
      }, 1000);
    }
  }
  
  async updateGrowthData() {
    const data = await this.getTokenGrowthData();
    this.updateDisplay(data);
  }
  
  startUpdates() {
    // به‌روزرسانی اولیه فقط یک بار
    this.updateGrowthData();
    
    // به‌روزرسانی وقتی صفحه رفرش می‌شود
    window.addEventListener('beforeunload', () => {
      this.updateGrowthData();
    });
    
    // به‌روزرسانی وقتی صفحه کاملاً بارگذاری شد
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.updateGrowthData();
      }, 1000);
    });
    
    // به‌روزرسانی وقتی داده‌های قیمت تغییر می‌کند
    if (window.priceHistoryManager) {
      const originalUpdateTokenPrice = window.priceHistoryManager.updateTokenPrice;
      window.priceHistoryManager.updateTokenPrice = async (price) => {
        await originalUpdateTokenPrice.call(window.priceHistoryManager, price);
        this.updateGrowthData();
      };
    }
    
    // به‌روزرسانی وقتی window.contractConfig تغییر می‌کند
    if (window.contractConfig) {
      let originalContract = window.contractConfig.contract;
      Object.defineProperty(window.contractConfig, 'contract', {
        get() {
          return originalContract;
        },
        set(newContract) {
          originalContract = newContract;
          if (window.floatingTokenGrowthCard) {
            window.floatingTokenGrowthCard.updateGrowthData();
          }
        }
      });
    }
    
    // به‌روزرسانی هر 5 ثانیه برای اطمینان
    this.updateInterval = setInterval(() => {
      this.updateGrowthData();
    }, 5000);
  }
  
  // تابع عمومی برای به‌روزرسانی دستی
  refresh() {
    this.updateGrowthData();
  }
  
  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  destroy() {
    this.stopUpdates();
    if (this.card) {
      this.card.remove();
    }
    this.isInitialized = false;
  }
}

// اضافه کردن CSS animations
function addFloatingCardStyles() {
  if (document.getElementById('floating-card-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'floating-card-styles';
  style.textContent = `
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @media (max-width: 768px) {
      #floating-token-growth-card {
        bottom: 10px;
        right: 10px;
        width: 54px; /* 80 * 0.67 ≈ 54 */
        height: 54px;
      }
      
      #floating-token-growth-card div:first-child {
        font-size: 0.7rem !important;
        margin-bottom: 2px !important;
      }
      
      #token-growth-percentage {
        font-size: 1rem !important;
      }
      
      #token-growth-status {
        font-size: 0.6rem !important;
        margin-top: 1px !important;
      }
      
      #floating-token-growth-card.expanded {
        width: 94px; /* 140 * 0.67 ≈ 94 */
        height: 94px;
      }
    }
    
    @media (max-width: 480px) {
      #floating-token-growth-card {
        bottom: 8px;
        right: 8px;
        width: 47px; /* 70 * 0.67 ≈ 47 */
        height: 47px;
      }
      
      #floating-token-growth-card div:first-child {
        font-size: 0.6rem !important;
        margin-bottom: 1px !important;
      }
      
      #token-growth-percentage {
        font-size: 0.9rem !important;
      }
      
      #token-growth-status {
        font-size: 0.5rem !important;
        margin-top: 1px !important;
      }
      
      #floating-token-growth-card.expanded {
        width: 80px;
        height: 80px;
      }
    }
  `;
  document.head.appendChild(style);
}

// تابع راه‌اندازی کارت شناور
function initializeFloatingTokenCard() {
  // اضافه کردن استایل‌ها
  addFloatingCardStyles();
  
  // راه‌اندازی کارت
  if (!window.floatingTokenGrowthCard) {
    window.floatingTokenGrowthCard = new FloatingTokenGrowthCard();
  }
  
  // اضافه کردن تابع به‌روزرسانی عمومی
  window.refreshFloatingTokenCard = () => {
    if (window.floatingTokenGrowthCard) {
      window.floatingTokenGrowthCard.refresh();
    }
  };
  
  return window.floatingTokenGrowthCard;
}

// راه‌اندازی خودکار وقتی DOM بارگذاری شد
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFloatingTokenCard);
} else {
  // اگر DOM قبلاً بارگذاری شده
  initializeFloatingTokenCard();
}

// Export برای استفاده در فایل‌های دیگر
window.FloatingTokenGrowthCard = FloatingTokenGrowthCard;
window.initializeFloatingTokenCard = initializeFloatingTokenCard;
