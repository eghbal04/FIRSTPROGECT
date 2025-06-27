// homepage.js
document.addEventListener('DOMContentLoaded', async () => {
    // --- منطق expand/collapse برای بخش‌ها ---
    const expandButtons = document.querySelectorAll('.expand-toggle-btn');
    
    expandButtons.forEach(button => {
        button.addEventListener('click', function() {
            const container = this.closest('.expandable-container');
            const isCollapsed = container.classList.contains('collapsed');
            
            // بستن همه بخش‌های دیگر
            if (isCollapsed) {
                document.querySelectorAll('.expandable-container').forEach(otherContainer => {
                    if (otherContainer !== container) {
                        otherContainer.classList.add('collapsed');
                        const otherBtn = otherContainer.querySelector('.expand-toggle-btn');
                        if (otherBtn) otherBtn.textContent = '+';
                    }
                });
            }
            
            // تغییر وضعیت بخش فعلی
            container.classList.toggle('collapsed');
            this.textContent = container.classList.contains('collapsed') ? '+' : '−';
        });
    });

    // باز شدن خودکار بخش با کلیک روی ناوبار
    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
            const hash = link.getAttribute('href');
            if (!hash || !hash.startsWith('#')) return;
            const targetId = hash.replace('#', '');
            
            document.querySelectorAll('.expandable-container').forEach(function(section) {
                if (section.id === targetId) {
                    section.classList.remove('collapsed');
                    const btn = section.querySelector('.expand-toggle-btn');
                    if (btn) btn.textContent = '−';
                } else {
                    section.classList.add('collapsed');
                    const btn = section.querySelector('.expand-toggle-btn');
                    if (btn) btn.textContent = '+';
                }
            });
        });
    });

    // بررسی وجود ethers.js
    if (typeof ethers === 'undefined') {
        console.error("Ethers.js not loaded!");
        return;
    }

    // بررسی وجود contractConfig
    if (!window.contractConfig) {
        console.error("Contract config not loaded!");
        return;
    }

    // اسلایدر انگیزشی
const motivationalMessages = [
    "امروز بهترین زمان برای شروع است!",
    "با LevelUp، آینده خود را بساز!",
    "هر قدم کوچک، یک پیروزی بزرگ است.",
    "یادگیری، سرمایه‌گذاری روی خود است.",
    "با تلاش و پشتکار، غیرممکن وجود ندارد!"
];
    let currentMessage = 0;

    function getRandomMessageIndex(excludeIndex) {
        let idx;
        do {
            idx = Math.floor(Math.random() * motivationalMessages.length);
        } while (motivationalMessages.length > 1 && idx === excludeIndex);
        return idx;
    }

    function updateMotivationalMessage() {
        const messageElement = document.getElementById('motivation-message');
        if (messageElement) {
            messageElement.textContent = motivationalMessages[currentMessage];
        }
    }

    const nextButton = document.getElementById('next-motivation');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const prev = currentMessage;
            currentMessage = getRandomMessageIndex(prev);
            updateMotivationalMessage();
        });
    }
    // نمایش پیام رندوم در بارگذاری اولیه
    currentMessage = getRandomMessageIndex(-1);
    updateMotivationalMessage();

    // تابع تست برای بررسی مشکل
    async function testContractStats() {
        try {
            console.log("Testing contract stats...");
            const stats = await getContractStats();
            console.log("Contract stats received:", stats);
            console.log("Circulating supply:", stats.circulatingSupply);
            console.log("Total points:", stats.totalPoints);
            console.log("Total users:", stats.totalUsers);
            console.log("Total direct deposits:", stats.totalDirectDeposits);
            console.log("Reward pool:", stats.rewardPool);
            return stats;
        } catch (error) {
            console.error("Error in testContractStats:", error);
            return null;
        }
    }

    // تابع جایگزین برای دریافت توکن در گردش
    async function getCirculatingSupply() {
        try {
            const { contract } = await connectWallet();
            
            // تلاش برای دریافت از تابع circulatingSupply
            try {
                const circulatingSupply = await contract.circulatingSupply();
                console.log("Raw circulating supply:", circulatingSupply.toString());
                
                // اگر circulatingSupply صفر است، از totalSupply استفاده کن
                if (circulatingSupply.toString() === "0") {
                    console.log("Circulating supply is 0, using total supply...");
                    const totalSupply = await contract.totalSupply();
                    console.log("Total supply:", totalSupply.toString());
                    return ethers.formatUnits(totalSupply, 18);
                }
                
                return ethers.formatUnits(circulatingSupply, 18);
            } catch (error) {
                console.log("circulatingSupply function failed, trying totalSupply...");
                
                // اگر تابع circulatingSupply وجود نداشت، از totalSupply استفاده کن
                const totalSupply = await contract.totalSupply();
                console.log("Total supply:", totalSupply.toString());
                return ethers.formatUnits(totalSupply, 18);
            }
        } catch (error) {
            console.error("Error getting circulating supply:", error);
            return "0";
        }
    }

    // تابع به‌روزرسانی آمار توکن
    async function updateTokenStats() {
        try {
            console.log("Starting updateTokenStats...");
            // بررسی اتصال کیف پول
            const connection = await checkConnection();
            console.log("Connection status:", connection);
            if (!connection.connected) {
                showDashboardError("لطفاً ابتدا کیف پول خود را متصل کنید.");
                return;
            }
            // تست اتصال قرارداد
            const contractTest = await testContractConnection();
            if (!contractTest) {
                showDashboardError("خطا در ارتباط با قرارداد هوشمند.");
                return;
            }
            // دریافت توکن در گردش به صورت جداگانه
            const circulatingSupply = await getCirculatingSupply();
            console.log("Circulating supply received:", circulatingSupply);
            // تست دریافت آمار قرارداد
            const stats = await testContractStats();
            if (!stats) {
                showDashboardError("خطا در دریافت آمار قرارداد.");
                return;
            }
            console.log("Total points from contract:", stats.totalPoints);
            // دریافت اطلاعات اضافی
            const additionalStats = await getAdditionalStats();
            console.log("Additional stats:", additionalStats);
            // دریافت حجم معاملات
            const tradingVolume = await getTradingVolume();
            console.log("Trading volume:", tradingVolume);
            // دریافت قیمت‌ها
            const prices = await getPrices();
            console.log("Prices received:", prices);
            // به‌روزرسانی UI
            const updateElement = (id, value) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                    console.log(`Updated ${id}: ${value}`);
                } else {
                    console.warn(`Element with id '${id}' not found`);
                }
            };
            // نمایش قیمت دلاری توکن LVL
            let priceUSD = prices.tokenPriceUSD;
            if (priceUSD && !isNaN(priceUSD) && parseFloat(priceUSD) > 0) {
                const formattedPrice = formatDashboardPrice(priceUSD);
                updateElement('token-price', `$${formattedPrice} USD`);
            } else {
                showDashboardError("قیمت توکن قابل دریافت نیست.");
            }
            updateElement('circulating-supply', parseFloat(circulatingSupply).toLocaleString() + ' LVL');
            // نمایش total points یا تعداد کاربران
            const totalPointsValue = parseFloat(stats.totalPoints);
            if (totalPointsValue > 0) {
                updateElement('total-points', `${totalPointsValue.toLocaleString()} پوینت`);
            } else {
                updateElement('total-points', `${stats.totalUsers} کاربر`);
            }
            // اطلاعات جدید
            // تبدیل حجم معاملات به دلار
            let tradingVolumeUSD = parseFloat(tradingVolume) * parseFloat(prices.maticPrice);
            updateElement('trading-volume', `$${tradingVolumeUSD.toLocaleString('en-US', {maximumFractionDigits: 2})} USD`);
            // پوینت‌های پرداخت شده و مانده بدون تغییر (عدد)
            updateElement('claimed-points', parseFloat(additionalStats.claimedPoints).toLocaleString());
            updateElement('remaining-points', Math.max(0, parseFloat(additionalStats.remainingPoints)).toLocaleString());
            // ارزش هر پوینت به توکن LVL
            updateElement('point-value', `${formatDashboardPrice(additionalStats.pointValue)} LVL`);
            // استخر پاداش به توکن LVL
            updateElement('reward-pool', `${formatDashboardPrice(stats.binaryPool)} LVL`);
            // فراخوانی updateMarquee برای نمایش اطلاعات به‌روز در مارکی
            if (typeof updateMarquee === 'function') updateMarquee();
        } catch (error) {
            console.error("Error updating token stats:", error);
            showDashboardError("خطا در دریافت اطلاعات. لطفاً کیف پول و اتصال اینترنت را بررسی کنید.");
        }
    }

    // تابع نمایش خطا در داشبورد
    function showDashboardError(message) {
        const ids = [
            'token-price',
            'circulating-supply',
            'total-points',
            'trading-volume',
            'claimed-points',
            'remaining-points',
            'point-value',
            'reward-pool'
        ];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = message;
        });
    }

    // تابع تست ساده برای بررسی اتصال قرارداد
    async function testContractConnection() {
        try {
            const { contract } = await connectWallet();
            console.log("Contract address:", contract.target);
            
            // تست توابع ساده
            const totalUsers = await contract.totalUsers();
            console.log("Total users test:", totalUsers.toString());
            
            const totalSupply = await contract.totalSupply();
            console.log("Total supply test:", totalSupply.toString());
            
            return true;
        } catch (error) {
            console.error("Contract connection test failed:", error);
            return false;
        }
    }

    // تابع کمکی برای فرمت کردن قیمت‌ها
    function formatPriceForChart(price) {
        if (!price || isNaN(price) || parseFloat(price) <= 0) {
            return 0.0012; // قیمت پیش‌فرض
        }
        const numPrice = parseFloat(price);
        return numPrice;
    }

    // تابع ایجاد داده‌های چارت با تغییرات واقعی
    function generateChartData(basePrice) {
        const variation = 0.05; // 5% تغییر
        return [
            basePrice * (1 - variation * 0.4),  // 1D - کمی کمتر
            basePrice * (1 - variation * 0.2),  // 1W - کمی کمتر
            basePrice,                          // 1M - قیمت فعلی
            basePrice * (1 + variation * 0.2),  // 3M - کمی بیشتر
            basePrice * (1 + variation * 0.4)   // 1Y - بیشتر
        ];
    }

    // تابع فرمت کردن قیمت برای نمایش
    function formatPriceDisplay(price) {
        return price.toFixed(4); // 4 رقم اعشار
    }

    // تابع نمایش بهتر قیمت در داشبورد
    function formatDashboardPrice(price) {
        const numPrice = parseFloat(price);
        if (numPrice < 0.01) {
            return numPrice.toFixed(6); // 6 رقم اعشار برای قیمت‌های کوچک
        } else if (numPrice < 1) {
            return numPrice.toFixed(4); // 4 رقم اعشار
        } else {
            return numPrice.toFixed(2); // 2 رقم اعشار
        }
    }

    // فراخوانی تابع به‌روزرسانی آمار
    await updateTokenStats();

    // رفرش خودکار داده‌های داشبورد هر 3 دقیقه
    setInterval(() => {
      updateTokenStats();
    }, 180000); // هر 180 ثانیه

    // --- ثبت‌نام با یک کلیک: دکمه و منطق ---
    async function updateRegisterButton() {
        const registerForm = document.getElementById('registration-form');
        const upgradeForm = document.getElementById('upgrade-form');
        const registerBtn = document.getElementById('register-btn');
        const upgradeBtn = document.getElementById('upgrade-btn');
        const upgradeAmount = document.getElementById('upgrade-amount');
        const registerStatus = document.getElementById('register-status');
        const upgradeStatus = document.getElementById('upgrade-status');
        const star = document.getElementById('register-star');
        
        // عناصر جدید
        const userBalanceDisplay = document.getElementById('user-balance-display');
        const userLvlBalance = document.getElementById('user-lvl-balance');
        const userLvlUsdValue = document.getElementById('user-lvl-usd-value');
        const registrationRequired = document.getElementById('registration-required');
        const registrationStatusText = document.getElementById('registration-status-text');
        const upgradeUsdValue = document.getElementById('upgrade-usd-value');
        const upgradePointsGain = document.getElementById('upgrade-points-gain');
        
        if (!registerForm || !upgradeForm) return;
        
        try {
            // اتصال و دریافت مقدار مورد نیاز و موجودی کاربر
            const connection = await checkConnection();
            if (!connection.connected) {
                registerForm.style.display = 'none';
                upgradeForm.style.display = 'none';
                if (userBalanceDisplay) userBalanceDisplay.style.display = 'none';
                if (star) star.style.display = 'none';
                return;
            }
            
            const { contract, address } = await connectWallet();
            
            // دریافت موجودی کاربر
            const balanceRaw = await contract.balanceOf(address);
            const balance = ethers.formatUnits(balanceRaw, 18);
            const balanceNum = parseFloat(balance);
            
            // دریافت قیمت توکن
            const lvlPriceUSD = await contract.getTokenPriceInUSD();
            const lvlPriceUSDFormatted = parseFloat(ethers.formatUnits(lvlPriceUSD, 8));
            const balanceUSD = balanceNum * lvlPriceUSDFormatted;
            
            // نمایش موجودی کاربر
            if (userLvlBalance) {
                userLvlBalance.textContent = `${balanceNum.toLocaleString('en-US', {maximumFractionDigits: 6})} LVL`;
            }
            if (userLvlUsdValue) {
                userLvlUsdValue.textContent = `≈ $${balanceUSD.toLocaleString('en-US', {maximumFractionDigits: 2})} USD`;
            }
            if (userBalanceDisplay) {
                userBalanceDisplay.style.display = 'block';
            }
            
            // بررسی وضعیت کاربر
            const userData = await contract.users(address);
            
            if (userData.activated) {
                // کاربر قبلاً ثبت‌نام کرده - نمایش فرم ارتقا
                registerForm.style.display = 'none';
                upgradeForm.style.display = 'block';
                
                // به‌روزرسانی placeholder با موجودی کاربر
                if (upgradeAmount) {
                    upgradeAmount.placeholder = `حداکثر: ${balanceNum.toLocaleString('en-US', {maximumFractionDigits: 6})} LVL`;
                    upgradeAmount.max = balanceNum;
                }
                
                if (star) star.style.display = 'inline-block';
                return;
            }
            
            // کاربر ثبت‌نام نکرده - نمایش فرم ثبت‌نام
            registerForm.style.display = 'block';
            upgradeForm.style.display = 'none';
            
            const requiredRaw = await contract.getRegistrationPrice();
            const required = ethers.formatUnits(requiredRaw, 18);
            const requiredNum = parseFloat(required);
            const requiredUSD = requiredNum * lvlPriceUSDFormatted;
            
            if (star) star.style.display = 'none';
            
            // نمایش مقدار مورد نیاز
            if (registrationRequired) {
                registrationRequired.textContent = `${requiredNum.toLocaleString('en-US', {maximumFractionDigits: 6})} LVL (≈ $${requiredUSD.toLocaleString('en-US', {maximumFractionDigits: 2})} USD)`;
            }
            
            // بررسی وضعیت موجودی
            const hasEnoughBalance = balanceNum >= requiredNum;
            if (registrationStatusText) {
                if (hasEnoughBalance) {
                    registrationStatusText.textContent = '✅ موجودی کافی';
                    registrationStatusText.style.color = '#4caf50';
                } else {
                    registrationStatusText.textContent = '❌ موجودی ناکافی';
                    registrationStatusText.style.color = '#ff6b6b';
                }
            }
            
            const requiredFormatted = requiredNum.toLocaleString('en-US', {maximumFractionDigits: 6});
            registerBtn.textContent = `ثبت‌نام (${requiredFormatted} LVL)`;
            registerBtn.disabled = !hasEnoughBalance;
            
            if (registerBtn.disabled) {
                registerStatus.textContent = `موجودی شما کافی نیست. موجودی: ${balanceNum.toLocaleString('en-US', {maximumFractionDigits: 6})} LVL`;
                registerStatus.style.color = 'red';
            } else {
                registerStatus.textContent = '';
            }
        } catch (e) {
            registerForm.style.display = 'none';
            upgradeForm.style.display = 'none';
            if (userBalanceDisplay) userBalanceDisplay.style.display = 'none';
            if (star) star.style.display = 'none';
        }
    }

    // تابع محاسبه ارزش دلاری و امتیاز برای ارتقا
    async function calculateUpgradeValues(amount) {
        try {
            const { contract } = await connectWallet();
            const lvlPriceUSD = await contract.getTokenPriceInUSD();
            const lvlPriceUSDFormatted = parseFloat(ethers.formatUnits(lvlPriceUSD, 8));
            const usdValue = amount * lvlPriceUSDFormatted;
            const pointsGain = Math.floor(usdValue / 50); // هر 50 دلار = 1 امتیاز
            
            return {
                usdValue: usdValue.toFixed(2),
                pointsGain: pointsGain
            };
        } catch (error) {
            return {
                usdValue: '0.00',
                pointsGain: 0
            };
        }
    }

    // هندل ثبت‌نام
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
            const btn = registerBtn;
            const status = document.getElementById('register-status');
            const star = document.getElementById('register-star');
            btn.disabled = true;
            
            try {
                const { contract, address } = await connectWallet();
                
                // ثبت‌نام برای کاربران جدید
                btn.textContent = 'در حال ثبت‌نام...';
                const requiredRaw = await contract.getRegistrationPrice();
                const required = ethers.formatUnits(requiredRaw, 18);
                
                const urlParams = new URLSearchParams(window.location.search);
                const referrer = urlParams.get('ref') || '0x0000000000000000000000000000000000000000';
                
                status.textContent = 'در حال ارسال تراکنش...';
                const tx = await contract.registerAndActivate(referrer, ethers.parseUnits(required, 18));
                await tx.wait();
                
                status.textContent = 'ثبت‌نام با موفقیت انجام شد!';
                status.style.color = 'green';
                btn.textContent = 'ثبت‌نام';
                btn.disabled = false;
                if (star) star.style.display = 'inline-block';
                
                // به‌روزرسانی فرم‌ها
                await updateRegisterButton();
            } catch (e) {
                const errorMsg = e.reason || e.message || 'خطا در انجام تراکنش';
                status.textContent = 'خطا: ' + errorMsg;
                status.style.color = 'red';
                if (star) star.style.display = 'none';
                await updateRegisterButton();
            }
        });
    }

    // هندل ارتقا
    const upgradeBtn = document.getElementById('upgrade-btn');
    const upgradeAmount = document.getElementById('upgrade-amount');
    
    if (upgradeBtn && upgradeAmount) {
        // Validation و محاسبه real-time برای input
        upgradeAmount.addEventListener('input', async () => {
            const amount = parseFloat(upgradeAmount.value);
            const isValid = amount > 0 && !isNaN(amount);
            
            // به‌روزرسانی دکمه
            upgradeBtn.disabled = !isValid;
            
            if (isValid) {
                // محاسبه ارزش دلاری و امتیاز
                const values = await calculateUpgradeValues(amount);
                
                // به‌روزرسانی نمایش
                const upgradeUsdValue = document.getElementById('upgrade-usd-value');
                const upgradePointsGain = document.getElementById('upgrade-points-gain');
                
                if (upgradeUsdValue) {
                    upgradeUsdValue.textContent = `$${values.usdValue} USD`;
                }
                if (upgradePointsGain) {
                    if (values.pointsGain > 0) {
                        upgradePointsGain.textContent = `+${values.pointsGain} امتیاز`;
                        upgradePointsGain.style.color = '#4caf50';
                    } else {
                        upgradePointsGain.textContent = '0 امتیاز';
                        upgradePointsGain.style.color = '#ff6b6b';
                    }
                }
            } else {
                // پاک کردن نمایش
                const upgradeUsdValue = document.getElementById('upgrade-usd-value');
                const upgradePointsGain = document.getElementById('upgrade-points-gain');
                
                if (upgradeUsdValue) upgradeUsdValue.textContent = '-';
                if (upgradePointsGain) {
                    upgradePointsGain.textContent = '-';
                    upgradePointsGain.style.color = '#ccc';
                }
            }
        });
        
        upgradeBtn.addEventListener('click', async () => {
            const btn = upgradeBtn;
            const status = document.getElementById('upgrade-status');
            const star = document.getElementById('register-star');
            const amount = parseFloat(upgradeAmount.value);
            
            if (!amount || amount <= 0) {
                status.textContent = 'لطفاً مقدار معتبر وارد کنید';
                status.style.color = 'red';
                return;
            }
            
            btn.disabled = true;
            
            try {
                const { contract, address } = await connectWallet();
                const userData = await contract.users(address);
                
                // بررسی موجودی
                const balanceRaw = await contract.balanceOf(address);
                const balance = parseFloat(ethers.formatUnits(balanceRaw, 18));
                
                if (balance < amount) {
                    status.textContent = `موجودی شما کافی نیست. موجودی: ${balance.toLocaleString('en-US', {maximumFractionDigits: 6})} LVL`;
                    status.style.color = 'red';
                    btn.disabled = false;
                    return;
                }
                
                // ارتقا با مقدار دلخواه کاربر
                btn.textContent = 'در حال افزایش سقف...';
                
                // محاسبه مقدار دلاری خرید
                const lvlPriceUSD = await contract.getTokenPriceInUSD();
                const lvlPriceUSDFormatted = parseFloat(ethers.formatUnits(lvlPriceUSD, 8));
                const purchaseValueUSD = amount * lvlPriceUSDFormatted;
                
                // بررسی اینکه آیا این خرید به 50 دلار می‌رسد
                const currentTotalPurchased = parseFloat(ethers.formatUnits(userData.totalPurchasedKind, 18));
                const newTotal = currentTotalPurchased + purchaseValueUSD;
                
                status.textContent = `در حال ارسال تراکنش افزایش سقف... (${purchaseValueUSD.toFixed(2)} USD)`;
                
                // ابتدا approve برای سوزاندن توکن‌ها
                const approveTx = await contract.approve(contract.target, ethers.parseUnits(amount.toString(), 18));
                await approveTx.wait();
                
                // payout = 100 یعنی همه توکن‌ها به باینری پول می‌روند
                const payout = 100;
                
                const tx = await contract.purchase(
                    ethers.parseUnits(amount.toString(), 18),
                    payout
                );
                await tx.wait();
                
                // بررسی اینکه آیا امتیاز جدید اضافه شد
                const updatedUserData = await contract.users(address);
                const newCap = parseFloat(ethers.formatUnits(updatedUserData.binaryPointCap, 18));
                const oldCap = parseFloat(ethers.formatUnits(userData.binaryPointCap, 18));
                
                if (newCap > oldCap) {
                    status.textContent = `افزایش سقف با موفقیت انجام شد! +${newCap - oldCap} امتیاز جدید`;
                } else {
                    status.textContent = 'افزایش سقف با موفقیت انجام شد!';
                }
                status.style.color = 'green';
                btn.textContent = 'افزایش سقف';
                btn.disabled = false;
                upgradeAmount.value = '';
                if (star) star.style.display = 'inline-block';
                
                // به‌روزرسانی فرم‌ها
                await updateRegisterButton();
            } catch (e) {
                const errorMsg = e.reason || e.message || 'خطا در انجام تراکنش';
                status.textContent = 'خطا: ' + errorMsg;
                status.style.color = 'red';
                if (star) star.style.display = 'none';
                btn.disabled = false;
                await updateRegisterButton();
            }
        });
    }

    // مقداردهی اولیه و رفرش خودکار دکمه ثبت‌نام
    await updateRegisterButton();
    setInterval(updateRegisterButton, 120000); // هر 2 دقیقه رفرش

    // --- Marquee updater (for modern CSS marquee) ---
    async function updateMarquee() {
      const marqueeContent = document.getElementById('marquee-content');
      const marqueeContentClone = document.getElementById('marquee-content-clone');
      if (!marqueeContent || !marqueeContentClone) return;
      try {
        const tokenPrice = document.getElementById('token-price')?.textContent || '-';
        const circulatingSupply = document.getElementById('circulating-supply')?.textContent || '-';
        const totalPoints = document.getElementById('total-points')?.textContent || '-';
        const tradingVolume = document.getElementById('trading-volume')?.textContent || '-';
        const claimedPoints = document.getElementById('claimed-points')?.textContent || '-';
        const pointValue = document.getElementById('point-value')?.textContent || '-';
        const rewardPool = document.getElementById('reward-pool')?.textContent || '-';
        const remainingPoints = document.getElementById('remaining-points')?.textContent || '-';
        
        let text = `
          <span style='margin-left:2rem;'>قیمت LVL: <b>${tokenPrice}</b></span>
          <span style='margin-left:2rem;'>ارزش هر پوینت: <b>${pointValue}</b></span>
          <span style='margin-left:2rem;'>کاربران: <b>${totalPoints}</b></span>
          <span style='margin-left:2rem;'>پوینت پرداخت‌شده: <b>${claimedPoints}</b></span>
          <span style='margin-left:2rem;'>پوینت باقی‌مانده: <b>${remainingPoints}</b></span>
          <span style='margin-left:2rem;'>حجم معاملات: <b>${tradingVolume}</b></span>
          <span style='margin-left:2rem;'>استخر پاداش: <b>${rewardPool}</b></span>
          <span style='margin-left:2rem;'>توکن‌های در گردش: <b>${circulatingSupply}</b></span>
        `;
        marqueeContent.innerHTML = text;
        marqueeContentClone.innerHTML = text;
        // ریست انیمیشن marquee-track برای حرکت پیوسته
        const track = document.querySelector('.marquee-track');
        if (track) {
          track.style.animation = 'none';
          void track.offsetWidth;
          track.style.animation = null;
        }
      } catch (e) {
        marqueeContent.innerHTML = '<span style="color:#ff6b6b">خطا در دریافت اطلاعات مارکِی</span>';
        marqueeContentClone.innerHTML = '';
        console.error('Marquee error:', e);
      }
    }

    // تعریف متغیر سراسری برای نمونه چارت
    window.priceChartInstance = null;

    // راه‌اندازی نمایش قیمت‌های LVL
    async function setupChart() {
      const chartSection = document.querySelector('.chart-section');
      if (!chartSection) return;

      try {
        // دریافت قیمت‌های فعلی از قرارداد
        const { contract } = await connectWallet();
        
        // دریافت قیمت‌های فعلی
        const [tokenPriceUSD, tokenPriceMATIC, maticPrice] = await Promise.all([
          contract.getTokenPriceInUSD(),
          contract.updateTokenPrice(),
          contract.getLatestMaticPrice()
        ]);
        
        // فرمت کردن قیمت‌ها
        const priceUSD = parseFloat(ethers.formatUnits(tokenPriceUSD, 8));
        const priceMATIC = parseFloat(ethers.formatUnits(tokenPriceMATIC, 18));
        const maticPriceUSD = parseFloat(ethers.formatUnits(maticPrice, 8));
        
        // بررسی مقادیر معتبر
        if (isNaN(priceUSD) || isNaN(priceMATIC) || isNaN(maticPriceUSD) || 
            priceUSD <= 0 || priceMATIC <= 0 || maticPriceUSD <= 0) {
          throw new Error("قیمت‌های دریافتی نامعتبر هستند");
        }

        // نمایش قیمت‌ها به صورت کارت‌های زیبا
        chartSection.innerHTML = `
          <h3 style="text-align:center; color:#007AFF; margin-bottom: 2rem; font-size: 1.5rem; font-weight: 600;">قیمت‌های فعلی LVL</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: rgba(0, 122, 255, 0.1); padding: 2rem; border-radius: 20px; border: 2px solid rgba(0, 122, 255, 0.3); text-align: center; box-shadow: 0 8px 32px rgba(0, 122, 255, 0.1);">
              <div style="font-size: 1.3rem; font-weight: bold; color: #007AFF; margin-bottom: 1rem;">قیمت LVL/USD</div>
              <div style="font-size: 2rem; font-weight: bold; color: #1D1D1F; margin-bottom: 0.5rem;">$${priceUSD.toExponential(6)}</div>
              <div style="font-size: 0.9rem; color: #8E8E93;">قیمت دلاری توکن LVL</div>
            </div>
            <div style="background: rgba(52, 199, 89, 0.1); padding: 2rem; border-radius: 20px; border: 2px solid rgba(52, 199, 89, 0.3); text-align: center; box-shadow: 0 8px 32px rgba(52, 199, 89, 0.1);">
              <div style="font-size: 1.3rem; font-weight: bold; color: #34C759; margin-bottom: 1rem;">قیمت LVL/MATIC</div>
              <div style="font-size: 2rem; font-weight: bold; color: #1D1D1F; margin-bottom: 0.5rem;">${priceMATIC.toExponential(6)}</div>
              <div style="font-size: 0.9rem; color: #8E8E93;">قیمت MATIC توکن LVL</div>
            </div>
            <div style="background: rgba(255, 149, 0, 0.1); padding: 2rem; border-radius: 20px; border: 2px solid rgba(255, 149, 0, 0.3); text-align: center; box-shadow: 0 8px 32px rgba(255, 149, 0, 0.1);">
              <div style="font-size: 1.3rem; font-weight: bold; color: #FF9500; margin-bottom: 1rem;">قیمت MATIC/USD</div>
              <div style="font-size: 2rem; font-weight: bold; color: #1D1D1F; margin-bottom: 0.5rem;">$${maticPriceUSD.toFixed(4)}</div>
              <div style="font-size: 0.9rem; color: #8E8E93;">قیمت دلاری MATIC</div>
            </div>
          </div>
          <div style="text-align: center; color: #8E8E93; font-size: 0.9rem; padding: 1rem; background: rgba(0, 0, 0, 0.05); border-radius: 12px;">
            💡 قیمت‌ها به صورت لحظه‌ای از قرارداد هوشمند LevelUp دریافت می‌شوند
          </div>
        `;
        
      } catch (error) {
        console.error("Error getting prices:", error);
        chartSection.innerHTML = `
          <h3 style="text-align:center; color:#007AFF;">قیمت‌های LVL</h3>
          <div style="text-align:center; color:#FF3B30; padding:2rem; background: rgba(255, 59, 48, 0.1); border-radius: 12px; border: 1px solid rgba(255, 59, 48, 0.3);">
            <p>خطا در دریافت قیمت‌ها:</p>
            <p>${error.message}</p>
            <p style="font-size: 0.9rem; margin-top: 1rem;">لطفاً کیف پول خود را متصل کنید و دوباره تلاش کنید.</p>
          </div>
        `;
      }
    }

    // فراخوانی راه‌اندازی چارت بعد از مقداردهی داشبورد
    setupChart();
});

// تابع بررسی وضعیت اتصال (در صورت عدم وجود در web3-interactions.js)
async function checkConnection() {
    try {
        const { provider, address } = await connectWallet();
        const network = await provider.getNetwork();
        
        return {
            connected: true,
            address,
            network: network.name,
            chainId: network.chainId
        };
    } catch (error) {
        return {
            connected: false,
            error: error.message
        };
    }
}

// تابع اتصال به کیف پول (در صورت عدم وجود در web3-interactions.js)
async function connectWallet() {
    if (!window.contractConfig) {
        throw new Error("Contract config not initialized");
    }

    await window.contractConfig.initializeWeb3();
    return {
        provider: window.contractConfig.provider,
        contract: window.contractConfig.contract,
        signer: window.contractConfig.signer,
        address: await window.contractConfig.signer.getAddress()
    };
}