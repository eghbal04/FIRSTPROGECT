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

            updateElement('token-price', `${prices.tokenPrice} MATIC`);
            updateElement('circulating-supply', parseFloat(circulatingSupply).toLocaleString() + ' LVL');
            
            // نمایش total points یا تعداد کاربران
            const totalPointsValue = parseFloat(stats.totalPoints);
            if (totalPointsValue > 0) {
                updateElement('total-points', `${totalPointsValue.toLocaleString()} پوینت`);
            } else {
                updateElement('total-points', `${stats.totalUsers} کاربر`);
            }
            
            // اطلاعات جدید
            updateElement('trading-volume', parseFloat(tradingVolume).toLocaleString() + ' MATIC');
            updateElement('claimed-points', parseFloat(additionalStats.claimedPoints).toLocaleString());
            updateElement('remaining-points', parseFloat(additionalStats.remainingPoints).toLocaleString());
            updateElement('point-value', parseFloat(additionalStats.pointValue).toFixed(6) + ' LVL');
            updateElement('reward-pool', parseFloat(stats.binaryPool).toLocaleString() + ' LVL');

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

        updateElement('token-price', '0.0012 MATIC');
        updateElement('circulating-supply', '1,250,000 LVL');
        updateElement('total-points', '847 کاربر');
        updateElement('trading-volume', '45,250 MATIC');
        updateElement('claimed-points', '12,450');
        updateElement('remaining-points', '8,750');
        updateElement('point-value', '0.000125 LVL');
        updateElement('reward-pool', '2,450 LVL');
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

    // فراخوانی تابع به‌روزرسانی آمار
    await updateTokenStats();

    // راه‌اندازی نمودار
    const ctx = document.getElementById('priceChart')?.getContext('2d');
    if (ctx) {
        new Chart(ctx, {
        type: 'line',
        data: {
                labels: ['1D', '1W', '1M', '3M', '1Y'],
            datasets: [{
                    label: 'قیمت LVL',
                    data: [0.001, 0.0012, 0.0015, 0.0014, 0.0018],
                borderColor: '#a786ff',
                    backgroundColor: 'rgba(167, 134, 255, 0.1)',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                    fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                    legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: '#aaa', font: { family: 'Vazirmatn' } },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                y: {
                    ticks: { color: '#fff', font: { family: 'Vazirmatn' } },
                    grid: { color: 'rgba(255,255,255,0.08)' }
                }
            }
        }
    });
}

    // به‌روزرسانی خودکار هر 30 ثانیه
    setInterval(updateTokenStats, 30000);
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