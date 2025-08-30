// swap.js - Professional and principled for DAI ↔ IAM swap

class SwapManager {
    constructor() {
        console.log('🏗️ Creating SwapManager instance...');
        
        this.tokenPrice = null;
        this.userBalances = { dai: 0, IAM: 0 };
        this.isSwapping = false;
        
        console.log('✅ SwapManager created');
        
        // Initial setup removed - now done in index.html
    }
    // Helper: Reading contract DAI balance as numeric (with decimals)
    async getContractDaiBalanceNum() {
        const contract = window.contractConfig?.contract;
        const daiAddress = window.DAI_ADDRESS;
        const daiAbi = window.DAI_ABI;
        if (!contract || !daiAddress || !daiAbi) {
            throw new Error('Contract configuration is incomplete');
        }
        const daiContract = new ethers.Contract(daiAddress, daiAbi, window.contractConfig.signer);
        const daiBalance = await daiContract.balanceOf(contract.target);
        return parseFloat(ethers.formatUnits(daiBalance, 18));
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
            const requiredElements = ['swapForm', 'swapDirection', 'swapAmount', 'maxBtn', 'swapRate', 'swapPreview', 'swapLimitInfo', 'swapStatus'];
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length > 0) {
                console.warn('⚠️ The following elements were not found:', missingElements);
                return;
            }
            
            console.log('✅ All DOM elements exist');
            
            // Setup event listeners
            this.setupEventListeners();
            console.log('✅ Event listeners configured');
            
            // Load data
            await this.loadSwapData();
            console.log('✅ Swap data loaded');
            
            // Update UI
            this.updateSwapRate();
            await this.updateSwapPreview();
            await this.updateSwapLimitInfo();
            this.updateMaxAmount();
            
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
            this.showStatus('Please enter a valid dollar amount', 'error');
            return;
        }
        
        if (!this.tokenPrice || Number(this.tokenPrice) <= 0) {
            this.showStatus('Token price not available', 'error');
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
        
        // Update preview
        this.updateSwapPreview();
        this.showStatus(`✅ Amount ${usdValue} dollars converted to token`, 'success');
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
            this.updateSwapPreview();
        }
    }

    async updateSwapLimitInfo() {
        const infoDiv = document.getElementById('swapLimitInfo');
        if (!infoDiv) {
            console.warn('⚠️ swapLimitInfo element not found');
            return;
        }
        
        const direction = document.getElementById('swapDirection');
        if (!direction) {
            console.warn('⚠️ swapDirection element not found');
            return;
        }
        
        let html = '';
        try {
            console.log('🔄 Loading limit information...');
            
            const contract = window.contractConfig.contract;
            const address = window.contractConfig.address;
            const daiAddress = window.DAI_ADDRESS;
            const daiAbi = window.DAI_ABI;
            
            if (!contract || !address || !daiAddress || !daiAbi) {
                throw new Error('Contract configuration is incomplete');
            }
            
            const daiBalanceNum = await this.getContractDaiBalanceNum();
            
            console.log('📊 Contract DAI balance:', daiBalanceNum);
            
            if (direction.value === 'dai-to-IAM') {
                // Buy limits (according to contract)
                let maxBuy;
                if (daiBalanceNum <= 100000) {
                    maxBuy = 1000;
                } else {
                    maxBuy = daiBalanceNum * 0.01;
                }
                const backingPct = this.getBackingFeePct(daiBalanceNum);
                const userSharePct = 1 - backingPct;
                html += `<div style="background:00000000;padding:12px;border-radius:8px;border-left:4px solidrgb(84, 211, 88);margin-bottom:10px;">
                    <h4 style="margin:0 0 8px 0;color:#2e7d32;">🛒 Buy IAM with DAI</h4>
                    <p style="margin:5px 0;color:#555;"><strong>Minimum purchase:</strong> More than 1 DAI</p>
                    <p style="margin:5px 0;color:#555;"><strong>Current buy limit:</strong> ${maxBuy.toLocaleString('en-US', {maximumFractionDigits:2})} DAI</p>
                    <p style="margin:5px 0;color:#555;"><strong>Purchase fee:</strong> ${(backingPct*100).toFixed(1)}%</p>
                    <ul style="margin:5px 0;padding-left:20px;color:#555;">
                        <li>${(backingPct*100).toFixed(1)}% for contract backing</li>
                    </ul>
                    <p style="margin:5px 0;color:#2e7d32;"><strong>Your share: ${(userSharePct*100).toFixed(1)}% of purchase amount converts to tokens</strong></p>
                </div>`;
            } else if (direction.value === 'IAM-to-dai') {
                const backingPct = this.getBackingFeePct(daiBalanceNum);
                const userSharePct = 1 - backingPct;
                html += `<div style="background:00000000;padding:12px;border-radius:8px;border-left:4px solid #ff9800;margin-bottom:10px;">
                    <h4 style="margin:0 0 8px 0;color:#e65100;">💰 Sell IAM and receive DAI</h4>
                    <p style="margin:5px 0;color:#555;"><strong>Minimum sale:</strong> More than 1 IAM token</p>
                    <p style="margin:5px 0;color:#555;"><strong>Sale fee:</strong> ${(backingPct*100).toFixed(1)}% (from tokens)</p>
                    <ul style="margin:5px 0;padding-left:20px;color:#555;">
                        <li>${(backingPct*100).toFixed(1)}% for contract backing</li>
                    </ul>
                    <p style="margin:5px 0;color:#e65100;"><strong>Your share: ${(userSharePct*100).toFixed(1)}% of tokens convert to DAI</strong></p>
                </div>`;
            }
            
            console.log('✅ Limit information loaded');
            
        } catch (e) {
            console.error('❌ Error loading limit information:', e);
            html = '<div style="background:00000000;padding:12px;border-radius:8px;border-left:4px solid #f44336;color:#c62828;">Loading limit information...</div>';
        }
        
        infoDiv.innerHTML = html;
    }

    // Call updateSwapLimitInfo on direction/amount change
    setupEventListeners() {
        console.log('🔄 Setting up event listeners...');
        
        const swapForm = document.getElementById('swapForm');
        const swapDirection = document.getElementById('swapDirection');
        const swapAmount = document.getElementById('swapAmount');
        const maxBtn = document.getElementById('maxBtn');

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
                this.updateSwapRate();
                await this.updateSwapPreview();
                this.updateMaxAmount();
                await this.updateSwapLimitInfo();
                
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
                await this.updateSwapPreview();
                await this.updateSwapLimitInfo();
                
                // Real-time calculation of dollar equivalent when token amount changes
                this.updateSwapUsdValue();
            });
            console.log('✅ Swap amount event listener connected');
        } else {
            console.warn('⚠️ Swap amount not found');
        }
        
        if (maxBtn) {
            maxBtn.addEventListener('click', async () => {
                console.log('🔢 Max button clicked');
                try {
                    // Check if balances are loaded
                    if (!this.userBalances || (this.userBalances.dai === 0 && this.userBalances.IAM === 0)) {
                        console.log('🔄 Balances not loaded, loading now...');
                        await this.loadSwapData();
                    }
                    
                    await this.setMaxAmount();
                    await this.updateSwapLimitInfo();
                    this.showStatus('✅ Maximum amount set successfully', 'success');
                } catch (error) {
                    console.error('❌ Error in max button click:', error);
                    this.showStatus('Error setting maximum amount', 'error');
                }
            });
            console.log('✅ Max button event listener connected');
        } else {
            console.warn('⚠️ Max button not found');
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
            
            // Check contract connection
            if (!window.contractConfig || !window.contractConfig.contract) {
                console.log('⏳ Waiting for contract connection...');
                // Try to connect
                try {
                    await window.connectWallet();
                } catch (error) {
                    console.warn('⚠️ Could not connect to contract:', error);
                    this.tokenPrice = null;
                    this.updateSwapRate();
                    return;
                }
            }
            
            const contract = window.contractConfig.contract;
            const address = window.contractConfig.address;
            
            if (!address) {
                console.warn('⚠️ Wallet address not available');
                this.tokenPrice = null;
                this.updateSwapRate();
                return;
            }
            
            console.log('✅ Contract connection established');

            // Token price from contract
            const tokenPrice = await contract.getTokenPrice();
            this.tokenPrice = ethers.formatUnits(tokenPrice, 18);
            console.log('✅ Token price received:', this.tokenPrice);

            // IAM balance
            const IAMBalance = await contract.balanceOf(address);
            const IAMBalanceFormatted = ethers.formatUnits(IAMBalance, 18);
            console.log('✅ IAM balance received:', IAMBalanceFormatted);

            // DAI balance
            const daiAddress = window.DAI_ADDRESS;
            const daiAbi = window.DAI_ABI;
            
            if (!daiAddress || !daiAbi) {
                console.error('❌ DAI_ADDRESS or DAI_ABI not defined');
                throw new Error('DAI configuration is incomplete');
            }
            
            const daiContract = new ethers.Contract(daiAddress, daiAbi, window.contractConfig.signer);
            const daiBalance = await daiContract.balanceOf(address);
            const daiBalanceFormatted = ethers.formatUnits(daiBalance, 18);
            console.log('✅ DAI balance received:', daiBalanceFormatted);

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
            
            this.updateSwapRate();
            await this.updateSwapLimitInfo();
            
        } catch (error) {
            console.error('❌ Error loading swap data:', error);
            this.tokenPrice = null;
            this.userBalances = { IAM: 0, dai: 0 };
            this.updateSwapRate();
            this.showStatus('Error loading balances: ' + error.message, 'error');
        }
    }

    updateSwapRate() {
        const rateEl = document.getElementById('swapRate');
        
        if (!rateEl) {
            console.warn('⚠️ swapRate element not found');
            return;
        }
        
        if (this.tokenPrice && Number(this.tokenPrice) > 0) {
            const price = Number(this.tokenPrice);
            rateEl.innerHTML = `<div style="background:00000000;padding:10px;border-radius:6px;text-align:center;margin:10px 0;">
                <strong>💱 Current Exchange Rate:</strong><br>
                1 DAI = ${(1/price).toFixed(6)} IAM<br>
                1 IAM = ${price.toFixed(6)} DAI
            </div>`;
            console.log('✅ Exchange rate updated:', price);
        } else {
            rateEl.innerHTML = '<div style="background:00000000;padding:10px;border-radius:6px;text-align:center;color:#c62828;">Price not available</div>';
            console.warn('⚠️ Token price not available');
        }
    }

    async updateSwapPreview() {
        const amount = document.getElementById('swapAmount');
        const direction = document.getElementById('swapDirection');
        const preview = document.getElementById('swapPreview');
        
        if (!amount || !direction || !preview) {
            console.warn('⚠️ Required elements for preview not found');
            return;
        }
        
        if (!this.tokenPrice || Number(this.tokenPrice) <= 0) {
            preview.innerHTML = '<div style="background:#ffebee;padding:10px;border-radius:6px;text-align:center;color:#c62828;">Price not available</div>';
            return;
        }
        
        const value = parseFloat(amount.value) || 0;
        let result = 0;
        let previewHtml = '';
        
        console.log('📊 Calculating preview:', {
            direction: direction.value,
            amount: value,
            tokenPrice: this.tokenPrice
        });
        
        if (direction.value === 'dai-to-IAM') {
            result = value / Number(this.tokenPrice);
            // Dynamic fee based on contract DAI balance (no developer fee)
            const daiBalanceNum = await this.getContractDaiBalanceNum();
            const backingPct = this.getBackingFeePct(daiBalanceNum);
            const fees = value * backingPct;
            const netAmount = value - fees;
            const netTokens = netAmount / Number(this.tokenPrice);
            
            previewHtml = `<div style=\"background:00000000;padding:12px;border-radius:6px;margin:10px 0;\">
                <h4 style=\"margin:0 0 8px 0;color:#2e7d32;\">📊 Purchase Preview</h4>
                <p style=\"margin:5px 0;color:#555;\"><strong>Input Amount:</strong> ${value.toFixed(2)} DAI</p>
                <p style=\"margin:5px 0;color:#555;\"><strong>Fee (${(backingPct*100).toFixed(1)}%):</strong> ${fees.toFixed(2)} DAI</p>
                <p style=\"margin:5px 0;color:#555;\"><strong>Net Amount:</strong> ${netAmount.toFixed(2)} DAI</p>
                <p style=\"margin:5px 0;color:#2e7d32;\"><strong>Tokens Received:</strong> ${netTokens.toFixed(6)} IAM</p>
            </div>`;
        } else if (direction.value === 'IAM-to-dai') {
            result = value * Number(this.tokenPrice);
            // Dynamic fee based on contract DAI balance (no developer fee)
            const daiBalanceNum = await this.getContractDaiBalanceNum();
            const backingPct = this.getBackingFeePct(daiBalanceNum);
            const fees = result * backingPct;
            const netDai = result - fees;
            
            previewHtml = `<div style=\"background:#fff3e0;padding:12px;border-radius:6px;margin:10px 0;\">
                <h4 style=\"margin:0 0 8px 0;color:#e65100;\">📊 Sale Preview</h4>
                <p style=\"margin:5px 0;color:#555;\"><strong>Input Tokens:</strong> ${value.toFixed(6)} IAM</p>
                <p style=\"margin:5px 0;color:#555;\"><strong>Total Value:</strong> ${result.toFixed(6)} DAI</p>
                <p style=\"margin:5px 0;color:#555;\"><strong>Fee (${(backingPct*100).toFixed(1)}%):</strong> ${fees.toFixed(6)} DAI</p>
                <p style=\"margin:5px 0;color:#e65100;\"><strong>DAI Received:</strong> ${netDai.toFixed(6)} DAI</p>
            </div>`;
        }
        
        preview.innerHTML = previewHtml;
        console.log('✅ Preview updated');
    }

    updateMaxAmount() {
        const direction = document.getElementById('swapDirection');
        const amount = document.getElementById('swapAmount');
        
        if (!direction || !amount) {
            console.warn('⚠️ Required elements for updateMaxAmount not found');
            return;
        }
        
            if (direction.value === 'dai-to-IAM') {
        // Always calculate one cent less for maximum DAI amount
        const maxDai = Math.max(0, this.userBalances.dai - 0.01);
        amount.max = maxDai;
        console.log('✅ Maximum DAI amount set (1 cent less):', maxDai);
                 } else if (direction.value === 'IAM-to-dai') {
             // Maximum sale based on pool liquidity and dynamic fee
             amount.max = '';
             (async () => {
                 try {
                     const daiContractBalance = await this.getContractDaiBalanceNum();
                     const price = Number(this.tokenPrice) || 0;
                     if (!price) {
                         amount.max = this.userBalances.IAM;
                         return;
                     }
                     const backingPct = this.getBackingFeePct(daiContractBalance);
                     const maxByLiquidity = (daiContractBalance / price) / (1 - backingPct);
                     
                     // Helper function to round down
                     const floorToDecimals = (val, decimals) => {
                         const m = Math.pow(10, decimals);
                         const floored = Math.floor(Number(val) * m) / m;
                         // Always one smallest unit less
                         const smallestUnit = 1 / m;
                         return Math.max(0, floored - smallestUnit);
                     };
                     
                     // Choose minimum between user balance and liquidity
                     let finalMax = Math.min(this.userBalances.IAM, maxByLiquidity);
                     
                     // Ensure amount is at least 1 IAM
                     if (finalMax < 1) {
                         finalMax = Math.min(this.userBalances.IAM, 1);
                     }
                     
                     // Always one smallest unit less (0.000001) and one cent worth less
                     const safeMax = floorToDecimals(finalMax, 6);
                     const oneCentWorth = 0.01 / price; // Convert 1 cent to IAM tokens
                     const finalSafeMax = Math.max(0, safeMax - oneCentWorth);
                     amount.max = finalSafeMax;
                     console.log('✅ Maximum IAM amount set (1 cent worth less):', finalSafeMax);
                } catch (e) {
                    console.warn('⚠️ Error calculating maximum sale:', e);
                    // In case of error, use user balance
                    amount.max = this.userBalances.IAM;
                }
            })();
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
                    this.showStatus('No DAI balance available', 'error');
                    return;
                }
                
                // Simple approach: use 95% of available balance
                let maxAmount = this.userBalances.dai * 0.95;
                maxAmount = floorToDecimals(maxAmount, 2);
                maxAmount = Math.max(0.01, maxAmount); // Minimum 0.01 DAI
                
                amount.value = maxAmount.toFixed(2);
                
                console.log('✅ Maximum DAI amount set:', {
                    userBalance: this.userBalances.dai.toFixed(2),
                    maxAmount: maxAmount.toFixed(2)
                });
                
            } else if (direction.value === 'IAM-to-dai') {
                // For IAM to DAI (selling IAM)
                if (this.userBalances.IAM <= 0) {
                    console.warn('⚠️ No IAM balance available');
                    this.showStatus('No IAM balance available', 'error');
                    return;
                }
                
                // Simple approach: use 95% of available balance
                let maxIAM = this.userBalances.IAM * 0.95;
                maxIAM = floorToDecimals(maxIAM, 6);
                maxIAM = Math.max(0.000001, maxIAM); // Minimum 0.000001 IAM
                
                amount.value = maxIAM.toFixed(6);
                
                console.log('✅ Maximum IAM amount set:', {
                    userBalance: this.userBalances.IAM.toFixed(6),
                    maxAmount: maxIAM.toFixed(6)
                });
            }
            
            // Update preview after setting amount
            await this.updateSwapPreview();
            console.log('✅ Preview updated after setting maximum amount');
            
        } catch (error) {
            console.error('❌ Error setting maximum amount:', error);
            this.showStatus('Error setting maximum amount: ' + error.message, 'error');
            
            // Fallback: set to 90% of balance
            try {
                if (direction.value === 'dai-to-IAM' && this.userBalances.dai > 0) {
                    const fallbackMax = Math.max(0.01, this.userBalances.dai * 0.9);
                    amount.value = fallbackMax.toFixed(2);
                } else if (direction.value === 'IAM-to-dai' && this.userBalances.IAM > 0) {
                    const fallbackMax = Math.max(0.000001, this.userBalances.IAM * 0.9);
                    amount.value = fallbackMax.toFixed(6);
                }
                await this.updateSwapPreview();
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
        
        if (error.code === 4001) return 'Cancelled by user';
        if (error.message && error.message.includes('insufficient funds')) return 'Insufficient balance';
        if (error.message && error.message.includes('exceeds buy limit')) return 'Amount exceeds buy limit';
        if (error.message && error.message.includes('exceeds sell limit')) return 'Amount exceeds sell limit';
        if (error.message && error.message.includes('minimum')) return 'Amount is less than minimum allowed';
        if (error.message && error.message.includes('allowance')) return 'Please approve DAI allowance first';
        if (error.message && error.message.includes('cooldown')) return 'Please wait a moment and try again';
        if (error.message && error.message.includes('user rejected')) return 'User rejected the transaction';
        if (error.message && error.message.includes('network')) return 'Network error - please check your internet connection';
        if (error.message && error.message.includes('timeout')) return 'Timeout error - please try again';
        
        return error.message || 'Unknown error';
    }

    showStatus(message, type = 'info', txHash = null) {
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
        
        // Scroll to message
        statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
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
            
            console.log('📊 Swap information:', {
                direction: direction.value,
                amount: value,
                userBalances: this.userBalances
            });
            
            // Check balance
            if (direction.value === 'dai-to-IAM' && value > this.userBalances.dai) {
                throw new Error(`Insufficient DAI balance. Your balance: ${this.userBalances.dai.toFixed(6)} DAI`);
            }
            if (direction.value === 'IAM-to-dai' && value > this.userBalances.IAM) {
                throw new Error(`Insufficient IAM balance. Your balance: ${this.userBalances.IAM.toFixed(6)} IAM`);
            }

            // Validation according to contract
            if (direction.value === 'dai-to-IAM') {
                if (value <= 1) throw new Error('Minimum purchase is more than 1 DAI');
                // Dynamic buy limit
                const daiContractBalance = await this.getContractDaiBalanceNum();
                const maxBuy = (daiContractBalance <= 100000) ? 1000 : (daiContractBalance * 0.01);
                if (value > maxBuy) throw new Error(`Amount exceeds buy limit (maximum allowed: ${maxBuy.toFixed(2)} DAI)`);
            } else if (direction.value === 'IAM-to-dai') {
                if (value <= 1) throw new Error('Minimum sale is more than 1 IAM');
                // Check DAI pool liquidity according to contract
                const daiContractBalance = await this.getContractDaiBalanceNum();
                const price = Number(this.tokenPrice);
                if (!price || price <= 0) {
                    throw new Error('Token price not available');
                }
                const backingPct = this.getBackingFeePct(daiContractBalance);
                const maxIAMByLiquidity = (daiContractBalance / price) / (1 - backingPct);
                
                // Check that amount doesn't exceed maximum allowed
                if (value > maxIAMByLiquidity) {
                    throw new Error(`Amount exceeds maximum allowed sale (maximum allowed: ${maxIAMByLiquidity.toFixed(6)} IAM)`);
                }
                
                // Check DAI liquidity
                const netDai = value * price * (1 - backingPct);
                if (netDai > daiContractBalance) {
                    throw new Error(`Insufficient DAI liquidity. Maximum allowed sale ≈ ${maxIAMByLiquidity.toFixed(6)} IAM`);
                }
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
            
            this.showStatus('✅ Conversion completed successfully!', 'success');
            await this.refreshSwapData();
            amount.value = '';
            await this.updateSwapPreview();
            
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
            const contract = window.contractConfig.contract;
            const signer = window.contractConfig.signer;
            const address = window.contractConfig.address;
            const daiAddress = window.DAI_ADDRESS;
            const daiAbi = window.DAI_ABI;
            
            if (!contract || !signer || !address) {
                throw new Error('Contract connection not established');
            }
            
            if (!daiAddress || !daiAbi) {
                throw new Error('DAI configuration is incomplete');
            }
            
            const daiContract = new ethers.Contract(daiAddress, daiAbi, signer);
            const daiAmountWei = ethers.parseUnits(daiAmount.toString(), 18);
            
            console.log('🔍 Checking allowance...');
            // Check allowance
            const allowance = await daiContract.allowance(address, contract.target);
            console.log('📊 Current allowance:', ethers.formatUnits(allowance, 18));
            
            if (allowance < daiAmountWei) {
                console.log('🔐 Need to approve DAI allowance...');
                this.showStatus('🔐 Approving DAI allowance...', 'loading');
                
                const approveTx = await daiContract.approve(contract.target, ethers.MaxUint256);
                this.showStatus('⏳ Waiting for DAI allowance approval...', 'loading', approveTx.hash);
                
                console.log('⏳ Waiting for approve confirmation...');
                await approveTx.wait();
                this.showStatus('✅ DAI allowance approved', 'success');
                console.log('✅ Approve confirmed');
            } else {
                console.log('✅ Allowance is sufficient');
            }
            
            // Buy IAM
            console.log('🛒 Starting IAM token purchase...');
            this.showStatus('🛒 Purchasing IAM tokens...', 'loading');
            
            const tx = await contract.buyTokens(daiAmountWei);
            this.showStatus('⏳ Waiting for purchase transaction confirmation...', 'loading', tx.hash);
            
            console.log('⏳ Waiting for purchase transaction confirmation...');
            await tx.wait();
            
            this.showStatus('✅ Purchase successful! IAM tokens added to your wallet', 'success', tx.hash);
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
            const contract = window.contractConfig.contract;
            
            if (!contract) {
                throw new Error('Contract connection not established');
            }
            
            const IAMAmountWei = ethers.parseUnits(IAMAmount.toString(), 18);
            
            console.log('💰 Starting IAM token sale...');
            this.showStatus('💰 Selling IAM tokens...', 'loading');
            
            const tx = await contract.sellTokens(IAMAmountWei);
            this.showStatus('⏳ Waiting for sale transaction confirmation...', 'loading', tx.hash);
            
            console.log('⏳ Waiting for sale transaction confirmation...');
            await tx.wait();
            
            this.showStatus('✅ Sale successful! DAI added to your wallet', 'success', tx.hash);
            console.log('✅ Sale completed successfully');
            
        } catch (error) {
            console.error('❌ Error selling IAM:', error);
            throw error;
        }
    }

    async refreshSwapData() {
        console.log('🔄 Refreshing swap data...');
        
        try {
            await this.loadSwapData();
            this.updateSwapRate();
            await this.updateSwapPreview();
            await this.updateSwapLimitInfo();
            
            console.log('✅ Swap data refreshed');
        } catch (error) {
            console.error('❌ Error refreshing swap data:', error);
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
