// swap.js - Professional and principled for DAI ↔ IAM swap

// Contract addresses
const IAM_ADDRESS_NEW = '0x63F5a2085906f5fcC206d6589d78038FBc74d2FE'; // New contract
const IAM_ADDRESS_OLD = '0xd7eDAdcae9073FD69Ae1081B057922F41Adf0607'; // Old contract
const DAI_ADDRESS = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'; // Polygon DAI

// Default to new contract
let IAM_ADDRESS = IAM_ADDRESS_NEW;

// DAI ABI (minimal for swap functionality)
const DAI_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "spender", "type": "address"},
            {"internalType": "uint256", "name": "value", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "address", "name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// IAM ABI (minimal for swap functionality)
const IAM_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTokenPrice",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "daiAmount", "type": "uint256"}
        ],
        "name": "buyTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "tokenAmount", "type": "uint256"}
        ],
        "name": "sellTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

class SwapManager {
    constructor() {
        console.log('🏗️ Creating SwapManager instance...');
        
        this.tokenPrice = null;
        this.userBalances = { dai: 0, IAM: 0 };
        this.isSwapping = false;
        this.isRefreshing = false;
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.daiContract = null;
        this.selectedContract = 'new'; // 'new' or 'old'
        
        console.log('✅ SwapManager created');
    }

    // Switch between old and new contracts
    async switchContract(contractType) {
        console.log('🔄 Switching contract to:', contractType);
        
        if (contractType === 'old') {
            IAM_ADDRESS = IAM_ADDRESS_OLD;
            this.selectedContract = 'old';
        } else {
            IAM_ADDRESS = IAM_ADDRESS_NEW;
            this.selectedContract = 'new';
        }
        
        // Recreate contract instance if wallet is connected
        if (this.signer) {
            this.contract = new ethers.Contract(IAM_ADDRESS, IAM_ABI, this.signer);
            console.log('✅ Contract switched to:', IAM_ADDRESS);
            
            // Refresh data with new contract
            await this.refreshSwapData();
        }
    }

    // Connect to wallet and initialize contracts
    async connectWallet() {
        try {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask not detected');
            }

            console.log('🔗 Connecting to wallet...');
            
            // Request account access with error handling
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
            } catch (rpcError) {
                // Handle specific RPC errors gracefully
                if (rpcError.code === 4001) {
                    throw new Error('User rejected the connection request');
                } else if (rpcError.message && rpcError.message.includes('isDefaultWallet')) {
                    console.warn('⚠️ MetaMask RPC method not available, continuing...');
                    // Continue with connection attempt
                } else {
                    throw rpcError;
                }
            }
            
            // Create provider and signer
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = await this.provider.getSigner();
            
            // Create contracts
            this.contract = new ethers.Contract(IAM_ADDRESS, IAM_ABI, this.signer);
            this.daiContract = new ethers.Contract(DAI_ADDRESS, DAI_ABI, this.signer);
            
            console.log('✅ Wallet connected successfully');
            return true;
        } catch (error) {
            console.error('❌ Error connecting wallet:', error);
            throw error;
        }
    }

    // Helper: Reading contract DAI balance as numeric (with decimals)
    async getContractDaiBalanceNum() {
        if (!this.daiContract) {
            console.warn('⚠️ DAI contract not initialized');
            return 0;
        }
        
        try {
            const daiBalance = await this.daiContract.balanceOf(IAM_ADDRESS);
            return parseFloat(ethers.utils.formatUnits(daiBalance, 18));
        } catch (error) {
            console.warn('⚠️ Error getting contract DAI balance:', error);
            return 0;
        }
    }

    // Helper: Determine backing fee tier based on contract DAI balance
    getBackingFeePct(daiContractBalanceNum) {
        // Ranges based on contract logic: <=200k: 2%, <=500k: 2.5%, more: 3%
        if (daiContractBalanceNum <= 200000) return 0.02;
        if (daiContractBalanceNum <= 500000) return 0.025;
        return 0.03;
    }


    async initializeSwap() {
        try {
            console.log('🔄 Starting SwapManager initialization...');
            
            // Ensure DOM elements exist
            const requiredElements = ['swapForm', 'swapDirection', 'swapAmount', 'maxBtn', 'swapStatus'];
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length > 0) {
                console.warn('⚠️ The following elements were not found:', missingElements);
                console.log('🔄 Waiting for DOM elements to load...');
                // Wait a bit more for DOM to load
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Check again
                const stillMissing = requiredElements.filter(id => !document.getElementById(id));
                if (stillMissing.length > 0) {
                    console.error('❌ Still missing elements after wait:', stillMissing);
                    return;
                }
            }
            
            console.log('✅ All DOM elements exist');
            
            // Setup event listeners
            this.setupEventListeners();
            console.log('✅ Event listeners configured');
            
            // Connect to wallet first
            await this.connectWallet();
            console.log('✅ Wallet connected');
            
            // Load data
            await this.loadSwapData();
            console.log('✅ Swap data loaded');
            
            // Update UI
            this.updateMaxAmount();
            this.updateContractSelectionUI();
            
            console.log('✅ SwapManager successfully initialized');
            
        } catch (error) {
            console.error('❌ Error initializing SwapManager:', error);
            this.showStatus('Error loading swap: ' + error.message, 'error');
        }
    }



    // Function to convert USD to token (for USD field)
    convertSwapUsdToToken() {
        console.log('🔄 Converting USD to token...');
        
        const usdAmount = document.getElementById('swapUsdAmount');
        const swapAmount = document.getElementById('swapAmount');
        const direction = document.getElementById('swapDirection');
        
        if (!usdAmount || !swapAmount || !direction) {
            console.warn('⚠️ Required elements for USD conversion not found');
            return;
        }
        
        const usdValue = parseFloat(usdAmount.value);
        if (!usdValue || usdValue <= 0) {
            this.showStatus('Please enter a valid dollar amount (minimum $0.01)', 'error');
            return;
        }
        
        if (!this.tokenPrice || Number(this.tokenPrice) <= 0) {
            this.showStatus('Token price is currently unavailable. Please try again later.', 'error');
            return;
        }
        
        const tokenPrice = Number(this.tokenPrice);
        
        if (direction.value === 'dai-to-IAM') {
            // Convert USD to DAI (assuming 1 USD = 1 DAI)
            const daiAmount = usdValue;
            swapAmount.value = daiAmount.toFixed(2);
            console.log('✅ USD converted to DAI:', daiAmount);
        } else if (direction.value === 'IAM-to-dai') {
            // Convert USD to IAM
            const IAMAmount = usdValue / tokenPrice;
            swapAmount.value = IAMAmount.toFixed(6);
            console.log('✅ USD converted to IAM:', IAMAmount);
        }
        
        this.showStatus(`✅ Successfully converted $${usdValue} to token amount. You can now proceed with your transaction.`, 'success');
    }

    // Update dollar equivalent when token amount changes
    updateSwapUsdValue() {
        const swapAmount = document.getElementById('swapAmount');
        const swapUsdAmount = document.getElementById('swapUsdAmount');
        const direction = document.getElementById('swapDirection');
        
        if (!swapAmount || !swapUsdAmount || !direction) {
            return;
        }
        
        const tokenAmount = parseFloat(swapAmount.value) || 0;
        if (tokenAmount <= 0) {
            swapUsdAmount.value = '';
            return;
        }
        
        if (!this.tokenPrice || Number(this.tokenPrice) <= 0) {
            return;
        }
        
        const tokenPrice = Number(this.tokenPrice);
        
        if (direction.value === 'dai-to-IAM') {
            // DAI to USD (assuming 1 DAI = 1 USD)
            const usdValue = tokenAmount;
            swapUsdAmount.value = usdValue.toFixed(2);
        } else if (direction.value === 'IAM-to-dai') {
            // IAM to USD
            const usdValue = tokenAmount * tokenPrice;
            swapUsdAmount.value = usdValue.toFixed(2);
        }
    }

    // Show/hide USD field based on swap direction
    toggleSwapUsdConverter() {
        const direction = document.getElementById('swapDirection');
        const usdConverterRow = document.getElementById('swap-usd-converter-row');
        
        if (!direction || !usdConverterRow) {
            return;
        }
        
        if (direction.value === 'IAM-to-dai') {
            usdConverterRow.style.display = 'block';
        } else {
            usdConverterRow.style.display = 'none';
        }
    }

    // Update USD preview
    updateSwapUsdPreview() {
        const swapUsdAmount = document.getElementById('swapUsdAmount');
        const swapAmount = document.getElementById('swapAmount');
        const direction = document.getElementById('swapDirection');
        
        if (!swapUsdAmount || !swapAmount || !direction) {
            return;
        }
        
        const usdValue = parseFloat(swapUsdAmount.value) || 0;
        if (usdValue <= 0) {
            return;
        }
        
        if (!this.tokenPrice || Number(this.tokenPrice) <= 0) {
            return;
        }
        
        const tokenPrice = Number(this.tokenPrice);
        
        if (direction.value === 'IAM-to-dai') {
            const IAMAmount = usdValue / tokenPrice;
            swapAmount.value = IAMAmount.toFixed(6);
        }
    }



    // Update contract selection UI
    updateContractSelectionUI() {
        const contractSelector = document.getElementById('contractSelector');
        if (contractSelector) {
            contractSelector.value = this.selectedContract;
        }
        
        const contractInfo = document.getElementById('contractInfo');
        if (contractInfo) {
            const contractName = this.selectedContract === 'old' ? 'Old Contract' : 'New Contract';
            contractInfo.innerHTML = `
                <div style="background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 6px; padding: 0.4rem; margin-bottom: 0.3rem;">
                    <p style="margin: 0; color: #00ff88; font-size: 0.75rem;"><strong>${contractName}</strong></p>
                </div>
            `;
        }
    }

    // Call updateSwapLimitInfo on direction/amount change
    setupEventListeners() {
        console.log('🔄 Setting up event listeners...');
        
        const swapForm = document.getElementById('swapForm');
        const swapDirection = document.getElementById('swapDirection');
        const swapAmount = document.getElementById('swapAmount');
        const maxBtn = document.getElementById('maxBtn');
        const contractSelector = document.getElementById('contractSelector');

        if (swapForm) {
            swapForm.addEventListener('submit', (e) => {
                console.log('📝 Swap form submitted');
                this.handleSwap(e);
            });
            console.log('✅ Swap form event listener connected');
        } else {
            console.warn('⚠️ Swap form not found');
        }
        
        if (swapDirection) {
            swapDirection.addEventListener('change', async () => {
                console.log('🔄 Swap direction changed:', swapDirection.value);
                this.updateMaxAmount();
                
                // Show/hide USD field based on swap direction
                this.toggleSwapUsdConverter();
            });
            console.log('✅ Swap direction event listener connected');
        } else {
            console.warn('⚠️ Swap direction not found');
        }
        
        if (swapAmount) {
            swapAmount.addEventListener('input', async () => {
                console.log('📝 Swap amount changed:', swapAmount.value);
                
                // Remove any decimal points to enforce whole numbers
                if (swapAmount.value.includes('.')) {
                    swapAmount.value = swapAmount.value.split('.')[0];
                }
                
                // Real-time calculation of dollar equivalent when token amount changes
                this.updateSwapUsdValue();
            });
            console.log('✅ Swap amount event listener connected');
        } else {
            console.warn('⚠️ Swap amount not found');
        }
        
        if (maxBtn) {
            maxBtn.addEventListener('click', async (e) => {
                e.preventDefault(); // Prevent default button behavior
                e.stopPropagation(); // Stop event bubbling
                console.log('🔢 Max button clicked');
                try {
                    // Check if balances are loaded
                    if (!this.userBalances || (this.userBalances.dai === 0 && this.userBalances.IAM === 0)) {
                        console.log('🔄 Balances not loaded, loading now...');
                        await this.loadSwapData();
                    }
                    
                    await this.setMaxAmount();
                    // Don't show status message to avoid scrolling to Exchange Information section
                    // this.showStatus('✅ Maximum available amount has been set. You can now proceed with your transaction.', 'success');
                } catch (error) {
                    console.error('❌ Error in max button click:', error);
                    this.showStatus('Unable to set maximum amount. Please enter the amount manually.', 'error');
                }
            });
            console.log('✅ Max button event listener connected');
        } else {
            console.warn('⚠️ Max button not found');
        }
        
        if (contractSelector) {
            contractSelector.addEventListener('change', async (e) => {
                console.log('🔄 Contract selector changed to:', e.target.value);
                try {
                    await this.switchContract(e.target.value);
                    this.updateContractSelectionUI();
                    this.showStatus(`✅ Switched to ${e.target.value === 'old' ? 'Old' : 'New'} contract successfully!`, 'success');
                } catch (error) {
                    console.error('❌ Error switching contract:', error);
                    this.showStatus('Error switching contract: ' + error.message, 'error');
                }
            });
            console.log('✅ Contract selector event listener connected');
        } else {
            console.warn('⚠️ Contract selector not found');
        }
        
        // Event listeners for USD converter
        const swapUsdConverterRow = document.getElementById('swap-usd-converter-row');
        const swapUsdAmount = document.getElementById('swapUsdAmount');
        const swapUsdToTokenBtn = document.getElementById('swapUsdToTokenBtn');
        
        if (swapUsdToTokenBtn) {
            swapUsdToTokenBtn.addEventListener('click', () => {
                this.convertSwapUsdToToken();
            });
            console.log('✅ USD convert button event listener connected');
        }
        
        if (swapUsdAmount) {
            // Enter key in USD field
            swapUsdAmount.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.convertSwapUsdToToken();
                }
            });
            
            // Real-time calculation when user types
            let swapUsdTimeout;
            swapUsdAmount.addEventListener('input', () => {
                clearTimeout(swapUsdTimeout);
                swapUsdTimeout = setTimeout(() => {
                    this.updateSwapUsdPreview();
                }, 500);
            });
            console.log('✅ USD field event listeners connected');
        }
        
        // Initial execution to set initial state
        this.toggleSwapUsdConverter();
        
        console.log('✅ All event listeners configured');
    }

    async loadSwapData() {
        try {
            console.log('🔄 Loading swap data...');
            
            // Check if wallet is connected
            if (!this.contract || !this.signer) {
                console.log('⏳ Wallet not connected, connecting now...');
                await this.connectWallet();
            }
            
            const address = await this.signer.getAddress();
            
            console.log('✅ Contract connection established');

            // Token price from contract
            console.log('🔄 Fetching token price...');
            try {
                const tokenPrice = await Promise.race([
                    this.contract.getTokenPrice(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Token price fetch timeout')), 10000))
                ]);
                this.tokenPrice = ethers.utils.formatUnits(tokenPrice, 18);
            console.log('✅ Token price received:', this.tokenPrice);
                console.log('🔍 this.tokenPrice set to:', this.tokenPrice);
            } catch (error) {
                console.warn('⚠️ Error fetching token price:', error);
                this.tokenPrice = null;
            }

            // IAM balance
            let IAMBalanceFormatted = '0';
            try {
                const IAMBalance = await Promise.race([
                    this.contract.balanceOf(address),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('IAM balance fetch timeout')), 10000))
                ]);
                IAMBalanceFormatted = ethers.utils.formatUnits(IAMBalance, 18);
            console.log('✅ IAM balance received:', IAMBalanceFormatted);
            } catch (error) {
                console.warn('⚠️ Error fetching IAM balance:', error);
            }

            // DAI balance
            let daiBalanceFormatted = '0';
            try {
                const daiBalance = await Promise.race([
                    this.daiContract.balanceOf(address),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('DAI balance fetch timeout')), 10000))
                ]);
                daiBalanceFormatted = ethers.utils.formatUnits(daiBalance, 18);
                console.log('✅ DAI balance received:', daiBalanceFormatted);
            } catch (error) {
                console.warn('⚠️ Error fetching DAI balance:', error);
            }

            // Function to shorten large numbers
            function formatLargeNumber(num) {
                if (num >= 1000000) {
                    return (num / 1000000).toFixed(1) + 'M';
                } else if (num >= 1000) {
                    return (num / 1000).toFixed(1) + 'K';
                } else {
                    return num.toFixed(2);
                }
            }
            
            // Calculate IAM dollar equivalent
            const IAMUsdValue = parseFloat(IAMBalanceFormatted) * parseFloat(this.tokenPrice);
            
            // Display balances
            const IAMBalanceEl = document.getElementById('IAMBalance');
            const daiBalanceEl = document.getElementById('daiBalance');
            if (IAMBalanceEl) {
                const fullIAMAmount = Number(IAMBalanceFormatted).toLocaleString('en-US', {maximumFractionDigits: 6});
                IAMBalanceEl.innerHTML = `
                    <span title="${fullIAMAmount} IAM">${formatLargeNumber(Number(IAMBalanceFormatted))} IAM</span>
                    <div style="font-size:0.8rem;color:#a786ff;margin-top:2px;">≈ $${formatLargeNumber(IAMUsdValue)}</div>
                `;
            }
            if (daiBalanceEl) {
                const fullDaiAmount = Number(daiBalanceFormatted).toLocaleString('en-US', {maximumFractionDigits: 6});
                daiBalanceEl.innerHTML = `<span title="${fullDaiAmount} DAI">${formatLargeNumber(Number(daiBalanceFormatted))} DAI</span>`;
            }

            // Save for max
            this.userBalances = {
                IAM: parseFloat(IAMBalanceFormatted),
                dai: parseFloat(daiBalanceFormatted)
            };
            
            console.log('✅ User balances saved:', this.userBalances);
            

            
        } catch (error) {
            console.error('❌ Error loading swap data:', error);
            this.tokenPrice = null;
            this.userBalances = { IAM: 0, dai: 0 };
            this.showStatus('Unable to load wallet balances. Please check your connection and try again.', 'error');
        }
    }





    updateMaxAmount() {
        const direction = document.getElementById('swapDirection');
        const amount = document.getElementById('swapAmount');
        
        if (!direction || !amount) {
            console.warn('⚠️ Required elements for updateMaxAmount not found');
            return;
        }
        
            if (direction.value === 'dai-to-IAM') {
                // Strict 1000 DAI maximum limit for input field
                const maxAllowedDai = 1000;
                const userBalanceMinusOne = Math.max(0, this.userBalances.dai - 1);
                const maxDai = Math.min(userBalanceMinusOne, maxAllowedDai);
                amount.max = Math.floor(maxDai);
                console.log('✅ Maximum DAI amount set (limited to 1000 DAI):', Math.floor(maxDai));
            } else if (direction.value === 'IAM-to-dai') {
                // No limits for IAM to DAI - remove all restrictions
                amount.max = '';
                console.log('✅ No limits set for IAM to DAI conversion');
            }
    }

    async setMaxAmount() {
        const direction = document.getElementById('swapDirection');
        const amount = document.getElementById('swapAmount');
        
        if (!direction || !amount) {
            console.warn('⚠️ Required elements for setMaxAmount not found');
            return;
        }
        
        try {
            console.log('🔢 Setting maximum amount for direction:', direction.value);
            console.log('💰 Current user balances:', this.userBalances);
            
            // Helper function to floor to decimals
            const floorToDecimals = (val, decimals) => {
                const m = Math.pow(10, decimals);
                const floored = Math.floor(Number(val) * m) / m;
                const smallestUnit = 1 / m;
                return Math.max(0, floored - smallestUnit);
            };
            
            if (direction.value === 'dai-to-IAM') {
                // For DAI to IAM (buying IAM)
                if (this.userBalances.dai <= 0) {
                    console.warn('⚠️ No DAI balance available');
                    this.showStatus('No DAI balance available. Please add DAI to your wallet to make purchases.', 'error');
                    return;
                }
                
                // Strict 1000 DAI maximum limit
                const maxAllowedDai = 1000;
                const userBalance95Percent = this.userBalances.dai * 0.95;
                
                // Use the smaller of: 95% of user balance or 1000 DAI limit
                let maxAmount = Math.min(userBalance95Percent, maxAllowedDai);
                maxAmount = floorToDecimals(maxAmount, 2);
                
                // Keep a small buffer (1 DAI) for gas fees
                maxAmount = Math.max(1, maxAmount - 1);
                
                amount.value = Math.floor(maxAmount).toString();
                
                console.log('✅ Maximum DAI amount set (1000 DAI limit):', {
                    userBalance: this.userBalances.dai.toFixed(2),
                    maxAllowedDai: maxAllowedDai,
                    maxAmount: maxAmount.toFixed(2)
                });
                
            } else if (direction.value === 'IAM-to-dai') {
                // For IAM to DAI (selling IAM) - No limits, use full balance
                if (this.userBalances.IAM <= 0) {
                    console.warn('⚠️ No IAM balance available');
                    this.showStatus('No IAM balance available. Please purchase IAM tokens first to make sales.', 'error');
                    return;
                }
                
                // Use full available balance (no limits)
                let maxIAM = this.userBalances.IAM;
                maxIAM = floorToDecimals(maxIAM, 6);
                
                // Keep a small buffer (1 IAM) for precision
                maxIAM = Math.max(1, maxIAM - 1);
                
                amount.value = Math.floor(maxIAM).toString();
                
                console.log('✅ Maximum IAM amount set (full balance, no limits):', {
                    userBalance: this.userBalances.IAM.toFixed(6),
                    maxAmount: maxIAM.toFixed(6)
                });
            }
            
            console.log('✅ Maximum amount set successfully');
            
        } catch (error) {
            console.error('❌ Error setting maximum amount:', error);
            this.showStatus('Error setting maximum amount: ' + error.message, 'error');
            
            // Fallback: set to 90% of balance with small buffer
            try {
                if (direction.value === 'dai-to-IAM' && this.userBalances.dai > 0) {
                    // Apply 1000 DAI limit even in fallback
                    const maxAllowedDai = 1000;
                    const userBalance90Percent = this.userBalances.dai * 0.9;
                    const fallbackMax = Math.max(1, Math.min(userBalance90Percent, maxAllowedDai) - 1);
                    amount.value = Math.floor(fallbackMax).toString();
                } else if (direction.value === 'IAM-to-dai' && this.userBalances.IAM > 0) {
                    // No limits for IAM to DAI, use full balance
                    const fallbackMax = Math.max(1, this.userBalances.IAM - 1);
                    amount.value = Math.floor(fallbackMax).toString();
                }
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError);
            }
        }
    }

    setUIBusy(busy) {
        console.log('🔄 Setting UI state:', busy ? 'busy' : 'ready');
        
        const submitBtn = document.querySelector('#swapForm button[type="submit"]');
        const inputs = document.querySelectorAll('#swapForm input, #swapForm select');
        
        if (submitBtn) {
            submitBtn.disabled = busy;
            submitBtn.textContent = busy ? 'Processing...' : 'Convert';
            console.log('✅ Submit button configured');
        } else {
            console.warn('⚠️ Submit button not found');
        }
        
        inputs.forEach(input => {
            input.disabled = busy;
        });
        
        console.log(`✅ ${inputs.length} input elements configured`);
    }

    getErrorMessage(error) {
        console.log('🔍 Analyzing error:', error);
        
        if (error.code === 4001) return 'Transaction cancelled by user. Please try again when ready.';
        if (error.message && error.message.includes('insufficient funds')) return 'Insufficient balance. Please check your wallet and try again.';
        if (error.message && error.message.includes('exceeds buy limit')) return 'Purchase amount exceeds daily limit. Please reduce the amount.';
        if (error.message && error.message.includes('exceeds sell limit')) return 'Sale amount exceeds available liquidity. Please try a smaller amount.';
        if (error.message && error.message.includes('minimum')) return 'Amount is below minimum threshold. Please increase your transaction amount.';
        if (error.message && error.message.includes('allowance')) return 'DAI approval required. Please approve DAI spending first.';
        if (error.message && error.message.includes('cooldown')) return 'Please wait before making another transaction. Cooldown period active.';
        if (error.message && error.message.includes('user rejected')) return 'Transaction rejected by user. Please confirm the transaction to proceed.';
        if (error.message && error.message.includes('network')) return 'Network connection error. Please check your internet and try again.';
        if (error.message && error.message.includes('timeout')) return 'Transaction timeout. Please try again with higher gas fees.';
        if (error.message && error.message.includes('gas')) return 'Insufficient gas for transaction. Please increase gas limit.';
        if (error.message && error.message.includes('revert')) return 'Transaction failed. Please check your inputs and try again.';
        
        return error.message || 'An unexpected error occurred. Please try again.';
    }

    showStatus(message, type = 'info', txHash = null, scrollToMessage = true) {
        console.log('📢 Displaying message:', { message, type, txHash });
        
        const statusEl = document.getElementById('swapStatus');
        if (!statusEl) {
            console.warn('⚠️ swapStatus element not found');
            return;
        }
        
        let className = 'swap-status';
        let icon = '';
        
        switch(type) {
            case 'success':
                className += ' success';
                icon = '✅ ';
                break;
            case 'error':
                className += ' error';
                icon = '❌ ';
                break;
            case 'loading':
                className += ' loading';
                icon = '⏳ ';
                break;
            default:
                className += ' info';
                icon = 'ℹ️ ';
        }
        
        let html = `${icon}${message}`;
        if (txHash) {
            html += `<br><small style="color:#666;">Transaction: ${txHash}</small>`;
        }
        
        statusEl.className = className;
        statusEl.innerHTML = html;
        
        // Scroll to message only if requested
        if (scrollToMessage) {
            statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        console.log('✅ Message displayed');
    }

    // Main swap function
    async handleSwap(e) {
        e.preventDefault();
        console.log('🔄 Starting swap operation...');
        
        if (this.isSwapping) {
            console.log('⚠️ Swap operation in progress');
            return;
        }
        
        this.isSwapping = true;
        this.setUIBusy(true);
        
        try {
            const amount = document.getElementById('swapAmount');
            const direction = document.getElementById('swapDirection');
            
            if (!amount || !direction) {
                throw new Error('Form incomplete - required elements not found');
            }
            
            const value = parseFloat(amount.value);
            if (!value || value <= 0) {
                throw new Error('Invalid amount - please enter a positive value');
            }
            
            // Check if the value is a whole number
            if (!Number.isInteger(value)) {
                throw new Error('Please enter a whole number only (no decimals)');
            }
            
            console.log('📊 Swap information:', {
                direction: direction.value,
                amount: value,
                userBalances: this.userBalances
            });
            
            // Check balance
            if (direction.value === 'dai-to-IAM' && value > this.userBalances.dai) {
                throw new Error(`Insufficient DAI balance. You have ${this.userBalances.dai.toFixed(6)} DAI, but trying to spend ${value.toFixed(6)} DAI. Please reduce the amount.`);
            }
            if (direction.value === 'IAM-to-dai' && value > this.userBalances.IAM) {
                throw new Error(`Insufficient IAM balance. You have ${this.userBalances.IAM.toFixed(6)} IAM, but trying to sell ${value.toFixed(6)} IAM. Please reduce the amount.`);
            }

            // Validation according to contract
            if (direction.value === 'dai-to-IAM') {
                if (value < 1) throw new Error('Minimum purchase amount is 1 DAI. Please increase your purchase amount.');
                
                // Enforce strict 1000 DAI maximum limit
                const maxAllowedDai = 1000;
                if (value > maxAllowedDai) {
                    throw new Error(`Purchase amount exceeds maximum limit. Maximum allowed: ${maxAllowedDai} DAI. Please reduce your amount.`);
                }
            } else if (direction.value === 'IAM-to-dai') {
                if (value < 1) throw new Error('Minimum sale amount is 1 IAM. Please increase your sale amount.');
                // No other limits for IAM to DAI conversion - removed all liquidity checks
            }

            // Execute swap operation
            if (direction.value === 'dai-to-IAM') {
                console.log('🛒 Starting IAM purchase with DAI...');
                await this.buyTokensWithDAI(value);
            } else if (direction.value === 'IAM-to-dai') {
                console.log('💰 Starting IAM sale and DAI receipt...');
                await this.sellTokensForDAI(value);
            } else {
                throw new Error('Invalid conversion type');
            }
            
            this.showStatus('🎉 Transaction completed successfully! Your tokens have been exchanged.', 'success');
            await this.refreshSwapData();
            amount.value = '';
            
            // Save active tab
            localStorage.setItem('activeTab', 'swap');
            
            console.log('✅ Swap operation completed successfully');
            
        } catch (error) {
            console.error('❌ Error in swap operation:', error);
            this.showStatus(this.getErrorMessage(error), 'error');
        } finally {
            this.setUIBusy(false);
            this.isSwapping = false;
        }
    }

    // Buy IAM with DAI (with allowance management)
    async buyTokensWithDAI(daiAmount) {
        console.log('🛒 Starting IAM purchase with DAI:', daiAmount);
        
        try {
            if (!this.contract || !this.signer || !this.daiContract) {
                throw new Error('Contract connection not established');
            }
            
            const address = await this.signer.getAddress();
            
            const daiAmountWei = ethers.utils.parseUnits(daiAmount.toString(), 18);
            
            console.log('🔍 Checking allowance...');
            // Check allowance
            const allowance = await this.daiContract.allowance(address, IAM_ADDRESS);
            console.log('📊 Current allowance:', ethers.utils.formatUnits(allowance, 18));
            
            if (allowance.lt(daiAmountWei)) {
                console.log('🔐 Need to approve DAI allowance...');
                this.showStatus('🔐 DAI approval required! Please approve DAI spending to continue with your purchase.', 'loading');
                
                const approveTx = await this.daiContract.approve(IAM_ADDRESS, ethers.constants.MaxUint256);
                this.showStatus('⏳ DAI approval transaction submitted! Waiting for confirmation... This is a one-time setup.', 'loading', approveTx.hash);
                
                console.log('⏳ Waiting for approve confirmation...');
                await approveTx.wait();
                this.showStatus('✅ DAI approval successful! You can now proceed with your purchase.', 'success');
                console.log('✅ Approve confirmed');
            } else {
                console.log('✅ Allowance is sufficient');
            }
            
            // Buy IAM
            console.log('🛒 Starting IAM token purchase...');
            this.showStatus('🛒 Initiating IAM token purchase... Please wait while we process your transaction.', 'loading');
            
            const tx = await this.contract.buyTokens(daiAmountWei);
            this.showStatus('⏳ Transaction submitted! Waiting for blockchain confirmation... This may take a few moments.', 'loading', tx.hash);
            
            console.log('⏳ Waiting for purchase transaction confirmation...');
            await tx.wait();
            
            this.showStatus('🎉 Purchase successful! Your IAM tokens have been added to your wallet.', 'success', tx.hash);
            console.log('✅ Purchase completed successfully');
            
        } catch (error) {
            console.error('❌ Error purchasing IAM:', error);
            throw error;
        }
    }

    // Sell IAM and receive DAI
    async sellTokensForDAI(IAMAmount) {
        console.log('💰 Starting IAM sale and DAI receipt:', IAMAmount);
        
        try {
            if (!this.contract) {
                throw new Error('Contract connection not established');
            }
            
            const IAMAmountWei = ethers.utils.parseUnits(IAMAmount.toString(), 18);
            
            console.log('💰 Starting IAM token sale...');
            this.showStatus('💰 Processing IAM token sale... Please wait while we execute your transaction.', 'loading');
            
            const tx = await this.contract.sellTokens(IAMAmountWei);
            this.showStatus('⏳ Sale transaction submitted! Waiting for blockchain confirmation... This may take a few moments.', 'loading', tx.hash);
            
            console.log('⏳ Waiting for sale transaction confirmation...');
            await tx.wait();
            
            this.showStatus('🎉 Sale successful! Your DAI tokens have been added to your wallet.', 'success', tx.hash);
            console.log('✅ Sale completed successfully');
            
        } catch (error) {
            console.error('❌ Error selling IAM:', error);
            throw error;
        }
    }

    async refreshSwapData() {
        // Prevent multiple simultaneous refresh calls
        if (this.isRefreshing) {
            console.log('🔄 Refresh already in progress, skipping...');
            return;
        }
        
        this.isRefreshing = true;
        console.log('🔄 Refreshing swap data...');
        
        try {
            await this.loadSwapData();
            
            console.log('✅ Swap data refreshed');
        } catch (error) {
            console.error('❌ Error refreshing swap data:', error);
        } finally {
            this.isRefreshing = false;
        }
    }
    

}

// Auto initialization removed - now done in index.html
// document.addEventListener('DOMContentLoaded', async function() {
//     window.swapManager = new SwapManager();
//     await window.swapManager.initializeSwap();
// });

// Hook for wallet connection
if (window.connectWallet) {
    const originalConnectWallet = window.connectWallet;
    window.connectWallet = async function() {
        const result = await originalConnectWallet();
        setTimeout(async () => {
            if (window.swapManager) {
                await window.swapManager.refreshSwapData();
            }
        }, 1000);
        return result;
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwapManager;
} 
