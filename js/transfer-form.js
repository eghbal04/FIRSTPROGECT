// TransferManager - Independent token transfer management
// Contract addresses and ABIs
const IAM_ADDRESS_TRANSFER_NEW = '0x2D3923A5ba62B2bec13b9181B1E9AE0ea2C8118D'; // New contract
const DAI_ADDRESS_TRANSFER = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';
const POL_ADDRESS = '0x0000000000000000000000000000000000000000'; // Native MATIC

// Default to new contract
let IAM_ADDRESS_TRANSFER = IAM_ADDRESS_TRANSFER_NEW;

const DAI_ABI_TRANSFER = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
];

const IAM_ABI_TRANSFER = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function getTokenPrice() view returns (uint256)"
];

class TransferManager {
    constructor() {
        console.log('🏗️ Creating TransferManager instance...');
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.daiContract = null;
        this.isRefreshing = false;

        console.log('✅ TransferManager created');
    }





    async connectWallet() {
        try {
            console.log('🔗 Connecting to wallet...');
            
            // Use existing contractConfig if available
            if (window.contractConfig && window.contractConfig.signer) {
                console.log('✅ Using existing wallet connection');
                this.provider = window.contractConfig.provider;
                this.signer = window.contractConfig.signer;
                this.contract = new ethers.Contract(IAM_ADDRESS_TRANSFER, IAM_ABI_TRANSFER, this.signer);
                this.daiContract = new ethers.Contract(DAI_ADDRESS_TRANSFER, DAI_ABI_TRANSFER, this.signer);
                return true;
            }
            
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask not installed');
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Create provider and signer
            if (typeof ethers.providers !== 'undefined' && ethers.providers.Web3Provider) {
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
            } else if (typeof ethers.BrowserProvider !== 'undefined') {
                this.provider = new ethers.BrowserProvider(window.ethereum);
            } else {
                throw new Error('Ethers.js provider not available');
            }
            this.signer = this.provider.getSigner();
            
            // Create contract instances
            this.contract = new ethers.Contract(IAM_ADDRESS_TRANSFER, IAM_ABI_TRANSFER, this.signer);
            this.daiContract = new ethers.Contract(DAI_ADDRESS_TRANSFER, DAI_ABI_TRANSFER, this.signer);
            
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

        // Max button
        const maxBtn = document.getElementById('maxAmountBtn');
        if (maxBtn) {
            maxBtn.addEventListener('click', (e) => {
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
                amountInput.value = parseFloat(value).toFixed(6);
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
        
        if (transferBtn) {
            transferBtn.disabled = true;
            transferBtn.textContent = 'Processing Transfer...';
        }

        const transferToInput = document.getElementById('transferTo');
        const to = transferToInput.getAttribute('data-full-address') || transferToInput.value.trim();
        const amount = parseFloat(document.getElementById('transferAmount').value);
        const token = document.getElementById('transferToken').value;
        const status = document.getElementById('transferStatus');
        
        status.textContent = '';
        status.className = 'transfer-status';
        
        if (!to || !amount || amount <= 0) {
            status.textContent = 'Please enter a valid destination address and amount (minimum 0.000001)';
            status.className = 'transfer-status error';
            if (transferBtn) { transferBtn.disabled = false; transferBtn.textContent = oldText; }
            return;
        }
        
        if (!this.signer) {
            status.textContent = 'Wallet connection not established. Please connect your wallet first.';
            status.className = 'transfer-status error';
            if (transferBtn) { transferBtn.disabled = false; transferBtn.textContent = oldText; }
            return;
        }
        
        try {
            status.textContent = '🚀 Initiating transfer... Please wait while we process your transaction.';
            status.className = 'transfer-status loading';
            
            if (token.toLowerCase() === 'pol') {
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.parseEther) {
                    value = ethers.utils.parseEther(amount.toString());
                } else if (typeof ethers.parseEther !== 'undefined') {
                    value = ethers.parseEther(amount.toString());
                } else {
                    value = (parseFloat(amount) * Math.pow(10, 18)).toString();
                }
                const tx = await this.signer.sendTransaction({
                    to,
                    value: value
                });
                status.textContent = '⏳ MATIC transfer submitted! Waiting for blockchain confirmation...';
                status.className = 'transfer-status loading';
                await tx.wait();
                status.textContent = '🎉 MATIC transfer completed successfully!\nTransaction ID: ' + tx.hash;
                status.className = 'transfer-status success';
            } else if (token.toLowerCase() === 'dai') {
                let parsedAmount;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.parseUnits) {
                    parsedAmount = ethers.utils.parseUnits(amount.toString(), 18);
                } else if (typeof ethers.parseUnits !== 'undefined') {
                    parsedAmount = ethers.parseUnits(amount.toString(), 18);
                } else {
                    parsedAmount = (parseFloat(amount) * Math.pow(10, 18)).toString();
                }
                const tx = await this.daiContract.transfer(to, parsedAmount);
                status.textContent = '⏳ DAI transfer submitted! Waiting for blockchain confirmation...';
                status.className = 'transfer-status loading';
                await tx.wait();
                status.textContent = '🎉 DAI transfer completed successfully!\nTransaction ID: ' + tx.hash;
                status.className = 'transfer-status success';
            } else {
                // IAM Token Transfer
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.parseUnits) {
                    value = ethers.utils.parseUnits(amount.toString(), 18);
                } else if (typeof ethers.parseUnits !== 'undefined') {
                    value = ethers.parseUnits(amount.toString(), 18);
                } else {
                    value = (parseFloat(amount) * Math.pow(10, 18)).toString();
                }
                
                console.log('🔄 IAM Transfer Details:', {
                    to: to,
                    amount: amount,
                    value: value.toString(),
                    contract: this.contract.address
                });
                
                const tx = await this.contract.transfer(to, value);
                status.textContent = '⏳ IAM transfer submitted! Waiting for blockchain confirmation...';
                status.className = 'transfer-status loading';
                await tx.wait();
                status.textContent = '🎉 IAM transfer completed successfully!\nTransaction ID: ' + tx.hash;
                status.className = 'transfer-status success';
            }
            
            transferForm.reset();
            await this.loadTransferData(); // Refresh balances after successful transfer
            
        } catch (error) {
            let msg = error && error.message ? error.message : error;
            if (msg.includes('user rejected')) msg = '❌ Transaction cancelled by user. Please try again when ready.';
            else if (msg.includes('insufficient funds')) msg = '❌ Insufficient balance for gas fees or transfer amount. Please check your wallet balance.';
            else if (msg.includes('insufficient balance')) msg = '❌ Insufficient token balance. Please check your wallet and try again.';
            else if (msg.includes('invalid address')) msg = '❌ Invalid destination address. Please enter a valid wallet address.';
            else if (msg.includes('not allowed') || msg.includes('only owner')) msg = '❌ You are not authorized to perform this operation. Please check your permissions.';
            else if (msg.includes('already transferred') || msg.includes('already exists')) msg = '❌ This transfer has already been completed or is a duplicate. Please check your transaction history.';
            else if (msg.includes('slippage')) msg = '❌ Price difference is too high. Please adjust the amount and try again.';
            else if (msg.includes('price changed')) msg = '❌ Token price has changed. Please refresh and try again.';
            else if (msg.includes('nonce')) msg = '❌ Transaction sequence error. Please try again in a moment.';
            else if (msg.includes('execution reverted')) msg = '❌ Transfer failed. Please check the destination address and amount.';
            else if (msg.includes('network') || msg.includes('connection')) msg = '❌ Network connection error. Please check your internet connection and try again.';
            else if (msg.includes('timeout')) msg = '❌ Transaction timeout. Please try again with higher gas fees.';
            else if (msg.includes('gas')) msg = '❌ Insufficient gas for transaction. Please increase gas limit.';
            else if (msg.includes('revert')) msg = '❌ Transfer failed. Please verify the destination address and try again.';
            else msg = '❌ Transfer error: ' + msg + '. Please try again.';
            
            status.textContent = msg;
            status.className = 'transfer-status error';
        }
        
        if (transferBtn) { 
            transferBtn.disabled = false; 
            transferBtn.textContent = oldText; 
        }
    }
}

// Make TransferManager available globally
window.TransferManager = TransferManager; 