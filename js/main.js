// main.js
document.addEventListener('DOMContentLoaded', async () => {
    const connectButton = document.getElementById('connectButton');
    const walletConnectButton = document.getElementById('walletConnectButton');

    if (connectButton) {
        connectButton.addEventListener('click', async () => {
            await connectWalletAndUpdateUI('metamask');
        });
    }
    
    if (walletConnectButton) {
        walletConnectButton.addEventListener('click', async () => {
            await connectWalletAndUpdateUI('walletconnect');
        });
    }
    
    // به‌روزرسانی ناوبار بر اساس وضعیت کاربر
    await updateNavbarBasedOnUserStatus();

    // کشبک داشبورد
    const cashbackValueEl = document.getElementById('dashboard-cashback-value');
    const cashbackDescEl = document.getElementById('dashboard-cashback-desc');
    if (cashbackValueEl) {
        try {
            let cashback = await window.contractConfig.contract.cashBack();
            cashback = cashback.toString();
            cashbackValueEl.textContent = Number(cashback) / 1e18 + ' CPA';
            if (cashbackDescEl) {
                cashbackDescEl.textContent = `۵٪ از هر ثبت‌نام به این صندوق اضافه می‌شود. مجموع فعلی: ${Number(cashback) / 1e18} CPA`;
            }
        } catch (e) {
            cashbackValueEl.textContent = '-';
            if (cashbackDescEl) {
                cashbackDescEl.textContent = '۵٪ از هر ثبت‌نام به این صندوق اضافه می‌شود.';
            }
        }
    }
});

function shortenAddress(address) {
    if (!address) return '---';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// تابع اتصال کیف پول با نوع مشخص
async function connectWalletAndUpdateUI(walletType) {
    try {
        const connectButton = document.getElementById('connectButton');
        const walletConnectButton = document.getElementById('walletConnectButton');
        
        if (walletType === 'metamask' && connectButton) {
            connectButton.textContent = 'در حال اتصال...';
            connectButton.disabled = true;
        } else if (walletType === 'walletconnect' && walletConnectButton) {
            walletConnectButton.textContent = 'در حال اتصال...';
            walletConnectButton.disabled = true;
        }

        let connected = false;
        if (walletType === 'metamask') {
            connected = await window.contractConfig.initializeWeb3();
        } else if (walletType === 'walletconnect') {
            connected = await window.contractConfig.connectWithWalletConnect();
        }

        if (!connected) {
            throw new Error("اتصال کیف پول ناموفق بود");
        }

        // دریافت پروفایل کاربر
        const profile = await loadUserProfileOnce();
        const address = await window.contractConfig.signer.getAddress();

        // به‌روزرسانی UI
        updateConnectionUI(profile, address, walletType);

    } catch (error) {
        alert("اتصال کیف پول ناموفق بود: " + error.message);
    } finally {
        const connectButton = document.getElementById('connectButton');
        const walletConnectButton = document.getElementById('walletConnectButton');
        
        if (connectButton) {
            connectButton.textContent = 'اتصال با متامسک';
            connectButton.disabled = false;
        }
        
        if (walletConnectButton) {
            walletConnectButton.textContent = 'اتصال با WalletConnect';
            walletConnectButton.disabled = false;
        }
    }
}

// به‌روزرسانی تابع updateConnectionUI برای پشتیبانی از انواع کیف پول
function updateConnectionUI(profile, address, walletType) {
    const connectButton = document.getElementById('connectButton');
    const walletConnectButton = document.getElementById('walletConnectButton');
    
    if (walletType === 'metamask' && connectButton) {
        connectButton.textContent = 'متصل: ' + shortenAddress(address);
        connectButton.style.background = 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)';
        connectButton.disabled = true;
    } else if (walletType === 'walletconnect' && walletConnectButton) {
        walletConnectButton.textContent = 'متصل: ' + shortenAddress(address);
        walletConnectButton.style.background = 'linear-gradient(90deg, #3b99fc 0%, #2a7de1 100%)';
        walletConnectButton.disabled = true;
    }

    // سایر به‌روزرسانی‌های UI
const updateElement = (id, value) => {
    const element = document.getElementById(id);
    if (!element) return;
    
    // فرمت‌دهی اعداد بزرگ
    if (typeof value === 'string' && value.includes('.')) {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            if (num >= 1000000) {
                value = (num / 1000000).toFixed(2) + 'M';
            } else if (num >= 1000) {
                value = (num / 1000).toFixed(2) + 'K';
            } else {
                value = num.toLocaleString('en-US', {
                maximumFractionDigits: 6
            });
            }
        }
    }
    
    element.textContent = value;
};

    updateElement('user-address', shortenAddress(address));
    updateElement('matic-balance', profile.maticBalance + ' POL');
    updateElement('lvl-balance', profile.lvlBalance + ' CPA');

    const userDashboard = document.getElementById('user-dashboard');
    const mainContent = document.getElementById('main-content');

    if (userDashboard) userDashboard.style.display = 'block';
    if (mainContent) mainContent.style.display = 'none';
    
    // راه‌اندازی تایمر پاداش باینری
    if (profile.lastClaimTime && typeof startBinaryClaimCountdown === 'function') {
        startBinaryClaimCountdown(profile.lastClaimTime);
    }
    
    // به‌روزرسانی ناوبار بر اساس وضعیت کاربر
    updateNavbarBasedOnUserStatus();
}

// تابع fetchUserProfile که در main.js فراخوانی می‌شود
async function fetchUserProfile() {
    try {
        const { contract, address } = await connectWallet();
        // دریافت موجودی‌ها
        const [maticBalance, lvlBalance] = await Promise.all([
            contract.provider.getBalance(address),
            contract.balanceOf(address)
        ]);
        // دریافت اطلاعات کاربر
        const userData = await contract.users(address);
        // دریافت قیمت LVL/MATIC و MATIC/USD
        const [tokenPriceMatic, maticPriceUSD] = await Promise.all([
            contract.getTokenPrice(),
            window.fetchPolUsdPrice()
        ]);
        const formattedMaticBalance = ethers.formatEther(maticBalance);
        const formattedLvlBalance = ethers.formatUnits(lvlBalance, 18);
        const tokenPriceMaticFormatted = ethers.formatUnits(tokenPriceMatic, 18);
        // قیمت CPA/USD = (CPA/MATIC) * (MATIC/USD)
        const tokenPriceUSD = parseFloat(tokenPriceMaticFormatted) * parseFloat(maticPriceUSD);
        // محاسبه ارزش دلاری
        const maticValueUSD = parseFloat(formattedMaticBalance) * parseFloat(maticPriceUSD);
        const lvlValueUSD = parseFloat(formattedLvlBalance) * tokenPriceUSD;
        return {
            address,
            maticBalance: formattedMaticBalance,
            lvlBalance: formattedLvlBalance,
            maticValueUSD: maticValueUSD.toFixed(2),
            lvlValueUSD: lvlValueUSD.toFixed(2),
            isRegistered: userData.activated,
            binaryPoints: ethers.formatUnits(userData.binaryPoints, 18),
            binaryPointCap: userData.binaryPointCap.toString(),
            referrer: userData.referrer
        };
    } catch (error) {
        return {
            address: '---',
            maticBalance: '0',
            lvlBalance: '0',
            maticValueUSD: '0',
            lvlValueUSD: '0',
            isRegistered: false,
            binaryPoints: '0',
            binaryPointCap: '0',
            referrer: '---'
        };
    }
}

// تابع اتصال به کیف پول
async function connectWallet() {
    try {
        // بررسی اتصال موجود
        if (window.contractConfig && window.contractConfig.contract && window.contractConfig.address) {
            return window.contractConfig;
        }
        
        // بررسی اتصال MetaMask موجود
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                try {
                    await initializeWeb3();
                    return window.contractConfig;
                } catch (error) {
                    throw new Error('خطا در راه‌اندازی Web3');
                }
            }
        }
        
        throw new Error('لطفاً ابتدا کیف پول خود را متصل کنید');
        
    } catch (error) {
        throw error;
    }
}

// تابع به‌روزرسانی ناوبار بر اساس وضعیت کاربر
async function updateNavbarBasedOnUserStatus() {
    try {
        const connection = await checkConnection();
        if (!connection.connected) {
            // اگر کاربر متصل نیست، ناوبار را به حالت پیش‌فرض برگردان
            resetNavbarToDefault();
            return;
        }

        const { contract, address } = await connectWallet();
        
        try {
            const userData = await contract.users(address);
            
            if (userData.activated) {
                // کاربر فعال - تغییر "ثبت‌نام" به "ارتقا"
                updateNavbarForActiveUser();
            } else {
                // کاربر غیرفعال - ناوبار به حالت پیش‌فرض
                resetNavbarToDefault();
            }
        } catch (userDataError) {
            console.warn('Could not fetch user data:', userDataError);
            resetNavbarToDefault();
        }
    } catch (error) {
        console.warn('Error updating navbar:', error);
        resetNavbarToDefault();
    }
}

// تابع تغییر ناوبار برای کاربران فعال
function updateNavbarForActiveUser() {
    // تغییر در ناوبار دسکتاپ
    const desktopRegisterLink = document.querySelector('.desktop-nav a[href="#main-register"]');
    if (desktopRegisterLink) {
        desktopRegisterLink.innerHTML = '<i class="fa-solid fa-arrow-up icon" aria-hidden="true"></i><span class="label">افزایش سقف</span>';
        desktopRegisterLink.title = 'افزایش سقف';
    }
    
    // تغییر در ناوبار موبایل
    const mobileRegisterLink = document.querySelector('.fab-menu a[href="#main-register"]');
    if (mobileRegisterLink) {
        mobileRegisterLink.innerHTML = '<i class="fa-solid fa-arrow-up icon" aria-hidden="true"></i><span class="label">افزایش سقف</span>';
        mobileRegisterLink.title = 'افزایش سقف';
    }
}

// تابع بازگرداندن ناوبار به حالت پیش‌فرض
function resetNavbarToDefault() {
    // بازگرداندن ناوبار دسکتاپ
    const desktopRegisterLink = document.querySelector('.desktop-nav a[href="#main-register"]');
    if (desktopRegisterLink) {
        desktopRegisterLink.innerHTML = '<i class="fa-solid fa-user-plus icon" aria-hidden="true"></i><span class="label">ثبت‌نام</span>';
        desktopRegisterLink.title = 'ثبت‌نام';
    }
    
    // بازگرداندن ناوبار موبایل
    const mobileRegisterLink = document.querySelector('.fab-menu a[href="#main-register"]');
    if (mobileRegisterLink) {
        mobileRegisterLink.innerHTML = '<i class="fa-solid fa-user-plus icon" aria-hidden="true"></i><span class="label">ثبت‌نام</span>';
        mobileRegisterLink.title = 'ثبت‌نام';
    }
}

// تابع بررسی اتصال کیف پول
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

// Initialize price chart when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize price chart after a short delay to ensure all modules are loaded
    setTimeout(async () => {
        try {
            if (window.priceChart && window.priceChart.initialize) {
                await window.priceChart.initialize();
            }
        } catch (error) {
        }
    }, 1000);
});

// Cache برای پروفایل کاربر
let userProfileCache = null;
let userProfileCacheTime = 0;
const CACHE_DURATION = 30000; // 30 ثانیه

async function loadUserProfileOnce() {
    const now = Date.now();
    
    // اگر cache معتبر است، از آن استفاده کن
    if (userProfileCache && (now - userProfileCacheTime) < CACHE_DURATION) {
        return userProfileCache;
    }
    
    try {
        // دریافت پروفایل جدید
        if (window.getUserProfile) {
            userProfileCache = await window.getUserProfile();
            userProfileCacheTime = now;
            return userProfileCache;
        } else {
            console.warn('getUserProfile function not available');
            return null;
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        return null;
    }
}

// تابع پاک کردن cache پروفایل
function clearUserProfileCache() {
    userProfileCache = null;
    userProfileCacheTime = 0;
    console.log('User profile cache cleared');
}

// Export برای استفاده در سایر فایل‌ها
window.clearUserProfileCache = clearUserProfileCache;

// Lock navigation for deactivated users
async function lockTabsForDeactivatedUsers() {
    if (!window.getUserProfile) return;
    const profile = await loadUserProfileOnce();
    if (!profile.activated) {
        const lockTabs = [
            { id: 'tab-shop-btn', label: 'SHOP' },
            { id: 'tab-lottery-btn', label: 'LOTTERY' },
            { id: 'tab-reports-btn', label: 'REPORTS' },
            { id: 'tab-learning-btn', label: 'LEARNING' }
        ];
        lockTabs.forEach(tab => {
            const el = document.getElementById(tab.id);
            if (el) {
                el.innerHTML = '🔒 ' + tab.label;
                el.classList.add('locked-tab');
                if (el.style) {
                  el.style.pointerEvents = 'none';
                  el.style.opacity = '0.5';
                }
                el.title = 'این بخش فقط برای کاربران فعال باز است';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', lockTabsForDeactivatedUsers);

// تایمر شمارش معکوس جلسه آنلاین بعدی (فقط برای کاربران فعال)
const nextSessionDate = new Date("2025-07-01T16:30:00+03:30"); // تاریخ و ساعت جلسه بعدی را اینجا تنظیم کنید
function updateSessionTimer() {
    const now = new Date();
    const diff = nextSessionDate - now;
    if (diff <= 0) {
        document.getElementById('session-timer').textContent = "جلسه آنلاین در حال برگزاری است!";
        return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    document.getElementById('session-timer').textContent =
        `${days} روز و ${hours} ساعت و ${minutes} دقیقه و ${seconds} ثانیه`;
}
if (document.getElementById('session-timer')) {
    setInterval(updateSessionTimer, 1000);
    updateSessionTimer();
}
(async function() {
    if (window.getUserProfile) {
        const profile = await loadUserProfileOnce();
        if (profile && profile.activated) {
            document.getElementById('session-timer-box').style.display = 'block';
        }
    }
})();

// نمایش قیمت توکن برای همه کاربران (حتی بدون اتصال کیف پول)
async function showTokenPricesForAll() {
    try {
        // اگر contractConfig و contract آماده است
        if (window.contractConfig && window.contractConfig.contract) {
            const contract = window.contractConfig.contract;
            // قیمت CPA/MATIC و قیمت MATIC/USD
            const [tokenPriceMatic, maticPriceUSD] = await Promise.all([
                contract.getTokenPrice(),
                window.fetchPolUsdPrice()
            ]);
            const tokenPriceMaticFormatted = ethers.formatUnits(tokenPriceMatic, 18);
            const tokenPriceUSD = parseFloat(tokenPriceMaticFormatted) * parseFloat(maticPriceUSD);
            // نمایش در عناصر
            const cpaUsd = document.getElementById('chart-lvl-usd');
            const polUsd = document.getElementById('chart-pol-usd');
            if (cpaUsd) cpaUsd.textContent = tokenPriceUSD.toFixed(4);
            if (polUsd) polUsd.textContent = parseFloat(maticPriceUSD).toFixed(4);
        }
    } catch (e) {
        // اگر خطا بود، مقدار پیش‌فرض نمایش بده
        const cpaUsd = document.getElementById('chart-lvl-usd');
        const polUsd = document.getElementById('chart-pol-usd');
        if (cpaUsd) cpaUsd.textContent = '-';
        if (polUsd) polUsd.textContent = '-';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(showTokenPricesForAll, 1200);
});

// نمایش موجودی و ارزش دلاری فقط با اتصال کیف پول
async function showUserBalanceBox() {
    const box = document.getElementById('user-balance-box');
    if (!box) return;
    try {
        const { contract, address } = await connectWallet();
        if (!contract || !address) throw new Error('No wallet');
        // دریافت موجودی و قیمت
        const [lvlBalance, tokenPriceMatic, maticPriceUSD] = await Promise.all([
            contract.balanceOf(address),
            contract.getTokenPrice(),
            window.fetchPolUsdPrice()
        ]);
        const lvl = ethers.formatUnits(lvlBalance, 18);
        const tokenPriceMaticFormatted = ethers.formatUnits(tokenPriceMatic, 18);
        const tokenPriceUSD = parseFloat(tokenPriceMaticFormatted) * parseFloat(maticPriceUSD);
        const usdValue = (parseFloat(lvl) * tokenPriceUSD).toFixed(2);
        document.getElementById('user-lvl-balance').textContent = lvl;
        document.getElementById('user-lvl-usd-value').textContent = usdValue + ' $';
        box.style.display = 'block';
    } catch (e) {
        box.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(showUserBalanceBox, 1500);
});

// تابع نمایش اطلاعات یک گره شبکه در باکس موجودی شما
window.updateUserBalanceBoxWithNode = async function(address, userData) {
    console.log('updateUserBalanceBoxWithNode called with:', address, userData);
    console.log('UserData fields:', Object.keys(userData || {}));
    console.log('All userData values:', userData);
    console.log('binaryPoints:', userData?.binaryPoints);
    console.log('binaryPointCap:', userData?.binaryPointCap);
    console.log('activated:', userData?.activated);
    console.log('leftPoints:', userData?.leftPoints);
    console.log('rightPoints:', userData?.rightPoints);
    console.log('index:', userData?.index);
    console.log('totalPurchasedKind:', userData?.totalPurchasedKind);
    console.log('binaryPointsClaimed:', userData?.binaryPointsClaimed);
    console.log('depositedAmount:', userData?.depositedAmount);
    
    const box = document.getElementById('user-balance-box');
    if (!box) {
        console.log('user-balance-box not found');
        return;
    }
    console.log('Found user-balance-box, setting display to block');
    box.style.display = 'block';
    
    // آدرس کوتاه شده
    const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '-';
    console.log('Short address:', shortAddress);
    
    // دریافت معرف از قرارداد
    let referrerAddress = '-';
    try {
        if (window.contractConfig && window.contractConfig.contract) {
            const contract = window.contractConfig.contract;
            const userIndex = userData?.index;
            if (userIndex && userIndex > 0) {
                referrerAddress = await contract.getReferrer(userIndex);
                referrerAddress = referrerAddress && referrerAddress !== '0x0000000000000000000000000000000000000000' 
                    ? shortWallet(referrerAddress) : '-';
            }
        }
    } catch (e) {
        console.log('Error getting referrer:', e);
        referrerAddress = '-';
    }
    
    // اطلاعات اصلی
    const lvlBalanceElement = document.getElementById('user-lvl-balance');
    
    if (lvlBalanceElement) {
        // دریافت موجودی واقعی CPA از قرارداد
        let balanceInCPA = '-';
        try {
            if (window.contractConfig && window.contractConfig.contract) {
                const contract = window.contractConfig.contract;
                const balance = await contract.balanceOf(address);
                const balanceStr = balance ? (typeof balance === 'bigint' ? balance.toString() : balance) : null;
                // تبدیل از wei به CPA (18 رقم اعشار)
                balanceInCPA = balanceStr ? (parseInt(balanceStr) / Math.pow(10, 18)).toFixed(2) : null;
            }
        } catch (e) {
            console.log('Error getting CPA balance:', e);
            balanceInCPA = '-';
        }
        lvlBalanceElement.textContent = balanceInCPA ? `${balanceInCPA} CPA` : '-';
        console.log('Updated lvl balance:', lvlBalanceElement.textContent);
    }
    
    // ایجاد یا آپدیت بخش اطلاعات تکمیلی
    let extraInfo = document.getElementById('node-extra-info');
    if (!extraInfo) {
        extraInfo = document.createElement('div');
        extraInfo.id = 'node-extra-info';
        extraInfo.style.cssText = `
            margin-top: 0.5rem;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(10px);
        `;
        box.appendChild(extraInfo);
        console.log('Created new extra-info div');
    }
    
    // محتوای اطلاعات دسته‌بندی شده - فشرده و بهینه برای موبایل
    extraInfo.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; font-size: 0.8rem;">
            <!-- آدرس و وضعیت در یک ردیف -->
            <div style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; padding-bottom: 0.3rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="color: #b8c1ec; font-family: monospace; font-size: 0.75rem;">${shortAddress}</div>
                <div style="color: ${userData?.[4] ? '#4ade80' : '#f87171'}; font-size: 0.7rem; padding: 0.1rem 0.4rem; background: ${userData?.[4] ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)'}; border-radius: 3px;">
                    ${userData?.[4] ? 'فعال' : 'غیرفعال'}
                </div>
            </div>
            
            <!-- معرف -->
            <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                <div style="color: #a786ff; font-size: 0.7rem; opacity: 0.8;">👤 معرف</div>
                <div style="color: #b8c1ec; font-size: 0.7rem; font-family: monospace;">
                    ${referrerAddress}
                </div>
            </div>
            
            <!-- سقف درآمد -->
            <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                <div style="color: #a786ff; font-size: 0.7rem; opacity: 0.8;">💰 سقف</div>
                <div style="color: #b8c1ec; font-size: 0.7rem;">${userData?.[2] ? (typeof userData[2] === 'bigint' ? userData[2].toString() : userData[2]) : '-'} پوینت</div>
            </div>
            
            <!-- امتیاز چپ -->
            <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                <div style="color: #a786ff; font-size: 0.7rem; opacity: 0.8;">⬅️ چپ</div>
                <div style="color: #b8c1ec; font-size: 0.7rem;">${userData?.[8] ? (typeof userData[8] === 'bigint' ? userData[8].toString() : userData[8]) : '-'}</div>
            </div>
            
            <!-- امتیاز راست -->
            <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                <div style="color: #a786ff; font-size: 0.7rem; opacity: 0.8;">➡️ راست</div>
                <div style="color: #b8c1ec; font-size: 0.7rem;">${userData?.[7] ? (typeof userData[7] === 'bigint' ? userData[7].toString() : userData[7]) : '-'}</div>
            </div>
            
            <!-- لینک رفرال -->
            <div style="grid-column: 1 / -1; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.2rem; padding-top: 0.2rem; border-top: 1px solid rgba(255,255,255,0.1);">
                <div style="color: #a786ff; font-size: 0.7rem; opacity: 0.8;">🔗 دعوت:</div>
                <div style="color: #b8c1ec; font-size: 0.65rem; font-family: monospace; flex: 1;">${shortWallet(address)}</div>
                <button onclick="copyReferralLink('${address}')" style="background: #a786ff; color: white; border: none; border-radius: 3px; padding: 0.2rem 0.4rem; font-size: 0.6rem; cursor: pointer;">کپی</button>
            </div>
        </div>
    `;
    console.log('Updated extra info content');
};

// تابع کوتاه کردن آدرس
function shortWallet(address) {
    if (!address) return '-';
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
}

// تابع کپی کردن لینک رفرال
window.copyReferralLink = function(address) {
    const referralLink = `${window.location.origin}${window.location.pathname}?ref=${address}`;
    navigator.clipboard.writeText(referralLink).then(() => {
        // نمایش پیام موفقیت
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'کپی شد!';
        button.style.background = '#4ade80';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#a786ff';
        }, 2000);
    }).catch(err => {
        console.error('خطا در کپی کردن لینک:', err);
        // روش جایگزین برای مرورگرهای قدیمی
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'کپی شد!';
        button.style.background = '#4ade80';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#a786ff';
        }, 2000);
    });
};

window.networkRendered = false;

// اضافه کردن گزینه‌های انتقال برای همه کاربران
function addTransferOptions() {
    const swapDirection = document.getElementById('swapDirection');
    if (swapDirection && !document.getElementById('transfer-matic-option')) {
        swapDirection.insertAdjacentHTML('beforeend', `
            <option value="transfer-matic" id="transfer-matic-option">انتقال POL</option>
            <option value="transfer-lvl" id="transfer-lvl-option">انتقال CPA</option>
        `);
    }

    // افزودن ورودی آدرس مقصد
    const swapForm = document.getElementById('swapForm');
    if (swapForm && !document.getElementById('transferAddressRow')) {
        const amountRow = document.querySelector('.amount-row');
        if (amountRow) {
            const transferRow = document.createElement('div');
            transferRow.className = 'amount-row';
            transferRow.id = 'transferAddressRow';
            transferRow.style.display = 'none';
            transferRow.innerHTML = `
                <input type="text" id="transferAddress" placeholder="آدرس مقصد (0x...)" style="direction:ltr;" />
            `;
            amountRow.parentNode.insertBefore(transferRow, amountRow.nextSibling);
        }
    }

    // نمایش/مخفی‌سازی ورودی آدرس بر اساس نوع عملیات
    if (swapDirection) {
        swapDirection.addEventListener('change', function() {
            const transferRow = document.getElementById('transferAddressRow');
            if (transferRow) {
                if (swapDirection.value === 'transfer-matic' || swapDirection.value === 'transfer-lvl') {
                    transferRow.style.display = 'flex';
                } else {
                    transferRow.style.display = 'none';
                }
            }
        });
    }
}

// تابع ارسال متیک
async function transferMatic(to, amount) {
    try {
        const walletConfig = await window.connectWallet();
        if (!walletConfig || !walletConfig.signer) throw new Error('اتصال کیف پول برقرار نشد');
        const value = ethers.parseEther(amount.toString());
        const tx = await walletConfig.signer.sendTransaction({ to, value });
        await tx.wait();
        showTransferSuccess('انتقال POL با موفقیت انجام شد');
        if (window.loadBalances) await window.loadBalances();
    } catch (e) {
        showTransferError('خطا در انتقال POL: ' + (e.message || e));
    }
}

// تابع ارسال CPA (توکن)
async function transferLvl(to, amount) {
    try {
        const walletConfig = await window.connectWallet();
        if (!walletConfig || !walletConfig.contract) throw new Error('اتصال کیف پول برقرار نشد');
        const value = ethers.parseUnits(amount.toString(), 18);
        const tx = await walletConfig.contract.transfer(to, value);
        await tx.wait();
        showTransferSuccess('انتقال CPA با موفقیت انجام شد');
        if (window.loadBalances) await window.loadBalances();
    } catch (e) {
        showTransferError('خطا در انتقال CPA: ' + (e.message || e));
    }
}

// تابع نمایش موفقیت انتقال
function showTransferSuccess(message) {
    const statusElement = document.getElementById('swapStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'swap-status success';
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'swap-status';
        }, 5000);
    }
}

// تابع نمایش خطای انتقال
function showTransferError(message) {
    const statusElement = document.getElementById('swapStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'swap-status error';
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'swap-status';
        }, 5000);
    }
}

// اضافه کردن هندلر فرم انتقال
function setupTransferHandler() {
    const swapForm = document.getElementById('swapForm');
    if (swapForm) {
        // حذف event listener قبلی اگر وجود دارد
        const newForm = swapForm.cloneNode(true);
        swapForm.parentNode.replaceChild(newForm, swapForm);
        
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const direction = document.getElementById('swapDirection').value;
            const amount = document.getElementById('swapAmount').value;
            const to = document.getElementById('transferAddress') ? document.getElementById('transferAddress').value : '';
            
            if (direction === 'transfer-matic') {
                if (!to || !ethers.isAddress(to)) {
                    showTransferError('آدرس مقصد معتبر نیست');
                    return;
                }
                if (!amount || parseFloat(amount) <= 0) {
                    showTransferError('مقدار معتبر وارد کنید');
                    return;
                }
                await transferMatic(to, amount);
            } else if (direction === 'transfer-lvl') {
                if (!to || !ethers.isAddress(to)) {
                    showTransferError('آدرس مقصد معتبر نیست');
                    return;
                }
                if (!amount || parseFloat(amount) <= 0) {
                    showTransferError('مقدار معتبر وارد کنید');
                    return;
                }
                await transferLvl(to, amount);
            } else {
                // منطق سواپ قبلی - اجازه دهید swap.js آن را مدیریت کند
                return true;
            }
        });
    }
}

// راه‌اندازی گزینه‌های انتقال
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        addTransferOptions();
        setupTransferHandler();
    }, 1000);
});
