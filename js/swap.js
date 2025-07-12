// swap.js - Contract-based token swap functionality

class SwapManager {
    constructor() {
        this.initializeSwap();
    }

    async initializeSwap() {
        console.log('Swap manager initialized');
        this.setupEventListeners();
        await this.loadSwapData();
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
            const cpaBalanceEl = document.getElementById('cpaBalance');

            if (cpaBalanceEl) cpaBalanceEl.textContent = `${cpaBalanceFormatted} CPA`;

            // Store balances for max button
            this.userBalances = {
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
                if (direction.value === 'usdc-to-cpa') {
                    const cpaPerUsdc = 1 / this.tokenPrice;
                    rateDisplay.textContent = `نرخ تبدیل: 1 USDC = ${cpaPerUsdc.toFixed(6)} CPA`;
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
            
            if (direction.value === 'usdc-to-cpa') {
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
            if (direction.value === 'usdc-to-cpa') {
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
            if (direction.value === 'usdc-to-cpa') {
                amount.value = this.userBalances.usdc.toString();
            } else if (direction.value === 'cpa-to-usdc') {
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
        
        try {
            const amount = document.getElementById('swapAmount');
            const direction = document.getElementById('swapDirection');
            
            if (!amount || !direction) {
                this.showStatus('خطا در بارگذاری فرم', 'error');
                return;
            }
            
            const value = parseFloat(amount.value);
            if (isNaN(value) || value <= 0) {
                this.showStatus('لطفاً مقدار معتبر وارد کنید', 'error');
                return;
            }
            
            // بررسی موجودی
            if (direction.value === 'usdc-to-cpa' && this.userBalances && value > this.userBalances.usdc) {
                this.showStatus('موجودی USDC کافی نیست', 'error');
                return;
            } else if (direction.value === 'cpa-to-usdc' && this.userBalances && value > this.userBalances.cpa) {
                this.showStatus('موجودی CPA کافی نیست', 'error');
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
                }
                this.showStatus('تبدیل با موفقیت انجام شد!', 'success');
                await this.refreshSwapData();
            } catch (error) {
                console.error('Swap error:', error);
                this.showStatus(this.getErrorMessage(error), 'error');
            }
        } catch (error) {
            console.error('Handle swap error:', error);
            this.showStatus('خطا در پردازش درخواست', 'error');
        }
    }

    async buyTokensWithUSDC(usdcAmount) {
        try {
            const contract = window.contractConfig.contract;
            const signer = window.contractConfig.signer;
            
            // تبدیل USDC به Wei (6 رقم اعشار)
            const usdcAmountWei = ethers.parseUnits(usdcAmount.toString(), 6);
            
            // تنظیم مجوز برای USDC
            const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
            const USDC_ABI = [
                "function approve(address spender, uint256 amount) public returns (bool)",
                "function allowance(address owner, address spender) public view returns (uint256)"
            ];
            
            const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
            
            this.showStatus('در حال تنظیم مجوز انتقال USDC...', 'loading');
            const approveTx = await usdcContract.approve(contract.target, usdcAmountWei);
            await approveTx.wait();
            
            this.showStatus('در حال خرید توکن...', 'loading');
            const tx = await contract.buyTokens(usdcAmountWei);
            await tx.wait();
            
            console.log('Buy tokens transaction successful');
        } catch (error) {
            console.error('Buy tokens error:', error);
            throw error;
        }
    }

    async sellTokensForUSDC(cpaAmount) {
        try {
            const contract = window.contractConfig.contract;
            
            // تبدیل CPA به Wei (18 رقم اعشار)
            const cpaAmountWei = ethers.parseUnits(cpaAmount.toString(), 18);
            
            this.showStatus('در حال فروش توکن...', 'loading');
            const tx = await contract.sellTokens(cpaAmountWei);
            await tx.wait();
            
            console.log('Sell tokens transaction successful');
        } catch (error) {
            console.error('Sell tokens error:', error);
            throw error;
        }
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