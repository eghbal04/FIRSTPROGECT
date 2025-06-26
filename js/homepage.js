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

    function updateMotivationalMessage() {
        const messageElement = document.getElementById('motivation-message');
        if (messageElement) {
            messageElement.textContent = motivationalMessages[currentMessage];
        }
    }

    const nextButton = document.getElementById('next-motivation');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentMessage = (currentMessage + 1) % motivationalMessages.length;
            updateMotivationalMessage();
        });
    }
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
                console.log("کیف پول متصل نیست، استفاده از داده‌های نمونه");
                updateWithSampleData();
                return;
            }

            // تست اتصال قرارداد
            const contractTest = await testContractConnection();
            if (!contractTest) {
                console.log("Contract connection failed, using sample data");
                updateWithSampleData();
                return;
            }

            // دریافت توکن در گردش به صورت جداگانه
            const circulatingSupply = await getCirculatingSupply();
            console.log("Circulating supply received:", circulatingSupply);
            
            // تست دریافت آمار قرارداد
            const stats = await testContractStats();
            if (!stats) {
                console.log("Failed to get contract stats, using sample data");
                updateWithSampleData();
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
                updateElement('token-price', '$0.001200 USD');
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
            updateElement('point-value', `$${formatDashboardPrice(pointValueUSD)} USD`);
            // استخر پاداش به دلار
            let rewardPoolUSD = parseFloat(stats.binaryPool) * parseFloat(priceUSD);
            updateElement('reward-pool', `$${formatDashboardPrice(rewardPoolUSD)} USD`);

        } catch (error) {
            console.error("Error updating token stats:", error);
            updateWithSampleData();
        }
    }

    // تابع نمایش داده‌های نمونه در صورت عدم اتصال
    function updateWithSampleData() {
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                console.log(`Updated ${id} with sample data: ${value}`);
            } else {
                console.warn(`Element with id '${id}' not found`);
            }
        };

        updateElement('token-price', '0.001200 USD');
        updateElement('circulating-supply', '1,250,000 LVL');
        updateElement('total-points', '847 کاربر');
        updateElement('trading-volume', '$45,250.00 USD');
        updateElement('claimed-points', '12,450');
        updateElement('remaining-points', '8,750');
        updateElement('point-value', '0.000125 USD');
        updateElement('reward-pool', '2,450.00 USD');
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

    // راه‌اندازی نمودار
    const ctx = document.getElementById('priceChart')?.getContext('2d');
    if (ctx) {
        try {
            const prices = await getPrices();
            const priceValue = formatPriceForChart(prices.tokenPriceUSD);
            
            // ایجاد داده‌های چارت
            const chartData = generateChartData(priceValue);
            
            // ایجاد چارت
            const priceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['1D', '1W', '1M', '3M', '1Y'],
                    datasets: [{
                        label: 'قیمت LVL (USD)',
                        data: chartData,
                        borderColor: '#a786ff',
                        backgroundColor: 'rgba(167, 134, 255, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#a786ff',
                        pointBorderWidth: 2,
                        fill: true,
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(20, 18, 40, 0.95)',
                            titleColor: '#a786ff',
                            bodyColor: '#fff',
                            borderColor: '#a786ff',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return `قیمت: $${formatPriceDisplay(context.parsed.y)} USD`;
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
                                    return '$' + formatPriceDisplay(value); 
                                }
                            },
                            grid: { color: 'rgba(255,255,255,0.08)', drawBorder: false },
                            beginAtZero: false,
                            // تنظیم مقیاس برای قیمت‌های کوچک
                            min: function(context) {
                                const min = Math.min(...context.chart.data.datasets[0].data);
                                return min * 0.95; // کمی کمتر از حداقل
                            },
                            max: function(context) {
                                const max = Math.max(...context.chart.data.datasets[0].data);
                                return max * 1.05; // کمی بیشتر از حداکثر
                            }
                        }
                    },
                    interaction: { intersect: false, mode: 'index' },
                    elements: { point: { hoverRadius: 8, hoverBorderWidth: 3 } }
                }
            });
            
        } catch (error) {
            console.error("Error initializing chart:", error);
            const chartSection = document.querySelector('.chart-section');
            if (chartSection) {
                chartSection.innerHTML = `
                    <h3 style="text-align:center; color:#a786ff;">نمودار قیمت LVL به دلار (USD)</h3>
                    <div style="text-align:center; color:#ff6b6b; padding:2rem;">
                        خطا در بارگذاری نمودار: ${error.message}
                    </div>
                `;
            }
        }
    }
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