// TransferManager - Independent token transfer management
// Contract addresses and ABIs
const DAI_ADDRESS_TRANSFER = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';
const POL_ADDRESS = '0x0000000000000000000000000000000000000000'; // Native MATIC

// Use the contract address from config.js
let IAM_ADDRESS_TRANSFER = window.IAM_ADDRESS || '0x2D3923A5ba62B2bec13b9181B1E9AE0ea2C8118D';

const DAI_ABI_TRANSFER = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
];

// Use the full ABI from config.js instead of limited ABI
// The full ABI will be loaded from config.js

class TransferManager {
    constructor() {
        console.log('🏗️ Creating TransferManager instance...');
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.daiContract = null;
        this.iamContract = null;
        this.iamWrite = null;
        this.isRefreshing = false;

        console.log('✅ TransferManager created');
    }





    async connectWallet() {
        try {
            console.log('🔗 Connecting to wallet...');
            
            // Wait for ABI to be available
            if (!window.IAM_ABI) {
                console.log('⏳ Waiting for ABI to load...');
                let attempts = 0;
                while (!window.IAM_ABI && attempts < 50) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
                if (!window.IAM_ABI) {
                    throw new Error('ABI not available after waiting');
                }
            }
            
            // Use existing contractConfig if available
            if (window.contractConfig && window.contractConfig.signer) {
                console.log('✅ Using existing wallet connection');
                this.provider = window.contractConfig.provider;
                this.signer = window.contractConfig.signer;
                this.contract = new ethers.Contract(IAM_ADDRESS_TRANSFER, window.IAM_ABI, this.signer);
                this.daiContract = new ethers.Contract(DAI_ADDRESS_TRANSFER, DAI_ABI_TRANSFER, this.signer);
                return true;
            }
            
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask not installed');
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Create provider and signer (using ethers.js v5 syntax)
            if (typeof ethers.providers !== 'undefined' && ethers.providers.Web3Provider) {
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
                this.signer = this.provider.getSigner();
            } else if (typeof ethers.BrowserProvider !== 'undefined') {
                // Fallback for ethers.js v6
                this.provider = new ethers.BrowserProvider(window.ethereum);
                this.signer = await this.provider.getSigner();
            } else {
                throw new Error('Ethers.js provider not available');
            }
            
            // Create contract instances (read with project ABI; write with ERC20-min ABI to ensure transfer exists)
            this.contract = new ethers.Contract(IAM_ADDRESS_TRANSFER, window.IAM_ABI, this.signer);
            this.daiContract = new ethers.Contract(DAI_ADDRESS_TRANSFER, DAI_ABI_TRANSFER, this.signer);
            
            // Set iamContract to the same as contract for consistency
            this.iamContract = this.contract;
            
            try {
                const ERC20_WRITE_ABI = ["function transfer(address to, uint256 amount) returns (bool)"]; 
                this.iamWrite = new ethers.Contract(IAM_ADDRESS_TRANSFER, ERC20_WRITE_ABI, this.signer);
                console.log('✅ IAM write contract created successfully');
            } catch (error) {
                console.error('❌ Error creating IAM write contract:', error);
                // Fallback: use the main contract for both read and write
                this.iamWrite = this.contract;
            }
            
            console.log('✅ Wallet connected successfully');
            return true;
        } catch (error) {
            console.error('❌ Error connecting wallet:', error);
            throw error;
        }
    }

    async updateDaiBalance() {
        if (!this.signer || !this.daiContract) return;
        try {
            const address = await this.signer.getAddress();
            const daiBalance = await this.daiContract.balanceOf(address);
            const el = document.getElementById('transfer-dai-balance');
            if (el) {
                // Handle different ethers.js versions
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
                    value = ethers.utils.formatUnits(daiBalance, 18);
                } else if (typeof ethers.formatUnits !== 'undefined') {
                    value = ethers.formatUnits(daiBalance, 18);
                } else {
                    // Manual conversion
                    value = (parseFloat(daiBalance.toString()) / Math.pow(10, 18)).toString();
                }
                el.textContent = parseFloat(value).toFixed(2);
            }
        } catch (e) {
            const el = document.getElementById('transfer-dai-balance');
            if (el) el.textContent = 'Unable to load';
        }
    }

    async updateIAMBalance() {
        if (!this.signer || !this.contract) return;
        try {
            const address = await this.signer.getAddress();
            const iamBalance = await this.contract.balanceOf(address);
            const el = document.getElementById('transfer-IAM-balance');
            if (el) {
                // Handle different ethers.js versions
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
                    value = ethers.utils.formatUnits(iamBalance, 18);
                } else if (typeof ethers.formatUnits !== 'undefined') {
                    value = ethers.formatUnits(iamBalance, 18);
                } else {
                    // Manual conversion
                    value = (parseFloat(iamBalance.toString()) / Math.pow(10, 18)).toString();
                }
                el.textContent = Math.floor(parseFloat(value));
                
                // Update USD equivalent
                await this.updateIAMUsdValue(parseFloat(value));
            }
        } catch (e) {
            const el = document.getElementById('transfer-IAM-balance');
            if (el) el.textContent = 'Unable to load';
        }
    }

    async updateIAMUsdValue(iamAmount) {
        try {
            // Get token price from contract
            let tokenPrice = 0;
            if (this.contract && typeof this.contract.getTokenPrice === 'function') {
                const tokenPriceRaw = await this.contract.getTokenPrice();
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
                    tokenPrice = parseFloat(ethers.utils.formatUnits(tokenPriceRaw, 18));
                } else if (typeof ethers.formatUnits !== 'undefined') {
                    tokenPrice = parseFloat(ethers.formatUnits(tokenPriceRaw, 18));
                } else {
                    tokenPrice = parseFloat(tokenPriceRaw.toString()) / Math.pow(10, 18);
                }
            }
            
            const usdValue = iamAmount * tokenPrice;
            const usdEl = document.getElementById('transfer-IAM-usd');
            const toggleBtn = document.getElementById('toggle-iam-usd');
            
            if (usdEl && toggleBtn) {
                if (tokenPrice > 0) {
                    usdEl.textContent = `$${usdValue.toFixed(2)}`;
                    toggleBtn.style.display = 'block';
                } else {
                    usdEl.textContent = 'Price unavailable';
                    toggleBtn.style.display = 'block';
                }
            }
        } catch (e) {
            console.log('Error updating IAM USD value:', e);
            const usdEl = document.getElementById('transfer-IAM-usd');
            const toggleBtn = document.getElementById('toggle-iam-usd');
            if (usdEl && toggleBtn) {
                usdEl.textContent = 'Price unavailable';
                toggleBtn.style.display = 'block';
            }
        }
    }

    async updatePOLBalance() {
        if (!this.signer) return;
        try {
            const address = await this.signer.getAddress();
            const polBalance = await this.provider.getBalance(address);
            const el = document.getElementById('transfer-poly-balance');
            if (el) {
                // Handle different ethers.js versions
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatEther) {
                    value = ethers.utils.formatEther(polBalance);
                } else if (typeof ethers.formatEther !== 'undefined') {
                    value = ethers.formatEther(polBalance);
                } else {
                    // Manual conversion
                    value = (parseFloat(polBalance.toString()) / Math.pow(10, 18)).toString();
                }
                el.textContent = parseFloat(value).toFixed(4);
            }
        } catch (e) {
            const el = document.getElementById('transfer-poly-balance');
            if (el) el.textContent = 'Unable to load';
        }
    }

    async loadTransferData() {
        if (this.isRefreshing) return;
        this.isRefreshing = true;
        
        try {
            console.log('🔄 Loading transfer data...');
            
            if (!this.signer) {
                console.log('⚠️ No signer available');
                return;
            }
            
            console.log('✅ Contract connection established');
            
            // Load selected token balance based on current selection
            const tokenSelect = document.getElementById('transferToken');
            if (tokenSelect) {
                this.showSelectedTokenBalance(tokenSelect.value);
            }
            
            console.log('✅ Transfer data loaded');
        } catch (error) {
            console.error('❌ Error loading transfer data:', error);
        } finally {
            this.isRefreshing = false;
        }
    }

    async initializeTransfer() {
        try {
            console.log('🔄 Starting TransferManager initialization...');
            
            // Connect to wallet
            await this.connectWallet();
            console.log('✅ Wallet connected');
            
            // Load transfer data
            await this.loadTransferData();
            console.log('✅ Transfer data loaded');
            
            // Setup event listeners
            this.setupEventListeners();
            console.log('✅ Event listeners configured');
            
            // Initialize USD converter visibility
            this.initializeUsdConverter();
            console.log('✅ USD converter initialized');
            
            // Contract selection removed - using new contract by default
            console.log('✅ Using new contract by default');
            
            console.log('✅ TransferManager successfully initialized');
        } catch (error) {
            console.error('❌ Error initializing TransferManager:', error);
            throw error;
        }
    }

    // Initialize USD converter visibility
    initializeUsdConverter() {
        const tokenSelect = document.getElementById('transferToken');
        if (tokenSelect) {
            this.handleTokenTypeChange(tokenSelect.value);
        }
    }

    setupEventListeners() {
        const transferForm = document.getElementById('transferForm');
        if (!transferForm) return;

        transferForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleTransfer(e);
        });

        // Max button (in balance card)
        const maxBtn = document.getElementById('maxAmountBtn');
        if (maxBtn) {
            maxBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default button behavior
                e.stopPropagation(); // Stop event bubbling
                this.setMaxAmount();
            });
        }

        // Max button (in amount input)
        const maxBtnInput = document.getElementById('maxAmountBtnInput');
        if (maxBtnInput) {
            maxBtnInput.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default button behavior
                e.stopPropagation(); // Stop event bubbling
                this.setMaxAmount();
            });
        }

        // USD toggle button for selected token
        const usdToggleBtn = document.getElementById('selected-token-usd-toggle');
        if (usdToggleBtn) {
            usdToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSelectedTokenUsdDisplay();
            });
        }

        // Token type change handler
        const tokenSelect = document.getElementById('transferToken');
        if (tokenSelect) {
            tokenSelect.addEventListener('change', (e) => {
                this.handleTokenTypeChange(e.target.value);
            });
        }

        // USD to token conversion
        const convertUsdBtn = document.getElementById('convertUsdToTokenBtn');
        if (convertUsdBtn) {
            convertUsdBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.convertUsdToToken();
            });
        }

        // USD amount input change handler
        const usdAmountInput = document.getElementById('transferUsdAmount');
        if (usdAmountInput) {
            usdAmountInput.addEventListener('input', () => {
                this.updateUsdConversionStatus();
            });
            
            // Add Enter key support for conversion
            usdAmountInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.convertUsdToToken();
                }
            });
        }


    }

    // Resolve destination: supports direct address or numeric index
    async resolveDestinationAddress(rawInput) {
        const input = (rawInput || '').trim();
        const isV5 = typeof ethers.utils !== 'undefined';
        const isAddress = (addr) => {
            try {
                if (isV5 && ethers.utils.isAddress) return ethers.utils.isAddress(addr);
                if (ethers.isAddress) return ethers.isAddress(addr);
            } catch {}
            return /^0x[a-fA-F0-9]{40}$/.test(addr);
        };

        if (isAddress(input)) return input;

        // If purely numeric, treat as index and resolve through contract
        if (/^\d+$/.test(input)) {
            const index = parseInt(input, 10);
            if (!this.contract) throw new Error('Contract not connected');

            // Try a few common methods with timeouts
            const withTimeout = (p, ms = 10000) => Promise.race([
                p,
                new Promise((_, r) => setTimeout(() => r(new Error('Timeout resolving index')) , ms))
            ]);

            // 1) getUserAddress(uint)
            try {
                if (typeof this.contract.getUserAddress === 'function') {
                    const addr = await withTimeout(this.contract.getUserAddress(index));
                    if (addr && isAddress(addr)) return addr;
                }
            } catch {}

            // 2) indexToAddress(uint)
            try {
                if (typeof this.contract.indexToAddress === 'function') {
                    const addr = await withTimeout(this.contract.indexToAddress(index));
                    if (addr && isAddress(addr)) return addr;
                }
            } catch {}

            // 3) wallets(uint) 0-based
            try {
                if (typeof this.contract.wallets === 'function') {
                    const addr = await withTimeout(this.contract.wallets(index - 1));
                    if (addr && isAddress(addr)) return addr;
                }
            } catch {}

            throw new Error('User not found for this index');
        }

        throw new Error('Invalid destination. Enter a wallet address or a valid index');
    }

    // Handle token type change
    handleTokenTypeChange(tokenType) {
        const usdConverter = document.getElementById('transfer-usd-converter');
        const usdAmountInput = document.getElementById('transferUsdAmount');
        const conversionStatus = document.getElementById('usdConversionStatus');
        const selectedBalanceContainer = document.getElementById('selected-token-balance');
        
        // Show/hide USD converter for IAM
        if (tokenType === 'IAM') {
            usdConverter.style.display = 'block';
            usdAmountInput.value = '';
            conversionStatus.textContent = '';
            conversionStatus.className = '';
        } else {
            usdConverter.style.display = 'none';
            usdAmountInput.value = '';
            conversionStatus.textContent = '';
            conversionStatus.className = '';
        }
        
        // Show selected token balance
        this.showSelectedTokenBalance(tokenType);
    }

    // Show selected token balance
    showSelectedTokenBalance(tokenType) {
        const selectedBalanceContainer = document.getElementById('selected-token-balance');
        const selectedTokenName = document.getElementById('selected-token-name');
        const selectedTokenAmount = document.getElementById('selected-token-amount');
        const selectedTokenUsd = document.getElementById('selected-token-usd');
        const selectedTokenUsdToggle = document.getElementById('selected-token-usd-toggle');
        
        if (!selectedBalanceContainer || !selectedTokenName || !selectedTokenAmount) {
            return;
        }
        
        // Show the balance container
        selectedBalanceContainer.style.display = 'flex';
        
        // Update token name and get balance
        switch (tokenType) {
            case 'DAI':
                selectedTokenName.textContent = '🟢 DAI';
                this.updateSelectedTokenBalance('dai');
                selectedTokenUsd.style.display = 'none';
                selectedTokenUsdToggle.style.display = 'none';
                break;
            case 'POL':
                selectedTokenName.textContent = '🔵 POL (MATIC)';
                this.updateSelectedTokenBalance('pol');
                selectedTokenUsd.style.display = 'none';
                selectedTokenUsdToggle.style.display = 'none';
                break;
            case 'IAM':
                selectedTokenName.textContent = '🟣 IAM';
                this.updateSelectedTokenBalance('iam');
                // USD functionality will be handled by updateIAMUsdValue
                break;
            default:
                selectedBalanceContainer.style.display = 'none';
        }
    }

    // Update selected token balance
    async updateSelectedTokenBalance(tokenType) {
        const selectedTokenAmount = document.getElementById('selected-token-amount');
        const selectedTokenUsd = document.getElementById('selected-token-usd');
        const selectedTokenUsdToggle = document.getElementById('selected-token-usd-toggle');
        
        if (!selectedTokenAmount) return;
        
        try {
            let balance = '-';
            let usdValue = null;
            
            if (tokenType === 'dai' && this.daiContract) {
                const address = await this.signer.getAddress();
                const daiBalance = await this.daiContract.balanceOf(address);
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
                    value = ethers.utils.formatUnits(daiBalance, 18);
                } else if (typeof ethers.formatUnits !== 'undefined') {
                    value = ethers.formatUnits(daiBalance, 18);
                } else {
                    value = (parseFloat(daiBalance.toString()) / Math.pow(10, 18)).toString();
                }
                balance = parseFloat(value).toFixed(2);
            } else if (tokenType === 'pol' && this.signer) {
                const address = await this.signer.getAddress();
                const polBalance = await this.provider.getBalance(address);
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatEther) {
                    value = ethers.utils.formatEther(polBalance);
                } else if (typeof ethers.formatEther !== 'undefined') {
                    value = ethers.formatEther(polBalance);
                } else {
                    value = (parseFloat(polBalance.toString()) / Math.pow(10, 18)).toString();
                }
                balance = parseFloat(value).toFixed(4);
            } else if (tokenType === 'iam' && this.contract) {
                const address = await this.signer.getAddress();
                const iamBalance = await this.contract.balanceOf(address);
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
                    value = ethers.utils.formatUnits(iamBalance, 18);
                } else if (typeof ethers.formatUnits !== 'undefined') {
                    value = ethers.formatUnits(iamBalance, 18);
                } else {
                    value = (parseFloat(iamBalance.toString()) / Math.pow(10, 18)).toString();
                }
                balance = Math.floor(parseFloat(value));
                
                // Update USD equivalent for IAM
                await this.updateSelectedTokenUsdValue(parseFloat(value));
            }
            
            selectedTokenAmount.textContent = balance;
            
        } catch (error) {
            console.error(`Error updating ${tokenType} balance:`, error);
            selectedTokenAmount.textContent = 'Unable to load';
        }
    }

    // Update selected token USD value (for IAM)
    async updateSelectedTokenUsdValue(iamAmount) {
        const selectedTokenUsd = document.getElementById('selected-token-usd');
        const selectedTokenUsdToggle = document.getElementById('selected-token-usd-toggle');
        
        try {
            // Get token price from contract
            let tokenPrice = 0;
            if (this.contract && typeof this.contract.getTokenPrice === 'function') {
                const tokenPriceRaw = await this.contract.getTokenPrice();
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
                    tokenPrice = parseFloat(ethers.utils.formatUnits(tokenPriceRaw, 18));
                } else if (typeof ethers.formatUnits !== 'undefined') {
                    tokenPrice = parseFloat(ethers.formatUnits(tokenPriceRaw, 18));
                } else {
                    tokenPrice = parseFloat(tokenPriceRaw.toString()) / Math.pow(10, 18);
                }
            }
            
            if (selectedTokenUsd && selectedTokenUsdToggle) {
                if (tokenPrice > 0) {
                    const usdValue = iamAmount * tokenPrice;
                    selectedTokenUsd.textContent = `$${usdValue.toFixed(2)}`;
                    selectedTokenUsd.style.display = 'none'; // Initially hidden
                    selectedTokenUsdToggle.style.display = 'block';
                } else {
                    selectedTokenUsd.textContent = 'Price unavailable';
                    selectedTokenUsd.style.display = 'none';
                    selectedTokenUsdToggle.style.display = 'block';
                }
            }
        } catch (e) {
            console.log('Error updating selected token USD value:', e);
            if (selectedTokenUsd && selectedTokenUsdToggle) {
                selectedTokenUsd.textContent = 'Price unavailable';
                selectedTokenUsd.style.display = 'none';
                selectedTokenUsdToggle.style.display = 'block';
            }
        }
    }

    // Convert USD to token amount
    async convertUsdToToken() {
        const usdAmountInput = document.getElementById('transferUsdAmount');
        const transferAmountInput = document.getElementById('transferAmount');
        const conversionStatus = document.getElementById('usdConversionStatus');
        
        if (!usdAmountInput || !transferAmountInput || !conversionStatus) {
            return;
        }
        
        const usdValue = parseFloat(usdAmountInput.value);
        
        if (!usdValue || usdValue <= 0) {
            this.showUsdConversionStatus('Please enter a valid USD amount (minimum $0.01)', 'error');
            return;
        }
        
        try {
            // Get token price from contract
            let tokenPrice = 0;
            if (this.contract && typeof this.contract.getTokenPrice === 'function') {
                const tokenPriceRaw = await this.contract.getTokenPrice();
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
                    tokenPrice = parseFloat(ethers.utils.formatUnits(tokenPriceRaw, 18));
                } else if (typeof ethers.formatUnits !== 'undefined') {
                    tokenPrice = parseFloat(ethers.formatUnits(tokenPriceRaw, 18));
                } else {
                    tokenPrice = parseFloat(tokenPriceRaw.toString()) / Math.pow(10, 18);
                }
            }
            
            if (tokenPrice <= 0) {
                this.showUsdConversionStatus('Token price is currently unavailable. Please try again later.', 'error');
                return;
            }
            
            // Convert USD to IAM tokens
            const iamAmount = usdValue / tokenPrice;
            transferAmountInput.value = iamAmount.toFixed(6);
            
            this.showUsdConversionStatus(`✅ Converted $${usdValue.toFixed(2)} to ${iamAmount.toFixed(6)} IAM tokens`, 'success');
            
        } catch (error) {
            console.error('Error converting USD to token:', error);
            this.showUsdConversionStatus('Error getting token price. Please try again.', 'error');
        }
    }

    // Update USD conversion status
    updateUsdConversionStatus() {
        const usdAmountInput = document.getElementById('transferUsdAmount');
        const conversionStatus = document.getElementById('usdConversionStatus');
        
        if (!usdAmountInput || !conversionStatus) {
            return;
        }
        
        const usdValue = parseFloat(usdAmountInput.value);
        
        if (usdValue && usdValue > 0) {
            conversionStatus.textContent = `Ready to convert $${usdValue.toFixed(2)}`;
            conversionStatus.className = 'usd-conversion-status ready';
            conversionStatus.style.background = 'rgba(0, 255, 136, 0.1)';
            conversionStatus.style.color = '#00ff88';
            conversionStatus.style.border = '1px solid rgba(0, 255, 136, 0.3)';
        } else {
            conversionStatus.textContent = '';
            conversionStatus.className = '';
        }
    }

    // Show USD conversion status
    showUsdConversionStatus(message, type) {
        const conversionStatus = document.getElementById('usdConversionStatus');
        if (!conversionStatus) return;
        
        conversionStatus.textContent = message;
        conversionStatus.className = `usd-conversion-status ${type}`;
        
        switch (type) {
            case 'success':
                conversionStatus.style.background = 'rgba(0, 255, 136, 0.1)';
                conversionStatus.style.color = '#00ff88';
                conversionStatus.style.border = '1px solid rgba(0, 255, 136, 0.3)';
                break;
            case 'error':
                conversionStatus.style.background = 'rgba(255, 68, 68, 0.1)';
                conversionStatus.style.color = '#ff4444';
                conversionStatus.style.border = '1px solid rgba(255, 68, 68, 0.3)';
                break;
            case 'loading':
                conversionStatus.style.background = 'rgba(255, 165, 0, 0.1)';
                conversionStatus.style.color = '#ffa500';
                conversionStatus.style.border = '1px solid rgba(255, 165, 0, 0.3)';
                break;
        }
    }

    // Toggle selected token USD display
    toggleSelectedTokenUsdDisplay() {
        const usdEl = document.getElementById('selected-token-usd');
        const toggleBtn = document.getElementById('selected-token-usd-toggle');
        
        if (usdEl && toggleBtn) {
            if (usdEl.style.display === 'none') {
                usdEl.style.display = 'block';
                toggleBtn.textContent = '💲 Hide USD';
            } else {
                usdEl.style.display = 'none';
                toggleBtn.textContent = '💲 USD';
            }
        }
    }

    // Show status message
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('transferStatus');
        if (!statusEl) return;
        
        let className = 'transfer-status';
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
        
        statusEl.className = className;
        statusEl.textContent = icon + message;
    }

    async setMaxAmount() {
        const tokenSelect = document.getElementById('transferToken');
        const amountInput = document.getElementById('transferAmount');
        
        if (!tokenSelect || !amountInput) return;
        
        const token = tokenSelect.value.toLowerCase();
        
        try {
            if (token === 'dai') {
                const address = await this.signer.getAddress();
                const balance = await this.daiContract.balanceOf(address);
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
                    value = ethers.utils.formatUnits(balance, 18);
                } else if (typeof ethers.formatUnits !== 'undefined') {
                    value = ethers.formatUnits(balance, 18);
                } else {
                    value = (parseFloat(balance.toString()) / Math.pow(10, 18)).toString();
                }
                // Subtract 0.01 DAI (1 cent) for safety
                const safeAmount = parseFloat(value) - 0.01;
                amountInput.value = safeAmount > 0 ? safeAmount.toFixed(6) : '0';
            } else if (token === 'iam') {
                const address = await this.signer.getAddress();
                const balance = await this.contract.balanceOf(address);
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
                    value = ethers.utils.formatUnits(balance, 18);
                } else if (typeof ethers.formatUnits !== 'undefined') {
                    value = ethers.formatUnits(balance, 18);
                } else {
                    value = (parseFloat(balance.toString()) / Math.pow(10, 18)).toString();
                }
                // Round down and subtract 100 tokens to be safe
                const safeAmount = Math.floor(parseFloat(value)) - 100;
                amountInput.value = safeAmount > 0 ? safeAmount : '0';
            } else if (token === 'pol') {
                const address = await this.signer.getAddress();
                const balance = await this.provider.getBalance(address);
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatEther) {
                    value = ethers.utils.formatEther(balance);
                } else if (typeof ethers.formatEther !== 'undefined') {
                    value = ethers.formatEther(balance);
                } else {
                    value = (parseFloat(balance.toString()) / Math.pow(10, 18)).toString();
                }
                // Leave some for gas and round down
                const maxAmount = parseFloat(value) - 0.01;
                amountInput.value = maxAmount > 0 ? Math.floor(maxAmount) : '0';
            }
            
            // Refresh the selected token balance display
            this.showSelectedTokenBalance(tokenSelect.value);
            
        } catch (error) {
            console.error('❌ Error setting max amount:', error);
        }
    }

    async handleTransfer(e) {
        const transferForm = e.target;
        const transferBtn = transferForm.querySelector('button[type="submit"]');
        const oldText = transferBtn ? transferBtn.textContent : '';
        
        // Disable button and show loading state
        if (transferBtn) {
            transferBtn.disabled = true;
            transferBtn.textContent = '⏳ Processing...';
            transferBtn.style.opacity = '0.7';
            transferBtn.style.cursor = 'not-allowed';
        }

        const transferToInput = document.getElementById('transferTo');
        // Resolve destination (address or index)
        let to = transferToInput.getAttribute('data-full-address') || transferToInput.value.trim();
        try {
            to = await this.resolveDestinationAddress(to);
            transferToInput.value = to;
        } catch (err) {
            this.showEnglishPopup(err.message || 'Invalid destination', 'error');
            this.resetTransferButton(transferBtn, oldText);
            return;
        }
        const amount = parseFloat(document.getElementById('transferAmount').value);
        const token = document.getElementById('transferToken').value;
        const status = document.getElementById('transferStatus');
        
        status.textContent = '';
        status.className = 'transfer-status';
        
        if (!to || !amount || amount <= 0) {
            this.showEnglishPopup('Please enter a valid destination address and amount (minimum 0.000001)', 'error');
            this.resetTransferButton(transferBtn, oldText);
            return;
        }
        
        // Validate Ethereum address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(to)) {
            this.showEnglishPopup('❌ Invalid destination address format. Please enter a valid Ethereum address.', 'error');
            this.resetTransferButton(transferBtn, oldText);
            return;
        }
        
        // Allow self-transfers - removed restriction
        // Users can now transfer assets to themselves if needed
        
        if (!this.signer) {
            this.showEnglishPopup('Wallet connection not established. Please connect your wallet first', 'error');
            this.resetTransferButton(transferBtn, oldText);
            return;
        }
        
        try {
            // Show initial processing message
            this.showEnglishPopup('🚀 Starting transfer... Please wait', 'loading');
            
            // Check balance before attempting transfer
            const senderAddress = await this.signer.getAddress();
            let hasEnoughBalance = false;
            
            if (token.toLowerCase() === 'pol') {
                const balance = await this.signer.provider.getBalance(senderAddress);
                let requiredAmount;
                if (ethers.parseEther) {
                    requiredAmount = ethers.parseEther(amount.toString());
                } else {
                    requiredAmount = this.convertToWei(amount);
                }
                hasEnoughBalance = BigInt(balance) >= BigInt(requiredAmount);
            } else if (token.toLowerCase() === 'dai') {
                const daiBalance = await this.daiContract.balanceOf(senderAddress);
                let requiredAmount;
                if (ethers.parseUnits) {
                    requiredAmount = ethers.parseUnits(amount.toString(), 18);
                } else {
                    requiredAmount = this.convertToWei(amount);
                }
                hasEnoughBalance = BigInt(daiBalance) >= BigInt(requiredAmount);
            } else if (token.toLowerCase() === 'iam') {
                const iamBalance = await this.contract.balanceOf(senderAddress);
                let requiredAmount;
                if (ethers.parseUnits) {
                    requiredAmount = ethers.parseUnits(amount.toString(), 18);
                } else {
                    requiredAmount = this.convertToWei(amount);
                }
                hasEnoughBalance = BigInt(iamBalance) >= BigInt(requiredAmount);
            }
            
            if (!hasEnoughBalance) {
                this.showEnglishPopup(`❌ Insufficient ${token.toUpperCase()} balance. Please check your wallet balance and try again.`, 'error');
                this.resetTransferButton(transferBtn, oldText);
                return;
            }
            
            if (token.toLowerCase() === 'pol') {
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.parseEther) {
                    value = ethers.utils.parseEther(amount.toString());
                } else if (typeof ethers.parseEther !== 'undefined') {
                    value = ethers.parseEther(amount.toString());
                } else {
                    value = this.convertToWei(amount);
                }
                
                // Update button to show confirmation waiting
                if (transferBtn) {
                    transferBtn.textContent = '⏳ Waiting for blockchain confirmation...';
                }
                
                const tx = await this.signer.sendTransaction({
                    to,
                    value: value
                });
                
                this.showEnglishPopup('⏳ MATIC transfer submitted! Waiting for blockchain confirmation...', 'loading');
                await tx.wait();
                
                // Get sender and recipient indices for MATIC
                let senderIndex = null;
                let recipientIndex = null;
                try {
                    const senderAddress = await this.signer.getAddress();
                    
                    if (this.contract && typeof this.contract.addressToIndex === 'function') {
                        const senderIndexRaw = await this.contract.addressToIndex(senderAddress);
                        const senderIndexNum = parseInt(senderIndexRaw.toString());
                        if (senderIndexNum > 0) {
                            senderIndex = senderIndexNum.toString();
                        }
                        
                        const recipientIndexRaw = await this.contract.addressToIndex(to);
                        const recipientIndexNum = parseInt(recipientIndexRaw.toString());
                        if (recipientIndexNum > 0) {
                            recipientIndex = recipientIndexNum.toString();
                        }
                    }
                } catch (error) {
                    console.log('Could not get user indices for MATIC:', error);
                }
                
                this.showEnglishPopup(`🎉 MATIC transfer completed successfully!`, 'success', {
                    hash: tx.hash,
                    recipient: to,
                    amount: amount,
                    token: 'MATIC',
                    senderIndex: senderIndex,
                    recipientIndex: recipientIndex,
                    senderAddress: await this.signer.getAddress()
                });
                
            } else if (token.toLowerCase() === 'dai') {
                let parsedAmount;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.parseUnits) {
                    parsedAmount = ethers.utils.parseUnits(amount.toString(), 18);
                } else if (typeof ethers.parseUnits !== 'undefined') {
                    parsedAmount = ethers.parseUnits(amount.toString(), 18);
                } else {
                    parsedAmount = this.convertToWei(amount);
                }
                
                // Update button to show confirmation waiting
                if (transferBtn) {
                    transferBtn.textContent = '⏳ Waiting for blockchain confirmation...';
                }
                
                const tx = await this.daiContract.transfer(to, parsedAmount);
                
                this.showEnglishPopup('⏳ DAI transfer submitted! Waiting for blockchain confirmation...', 'loading');
                await tx.wait();
                
                // Get sender and recipient indices for DAI
                let senderIndex = null;
                let recipientIndex = null;
                try {
                    const senderAddress = await this.signer.getAddress();
                    
                    if (this.contract && typeof this.contract.addressToIndex === 'function') {
                        const senderIndexRaw = await this.contract.addressToIndex(senderAddress);
                        const senderIndexNum = parseInt(senderIndexRaw.toString());
                        if (senderIndexNum > 0) {
                            senderIndex = senderIndexNum.toString();
                        }
                        
                        const recipientIndexRaw = await this.contract.addressToIndex(to);
                        const recipientIndexNum = parseInt(recipientIndexRaw.toString());
                        if (recipientIndexNum > 0) {
                            recipientIndex = recipientIndexNum.toString();
                        }
                    }
                } catch (error) {
                    console.log('Could not get user indices for DAI:', error);
                }
                
                this.showEnglishPopup(`🎉 DAI transfer completed successfully!`, 'success', {
                    hash: tx.hash,
                    recipient: to,
                    amount: amount,
                    token: 'DAI',
                    senderIndex: senderIndex,
                    recipientIndex: recipientIndex,
                    senderAddress: await this.signer.getAddress()
                });
                
            } else {
                // IAM Token Transfer
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.parseUnits) {
                    value = ethers.utils.parseUnits(amount.toString(), 18);
                } else if (typeof ethers.parseUnits !== 'undefined') {
                    value = ethers.parseUnits(amount.toString(), 18);
                } else {
                    value = this.convertToWei(amount);
                }
                
                console.log('🔄 IAM Transfer Details:', {
                    to: to,
                    amount: amount,
                    value: value.toString(),
                    contract: this.contract.address,
                    contractMethods: (this.contract.interface && this.contract.interface.functions) ? Object.keys(this.contract.interface.functions) : [],
                    hasTransferMethod: !!this.iamWrite
                });
                
                // Update button to show confirmation waiting
                if (transferBtn) {
                    transferBtn.textContent = '⏳ Waiting for blockchain confirmation...';
                }
                
                // Use the main contract for IAM transfer (now includes transfer function in ABI)
                if (!this.contract || typeof this.contract.transfer !== 'function') {
                    throw new Error('IAM transfer method is unavailable in ABI');
                }
                const tx = await this.contract.transfer(to, value);
                
                this.showEnglishPopup('⏳ IAM transfer submitted! Waiting for blockchain confirmation...', 'loading');
                await tx.wait();
                
                // Get USD value for IAM tokens
                let usdValue = null;
                try {
                    if (this.contract && typeof this.contract.getTokenPrice === 'function') {
                        const tokenPriceRaw = await this.contract.getTokenPrice();
                        let tokenPrice = 0;
                        if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
                            tokenPrice = parseFloat(ethers.utils.formatUnits(tokenPriceRaw, 18));
                        } else if (typeof ethers.formatUnits !== 'undefined') {
                            tokenPrice = parseFloat(ethers.formatUnits(tokenPriceRaw, 18));
                        } else {
                            tokenPrice = parseFloat(tokenPriceRaw.toString()) / Math.pow(10, 18);
                        }
                        
                        if (tokenPrice > 0) {
                            usdValue = (parseFloat(amount) * tokenPrice).toFixed(2);
                        }
                    }
                } catch (error) {
                    console.log('Could not get token price for USD display:', error);
                }
                
                // Get sender and recipient indices
                let senderIndex = null;
                let recipientIndex = null;
                try {
                    const senderAddress = await this.signer.getAddress();
                    
                    // Get sender index
                    if (this.contract && typeof this.contract.addressToIndex === 'function') {
                        const senderIndexRaw = await this.contract.addressToIndex(senderAddress);
                        const senderIndexNum = parseInt(senderIndexRaw.toString());
                        if (senderIndexNum > 0) {
                            senderIndex = senderIndexNum.toString();
                        }
                        console.log('Sender index lookup:', { address: senderAddress, index: senderIndexRaw.toString(), valid: senderIndexNum > 0 });
                    }
                    
                    // Get recipient index
                    if (this.contract && typeof this.contract.addressToIndex === 'function') {
                        const recipientIndexRaw = await this.contract.addressToIndex(to);
                        const recipientIndexNum = parseInt(recipientIndexRaw.toString());
                        if (recipientIndexNum > 0) {
                            recipientIndex = recipientIndexNum.toString();
                        }
                        console.log('Recipient index lookup:', { address: to, index: recipientIndexRaw.toString(), valid: recipientIndexNum > 0 });
                    }
                } catch (error) {
                    console.log('Could not get user indices:', error);
                }
                
                this.showEnglishPopup(`🎉 IAM transfer completed successfully!`, 'success', {
                    hash: tx.hash,
                    recipient: to,
                    amount: amount,
                    token: 'IAM',
                    usdValue: usdValue,
                    senderIndex: senderIndex,
                    recipientIndex: recipientIndex,
                    senderAddress: await this.signer.getAddress()
                });
            }
            
            transferForm.reset();
            await this.loadTransferData(); // Refresh balances after successful transfer
            
        } catch (error) {
            console.error('❌ Transfer error details:', error);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error code:', error.code);
            console.error('❌ Error data:', error.data);
            
            let englishMsg = this.getEnglishErrorMessage(error);
            this.showEnglishPopup(englishMsg, 'error');
        }
        
        // Always reset button state
        this.resetTransferButton(transferBtn, oldText);
    }

    // Show English popup message
    showEnglishPopup(message, type, transactionDetails = null) {
        // Remove existing popup if any
        const existingPopup = document.getElementById('transfer-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create popup element
        const popup = document.createElement('div');
        popup.id = 'transfer-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? 'rgba(0, 255, 136, 0.95)' : type === 'error' ? 'rgba(255, 68, 68, 0.95)' : type === 'loading' ? 'rgba(255, 193, 7, 0.95)' : 'rgba(167, 134, 255, 0.95)'};
            color: ${type === 'success' ? '#0a0f1c' : type === 'error' ? '#fff' : type === 'loading' ? '#0a0f1c' : '#fff'};
            padding: 25px 35px;
            border-radius: 12px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            font-family: 'Segoe UI', 'Arial', sans-serif;
            text-align: center;
            min-width: 350px;
            max-width: 600px;
            font-size: 14px;
            line-height: 1.5;
            border: 2px solid ${type === 'success' ? 'rgba(0, 255, 136, 0.3)' : type === 'error' ? 'rgba(255, 68, 68, 0.3)' : type === 'loading' ? 'rgba(255, 193, 7, 0.3)' : 'rgba(167, 134, 255, 0.3)'};
        `;
        
        // Build popup content
        let popupContent = `
            <div style="margin-bottom: 15px; font-size: 18px;">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'loading' ? '⏳' : 'ℹ️'}
            </div>
            <div style="margin-bottom: 20px;">${message}</div>
        `;
        
        // Add transaction details for success popups
        if (type === 'success' && transactionDetails) {
            const shortHash = transactionDetails.hash.substring(0, 10) + '...' + transactionDetails.hash.substring(transactionDetails.hash.length - 8);
            
            // Get sender address from transaction details or signer
            const senderAddress = transactionDetails.senderAddress || 'Unknown';
            const recipientAddress = transactionDetails.recipient;
            
            popupContent += `
                <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 15px; margin: 15px 0; text-align: left;">
                    <div style="margin-bottom: 10px; font-size: 13px; opacity: 0.8;">Transaction Details:</div>
                    <div style="margin-bottom: 8px; font-size: 12px;">
                        <strong>Token:</strong> ${transactionDetails.token}
                    </div>
                    <div style="margin-bottom: 8px; font-size: 12px;">
                        <strong>Amount:</strong> ${transactionDetails.amount} ${transactionDetails.token}
                        ${transactionDetails.usdValue ? ` ($${transactionDetails.usdValue} USD)` : ''}
                    </div>
                    <div style="margin-bottom: 8px; font-size: 12px; word-break: break-all;">
                        <strong>From:</strong> ${transactionDetails.senderIndex ? `User #${transactionDetails.senderIndex} - ` : ''}${senderAddress}
                    </div>
                    <div style="margin-bottom: 8px; font-size: 12px; word-break: break-all;">
                        <strong>To:</strong> ${transactionDetails.recipientIndex ? `User #${transactionDetails.recipientIndex} - ` : ''}${recipientAddress}
                    </div>
                    <div style="margin-bottom: 8px; font-size: 12px;">
                        <strong>Transaction Hash:</strong> ${shortHash}
                    </div>
                </div>
            `;
        }
        
        // Add buttons
        popupContent += `
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        `;
        
        // Add copy hash button for success popups with transaction details
        if (type === 'success' && transactionDetails) {
            popupContent += `
                <button onclick="navigator.clipboard.writeText('${transactionDetails.hash}').then(() => { this.textContent = 'Copied!'; setTimeout(() => { this.textContent = 'Copy Hash'; }, 2000); })" style="
                    background: rgba(255, 255, 255, 0.2);
                    color: ${type === 'success' || type === 'loading' ? '#0a0f1c' : '#fff'};
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 6px;
                    padding: 8px 16px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">Copy Hash</button>
            `;
        }
        
        // Add close button
        popupContent += `
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: rgba(255, 255, 255, 0.2);
                    color: ${type === 'success' || type === 'loading' ? '#0a0f1c' : '#fff'};
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 6px;
                    padding: 8px 16px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">Close</button>
            </div>
        `;
        
        popup.innerHTML = popupContent;
        document.body.appendChild(popup);
        
        // No auto-remove - popup stays open until user clicks close button
    }

    // Get English error message
    getEnglishErrorMessage(error) {
        const msg = error && error.message ? error.message : error.toString();
        
        if (msg.includes('user rejected')) return '❌ Transaction cancelled by user. Please try again when ready.';
        else if (msg.includes('insufficient funds')) return '❌ Insufficient balance for gas fees or transfer amount. Please check your wallet balance.';
        else if (msg.includes('insufficient balance')) return '❌ Insufficient token balance. Please check your wallet and try again.';
        else if (msg.includes('invalid address')) return '❌ Invalid destination address. Please enter a valid wallet address.';
        else if (msg.includes('not allowed') || msg.includes('only owner')) return '❌ You are not authorized to perform this operation. Please check your permissions.';
        else if (msg.includes('already transferred') || msg.includes('already exists')) return '❌ This transfer has already been completed or is a duplicate. Please check your transaction history.';
        else if (msg.includes('slippage')) return '❌ Price difference is too high. Please adjust the amount and try again.';
        else if (msg.includes('price changed')) return '❌ Token price has changed. Please refresh and try again.';
        else if (msg.includes('nonce')) return '❌ Transaction sequence error. Please try again in a moment.';
        else if (msg.includes('execution reverted')) return '❌ Transfer failed. Please check the destination address and amount.';
        else if (msg.includes('network') || msg.includes('connection')) return '❌ Network connection error. Please check your internet connection and try again.';
        else if (msg.includes('timeout')) return '❌ Transaction timeout. Please try again with higher gas fees.';
        else if (msg.includes('gas')) return '❌ Insufficient gas for transaction. Please increase gas limit.';
        else if (msg.includes('revert')) return '❌ Transfer failed. Please verify the destination address and try again.';
        else return `❌ Transfer error: ${msg}. Please try again.`;
    }

    // Convert amount to wei with proper handling of large numbers
    convertToWei(amount) {
        try {
            // Convert to string to avoid scientific notation
            const amountStr = amount.toString();
            
            // Split by decimal point
            const parts = amountStr.split('.');
            const integerPart = parts[0] || '0';
            let decimalPart = parts[1] || '';
            
            // Pad or truncate decimal part to 18 digits
            if (decimalPart.length > 18) {
                decimalPart = decimalPart.substring(0, 18);
            } else {
                decimalPart = decimalPart.padEnd(18, '0');
            }
            
            // Combine and return as string
            const weiStr = integerPart + decimalPart;
            
            // Validate that it's a valid number
            if (!/^\d+$/.test(weiStr)) {
                throw new Error('Invalid number format');
            }
            
            return weiStr;
        } catch (error) {
            console.error('Error converting to wei:', error);
            // Fallback to simple multiplication with proper formatting
            const result = (parseFloat(amount) * Math.pow(10, 18));
            return Math.floor(result).toString();
        }
    }

    // Reset transfer button state
    resetTransferButton(transferBtn, oldText) {
        if (transferBtn) { 
            transferBtn.disabled = false; 
            transferBtn.textContent = oldText || '📤 Execute Transfer';
            transferBtn.style.opacity = '1';
            transferBtn.style.cursor = 'pointer';
        }
    }
}

// Make TransferManager available globally
window.TransferManager = TransferManager; 