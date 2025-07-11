// swap.js - Real token swap functionality connected to contract

class SwapManager {
    constructor() {
        this.initializeSwap();
    }

    async initializeSwap() {
        console.log('Swap manager initialized');
        this.setupEventListeners();
        await this.loadSwapData();
        
        // تست اتصال به 1inch API
        setTimeout(async () => {
            const is1inchConnected = await this.test1inchConnection();
            if (is1inchConnected) {
                console.log('✅ 1inch API connection successful');
            } else {
                console.log('❌ 1inch API connection failed, testing 0x...');
                const is0xConnected = await this.test0xConnection();
                if (is0xConnected) {
                    console.log('✅ 0x API connection successful (fallback)');
                } else {
                    console.log('❌ Both 1inch and 0x API connections failed');
                }
            }
        }, 2000);
    }

    setupEventListeners() {
        const swapForm = document.getElementById('swapForm');
        const swapDirection = document.getElementById('swapDirection');
        const swapAmount = document.getElementById('swapAmount');
        const maxBtn = document.getElementById('maxBtn');

        if (swapForm) {
            swapForm.addEventListener('submit', (e) => this.handleSwap(e));
        }

        if (swapDirection) {
            swapDirection.addEventListener('change', async () => {
                this.updateSwapRate();
                await this.updateSwapPreview();
                this.updateMaxAmount();
            });
        }

        if (swapAmount) {
            swapAmount.addEventListener('input', async () => {
                await this.updateSwapPreview();
            });
        }

        if (maxBtn) {
            maxBtn.addEventListener('click', async () => {
                await this.setMaxAmount();
            });
        }
    }

    async loadSwapData() {
        try {
            if (!window.contractConfig || !window.contractConfig.contract) {
                console.log('Waiting for contract connection...');
                return;
            }

            const contract = window.contractConfig.contract;
            const address = window.contractConfig.address;

            if (!address) {
                console.log('No wallet address available');
                return;
            }

            // Get token price from contract
            const tokenPrice = await contract.getTokenPrice();
            this.tokenPrice = parseFloat(ethers.formatUnits(tokenPrice, 18));
            console.log('Token price from contract (raw):', tokenPrice.toString());
            console.log('Token price from contract (formatted):', this.tokenPrice);
            console.log('Token price with full precision:', ethers.formatUnits(tokenPrice, 18));

            // Get POL (MATIC) balance
            const polBalance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [address, 'latest']
            });
            const polBalanceFormatted = (parseInt(polBalance, 16) / 1e18).toFixed(4);

            // Get CPA balance
            const cpaBalance = await contract.balanceOf(address);
            const cpaBalanceFormatted = (parseInt(cpaBalance) / 1e18).toFixed(4);

            // Get USDC balance
            const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // USDC Polygon Mainnet
            const USDC_ABI = [
                "function balanceOf(address account) view returns (uint256)",
                "function decimals() view returns (uint8)"
            ];
            const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, window.contractConfig.signer);
            const usdcBalance = await usdcContract.balanceOf(address);
            const usdcDecimals = 6;
            const usdcBalanceFormatted = (parseInt(usdcBalance) / 1e6).toFixed(4);
            const usdcBalanceEl = document.getElementById('usdcBalance');
            if (usdcBalanceEl) usdcBalanceEl.textContent = `${usdcBalanceFormatted} USDC`;

            // Update UI
            const polBalanceEl = document.getElementById('polBalance');
            const cpaBalanceEl = document.getElementById('cpaBalance');

            if (polBalanceEl) polBalanceEl.textContent = `${polBalanceFormatted} POL`;
            if (cpaBalanceEl) cpaBalanceEl.textContent = `${cpaBalanceFormatted} CPA`;

            // Store balances for max button
            this.userBalances = {
                pol: parseFloat(polBalanceFormatted),
                cpa: parseFloat(cpaBalanceFormatted),
                usdc: parseFloat(usdcBalanceFormatted)
            };

            // Update rate display
            this.updateSwapRate();

        } catch (error) {
            console.error('Error loading swap data:', error);
            this.tokenPrice = null;
            this.updateSwapRate();
        }
    }

    updateSwapRate() {
        const direction = document.getElementById('swapDirection');
        const rateDisplay = document.getElementById('swapRate');
        
        if (direction && rateDisplay) {
            if (this.tokenPrice && typeof this.tokenPrice === 'number' && !isNaN(this.tokenPrice) && this.tokenPrice > 0) {
                if (direction.value === 'pol-to-cpa') {
                    const tokensPerPol = 1 / this.tokenPrice;
                    rateDisplay.textContent = `نرخ تبدیل: 1 POL = ${tokensPerPol.toFixed(2)} CPA`;
                } else if (direction.value === 'usdc-to-pol') {
                    rateDisplay.textContent = `نرخ تبدیل: بر اساس قیمت بازار (0x API)`;
                } else if (direction.value === 'pol-to-usdc') {
                    rateDisplay.textContent = `نرخ تبدیل: بر اساس قیمت بازار (0x API)`;
                } else if (direction.value === 'usdc-to-cpa') {
                    const cpaPerUsdc = 1 / this.tokenPrice;
                    rateDisplay.textContent = `نرخ تبدیل: 1 USDC = ${cpaPerUsdc.toFixed(2)} CPA`;
                } else if (direction.value === 'cpa-to-usdc') {
                    rateDisplay.textContent = `نرخ تبدیل: 1 CPA = ${this.tokenPrice.toFixed(6)} USDC`;
                } else {
                    rateDisplay.textContent = 'در حال بارگذاری نرخ تبدیل...';
                }
            } else {
                rateDisplay.textContent = 'قیمت در دسترس نیست';
            }
        }
    }

    async updateSwapPreview() {
        const amount = document.getElementById('swapAmount');
        const direction = document.getElementById('swapDirection');
        const preview = document.getElementById('swapPreview');
        
        if (amount && direction && preview && this.tokenPrice && this.tokenPrice > 0) {
            const value = parseFloat(amount.value) || 0;
            let result = 0;
            
            if (direction.value === 'pol-to-cpa') {
                result = value / this.tokenPrice;
                preview.textContent = `${value} POL = ${result.toFixed(4)} CPA`;
            } else if (direction.value === 'usdc-to-pol') {
                if (value > 0) {
                    try {
                        preview.textContent = 'در حال دریافت قیمت از بازار...';
                        let quote;
                        try {
                            // ابتدا از 1inch استفاده کن
                            quote = await this.get1inchPrice('USDC', 'MATIC', value);
                        } catch (error) {
                            console.log('1inch failed, trying 0x...', error);
                            // در صورت خطا از 0x استفاده کن
                            quote = await this.get0xPrice('USDC', 'MATIC', value);
                        }
                        const buyAmount = parseFloat(ethers.formatEther(quote.buyAmount));
                        preview.textContent = `${value} USDC = ${buyAmount.toFixed(6)} POL`;
                    } catch (error) {
                        console.error('Error getting price:', error);
                        preview.textContent = `${value} USDC = بر اساس قیمت بازار (خطا در دریافت)`;
                    }
                } else {
                    preview.textContent = 'مقدار را وارد کنید';
                }
            } else if (direction.value === 'pol-to-usdc') {
                if (value > 0) {
                    try {
                        preview.textContent = 'در حال دریافت قیمت از بازار...';
                        let quote;
                        try {
                            // ابتدا از 1inch استفاده کن
                            quote = await this.get1inchPrice('MATIC', 'USDC', value);
                        } catch (error) {
                            console.log('1inch failed, trying 0x...', error);
                            // در صورت خطا از 0x استفاده کن
                            quote = await this.get0xPrice('MATIC', 'USDC', value);
                        }
                        const buyAmount = parseFloat(ethers.formatUnits(quote.buyAmount, 6));
                        preview.textContent = `${value} POL = ${buyAmount.toFixed(6)} USDC`;
                    } catch (error) {
                        console.error('Error getting price:', error);
                        preview.textContent = `${value} POL = بر اساس قیمت بازار (خطا در دریافت)`;
                    }
                } else {
                    preview.textContent = 'مقدار را وارد کنید';
                }
            } else if (direction.value === 'usdc-to-cpa') {
                result = value / this.tokenPrice;
                preview.textContent = `${value} USDC = ${result.toFixed(6)} CPA`;
            } else if (direction.value === 'cpa-to-usdc') {
                result = value * this.tokenPrice;
                preview.textContent = `${value} CPA = ${result.toFixed(6)} USDC`;
            } else {
                preview.textContent = 'در حال بارگذاری پیش‌نمایش...';
            }
        } else {
            preview.textContent = 'قیمت در دسترس نیست';
        }
    }

    updateMaxAmount() {
        const direction = document.getElementById('swapDirection');
        const maxBtn = document.getElementById('maxBtn');
        
        if (direction && maxBtn && this.userBalances) {
            if (direction.value === 'pol-to-cpa') {
                maxBtn.textContent = `حداکثر (${this.userBalances.pol} POL)`;
            } else if (direction.value === 'usdc-to-pol' || direction.value === 'usdc-to-cpa') {
                maxBtn.textContent = `حداکثر (${this.userBalances.usdc} USDC)`;
            } else {
                maxBtn.textContent = `حداکثر (${this.userBalances.cpa} CPA)`;
            }
        }
    }

    async setMaxAmount() {
        const amount = document.getElementById('swapAmount');
        const direction = document.getElementById('swapDirection');
        
        if (amount && direction && this.userBalances) {
            if (direction.value === 'pol-to-cpa') {
                amount.value = this.userBalances.pol.toString();
            } else if (direction.value === 'usdc-to-pol') {
                amount.value = this.userBalances.usdc.toString();
            } else if (direction.value === 'pol-to-usdc') {
                amount.value = this.userBalances.pol.toString();
            } else if (direction.value === 'usdc-to-cpa') {
                amount.value = this.userBalances.usdc.toString();
            } else if (direction.value === 'cpa-to-usdc') {
                amount.value = this.userBalances.cpa.toString();
            } else {
                amount.value = this.userBalances.cpa.toString();
            }
            await this.updateSwapPreview();
        }
    }

    // تابع تبدیل خطاهای فنی به پیام‌های مفهومی
    getErrorMessage(error) {
        const errorMessage = error.message || error.toString();
        
        // خطاهای مربوط به کیف پول
        if (errorMessage.includes('user rejected') || errorMessage.includes('User denied')) {
            return 'تراکنش توسط کاربر لغو شد';
        }
        
        if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
            return 'موجودی کافی نیست. لطفاً موجودی خود را بررسی کنید';
        }
        
        if (errorMessage.includes('gas required exceeds allowance')) {
            return 'هزینه گاز کافی نیست. لطفاً موجودی POL خود را بررسی کنید';
        }
        
        if (errorMessage.includes('nonce too low')) {
            return 'خطا در شماره تراکنش. لطفاً دوباره تلاش کنید';
        }
        
        // خطاهای مربوط به کنترکت
        if (errorMessage.includes('ERC20InsufficientBalance')) {
            return 'موجودی توکن کافی نیست';
        }
        
        if (errorMessage.includes('ERC20InsufficientAllowance')) {
            return 'اجازه خرج کردن توکن کافی نیست. لطفاً دوباره تلاش کنید';
        }
        
        if (errorMessage.includes('transfer amount exceeds balance')) {
            return 'مقدار انتقال بیشتر از موجودی است';
        }
        
        if (errorMessage.includes('transfer amount exceeds allowance')) {
            return 'مقدار انتقال بیشتر از اجازه داده شده است';
        }
        
        // خطاهای شبکه
        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
            return 'خطا در اتصال شبکه. لطفاً اتصال اینترنت خود را بررسی کنید';
        }
        
        if (errorMessage.includes('timeout') || errorMessage.includes('deadline')) {
            return 'زمان تراکنش به پایان رسید. لطفاً دوباره تلاش کنید';
        }
        
        if (errorMessage.includes('replacement transaction underpriced')) {
            return 'تراکنش جایگزین با قیمت پایین. لطفاً دوباره تلاش کنید';
        }
        
        // خطاهای عمومی
        if (errorMessage.includes('execution reverted')) {
            return 'تراکنش ناموفق بود. لطفاً شرایط را بررسی کنید';
        }
        
        if (errorMessage.includes('invalid signature')) {
            return 'امضای نامعتبر. لطفاً کیف پول خود را بررسی کنید';
        }
        
        if (errorMessage.includes('already known')) {
            return 'این تراکنش قبلاً ارسال شده است';
        }
        
        // خطاهای خاص کنترکت
        if (errorMessage.includes('Swap is not active')) {
            return 'سیستم تبدیل در حال حاضر غیرفعال است';
        }
        
        if (errorMessage.includes('Minimum amount not met')) {
            return 'مقدار وارد شده کمتر از حداقل مجاز است';
        }
        
        if (errorMessage.includes('Maximum amount exceeded')) {
            return 'مقدار وارد شده بیشتر از حداکثر مجاز است';
        }
        
        // اگر خطای خاصی پیدا نشد
        if (errorMessage.includes('contract')) {
            return 'خطا در کنترکت. لطفاً دوباره تلاش کنید';
        }
        
        // خطای پیش‌فرض
        return 'خطا در انجام تراکنش. لطفاً دوباره تلاش کنید';
    }

    async handleSwap(e) {
        e.preventDefault();
        const amount = document.getElementById('swapAmount');
        const direction = document.getElementById('swapDirection');
        const status = document.getElementById('swapStatus');
        if (!amount || !direction || !status) return;
        const value = parseFloat(amount.value);
        if (!value || value <= 0) {
            this.showStatus('لطفاً مقدار معتبر وارد کنید', 'error');
            return;
        }
        // Check balances for each direction
        if (direction.value === 'usdc-to-cpa' && this.userBalances && value > this.userBalances.usdc) {
            this.showStatus('موجودی USDC کافی نیست', 'error');
            return;
        } else if (direction.value === 'cpa-to-usdc' && this.userBalances && value > this.userBalances.cpa) {
            this.showStatus('موجودی CPA کافی نیست', 'error');
            return;
        } else if (direction.value === 'usdc-to-pol' && this.userBalances && value > this.userBalances.usdc) {
            this.showStatus('موجودی USDC کافی نیست', 'error');
            return;
        } else if (direction.value === 'pol-to-usdc' && this.userBalances && value > this.userBalances.pol) {
            this.showStatus('موجودی POL کافی نیست', 'error');
            return;
        }
        this.showStatus('در حال پردازش تراکنش...', 'loading');
        try {
            if (direction.value === 'usdc-to-cpa') {
                // خرید CPA با USDC از طریق کانترکت پروژه
                await this.buyTokensWithUSDC(value);
            } else if (direction.value === 'cpa-to-usdc') {
                // فروش CPA و دریافت USDC از طریق کانترکت پروژه
                await this.sellTokensForUSDC(value);
            } else if (direction.value === 'usdc-to-pol') {
                // سواپ USDC به POL از طریق 1inch API
                try {
                    await this.swapVia1inch('USDC', 'MATIC', value);
                } catch (error) {
                    console.log('1inch swap failed, trying 0x...', error);
                    await this.swapVia0x('USDC', 'MATIC', value);
                }
            } else if (direction.value === 'pol-to-usdc') {
                // سواپ POL به USDC از طریق 1inch API
                try {
                    await this.swapVia1inch('MATIC', 'USDC', value);
                } catch (error) {
                    console.log('1inch swap failed, trying 0x...', error);
                    await this.swapVia0x('MATIC', 'USDC', value);
                }
            }
            this.showStatus('تبدیل با موفقیت انجام شد!', 'success');
            amount.value = '';
            this.updateSwapPreview();
            await this.loadSwapData();
        } catch (error) {
            console.error('Swap error:', error);
            const userFriendlyMessage = this.getErrorMessage(error);
            this.showStatus(userFriendlyMessage, 'error');
        }
    }

    // خرید CPA با USDC از طریق کانترکت پروژه
    async buyTokensWithUSDC(usdcAmount) {
        const contract = window.contractConfig.contract;
        const signer = window.contractConfig.signer;
        const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
        const USDC_ABI = [
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function allowance(address owner, address spender) public view returns (uint256)",
            "function decimals() view returns (uint8)"
        ];
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
        const decimals = 6;
        const amount = ethers.parseUnits(usdcAmount.toString(), decimals);
        
        // Always approve with MaxUint256 to ensure sufficient allowance
        this.showStatus('در حال تنظیم مجوز انتقال...', 'loading');
        const approveTx = await usdcContract.approve(contract.target, ethers.MaxUint256);
        await approveTx.wait();
        
        // Call buyTokens(uint256 usdcAmount)
        this.showStatus('در حال خرید توکن...', 'loading');
        const tx = await contract.buyTokens(amount);
        await tx.wait();
    }

    // فروش CPA و دریافت USDC از طریق کانترکت پروژه
    async sellTokensForUSDC(cpaAmount) {
        const contract = window.contractConfig.contract;
        const signer = window.contractConfig.signer;
        const decimals = 18;
        const amount = ethers.parseUnits(cpaAmount.toString(), decimals);
        
        // Always approve with MaxUint256 to ensure sufficient allowance
        this.showStatus('در حال تنظیم مجوز انتقال...', 'loading');
        const approveTx = await contract.approve(contract.target, ethers.MaxUint256);
        await approveTx.wait();
        
        // Call sellTokens(uint256 tokenAmount)
        this.showStatus('در حال فروش توکن...', 'loading');
        const tx = await contract.sellTokens(amount);
        await tx.wait();
    }

    // دریافت قیمت از 1inch API
    async get1inchPrice(sellToken, buyToken, amount) {
        const userAddress = window.contractConfig.address;
        
        // تعریف آدرس‌های توکن‌ها برای Polygon
        const TOKENS = {
            'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            'MATIC': '0x0000000000000000000000000000000000001010' // آدرس بومی MATIC
        };
        
        let sellAmount;
        if (sellToken === 'MATIC') {
            sellAmount = ethers.parseEther(amount.toString()).toString();
        } else if (sellToken === 'USDC') {
            sellAmount = ethers.parseUnits(amount.toString(), 6).toString();
        } else {
            throw new Error('توکن مبدا نامعتبر است');
        }
        
        // Build 1inch API URL برای دریافت قیمت (API قدیمی)
        const apiUrl = `https://api.1inch.io/v5.0/137/quote?fromTokenAddress=${TOKENS[sellToken]}&toTokenAddress=${TOKENS[buyToken]}&amount=${sellAmount}&fromAddress=${userAddress}&slippage=0.5`;
        
        console.log('Getting 1inch price for:', sellToken, '->', buyToken, 'amount:', amount);
        console.log('1inch API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('1inch API Error Response:', errorText);
            throw new Error(`خطا در دریافت قیمت از 1inch: ${response.status} ${response.statusText}`);
        }
        
        const quote = await response.json();
        console.log('1inch Quote received:', quote);
        
        if (!quote.toTokenAmount) {
            throw new Error('پاسخ نامعتبر از 1inch API - toTokenAmount missing');
        }
        
        return {
            buyAmount: quote.toTokenAmount,
            to: quote.tx?.to,
            data: quote.tx?.data,
            value: quote.tx?.value || '0'
        };
    }
    
    // دریافت قیمت از 0x API (fallback)
    async get0xPrice(sellToken, buyToken, amount) {
        const userAddress = window.contractConfig.address;
        
        // تعریف آدرس‌های توکن‌ها
        const TOKENS = {
            'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            'MATIC': '0x0000000000000000000000000000000000001010' // آدرس بومی MATIC
        };
        
        let sellAmount;
        if (sellToken === 'MATIC') {
            sellAmount = ethers.parseEther(amount.toString()).toString();
        } else if (sellToken === 'USDC') {
            sellAmount = ethers.parseUnits(amount.toString(), 6).toString();
        } else {
            throw new Error('توکن مبدا نامعتبر است');
        }
        
        // Build 0x API URL برای دریافت قیمت
        const apiUrl =
            'https://polygon.api.0x.org/swap/v1/quote?' +
            new URLSearchParams({
                sellToken: TOKENS[sellToken],
                buyToken: TOKENS[buyToken],
                sellAmount,
                takerAddress: userAddress,
                slippagePercentage: '0.5'
            });
        
        console.log('Getting 0x price for:', sellToken, '->', buyToken, 'amount:', amount);
        console.log('0x API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('0x API Error Response:', errorText);
            throw new Error(`خطا در دریافت قیمت از 0x: ${response.status} ${response.statusText}`);
        }
        
        const quote = await response.json();
        console.log('0x Quote received:', quote);
        
        if (!quote.buyAmount) {
            throw new Error('پاسخ نامعتبر از 0x API - buyAmount missing');
        }
        
        return quote;
    }

    // سواپ از طریق 1inch API (USDC <-> POL)
    async swapVia1inch(sellToken, buyToken, amount) {
        const userAddress = window.contractConfig.address;
        
        // تعریف آدرس‌های توکن‌ها برای Polygon
        const TOKENS = {
            'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            'MATIC': '0x0000000000000000000000000000000000001010' // آدرس بومی MATIC
        };
        
        let sellAmount;
        if (sellToken === 'MATIC') {
            sellAmount = ethers.parseEther(amount.toString()).toString();
        } else if (sellToken === 'USDC') {
            sellAmount = ethers.parseUnits(amount.toString(), 6).toString();
        } else {
            throw new Error('توکن مبدا نامعتبر است');
        }
        
        // تنظیم مجوز برای USDC
        if (sellToken === 'USDC') {
            const USDC_ABI = [
                "function approve(address spender, uint256 amount) public returns (bool)",
                "function allowance(address owner, address spender) public view returns (uint256)",
                "function decimals() view returns (uint8)"
            ];
            const signer = window.contractConfig.signer;
            const usdcContract = new ethers.Contract(TOKENS.USDC, USDC_ABI, signer);
            
            this.showStatus('در حال تنظیم مجوز انتقال USDC...', 'loading');
            const approveTx = await usdcContract.approve('0x1111111254fb6c44bAC0beD2854e76F90643097d', ethers.MaxUint256);
            await approveTx.wait();
        }
        
        // Build 1inch API URL (API قدیمی)
        const apiUrl = `https://api.1inch.io/v5.0/137/swap?fromTokenAddress=${TOKENS[sellToken]}&toTokenAddress=${TOKENS[buyToken]}&amount=${sellAmount}&fromAddress=${userAddress}&slippage=0.5`;
        
        console.log('1inch API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('1inch API Error:', errorText);
            throw new Error(`خطا در دریافت قیمت از 1inch: ${response.status} ${response.statusText}`);
        }
        
        const quote = await response.json();
        console.log('1inch Quote:', quote);
        
        if (!quote.tx?.to || !quote.tx?.data) {
            throw new Error('پاسخ نامعتبر از 1inch API');
        }
        
        // ارسال تراکنش سواپ
        const txParams = {
            to: quote.tx.to,
            data: quote.tx.data,
            gasLimit: 500000 // تنظیم gas limit
        };
        
        if (quote.tx.value && quote.tx.value !== '0' && quote.tx.value !== 0) {
            txParams.value = BigInt(quote.tx.value);
        }
        
        this.showStatus('در حال ارسال تراکنش سواپ...', 'loading');
        const tx = await window.contractConfig.signer.sendTransaction(txParams);
        await tx.wait();
    }
    
    // سواپ از طریق 0x API (fallback)
    async swapVia0x(sellToken, buyToken, amount) {
        const userAddress = window.contractConfig.address;
        
        // تعریف آدرس‌های توکن‌ها
        const TOKENS = {
            'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            'MATIC': '0x0000000000000000000000000000000000001010' // آدرس بومی MATIC
        };
        
        let sellAmount;
        if (sellToken === 'MATIC') {
            sellAmount = ethers.parseEther(amount.toString()).toString();
        } else if (sellToken === 'USDC') {
            sellAmount = ethers.parseUnits(amount.toString(), 6).toString();
        } else {
            throw new Error('توکن مبدا نامعتبر است');
        }
        
        // تنظیم مجوز برای USDC
        if (sellToken === 'USDC') {
            const USDC_ABI = [
                "function approve(address spender, uint256 amount) public returns (bool)",
                "function allowance(address owner, address spender) public view returns (uint256)",
                "function decimals() view returns (uint8)"
            ];
            const signer = window.contractConfig.signer;
            const usdcContract = new ethers.Contract(TOKENS.USDC, USDC_ABI, signer);
            
            this.showStatus('در حال تنظیم مجوز انتقال USDC...', 'loading');
            const approveTx = await usdcContract.approve('0xdef1c0ded9bec7f1a1670819833240f027b25eff', ethers.MaxUint256);
            await approveTx.wait();
        }
        
        // Build 0x API URL با آدرس‌های صحیح
        const apiUrl =
            'https://polygon.api.0x.org/swap/v1/quote?' +
            new URLSearchParams({
                sellToken: TOKENS[sellToken],
                buyToken: TOKENS[buyToken],
                sellAmount,
                takerAddress: userAddress,
                slippagePercentage: '0.5' // 0.5% slippage
            });
        
        console.log('0x API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('0x API Error:', errorText);
            throw new Error(`خطا در دریافت قیمت از 0x: ${response.status} ${response.statusText}`);
        }
        
        const quote = await response.json();
        console.log('0x Quote:', quote);
        
        if (!quote.to || !quote.data) {
            throw new Error('پاسخ نامعتبر از 0x API');
        }
        
        // ارسال تراکنش سواپ
        const txParams = {
            to: quote.to,
            data: quote.data,
            gasLimit: 500000 // تنظیم gas limit
        };
        
        if (quote.value && quote.value !== '0' && quote.value !== 0) {
            txParams.value = BigInt(quote.value);
        }
        
        this.showStatus('در حال ارسال تراکنش سواپ...', 'loading');
        const tx = await window.contractConfig.signer.sendTransaction(txParams);
        await tx.wait();
    }

    showStatus(message, type) {
        const status = document.getElementById('swapStatus');
        if (!status) return;

        status.textContent = message;
        status.className = `swap-status ${type}`;

        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                status.textContent = '';
                status.className = 'swap-status';
            }, 8000); // افزایش زمان نمایش خطاها
        }
    }

    // Public method to refresh swap data
    async refreshSwapData() {
        await this.loadSwapData();
        await this.updateSwapPreview();
    }
    
    // تابع تست اتصال به 1inch API
    async test1inchConnection() {
        try {
            console.log('Testing 1inch API connection...');
            const testQuote = await this.get1inchPrice('USDC', 'MATIC', 1);
            console.log('1inch API test successful:', testQuote);
            return true;
        } catch (error) {
            console.error('1inch API test failed:', error);
            return false;
        }
    }
    
    // تابع تست اتصال به 0x API (fallback)
    async test0xConnection() {
        try {
            console.log('Testing 0x API connection...');
            const testQuote = await this.get0xPrice('USDC', 'MATIC', 1);
            console.log('0x API test successful:', testQuote);
            return true;
        } catch (error) {
            console.error('0x API test failed:', error);
            return false;
        }
    }
}

// Initialize swap when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    window.swapManager = new SwapManager();
    await window.swapManager.initializeSwap();
});

// Refresh balances when wallet connects
if (window.connectWallet) {
    const originalConnectWallet = window.connectWallet;
    window.connectWallet = async function() {
        const result = await originalConnectWallet();
        
        // Refresh swap data after wallet connection
        setTimeout(async () => {
            if (window.swapManager) {
                await window.swapManager.refreshSwapData();
            }
        }, 1000);
        
        return result;
    };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwapManager;
} 