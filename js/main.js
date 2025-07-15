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
    
    // === اضافه کردن دکمه مخفی پنل اونر به منوی همبرگری ===
    try {
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        if (hamburgerMenu && window.contractConfig && window.contractConfig.contract && window.contractConfig.address) {
            // گرفتن آدرس owner از قرارداد
            const ownerAddress = await window.contractConfig.contract.owner();
            const userAddress = window.contractConfig.address;
            // بررسی تطابق آدرس owner و کاربر
            if (ownerAddress && userAddress && ownerAddress.toLowerCase() === userAddress.toLowerCase()) {
                // اگر دکمه قبلاً اضافه نشده بود، اضافه کن
                if (!document.getElementById('owner-panel-btn')) {
                    const divider = document.createElement('div');
                    divider.className = 'menu-divider';
                    divider.id = 'owner-panel-divider'; // Added ID for removal
                    const btn = document.createElement('button');
                    btn.id = 'owner-panel-btn';
                    btn.innerHTML = '<span class="menu-icon">🛡️</span>پنل اونر';
                    btn.onclick = function() { window.location.href = 'admin-owner-panel.html'; };
                    btn.style.background = '#232946';
                    btn.style.color = '#a786ff';
                    btn.style.fontWeight = 'bold';
                    btn.style.display = 'block';
                    btn.style.border = '1px solid #a786ff';
                    btn.style.marginTop = '10px';
                    btn.style.padding = '10px';
                    btn.style.borderRadius = '8px';
                    btn.style.cursor = 'pointer';
                    // اضافه کردن به انتهای منو
                    hamburgerMenu.appendChild(divider);
                    hamburgerMenu.appendChild(btn);
                }
            }
        }
    } catch (e) { console.warn('Owner panel button error:', e); }

    // به‌روزرسانی ناوبار بر اساس وضعیت کاربر
    await updateNavbarBasedOnUserStatus();

    // کشبک داشبورد
    const cashbackValueEl = document.getElementById('dashboard-cashback-value');
    if (cashbackValueEl) {
        try {
            let cashback = await window.contractConfig.contract.cashBack();
            cashback = cashback.toString();
            cashbackValueEl.textContent = Number(cashback) / 1e18 + ' CPA';
            const cashbackDescEl = document.getElementById('dashboard-cashback-desc');
            if (cashbackDescEl) {
                cashbackDescEl.textContent = `۵٪ از هر ثبت‌نام به این صندوق اضافه می‌شود. مجموع فعلی: ${Number(cashback) / 1e18} CPA`;
            }
        } catch (e) {
            cashbackValueEl.textContent = '-';
            const cashbackDescEl = document.getElementById('dashboard-cashback-desc');
            if (cashbackDescEl) {
                cashbackDescEl.textContent = '۵٪ از هر ثبت‌نام به این صندوق اضافه می‌شود.';
            }
        }
    }
    await updateContractStats();
    // حذف مقداردهی مستقیم به dashboard-terminal-info برای جلوگیری از تداخل تایپ‌رایتر
    // if (document.getElementById('dashboard-terminal-info')) {
    //     document.getElementById('dashboard-terminal-info').textContent =
    //         `Total Points: ${window.contractStats.totalPoints}\n` +
    //         `USDC Balance: ${window.contractStats.usdcBalance}\n` +
    //         `Token Balance: ${window.contractStats.tokenBalance}\n` +
    //         `Wallets: ${window.contractStats.wallets}\n` +
    //         `Total Supply: ${window.contractStats.totalSupply}`;
    // }

    // نمایش آدرس قرارداد در کارت داشبورد (بدون دکمه، فقط با کلیک روی آدرس)
    const contractAddress = (window.contractConfig && window.contractConfig.CONTRACT_ADDRESS) ? window.contractConfig.CONTRACT_ADDRESS : (typeof CONTRACT_ADDRESS !== 'undefined' ? CONTRACT_ADDRESS : '');
    const dashAddrEl = document.getElementById('dashboard-contract-address');
    if (dashAddrEl && contractAddress) {
        dashAddrEl.textContent = contractAddress;
        dashAddrEl.style.cursor = 'pointer';
        dashAddrEl.style.userSelect = 'all';
        dashAddrEl.style.background = 'rgba(0,255,136,0.07)';
        dashAddrEl.style.padding = '2px 8px';
        dashAddrEl.style.borderRadius = '6px';
        dashAddrEl.title = 'برای کپی کلیک کنید';
        dashAddrEl.onclick = function() {
            navigator.clipboard.writeText(contractAddress);
            const old = dashAddrEl.textContent;
            dashAddrEl.textContent = 'کپی شد!';
            dashAddrEl.style.background = '#bbf7d0';
            setTimeout(() => {
                dashAddrEl.textContent = old;
                dashAddrEl.style.background = 'rgba(0,255,136,0.07)';
            }, 1200);
        };
    }
    // حذف هر دکمه کپی اضافی اگر وجود دارد
    const dashCopyBtn = document.getElementById('dashboard-contract-copy-btn');
    if (dashCopyBtn) dashCopyBtn.remove();
});

function shortenAddress(address) {
    if (!address) return '---';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function shorten(address) {
    if (!address) return '---';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// تابع اضافه کردن دکمه owner به انتهای منوی همبرگری فقط برای owner
window.addOwnerPanelButtonIfOwner = async function() {
    try {
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        if (!hamburgerMenu) return;
        // حذف دکمه قبلی اگر وجود دارد
        const existingBtn = document.getElementById('owner-panel-btn');
        if (existingBtn) existingBtn.remove();
        // حذف divider قبلی اگر وجود دارد
        const existingDivider = document.getElementById('owner-panel-divider');
        if (existingDivider) existingDivider.remove();
        // بررسی اتصال و قرارداد
        if (!window.contractConfig || !window.contractConfig.contract || !window.contractConfig.address) return;
        // گرفتن owner از قرارداد
        let ownerAddress;
        try {
            ownerAddress = await window.contractConfig.contract.owner();
        } catch (e) { return; }
        const userAddress = window.contractConfig.address;
        if (!ownerAddress || !userAddress) return;
        if (ownerAddress.toLowerCase() !== userAddress.toLowerCase()) return;
        // اضافه کردن divider
        const divider = document.createElement('div');
        divider.className = 'menu-divider';
        divider.id = 'owner-panel-divider';
        // ایجاد دکمه
        const btn = document.createElement('button');
        btn.id = 'owner-panel-btn';
        btn.innerHTML = '<span class="menu-icon">🛡️</span>پنل اونر';
        btn.onclick = function() { window.location.href = 'admin-owner-panel.html'; };
        btn.style.background = '#232946';
        btn.style.color = '#a786ff';
        btn.style.fontWeight = 'bold';
        btn.style.display = 'block';
        btn.style.border = '1px solid #a786ff';
        btn.style.marginTop = '10px';
        btn.style.padding = '10px';
        btn.style.borderRadius = '8px';
        btn.style.cursor = 'pointer';
        // اضافه کردن به انتهای منو
        hamburgerMenu.appendChild(divider);
        hamburgerMenu.appendChild(btn);
    } catch (e) {}
};

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

        // بعد از به‌روزرسانی UI:
        setTimeout(window.addOwnerPanelButtonIfOwner, 500);
        // بعد از اتصال موفق، قفل‌گذاری را دوباره بررسی کن
        setTimeout(lockTabsForDeactivatedUsers, 500);

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
    updateElement('usdc-balance', profile.usdcBalance + ' USDC');
    updateElement('profile-usdc', profile.usdcBalance + ' USDC');

    const userDashboard = document.getElementById('user-dashboard');
    const mainContent = document.getElementById('main-content');

    if (userDashboard) userDashboard.style.display = 'block';
    if (mainContent) mainContent.style.display = 'none';
    
    // راه‌اندازی تایمر پاداش باینری
    if (profile.lastClaimTime) {
        // بررسی وجود تابع startBinaryClaimCountdown
        if (typeof window.startBinaryClaimCountdown === 'function') {
            window.startBinaryClaimCountdown(profile.lastClaimTime);
        } else {
            // اگر تابع موجود نیست، مستقیماً تایمر را راه‌اندازی کن
            const timerEl = document.getElementById('binary-claim-timer');
            if (timerEl) {
                function updateTimer() {
                    const now = Math.floor(Date.now() / 1000);
                    const nextClaim = Number(profile.lastClaimTime) + 12 * 3600;
                    const diff = nextClaim - now;
                    if (diff <= 0) {
                        timerEl.textContent = '';
                        return;
                    }
                    const hours = Math.floor(diff / 3600);
                    const minutes = Math.floor((diff % 3600) / 60);
                    const seconds = diff % 60;
                    timerEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes
                        .toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    setTimeout(updateTimer, 1000);
                }
                updateTimer();
            }
        }
    }
    
    // به‌روزرسانی ناوبار بر اساس وضعیت کاربر
    updateNavbarBasedOnUserStatus();
    
    // بعد از به‌روزرسانی UI:
    setTimeout(window.addOwnerPanelButtonIfOwner, 500);
}

// تابع fetchUserProfile که در main.js فراخوانی می‌شود
async function fetchUserProfile() {
    try {
        const { contract, address } = await connectWallet();
        // دریافت موجودی‌ها
        const provider = contract.provider;
        const signer = contract.signer || (provider && provider.getSigner ? await provider.getSigner() : null);
        let usdcBalance = '0';
        if (signer && typeof USDC_ADDRESS !== 'undefined' && typeof USDC_ABI !== 'undefined') {
          const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
          const usdcDecimals = await usdcContract.decimals();
          const usdcRaw = await usdcContract.balanceOf(address);
          usdcBalance = ethers.formatUnits(usdcRaw, usdcDecimals);
        }
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
            usdcBalance,
            isRegistered: userData.activated,
            binaryPoints: ethers.formatUnits(userData.binaryPoints, 18),
            binaryPointCap: userData.binaryPointCap.toString(),
            referrer: userData.referrer
        };
    } catch (error) {
        return {
            address: '---',
            usdcBalance: '0',
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
    try {
        if (!window.getUserProfile) {
            console.log('getUserProfile not available, skipping lock check');
            return;
        }
        
        const profile = await loadUserProfileOnce();
        
        if (!profile) {
            console.log('No profile available, skipping lock check');
            return;
        }
        
        console.log('User activation status:', profile.activated);
        
        if (!profile.activated) {
            console.log('User is not activated, locking tabs');
            
            // Lock main tabs
            const lockTabs = [
                { id: 'tab-shop-btn', label: 'فروشگاه', icon: '🛒' },
                { id: 'tab-reports-btn', label: 'گزارشات', icon: '📊' },
                { id: 'tab-learning-btn', label: 'آموزش', icon: '📚' },
                { id: 'tab-news-btn', label: 'اخبار', icon: '📰' }
            ];
            lockTabs.forEach(tab => {
                const el = document.getElementById(tab.id);
                if (el) {
                    el.innerHTML = `🔒 ${tab.icon} ${tab.label}`;
                    el.classList.add('locked-tab');
                    if (el.style) {
                      el.style.pointerEvents = 'none';
                      el.style.opacity = '0.5';
                      el.style.cursor = 'not-allowed';
                    }
                    el.title = '🔒 این بخش فقط برای کاربران فعال باز است - لطفاً ابتدا ثبت‌نام کنید';
                }
            });
            
            // Lock hamburger menu items
            setTimeout(() => lockHamburgerMenuItems(), 1000); // Wait for hamburger menu to load
            
            // مدیریت دکمه ثبت‌نام اصلی
            if (typeof window.manageMainRegistrationButton === 'function') {
                window.manageMainRegistrationButton();
            }
        } else {
            console.log('User is activated, unlocking tabs');
            
            // Unlock main tabs
            const unlockTabs = [
                { id: 'tab-shop-btn', label: 'فروشگاه', icon: '🛒' },
                { id: 'tab-reports-btn', label: 'گزارشات', icon: '📊' },
                { id: 'tab-learning-btn', label: 'آموزش', icon: '📚' },
                { id: 'tab-news-btn', label: 'اخبار', icon: '📰' }
            ];
            unlockTabs.forEach(tab => {
                const el = document.getElementById(tab.id);
                if (el) {
                    el.innerHTML = `${tab.icon} ${tab.label}`;
                    el.classList.remove('locked-tab');
                    if (el.style) {
                      el.style.pointerEvents = 'auto';
                      el.style.opacity = '1';
                      el.style.cursor = 'pointer';
                    }
                    el.title = '';
                }
            });
            
            // Unlock hamburger menu items
            unlockHamburgerMenuItems();
        }
    } catch (error) {
        console.error('Error in lockTabsForDeactivatedUsers:', error);
    }
}

// Lock hamburger menu items for deactivated users
async function lockHamburgerMenuItems() {
    try {
        if (window.clearUserProfileCache) window.clearUserProfileCache();
        const profile = await loadUserProfileOnce();
        if (profile && profile.activated) {
            unlockHamburgerMenuItems();
            return;
        }
        // انتخاب همه دکمه‌های منوی همبرگری که باید قفل شوند
        const selectors = [
            'button.menu-btn[onclick*="shop.html"]',
            'button.menu-btn[onclick*="news.html"]',
            'button.menu-btn[onclick*="learning.html"]',
            'button.menu-btn[onclick*="signal.html"]',
            'button.menu-btn[onclick*="autotrade-license.html"]',
            'button.menu-btn[onclick*="admin-prop.html"]'
        ];
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                const labelSpan = el.querySelector('span.menu-label');
                if (labelSpan) {
                    labelSpan.innerHTML = '🔒 ' + labelSpan.textContent.replace('🔒', '').trim();
                }
                el.classList.add('locked-menu-item');
                el.style.pointerEvents = 'none';
                el.style.opacity = '0.5';
                el.style.cursor = 'not-allowed';
                el.title = '🔒 این بخش فقط برای کاربران فعال باز است - لطفاً ابتدا ثبت‌نام کنید';
                if (!el.dataset.originalOnclick && el.onclick) {
                    el.dataset.originalOnclick = el.onclick.toString();
                }
                el.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showRegistrationPrompt();
                    return false;
                };
            });
        });
    } catch (error) {
        console.error('Error in lockHamburgerMenuItems:', error);
    }
}

// Unlock hamburger menu items for activated users
function unlockHamburgerMenuItems() {
    try {
        const selectors = [
            'button.menu-btn[onclick*="shop.html"]',
            'button.menu-btn[onclick*="news.html"]',
            'button.menu-btn[onclick*="learning.html"]',
            'button.menu-btn[onclick*="signal.html"]',
            'button.menu-btn[onclick*="autotrade-license.html"]',
            'button.menu-btn[onclick*="admin-prop.html"]'
        ];
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                const labelSpan = el.querySelector('span.menu-label');
                if (labelSpan) {
                    labelSpan.innerHTML = labelSpan.textContent.replace('🔒', '').trim();
                }
                el.classList.remove('locked-menu-item');
                el.style.pointerEvents = 'auto';
                el.style.opacity = '1';
                el.style.cursor = 'pointer';
                el.title = '';
                if (el.dataset.originalOnclick) {
                    el.onclick = new Function(el.dataset.originalOnclick);
                    delete el.dataset.originalOnclick;
                }
            });
        });
    } catch (error) {
        console.error('Error in unlockHamburgerMenuItems:', error);
    }
}

// نمایش پیام ثبت‌نام برای تب‌های قفل شده
function showRegistrationPrompt() {
    // Remove existing prompt if any
    const existingPrompt = document.getElementById('registration-prompt');
    if (existingPrompt) existingPrompt.remove();
    
    const prompt = document.createElement('div');
    prompt.id = 'registration-prompt';
    prompt.style = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #232946, #181c2a);
        border: 2px solid #a786ff;
        border-radius: 20px;
        padding: 2rem;
        z-index: 10000;
        text-align: center;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    `;
    
    prompt.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
        <h3 style="color: #00ff88; margin-bottom: 1rem; font-size: 1.3rem;">دسترسی محدود</h3>
        <p style="color: #b8c1ec; margin-bottom: 1.5rem; line-height: 1.6;">
            این بخش فقط برای کاربران فعال باز است.<br>
            لطفاً ابتدا ثبت‌نام کنید تا به تمام امکانات دسترسی داشته باشید.
        </p>
        <button onclick="showDirectRegistrationForm()" style="
            background: linear-gradient(135deg, #a786ff, #8b6bff);
            color: #fff;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 12px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
        ">ثبت‌نام کنید</button>
    `;
    
    document.body.appendChild(prompt);
    
    // Close on background click
    const overlay = document.createElement('div');
    overlay.id = 'registration-prompt-overlay';
    overlay.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
    `;
    overlay.onclick = () => {
        prompt.remove();
        overlay.remove();
    };
    document.body.appendChild(overlay);
}

// تابع تست وضعیت قفل
window.testLockStatus = async function() {
    try {
        console.log('🔍 Testing lock status...');
        
        const profile = await loadUserProfileOnce();
        console.log('📋 User profile:', profile);
        
        if (profile) {
            console.log('✅ Profile loaded successfully');
            console.log('🔓 Activation status:', profile.activated);
            console.log('👤 User address:', profile.address);
        } else {
            console.log('❌ No profile available');
        }
        
        // Check tab lock status
        const lockedTabs = document.querySelectorAll('.locked-tab');
        console.log('🔒 Locked tabs count:', lockedTabs.length);
        
        // Check hamburger menu lock status
        const lockedMenuItems = document.querySelectorAll('.locked-menu-item');
        console.log('🔒 Locked menu items count:', lockedMenuItems.length);
        
        return {
            profile: profile,
            lockedTabs: lockedTabs.length,
            lockedMenuItems: lockedMenuItems.length
        };
    } catch (error) {
        console.error('Error testing lock status:', error);
        return { error: error.message };
    }
};

// تابع نمایش مستقیم فرم ثبت‌نام
window.showDirectRegistrationForm = async function() {
    try {
        // اضافه کردن حالت loading به دکمه
        const registrationButton = document.getElementById('main-registration-button');
        if (registrationButton) {
            registrationButton.classList.add('loading');
            const button = registrationButton.querySelector('button');
            if (button) {
                button.textContent = '⏳ در حال بارگذاری...';
            }
        }
        
        // بستن پیام ثبت‌نام فعلی
        const existingPrompt = document.getElementById('registration-prompt');
        const existingOverlay = document.getElementById('registration-prompt-overlay');
        if (existingPrompt) existingPrompt.remove();
        if (existingOverlay) existingOverlay.remove();
        
        // اتصال به کیف پول
        const connection = await window.connectWallet();
        const { contract, address, provider } = connection;
        
        // دریافت آدرس معرف (deployer)
        let referrerAddress;
        try {
            referrerAddress = await contract.deployer();
        } catch (e) {
            console.error('Error getting deployer address:', e);
            referrerAddress = address; // fallback to connected address
        }
        
        // نمایش فرم ثبت‌نام
        if (typeof window.showRegisterForm === 'function') {
            window.showRegisterForm(referrerAddress, '', address, provider, contract);
        } else {
            // fallback به تب شبکه
            if (typeof window.showTab === 'function') {
                window.showTab('network');
            }
        }
        
        // حذف حالت loading
        if (registrationButton) {
            registrationButton.classList.remove('loading');
            const button = registrationButton.querySelector('button');
            if (button) {
                button.textContent = '🚀 ثبت‌نام اکنون';
            }
        }
        
    } catch (error) {
        console.error('Error showing direct registration form:', error);
        
        // حذف حالت loading در صورت خطا
        const registrationButton = document.getElementById('main-registration-button');
        if (registrationButton) {
            registrationButton.classList.remove('loading');
            const button = registrationButton.querySelector('button');
            if (button) {
                button.textContent = '🚀 ثبت‌نام اکنون';
            }
        }
        
        // در صورت خطا، به تب شبکه هدایت کن
        if (typeof window.showTab === 'function') {
            window.showTab('network');
        }
    }
};

document.addEventListener('DOMContentLoaded', lockTabsForDeactivatedUsers);

// تابع تست برای بررسی وضعیت قفل‌ها
window.testLockStatus = async function() {
    console.log('🔍 Testing lock status...');
    
    try {
        if (!window.getUserProfile) {
            console.log('❌ getUserProfile function not available');
            return;
        }
        
        const profile = await loadUserProfileOnce();
        console.log('👤 User profile:', profile);
        console.log('🔓 User activated:', profile.activated);
        
        if (!profile.activated) {
            console.log('🔒 User is not activated, applying locks...');
            
            // Test main tabs
            const testTabs = ['tab-shop-btn', 'tab-reports-btn', 'tab-learning-btn', 'tab-news-btn'];
            testTabs.forEach(tabId => {
                const el = document.getElementById(tabId);
                if (el) {
                    console.log(`✅ Found tab: ${tabId}`);
                    el.innerHTML = `🔒 ${tabId.replace('tab-', '').replace('-btn', '').toUpperCase()}`;
                    el.classList.add('locked-tab');
                    el.style.pointerEvents = 'none';
                    el.style.opacity = '0.5';
                    el.style.cursor = 'not-allowed';
                    el.title = '🔒 این بخش فقط برای کاربران فعال باز است';
                } else {
                    console.log(`❌ Tab not found: ${tabId}`);
                }
            });
            
            // Test hamburger menu
            setTimeout(() => {
                lockHamburgerMenuItems();
                console.log('🍔 Hamburger menu items locked');
            }, 1000);
            
        } else {
            console.log('✅ User is activated, no locks needed');
        }
        
    } catch (error) {
        console.error('❌ Error testing lock status:', error);
    }
};

// اجرای تست قفل‌ها بعد از 3 ثانیه
setTimeout(() => {
    if (typeof window.testLockStatus === 'function') {
        window.testLockStatus();
    }
}, 3000);

// تابع اجباری برای قفل کردن همه چیز
window.forceLockAll = function() {
    console.log('🔒 Force locking all restricted areas...');
    
    // قفل کردن تب‌های اصلی
    const mainTabs = [
        { id: 'tab-shop-btn', label: 'فروشگاه' },
        { id: 'tab-reports-btn', label: 'گزارشات' },
        { id: 'tab-learning-btn', label: 'آموزش' },
        { id: 'tab-news-btn', label: 'اخبار' }
    ];
    
    mainTabs.forEach(tab => {
        const el = document.getElementById(tab.id);
        if (el) {
            el.innerHTML = `🔒 ${tab.label}`;
            el.classList.add('locked-tab');
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.5';
            el.style.cursor = 'not-allowed';
            el.title = '🔒 این بخش فقط برای کاربران فعال باز است';
            console.log(`🔒 Locked tab: ${tab.id}`);
        }
    });
    
    // قفل کردن منوی همبرگری
    const hamburgerItems = [
        { selector: 'button[onclick*="shop.html"]', label: 'فروشگاه' },
        { selector: 'button[onclick*="news.html"]', label: 'اخبار' },
        { selector: 'button[onclick*="learning.html"]', label: 'آموزش' },
        { selector: 'button[onclick*="signal.html"]', label: 'سیگنال' },
        { selector: 'button[onclick*="autotrade-license.html"]', label: 'ربات' },
        { selector: 'button[onclick*="admin-prop.html"]', label: 'پاس پراپ' },
        { selector: 'button[onclick*="showTab(\'reports\')"]', label: 'گزارشات' }
    ];
    
    hamburgerItems.forEach(item => {
        const elements = document.querySelectorAll(item.selector);
        elements.forEach(el => {
            const btnText = el.querySelector('.btn-text');
            if (btnText) {
                btnText.innerHTML = `🔒 ${item.label}`;
            }
            el.classList.add('locked-menu-item');
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.5';
            el.style.cursor = 'not-allowed';
            el.title = '🔒 این بخش فقط برای کاربران فعال باز است';
            el.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                showRegistrationPrompt();
                return false;
            };
            console.log(`🔒 Locked hamburger item: ${item.label}`);
        });
    });
    
    console.log('✅ All restrictions applied');
};

// نمایش پیام خوشامدگویی و ثبت‌نام برای کاربران غیرفعال
window.showWelcomeRegistrationPrompt = async function() {
    try {
        // بررسی وضعیت کاربر
        if (!window.getUserProfile) return;
        
        const profile = await loadUserProfileOnce();
        if (profile.activated) return; // اگر کاربر فعال است، پیام نمایش نده
        
        // بررسی اینکه آیا قبلاً این پیام نمایش داده شده
        const hasShownWelcome = sessionStorage.getItem('welcomeRegistrationShown');
        if (hasShownWelcome) return;
        
        // دریافت قیمت ثبت‌نام
        let registrationPrice = '100';
        try {
            if (window.contractConfig && window.contractConfig.contract) {
                const price = await window.getRegistrationPrice(window.contractConfig.contract);
                registrationPrice = parseFloat(ethers.formatUnits(price, 18)).toFixed(0);
            }
        } catch (e) {
            console.log('Using default registration price');
        }
        
        // دریافت قیمت فعلی CPA
        let cpaPriceUSD = '0.000001';
        try {
            if (window.contractConfig && window.contractConfig.contract) {
                const price = await window.contractConfig.contract.getTokenPrice();
                cpaPriceUSD = parseFloat(ethers.formatUnits(price, 18)).toFixed(6);
            }
        } catch (e) {
            console.log('Using default CPA price');
        }
        
        // محاسبه ارزش دلاری ثبت‌نام
        const registrationValueUSD = (parseFloat(registrationPrice) * parseFloat(cpaPriceUSD)).toFixed(6);
        
        // ایجاد پیام خوشامدگویی
        const welcomeModal = document.createElement('div');
        welcomeModal.id = 'welcome-registration-modal';
        welcomeModal.style = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;
        
        welcomeModal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #232946, #181c2a);
                border: 2px solid #a786ff;
                border-radius: 24px;
                padding: 2.5rem;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                position: relative;
            ">
                <!-- دکمه بستن -->
                <button onclick="closeWelcomeModal()" style="
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: #a786ff;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                " onmouseover="this.style.background='rgba(167,134,255,0.1)'" onmouseout="this.style.background='none'">×</button>
                
                <!-- آیکون خوشامدگویی -->
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                
                <!-- عنوان -->
                <h2 style="
                    color: #00ff88;
                    margin-bottom: 1rem;
                    font-size: 1.8rem;
                    font-weight: bold;
                ">به CPA خوش آمدید!</h2>
                
                <!-- توضیحات -->
                <p style="
                    color: #b8c1ec;
                    margin-bottom: 1.5rem;
                    line-height: 1.6;
                    font-size: 1.1rem;
                ">
                    برای استفاده از تمام امکانات CPA و دسترسی به خدمات پیشرفته، 
                    لطفاً ثبت‌نام کنید.
                </p>
                
                <!-- کارت اطلاعات ثبت‌نام -->
                <div style="
                    background: rgba(167, 134, 255, 0.1);
                    border: 1px solid rgba(167, 134, 255, 0.3);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin: 1.5rem 0;
                    backdrop-filter: blur(10px);
                ">
                    <h3 style="
                        color: #a786ff;
                        margin-bottom: 1rem;
                        font-size: 1.3rem;
                        font-weight: bold;
                    ">💎 هزینه ثبت‌نام</h3>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 1rem;
                        margin-bottom: 1rem;
                    ">
                        <div style="text-align: center;">
                            <div style="
                                color: #00ff88;
                                font-size: 1.5rem;
                                font-weight: bold;
                                margin-bottom: 0.3rem;
                            ">${registrationPrice} CPA</div>
                            <div style="
                                color: #b8c1ec;
                                font-size: 0.9rem;
                            ">مبلغ ثبت‌نام</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="
                                color: #00ccff;
                                font-size: 1.5rem;
                                font-weight: bold;
                                margin-bottom: 0.3rem;
                            ">$${registrationValueUSD}</div>
                            <div style="
                                color: #b8c1ec;
                                font-size: 0.9rem;
                            ">ارزش دلاری</div>
                        </div>
                    </div>
                    
                    <div style="
                        color: #a786ff;
                        font-size: 0.9rem;
                        line-height: 1.4;
                    ">
                        💡 قیمت فعلی CPA: $${cpaPriceUSD} USDC
                    </div>
                </div>
                
                <!-- کارت مزایا -->
                <div style="
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid rgba(0, 255, 136, 0.3);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin: 1.5rem 0;
                    backdrop-filter: blur(10px);
                ">
                    <h3 style="
                        color: #00ff88;
                        margin-bottom: 1rem;
                        font-size: 1.3rem;
                        font-weight: bold;
                    ">🚀 مزایای ثبت‌نام</h3>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 0.8rem;
                        text-align: right;
                    ">
                        <div style="
                            color: #b8c1ec;
                            font-size: 0.9rem;
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                        ">
                            <span style="color: #00ff88;">✅</span>
                            دسترسی به فروشگاه
                        </div>
                        <div style="
                            color: #b8c1ec;
                            font-size: 0.9rem;
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                        ">
                            <span style="color: #00ff88;">✅</span>
                            سیگنال‌های معاملاتی
                        </div>
                        <div style="
                            color: #b8c1ec;
                            font-size: 0.9rem;
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                        ">
                            <span style="color: #00ff88;">✅</span>
                            ربات‌های معاملاتی
                        </div>
                        <div style="
                            color: #b8c1ec;
                            font-size: 0.9rem;
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                        ">
                            <span style="color: #00ff88;">✅</span>
                            آموزش‌های پیشرفته
                        </div>
                        <div style="
                            color: #b8c1ec;
                            font-size: 0.9rem;
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                        ">
                            <span style="color: #00ff88;">✅</span>
                            گزارشات تفصیلی
                        </div>
                        <div style="
                            color: #b8c1ec;
                            font-size: 0.9rem;
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                        ">
                            <span style="color: #00ff88;">✅</span>
                            پشتیبانی ویژه
                        </div>
                    </div>
                </div>
                
                <!-- دکمه‌های عملیات -->
                <div style="
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-top: 2rem;
                ">
                    <button onclick="registerNow()" style="
                        background: linear-gradient(135deg, #00ff88, #00cc66);
                        color: #181c2a;
                        border: none;
                        padding: 1rem 2rem;
                        border-radius: 12px;
                        font-size: 1.1rem;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s;
                        flex: 1;
                        max-width: 200px;
                    " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 20px rgba(0,255,136,0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                        🚀 ثبت‌نام کنید
                    </button>
                    
                    <button onclick="closeWelcomeModal()" style="
                        background: rgba(255, 255, 255, 0.1);
                        color: #b8c1ec;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        padding: 1rem 2rem;
                        border-radius: 12px;
                        font-size: 1.1rem;
                        cursor: pointer;
                        transition: all 0.3s;
                        flex: 1;
                        max-width: 200px;
                    " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                        بعداً
                    </button>
                </div>
                
                <!-- پیام اضافی -->
                <p style="
                    color: #888;
                    font-size: 0.9rem;
                    margin-top: 1.5rem;
                    line-height: 1.4;
                ">
                    💡 می‌توانید با معرفی دوستان خود، 
                    <span style="color: #a786ff;">کمیسیون دریافت کنید</span> و 
                    <span style="color: #00ff88;">درآمد کسب کنید</span>!
                </p>
                
                <!-- دکمه اطلاعات رفرال -->
                <button onclick="showReferralInfo()" style="
                    background: none;
                    border: 1px solid #a786ff;
                    color: #a786ff;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-top: 1rem;
                " onmouseover="this.style.background='rgba(167,134,255,0.1)'" onmouseout="this.style.background='none'">
                    🤝 اطلاعات رفرال و کمیسیون
                </button>
            </div>
        `;
        
        document.body.appendChild(welcomeModal);
        
        // ذخیره اینکه پیام نمایش داده شده
        sessionStorage.setItem('welcomeRegistrationShown', 'true');
        
    } catch (error) {
        console.error('Error showing welcome registration prompt:', error);
    }
};

// تابع بستن مودال خوشامدگویی
window.closeWelcomeModal = function() {
    const modal = document.getElementById('welcome-registration-modal');
    if (modal) {
        modal.remove();
    }
};

// تابع ثبت‌نام مستقیم
window.registerNow = function() {
    closeWelcomeModal();
    // استفاده از تابع نمایش مستقیم فرم ثبت‌نام
    if (typeof window.showDirectRegistrationForm === 'function') {
        window.showDirectRegistrationForm();
    } else if (typeof window.showTab === 'function') {
        window.showTab('network');
    }
};

// تابع مدیریت دکمه ثبت‌نام اصلی
window.manageMainRegistrationButton = async function() {
    try {
        // بررسی وضعیت کاربر
        if (!window.getUserProfile) {
            console.log('getUserProfile function not available');
            return;
        }
        
        const profile = await loadUserProfileOnce();
        const registrationButton = document.getElementById('main-registration-button');
        
        if (!registrationButton) {
            console.log('Main registration button not found');
            return;
        }
        
        if (!profile.activated) {
            // کاربر ثبت‌نام نکرده - نمایش دکمه
            registrationButton.style.display = 'block';
            
            // بروزرسانی هزینه ثبت‌نام
            try {
                if (window.contractConfig && window.contractConfig.contract) {
                    const price = await window.getRegistrationPrice(window.contractConfig.contract);
                    const formattedPrice = parseFloat(ethers.formatUnits(price, 18)).toFixed(0);
                    const costDisplay = document.getElementById('registration-cost-display');
                    if (costDisplay) {
                        costDisplay.textContent = `${formattedPrice} CPA`;
                    }
                }
            } catch (e) {
                console.log('Could not update registration cost:', e);
            }
            
            console.log('✅ Main registration button shown for unregistered user');
        } else {
            // کاربر ثبت‌نام کرده - مخفی کردن دکمه
            registrationButton.style.display = 'none';
            console.log('✅ Main registration button hidden for registered user');
        }
        
    } catch (error) {
        console.error('Error managing main registration button:', error);
        // در صورت خطا، دکمه را مخفی کن
        const registrationButton = document.getElementById('main-registration-button');
        if (registrationButton) {
            registrationButton.style.display = 'none';
        }
    }
};

// تابع پاک کردن دکمه ثبت‌نام اصلی (بعد از ثبت‌نام موفق)
window.hideMainRegistrationButton = function() {
    const registrationButton = document.getElementById('main-registration-button');
    if (registrationButton) {
        registrationButton.style.display = 'none';
        console.log('✅ Main registration button hidden after successful registration');
    }
};

// نمایش پیام خوشامدگویی بعد از 2 ثانیه
setTimeout(() => {
    if (typeof window.showWelcomeRegistrationPrompt === 'function') {
        window.showWelcomeRegistrationPrompt();
    }
}, 2000);

// مدیریت دکمه ثبت‌نام اصلی بعد از 3 ثانیه
setTimeout(() => {
    if (typeof window.manageMainRegistrationButton === 'function') {
        window.manageMainRegistrationButton();
    }
}, 3000);

// تابع نمایش اطلاعات رفرال و کمیسیون
window.showReferralInfo = function() {
    const referralModal = document.createElement('div');
    referralModal.id = 'referral-info-modal';
    referralModal.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    referralModal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #232946, #181c2a);
            border: 2px solid #00ff88;
            border-radius: 24px;
            padding: 2.5rem;
            max-width: 600px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            position: relative;
        ">
            <!-- دکمه بستن -->
            <button onclick="closeReferralModal()" style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                color: #00ff88;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            " onmouseover="this.style.background='rgba(0,255,136,0.1)'" onmouseout="this.style.background='none'">×</button>
            
            <!-- آیکون رفرال -->
            <div style="font-size: 4rem; margin-bottom: 1rem;">🤝</div>
            
            <!-- عنوان -->
            <h2 style="
                color: #00ff88;
                margin-bottom: 1rem;
                font-size: 1.8rem;
                font-weight: bold;
            ">سیستم رفرال CPA</h2>
            
            <!-- توضیحات -->
            <p style="
                color: #b8c1ec;
                margin-bottom: 1.5rem;
                line-height: 1.6;
                font-size: 1.1rem;
            ">
                با معرفی دوستان خود، کمیسیون دریافت کنید و درآمد کسب کنید!
            </p>
            
            <!-- کارت اطلاعات رفرال -->
            <div style="
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 16px;
                padding: 1.5rem;
                margin: 1.5rem 0;
                backdrop-filter: blur(10px);
            ">
                <h3 style="
                    color: #00ff88;
                    margin-bottom: 1rem;
                    font-size: 1.3rem;
                    font-weight: bold;
                ">💰 ساختار کمیسیون</h3>
                
                <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1rem;
                ">
                    <div style="text-align: center;">
                        <div style="
                            color: #00ccff;
                            font-size: 1.5rem;
                            font-weight: bold;
                            margin-bottom: 0.3rem;
                        ">5%</div>
                        <div style="
                            color: #b8c1ec;
                            font-size: 0.9rem;
                        ">کمیسیون مستقیم</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="
                            color: #a786ff;
                            font-size: 1.5rem;
                            font-weight: bold;
                            margin-bottom: 0.3rem;
                        ">2%</div>
                        <div style="
                            color: #b8c1ec;
                            font-size: 0.9rem;
                        ">کمیسیون غیرمستقیم</div>
                    </div>
                </div>
                
                <div style="
                    color: #00ff88;
                    font-size: 0.9rem;
                    line-height: 1.4;
                    margin-top: 1rem;
                ">
                    💡 برای هر ثبت‌نام 100 CPA، شما 5 CPA کمیسیون مستقیم دریافت می‌کنید
                </div>
            </div>
            
            <!-- کارت مزایای رفرال -->
            <div style="
                background: rgba(167, 134, 255, 0.1);
                border: 1px solid rgba(167, 134, 255, 0.3);
                border-radius: 16px;
                padding: 1.5rem;
                margin: 1.5rem 0;
                backdrop-filter: blur(10px);
            ">
                <h3 style="
                    color: #a786ff;
                    margin-bottom: 1rem;
                    font-size: 1.3rem;
                    font-weight: bold;
                ">🎯 مزایای رفرال</h3>
                
                <div style="
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0.8rem;
                    text-align: right;
                ">
                    <div style="
                        color: #b8c1ec;
                        font-size: 0.9rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    ">
                        <span style="color: #00ff88;">✅</span>
                        درآمد مستمر از فعالیت‌های معرفی شده
                    </div>
                    <div style="
                        color: #b8c1ec;
                        font-size: 0.9rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    ">
                        <span style="color: #00ff88;">✅</span>
                        کمیسیون از تمام معاملات زیرمجموعه
                    </div>
                    <div style="
                        color: #b8c1ec;
                        font-size: 0.9rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    ">
                        <span style="color: #00ff88;">✅</span>
                        پاداش‌های ویژه برای رفرال‌های موفق
                    </div>
                    <div style="
                        color: #b8c1ec;
                        font-size: 0.9rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    ">
                        <span style="color: #00ff88;">✅</span>
                        دسترسی به ابزارهای مدیریت رفرال
                    </div>
                </div>
            </div>
            
            <!-- دکمه‌های عملیات -->
            <div style="
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 2rem;
            ">
                <button onclick="copyReferralLink()" style="
                    background: linear-gradient(135deg, #a786ff, #8b6bff);
                    color: #fff;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    flex: 1;
                    max-width: 200px;
                " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 20px rgba(167,134,255,0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                    📋 کپی لینک رفرال
                </button>
                
                <button onclick="closeReferralModal()" style="
                    background: rgba(255, 255, 255, 0.1);
                    color: #b8c1ec;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    flex: 1;
                    max-width: 200px;
                " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                    بستن
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(referralModal);
};

// تابع بستن مودال رفرال
window.closeReferralModal = function() {
    const modal = document.getElementById('referral-info-modal');
    if (modal) {
        modal.remove();
    }
};

// تابع کپی لینک رفرال
window.copyReferralLink = async function() {
    try {
        const profile = await loadUserProfileOnce();
        const currentUrl = window.location.origin + window.location.pathname;
        const referralLink = `${currentUrl}?ref=${profile.address}`;
        
        await navigator.clipboard.writeText(referralLink);
        
        // نمایش پیام موفقیت
        const successMsg = document.createElement('div');
        successMsg.style = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00ff88, #00cc66);
            color: #181c2a;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: bold;
            z-index: 10002;
            animation: slideInRight 0.3s ease;
        `;
        successMsg.textContent = '✅ لینک رفرال کپی شد!';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
        }, 3000);
        
    } catch (error) {
        console.error('Error copying referral link:', error);
    }
};

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
            var sessionBox = document.getElementById('session-timer-box');
            if (sessionBox) sessionBox.style.display = 'block';
        }
    }
})();

// نمایش قیمت توکن برای همه کاربران (حتی بدون اتصال کیف پول)
async function showTokenPricesForAll() {
    try {
        // اگر contractConfig و contract آماده است
        if (window.contractConfig && window.contractConfig.contract) {
            const contract = window.contractConfig.contract;
            // قیمت CPA به USDC (قیمت توکن مستقیماً به USDC است)
            const tokenPrice = await contract.getTokenPrice();
            const tokenPriceFormatted = ethers.formatUnits(tokenPrice, 18);
            
            // نمایش در عناصر
            const cpaUsd = document.getElementById('chart-lvl-usd');
            if (cpaUsd) cpaUsd.textContent = '$' + tokenPriceFormatted;
        }
    } catch (e) {
        // اگر خطا بود، مقدار پیش‌فرض نمایش بده
        const cpaUsd = document.getElementById('chart-lvl-usd');
        if (cpaUsd) cpaUsd.textContent = '-';
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
        const [lvlBalance, tokenPrice] = await Promise.all([
            contract.balanceOf(address),
            contract.getTokenPrice()
        ]);
        const lvl = ethers.formatUnits(lvlBalance, 18);
        const tokenPriceFormatted = ethers.formatUnits(tokenPrice, 18);
        const usdValue = (parseFloat(lvl) * parseFloat(tokenPriceFormatted)).toFixed(2);
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
                    ? shortenAddress(referrerAddress) : '-';
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

window.showTab = async function(tab) {
      const tabs = ['network','profile','reports','swap','transfer','news','shop','learning','about','register'];
      tabs.forEach(function(name) {
        var mainEl = document.getElementById('main-' + name);
        if (mainEl) {
          if (name === tab) {
            mainEl.style.display = '';
            // اضافه کردن انیمیشن fade-in
            mainEl.style.opacity = '0';
            mainEl.style.transform = 'translateY(20px)';
            setTimeout(() => {
              mainEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
              mainEl.style.opacity = '1';
              mainEl.style.transform = 'translateY(0)';
            }, 50);
          } else {
            mainEl.style.display = 'none';
            mainEl.style.opacity = '1';
            mainEl.style.transform = 'translateY(0)';
          }
        }
        var btnEl = document.getElementById('tab-' + name + '-btn');
        if (btnEl) btnEl.classList.toggle('active', name === tab);
      });
      // اسکرول به بخش انتخاب شده
      const targetElement = document.getElementById('main-' + tab);
      if (targetElement) {
        // بستن منوی همبرگر
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        if (hamburgerMenu) {
          hamburgerMenu.classList.remove('open');
        }
        // اسکرول نرم به بخش
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            targetElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }, 200);
        }, 100);
      }
      try {
        switch(tab) {
          case 'network':
            if (typeof window.initializeNetworkTab === 'function') {
              await window.initializeNetworkTab();
            } else {
              if (typeof updateNetworkStats === 'function') await updateNetworkStats();
            }
            break;
          case 'profile':
            if (typeof window.loadUserProfile === 'function') await window.loadUserProfile();
            break;
          case 'reports':
            if (typeof window.loadReports === 'function') await window.loadReports();
            break;
          case 'swap':
            if (typeof window.loadSwapTab === 'function') await window.loadSwapTab();
            break;
          case 'transfer':
            if (typeof window.loadTransferTab === 'function') await window.loadTransferTab();
            break;
          case 'register':
            if (typeof window.setRegisterTabSelected === 'function') window.setRegisterTabSelected(true);
            if (typeof window.loadRegisterData === 'function' && window.contractConfig) {
              await window.loadRegisterData(window.contractConfig.contract, window.contractConfig.address, window.tokenPriceUSDFormatted);
            }
            break;
        }
      } catch (e) { console.error(e); }
    }

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('empty-node')) {
    (async function() {
      const { contract, address, provider } = await window.connectWallet();
      const userData = await contract.users(address);
      let referrerAddress;
      let defaultNewWallet = '';
      if (userData.activated) {
        // حالت ۱: کاربر ثبت‌نام کرده و می‌خواهد زیرمجموعه بگیرد
        const childIndex = e.target.getAttribute('data-index');
        const parentIndex = Math.floor(Number(childIndex) / 2);
        referrerAddress = await contract.indexToAddress(BigInt(parentIndex));
        defaultNewWallet = '';
      } else {
        // حالت ۲ و ۳: کاربر ثبت‌نام نکرده
        referrerAddress = getReferrerFromURL() || getReferrerFromStorage();
        if (!referrerAddress) {
          referrerAddress = await contract.deployer();
        }
        defaultNewWallet = address;
      }
      showRegisterForm(referrerAddress, defaultNewWallet, address, provider, contract);
    })();
  }
});

// فرم ثبت‌نام با ورودی آدرس ولت جدید و نمایش موجودی متیک و توکن - بهینه‌سازی شده برای موبایل
window.showRegisterForm = function(referrerAddress, defaultNewWallet, connectedAddress, provider, contract) {
  let old = document.getElementById('register-form-modal');
  if (old) old.remove();
  
  const modal = document.createElement('div');
  modal.id = 'register-form-modal';
  modal.style = `
    position: fixed;
    z-index: 3000;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    box-sizing: border-box;
  `;
  
  modal.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #181c2a, #232946);
      padding: 1.5rem;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      direction: rtl;
      position: relative;
      border: 2px solid #a786ff;
    ">
      <!-- Header -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #a786ff;
      ">
        <h3 style="
          color: #00ff88;
          margin: 0;
          font-size: 1.3rem;
          font-weight: bold;
          text-align: center;
          flex: 1;
        ">📝 ثبت‌نام جدید</h3>
        <button id="register-form-close" style="
          background: none;
          border: none;
          color: #fff;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">×</button>
      </div>

      <!-- Referrer Info -->
      <div style="
        background: rgba(167, 134, 255, 0.1);
        border: 1px solid #a786ff;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1.5rem;
      ">
        <div style="color: #a786ff; font-weight: bold; margin-bottom: 0.5rem;">👤 معرف (Referrer):</div>
        <div style="
          color: #fff;
          font-family: monospace;
          font-size: 0.9rem;
          word-break: break-all;
          background: rgba(0,0,0,0.3);
          padding: 0.5rem;
          border-radius: 6px;
        ">${referrerAddress}</div>
      </div>

      <!-- New Wallet Input -->
      <div style="margin-bottom: 1.5rem;">
        <label for="register-new-wallet" style="
          display: block;
          color: #fff;
          font-weight: bold;
          margin-bottom: 0.5rem;
        ">🔑 آدرس ولت جدید:</label>
        <input id="register-new-wallet" 
          type="text" 
          placeholder="0x..." 
          value="${defaultNewWallet}"
          style="
            width: 100%;
            padding: 1rem;
            border-radius: 12px;
            border: 2px solid #a786ff;
            background: rgba(0,0,0,0.3);
            color: #fff;
            font-family: monospace;
            font-size: 1rem;
            direction: ltr;
            text-align: left;
            box-sizing: border-box;
            transition: border-color 0.3s;
          "
          onfocus="this.style.borderColor='#00ff88'"
          onblur="this.style.borderColor='#a786ff'"
        />
      </div>

      <!-- Balance Info -->
      <div style="
        background: rgba(0, 255, 136, 0.1);
        border: 1px solid #00ff88;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1.5rem;
      ">
        <div style="color: #00ff88; font-weight: bold; margin-bottom: 1rem;">💰 موجودی‌های شما:</div>
        
        <div style="display: grid; gap: 0.8rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #fff;">🟣 POL:</span>
            <span id="register-matic-balance" style="color: #a786ff; font-weight: bold;">در حال دریافت...</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #fff;">🟢 CPA:</span>
            <span id="register-cpa-balance" style="color: #00ff88; font-weight: bold;">در حال دریافت...</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #fff;">💵 USDC:</span>
            <span id="register-usdc-balance" style="color: #00ccff; font-weight: bold;">در حال دریافت...</span>
          </div>
        </div>
      </div>

      <!-- Required Amount -->
      <div style="
        background: rgba(255, 107, 107, 0.1);
        border: 1px solid #ff6b6b;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1.5rem;
      ">
        <div style="color: #ff6b6b; font-weight: bold; margin-bottom: 0.5rem;">⚠️ مقدار مورد نیاز:</div>
        <div id="register-required-usdc" style="
          color: #ff6b6b;
          font-size: 1.1rem;
          font-weight: bold;
          text-align: center;
        ">در حال دریافت...</div>
      </div>

      <!-- Action Buttons -->
      <div style="
        display: flex;
        gap: 1rem;
        flex-direction: column;
      ">
        <button id="register-form-confirm" style="
          background: linear-gradient(135deg, #00ff88, #00cc66);
          color: #232946;
          font-weight: bold;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
        " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,255,136,0.4)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(0,255,136,0.3)'">
          ✅ ثبت‌نام
        </button>
        <button id="register-form-cancel" style="
          background: linear-gradient(135deg, #a786ff, #8b6bff);
          color: #fff;
          font-weight: bold;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(167, 134, 255, 0.3);
        " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(167,134,255,0.4)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(167,134,255,0.3)'">
          ❌ انصراف
        </button>
      </div>

      <!-- Status Message -->
      <div id="register-form-status" style="
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        font-weight: bold;
        min-height: 20px;
      "></div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close button functionality
  document.getElementById('register-form-close').onclick = () => modal.remove();
  document.getElementById('register-form-cancel').onclick = () => modal.remove();
  
  // Close on background click
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  // دریافت و نمایش موجودی متیک و توکن و مقدار مورد نیاز ثبت‌نام
  (async function() {
    try {
      // اطمینان از مقداردهی provider و contract و connectedAddress
      if (!provider || !contract || !connectedAddress) {
        const connection = await window.connectWallet();
        provider = connection.provider;
        contract = connection.contract;
        connectedAddress = connection.address;
      }
      let matic = '-';
      let cpa = '-';
      let usdc = '-';
      let requiredUsdc = '-';

      console.log('provider:', provider);
      console.log('contract:', contract);
      console.log('connectedAddress:', connectedAddress);

      if (provider && connectedAddress) {
        try {
          const bal = await provider.getBalance(connectedAddress);
          matic = window.ethers ? window.ethers.formatUnits(bal, 18) : bal.toString();
          console.log('matic:', matic);
        } catch (e) {
          matic = 'خطا در دریافت POL';
          console.error('Error fetching MATIC:', e);
        }
      }
      if (contract && connectedAddress) {
        try {
          const cpaBal = await contract.balanceOf(connectedAddress);
          cpa = window.ethers ? window.ethers.formatUnits(cpaBal, 18) : cpaBal.toString();
          console.log('cpa:', cpa);
        } catch (e) {
          cpa = 'خطا در دریافت CPA';
          console.error('Error fetching CPA:', e);
        }
        // دریافت موجودی USDC
        try {
          const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
          const USDC_ABI = ["function balanceOf(address) view returns (uint256)"];
          // استفاده از provider به جای signer
          const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider || contract.provider);
          const usdcBal = await usdcContract.balanceOf(connectedAddress);
          usdc = window.ethers ? window.ethers.formatUnits(usdcBal, 6) : usdcBal.toString();
          console.log('usdc:', usdc);
        } catch (e) {
          usdc = 'خطا در دریافت USDC';
          console.error('Error fetching USDC:', e);
        }
        // مقدار مورد نیاز ثبت‌نام
        requiredUsdc = '100 CPA'; // Static value
      }
      document.getElementById('register-matic-balance').textContent = matic;
      document.getElementById('register-cpa-balance').textContent = cpa;
      document.getElementById('register-usdc-balance').textContent = usdc;
      document.getElementById('register-required-usdc').textContent = requiredUsdc;



      // فراخوانی تابع displayUserBalances برای اطمینان از نمایش صحیح موجودی‌ها
      if (window.displayUserBalances) {
        await window.displayUserBalances();
      }

      // فراخوانی تابع updateRegisterRequiredAmount برای اطمینان از نمایش صحیح
      // if (window.updateRegisterRequiredAmount) {
      //   await window.updateRegisterRequiredAmount();
      // }
    } catch (e) {
      document.getElementById('register-matic-balance').textContent = '-';
      document.getElementById('register-cpa-balance').textContent = '-';
      document.getElementById('register-usdc-balance').textContent = '-';
      document.getElementById('register-required-usdc').textContent = '-';
      console.error('General error in register modal:', e);
    }
  })();
  document.getElementById('register-form-confirm').onclick = async function() {
    const statusDiv = document.getElementById('register-form-status');
    let newWallet = document.getElementById('register-new-wallet').value.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(newWallet)) {
      statusDiv.textContent = 'آدرس ولت جدید معتبر نیست!';
      return;
    }
    try {
      const { contract } = await window.connectWallet();
      await contract.registerAndActivate(referrerAddress, newWallet);
      statusDiv.textContent = 'ثبت‌نام با موفقیت انجام شد!';
      
      // مخفی کردن دکمه ثبت‌نام اصلی
      if (typeof window.hideMainRegistrationButton === 'function') {
        window.hideMainRegistrationButton();
      }
      
      // پاک‌سازی کش پروفایل و اجرای مجدد قفل‌گذاری بدون رفرش
      if (typeof window.clearUserProfileCache === 'function') window.clearUserProfileCache();
      setTimeout(() => { 
        if (typeof lockTabsForDeactivatedUsers === 'function') lockTabsForDeactivatedUsers();
        modal.remove();
      }, 1200);
    } catch (e) {
      statusDiv.textContent = 'خطا در ثبت‌نام: ' + (e && e.message ? e.message : e);
    }
  };
}

function showUserPopup(address, user) {
    // تابع کوتاه‌کننده آدرس
    function shortAddress(addr) {
        if (!addr) return '-';
        return addr.slice(0, 6) + '...' + addr.slice(-4);
    }
    // اطلاعات struct را به صورت رشته آماده کن
    const infoLines = [
        `Address:   ${shortAddress(address)}`,
        `Index:     ${user.index}`,
        `Activated: ${user.activated ? 'Yes' : 'No'}`,
        `BinaryPoints: ${user.binaryPoints}`,
        `Cap:      ${user.binaryPointCap}`,
        `Left:     ${user.leftPoints}`,
        `Right:    ${user.rightPoints}`,
        `Refclimed:${user.refclimed}`
    ];
    let html = `
      <div style="direction:ltr;font-family:monospace;background:#181c2a;color:#00ff88;padding:1.5rem 2.5rem;border-radius:16px;box-shadow:0 2px 12px #00ff8840;min-width:320px;max-width:95vw;position:relative;">
        <pre id="user-popup-terminal" style="background:#232946;border:1.5px solid #333;padding:1.2rem 1.5rem;border-radius:12px;color:#00ff88;font-size:1.05rem;line-height:2;font-family:monospace;overflow-x:auto;margin-bottom:1.2rem;box-shadow:0 2px 12px #00ff8840;min-width:280px;" title="${address}"></pre>
        <button id="close-user-popup" style="position:absolute;top:10px;right:10px;font-size:1.3rem;background:none;border:none;color:#fff;cursor:pointer;">×</button>
      </div>
    `;
    let popup = document.createElement('div');
    popup.id = 'user-popup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%,-50%)';
    popup.style.zIndex = 9999;
    popup.innerHTML = html;
    document.body.appendChild(popup);
    document.getElementById('close-user-popup').onclick = () => popup.remove();

  
    const terminalEl = document.getElementById('user-popup-terminal');
    if (terminalEl) {
        terminalEl.textContent = infoLines.join('\n');
    }
}
