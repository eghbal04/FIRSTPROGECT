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
            cashbackValueEl.textContent = Number(cashback) / 1e18 + ' LVL';
            if (cashbackDescEl) {
                cashbackDescEl.textContent = `۵٪ از هر ثبت‌نام به این صندوق اضافه می‌شود. مجموع فعلی: ${Number(cashback) / 1e18} LVL`;
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
        const profile = await fetchUserProfile();
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
    updateElement('lvl-balance', profile.lvlBalance + ' LVL');

    const userDashboard = document.getElementById('user-dashboard');
    const mainContent = document.getElementById('main-content');

    if (userDashboard) userDashboard.style.display = 'block';
    if (mainContent) mainContent.style.display = 'none';
    
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
        // قیمت LVL/USD = (LVL/MATIC) * (MATIC/USD)
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
        if (window.contractConfig && window.contractConfig.contract) {
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
        const userData = await contract.users(address);
        
        if (userData.activated) {
            // کاربر فعال - تغییر "ثبت‌نام" به "ارتقا"
            updateNavbarForActiveUser();
        } else {
            // کاربر غیرفعال - ناوبار به حالت پیش‌فرض
            resetNavbarToDefault();
        }
    } catch (error) {
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

// Lock navigation for deactivated users
async function lockTabsForDeactivatedUsers() {
    if (!window.getUserProfile) return;
    const profile = await window.getUserProfile();
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
                el.style.pointerEvents = 'none';
                el.style.opacity = '0.5';
                el.title = 'این بخش فقط برای کاربران فعال باز است';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', lockTabsForDeactivatedUsers);
