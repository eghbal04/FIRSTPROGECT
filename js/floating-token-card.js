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
    this.isUpdating = false; // Prevent concurrent updates
    this.lastUpdateTime = 0; // Track last update time
    
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
      console.log('✅ Found existing floating card');
      return;
    }
    
    console.log('🔨 Creating new floating token card...');
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
    console.log('✅ Floating card HTML added to DOM');
    
    // Get elements
    this.card = document.getElementById('floating-token-growth-card');
    this.percentageElement = document.getElementById('token-growth-percentage');
    this.statusElement = document.getElementById('token-growth-status');
    
    console.log('✅ Card elements found:', {
      card: !!this.card,
      percentage: !!this.percentageElement,
      status: !!this.statusElement
    });
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
        <span id="initial-token-price" style="font-weight:700">1e-5</span>
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
      console.log('🔍 Getting token growth data...');
      
      // Check if ethers is loaded
      if (typeof ethers === 'undefined') {
        console.warn('⚠️ Ethers.js not loaded yet');
        return null;
      }
      
      // Get base price based on contract type
      const selectedContractAddress = window.getIAMAddress();
      const isOldContract = selectedContractAddress === window.CONTRACT_1_ADDRESS;
      const initialPrice = isOldContract ? 1e-15 : 1e-5; // Old: 1e-15, New: 1e-5
      
      console.log('🔍 Contract type:', isOldContract ? 'Old' : 'New', 'Base price:', initialPrice);
      let currentPrice = null;
      
      // Check if priceHistoryManager exists and has data
      if (window.priceHistoryManager && window.priceHistoryManager.tokenHistory && window.priceHistoryManager.tokenHistory.length > 0) {
        console.log('📊 Using priceHistoryManager data');
        const tokenHistory = window.priceHistoryManager.tokenHistory;
        currentPrice = tokenHistory[tokenHistory.length - 1];
        
        if (currentPrice && currentPrice > 0) {
          const growthPercentage = ((currentPrice - initialPrice) / initialPrice) * 100;
          console.log('✅ Price from priceHistoryManager:', currentPrice, 'Growth:', growthPercentage);
          return {
            currentPrice,
            initialPrice,
            growthPercentage,
            source: 'local'
          };
        }
      }
      
      // Check if contractConfig exists and has contract
      if (window.contractConfig && window.contractConfig.contract && typeof window.contractConfig.contract.getTokenPrice === 'function') {
        console.log('📊 Using contract data');
        try {
          const tokenPriceRaw = typeof window.retryRpcOperation === 'function' 
            ? await window.retryRpcOperation(() => window.contractConfig.contract.getTokenPrice(), 2)
            : await window.contractConfig.contract.getTokenPrice();
          
          if (tokenPriceRaw) {
            // Convert from Wei to Ether (18 decimal)
            if (typeof ethers !== 'undefined') {
              // Compatible with both ethers v5 and v6
              if (typeof ethers.utils !== 'undefined' && typeof ethers.utils.formatUnits !== 'undefined') {
                // Ethers v5
                currentPrice = parseFloat(ethers.utils.formatUnits(tokenPriceRaw, 18));
              } else if (typeof ethers.formatUnits !== 'undefined') {
                // Ethers v6
                currentPrice = parseFloat(ethers.formatUnits(tokenPriceRaw, 18));
              } else {
                // Fallback: Manual conversion from Wei to Ether
                currentPrice = parseFloat(tokenPriceRaw) / Math.pow(10, 18);
              }
            } else {
              // Fallback: Manual conversion from Wei to Ether
              currentPrice = parseFloat(tokenPriceRaw) / Math.pow(10, 18);
            }
            
            if (currentPrice > 0) {
              const growthPercentage = ((currentPrice - initialPrice) / initialPrice) * 100;
              console.log('✅ Price from contract:', currentPrice, 'Growth:', growthPercentage);
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
      
      // Try to get contract from window.connectWallet result
      // Skip if we already have contractConfig with a contract
      if (!window.contractConfig?.contract && window.connectWallet && typeof window.connectWallet === 'function') {
        console.log('📊 Trying to get contract from connectWallet');
        try {
          const walletResult = await window.connectWallet();
          console.log('📊 Wallet result:', walletResult);
          if (walletResult && walletResult.contract && typeof walletResult.contract.getTokenPrice === 'function') {
            console.log('📊 Using contract from connectWallet');
            const tokenPriceRaw = await walletResult.contract.getTokenPrice();
            console.log('📊 Token price raw:', tokenPriceRaw);
            
            if (tokenPriceRaw) {
              // Convert from Wei to Ether (18 decimal)
              if (typeof ethers !== 'undefined') {
                // Compatible with both ethers v5 and v6
                if (typeof ethers.utils !== 'undefined' && typeof ethers.utils.formatUnits !== 'undefined') {
                  // Ethers v5
                  currentPrice = parseFloat(ethers.utils.formatUnits(tokenPriceRaw, 18));
                } else if (typeof ethers.formatUnits !== 'undefined') {
                  // Ethers v6
                  currentPrice = parseFloat(ethers.formatUnits(tokenPriceRaw, 18));
                } else {
                  // Fallback: Manual conversion from Wei to Ether
                  currentPrice = parseFloat(tokenPriceRaw) / Math.pow(10, 18);
                }
              } else {
                // Fallback: Manual conversion from Wei to Ether
                currentPrice = parseFloat(tokenPriceRaw) / Math.pow(10, 18);
              }
              
              if (currentPrice > 0) {
                const growthPercentage = ((currentPrice - initialPrice) / initialPrice) * 100;
                console.log('✅ Price from connectWallet contract:', currentPrice, 'Growth:', growthPercentage);
                return {
                  currentPrice,
                  initialPrice,
                  growthPercentage,
                  source: 'connectWallet'
                };
              }
            }
          } else {
            console.log('📊 Wallet result does not have contract or getTokenPrice function');
          }
        } catch (connectError) {
          console.warn('⚠️ Error getting contract from connectWallet:', connectError);
        }
      }
      
      // Try to create contract directly using selected contract address
      if (selectedContractAddress && typeof ethers !== 'undefined') {
        console.log('📊 Trying to create contract directly with selected address:', selectedContractAddress);
        try {
          let provider, signer;
          
          // Compatible with both ethers v5 and v6
          if (typeof ethers.providers !== 'undefined' && typeof ethers.providers.Web3Provider !== 'undefined') {
            // Ethers v5
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
          } else if (typeof ethers.BrowserProvider !== 'undefined') {
            // Ethers v6
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
          }
          
          if (provider && signer) {
            // Use NEW_IAM_ABI if available, otherwise use IAM_ABI
            const abi = window.NEW_IAM_ABI || window.IAM_ABI;
            if (abi) {
              const contract = new ethers.Contract(selectedContractAddress, abi, signer);
              console.log('📊 Using direct contract creation with selected contract');
              const tokenPriceRaw = await contract.getTokenPrice();
              console.log('📊 Direct contract token price raw:', tokenPriceRaw);
              
              if (tokenPriceRaw) {
                // Convert from Wei to Ether (18 decimal)
                if (typeof ethers !== 'undefined') {
                  // Compatible with both ethers v5 and v6
                  if (typeof ethers.utils !== 'undefined' && typeof ethers.utils.formatUnits !== 'undefined') {
                    // Ethers v5
                    currentPrice = parseFloat(ethers.utils.formatUnits(tokenPriceRaw, 18));
                  } else if (typeof ethers.formatUnits !== 'undefined') {
                    // Ethers v6
                    currentPrice = parseFloat(ethers.formatUnits(tokenPriceRaw, 18));
                  } else {
                    // Fallback: Manual conversion from Wei to Ether
                    currentPrice = parseFloat(tokenPriceRaw) / Math.pow(10, 18);
                  }
                } else {
                  // Fallback: Manual conversion from Wei to Ether
                  currentPrice = parseFloat(tokenPriceRaw) / Math.pow(10, 18);
                }
                
                if (currentPrice > 0) {
                  const growthPercentage = ((currentPrice - initialPrice) / initialPrice) * 100;
                  console.log('✅ Price from direct contract:', currentPrice, 'Growth:', growthPercentage);
                  return {
                    currentPrice,
                    initialPrice,
                    growthPercentage,
                    source: 'direct'
                  };
                }
              }
            }
          }
        } catch (directError) {
          console.warn('⚠️ Error creating contract directly:', directError);
        }
      }
      
      console.log('❌ No data sources available');
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
        <div>Initial Price: <span style="font-weight: bold;">1e-5</span></div>
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
    // Prevent concurrent updates
    if (this.isUpdating) {
      console.log('⚠️ Update already in progress, skipping');
      return;
    }
    
    // Debounce: Don't update more than once per 2 seconds
    const now = Date.now();
    if (now - this.lastUpdateTime < 2000) {
      console.log('⚠️ Update too recent, skipping (last update:', this.lastUpdateTime, ')');
      return;
    }
    
    this.isUpdating = true;
    this.lastUpdateTime = now;
    
    try {
      const data = await this.getTokenGrowthData();
      this.updateDisplay(data);
    } catch (error) {
      console.error('❌ Error updating growth data:', error);
    } finally {
      this.isUpdating = false;
    }
  }
  
  startUpdates() {
    // Prevent duplicate event listeners
    if (this.updateInterval) {
      console.log('⚠️ Updates already started, skipping');
      return;
    }
    
    console.log('🔄 Starting floating card updates...');
    
    // Initial update with longer delay to ensure contractConfig is ready
    setTimeout(() => {
      this.updateGrowthData();
    }, 5000);
    
    // Update when page refreshes
    window.addEventListener('beforeunload', () => {
      this.updateGrowthData();
    });
    
    // Update when page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.updateGrowthData();
      }, 6000);
    });
    
    // Update when price data changes
    if (window.priceHistoryManager && !window.priceHistoryManager._floatingCardListenerAdded) {
      console.log('📊 Found priceHistoryManager, setting up updates');
      const originalUpdateTokenPrice = window.priceHistoryManager.updateTokenPrice;
      window.priceHistoryManager.updateTokenPrice = async (price) => {
        await originalUpdateTokenPrice.call(window.priceHistoryManager, price);
        this.updateGrowthData();
      };
      window.priceHistoryManager._floatingCardListenerAdded = true;
    }
    
    // Update when window.contractConfig changes
    if (window.contractConfig && !window.contractConfig._floatingCardListenerAdded) {
      console.log('📊 Found contractConfig, setting up updates');
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
      window.contractConfig._floatingCardListenerAdded = true;
    }
    
    // Periodic update every 30 seconds
    this.updateInterval = setInterval(() => {
      this.updateGrowthData();
    }, 30000);
  }
  
  // Public function for manual update
  refresh() {
    this.updateGrowthData();
  }
  
  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  // Public method to manually trigger token price update
  updateTokenPrice() {
    console.log('📊 Manual token price update triggered');
    this.updateTokenPriceData();
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

// Guard to prevent multiple initializations
let isStarting = false;

// Auto-initialize when DOM is loaded
function startFloatingCard() {
  // Prevent multiple starts
  if (isStarting || window.floatingTokenGrowthCard) {
    console.log('⚠️ Floating card already initialized or starting, skipping');
    return;
  }
  
  isStarting = true;
  
  try {
    console.log('🎯 Initializing floating token card...');
    initializeFloatingTokenCard();
    console.log('✅ Floating token card initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing floating token card:', error);
  } finally {
    isStarting = false;
  }
}

// Auto-initialize immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startFloatingCard);
} else {
  // If DOM is already loaded, start immediately
  console.log('🚀 DOM already loaded, starting floating card immediately');
  startFloatingCard();
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
