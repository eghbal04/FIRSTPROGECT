/**
 * Transaction History Manager
 * Manages DAI, POL, and IAM transaction history display and filtering
 */

class TransactionHistoryManager {
  constructor() {
    this.transactions = [];
    this.currentFilter = 'all';
    this.isLoading = false;
    this.init();
  }

  init() {
    console.log('📊 Initializing Transaction History Manager...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Filter buttons
    const filterAll = document.getElementById('filterAll');
    const filterDAI = document.getElementById('filterDAI');
    const filterPOL = document.getElementById('filterPOL');
    const filterIAM = document.getElementById('filterIAM');
    const loadMoreBtn = document.getElementById('loadMoreTransactions');

    if (!filterAll || !filterDAI || !filterPOL || !filterIAM) {
      console.log('ℹ️ Transaction history elements not found (this is normal on pages without transaction history)');
      return;
    }

    // Add event listeners for filter buttons
    filterAll.addEventListener('click', () => this.filterTransactions('all'));
    filterDAI.addEventListener('click', () => this.filterTransactions('DAI'));
    filterPOL.addEventListener('click', () => this.filterTransactions('POL'));
    filterIAM.addEventListener('click', () => this.filterTransactions('IAM'));

    // Load more button
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => this.loadMoreTransactions());
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshTransactions');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshTransactions());
    }

    // Load initial transactions
    this.loadTransactionHistory();
    
    console.log('✅ Transaction History Manager initialized');
  }

  filterTransactions(token) {
    console.log('🔍 Filtering transactions by:', token);
    
    const transactionItems = document.querySelectorAll('.transaction-item');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Update active button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`filter${token === 'all' ? 'All' : token}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Filter transactions
    let visibleCount = 0;
    transactionItems.forEach(item => {
      const itemToken = item.getAttribute('data-token');
      if (token === 'all' || itemToken === token) {
        item.style.display = 'block';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });
    
    // Show/hide empty state
    const emptyState = document.getElementById('emptyTransactions');
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
    
    this.currentFilter = token;
    console.log(`✅ Filtered to show ${visibleCount} transactions`);
  }

  async loadTransactionHistory() {
    console.log('📥 Loading real transaction history from blockchain...');
    
    try {
      // Check if wallet is connected (try both contractConfig and transferManager)
      let signer, provider;
      
      if (window.contractConfig && window.contractConfig.signer) {
        signer = window.contractConfig.signer;
        provider = window.contractConfig.provider;
        console.log('✅ Using contractConfig for wallet connection');
      } else if (window.transferManager && window.transferManager.signer) {
        signer = window.transferManager.signer;
        provider = window.transferManager.provider;
        console.log('✅ Using transferManager for wallet connection');
      } else {
        console.warn('⚠️ Wallet not connected, showing loading state');
        this.showLoadingState();
        return;
      }

      const userAddress = await signer.getAddress();
      console.log('🔍 Fetching transactions for address:', userAddress);

      // Hide loading state
      this.hideLoadingState();

      // Fetch real transactions from blockchain
      await this.fetchRealTransactions(userAddress);
      
    } catch (error) {
      console.error('❌ Error loading transaction history:', error);
      this.showErrorState();
    }
  }

  async fetchRealTransactions(userAddress) {
    console.log('🔍 Fetching real transactions from blockchain...');
    
    try {
      // Get provider from contractConfig or transferManager
      let provider;
      if (window.contractConfig && window.contractConfig.provider) {
        provider = window.contractConfig.provider;
      } else if (window.transferManager && window.transferManager.provider) {
        provider = window.transferManager.provider;
      } else {
        console.warn(`⚠️ Provider not found for fetching real transactions`);
        this.showErrorState();
        return;
      }

      // Get current block number
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Last ~10k blocks
      
      console.log(`📊 Scanning blocks ${fromBlock} to ${currentBlock}`);

      // Clear existing transactions
      this.clearTransactions();
      this.transactions = [];

      // Fetch DAI transactions
      await this.fetchTokenTransactions('DAI', userAddress, fromBlock, currentBlock);
      
      // Fetch POL (MATIC) transactions
      await this.fetchNativeTransactions(userAddress, fromBlock, currentBlock);
      
      // Fetch IAM transactions
      await this.fetchTokenTransactions('IAM', userAddress, fromBlock, currentBlock);
      
      // Check if any transactions were found
      if (this.transactions.length === 0) {
        console.log('📭 No transactions found, showing empty state');
        this.showEmptyState();
      } else {
        console.log(`✅ Real transaction history loaded: ${this.transactions.length} transactions`);
      }
      
    } catch (error) {
      console.error('❌ Error fetching real transactions:', error);
      this.showErrorState();
    }
  }

  async fetchTokenTransactions(tokenSymbol, userAddress, fromBlock, toBlock) {
    try {
      let contractAddress;
      let decimals;
      
      // Get contract address and decimals based on token
      if (tokenSymbol === 'DAI') {
        contractAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'; // DAI on Polygon
        decimals = 18;
      } else if (tokenSymbol === 'IAM') {
        // Use the current contract address from transfer manager or contractConfig
        if (window.transferManager && window.transferManager.contract) {
          contractAddress = window.transferManager.contract.address;
        } else if (window.contractConfig && window.contractConfig.contract) {
          contractAddress = window.contractConfig.contract.address;
        } else {
          console.warn(`⚠️ IAM contract address not found`);
          return;
        }
        decimals = 18;
      } else {
        return;
      }

      if (!contractAddress) {
        console.warn(`⚠️ Contract address not found for ${tokenSymbol}`);
        return;
      }

      console.log(`🔍 Fetching ${tokenSymbol} transactions from contract:`, contractAddress);

      // Use the provider from contractConfig or transferManager
      let provider;
      if (window.contractConfig && window.contractConfig.provider) {
        provider = window.contractConfig.provider;
      } else if (window.transferManager && window.transferManager.provider) {
        provider = window.transferManager.provider;
      } else {
        console.warn(`⚠️ Provider not found for ${tokenSymbol} transactions`);
        return;
      }

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, [
        "event Transfer(address indexed from, address indexed to, uint256 value)"
      ], provider);

      // Get Transfer events
      const filter = contract.filters.Transfer(null, null);
      const events = await contract.queryFilter(filter, fromBlock, toBlock);

      // Filter events for user address
      const userEvents = events.filter(event => 
        event.args.from.toLowerCase() === userAddress.toLowerCase() || 
        event.args.to.toLowerCase() === userAddress.toLowerCase()
      );

      console.log(`📊 Found ${userEvents.length} ${tokenSymbol} transactions`);

      // Process each transaction
      for (const event of userEvents) {
        await this.processTokenTransaction(event, tokenSymbol, decimals, userAddress);
      }

    } catch (error) {
      console.error(`❌ Error fetching ${tokenSymbol} transactions:`, error);
    }
  }

  async fetchNativeTransactions(userAddress, fromBlock, toBlock) {
    try {
      console.log('🔍 Fetching POL (MATIC) transactions...');

      // Use the provider from contractConfig or transferManager
      let provider;
      if (window.contractConfig && window.contractConfig.provider) {
        provider = window.contractConfig.provider;
      } else if (window.transferManager && window.transferManager.provider) {
        provider = window.transferManager.provider;
      } else {
        console.warn(`⚠️ Provider not found for POL transactions`);
        return;
      }

      // Get transaction history for native MATIC
      const transactions = await provider.getHistory(userAddress, fromBlock, toBlock);
      
      console.log(`📊 Found ${transactions.length} POL transactions`);

      // Process each transaction
      for (const tx of transactions) {
        await this.processNativeTransaction(tx, userAddress);
      }

    } catch (error) {
      console.error('❌ Error fetching POL transactions:', error);
    }
  }

  async processTokenTransaction(event, tokenSymbol, decimals, userAddress) {
    try {
      const { from, to, value } = event.args;
      const amount = ethers.formatUnits(value, decimals);
      const isIncoming = to.toLowerCase() === userAddress.toLowerCase();
      
      // Get transaction details
      const tx = await event.getTransaction();
      const block = await event.getBlock();
      
      const transactionData = {
        token: tokenSymbol,
        type: isIncoming ? 'Received' : 'Transfer',
        amount: `${isIncoming ? '+' : '-'}${parseFloat(amount).toFixed(2)} ${tokenSymbol}`,
        address: isIncoming ? from : to,
        time: new Date(block.timestamp * 1000).toLocaleString(),
        hash: tx.hash
      };

      this.addRealTransaction(transactionData);

    } catch (error) {
      console.error('❌ Error processing token transaction:', error);
    }
  }

  async processNativeTransaction(tx, userAddress) {
    try {
      const amount = ethers.formatEther(tx.value);
      const isIncoming = tx.to?.toLowerCase() === userAddress.toLowerCase();
      
      if (parseFloat(amount) === 0) return; // Skip zero value transactions
      
      // Use the provider from contractConfig or transferManager
      let provider;
      if (window.contractConfig && window.contractConfig.provider) {
        provider = window.contractConfig.provider;
      } else if (window.transferManager && window.transferManager.provider) {
        provider = window.transferManager.provider;
      } else {
        console.warn(`⚠️ Provider not found for processing native transaction`);
        return;
      }
      
      const block = await provider.getBlock(tx.blockNumber);
      
      const transactionData = {
        token: 'POL',
        type: isIncoming ? 'Received' : 'Transfer',
        amount: `${isIncoming ? '+' : '-'}${parseFloat(amount).toFixed(4)} POL`,
        address: isIncoming ? tx.from : tx.to,
        time: new Date(block.timestamp * 1000).toLocaleString(),
        hash: tx.hash
      };

      this.addRealTransaction(transactionData);

    } catch (error) {
      console.error('❌ Error processing native transaction:', error);
    }
  }

  showLoadingState() {
    console.log('📊 Showing loading state');
    const loadingEl = document.getElementById('loadingTransactions');
    const emptyEl = document.getElementById('emptyTransactions');
    
    if (loadingEl) {
      loadingEl.style.display = 'block';
    }
    if (emptyEl) {
      emptyEl.style.display = 'none';
    }
  }

  hideLoadingState() {
    console.log('📊 Hiding loading state');
    const loadingEl = document.getElementById('loadingTransactions');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }

  showErrorState() {
    console.log('📊 Showing error state');
    const loadingEl = document.getElementById('loadingTransactions');
    const emptyEl = document.getElementById('emptyTransactions');
    
    if (loadingEl) {
      loadingEl.innerHTML = `
        <div style="font-size:2rem;margin-bottom:0.5rem;">❌</div>
        <div>Error loading transactions</div>
        <div style="font-size:0.8rem;margin-top:0.3rem;">Please check your wallet connection and try again</div>
      `;
    }
  }

  showEmptyState() {
    console.log('📊 Showing empty state');
    const loadingEl = document.getElementById('loadingTransactions');
    const emptyEl = document.getElementById('emptyTransactions');
    
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
    if (emptyEl) {
      emptyEl.style.display = 'block';
    }
  }

  async loadMoreTransactions() {
    if (this.isLoading) return;
    
    console.log('📥 Loading more transactions from blockchain...');
    this.isLoading = true;
    
    const loadMoreBtn = document.getElementById('loadMoreTransactions');
    if (loadMoreBtn) {
      loadMoreBtn.textContent = 'Loading...';
      loadMoreBtn.disabled = true;
    }
    
    try {
      // Check if wallet is connected
      if (!window.contractConfig || !window.contractConfig.signer) {
        console.warn('⚠️ Wallet not connected, cannot load more transactions');
        return;
      }

      const userAddress = await window.contractConfig.signer.getAddress();
      const currentBlock = await window.contractConfig.provider.getBlockNumber();
      
      // Load older transactions (go back further in blockchain)
      const fromBlock = Math.max(0, currentBlock - 20000); // Last ~20k blocks
      const toBlock = currentBlock - 10000; // Skip the blocks we already loaded
      
      console.log(`📊 Loading older transactions from blocks ${fromBlock} to ${toBlock}`);

      // Fetch older transactions
      await this.fetchTokenTransactions('DAI', userAddress, fromBlock, toBlock);
      await this.fetchNativeTransactions(userAddress, fromBlock, toBlock);
      await this.fetchTokenTransactions('IAM', userAddress, fromBlock, toBlock);
      
      console.log('✅ More transactions loaded');
      
    } catch (error) {
      console.error('❌ Error loading more transactions:', error);
    } finally {
      if (loadMoreBtn) {
        loadMoreBtn.textContent = 'Load More Transactions';
        loadMoreBtn.disabled = false;
      }
      this.isLoading = false;
    }
  }

  addSampleTransaction(token, type, amount, address, time, hash) {
    const transactionList = document.getElementById('transactionList');
    if (!transactionList) return;
    
    const transactionItem = document.createElement('div');
    transactionItem.className = 'transaction-item';
    transactionItem.setAttribute('data-token', token);
    transactionItem.style.cssText = 'background:#1a1f2e;border:1px solid #2a3441;border-radius:10px;padding:1rem;margin-bottom:0.5rem;transition:all 0.3s ease;';
    
    const tokenEmoji = token === 'DAI' ? '🟢' : token === 'POL' ? '🔵' : '🟣';
    const amountColor = amount.startsWith('+') ? '#00ff88' : '#ff6b6b';
    
    transactionItem.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span style="color:#00ff88;font-weight:bold;">${tokenEmoji} ${token}</span>
          <span style="color:#ffffff;font-size:0.9rem;">${type}</span>
        </div>
        <span style="color:${amountColor};font-weight:bold;font-size:0.9rem;">${amount}</span>
      </div>
      <div style="color:#b8c1ec;font-size:0.8rem;margin-bottom:0.3rem;">
        <strong>${type === 'Transfer' ? 'To:' : 'From:'}</strong> ${address}
      </div>
      <div style="color:#a786ff;font-size:0.75rem;">
        <strong>Time:</strong> ${time} | <strong>Hash:</strong> ${hash}
      </div>
    `;
    
    transactionList.appendChild(transactionItem);
    
    // Apply current filter to new transaction
    if (this.currentFilter !== 'all' && token !== this.currentFilter) {
      transactionItem.style.display = 'none';
    }
  }

  // Method to add real transaction from blockchain
  addRealTransaction(transactionData) {
    const { token, type, amount, address, time, hash } = transactionData;
    
    // Hide loading state when first real transaction is added
    if (this.transactions.length === 0) {
      this.hideLoadingState();
    }
    
    // Add to internal transactions array
    this.transactions.push(transactionData);
    
    // Create and add transaction element
    this.createTransactionElement(transactionData);
    
    console.log(`✅ Added real ${token} transaction:`, transactionData);
  }

  createTransactionElement(transactionData) {
    const { token, type, amount, address, time, hash } = transactionData;
    const transactionList = document.getElementById('transactionList');
    if (!transactionList) return;
    
    const transactionItem = document.createElement('div');
    transactionItem.className = 'transaction-item real-transaction';
    transactionItem.setAttribute('data-token', token);
    transactionItem.style.cssText = 'background:#1a1f2e;border:1px solid #2a3441;border-radius:10px;padding:1rem;margin-bottom:0.5rem;transition:all 0.3s ease;';
    
    const tokenEmoji = token === 'DAI' ? '🟢' : token === 'POL' ? '🔵' : '🟣';
    const amountColor = amount.startsWith('+') ? '#00ff88' : '#ff6b6b';
    const shortAddress = this.shortenAddress(address);
    const shortHash = this.shortenHash(hash);
    
    transactionItem.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span style="color:#00ff88;font-weight:bold;">${tokenEmoji} ${token}</span>
          <span style="color:#ffffff;font-size:0.9rem;">${type}</span>
          <span style="color:#a786ff;font-size:0.7rem;background:rgba(167,134,255,0.1);padding:0.2rem 0.4rem;border-radius:4px;">REAL</span>
        </div>
        <span style="color:${amountColor};font-weight:bold;font-size:0.9rem;">${amount}</span>
      </div>
      <div style="color:#b8c1ec;font-size:0.8rem;margin-bottom:0.3rem;">
        <strong>${type === 'Transfer' ? 'To:' : 'From:'}</strong> 
        <span style="font-family:monospace;cursor:pointer;" title="${address}" onclick="navigator.clipboard.writeText('${address}')">${shortAddress}</span>
      </div>
      <div style="color:#a786ff;font-size:0.75rem;">
        <strong>Time:</strong> ${time} | 
        <strong>Hash:</strong> 
        <span style="font-family:monospace;cursor:pointer;" title="${hash}" onclick="navigator.clipboard.writeText('${hash}')">${shortHash}</span>
      </div>
    `;
    
    // Add click to copy functionality
    transactionItem.addEventListener('click', (e) => {
      if (e.target.tagName === 'SPAN' && e.target.style.fontFamily === 'monospace') {
        e.target.style.background = 'rgba(0,255,136,0.2)';
        setTimeout(() => {
          e.target.style.background = '';
        }, 1000);
      }
    });
    
    transactionList.appendChild(transactionItem);
    
    // Apply current filter to new transaction
    if (this.currentFilter !== 'all' && token !== this.currentFilter) {
      transactionItem.style.display = 'none';
    }
    
    // Add animation for new real transactions
    transactionItem.classList.add('new-transaction');
  }

  shortenAddress(address) {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  shortenHash(hash) {
    if (!hash) return 'Unknown';
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  }

  // Method to clear all transactions
  clearTransactions() {
    const transactionList = document.getElementById('transactionList');
    if (transactionList) {
      const transactionItems = transactionList.querySelectorAll('.transaction-item');
      transactionItems.forEach(item => item.remove());
    }
  }

  // Method to refresh transactions from blockchain
  async refreshTransactions() {
    if (this.isLoading) return;
    
    console.log('🔄 Refreshing transactions from blockchain...');
    this.isLoading = true;
    
    const refreshBtn = document.getElementById('refreshTransactions');
    if (refreshBtn) {
      refreshBtn.textContent = '🔄 Refreshing...';
      refreshBtn.disabled = true;
    }
    
    try {
      // Clear existing transactions
      this.clearTransactions();
      this.transactions = [];
      
      // Load fresh transactions
      await this.loadTransactionHistory();
      
      console.log('✅ Transactions refreshed');
    } catch (error) {
      console.error('❌ Error refreshing transactions:', error);
    } finally {
      if (refreshBtn) {
        refreshBtn.textContent = '🔄 Refresh';
        refreshBtn.disabled = false;
      }
      this.isLoading = false;
    }
  }

  // Method to listen for new transactions in real-time
  startRealTimeUpdates() {
    if (!window.contractConfig || !window.contractConfig.provider) {
      console.warn('⚠️ Cannot start real-time updates: provider not available');
      return;
    }

    console.log('🔄 Starting real-time transaction updates...');
    
    // Listen for new blocks
    window.contractConfig.provider.on('block', async (blockNumber) => {
      try {
        await this.checkForNewTransactions(blockNumber);
      } catch (error) {
        console.error('❌ Error checking for new transactions:', error);
      }
    });
  }

  async checkForNewTransactions(blockNumber) {
    try {
      if (!window.contractConfig || !window.contractConfig.signer) return;
      
      const userAddress = await window.contractConfig.signer.getAddress();
      
      // Check for new transactions in the latest block
      await this.fetchTokenTransactions('DAI', userAddress, blockNumber, blockNumber);
      await this.fetchNativeTransactions(userAddress, blockNumber, blockNumber);
      await this.fetchTokenTransactions('IAM', userAddress, blockNumber, blockNumber);
      
    } catch (error) {
      console.error('❌ Error checking new transactions:', error);
    }
  }
}

// Initialize Transaction History Manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.transactionHistoryManager = new TransactionHistoryManager();
  
  // Only start real-time updates if we're on transfer page
  if (document.getElementById('transactionHistory')) {
    // Start real-time updates when wallet connects
    const checkWalletConnection = () => {
      if (window.contractConfig && window.contractConfig.provider) {
        window.transactionHistoryManager.startRealTimeUpdates();
      } else {
        // Check again in 2 seconds
        setTimeout(checkWalletConnection, 2000);
      }
    };
    
    // Start checking for wallet connection
    setTimeout(checkWalletConnection, 1000);
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TransactionHistoryManager;
}
