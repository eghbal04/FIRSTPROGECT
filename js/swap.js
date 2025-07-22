// swap.js - اصولی و حرفه‌ای برای سواپ USDC ↔ CPA

class SwapManager {
    constructor() {
        this.tokenPrice = null;
        this.userBalances = { usdc: 0, cpa: 0 };
        this.isSwapping = false;
        this.initializeSwap();
    }

    async initializeSwap() {
        await this.loadSwapData();
        this.setupEventListeners();
        this.updateSwapRate();
        await this.updateSwapPreview();
        await this.updateSwapLimitInfo();
        this.updateMaxAmount();
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
                html += `<div style="background:#e8f5e8;padding:12px;border-radius:8px;border-left:4px solid #4caf50;margin-bottom:10px;">
                    <h4 style="margin:0 0 8px 0;color:#2e7d32;">🛒 خرید CPA با USDC</h4>
                    <p style="margin:5px 0;color:#555;"><strong>حداقل خرید:</strong> ۱ USDC</p>
                    <p style="margin:5px 0;color:#555;"><strong>سقف خرید فعلی:</strong> ${maxBuy.toLocaleString('en-US', {maximumFractionDigits:2})} USDC</p>
                    <p style="margin:5px 0;color:#555;"><strong>کارمزد خرید:</strong> ۲٪ کل</p>
                    <ul style="margin:5px 0;padding-left:20px;color:#555;">
                        <li>۰.۵٪ برای توسعه‌دهنده</li>
                        <li>۰.۵٪ برای معرف</li>
                        <li>۱٪ برای پشتوانه قرارداد</li>
                    </ul>
                    <p style="margin:5px 0;color:#2e7d32;"><strong>سهم شما: ۹۸٪ از مبلغ خرید به توکن تبدیل می‌شود</strong></p>
                </div>`;
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
                html += `<div style="background:#fff3e0;padding:12px;border-radius:8px;border-left:4px solid #ff9800;margin-bottom:10px;">
                    <h4 style="margin:0 0 8px 0;color:#e65100;">💰 فروش CPA و دریافت USDC</h4>
                    <p style="margin:5px 0;color:#555;"><strong>حداقل فروش:</strong> ۱ توکن CPA</p>
                    <p style="margin:5px 0;color:#555;"><strong>سقف فروش فعلی:</strong> ${maxSell.toLocaleString('en-US', {maximumFractionDigits:2})} توکن</p>
                    <p style="margin:5px 0;color:#555;"><strong>کارمزد فروش:</strong> ۲٪ کل</p>
                    <ul style="margin:5px 0;padding-left:20px;color:#555;">
                        <li>۰.۵٪ برای توسعه‌دهنده</li>
                        <li>۰.۵٪ برای معرف</li>
                        <li>۱٪ برای پشتوانه قرارداد</li>
                    </ul>
                    <p style="margin:5px 0;color:#e65100;"><strong>سهم شما: ۹۸٪ از مقدار فروش به USDC تبدیل می‌شود</strong></p>
                </div>`;
            }
        } catch (e) {
            html = '<div style="background:#ffebee;padding:12px;border-radius:8px;border-left:4px solid #f44336;color:#c62828;">در حال دریافت اطلاعات محدودیت‌ها...</div>';
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
        const rateEl = document.getElementById('swapRate');
        if (rateEl && this.tokenPrice && Number(this.tokenPrice) > 0) {
            const price = Number(this.tokenPrice);
            rateEl.innerHTML = `<div style="background:#f3e5f5;padding:10px;border-radius:6px;text-align:center;margin:10px 0;">
                <strong>💱 نرخ تبدیل فعلی:</strong><br>
                ۱ USDC = ${price.toFixed(6)} CPA<br>
                ۱ CPA = ${(1/price).toFixed(6)} USDC
            </div>`;
        } else if (rateEl) {
            rateEl.innerHTML = '<div style="background:#ffebee;padding:10px;border-radius:6px;text-align:center;color:#c62828;">قیمت در دسترس نیست</div>';
        }
    }

    async updateSwapPreview() {
        const amount = document.getElementById('swapAmount');
        const direction = document.getElementById('swapDirection');
        const preview = document.getElementById('swapPreview');
        if (amount && direction && preview && this.tokenPrice && Number(this.tokenPrice) > 0) {
            const value = parseFloat(amount.value) || 0;
            let result = 0;
            let previewHtml = '';
            
            if (direction.value === 'usdc-to-cpa') {
                result = value / Number(this.tokenPrice);
                const fees = value * 0.02; // 2% fees
                const netAmount = value - fees;
                const netTokens = netAmount / Number(this.tokenPrice);
                
                previewHtml = `<div style="background:#e8f5e8;padding:12px;border-radius:6px;margin:10px 0;">
                    <h4 style="margin:0 0 8px 0;color:#2e7d32;">📊 پیش‌نمایش خرید</h4>
                    <p style="margin:5px 0;color:#555;"><strong>مبلغ ورودی:</strong> ${value.toFixed(2)} USDC</p>
                    <p style="margin:5px 0;color:#555;"><strong>کارمزد (۲٪):</strong> ${fees.toFixed(2)} USDC</p>
                    <p style="margin:5px 0;color:#555;"><strong>مبلغ خالص:</strong> ${netAmount.toFixed(2)} USDC</p>
                    <p style="margin:5px 0;color:#2e7d32;"><strong>توکن دریافتی:</strong> ${netTokens.toFixed(6)} CPA</p>
                </div>`;
            } else if (direction.value === 'cpa-to-usdc') {
                result = value * Number(this.tokenPrice);
                const fees = result * 0.02; // 2% fees
                const netUsdc = result - fees;
                
                previewHtml = `<div style="background:#fff3e0;padding:12px;border-radius:6px;margin:10px 0;">
                    <h4 style="margin:0 0 8px 0;color:#e65100;">📊 پیش‌نمایش فروش</h4>
                    <p style="margin:5px 0;color:#555;"><strong>توکن ورودی:</strong> ${value.toFixed(6)} CPA</p>
                    <p style="margin:5px 0;color:#555;"><strong>ارزش کل:</strong> ${result.toFixed(6)} USDC</p>
                    <p style="margin:5px 0;color:#555;"><strong>کارمزد (۲٪):</strong> ${fees.toFixed(6)} USDC</p>
                    <p style="margin:5px 0;color:#e65100;"><strong>USDC دریافتی:</strong> ${netUsdc.toFixed(6)} USDC</p>
                </div>`;
            }
            preview.innerHTML = previewHtml;
        } else if (preview) {
            preview.innerHTML = '<div style="background:#ffebee;padding:10px;border-radius:6px;text-align:center;color:#c62828;">قیمت در دسترس نیست</div>';
        }
    }

    updateMaxAmount() {
        const direction = document.getElementById('swapDirection');
        const amount = document.getElementById('swapAmount');
        if (direction && amount) {
            if (direction.value === 'usdc-to-cpa') {
                amount.max = this.userBalances.usdc;
            } else if (direction.value === 'cpa-to-usdc') {
                amount.max = this.userBalances.cpa;
            }
        }
    }

    async setMaxAmount() {
        const direction = document.getElementById('swapDirection');
        const amount = document.getElementById('swapAmount');
        if (direction && amount) {
            if (direction.value === 'usdc-to-cpa') {
                amount.value = this.userBalances.usdc.toFixed(2);
            } else if (direction.value === 'cpa-to-usdc') {
                amount.value = this.userBalances.cpa.toFixed(6);
            }
            await this.updateSwapPreview();
        }
    }

    setUIBusy(busy) {
        const submitBtn = document.querySelector('#swapForm button[type="submit"]');
        const inputs = document.querySelectorAll('#swapForm input, #swapForm select');
        if (submitBtn) {
            submitBtn.disabled = busy;
            submitBtn.textContent = busy ? 'در حال پردازش...' : 'تبدیل';
        }
        inputs.forEach(input => input.disabled = busy);
    }

    getErrorMessage(error) {
        if (error.code === 4001) return 'لغو توسط کاربر';
        if (error.message.includes('insufficient funds')) return 'موجودی کافی نیست';
        if (error.message.includes('exceeds buy limit')) return 'مقدار از سقف خرید بیشتر است';
        if (error.message.includes('exceeds sell limit')) return 'مقدار از سقف فروش بیشتر است';
        if (error.message.includes('minimum')) return 'مقدار کمتر از حداقل مجاز است';
        if (error.message.includes('allowance')) return 'ابتدا مجوز USDC را تایید کنید';
        if (error.message.includes('cooldown')) return 'لطفا کمی صبر کنید و دوباره تلاش کنید';
        return error.message || 'خطای نامشخص';
    }

    showStatus(message, type = 'info', txHash = null) {
        const statusEl = document.getElementById('swapStatus');
        if (!statusEl) return;
        
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
            html += `<br><small style="color:#666;">تراکنش: ${txHash}</small>`;
        }
        
        statusEl.className = className;
        statusEl.innerHTML = html;
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
            // ذخیره تب فعال و رفرش صفحه
            localStorage.setItem('activeTab', 'swap');
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
            this.showStatus('🔐 در حال تایید مجوز USDC...', 'loading');
            const approveTx = await usdcContract.approve(contract.target, ethers.MaxUint256);
            this.showStatus('⏳ در انتظار تایید مجوز USDC...', 'loading', approveTx.hash);
            await approveTx.wait();
            this.showStatus('✅ مجوز USDC تایید شد', 'success');
        }
        
        // خرید CPA
        this.showStatus('🛒 در حال خرید توکن CPA...', 'loading');
        const tx = await contract.buyTokens(usdcAmountWei);
        this.showStatus('⏳ در انتظار تایید تراکنش خرید...', 'loading', tx.hash);
        await tx.wait();
        this.showStatus('✅ خرید موفق! توکن‌های CPA به کیف پول شما اضافه شد', 'success', tx.hash);
    }

    // فروش CPA و دریافت USDC
    async sellTokensForUSDC(cpaAmount) {
        const contract = window.contractConfig.contract;
        const cpaAmountWei = ethers.parseUnits(cpaAmount.toString(), 18);
        
        this.showStatus('💰 در حال فروش توکن CPA...', 'loading');
        const tx = await contract.sellTokens(cpaAmountWei);
        this.showStatus('⏳ در انتظار تایید تراکنش فروش...', 'loading', tx.hash);
        await tx.wait();
        this.showStatus('✅ فروش موفق! USDC به کیف پول شما اضافه شد', 'success', tx.hash);
    }

    async refreshSwapData() {
        await this.loadSwapData();
        this.updateSwapRate();
        await this.updateSwapPreview();
        await this.updateSwapLimitInfo();
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