// homepage.js
document.addEventListener('DOMContentLoaded', async () => {
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
            updateElement('remaining-points', parseFloat(additionalStats.remainingPoints).toLocaleString());
            // ارزش هر پوینت به دلار
            let pointValueUSD = parseFloat(additionalStats.pointValue) * parseFloat(priceUSD);
            updateElement('point-value', `$${Math.floor(pointValueUSD)} USD`);
            // استخر پاداش به دلار
            let rewardPoolUSD = parseFloat(stats.binaryPool) * parseFloat(priceUSD);
            updateElement('reward-pool', `$${formatDashboardPrice(rewardPoolUSD)} USD`);
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
        
        // اگر قیمت خیلی کوچک است، از مقدار پیش‌فرض استفاده کن
        if (numPrice < 0.0001) {
            console.log("Price too small, using default:", numPrice);
            return 0.0012;
        }
        
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
        const btn = document.getElementById('register-btn');
        const status = document.getElementById('register-status');
        const star = document.getElementById('register-star');
        if (!btn) return;
        try {
            // اتصال و دریافت مقدار مورد نیاز و موجودی کاربر
            const connection = await checkConnection();
            if (!connection.connected) {
                btn.textContent = 'Please connect your wallet';
                btn.disabled = true;
                status.textContent = '';
                if (star) star.style.display = 'none';
                return;
            }
            const { contract, address } = await connectWallet();
            
            // بررسی وضعیت کاربر
            const userData = await contract.users(address);
            
            if (userData.activated) {
                // کاربر قبلاً ثبت‌نام کرده - دکمه ارتقا
                const balanceRaw = await contract.balanceOf(address);
                const balance = ethers.formatUnits(balanceRaw, 18);
                const requiredAmount = 100; // مقدار ثابت برای ارتقا
                
                btn.textContent = `ارتقا (${requiredAmount} LVL)`;
                btn.disabled = parseFloat(balance) < requiredAmount;
                
                if (btn.disabled) {
                    status.textContent = `موجودی شما کافی نیست. موجودی: ${parseFloat(balance).toLocaleString('en-US', {maximumFractionDigits: 6})} LVL`;
                    status.style.color = 'red';
                } else {
                    status.textContent = '';
                }
                if (star) star.style.display = 'inline-block';
                return;
            }
            
            // کاربر ثبت‌نام نکرده - دکمه ثبت‌نام
            const requiredRaw = await contract.getRegistrationPrice();
            const required = ethers.formatUnits(requiredRaw, 18);
            const balanceRaw = await contract.balanceOf(address);
            const balance = ethers.formatUnits(balanceRaw, 18);
            
            if (star) star.style.display = 'none';
            
            const requiredFormatted = parseFloat(required).toLocaleString('en-US', {maximumFractionDigits: 6});
            btn.textContent = `ثبت‌نام (${requiredFormatted} LVL)`;
            btn.disabled = parseFloat(balance) < parseFloat(required);
            
            if (btn.disabled) {
                status.textContent = `موجودی شما کافی نیست. موجودی: ${parseFloat(balance).toLocaleString('en-US', {maximumFractionDigits: 6})} LVL`;
                status.style.color = 'red';
            } else {
                status.textContent = '';
            }
        } catch (e) {
            btn.textContent = 'Error loading registration info';
            btn.disabled = true;
            if (status) status.textContent = '';
            if (star) star.style.display = 'none';
        }
    }

    // هندل ثبت‌نام و ارتقا با یک کلیک
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
            const btn = registerBtn;
            const status = document.getElementById('register-status');
            const star = document.getElementById('register-star');
            btn.disabled = true;
            
            try {
                const { contract, address } = await connectWallet();
                const userData = await contract.users(address);
                
                if (userData.activated) {
                    // ارتقا برای کاربران فعال
                    btn.textContent = 'در حال ارتقا...';
                    
                    // محاسبه مقدار دلاری خرید
                    const lvlPriceUSD = await contract.getTokenPriceInUSD();
                    const lvlPriceUSDFormatted = parseFloat(ethers.formatUnits(lvlPriceUSD, 8));
                    const amountLvl = 100; // مقدار ثابت 100 LVL
                    const purchaseValueUSD = amountLvl * lvlPriceUSDFormatted;
                    
                    // بررسی اینکه آیا این خرید به 50 دلار می‌رسد
                    const currentTotalPurchased = parseFloat(ethers.formatUnits(userData.totalPurchasedKind, 18));
                    const newTotal = currentTotalPurchased + purchaseValueUSD;
                    
                    status.textContent = `در حال ارسال تراکنش ارتقا... (${purchaseValueUSD.toFixed(2)} USD)`;
                    
                    // ابتدا approve برای سوزاندن توکن‌ها
                    const approveTx = await contract.approve(contract.target, ethers.parseUnits(amountLvl.toString(), 18));
                    await approveTx.wait();
                    
                    // payout = 100 یعنی همه توکن‌ها به باینری پول می‌روند
                    const payout = 100;
                    
                    const tx = await contract.purchase(
                        ethers.parseUnits(amountLvl.toString(), 18),
                        payout
                    );
                    await tx.wait();
                    
                    // بررسی اینکه آیا امتیاز جدید اضافه شد
                    const updatedUserData = await contract.users(address);
                    const newCap = parseFloat(ethers.formatUnits(updatedUserData.binaryPointCap, 18));
                    const oldCap = parseFloat(ethers.formatUnits(userData.binaryPointCap, 18));
                    
                    if (newCap > oldCap) {
                        status.textContent = `ارتقا با موفقیت انجام شد! +${newCap - oldCap} امتیاز جدید`;
                    } else {
                        status.textContent = 'ارتقا با موفقیت انجام شد!';
                    }
                    status.style.color = 'green';
                    btn.textContent = 'ارتقا (100 LVL)';
                    btn.disabled = false;
                    if (star) star.style.display = 'inline-block';
                } else {
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
                    btn.textContent = 'ارتقا (100 LVL)';
                    btn.disabled = false;
                    if (star) star.style.display = 'inline-block';
                }
            } catch (e) {
                const errorMsg = e.reason || e.message || 'خطا در انجام تراکنش';
                status.textContent = 'خطا: ' + errorMsg;
                status.style.color = 'red';
                if (star) star.style.display = 'none';
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
        const crypto = await fetchCryptoPrices();
        let text = `
          <span style='margin-left:2rem;'>قیمت LVL: <b>${tokenPrice}</b></span>
          <span style='margin-left:2rem;'>ارزش هر پوینت: <b>${pointValue}</b></span>
          <span style='margin-left:2rem;'>کاربران: <b>${totalPoints}</b></span>
          <span style='margin-left:2rem;'>پوینت پرداخت‌شده: <b>${claimedPoints}</b></span>
          <span style='margin-left:2rem;'>حجم معاملات: <b>${tradingVolume}</b></span>
          <span style='margin-left:2rem;'>توکن‌های در گردش: <b>${circulatingSupply}</b></span>
          <span style='margin-left:2rem;'>BTC: <b>$${crypto.btc}</b></span>
          <span style='margin-left:2rem;'>ETH: <b>$${crypto.eth}</b></span>
          <span style='margin-left:2rem;'>MATIC: <b>$${crypto.matic}</b></span>
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

    // --- دریافت قیمت ارزهای دیجیتال (BTC, ETH, MATIC) از CoinGecko با پراکسی allorigins ---
    async function fetchCryptoPrices() {
      try {
        const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,matic-network&vs_currencies=usd";
        const proxy = "https://api.allorigins.win/get?url=" + encodeURIComponent(url);
        const res = await fetch(proxy);
        const data = await res.json();
        const parsed = JSON.parse(data.contents);
        return {
          btc: parsed.bitcoin?.usd || '-',
          eth: parsed.ethereum?.usd || '-',
          matic: parsed['matic-network']?.usd || '-'
        };
      } catch (e) {
        return { btc: '-', eth: '-', matic: '-' };
      }
    }

    // تعریف متغیر سراسری برای نمونه چارت
    window.priceChartInstance = null;

    // راه‌اندازی نمودار قیمت LVL هم به دلار و هم به متیک
    async function setupChart() {
      const ctx = document.getElementById('priceChart')?.getContext('2d');
      if (ctx) {
        try {
          if (window.priceChartInstance) {
            window.priceChartInstance.destroy();
            window.priceChartInstance = null;
          }

          // دریافت قیمت‌های LVL به USD و LVL به MATIC
          const { contract } = await connectWallet();
          // گرفتن داده‌های 7 روز گذشته (یا فقط قیمت فعلی اگر نشد)
          let priceUSD = [];
          let priceMATIC = [];
          let chartLabels = [];
          try {
            // قیمت LVL به USD (از تابع getTokenPriceInUSD)
            const urlUSD = "https://api.coingecko.com/api/v3/coins/levelup/market_chart?vs_currency=usd&days=7";
            const proxyUSD = "https://api.allorigins.win/get?url=" + encodeURIComponent(urlUSD);
            const resUSD = await fetch(proxyUSD);
            const dataUSD = await resUSD.json();
            const parsedUSD = JSON.parse(dataUSD.contents);
            priceUSD = parsedUSD.prices.map(item => item[1]);
            chartLabels = parsedUSD.prices.map(item => {
              const date = new Date(item[0]);
              return `${date.getMonth()+1}/${date.getDate()}`;
            });
          } catch (e) {
            // اگر نشد، فقط قیمت فعلی را بگیر
            const price = await contract.getTokenPriceInUSD();
            priceUSD = [parseFloat(ethers.formatUnits(price, 8))];
            chartLabels = ["Now"];
          }
          try {
            // قیمت LVL به MATIC (از تابع updateTokenPrice)
            const urlMATIC = "https://api.coingecko.com/api/v3/coins/levelup/market_chart?vs_currency=matic-network&days=7";
            const proxyMATIC = "https://api.allorigins.win/get?url=" + encodeURIComponent(urlMATIC);
            const resMATIC = await fetch(proxyMATIC);
            const dataMATIC = await resMATIC.json();
            const parsedMATIC = JSON.parse(dataMATIC.contents);
            priceMATIC = parsedMATIC.prices.map(item => item[1]);
          } catch (e) {
            // اگر نشد، فقط قیمت فعلی را بگیر
            const price = await contract.updateTokenPrice();
            priceMATIC = [parseFloat(ethers.formatEther(price))];
          }

          // ساخت چارت با دو دیتاست
          const priceChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: chartLabels,
              datasets: [
                {
                  label: 'قیمت LVL (USD)',
                  data: priceUSD,
                  borderColor: '#a786ff',
                  backgroundColor: 'rgba(167, 134, 255, 0.1)',
                  tension: 0.4,
                  pointRadius: 2,
                  pointBackgroundColor: '#fff',
                  pointBorderColor: '#a786ff',
                  pointBorderWidth: 1,
                  fill: false,
                  borderWidth: 2
                },
                {
                  label: 'قیمت LVL (MATIC)',
                  data: priceMATIC,
                  borderColor: '#4caf50',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  tension: 0.4,
                  pointRadius: 2,
                  pointBackgroundColor: '#fff',
                  pointBorderColor: '#4caf50',
                  pointBorderWidth: 1,
                  fill: false,
                  borderWidth: 2
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true },
                tooltip: {
                  backgroundColor: 'rgba(20, 18, 40, 0.95)',
                  titleColor: '#a786ff',
                  bodyColor: '#fff',
                  borderColor: '#a786ff',
                  borderWidth: 1,
                  cornerRadius: 8,
                  displayColors: true,
                  callbacks: {
                    label: function(context) {
                      // نمایش علمی با 2 رقم اعشار
                      return `${context.dataset.label}: ${context.parsed.y.toExponential(2)}`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  ticks: { color: '#aaa', font: { family: 'Vazirmatn', size: 12 } },
                  grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false }
                },
                y: {
                  ticks: {
                    color: '#fff',
                    font: { family: 'Vazirmatn', size: 11 },
                    callback: function(value) {
                      // نمایش علمی با 2 رقم اعشار
                      return value.toExponential(2);
                    }
                  },
                  grid: { color: 'rgba(255,255,255,0.08)', drawBorder: false },
                  beginAtZero: false
                }
              },
              interaction: { intersect: false, mode: 'index' },
              elements: { point: { hoverRadius: 6, hoverBorderWidth: 2 } }
            }
          });
          window.priceChartInstance = priceChart;
        } catch (error) {
          console.error("Error initializing chart:", error);
          const chartSection = document.querySelector('.chart-section');
          if (chartSection) {
            chartSection.innerHTML = `
              <h3 style="text-align:center; color:#a786ff;">نمودار قیمت LVL به دلار (USD) و متیک (MATIC)</h3>
              <div style="text-align:center; color:#ff6b6b; padding:2rem;">
                خطا در بارگذاری نمودار: ${error.message}
              </div>
            `;
          }
        }
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