// Floating Token Growth Card
// This file is used to display token growth percentage on all pages

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
    this.createCard();
        this.addEventListeners();
        this.startUpdates();
    
    this.isInitialized = true;
  }
  
  createCard() {
    if (document.getElementById('floating-token-growth-card')) {
      this.card = document.getElementById('floating-token-growth-card');
      this.percentageElement = document.getElementById('token-growth-percentage');
      this.statusElement = document.getElementById('token-growth-status');
      return;
    }
        const cardHTML = `
      <div id="floating-token-growth-card" style="
        position: fixed;
        bottom: 40px;
        right: 8px;
        z-index: 10000;
        width: 120px;
        height: 75px;
        background: linear-gradient(135deg, #00ff88, #00cc6a);
        border-radius: 40px;
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
        opacity: 0.5;
      ">
        <div style="
          color: #1a1f2e;
          font-size: 0.8rem;
          font-weight: bold;
          text-align: center;
          margin-bottom: 3px;
          font-family: monospace;
        ">Growth</div>
        <div id="token-growth-percentage" style="
          color: #1a1f2e;
          font-size: 1.3rem;
          font-weight: bold;
          font-family: monospace;
          text-align: center;
          line-height: 1;
        ">--%</div>
        <div id="token-growth-status" style="
          color: #1a1f2e;
          font-size: 0.7rem;
          font-weight: bold;
          text-align: center;
          margin-top: 3px;
        ">Loading...</div>
      </div>
    `;
    
    // Add card to body for floating on all pages
    document.body.insertAdjacentHTML('beforeend', cardHTML);
    
    // Get elements
    this.card = document.getElementById('floating-token-growth-card');
    this.percentageElement = document.getElementById('token-growth-percentage');
    this.statusElement = document.getElementById('token-growth-status');
  }
  
  addEventListeners() {
    if (!this.card) return;
    
    // Add hover effects
    this.card.addEventListener('mouseenter', () => {
      this.card.style.transform = 'scale(1.1)';
      this.card.style.boxShadow = '0 12px 40px rgba(0, 255, 136, 0.4)';
    });
    
    this.card.addEventListener('mouseleave', () => {
      this.card.style.transform = 'scale(1)';
      this.card.style.boxShadow = '0 8px 32px rgba(0, 255, 136, 0.3)';
    });
    
    // Add click to expand
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
    this.card.style.width = '180px';
    this.card.style.height = '100px';
    this.card.style.borderRadius = '50px';
    this.card.style.background = 'linear-gradient(135deg, #00ff88, #00cc6a, #00ff88)';
    this.card.style.backgroundSize = '200% 200%';
    this.card.style.animation = 'gradientShift 2s ease infinite';
    
    // Show more information
    this.statusElement.innerHTML = `
      <div style="display:flex; gap:8px; align-items:center; justify-content:center;">
        <span style="opacity:.85">Current Price:</span>
        <span id="current-token-price" style="font-weight:700">--</span>
      </div>
      <div style="display:flex; gap:8px; align-items:center; justify-content:center; margin-top:4px;">
        <span style="opacity:.85">Initial Price:</span>
        <span id="initial-token-price" style="font-weight:700">1e-15</span>
      </div>
    `;
  }
  
  collapse() {
    this.isExpanded = false;
    this.card.style.width = '120px';
    this.card.style.height = '75px';
    this.card.style.borderRadius = '40px';
    this.card.style.background = 'linear-gradient(135deg, #00ff88, #00cc6a)';
    this.card.style.animation = 'none';
    
    this.statusElement.textContent = ' loading ...';
  }
  
  async getTokenGrowthData() {
    try {
    
      const initialPrice = 1e-15;
            let currentPrice = null;
      
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
      
      // No localStorage caching - always fetch fresh data
      
      // Third priority: Try to get from contract.getTokenPrice (slower)
      if (window.contractConfig && window.contractConfig.contract && typeof window.contractConfig.contract.getTokenPrice === 'function') {
        try {
          const tokenPriceRaw = typeof window.retryRpcOperation === 'function' 
            ? await window.retryRpcOperation(() => window.contractConfig.contract.getTokenPrice(), 2)
            : await window.contractConfig.contract.getTokenPrice();
          
          if (tokenPriceRaw) {
            // Convert from Wei to Ether (18 decimal)
            if (typeof ethers !== 'undefined') {
              currentPrice = parseFloat(ethers.formatUnits(tokenPriceRaw, 18));
            } else {
              // Fallback: Manual conversion from Wei to Ether
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
          console.warn('⚠️ Error getting price from contract.getTokenPrice:', contractError);
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting token growth data:', error);
      return null;
    }
  }
  
  updateDisplay(data) {
    if (!this.percentageElement || !this.statusElement) return;
    
    if (!data) {
      this.percentageElement.textContent = '--%';
      this.statusElement.textContent = 'Data not available';
      return;
    }
    
    const { currentPrice, initialPrice, growthPercentage, source } = data;
    
    // Update percentage with color coding
    const formattedPercentage = growthPercentage >= 0 ? 
      `+${growthPercentage.toFixed(2)}%` : 
      `${growthPercentage.toFixed(2)}%`;
    
    this.percentageElement.textContent = formattedPercentage;
    
    // Color coding based on growth
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
    
    // Update status
    if (this.isExpanded) {
      this.statusElement.innerHTML = `
        <div style="margin-bottom: 8px;">Current Price: <span style="font-weight: bold;">${currentPrice.toExponential(4)}</span></div>
        <div>Initial Price: <span style="font-weight: bold;">1e-15</span></div>
        <div style="margin-top: 5px; font-size: 0.6rem; opacity: 0.8;">Source: ${source}</div>
      `;
    } else {
      this.statusElement.textContent = source === 'firebase' ? 'Firebase' : 'Local';
    }
    
    // Add pulse animation for important changes
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
    // Initial update only once
    this.updateGrowthData();
    
    // Update when page refreshes
    window.addEventListener('beforeunload', () => {
      this.updateGrowthData();
    });
    
    // Update when page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.updateGrowthData();
      }, 1000);
    });
    
    // Update when price data changes
    if (window.priceHistoryManager) {
      const originalUpdateTokenPrice = window.priceHistoryManager.updateTokenPrice;
      window.priceHistoryManager.updateTokenPrice = async (price) => {
        await originalUpdateTokenPrice.call(window.priceHistoryManager, price);
        this.updateGrowthData();
      };
    }
    
    // Update when window.contractConfig changes
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
    
    // Update only once on page load - no intervals
    this.updateGrowthData();
  }
  
  // Public function for manual update
  refresh() {
    this.updateGrowthData();
  }
  
  stopUpdates() {
    // No intervals to stop - updates only happen on page load
  }
  
  destroy() {
    this.stopUpdates();
    if (this.card) {
      this.card.remove();
    }
    this.isInitialized = false;
  }
}

// Add CSS animations
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
        bottom: 15px !important;
        right: 15px !important;
        width: 95px !important; /* Smaller oval for mobile */
        height: 60px !important;
        border-radius: 30px !important;
      }
      
      #floating-token-growth-card div:first-child {
        font-size: 0.65rem !important;
        margin-bottom: 2px !important;
      }
      
      #token-growth-percentage {
        font-size: 1.1rem !important;
      }
      
      #token-growth-status {
        font-size: 0.55rem !important;
        margin-top: 2px !important;
      }
      
      #floating-token-growth-card.expanded {
        width: 110px !important;
        height: 70px !important;
        border-radius: 35px !important;
      }
    }
    
    @media (max-width: 480px) {
      #floating-token-growth-card {
        bottom: 12px !important;
        right: 12px !important;
        width: 85px !important; /* Oval for small mobile */
        height: 50px !important;
        border-radius: 25px !important;
      }
      
      #floating-token-growth-card div:first-child {
        font-size: 0.6rem !important;
        margin-bottom: 1px !important;
      }
      
      #token-growth-percentage {
        font-size: 1rem !important;
      }
      
      #token-growth-status {
        font-size: 0.5rem !important;
        margin-top: 1px !important;
      }
      
      #floating-token-growth-card.expanded {
        width: 100px !important;
        height: 60px !important;
        border-radius: 30px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Function to initialize floating card
function initializeFloatingTokenCard() {
  // Add styles
  addFloatingCardStyles();
  
  // Initialize card
  if (!window.floatingTokenGrowthCard) {
    window.floatingTokenGrowthCard = new FloatingTokenGrowthCard();
  }
  
  // Add public update function
  window.refreshFloatingTokenCard = () => {
    if (window.floatingTokenGrowthCard) {
      window.floatingTokenGrowthCard.refresh();
    }
  };
  
  return window.floatingTokenGrowthCard;
}

// Auto-initialize when DOM is loaded
function startFloatingCard() {
  try {
    console.log('🎯 Initializing floating token card...');
    initializeFloatingTokenCard();
    console.log('✅ Floating token card initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing floating token card:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startFloatingCard);
} else {
  // If DOM is already loaded
  setTimeout(startFloatingCard, 100); // Small delay to ensure complete loading
}

// Export for use in other files
window.FloatingTokenGrowthCard = FloatingTokenGrowthCard;
window.initializeFloatingTokenCard = initializeFloatingTokenCard;

// Helper function for debug and restart
window.debugFloatingCard = function() {
  console.log('🔍 Debug floating card:');
  
  const existingCard = document.getElementById('floating-token-growth-card');
  if (existingCard) {
    console.log('✅ Card element found:', existingCard);
    console.log('Card styles:', window.getComputedStyle(existingCard));
  } else {
    console.log('❌ Card element NOT found');
  }
  
  if (window.floatingTokenGrowthCard) {
    console.log('✅ Card instance found:', window.floatingTokenGrowthCard);
  } else {
    console.log('❌ Card instance NOT found');
  }
};

// Function to restart the card
window.restartFloatingCard = function() {
  console.log('🔄 Restarting floating card...');
  
  // Remove existing card
  const existingCard = document.getElementById('floating-token-growth-card');
  if (existingCard) {
    existingCard.remove();
    console.log('🗑️ Removed existing card');
  }
  
  // Remove existing instance
  if (window.floatingTokenGrowthCard) {
    if (typeof window.floatingTokenGrowthCard.destroy === 'function') {
      window.floatingTokenGrowthCard.destroy();
    }
    window.floatingTokenGrowthCard = null;
  }
  
  // Restart
  setTimeout(() => {
    startFloatingCard();
    console.log('✅ Card restarted');
  }, 500);
};

// Quick function to show card immediately
window.showFloatingCardNow = function() {
  console.log('⚡ Showing floating card immediately...');
  
  // Remove existing card if exists
  const existingCard = document.getElementById('floating-token-growth-card');
  if (existingCard) {
    existingCard.remove();
  }
  
  // Immediate initialization
  if (!window.floatingTokenGrowthCard) {
    window.floatingTokenGrowthCard = new FloatingTokenGrowthCard();
  }
  
  console.log('✅ Card should be visible now');
};

// Function to update card to oval shape
window.updateCardToOval = function() {
  console.log('🔄 Updating card to oval shape...');
  
  const card = document.getElementById('floating-token-growth-card');
  if (card) {
    card.style.width = '120px';
    card.style.height = '75px';
    card.style.borderRadius = '40px';
    
    const percentage = document.getElementById('token-growth-percentage');
    if (percentage) {
      percentage.style.fontSize = '1.3rem';
      percentage.style.lineHeight = '1';
    }
    
    console.log('✅ Card updated to oval shape');
  } else {
    console.log('❌ Card not found, creating new one...');
    window.showFloatingCardNow();
  }
};
