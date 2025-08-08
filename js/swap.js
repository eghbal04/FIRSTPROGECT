// swap.js - اصولی و حرفه‌ای برای سواپ DAI ↔ CPA

class SwapManager {
    constructor() {
        console.log('🏗️ ساخت نمونه SwapManager...');
        
        this.tokenPrice = null;
        this.userBalances = { dai: 0, cpa: 0 };
        this.isSwapping = false;
        
        console.log('✅ SwapManager ساخته شد');
        
        // مقداردهی اولیه حذف شد - حالا در index.html انجام می‌شود
    }

    async initializeSwap() {
        try {
            console.log('🔄 شروع مقداردهی SwapManager...');
            
            // اطمینان از وجود عناصر DOM
            const requiredElements = ['swapForm', 'swapDirection', 'swapAmount', 'maxBtn', 'swapRate', 'swapPreview', 'swapLimitInfo', 'swapStatus'];
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length > 0) {
                console.warn('⚠️ عناصر زیر یافت نشدند:', missingElements);
                return;
            }
            
            console.log('✅ تمام عناصر DOM موجود هستند');
            
            // تنظیم event listeners
            this.setupEventListeners();
            console.log('✅ Event listeners تنظیم شدند');
            
            // بارگذاری داده‌ها
            await this.loadSwapData();
            console.log('✅ داده‌های سواپ بارگذاری شدند');
            
            // به‌روزرسانی UI
            this.updateSwapRate();
            await this.updateSwapPreview();
            await this.updateSwapLimitInfo();
            this.updateMaxAmount();
            
            console.log('✅ SwapManager با موفقیت مقداردهی شد');
            
        } catch (error) {
            console.error('❌ خطا در مقداردهی SwapManager:', error);
            this.showStatus('خطا در بارگذاری سواپ: ' + error.message, 'error');
        }
    }



    // تابع تبدیل USD به توکن (برای فیلد USD)
    convertSwapUsdToToken() {
        console.log('🔄 تبدیل USD به توکن...');
        
        const usdAmount = document.getElementById('swapUsdAmount');
        const swapAmount = document.getElementById('swapAmount');
        const direction = document.getElementById('swapDirection');
        
        if (!usdAmount || !swapAmount || !direction) {
            console.warn('⚠️ عناصر مورد نیاز برای تبدیل USD یافت نشدند');
            return;
        }
        
        const usdValue = parseFloat(usdAmount.value);
        if (!usdValue || usdValue <= 0) {
            this.showStatus('لطفاً مقدار دلاری معتبر وارد کنید', 'error');
            return;
        }
        
        if (!this.tokenPrice || Number(this.tokenPrice) <= 0) {
            this.showStatus('قیمت توکن در دسترس نیست', 'error');
            return;
        }
        
        const tokenPrice = Number(this.tokenPrice);
        
        if (direction.value === 'dai-to-cpa') {
            // تبدیل USD به DAI (فرض بر این که 1 USD = 1 DAI)
            const daiAmount = usdValue;
            swapAmount.value = daiAmount.toFixed(2);
            console.log('✅ USD به DAI تبدیل شد:', daiAmount);
        } else if (direction.value === 'cpa-to-dai') {
            // تبدیل USD به CPA
            const cpaAmount = usdValue / tokenPrice;
            swapAmount.value = cpaAmount.toFixed(6);
            console.log('✅ USD به CPA تبدیل شد:', cpaAmount);
        }
        
        // به‌روزرسانی پیش‌نمایش
        this.updateSwapPreview();
        this.showStatus(`✅ مقدار ${usdValue} دلار به توکن تبدیل شد`, 'success');
    }

    // به‌روزرسانی معادل دلاری وقتی مقدار توکن تغییر می‌کند
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
        
        if (direction.value === 'dai-to-cpa') {
            // DAI به USD (فرض بر این که 1 DAI = 1 USD)
            const usdValue = tokenAmount;
            swapUsdAmount.value = usdValue.toFixed(2);
        } else if (direction.value === 'cpa-to-dai') {
            // CPA به USD
            const usdValue = tokenAmount * tokenPrice;
            swapUsdAmount.value = usdValue.toFixed(2);
        }
    }

    // نمایش/مخفی کردن فیلد USD بر اساس جهت سواپ
    toggleSwapUsdConverter() {
        const direction = document.getElementById('swapDirection');
        const usdConverterRow = document.getElementById('swap-usd-converter-row');
        
        if (!direction || !usdConverterRow) {
            return;
        }
        
        if (direction.value === 'cpa-to-dai') {
            usdConverterRow.style.display = 'block';
        } else {
            usdConverterRow.style.display = 'none';
        }
    }

    // به‌روزرسانی پیش‌نمایش USD
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
        
        if (direction.value === 'cpa-to-dai') {
            const cpaAmount = usdValue / tokenPrice;
            swapAmount.value = cpaAmount.toFixed(6);
            this.updateSwapPreview();
        }
    }

    async updateSwapLimitInfo() {
        const infoDiv = document.getElementById('swapLimitInfo');
        if (!infoDiv) {
            console.warn('⚠️ عنصر swapLimitInfo یافت نشد');
            return;
        }
        
        const direction = document.getElementById('swapDirection');
        if (!direction) {
            console.warn('⚠️ عنصر swapDirection یافت نشد');
            return;
        }
        
        let html = '';
        try {
            console.log('🔄 بارگذاری اطلاعات محدودیت‌ها...');
            
            const contract = window.contractConfig.contract;
            const address = window.contractConfig.address;
            const daiAddress = window.DAI_ADDRESS;
            const daiAbi = window.DAI_ABI;
            
            if (!contract || !address || !daiAddress || !daiAbi) {
                throw new Error('تنظیمات قرارداد ناقص است');
            }
            
            const daiContract = new ethers.Contract(daiAddress, daiAbi, window.contractConfig.signer);
            const daiBalance = await daiContract.balanceOf(contract.target);
            const daiBalanceNum = parseFloat(ethers.formatUnits(daiBalance, 18));
            
            console.log('📊 موجودی DAI قرارداد:', daiBalanceNum);
            
            if (direction.value === 'dai-to-cpa') {
                // Buy limits
                let maxBuy;
                if (daiBalanceNum <= 100000) {
                    maxBuy = 1000;
                } else {
                    maxBuy = daiBalanceNum * 0.01;
                }
                html += `<div style="background:#e8f5e8;padding:12px;border-radius:8px;border-left:4px solid #4caf50;margin-bottom:10px;">
                    <h4 style="margin:0 0 8px 0;color:#2e7d32;">🛒 خرید CPA با DAI</h4>
                    <p style="margin:5px 0;color:#555;"><strong>حداقل خرید:</strong> ۱ DAI</p>
                    <p style="margin:5px 0;color:#555;"><strong>سقف خرید فعلی:</strong> ${maxBuy.toLocaleString('en-US', {maximumFractionDigits:2})} DAI</p>
                    <p style="margin:5px 0;color:#555;"><strong>کارمزد خرید:</strong> ۲٪ کل</p>
                    <ul style="margin:5px 0;padding-left:20px;color:#555;">
                        <li>0.5٪ برای توسعه‌دهنده</li>
                        <li>1.5٪ برای پشتوانه قرارداد</li>
                    </ul>
                    <p style="margin:5px 0;color:#2e7d32;"><strong>سهم شما: ۹۸٪ از مبلغ خرید به توکن تبدیل می‌شود</strong></p>
                </div>`;
            } else if (direction.value === 'cpa-to-dai') {
                // Sell limits
                const totalSupply = await contract.totalSupply();
                const totalSupplyNum = parseFloat(ethers.formatUnits(totalSupply, 18));
                let maxSell;
                if (daiBalanceNum >= 500) {
                    maxSell = totalSupplyNum * 0.01;
                } else {
                    maxSell = totalSupplyNum * 0.5;
                }
                html += `<div style="background:#fff3e0;padding:12px;border-radius:8px;border-left:4px solid #ff9800;margin-bottom:10px;">
                    <h4 style="margin:0 0 8px 0;color:#e65100;">💰 فروش CPA و دریافت DAI</h4>
                    <p style="margin:5px 0;color:#555;"><strong>حداقل فروش:</strong> ۱ توکن CPA</p>
                    <p style="margin:5px 0;color:#555;"><strong>سقف فروش فعلی:</strong> ${maxSell.toLocaleString('en-US', {maximumFractionDigits:2})} توکن</p>
                    <p style="margin:5px 0;color:#555;"><strong>کارمزد فروش:</strong> ۲٪ کل</p>
                    <ul style="margin:5px 0;padding-left:20px;color:#555;">
                        <li>0.5٪ برای توسعه‌دهنده</li>
                        <li>1.5٪ برای پشتوانه قرارداد</li>
                    </ul>
                    <p style="margin:5px 0;color:#e65100;"><strong>سهم شما: ۹۸٪ از مقدار فروش به DAI تبدیل می‌شود</strong></p>
                </div>`;
            }
            
            console.log('✅ اطلاعات محدودیت‌ها بارگذاری شد');
            
        } catch (e) {
            console.error('❌ خطا در بارگذاری اطلاعات محدودیت‌ها:', e);
            html = '<div style="background:#ffebee;padding:12px;border-radius:8px;border-left:4px solid #f44336;color:#c62828;">در حال دریافت اطلاعات محدودیت‌ها...</div>';
        }
        
        infoDiv.innerHTML = html;
    }

    // Call updateSwapLimitInfo on direction/amount change
    setupEventListeners() {
        console.log('🔄 تنظیم event listeners...');
        
        const swapForm = document.getElementById('swapForm');
        const swapDirection = document.getElementById('swapDirection');
        const swapAmount = document.getElementById('swapAmount');
        const maxBtn = document.getElementById('maxBtn');

        if (swapForm) {
            swapForm.addEventListener('submit', (e) => {
                console.log('📝 فرم سواپ ارسال شد');
                this.handleSwap(e);
            });
            console.log('✅ Event listener فرم سواپ متصل شد');
        } else {
            console.warn('⚠️ فرم سواپ یافت نشد');
        }
        
        if (swapDirection) {
            swapDirection.addEventListener('change', async () => {
                console.log('🔄 جهت سواپ تغییر کرد:', swapDirection.value);
                this.updateSwapRate();
                await this.updateSwapPreview();
                this.updateMaxAmount();
                await this.updateSwapLimitInfo();
                
                // نمایش/مخفی کردن فیلد USD بر اساس جهت سواپ
                this.toggleSwapUsdConverter();
            });
            console.log('✅ Event listener جهت سواپ متصل شد');
        } else {
            console.warn('⚠️ جهت سواپ یافت نشد');
        }
        
        if (swapAmount) {
            swapAmount.addEventListener('input', async () => {
                console.log('📝 مقدار سواپ تغییر کرد:', swapAmount.value);
                await this.updateSwapPreview();
                await this.updateSwapLimitInfo();
                
                // Real-time محاسبه معادل دلاری وقتی مقدار توکن تغییر میکنه
                this.updateSwapUsdValue();
            });
            console.log('✅ Event listener مقدار سواپ متصل شد');
        } else {
            console.warn('⚠️ مقدار سواپ یافت نشد');
        }
        
        if (maxBtn) {
            maxBtn.addEventListener('click', async () => {
                console.log('🔢 دکمه حداکثر کلیک شد');
                await this.setMaxAmount();
                await this.updateSwapLimitInfo();
            });
            console.log('✅ Event listener دکمه حداکثر متصل شد');
        } else {
            console.warn('⚠️ دکمه حداکثر یافت نشد');
        }
        
        // Event listeners برای USD converter
        const swapUsdConverterRow = document.getElementById('swap-usd-converter-row');
        const swapUsdAmount = document.getElementById('swapUsdAmount');
        const swapUsdToTokenBtn = document.getElementById('swapUsdToTokenBtn');
        
        if (swapUsdToTokenBtn) {
            swapUsdToTokenBtn.addEventListener('click', () => {
                this.convertSwapUsdToToken();
            });
            console.log('✅ Event listener دکمه تبدیل USD متصل شد');
        }
        
        if (swapUsdAmount) {
            // Enter key در فیلد USD
            swapUsdAmount.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.convertSwapUsdToToken();
                }
            });
            
            // Real-time محاسبه وقتی کاربر تایپ می‌کنه
            let swapUsdTimeout;
            swapUsdAmount.addEventListener('input', () => {
                clearTimeout(swapUsdTimeout);
                swapUsdTimeout = setTimeout(() => {
                    this.updateSwapUsdPreview();
                }, 500);
            });
            console.log('✅ Event listeners فیلد USD متصل شدند');
        }
        
        // اجرای اولیه برای تنظیم وضعیت اولیه
        this.toggleSwapUsdConverter();
        
        console.log('✅ تمام event listeners تنظیم شدند');
    }

    async loadSwapData() {
        try {
            console.log('🔄 بارگذاری داده‌های سواپ...');
            
            // بررسی اتصال به قرارداد
            if (!window.contractConfig || !window.contractConfig.contract) {
                console.log('⏳ منتظر اتصال به قرارداد...');
                // تلاش برای اتصال
                try {
                    await window.connectWallet();
                } catch (error) {
                    console.warn('⚠️ نتوانست به قرارداد متصل شود:', error);
                    this.tokenPrice = null;
                    this.updateSwapRate();
                    return;
                }
            }
            
            const contract = window.contractConfig.contract;
            const address = window.contractConfig.address;
            
            if (!address) {
                console.warn('⚠️ آدرس کیف پول در دسترس نیست');
                this.tokenPrice = null;
                this.updateSwapRate();
                return;
            }
            
            console.log('✅ اتصال به قرارداد برقرار شد');

            // نرخ توکن از کانترکت
            const tokenPrice = await contract.getTokenPrice();
            this.tokenPrice = ethers.formatUnits(tokenPrice, 18);
            console.log('✅ قیمت توکن دریافت شد:', this.tokenPrice);

            // موجودی CPA
            const cpaBalance = await contract.balanceOf(address);
            const cpaBalanceFormatted = ethers.formatUnits(cpaBalance, 18);
            console.log('✅ موجودی CPA دریافت شد:', cpaBalanceFormatted);

            // موجودی DAI
            const daiAddress = window.DAI_ADDRESS;
            const daiAbi = window.DAI_ABI;
            
            if (!daiAddress || !daiAbi) {
                console.error('❌ DAI_ADDRESS یا DAI_ABI تعریف نشده است');
                throw new Error('تنظیمات DAI ناقص است');
            }
            
            const daiContract = new ethers.Contract(daiAddress, daiAbi, window.contractConfig.signer);
            const daiBalance = await daiContract.balanceOf(address);
            const daiBalanceFormatted = ethers.formatUnits(daiBalance, 18);
            console.log('✅ موجودی DAI دریافت شد:', daiBalanceFormatted);

            // تابع کوتاه کردن اعداد بزرگ
            function formatLargeNumber(num) {
                if (num >= 1000000) {
                    return (num / 1000000).toFixed(1) + 'M';
                } else if (num >= 1000) {
                    return (num / 1000).toFixed(1) + 'K';
                } else {
                    return num.toFixed(2);
                }
            }
            
            // محاسبه معادل دلاری CPA
            const cpaUsdValue = parseFloat(cpaBalanceFormatted) * parseFloat(this.tokenPrice);
            
            // نمایش موجودی‌ها
            const cpaBalanceEl = document.getElementById('cpaBalance');
            const daiBalanceEl = document.getElementById('daiBalance');
            if (cpaBalanceEl) {
                const fullCpaAmount = Number(cpaBalanceFormatted).toLocaleString('en-US', {maximumFractionDigits: 6});
                cpaBalanceEl.innerHTML = `
                    <span title="${fullCpaAmount} CPA">${formatLargeNumber(Number(cpaBalanceFormatted))} CPA</span>
                    <div style="font-size:0.8rem;color:#a786ff;margin-top:2px;">≈ $${formatLargeNumber(cpaUsdValue)}</div>
                `;
            }
            if (daiBalanceEl) {
                const fullDaiAmount = Number(daiBalanceFormatted).toLocaleString('en-US', {maximumFractionDigits: 6});
                daiBalanceEl.innerHTML = `<span title="${fullDaiAmount} DAI">${formatLargeNumber(Number(daiBalanceFormatted))} DAI</span>`;
            }

            // ذخیره برای max
            this.userBalances = {
                cpa: parseFloat(cpaBalanceFormatted),
                dai: parseFloat(daiBalanceFormatted)
            };
            
            console.log('✅ موجودی‌های کاربر ذخیره شدند:', this.userBalances);
            
            this.updateSwapRate();
            await this.updateSwapLimitInfo();
            
        } catch (error) {
            console.error('❌ خطا در بارگذاری داده‌های سواپ:', error);
            this.tokenPrice = null;
            this.userBalances = { cpa: 0, dai: 0 };
            this.updateSwapRate();
            this.showStatus('خطا در بارگذاری موجودی‌ها: ' + error.message, 'error');
        }
    }

    updateSwapRate() {
        const rateEl = document.getElementById('swapRate');
        
        if (!rateEl) {
            console.warn('⚠️ عنصر swapRate یافت نشد');
            return;
        }
        
        if (this.tokenPrice && Number(this.tokenPrice) > 0) {
            const price = Number(this.tokenPrice);
            rateEl.innerHTML = `<div style="background:#f3e5f5;padding:10px;border-radius:6px;text-align:center;margin:10px 0;">
                <strong>💱 نرخ تبدیل فعلی:</strong><br>
                ۱ DAI = ${price.toFixed(6)} CPA<br>
                ۱ CPA = ${(1/price).toFixed(6)} DAI
            </div>`;
            console.log('✅ نرخ تبدیل به‌روزرسانی شد:', price);
        } else {
            rateEl.innerHTML = '<div style="background:#ffebee;padding:10px;border-radius:6px;text-align:center;color:#c62828;">قیمت در دسترس نیست</div>';
            console.warn('⚠️ قیمت توکن در دسترس نیست');
        }
    }

    async updateSwapPreview() {
        const amount = document.getElementById('swapAmount');
        const direction = document.getElementById('swapDirection');
        const preview = document.getElementById('swapPreview');
        
        if (!amount || !direction || !preview) {
            console.warn('⚠️ عناصر مورد نیاز برای پیش‌نمایش یافت نشدند');
            return;
        }
        
        if (!this.tokenPrice || Number(this.tokenPrice) <= 0) {
            preview.innerHTML = '<div style="background:#ffebee;padding:10px;border-radius:6px;text-align:center;color:#c62828;">قیمت در دسترس نیست</div>';
            return;
        }
        
        const value = parseFloat(amount.value) || 0;
        let result = 0;
        let previewHtml = '';
        
        console.log('📊 محاسبه پیش‌نمایش:', {
            direction: direction.value,
            amount: value,
            tokenPrice: this.tokenPrice
        });
        
        if (direction.value === 'dai-to-cpa') {
            result = value / Number(this.tokenPrice);
            const fees = value * 0.02; // 2% fees
            const netAmount = value - fees;
            const netTokens = netAmount / Number(this.tokenPrice);
            
            previewHtml = `<div style="background:#e8f5e8;padding:12px;border-radius:6px;margin:10px 0;">
                <h4 style="margin:0 0 8px 0;color:#2e7d32;">📊 پیش‌نمایش خرید</h4>
                <p style="margin:5px 0;color:#555;"><strong>مبلغ ورودی:</strong> ${value.toFixed(2)} DAI</p>
                <p style="margin:5px 0;color:#555;"><strong>کارمزد (۲٪):</strong> ${fees.toFixed(2)} DAI</p>
                <p style="margin:5px 0;color:#555;"><strong>مبلغ خالص:</strong> ${netAmount.toFixed(2)} DAI</p>
                <p style="margin:5px 0;color:#2e7d32;"><strong>توکن دریافتی:</strong> ${netTokens.toFixed(6)} CPA</p>
            </div>`;
        } else if (direction.value === 'cpa-to-dai') {
            result = value * Number(this.tokenPrice);
            const fees = result * 0.02; // 2% fees
            const netDai = result - fees;
            
            previewHtml = `<div style="background:#fff3e0;padding:12px;border-radius:6px;margin:10px 0;">
                <h4 style="margin:0 0 8px 0;color:#e65100;">📊 پیش‌نمایش فروش</h4>
                <p style="margin:5px 0;color:#555;"><strong>توکن ورودی:</strong> ${value.toFixed(6)} CPA</p>
                <p style="margin:5px 0;color:#555;"><strong>ارزش کل:</strong> ${result.toFixed(6)} DAI</p>
                <p style="margin:5px 0;color:#555;"><strong>کارمزد (۲٪):</strong> ${fees.toFixed(6)} DAI</p>
                <p style="margin:5px 0;color:#e65100;"><strong>DAI دریافتی:</strong> ${netDai.toFixed(6)} DAI</p>
            </div>`;
        }
        
        preview.innerHTML = previewHtml;
        console.log('✅ پیش‌نمایش به‌روزرسانی شد');
    }

    updateMaxAmount() {
        const direction = document.getElementById('swapDirection');
        const amount = document.getElementById('swapAmount');
        
        if (!direction || !amount) {
            console.warn('⚠️ عناصر مورد نیاز برای updateMaxAmount یافت نشدند');
            return;
        }
        
        if (direction.value === 'dai-to-cpa') {
            amount.max = this.userBalances.dai;
            console.log('✅ حداکثر مقدار DAI تنظیم شد:', this.userBalances.dai);
        } else if (direction.value === 'cpa-to-dai') {
            amount.max = this.userBalances.cpa;
            console.log('✅ حداکثر مقدار CPA تنظیم شد:', this.userBalances.cpa);
        }
    }

    async setMaxAmount() {
        const direction = document.getElementById('swapDirection');
        const amount = document.getElementById('swapAmount');
        
        if (!direction || !amount) {
            console.warn('⚠️ عناصر مورد نیاز برای setMaxAmount یافت نشدند');
            return;
        }
        
        try {
            if (direction.value === 'dai-to-cpa') {
                // محاسبه سقف خرید هوشمند
                const contract = window.contractConfig.contract;
                const daiAddress = window.DAI_ADDRESS;
                const daiAbi = window.DAI_ABI;
                
                if (!contract || !daiAddress || !daiAbi) {
                    throw new Error('تنظیمات قرارداد ناقص است');
                }
                
                const daiContract = new ethers.Contract(daiAddress, daiAbi, window.contractConfig.signer);
                const daiBalance = await daiContract.balanceOf(contract.target);
                const daiBalanceNum = parseFloat(ethers.formatUnits(daiBalance, 18));
                
                // محاسبه سقف خرید بر اساس موجودی قرارداد
                let maxBuy;
                if (daiBalanceNum <= 100000) {
                    maxBuy = 1000;
                } else {
                    maxBuy = daiBalanceNum * 0.01;
                }
                
                // انتخاب کمترین مقدار بین موجودی کاربر و سقف مجاز
                const maxAmount = Math.min(this.userBalances.dai, maxBuy);
                amount.value = maxAmount.toFixed(2);
                
                console.log('✅ حداکثر خرید هوشمند:', {
                    userBalance: this.userBalances.dai.toFixed(2),
                    buyLimit: maxBuy.toFixed(2),
                    finalAmount: maxAmount.toFixed(2)
                });
                
            } else if (direction.value === 'cpa-to-dai') {
                // محاسبه سقف فروش هوشمند
                const contract = window.contractConfig.contract;
                const daiAddress = window.DAI_ADDRESS;
                const daiAbi = window.DAI_ABI;
                
                if (!contract || !daiAddress || !daiAbi) {
                    throw new Error('تنظیمات قرارداد ناقص است');
                }
                
                const daiContract = new ethers.Contract(daiAddress, daiAbi, window.contractConfig.signer);
                const daiBalance = await daiContract.balanceOf(contract.target);
                const daiBalanceNum = parseFloat(ethers.formatUnits(daiBalance, 18));
                
                const totalSupply = await contract.totalSupply();
                const totalSupplyNum = parseFloat(ethers.formatUnits(totalSupply, 18));
                
                // محاسبه سقف فروش بر اساس موجودی DAI قرارداد
                let maxSell;
                if (daiBalanceNum >= 500) {
                    maxSell = totalSupplyNum * 0.01;
                } else {
                    maxSell = totalSupplyNum * 0.5;
                }
                
                // انتخاب کمترین مقدار بین موجودی کاربر و سقف مجاز
                const maxAmount = Math.min(this.userBalances.cpa, maxSell);
                amount.value = maxAmount.toFixed(6);
                
                console.log('✅ حداکثر فروش هوشمند:', {
                    userBalance: this.userBalances.cpa.toFixed(6),
                    sellLimit: maxSell.toFixed(6),
                    finalAmount: maxAmount.toFixed(6)
                });
            }
            
            await this.updateSwapPreview();
            console.log('✅ پیش‌نمایش بعد از تنظیم حداکثر هوشمند به‌روزرسانی شد');
            
        } catch (error) {
            console.error('❌ خطا در محاسبه حداکثر هوشمند:', error);
            
            // در صورت خطا، از روش قبلی استفاده کن
            if (direction.value === 'dai-to-cpa') {
                amount.value = this.userBalances.dai.toFixed(2);
            } else if (direction.value === 'cpa-to-dai') {
                amount.value = this.userBalances.cpa.toFixed(6);
            }
            
            await this.updateSwapPreview();
        }
    }

    setUIBusy(busy) {
        console.log('🔄 تنظیم وضعیت UI:', busy ? 'busy' : 'ready');
        
        const submitBtn = document.querySelector('#swapForm button[type="submit"]');
        const inputs = document.querySelectorAll('#swapForm input, #swapForm select');
        
        if (submitBtn) {
            submitBtn.disabled = busy;
            submitBtn.textContent = busy ? 'در حال پردازش...' : 'تبدیل';
            console.log('✅ دکمه submit تنظیم شد');
        } else {
            console.warn('⚠️ دکمه submit یافت نشد');
        }
        
        inputs.forEach(input => {
            input.disabled = busy;
        });
        
        console.log(`✅ ${inputs.length} عنصر input تنظیم شدند`);
    }

    getErrorMessage(error) {
        console.log('🔍 تحلیل خطا:', error);
        
        if (error.code === 4001) return 'لغو توسط کاربر';
        if (error.message && error.message.includes('insufficient funds')) return 'موجودی کافی نیست';
        if (error.message && error.message.includes('exceeds buy limit')) return 'مقدار از سقف خرید بیشتر است';
        if (error.message && error.message.includes('exceeds sell limit')) return 'مقدار از سقف فروش بیشتر است';
        if (error.message && error.message.includes('minimum')) return 'مقدار کمتر از حداقل مجاز است';
        if (error.message && error.message.includes('allowance')) return 'ابتدا مجوز DAI را تایید کنید';
        if (error.message && error.message.includes('cooldown')) return 'لطفا کمی صبر کنید و دوباره تلاش کنید';
        if (error.message && error.message.includes('user rejected')) return 'کاربر تراکنش را رد کرد';
        if (error.message && error.message.includes('network')) return 'خطای شبکه - لطفاً اتصال اینترنت خود را بررسی کنید';
        if (error.message && error.message.includes('timeout')) return 'خطای timeout - لطفاً دوباره تلاش کنید';
        
        return error.message || 'خطای نامشخص';
    }

    showStatus(message, type = 'info', txHash = null) {
        console.log('📢 نمایش پیام:', { message, type, txHash });
        
        const statusEl = document.getElementById('swapStatus');
        if (!statusEl) {
            console.warn('⚠️ عنصر swapStatus یافت نشد');
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
            html += `<br><small style="color:#666;">تراکنش: ${txHash}</small>`;
        }
        
        statusEl.className = className;
        statusEl.innerHTML = html;
        
        // اسکرول به پیام
        statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        console.log('✅ پیام نمایش داده شد');
    }

    // تابع اصلی سواپ
    async handleSwap(e) {
        e.preventDefault();
        console.log('🔄 شروع عملیات سواپ...');
        
        if (this.isSwapping) {
            console.log('⚠️ عملیات سواپ در حال انجام است');
            return;
        }
        
        this.isSwapping = true;
        this.setUIBusy(true);
        
        try {
            const amount = document.getElementById('swapAmount');
            const direction = document.getElementById('swapDirection');
            
            if (!amount || !direction) {
                throw new Error('فرم ناقص است - عناصر مورد نیاز یافت نشدند');
            }
            
            const value = parseFloat(amount.value);
            if (!value || value <= 0) {
                throw new Error('مقدار نامعتبر است - لطفاً مقدار مثبت وارد کنید');
            }
            
            console.log('📊 اطلاعات سواپ:', {
                direction: direction.value,
                amount: value,
                userBalances: this.userBalances
            });
            
            // بررسی موجودی
            if (direction.value === 'dai-to-cpa' && value > this.userBalances.dai) {
                throw new Error(`موجودی DAI کافی نیست. موجودی شما: ${this.userBalances.dai.toFixed(6)} DAI`);
            }
            if (direction.value === 'cpa-to-dai' && value > this.userBalances.cpa) {
                throw new Error(`موجودی CPA کافی نیست. موجودی شما: ${this.userBalances.cpa.toFixed(6)} CPA`);
            }

            // انجام عملیات سواپ
            if (direction.value === 'dai-to-cpa') {
                console.log('🛒 شروع خرید CPA با DAI...');
                await this.buyTokensWithDAI(value);
            } else if (direction.value === 'cpa-to-dai') {
                console.log('💰 شروع فروش CPA و دریافت DAI...');
                await this.sellTokensForDAI(value);
            } else {
                throw new Error('نوع تبدیل نامعتبر است');
            }
            
            this.showStatus('✅ تبدیل با موفقیت انجام شد!', 'success');
            await this.refreshSwapData();
            amount.value = '';
            await this.updateSwapPreview();
            
            // ذخیره تب فعال
            localStorage.setItem('activeTab', 'swap');
            
            console.log('✅ عملیات سواپ با موفقیت تکمیل شد');
            
        } catch (error) {
            console.error('❌ خطا در عملیات سواپ:', error);
            this.showStatus(this.getErrorMessage(error), 'error');
        } finally {
            this.setUIBusy(false);
            this.isSwapping = false;
        }
    }

    // خرید CPA با DAI (با مدیریت allowance)
    async buyTokensWithDAI(daiAmount) {
        console.log('🛒 شروع خرید CPA با DAI:', daiAmount);
        
        try {
            const contract = window.contractConfig.contract;
            const signer = window.contractConfig.signer;
            const address = window.contractConfig.address;
            const daiAddress = window.DAI_ADDRESS;
            const daiAbi = window.DAI_ABI;
            
            if (!contract || !signer || !address) {
                throw new Error('اتصال به قرارداد برقرار نیست');
            }
            
            if (!daiAddress || !daiAbi) {
                throw new Error('تنظیمات DAI ناقص است');
            }
            
            const daiContract = new ethers.Contract(daiAddress, daiAbi, signer);
            const daiAmountWei = ethers.parseUnits(daiAmount.toString(), 18);
            
            console.log('🔍 بررسی allowance...');
            // بررسی allowance
            const allowance = await daiContract.allowance(address, contract.target);
            console.log('📊 Allowance فعلی:', ethers.formatUnits(allowance, 18));
            
            if (allowance < daiAmountWei) {
                console.log('🔐 نیاز به تایید مجوز DAI...');
                this.showStatus('🔐 در حال تایید مجوز DAI...', 'loading');
                
                const approveTx = await daiContract.approve(contract.target, ethers.MaxUint256);
                this.showStatus('⏳ در انتظار تایید مجوز DAI...', 'loading', approveTx.hash);
                
                console.log('⏳ منتظر تایید approve...');
                await approveTx.wait();
                this.showStatus('✅ مجوز DAI تایید شد', 'success');
                console.log('✅ Approve تایید شد');
            } else {
                console.log('✅ Allowance کافی است');
            }
            
            // خرید CPA
            console.log('🛒 شروع خرید توکن CPA...');
            this.showStatus('🛒 در حال خرید توکن CPA...', 'loading');
            
            const tx = await contract.buyTokens(daiAmountWei);
            this.showStatus('⏳ در انتظار تایید تراکنش خرید...', 'loading', tx.hash);
            
            console.log('⏳ منتظر تایید تراکنش خرید...');
            await tx.wait();
            
            this.showStatus('✅ خرید موفق! توکن‌های CPA به کیف پول شما اضافه شد', 'success', tx.hash);
            console.log('✅ خرید با موفقیت تکمیل شد');
            
        } catch (error) {
            console.error('❌ خطا در خرید CPA:', error);
            throw error;
        }
    }

    // فروش CPA و دریافت DAI
    async sellTokensForDAI(cpaAmount) {
        console.log('💰 شروع فروش CPA و دریافت DAI:', cpaAmount);
        
        try {
            const contract = window.contractConfig.contract;
            
            if (!contract) {
                throw new Error('اتصال به قرارداد برقرار نیست');
            }
            
            const cpaAmountWei = ethers.parseUnits(cpaAmount.toString(), 18);
            
            console.log('💰 شروع فروش توکن CPA...');
            this.showStatus('💰 در حال فروش توکن CPA...', 'loading');
            
            const tx = await contract.sellTokens(cpaAmountWei);
            this.showStatus('⏳ در انتظار تایید تراکنش فروش...', 'loading', tx.hash);
            
            console.log('⏳ منتظر تایید تراکنش فروش...');
            await tx.wait();
            
            this.showStatus('✅ فروش موفق! DAI به کیف پول شما اضافه شد', 'success', tx.hash);
            console.log('✅ فروش با موفقیت تکمیل شد');
            
        } catch (error) {
            console.error('❌ خطا در فروش CPA:', error);
            throw error;
        }
    }

    async refreshSwapData() {
        console.log('🔄 رفرش داده‌های سواپ...');
        
        try {
            await this.loadSwapData();
            this.updateSwapRate();
            await this.updateSwapPreview();
            await this.updateSwapLimitInfo();
            
            console.log('✅ داده‌های سواپ رفرش شدند');
        } catch (error) {
            console.error('❌ خطا در رفرش داده‌های سواپ:', error);
        }
    }
}

// مقداردهی خودکار حذف شد - حالا در index.html انجام می‌شود
// document.addEventListener('DOMContentLoaded', async function() {
//     window.swapManager = new SwapManager();
//     await window.swapManager.initializeSwap();
// });

// Hook برای اتصال کیف پول
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
