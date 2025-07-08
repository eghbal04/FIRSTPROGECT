// swap.js - Real token swap functionality connected to contract

class SwapManager {
    constructor() {
        this.initializeSwap();
    }

    initializeSwap() {
        console.log('Swap manager initialized');
        this.setupEventListeners();
        this.loadSwapData();
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
            swapDirection.addEventListener('change', () => {
                this.updateSwapRate();
                this.updateSwapPreview();
                this.updateMaxAmount();
            });
        }

        if (swapAmount) {
            swapAmount.addEventListener('input', () => this.updateSwapPreview());
        }

        if (maxBtn) {
            maxBtn.addEventListener('click', () => this.setMaxAmount());
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
            this.tokenPrice = parseFloat(ethers.formatEther(tokenPrice));
            console.log('Token price from contract:', this.tokenPrice);

            // Get POL (MATIC) balance
            const polBalance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [address, 'latest']
            });
            const polBalanceFormatted = (parseInt(polBalance, 16) / 1e18).toFixed(4);

            // Get CPA balance
            const cpaBalance = await contract.balanceOf(address);
            const cpaBalanceFormatted = (parseInt(cpaBalance) / 1e18).toFixed(4);

            // Update UI
            const polBalanceEl = document.getElementById('polBalance');
            const cpaBalanceEl = document.getElementById('cpaBalance');

            if (polBalanceEl) polBalanceEl.textContent = `${polBalanceFormatted} POL`;
            if (cpaBalanceEl) cpaBalanceEl.textContent = `${cpaBalanceFormatted} CPA`;

            // Store balances for max button
            this.userBalances = {
                pol: parseFloat(polBalanceFormatted),
                cpa: parseFloat(cpaBalanceFormatted)
            };

            // Update rate display
            this.updateSwapRate();

        } catch (error) {
            console.error('Error loading swap data:', error);
            // Fallback to default rate if contract call fails
            this.tokenPrice = 0.0012; // Default fallback price
            this.updateSwapRate();
        }
    }

    updateSwapRate() {
        const direction = document.getElementById('swapDirection');
        const rateDisplay = document.getElementById('swapRate');
        
        if (direction && rateDisplay && this.tokenPrice) {
            if (direction.value === 'pol-to-cpa') {
                const tokensPerPol = 1 / this.tokenPrice;
                rateDisplay.textContent = `نرخ تبدیل: 1 POL = ${tokensPerPol.toFixed(2)} CPA`;
            } else {
                const polPerToken = this.tokenPrice;
                rateDisplay.textContent = `نرخ تبدیل: 1 CPA = ${polPerToken.toFixed(6)} POL`;
            }
        } else if (rateDisplay) {
            rateDisplay.textContent = 'در حال بارگذاری نرخ تبدیل...';
        }
    }

    updateSwapPreview() {
        const amount = document.getElementById('swapAmount');
        const direction = document.getElementById('swapDirection');
        const preview = document.getElementById('swapPreview');
        
        if (amount && direction && preview && this.tokenPrice) {
            const value = parseFloat(amount.value) || 0;
            let result = 0;
            
            if (direction.value === 'pol-to-cpa') {
                result = value / this.tokenPrice;
                preview.textContent = `${value} POL = ${result.toFixed(4)} CPA`;
            } else {
                result = value * this.tokenPrice;
                preview.textContent = `${value} CPA = ${result.toFixed(6)} POL`;
            }
        }
    }

    updateMaxAmount() {
        const direction = document.getElementById('swapDirection');
        const maxBtn = document.getElementById('maxBtn');
        
        if (direction && maxBtn && this.userBalances) {
            if (direction.value === 'pol-to-cpa') {
                maxBtn.textContent = `حداکثر (${this.userBalances.pol} POL)`;
            } else {
                maxBtn.textContent = `حداکثر (${this.userBalances.cpa} CPA)`;
            }
        }
    }

    setMaxAmount() {
        const amount = document.getElementById('swapAmount');
        const direction = document.getElementById('swapDirection');
        
        if (amount && direction && this.userBalances) {
            if (direction.value === 'pol-to-cpa') {
                amount.value = this.userBalances.pol.toString();
            } else {
                amount.value = this.userBalances.cpa.toString();
            }
            this.updateSwapPreview();
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

        // Check if user has sufficient balance
        if (direction.value === 'pol-to-cpa' && this.userBalances && value > this.userBalances.pol) {
            this.showStatus('موجودی POL کافی نیست', 'error');
            return;
        } else if (direction.value === 'cpa-to-pol' && this.userBalances && value > this.userBalances.cpa) {
            this.showStatus('موجودی CPA کافی نیست', 'error');
            return;
        }

        this.showStatus('در حال پردازش تراکنش...', 'loading');

        try {
            if (direction.value === 'pol-to-cpa') {
                await this.buyTokens(value);
            } else {
                await this.sellTokens(value);
            }
            
            this.showStatus('تبدیل با موفقیت انجام شد!', 'success');
            
            // Clear form and refresh balances
            amount.value = '';
            this.updateSwapPreview();
            await this.loadSwapData();
            
        } catch (error) {
            console.error('Swap error:', error);
            const userFriendlyMessage = this.getErrorMessage(error);
            this.showStatus(userFriendlyMessage, 'error');
        }
    }

    async buyTokens(maticAmount) {
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('کنترکت متصل نیست');
        }

        const contract = window.contractConfig.contract;
        const maticWei = ethers.parseEther(maticAmount.toString());

        console.log(`Buying tokens with ${maticAmount} MATIC (${maticWei} wei)`);
        
        const tx = await contract.buyTokens({ value: maticWei });
        console.log('Buy transaction hash:', tx.hash);
        
        await tx.wait();
        console.log('Buy transaction confirmed');
        
        return tx;
    }

    async sellTokens(tokenAmount) {
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('کنترکت متصل نیست');
        }

        const contract = window.contractConfig.contract;
        const tokenWei = ethers.parseEther(tokenAmount.toString());

        console.log(`Selling ${tokenAmount} tokens (${tokenWei} wei)`);
        
        try {
            // First approve the contract to spend tokens
            const approveTx = await contract.approve(contract.target, tokenWei);
            await approveTx.wait();
            console.log('Approve transaction confirmed');
            
            // Then sell tokens
            const tx = await contract.sellTokens(tokenWei);
            console.log('Sell transaction hash:', tx.hash);
            
            await tx.wait();
            console.log('Sell transaction confirmed');
            
            return tx;
        } catch (error) {
            // اگر خطا در approve بود، پیام مناسب نمایش دهیم
            if (error.message.includes('ERC20InsufficientAllowance') || 
                error.message.includes('transfer amount exceeds allowance')) {
                throw new Error('خطا در اجازه خرج کردن توکن. لطفاً دوباره تلاش کنید');
            }
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
        this.updateSwapPreview();
    }
}

// Initialize swap when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.swapManager = new SwapManager();
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