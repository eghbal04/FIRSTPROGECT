// swap.js - اصولی و حرفه‌ای برای سواپ USDC ↔ CPA

class SwapManager {
    constructor() {
        this.tokenPrice = null;
        this.userBalances = { usdc: 0, cpa: 0 };
        this.isSwapping = false;
        this.initializeSwap();
    }

    async initializeSwap() {
        this.setupEventListeners();
        await this.loadSwapData();
    }

    async updateSwapLimitInfo() {
        const infoDiv = document.getElementById('swapLimitInfo');
        if (!infoDiv) return;
        const direction = document.getElementById('swapDirection');
        if (!direction) return;
        let html = '';
        try {
            const contract = window.contractConfig.contract;
            const address = window.contractConfig.address;
            const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
            const USDC_ABI = ["function balanceOf(address) view returns (uint256)"];
            const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, window.contractConfig.signer);
            const usdcBalance = await usdcContract.balanceOf(contract.target);
            const usdcBalanceNum = parseFloat(ethers.formatUnits(usdcBalance, 6));
            if (direction.value === 'usdc-to-cpa') {
                // Buy limits
                let maxBuy;
                if (usdcBalanceNum <= 100000) {
                    maxBuy = 1000;
                } else {
                    maxBuy = usdcBalanceNum * 0.01;
                }
                html += `حداقل خرید: ۱ USDC`;
                html += `<br>سقف خرید فعلی: ${maxBuy.toLocaleString('en-US', {maximumFractionDigits:2})} USDC`;
                html += `<br>کارمزد خرید: ۲٪ (۰.۵٪ توسعه‌دهنده، ۰.۵٪ معرف، ۱٪ پشتوانه)`;
                html += `<br>سهم شما: ۹۸٪ از مبلغ خرید به توکن تبدیل می‌شود.`;
            } else if (direction.value === 'cpa-to-usdc') {
                // Sell limits
                const totalSupply = await contract.totalSupply();
                const totalSupplyNum = parseFloat(ethers.formatUnits(totalSupply, 18));
                let maxSell;
                if (usdcBalanceNum >= 500) {
                    maxSell = totalSupplyNum * 0.01;
                } else {
                    maxSell = totalSupplyNum * 0.5;
                }
                html += `حداقل فروش: ۱ توکن`;
                html += `<br>سقف فروش فعلی: ${maxSell.toLocaleString('en-US', {maximumFractionDigits:2})} توکن`;
                html += `<br>کارمزد فروش: ۲٪ (۰.۵٪ توسعه‌دهنده، ۰.۵٪ معرف، ۱٪ پشتوانه)`;
                html += `<br>سهم شما: ۹۸٪ از مقدار فروش به USDC تبدیل می‌شود.`;
            }
        } catch (e) {
            html = 'در حال دریافت اطلاعات محدودیت‌ها...';
        }
        infoDiv.innerHTML = html;
    }

    // Call updateSwapLimitInfo on direction/amount change
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
                await this.updateSwapLimitInfo();
            });
        }
        if (swapAmount) {
            swapAmount.addEventListener('input', async () => {
                await this.updateSwapPreview();
                await this.updateSwapLimitInfo();
            });
        }
        if (maxBtn) {
            maxBtn.addEventListener('click', async () => {
                await this.setMaxAmount();
                await this.updateSwapLimitInfo();
            });
        }
    }

    async loadSwapData() {
        try {
            if (!window.contractConfig || !window.contractConfig.contract) return;
            const contract = window.contractConfig.contract;
            const address = window.contractConfig.address;
            if (!address) return;

            // نرخ توکن از کانترکت
            const tokenPrice = await contract.getTokenPrice();
            this.tokenPrice = ethers.formatUnits(tokenPrice, 18);

            // موجودی CPA
            const cpaBalance = await contract.balanceOf(address);
            const cpaBalanceFormatted = ethers.formatUnits(cpaBalance, 18);

            // موجودی USDC
            const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
            const USDC_ABI = ["function balanceOf(address) view returns (uint256)"];
            const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, window.contractConfig.signer);
            const usdcBalance = await usdcContract.balanceOf(address);
            const usdcBalanceFormatted = ethers.formatUnits(usdcBalance, 6);

            // نمایش موجودی‌ها
            const cpaBalanceEl = document.getElementById('cpaBalance');
            const usdcBalanceEl = document.getElementById('usdcBalance');
            if (cpaBalanceEl) cpaBalanceEl.textContent = `${Number(cpaBalanceFormatted).toLocaleString('en-US', {maximumFractionDigits: 6})} CPA`;
            if (usdcBalanceEl) usdcBalanceEl.textContent = `${Number(usdcBalanceFormatted).toLocaleString('en-US', {maximumFractionDigits: 6})} USDC`;

            // ذخیره برای max
            this.userBalances = {
                cpa: parseFloat(cpaBalanceFormatted),
                usdc: parseFloat(usdcBalanceFormatted)
            };
            this.updateSwapRate();
            await this.updateSwapLimitInfo();
        } catch (error) {
            this.tokenPrice = null;
            this.updateSwapRate();
        }
    }

    updateSwapRate() {
        const direction = document.getElementById('swapDirection');
        const rateDisplay = document.getElementById('swapRate');
        if (direction && rateDisplay) {
            if (this.tokenPrice && !isNaN(this.tokenPrice) && Number(this.tokenPrice) > 0) {
                if (direction.value === 'usdc-to-cpa') {
                    const cpaPerUsdc = 1 / Number(this.tokenPrice);
                    rateDisplay.textContent = `نرخ تبدیل: 1 USDC = ${cpaPerUsdc.toFixed(6)} CPA`;
                } else if (direction.value === 'cpa-to-usdc') {
                    rateDisplay.textContent = `نرخ تبدیل: 1 CPA = ${Number(this.tokenPrice).toFixed(6)} USDC`;
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
        if (amount && direction && preview && this.tokenPrice && Number(this.tokenPrice) > 0) {
            const value = parseFloat(amount.value) || 0;
            let result = 0;
            if (direction.value === 'usdc-to-cpa') {
                result = value / Number(this.tokenPrice);
                preview.textContent = `${value} USDC = ${result.toFixed(6)} CPA`;
            } else if (direction.value === 'cpa-to-usdc') {
                result = value * Number(this.tokenPrice);
                preview.textContent = `${value} CPA = ${result.toFixed(6)} USDC`;
            }
        } else if (preview) {
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

    // تابع اصلی سواپ
    async handleSwap(e) {
        e.preventDefault();
        if (this.isSwapping) return;
        this.isSwapping = true;
        this.setUIBusy(true);
        try {
            const amount = document.getElementById('swapAmount');
            const direction = document.getElementById('swapDirection');
            if (!amount || !direction) throw new Error('فرم ناقص است');
            const value = parseFloat(amount.value);
            if (!value || value <= 0) throw new Error('مقدار نامعتبر است');
            if (direction.value === 'usdc-to-cpa' && value > this.userBalances.usdc) throw new Error('موجودی USDC کافی نیست');
            if (direction.value === 'cpa-to-usdc' && value > this.userBalances.cpa) throw new Error('موجودی CPA کافی نیست');

            if (direction.value === 'usdc-to-cpa') {
                await this.buyTokensWithUSDC(value);
            } else if (direction.value === 'cpa-to-usdc') {
                await this.sellTokensForUSDC(value);
            }
            this.showStatus('تبدیل با موفقیت انجام شد!', 'success');
            await this.refreshSwapData();
            amount.value = '';
            await this.updateSwapPreview();
        } catch (error) {
            this.showStatus(this.getErrorMessage(error), 'error');
        }
        this.setUIBusy(false);
        this.isSwapping = false;
    }

    // خرید CPA با USDC (با مدیریت allowance)
    async buyTokensWithUSDC(usdcAmount) {
        const contract = window.contractConfig.contract;
        const signer = window.contractConfig.signer;
        const address = window.contractConfig.address;
        const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
        const USDC_ABI = [
            "function approve(address,uint256) public returns (bool)",
            "function allowance(address,address) public view returns (uint256)"
        ];
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
        const usdcAmountWei = ethers.parseUnits(usdcAmount.toString(), 6);
        // بررسی allowance
        const allowance = await usdcContract.allowance(address, contract.target);
        if (allowance < usdcAmountWei) {
            this.showStatus('در حال تایید مجوز USDC...', 'loading');
            const approveTx = await usdcContract.approve(contract.target, ethers.MaxUint256);
            this.showStatus('در انتظار تایید تراکنش approve...', 'loading', approveTx.hash);
            await approveTx.wait();
        }
        // خرید CPA
        this.showStatus('در حال خرید توکن...', 'loading');
        const tx = await contract.buyTokens(usdcAmountWei);
        this.showStatus('در انتظار تایید تراکنش خرید...', 'loading', tx.hash);
        await tx.wait();
        this.showStatus('خرید موفق!','success',tx.hash);
    }

    // فروش CPA و دریافت USDC
    async sellTokensForUSDC(cpaAmount) {
        const contract = window.contractConfig.contract;
        const cpaAmountWei = ethers.parseUnits(cpaAmount.toString(), 18);
        this.showStatus('در حال فروش توکن...', 'loading');
        const tx = await contract.sellTokens(cpaAmountWei);
        this.showStatus('در انتظار تایید تراکنش فروش...', 'loading', tx.hash);
        await tx.wait();
        this.showStatus('فروش موفق!','success',tx.hash);
    }

    // مدیریت وضعیت UI
    setUIBusy(isBusy) {
        const btn = document.querySelector('.swap-btn');
        if (btn) btn.disabled = isBusy;
        const amount = document.getElementById('swapAmount');
        if (amount) amount.disabled = isBusy;
        const direction = document.getElementById('swapDirection');
        if (direction) direction.disabled = isBusy;
        const maxBtn = document.getElementById('maxBtn');
        if (maxBtn) maxBtn.disabled = isBusy;
    }

    // نمایش وضعیت و هش تراکنش
    showStatus(message, type, txHash = null) {
        const status = document.getElementById('swapStatus');
        if (!status) return;
        status.textContent = message;
        status.className = `swap-status ${type}`;
        if (txHash) {
            const scanLink = `https://polygonscan.com/tx/${txHash}`;
            status.innerHTML += `<br><a href='${scanLink}' target='_blank' style='color:#00f;text-decoration:underline;'>مشاهده تراکنش در اسکنر</a>`;
        }
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                status.textContent = '';
                status.className = 'swap-status';
            }, 8000);
        }
    }

    // تبدیل خطا به پیام کاربرپسند
    getErrorMessage(error) {
        const msg = error?.message || error?.data?.message || error?.toString() || '';
        if (msg.includes('user rejected')) return '❌ تراکنش توسط کاربر لغو شد.';
        if (msg.includes('insufficient funds')) return 'موجودی کافی برای پرداخت کارمزد یا سواپ وجود ندارد.';
        if (msg.includes('insufficient balance')) return 'موجودی کافی نیست.';
        if (msg.includes('allowance')) return 'مجوز کافی نیست، لطفاً دوباره تلاش کنید.';
        if (msg.includes('invalid address')) return 'آدرس مقصد یا ورودی نامعتبر است.';
        if (msg.includes('not allowed') || msg.includes('only owner')) return 'شما مجاز به انجام این عملیات نیستید.';
        if (msg.includes('already swapped') || msg.includes('already exists')) return 'این عملیات قبلاً انجام شده است یا تکراری است.';
        if (msg.includes('slippage')) return 'اختلاف قیمت (slippage) زیاد است. لطفاً مقدار را تغییر دهید.';
        if (msg.includes('price changed')) return 'قیمت تغییر کرده است. لطفاً دوباره تلاش کنید.';
        if (msg.includes('execution reverted')) return 'تراکنش ناموفق بود. شرایط سواپ را بررسی کنید.';
        if (msg.includes('network') || msg.includes('connection')) return '❌ خطا در اتصال شبکه. لطفاً اینترنت خود را بررسی کنید.';
        if (msg.includes('timeout')) return 'زمان تراکنش به پایان رسید. دوباره تلاش کنید.';
        return msg ? '❌ خطا: ' + msg : 'خطا در انجام تراکنش. لطفاً دوباره تلاش کنید.';
    }

    // بروزرسانی داده‌ها
    async refreshSwapData() {
        await this.loadSwapData();
        await this.updateSwapPreview();
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    window.swapManager = new SwapManager();
    await window.swapManager.initializeSwap();
});

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