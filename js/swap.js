// Swap Manager - Browser compatible
class SwapManager {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize swap manager
  initialize() {
    if (this.isInitialized) {
      return;
    }
    
    this.isInitialized = true;
    console.log('✅ SwapManager initialized');
  }

  // Get swap data
  getSwapData() {
    return {
      initialized: this.isInitialized,
      timestamp: new Date().toISOString()
    };
  }
}

// Browser compatibility
if (typeof window !== 'undefined') {
  window.SwapManager = SwapManager;
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = SwapManager;
}

console.log('✅ SwapManager loaded');