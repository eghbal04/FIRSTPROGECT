// main.js
// پاک‌سازی کنسول در ابتدای برنامه
console.clear();

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
    // به‌روزرسانی همزمان همه کارت‌های داشبورد با Promise.all
    if (window.contractConfig && window.contractConfig.contract) {
      const contract = window.contractConfig.contract;
      try {
        const [
          totalSupply,
          daiBalance,
          tokenBalance,
          wallets,
          totalPoints
        ] = await Promise.all([
          contract.totalSupply(),
          // Use correct function name for DAI balance
                  contract.getContractdaiBalance ? contract.getContractdaiBalance() :
        (new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, contract.provider)).balanceOf(contract.target),
          contract.balanceOf ? contract.balanceOf(contract.target) : Promise.resolve(0),
          contract.wallets(),
          contract.totalClaimableBinaryPoints()
        ]);
        const setFormatted = (id, val, decimals = 18, suffix = '') => { 
          const el = document.getElementById(id); 
          if (el) {
            const num = Number(val) / Math.pow(10, decimals);
            const formatted = num.toLocaleString('en-US', {maximumFractionDigits: 2}) + suffix;
            el.textContent = formatted;
          } 
        };
        
        setFormatted('circulating-supply', totalSupply, 18, ''); // حذف پسوند CPA
        setFormatted('dashboard-dai-balance', daiBalance, 18, ''); // حذف پسوند DAI
        setFormatted('contract-token-balance', tokenBalance, 18, ''); // حذف پسوند CPA
        setFormatted('dashboard-wallets-count', wallets, 0, '');
        // set('total-points', Math.floor(Number(totalPoints) / 1e18).toLocaleString('en-US'));
        // set('total-points', '-');
      } catch (e) {
        // set('total-points', '-');
      }
    }



    // نمایش آدرس قرارداد در کارت داشبورد (بدون دکمه، فقط با کلیک روی آدرس)
    const contractAddress = (window.contractConfig && window.contractConfig.CPA_ADDRESS) ? window.contractConfig.CPA_ADDRESS : (typeof CPA_ADDRESS !== 'undefined' ? CPA_ADDRESS : '');
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

    // همزمان با سایر مقادیر داشبورد، کل پوینت‌ها را هم به‌روزرسانی کن
    const totalPointsEl = document.getElementById('total-points');
    if (totalPointsEl && window.contractConfig && window.contractConfig.contract) {
      try {
        // استفاده از تابع totalClaimablePoints برای نمایش کل پوینت‌های باینری
        const contract = window.contractConfig.contract;
        const result = await contract.totalClaimablePoints();
        // استفاده از ethers.formatUnits برای تبدیل صحیح BigInt به عدد
        const totalPoints = parseInt(ethers.formatUnits(result, 0));
        
        totalPointsEl.textContent = totalPoints.toLocaleString('en-US');
        console.log(`📊 کل پوینت‌های باینری: ${totalPoints.toLocaleString('en-US')}`);
        
      } catch (e) {
        console.warn('⚠️ خطا در دریافت پوینت‌های باینری:', e);
        totalPointsEl.textContent = '-';
      }
    }
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


// تابع اتصال کیف پول با نوع مشخص
async function connectWalletAndUpdateUI(walletType) {
    try {
        const connection = await connectWallet();
        const { contract, address, provider } = connection;
        
        // به‌روزرسانی UI اتصال
        updateConnectionUI(null, address, walletType);
        
        // بررسی وضعیت کاربر و نمایش فرم ثبت‌نام اگر فعال نیست
        try {
            const userData = await contract.users(address);
            if (!userData.activated) {
                // کاربر فعال نیست - فرم ثبت‌نام را نمایش بده
                setTimeout(() => {
                    showRegistrationFormForInactiveUser();
                }, 1500); // کمی صبر کن تا UI کاملاً لود شود
            }
        } catch (userDataError) {
            console.warn('Could not fetch user data:', userDataError);
            // در صورت خطا، فرم ثبت‌نام را نمایش بده
            setTimeout(() => {
                showRegistrationFormForInactiveUser();
            }, 1500);
        }
        
        // به‌روزرسانی ناوبار بر اساس وضعیت کاربر
        await updateNavbarBasedOnUserStatus();
        
        // به‌روزرسانی قفل‌ها
        await lockTabsForDeactivatedUsers();
        
        // به‌روزرسانی موجودی‌های ترنسفر
        setTimeout(() => {
            if (window.updateTransferBalancesOnConnect) {
                window.updateTransferBalancesOnConnect();
            }
        }, 2000);
        
        return connection;
    } catch (error) {
        console.error('Error in connectWalletAndUpdateUI:', error);
        throw error;
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
            updateElement('dai-balance', profile.daiBalance); // حذف پسوند DAI
        updateElement('profile-dai', profile.daiBalance); // حذف پسوند DAI

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
        let daiBalance = '0';
        if (signer && typeof window.DAI_ADDRESS !== 'undefined' && typeof window.DAI_ABI !== 'undefined') {
          const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, signer);
          const daiRaw = await daiContract.balanceOf(address);
          daiBalance = ethers.formatUnits(daiRaw, 18); // DAI has 18 decimals (display as USDC)
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
            daiBalance,
            isRegistered: userData.activated,
            binaryPoints: ethers.formatUnits(userData.binaryPoints, 18),
            binaryPointCap: userData.binaryPointCap.toString(),
            referrer: userData.referrer
        };
    } catch (error) {
        return {
            address: '---',
            daiBalance: '0',
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

// تعریف تابع connectWallet در window برای استفاده در فایل‌های دیگر
window.connectWallet = connectWallet;

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
                // کاربر فعال است
                updateNavbarForActiveUser();
                
                // به‌روزرسانی نمایش ID کاربر
                if (userData.index) {
                    updateCPAIdDisplay(userData.index);
                }
            } else {
                // کاربر فعال نیست
                resetNavbarToDefault();
            }
        } catch (error) {
            console.error('Error checking user status:', error);
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
                        
        }
    } catch (error) {
        console.error('Error in lockTabsForDeactivatedUsers:', error);
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
        // User profile loaded
        
        if (profile) {
            // Profile loaded successfully
        } else {
            // No profile available
        }
        
        // Check tab lock status
        const lockedTabs = document.querySelectorAll('.locked-tab');
        const lockedMenuItems = document.querySelectorAll('.locked-menu-item') || [];

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

document.addEventListener('DOMContentLoaded', async function() {
    // ابتدا قفل‌ها را اعمال کن
    await lockTabsForDeactivatedUsers();
    
    // بازیابی تب فعال از localStorage
    const savedTab = localStorage.getItem('currentActiveTab');
    if (savedTab && typeof window.showTab === 'function') {
        // کمی صبر کن تا صفحه کاملاً لود شود
        setTimeout(() => {
            window.showTab(savedTab);
        }, 500);
    }
});

// تابع تست برای بررسی وضعیت قفل‌ها - حذف شده

// اجرای تست قفل‌ها بعد از 3 ثانیه
setTimeout(() => {
    if (typeof window.testLockStatus === 'function') {
        window.testLockStatus();
    }
}, 3000);

// تابع اجباری برای قفل کردن همه چیز - حذف شده

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
        let registrationPrice = null;
        try {
            if (window.contractConfig && window.contractConfig.contract) {
                const price = await window.getRegPrice(window.contractConfig.contract);
                registrationPrice = parseFloat(ethers.formatUnits(price, 18)).toFixed(0);
            }
        } catch (e) {
            registrationPrice = null;
        }
        
        // دریافت قیمت فعلی CPA
        let cpaPriceUSD = null;
        try {
            if (window.contractConfig && window.contractConfig.contract) {
                const price = await window.contractConfig.contract.getTokenPrice();
                cpaPriceUSD = parseFloat(ethers.formatUnits(price, 18)).toFixed(6);
            }
        } catch (e) {
            cpaPriceUSD = null;
        }
        
        // محاسبه ارزش دلاری ثبت‌نام
        let registrationValueUSD = '';
        if (registrationPrice && cpaPriceUSD) {
            registrationValueUSD = (parseFloat(registrationPrice) * parseFloat(cpaPriceUSD)).toFixed(6);
        } else {
            registrationValueUSD = 'در حال دریافت...';
        }
        
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
                        💡 قیمت فعلی CPA: $${cpaPriceUSD ? cpaPriceUSD : 'در حال دریافت...'} DAI
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
                    const price = await window.getRegPrice(window.contractConfig.contract);
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
            // قیمت CPA به DAI (قیمت توکن مستقیماً به DAI است)
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
    const shortAddress = address ? `${address.slice(0, 3)}...${address.slice(-2)}` : '-';
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
        lvlBalanceElement.textContent = balanceInCPA ? balanceInCPA : '-'; // حذف پسوند CPA
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
window.showRegisterForm = async function(referrerAddress, defaultNewWallet, connectedAddress, provider, contract) {
  let old = document.getElementById('register-form-modal');
  if (old) old.remove();

  // Check registration status of connected wallet
  let isRegistered = false;
  try {
    if (contract && connectedAddress) {
      const userData = await contract.users(connectedAddress);
      isRegistered = userData && userData.activated;
    }
  } catch (e) { isRegistered = false; }

  // Determine input value and readonly state
  let walletInputValue = '';
  let walletInputReadonly = false;
  if (!isRegistered && connectedAddress) {
    walletInputValue = connectedAddress;
    walletInputReadonly = true;
  } else {
    walletInputValue = '';
    walletInputReadonly = false;
  }

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
    padding: 0.7rem;
    box-sizing: border-box;
  `;

  // Determine referrer input value and readonly state
  let referrerInputValue = referrerAddress;
  let referrerInputReadonly = false;
  
  // ابتدا بررسی کنیم که آیا کاربر متصل فعال است و ایندکس دارد
  try {
    if (contract && connectedAddress) {
      const connectedUserData = await contract.users(connectedAddress);
      if (connectedUserData.activated) {
        // اگر کاربر فعال است، از آدرس خودش به عنوان معرف استفاده کن
        referrerInputValue = connectedAddress;
        referrerInputReadonly = true;
      } else {
        // اگر کاربر فعال نیست، از روش‌های قبلی استفاده کن
        // ابتدا از URL بگیر
        if (typeof getReferrerFromURL === 'function') {
          referrerInputValue = getReferrerFromURL();
        }
        
        // اگر در URL نبود، از localStorage بگیر
        if (!referrerInputValue && typeof getReferrerFromStorage === 'function') {
          referrerInputValue = getReferrerFromStorage();
        }
        
        // اگر هنوز نبود، از deployer استفاده کن
        if (!referrerInputValue) {
          referrerInputValue = await contract.deployer();
        }
      }
    }
  } catch (e) {
    // در صورت خطا، از deployer استفاده کن
    referrerInputValue = await contract.deployer();
  }

  modal.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #181c2a, #232946);
      padding: 1rem 0.7rem;
      border-radius: 12px;
      box-shadow: 0 10px 24px rgba(0,0,0,0.35);
      width: 100%;
      max-width: 95vw;
      max-height: 95vh;
      overflow-y: auto;
      direction: rtl;
      position: relative;
      border: 1.5px solid #a786ff;
      font-size: 0.97rem;
    ">
      <!-- Header -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.7rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #a786ff;
      ">
        <h3 style="
          color: #00ff88;
          margin: 0;
          font-size: 1.05rem;
          font-weight: bold;
          text-align: center;
          flex: 1;
        ">📝 ثبت‌نام جدید</h3>
        <button id="register-form-close" style="
          background: none;
          border: none;
          color: #fff;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.2rem;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">×</button>
      </div>

      <!-- Referrer Input -->
      <div style="
        background: rgba(167, 134, 255, 0.08);
        border: 1px solid #a786ff;
        border-radius: 8px;
        padding: 0.6rem 0.7rem;
        margin-bottom: 0.7rem;
      ">
        <label for="register-referrer-address" style="color: #a786ff; font-weight: bold; margin-bottom: 0.3rem; font-size:0.95em; display:block;">👤 معرف (Referrer):</label>
        <input id="register-referrer-address"
          type="text"
          value="${referrerInputValue}"
          ${referrerInputReadonly ? 'readonly' : ''}
          style="
            width: 100%;
            padding: 0.5rem 0.7rem;
            border-radius: 5px;
            border: 1.2px solid #a786ff;
            background: rgba(0,0,0,0.18);
            color: #fff;
            font-family: monospace;
            font-size: 0.95rem;
            direction: ltr;
            text-align: left;
            box-sizing: border-box;
            margin-bottom: 0.1rem;
          "
        />
      </div>

      <!-- Referrer Index Input -->
      <div style="
        background: rgba(167, 134, 255, 0.05);
        border: 1px solid #a786ff;
        border-radius: 8px;
        padding: 0.6rem 0.7rem;
        margin-bottom: 0.7rem;
      ">
        <label for="register-referrer-index" style="color: #a786ff; font-weight: bold; margin-bottom: 0.3rem; font-size:0.95em; display:block;">🔢 ایندکس معرف (اختیاری):</label>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <input id="register-referrer-index"
            type="number"
            placeholder="0"
            min="0"
            style="
              flex: 1;
              padding: 0.5rem 0.7rem;
              border-radius: 5px;
              border: 1.2px solid #a786ff;
              background: rgba(0,0,0,0.18);
              color: #fff;
              font-family: monospace;
              font-size: 0.95rem;
              direction: ltr;
              text-align: left;
              box-sizing: border-box;
            "
          />
          <button type="button" id="register-get-referrer-address-btn" style="
            background: linear-gradient(135deg, #00ff88, #00cc66);
            color: #232946;
            font-weight: bold;
            border: none;
            border-radius: 5px;
            padding: 0.5rem 0.8rem;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
          ">🔍 دریافت آدرس</button>
        </div>
        <small style="color: #b8c1ec; font-size: 0.8rem; margin-top: 0.2rem; display: block;">ایندکس معرف را وارد کنید تا آدرس ولت به طور خودکار دریافت شود</small>
      </div>

      <!-- New Wallet Input -->
      <div style="margin-bottom: 0.7rem;">
        <label for="register-new-wallet" style="
          display: block;
          color: #fff;
          font-weight: bold;
          margin-bottom: 0.3rem;
          font-size:0.95em;
        ">🔑 آدرس ولت جدید:</label>
        <input id="register-new-wallet" 
          type="text" 
          placeholder="0x..." 
          value="${walletInputValue}"
          ${walletInputReadonly ? 'readonly' : ''}
          style="
            width: 100%;
            padding: 0.7rem 0.7rem;
            border-radius: 7px;
            border: 1.5px solid #a786ff;
            background: rgba(0,0,0,0.18);
            color: #fff;
            font-family: monospace;
            font-size: 0.97rem;
            direction: ltr;
            text-align: left;
            box-sizing: border-box;
            transition: border-color 0.3s;
            height: 2.2rem;
          "
          onfocus="this.style.borderColor='#00ff88'"
          onblur="this.style.borderColor='#a786ff'"
        />
      </div>

      <!-- Balance Info -->
      <div style="
        background: rgba(0, 255, 136, 0.07);
        border: 1px solid #00ff88;
        border-radius: 8px;
        padding: 0.6rem 0.7rem;
        margin-bottom: 0.7rem;
      ">
        <div style="color: #00ff88; font-weight: bold; margin-bottom: 0.5rem; font-size:0.95em;">💰 موجودی‌های شما:</div>
        <div style="display: grid; gap: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size:0.95em;">
            <span style="color: #fff;">🟣 POL:</span>
            <span id="register-matic-balance" style="color: #a786ff; font-weight: bold;">در حال دریافت...</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size:0.95em;">
            <span style="color: #fff;">🟢 CPA:</span>
            <span id="register-cpa-balance" style="color: #00ff88; font-weight: bold;">در حال دریافت...</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size:0.95em;">
            <span style="color: #fff;">💵 DAI:</span>
            <span id="register-dai-balance" style="color: #00ccff; font-weight: bold;">در حال دریافت...</span>
          </div>
        </div>
      </div>

      <!-- Required Amount -->
      <div style="
        background: rgba(255, 107, 107, 0.07);
        border: 1px solid #ff6b6b;
        border-radius: 8px;
        padding: 0.6rem 0.7rem;
        margin-bottom: 0.7rem;
      ">
        <div style="color: #ff6b6b; font-weight: bold; margin-bottom: 0.3rem; font-size:0.95em;">⚠️ مقدار مورد نیاز:</div>
        <div id="register-required-dai" style="
          color: #ff6b6b;
          font-size: 1rem;
          font-weight: bold;
          text-align: center;
        ">در حال دریافت...</div>
      </div>

      <!-- Action Buttons -->
      <div style="
        display: flex;
        gap: 0.5rem;
        flex-direction: column;
      ">
        <button id="register-form-confirm" style="
          background: linear-gradient(135deg, #00ff88, #00cc66);
          color: #232946;
          font-weight: bold;
          padding: 0.7rem 0;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0, 255, 136, 0.18);
        " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,255,136,0.22)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(0,255,136,0.18)'">
          ✅ ثبت‌نام
        </button>
        <button id="register-form-cancel" style="
          background: linear-gradient(135deg, #a786ff, #8b6bff);
          color: #fff;
          font-weight: bold;
          padding: 0.7rem 0;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(167, 134, 255, 0.18);
        " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(167,134,255,0.22)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(167,134,255,0.18)'">
          ❌ انصراف
        </button>
      </div>

      <!-- Status Message -->
      <div id="register-form-status" style="
        margin-top: 0.7rem;
        padding: 0.5rem;
        border-radius: 6px;
        text-align: center;
        font-weight: bold;
        min-height: 18px;
        font-size:0.97em;
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
      let dai = '-';
      let requiredDai = '-';

      if (provider && connectedAddress) {
        try {
          const bal = await provider.getBalance(connectedAddress);
          matic = window.ethers ? window.ethers.formatUnits(bal, 18) : bal.toString();
        } catch (e) {
          matic = 'خطا در دریافت POL';
        }
      }
      if (contract && connectedAddress) {
        try {
          const cpaBal = await contract.balanceOf(connectedAddress);
          cpa = window.ethers ? window.ethers.formatUnits(cpaBal, 18) : cpaBal.toString();
        } catch (e) {
          cpa = 'خطا در دریافت CPA';
        }
        // دریافت موجودی DAI
        try {
          const DAI_ABI = ["function balanceOf(address) view returns (uint256)"];
          const daiContract = new ethers.Contract(window.DAI_ADDRESS, DAI_ABI, provider || contract.provider);
          const daiBal = await daiContract.balanceOf(connectedAddress);
          dai = window.ethers ? window.ethers.formatUnits(daiBal, 18) : daiBal.toString(); // DAI has 18 decimals
        } catch (e) {
          dai = 'خطا در دریافت DAI';
        }
        // مقدار مورد نیاز ثبت‌نام از قرارداد
        try {
          if (window.getRegPrice) {
            const regPrice = await window.getRegPrice(contract);
            let priceValue = parseFloat(window.ethers.formatUnits(regPrice, 18));
            requiredDai = Math.round(priceValue) + ' CPA'; // گرد کردن بدون اعشار
          } else {
            requiredDai = '...';
          }
        } catch (e) {
          requiredDai = 'خطا';
        }
      }
      document.getElementById('register-matic-balance').textContent = matic;
      document.getElementById('register-cpa-balance').textContent = cpa;
      document.getElementById('register-dai-balance').textContent = dai;
      document.getElementById('register-required-dai').textContent = requiredDai;

      if (window.displayUserBalances) {
        await window.displayUserBalances();
      }
    } catch (e) {
      document.getElementById('register-matic-balance').textContent = '-';
      document.getElementById('register-cpa-balance').textContent = '-';
      document.getElementById('register-dai-balance').textContent = '-';
      document.getElementById('register-required-dai').textContent = '-';
    }
  })();
  
  // دکمه دریافت آدرس از ایندکس در فرم موقت
  const registerGetReferrerAddressBtn = document.getElementById('register-get-referrer-address-btn');
  const registerReferrerIndexInput = document.getElementById('register-referrer-index');
  
  if (registerGetReferrerAddressBtn && registerReferrerIndexInput) {
    registerGetReferrerAddressBtn.onclick = async function() {
      try {
        const index = parseInt(registerReferrerIndexInput.value);
        if (isNaN(index) || index < 0) {
          const statusDiv = document.getElementById('register-form-status');
          if (statusDiv) {
            statusDiv.textContent = 'لطفاً ایندکس معتبر وارد کنید';
          }
          return;
        }
        
        registerGetReferrerAddressBtn.textContent = 'در حال دریافت...';
        registerGetReferrerAddressBtn.disabled = true;
        
        // دریافت آدرس از ایندکس
        const address = await contract.indexToAddress(BigInt(index));
        
        // بررسی فعال بودن کاربر
        const userData = await contract.users(address);
        if (!userData.activated) {
          const statusDiv = document.getElementById('register-form-status');
          if (statusDiv) {
            statusDiv.textContent = `کاربر با ایندکس ${index} فعال نیست`;
          }
          return;
        }
        
        // به‌روزرسانی فیلد آدرس معرف
        const referrerAddressInput = document.getElementById('register-referrer-address');
        if (referrerAddressInput) {
          referrerAddressInput.value = address;
        }
        
        const statusDiv = document.getElementById('register-form-status');
        if (statusDiv) {
          statusDiv.textContent = `✅ آدرس معرف دریافت شد: ${address.substring(0, 6)}...${address.substring(38)}`;
        }
        
      } catch (error) {
        console.error('Error getting address from index:', error);
        let errorMessage = 'خطا در دریافت آدرس';
        
        if (error.message.includes('reverted')) {
          errorMessage = 'ایندکس معتبر نیست یا کاربر وجود ندارد';
        } else if (error.message.includes('network')) {
          errorMessage = 'خطا در اتصال شبکه';
        }
        
        const statusDiv = document.getElementById('register-form-status');
        if (statusDiv) {
          statusDiv.textContent = errorMessage;
        }
      } finally {
        registerGetReferrerAddressBtn.textContent = '🔍 دریافت آدرس';
        registerGetReferrerAddressBtn.disabled = false;
      }
    };
  }
  
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
        return addr.slice(0, 3) + '...' + addr.slice(-2);
    }
    // اطلاعات struct را در دو ستون آماده کن
    const leftColumn = [
        `Address:   ${shortAddress(address)}`,
        `Index:     ${user.index}`,
        `ایندکس:    ${window.generateCPAId ? window.generateCPAId(user.index) : user.index}`,
        `Activated: ${user.activated ? 'Yes' : 'No'}`
    ];
    
    const rightColumn = [
        `BinaryPoints: ${user.binaryPoints}`,
        `Cap:      ${user.binaryPointCap}`,
        `Left:     ${user.leftPoints}`,
        `Right:    ${user.rightPoints}`,
        `Refclimed:${user.refclimed ? Math.floor(Number(user.refclimed) / 1e18) : '0'}`
    ];
    let html = `
      <div style="direction:ltr;font-family:monospace;background:#181c2a;color:#00ff88;padding:0.2rem;min-width:400px;max-width:95vw;position:relative;">
        <div id="user-popup-two-columns" style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.2rem;
          background:#181c2a;
          padding:0.2rem;
          color:#00ff88;
          font-size:1.05rem;
          line-height:2;
          font-family:monospace;
          min-width:350px;
          margin-bottom:0.5rem;
        ">
          <div id="user-popup-left-column" style="
            background:#181c2a;
            padding:0.2rem;
          "></div>
          <div id="user-popup-right-column" style="
            background:#181c2a;
            padding:0.2rem;
          "></div>
        </div>
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

  
    const leftColumnEl = document.getElementById('user-popup-left-column');
    const rightColumnEl = document.getElementById('user-popup-right-column');
    
    if (leftColumnEl && rightColumnEl) {
        leftColumnEl.textContent = leftColumn.join('\n');
        rightColumnEl.textContent = rightColumn.join('\n');
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // ابتدا قفل‌ها را اعمال کن
    await lockTabsForDeactivatedUsers();
    
    // سپس بررسی کن که آیا کاربر فعال نیست
    try {
        if (window.getUserProfile) {
            const profile = await loadUserProfileOnce();
            if (!profile.activated) {
                // اگر کاربر فعال نیست، فرم ثبت‌نام را نمایش بده
                setTimeout(() => {
                    showRegistrationFormForInactiveUser();
                }, 1000); // کمی صبر کن تا صفحه کاملاً لود شود
            }
        }
    } catch (error) {
        console.log('Could not check user status on load:', error);
    }
});

// تابع جدید برای نمایش فرم ثبت‌نام برای کاربران غیرفعال
window.showRegistrationFormForInactiveUser = async function() {
    try {
        // بررسی اینکه آیا قبلاً فرم نمایش داده شده
        const existingForm = document.getElementById('register-form-modal');
        if (existingForm) return;
        
        // بررسی اتصال کیف پول
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.log('Wallet not connected, cannot show registration form');
            return;
        }
        
        const { contract, address } = window.contractConfig;
        
        // دریافت آدرس معرف
        let referrerAddress = '';
        try {
            // ابتدا بررسی کنیم که آیا کاربر متصل فعال است و ایندکس دارد
            const connectedUserData = await contract.users(address);
            if (connectedUserData.activated) {
                // اگر کاربر فعال است، از آدرس خودش به عنوان معرف استفاده کن
                referrerAddress = address;
            } else {
                // اگر کاربر فعال نیست، از روش‌های قبلی استفاده کن
                // ابتدا از URL بگیر
                if (typeof getReferrerFromURL === 'function') {
                    referrerAddress = getReferrerFromURL();
                }
                
                // اگر در URL نبود، از localStorage بگیر
                if (!referrerAddress && typeof getReferrerFromStorage === 'function') {
                    referrerAddress = getReferrerFromStorage();
                }
                
                // اگر هنوز نبود، از deployer استفاده کن
                if (!referrerAddress) {
                    referrerAddress = await contract.deployer();
                }
            }
        } catch (e) {
            // در صورت خطا، از deployer استفاده کن
            referrerAddress = await contract.deployer();
        }
        
        // نمایش فرم ثبت‌نام
        if (typeof window.showRegisterForm === 'function') {
            window.showRegisterForm(referrerAddress, address, address, window.contractConfig.provider, contract);
        } else {
            // اگر تابع showRegisterForm موجود نبود، از تابع اصلی استفاده کن
            if (typeof window.loadRegisterData === 'function') {
                // نمایش تب ثبت‌نام
                if (typeof window.showTab === 'function') {
                    window.showTab('register');
                }
                
                // لود کردن داده‌های ثبت‌نام
                await window.loadRegisterData(contract, address, window.tokenPriceUSDFormatted);
            }
        }
        
        console.log('✅ Registration form shown for inactive user');
        
    } catch (error) {
        console.error('Error showing registration form for inactive user:', error);
    }
};

// تابع مدیریت فرم ثبت‌نام دائمی
window.initializePermanentRegistrationForm = function() {
    const form = document.getElementById('permanent-registration-form');
    const connectBtn = document.getElementById('connect-wallet-btn');
    const registerBtn = document.getElementById('permanent-register-btn');
    const userAddressInput = document.getElementById('permanent-user-address');
    const referrerAddressInput = document.getElementById('permanent-referrer-address');
    const statusDiv = document.getElementById('permanent-registration-status');
    const walletStatusDiv = document.getElementById('wallet-connection-status');
    const balancesDiv = document.getElementById('permanent-balances-display');
    
    if (!form) return;
    
    // دکمه اتصال کیف پول
    if (connectBtn) {
        connectBtn.onclick = async function() {
            try {
                connectBtn.textContent = 'در حال اتصال...';
                connectBtn.disabled = true;
                
                const connection = await connectWallet();
                await updatePermanentRegistrationForm(connection);
                
            } catch (error) {
                console.error('Error connecting wallet:', error);
                statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">خطا در اتصال کیف پول: ${error.message}</div>`;
            } finally {
                connectBtn.textContent = '🔗 اتصال کیف پول';
                connectBtn.disabled = false;
            }
        };
    }
    
    // دکمه دریافت آدرس از ایندکس
    const getReferrerAddressBtn = document.getElementById('get-referrer-address-btn');
    const referrerIndexInput = document.getElementById('permanent-referrer-index');
    
    if (getReferrerAddressBtn && referrerIndexInput) {
        getReferrerAddressBtn.onclick = async function() {
            try {
                if (!window.contractConfig || !window.contractConfig.contract) {
                    statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">لطفاً ابتدا کیف پول را متصل کنید</div>`;
                    return;
                }
                
                const index = parseInt(referrerIndexInput.value);
                if (isNaN(index) || index < 0) {
                    statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">لطفاً ایندکس معتبر وارد کنید</div>`;
                    return;
                }
                
                getReferrerAddressBtn.textContent = 'در حال دریافت...';
                getReferrerAddressBtn.disabled = true;
                
                const { contract } = window.contractConfig;
                
                // دریافت آدرس از ایندکس
                const address = await contract.indexToAddress(BigInt(index));
                
                // بررسی فعال بودن کاربر
                const userData = await contract.users(address);
                if (!userData.activated) {
                    statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">کاربر با ایندکس ${index} فعال نیست</div>`;
                    return;
                }
                
                // به‌روزرسانی فیلد آدرس معرف
                if (referrerAddressInput) {
                    referrerAddressInput.value = address;
                }
                
                statusDiv.innerHTML = `<div style="color:#00ff88;background:rgba(0,255,136,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">✅ آدرس معرف دریافت شد: ${address.substring(0, 6)}...${address.substring(38)}</div>`;
                
            } catch (error) {
                console.error('Error getting address from index:', error);
                let errorMessage = 'خطا در دریافت آدرس';
                
                if (error.message.includes('reverted')) {
                    errorMessage = 'ایندکس معتبر نیست یا کاربر وجود ندارد';
                } else if (error.message.includes('network')) {
                    errorMessage = 'خطا در اتصال شبکه';
                }
                
                statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">${errorMessage}</div>`;
            } finally {
                getReferrerAddressBtn.textContent = '🔍 دریافت آدرس';
                getReferrerAddressBtn.disabled = false;
            }
        };
    }
    
    // فرم ثبت‌نام
    form.onsubmit = async function(e) {
        e.preventDefault();

        registerBtn.disabled = true;
        registerBtn.textContent = 'در حال ثبت‌نام...';

        if (!window.contractConfig || !window.contractConfig.contract) {
            statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">لطفاً ابتدا کیف پول را متصل کنید</div>`;
            registerBtn.disabled = false;
            registerBtn.textContent = '🚀 ثبت‌نام';
            return;
        }

        const userAddress = userAddressInput.value.trim();
        const referrerAddress = referrerAddressInput.value.trim();

        if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
            statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">آدرس کیف پول کاربر معتبر نیست</div>`;
            registerBtn.disabled = false;
            registerBtn.textContent = '🚀 ثبت‌نام';
            return;
        }

        if (!referrerAddress || !/^0x[a-fA-F0-9]{40}$/.test(referrerAddress)) {
            statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">آدرس معرف معتبر نیست</div>`;
            registerBtn.disabled = false;
            registerBtn.textContent = '🚀 ثبت‌نام';
            return;
        }

        try {
            registerBtn.textContent = 'در حال ثبت‌نام...';
            registerBtn.disabled = true;
            statusDiv.innerHTML = '';
            
            const { contract } = window.contractConfig;
            
            // بررسی معتبر بودن معرف
            const refData = await contract.users(referrerAddress);
            if (!refData.activated) {
                throw new Error('معرف فعال نیست');
            }
            
            // بررسی ثبت‌نام نبودن کاربر جدید
            const userData = await contract.users(userAddress);
            if (userData.activated) {
                throw new Error('این آدرس قبلاً ثبت‌نام کرده است');
            }
            
            // ثبت‌نام
            const tx = await contract.registerAndActivate(referrerAddress, userAddress);
            statusDiv.innerHTML = `<div style="color:#00ff88;background:rgba(0,255,136,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">⏳ در انتظار تایید تراکنش...</div>`;
            
            await tx.wait();
            
            statusDiv.innerHTML = `<div style="color:#00ff88;background:rgba(0,255,136,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">✅ ثبت‌نام با موفقیت انجام شد!</div>`;
            
            // پاک کردن فرم
            userAddressInput.value = '';
            referrerAddressInput.value = '';
            
            // به‌روزرسانی فرم
            setTimeout(() => {
                updatePermanentRegistrationForm(window.contractConfig);
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'خطا در ثبت‌نام';
            
            if (error.code === 4001) {
                errorMessage = 'لغو توسط کاربر';
            } else if (error.message.includes('activated')) {
                errorMessage = error.message;
            } else if (error.message.includes('registered')) {
                errorMessage = error.message;
            } else if (error.message.includes('insufficient')) {
                errorMessage = 'موجودی کافی نیست';
            }
            
            statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">${errorMessage}</div>`;
        } finally {
            registerBtn.textContent = '🚀 ثبت‌نام';
            registerBtn.disabled = false;
        }
    };
    
    // مقداردهی اولیه
    if (window.contractConfig && window.contractConfig.contract) {
        updatePermanentRegistrationForm(window.contractConfig);
    }
};

// تابع به‌روزرسانی فرم ثبت‌نام دائمی
async function updatePermanentRegistrationForm(connection) {
    const walletStatusDiv = document.getElementById('wallet-connection-status');
    const registerBtn = document.getElementById('permanent-register-btn');
    const userAddressInput = document.getElementById('permanent-user-address');
    const referrerAddressInput = document.getElementById('permanent-referrer-address');
    const balancesDiv = document.getElementById('permanent-balances-display');
    const cpaBalanceDiv = document.getElementById('permanent-cpa-balance');
    const maticBalanceDiv = document.getElementById('permanent-matic-balance');
    
    if (!connection || !connection.contract) {
        // کیف پول متصل نیست
        if (walletStatusDiv) {
            walletStatusDiv.innerHTML = `
                <div style="color:#ff4444;font-weight:bold;margin-bottom:0.5rem;">⚠️ کیف پول متصل نیست</div>
                <p style="color:#b8c1ec;margin:0;font-size:0.9rem;">لطفاً ابتدا کیف پول خود را متصل کنید</p>
                <button type="button" id="connect-wallet-btn" style="background:linear-gradient(90deg,#00ff88,#a786ff);color:#181c2a;font-weight:bold;border:none;border-radius:8px;padding:0.7rem 2rem;font-size:1rem;cursor:pointer;margin-top:0.5rem;transition:all 0.3s;">
                    🔗 اتصال کیف پول
                </button>
            `;
        }
        
        if (registerBtn) {
            registerBtn.textContent = '🔒 ابتدا کیف پول را متصل کنید';
            registerBtn.disabled = true;
        }
        
        if (balancesDiv) {
            balancesDiv.style.display = 'none';
        }
        
        return;
    }
    
    try {
        const { contract, address } = connection;
        
        // به‌روزرسانی وضعیت کیف پول
        if (walletStatusDiv) {
            walletStatusDiv.innerHTML = `
                <div style="color:#00ff88;font-weight:bold;margin-bottom:0.5rem;">✅ کیف پول متصل است</div>
                <p style="color:#b8c1ec;margin:0;font-size:0.9rem;">آدرس: ${address.substring(0, 6)}...${address.substring(38)}</p>
            `;
        }
        
        // به‌روزرسانی دکمه ثبت‌نام
        if (registerBtn) {
            registerBtn.textContent = '🚀 ثبت‌نام';
            registerBtn.disabled = false;
        }
        
        // مقداردهی آدرس‌ها
        if (userAddressInput) {
            userAddressInput.value = address;
        }
        
        if (referrerAddressInput) {
            // دریافت آدرس معرف
            let referrerAddress = '';
            try {
                // ابتدا بررسی کنیم که آیا کاربر متصل فعال است و ایندکس دارد
                const connectedUserData = await contract.users(address);
                if (connectedUserData.activated) {
                    // اگر کاربر فعال است، از آدرس خودش به عنوان معرف استفاده کن
                    referrerAddress = address;
                } else {
                    // اگر کاربر فعال نیست، از روش‌های قبلی استفاده کن
                    if (typeof getReferrerFromURL === 'function') {
                        referrerAddress = getReferrerFromURL();
                    }
                    
                    if (!referrerAddress && typeof getReferrerFromStorage === 'function') {
                        referrerAddress = getReferrerFromStorage();
                    }
                    
                    if (!referrerAddress) {
                        referrerAddress = await contract.deployer();
                    }
                }
            } catch (e) {
                // در صورت خطا، از deployer استفاده کن
                referrerAddress = await contract.deployer();
            }
            
            referrerAddressInput.value = referrerAddress;
        }
        
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
        
        // به‌روزرسانی موجودی‌ها
        if (balancesDiv && cpaBalanceDiv && maticBalanceDiv) {
            try {
                const [cpaBalance, maticBalance] = await Promise.all([
                    contract.balanceOf(address),
                    connection.provider.getBalance(address)
                ]);
                
                const cpaFormatted = parseFloat(ethers.formatUnits(cpaBalance, 18));
                const maticFormatted = parseFloat(ethers.formatEther(maticBalance));
                
                cpaBalanceDiv.textContent = formatLargeNumber(cpaFormatted);
                cpaBalanceDiv.title = cpaFormatted.toLocaleString('en-US', {maximumFractionDigits: 4}) + ' CPA';
                maticBalanceDiv.textContent = formatLargeNumber(maticFormatted);
                maticBalanceDiv.title = maticFormatted.toLocaleString('en-US', {maximumFractionDigits: 4}) + ' MATIC';
                
                balancesDiv.style.display = 'block';
                
            } catch (error) {
                console.error('Error fetching balances:', error);
                balancesDiv.style.display = 'none';
            }
        }
        
        // به‌روزرسانی هزینه ثبت‌نام
        try {
            const price = await window.getRegPrice(contract);
            const formattedPrice = parseFloat(ethers.formatUnits(price, 18)).toFixed(0);
            const costDisplay = document.getElementById('permanent-registration-cost');
            if (costDisplay) {
                costDisplay.textContent = `${formattedPrice} CPA`;
            }
        } catch (e) {
            console.log('Could not update registration cost:', e);
        }
        
    } catch (error) {
        console.error('Error updating permanent registration form:', error);
    }
}

// مقداردهی فرم ثبت‌نام دائمی در زمان لود صفحه
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.initializePermanentRegistrationForm === 'function') {
        window.initializePermanentRegistrationForm();
    }
});

// تابع لود کردن تب ترنسفر
window.loadTransferTab = async function() {
    try {
        console.log('Loading transfer tab...');
        
        // بررسی اتصال کیف پول
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.log('Wallet not connected, loading transfer tab with connection message');
            
            // نمایش پیام اتصال کیف پول
            const transferContainer = document.querySelector('.transfer-container');
            if (transferContainer) {
                const existingMessage = transferContainer.querySelector('.wallet-connection-message');
                if (!existingMessage) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'wallet-connection-message';
                    messageDiv.style.cssText = `
                        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                        color: #fff;
                        padding: 1.5rem;
                        border-radius: 12px;
                        margin-bottom: 1.5rem;
                        text-align: center;
                        font-weight: bold;
                        border: 2px solid #ff4757;
                        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
                    `;
                    messageDiv.innerHTML = `
                        <div style="font-size: 2rem; margin-bottom: 1rem;">🔒</div>
                        <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">در ترنسفر موجودی شما به ولت متصل نیست</div>
                        <div style="font-size: 1rem; margin-bottom: 1rem; opacity: 0.9;">
                            لطفاً ابتدا کیف پول خود را متصل کنید
                        </div>
                        <div style="display: flex; gap: 0.5rem; justify-content: center;">
                            <button onclick="connectWallet()" style="
                                background: linear-gradient(135deg, #00ff88, #00cc66);
                                color: #232946;
                                border: none;
                                padding: 0.8rem 1.5rem;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: bold;
                                font-size: 1rem;
                            ">اتصال کیف پول</button>
                            <button onclick="refreshWalletConnection()" style="
                                background: linear-gradient(135deg, #ff9500, #ff8000);
                                color: #fff;
                                border: none;
                                padding: 0.8rem 1rem;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: bold;
                                font-size: 0.9rem;
                            ">🔄 تلاش مجدد</button>
                        </div>
                    `;
                    transferContainer.insertBefore(messageDiv, transferContainer.firstChild);
                }
            }
            
            // به‌روزرسانی موجودی‌ها با پیام خطا
            await updateTransferBalances(null, null, null);
            return;
        }
        
        const { contract, address, provider } = window.contractConfig;
        console.log('Contract and address available, updating balances...');
        
        // حذف پیام اتصال کیف پول اگر وجود دارد
        const existingMessage = document.querySelector('.wallet-connection-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // به‌روزرسانی موجودی‌ها
        await updateTransferBalances(contract, address, provider);
        
        // شروع به‌روزرسانی خودکار
        window.startTransferBalanceAutoRefresh();
        
        // تنظیم event listener برای جستجوی ایندکس
        const searchIndexBtn = document.getElementById('searchIndexBtn');
        const searchIndexInput = document.getElementById('searchIndex');
        const searchIndexStatus = document.getElementById('searchIndexStatus');
        
        if (searchIndexBtn && searchIndexInput) {
            searchIndexBtn.onclick = async function() {
                try {
                    const index = parseInt(searchIndexInput.value);
                    if (isNaN(index) || index < 0) {
                        searchIndexStatus.textContent = 'لطفاً ایندکس معتبر وارد کنید';
                        searchIndexStatus.className = 'transfer-status error';
                        return;
                    }
                    
                    searchIndexBtn.textContent = 'در حال جستجو...';
                    searchIndexBtn.disabled = true;
                    
                    // دریافت آدرس از ایندکس
                    const userAddress = await contract.indexToAddress(BigInt(index));
                    
                    // بررسی فعال بودن کاربر
                    const userData = await contract.users(userAddress);
                    if (!userData.activated) {
                        searchIndexStatus.textContent = `کاربر با ایندکس ${index} فعال نیست`;
                        searchIndexStatus.className = 'transfer-status error';
                        return;
                    }
                    
                    // به‌روزرسانی فیلد آدرس مقصد
                    const transferToInput = document.getElementById('transferTo');
                    if (transferToInput) {
                        transferToInput.value = userAddress;
                    }
                    
                    searchIndexStatus.textContent = `✅ آدرس پیدا شد: ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
                    searchIndexStatus.className = 'transfer-status success';
                    
                } catch (error) {
                    console.error('Error searching by index:', error);
                    let errorMessage = 'خطا در جستجو';
                    
                    if (error.message.includes('reverted')) {
                        errorMessage = 'ایندکس معتبر نیست یا کاربر وجود ندارد';
                    } else if (error.message.includes('network')) {
                        errorMessage = 'خطا در اتصال شبکه';
                    }
                    
                    searchIndexStatus.textContent = errorMessage;
                    searchIndexStatus.className = 'transfer-status error';
                } finally {
                    searchIndexBtn.textContent = 'جستجو';
                    searchIndexBtn.disabled = false;
                }
            };
        }
        
        console.log('Transfer tab loaded successfully');
        
    } catch (error) {
        console.error('Error loading transfer tab:', error);
    }
};

// تابع به‌روزرسانی موجودی‌ها در قسمت ترنسفر
async function updateTransferBalances(contract, address, provider) {
    try {
        const daiBalanceDiv = document.getElementById('transfer-dai-balance');
        const polyBalanceDiv = document.getElementById('transfer-poly-balance');
        const cpaBalanceDiv = document.getElementById('transfer-cpa-balance');
        
        if (!daiBalanceDiv || !polyBalanceDiv || !cpaBalanceDiv) {
            console.log('Transfer balance elements not found');
            return;
        }
        
        // بررسی اتصال کیف پول
        if (!contract || !address || !provider) {
            console.log('Wallet not connected, showing connection message');
            
            // نمایش پیام اتصال کیف پول
            const balanceContainer = document.querySelector('.transfer-container .balance-check');
            if (balanceContainer) {
                const existingMessage = balanceContainer.querySelector('.wallet-connection-message');
                if (!existingMessage) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'wallet-connection-message';
                    messageDiv.style.cssText = `
                        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                        color: #fff;
                        padding: 1rem;
                        border-radius: 8px;
                        margin-bottom: 1rem;
                        text-align: center;
                        font-weight: bold;
                        border: 2px solid #ff4757;
                    `;
                    messageDiv.innerHTML = `
                        <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">🔒</div>
                        <div>در ترنسفر موجودی شما به ولت متصل نیست</div>
                        <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">
                            لطفاً ابتدا کیف پول خود را متصل کنید
                        </div>
                    `;
                    balanceContainer.insertBefore(messageDiv, balanceContainer.firstChild);
                }
            }
            
            // تنظیم مقادیر به حالت خطا
            polyBalanceDiv.textContent = 'متصل نیست';
            cpaBalanceDiv.textContent = 'متصل نیست';
            daiBalanceDiv.textContent = 'متصل نیست';
            return;
        }
        
        // حذف پیام اتصال کیف پول اگر وجود دارد
        const existingMessage = document.querySelector('.wallet-connection-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        console.log('Updating transfer balances for address:', address);
        
        // دریافت موجودی POL (MATIC)
        let polyBalance = '-';
        try {
            const polyBal = await provider.getBalance(address);
            polyBalance = parseFloat(ethers.formatEther(polyBal)).toFixed(4);
            console.log('POL balance:', polyBalance);
        } catch (e) {
            console.error('Error getting POL balance:', e);
            polyBalance = 'خطا';
        }
        
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
        
        // دریافت موجودی CPA
        let cpaBalance = '-';
        let cpaUsdValue = 0;
        let cpaFullAmount = 0;
        try {
            const cpaBal = await contract.balanceOf(address);
            cpaFullAmount = parseFloat(ethers.formatUnits(cpaBal, 18));
            cpaBalance = formatLargeNumber(cpaFullAmount);
            console.log('CPA balance:', cpaBalance);
            
            // محاسبه معادل دلاری CPA
            try {
                if (typeof contract.getTokenPrice === 'function') {
                    const tokenPriceRaw = await contract.getTokenPrice();
                    const tokenPrice = Number(ethers.formatUnits(tokenPriceRaw, 18));
                    cpaUsdValue = cpaFullAmount * tokenPrice;
                    console.log('CPA USD value:', cpaUsdValue);
                }
            } catch (e) {
                console.log('خطا در دریافت قیمت توکن:', e);
            }
        } catch (e) {
            console.error('Error getting CPA balance:', e);
            cpaBalance = 'خطا';
        }
        
        // دریافت موجودی DAI
        let daiBalance = '-';
        try {
            const DAI_ADDRESS = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'; // آدرس صحیح DAI در قرارداد
            const DAI_ABI = ["function balanceOf(address) view returns (uint256)"];
            const daiContract = new ethers.Contract(DAI_ADDRESS, DAI_ABI, provider);
            const daiBal = await daiContract.balanceOf(address);
            daiBalance = parseFloat(ethers.formatUnits(daiBal, 18)).toFixed(2); // DAI has 18 decimals
            console.log('DAI balance:', daiBalance);
                } catch (e) {
          console.error('Error getting DAI balance:', e);
          daiBalance = 'خطا';
        }
        
        // به‌روزرسانی نمایش
        polyBalanceDiv.textContent = polyBalance;
        cpaBalanceDiv.textContent = cpaBalance;
        if (cpaFullAmount > 0) {
            cpaBalanceDiv.title = cpaFullAmount.toLocaleString('en-US', {maximumFractionDigits: 4}) + ' CPA';
        }
        daiBalanceDiv.textContent = daiBalance;
        
        // نمایش معادل دلاری CPA
        const cpaUsdDiv = document.getElementById('transfer-cpa-usd');
        if (cpaUsdDiv && cpaBalance !== '-' && cpaBalance !== 'خطا') {
            cpaUsdDiv.textContent = `≈ $${formatLargeNumber(cpaUsdValue)}`;
        } else if (cpaUsdDiv) {
            cpaUsdDiv.textContent = '-';
        }
        
        console.log('Transfer balances updated successfully');
        
    } catch (error) {
        console.error('Error updating transfer balances:', error);
        
        // نمایش پیام خطا
        const balanceContainer = document.querySelector('.transfer-container .balance-check');
        if (balanceContainer) {
            const existingMessage = balanceContainer.querySelector('.wallet-connection-message');
            if (!existingMessage) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'wallet-connection-message';
                messageDiv.style.cssText = `
                    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                    color: #fff;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    text-align: center;
                    font-weight: bold;
                    border: 2px solid #ff4757;
                `;
                messageDiv.innerHTML = `
                    <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">⚠️</div>
                    <div>خطا در بارگذاری موجودی‌ها</div>
                    <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">
                        لطفاً دوباره تلاش کنید
                    </div>
                `;
                balanceContainer.insertBefore(messageDiv, balanceContainer.firstChild);
            }
        }
    }
}

// تابع به‌روزرسانی موجودی‌های ترنسفر در زمان اتصال کیف پول
window.updateTransferBalancesOnConnect = async function() {
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.log('Wallet not connected, cannot update transfer balances');
            return;
        }
        
        const { contract, address, provider } = window.contractConfig;
        
        // حذف پیام اتصال کیف پول اگر وجود دارد
        const existingMessage = document.querySelector('.wallet-connection-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        await updateTransferBalances(contract, address, provider);
        
        // شروع به‌روزرسانی خودکار اگر هنوز شروع نشده
        if (!window.transferBalanceInterval) {
            window.startTransferBalanceAutoRefresh();
        }
        
    } catch (error) {
        console.error('Error updating transfer balances on connect:', error);
    }
};

// فراخوانی تابع به‌روزرسانی موجودی‌های ترنسفر در زمان اتصال کیف پول
document.addEventListener('DOMContentLoaded', function() {
    // بررسی اتصال کیف پول و به‌روزرسانی موجودی‌های ترنسفر
    if (window.contractConfig && window.contractConfig.contract) {
        setTimeout(() => {
            window.updateTransferBalancesOnConnect();
        }, 1000);
    }
    
    // دکمه بروزرسانی دستی حذف شد - اکنون بروزرسانی خودکار است
    
    // اضافه کردن event listener برای دکمه اتصال کیف پول در تب ترنسفر
    document.addEventListener('click', function(e) {
        if (e.target && e.target.onclick && e.target.onclick.toString().includes('connectWallet()')) {
            // اگر دکمه اتصال کیف پول کلیک شد، بعد از اتصال موجودی‌ها را به‌روزرسانی کن
            setTimeout(() => {
                if (window.updateTransferBalancesOnConnect) {
                    window.updateTransferBalancesOnConnect();
                }
            }, 2000);
        }
    });
    
    // حذف دکمه شناور ایندکس در زمان بارگذاری صفحه
    setTimeout(() => {
        if (window.removeFloatingCPAId) {
            window.removeFloatingCPAId();
        }
    }, 1000);
});

// تابع به‌روزرسانی خودکار موجودی‌های ترنسفر
window.startTransferBalanceAutoRefresh = function() {
    if (window.transferBalanceInterval) {
        clearInterval(window.transferBalanceInterval);
    }
    
    /* // Transfer balance interval غیرفعال شده
    window.transferBalanceInterval = setInterval(async () => {
        try {
            if (window.contractConfig && window.contractConfig.contract) {
                const { contract, address, provider } = window.contractConfig;
                await updateTransferBalances(contract, address, provider);
            }
        } catch (error) {
            console.error('Error in auto-refresh transfer balances:', error);
        }
    }, 30000); // غیرفعال شده برای بهینه‌سازی - سیستم مرکزی جایگزین شده
    */
    console.log('⚠️ Transfer balance interval غیرفعال شده برای بهینه‌سازی عملکرد');
};

// تابع توقف به‌روزرسانی خودکار
window.stopTransferBalanceAutoRefresh = function() {
    if (window.transferBalanceInterval) {
        clearInterval(window.transferBalanceInterval);
        window.transferBalanceInterval = null;
    }
};

// تابع تولید ID بر اساس ایندکس کاربر
function generateCPAId(index) {
    if (!index || index === 0) return '0';
    
    // نمایش دقیق همان مقدار کنترکت بدون هیچ تغییری
    return index.toString();
}

// تعریف تابع generateCPAId در window برای استفاده در فایل‌های دیگر
window.generateCPAId = generateCPAId;

// تابع نمایش ID در گوشه بالا سمت راست - غیرفعال شده
function displayCPAIdInCorner(index) {
    // حذف ID قبلی اگر وجود دارد
    const existingId = document.getElementById('cpa-id-corner');
    if (existingId) existingId.remove();
    
    // غیرفعال شده - دیگر نمایش داده نمی‌شود
    return;
    
    /*
    if (!index || index === 0) return;
    
    const cpaId = generateCPAId(index);
    
    // ایجاد عنصر ID
    const idElement = document.createElement('div');
    idElement.id = 'cpa-id-corner';
    idElement.textContent = cpaId;
    idElement.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: linear-gradient(135deg, #00ff88, #a786ff);
        color: #181c2a;
        padding: 8px 12px;
        border-radius: 8px;
        font-family: monospace;
        font-weight: bold;
        font-size: 0.9rem;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0,255,136,0.3);
        border: 1px solid rgba(167,134,255,0.3);
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    // اضافه کردن hover effect
    idElement.onmouseover = function() {
        this.style.transform = 'scale(1.05)';
        this.style.boxShadow = '0 4px 12px rgba(0,255,136,0.4)';
    };
    
    idElement.onmouseout = function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 2px 8px rgba(0,255,136,0.3)';
    };
    
    // کلیک برای کپی کردن
    idElement.onclick = function() {
        navigator.clipboard.writeText(cpaId);
        const originalText = this.textContent;
        this.textContent = 'کپی شد!';
        this.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        setTimeout(() => {
            this.textContent = originalText;
            this.style.background = 'linear-gradient(135deg, #00ff88, #a786ff)';
        }, 1000);
    };
    
    document.body.appendChild(idElement);
    */
}

// تابع به‌روزرسانی نمایش ID در تمام بخش‌ها
function updateCPAIdDisplay(index) {
    const cpaId = generateCPAId(index);
    
    // به‌روزرسانی در پروفایل
    const profileIndexEl = document.getElementById('profile-index');
    if (profileIndexEl) {
        profileIndexEl.textContent = cpaId;
    }
    
    // به‌روزرسانی در داشبورد
    const dashboardIndexEl = document.getElementById('dashboard-user-index');
    if (dashboardIndexEl) {
        dashboardIndexEl.textContent = cpaId;
    }
    
    // نمایش بخش اطلاعات کاربر در داشبورد
    const dashboardUserInfo = document.getElementById('dashboard-user-info');
    if (dashboardUserInfo) {
        dashboardUserInfo.style.display = 'block';
        
        // به‌روزرسانی آدرس کیف پول
        const dashboardUserAddress = document.getElementById('dashboard-user-address');
        if (dashboardUserAddress && window.contractConfig && window.contractConfig.address) {
            dashboardUserAddress.textContent = shortenAddress(window.contractConfig.address);
        }
        
        // به‌روزرسانی وضعیت
        const dashboardUserStatus = document.getElementById('dashboard-user-status');
        if (dashboardUserStatus) {
            dashboardUserStatus.textContent = 'فعال';
            dashboardUserStatus.style.color = '#00ff88';
        }
    }
    
    // به‌روزرسانی در شبکه
    const networkIndexEl = document.getElementById('network-user-index');
    if (networkIndexEl) {
        networkIndexEl.textContent = cpaId;
    }
    
    // نمایش در گوشه - غیرفعال شده
    // displayCPAIdInCorner(index);
}

// تابع حذف دکمه شناور ایندکس
window.removeFloatingCPAId = function() {
    const existingId = document.getElementById('cpa-id-corner');
    if (existingId) {
        existingId.remove();
        console.log('✅ Floating index removed');
    }
};

// تابع پاک کردن کش و تلاش مجدد اتصال کیف پول
window.refreshWalletConnection = async function() {
    try {
        console.log('🔄 Refreshing wallet connection...');
        
        // پاک کردن کش‌ها
        if (window.clearConnectionCache) {
            window.clearConnectionCache();
        }
        
        // پاک کردن متغیرهای سراسری
        if (typeof connectionCache !== 'undefined') {
            connectionCache = null;
        }
        if (typeof globalConnectionPromise !== 'undefined') {
            globalConnectionPromise = null;
        }
        if (typeof pendingAccountRequest !== 'undefined') {
            pendingAccountRequest = null;
        }
        
        // پاک کردن contractConfig
        if (window.contractConfig) {
            window.contractConfig.provider = null;
            window.contractConfig.signer = null;
            window.contractConfig.contract = null;
            window.contractConfig.address = null;
        }
        
        // تلاش مجدد اتصال
        const connection = await window.connectWallet();
        
        if (connection && connection.contract && connection.address) {
            console.log('✅ Wallet connection refreshed successfully');
            
            // رفرش شبکه بعد از اتصال مجدد
            setTimeout(async () => {
                try {
                    await window.refreshNetworkAfterConnection(connection);
                } catch (error) {
                    console.warn('Error refreshing network data after wallet refresh:', error);
                }
            }, 1000); // 1 ثانیه صبر کن
            
            return connection;
        } else {
            throw new Error('اتصال کیف پول ناموفق بود');
        }
        
    } catch (error) {
        console.error('❌ Error refreshing wallet connection:', error);
        throw error;
    }
};









// تابع دریافت کل پوینت‌های باینری از قرارداد
window.getTotalBinaryPoints = async function() {
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.error('❌ قرارداد متصل نیست');
            return 0;
        }
        
        const contract = window.contractConfig.contract;
        const result = await contract.totalClaimablePoints();
        // استفاده از ethers.formatUnits برای تبدیل صحیح BigInt به عدد
        const totalPoints = parseInt(ethers.formatUnits(result, 0));
        
        console.log(`📊 کل پوینت‌های باینری: ${totalPoints.toLocaleString('en-US')}`);
        return totalPoints;
        
    } catch (error) {
        console.error('❌ خطا در دریافت پوینت‌های باینری:', error);
        return 0;
    }
};

// دستور پاک کردن کامل دیتابیس و Firebase - این دستور بعد از اجرا خودش را پاک می‌کند
window.clearAllDatabaseData = async function() {
    console.log('🗑️ شروع پاک کردن کامل دیتابیس و Firebase...');
    
    try {
        // پاک کردن Firebase
        console.log('🔥 پاک کردن Firebase...');
        
        // پاک کردن Firebase Price History
        if (window.firebasePriceHistory && window.firebasePriceHistory.cleanup) {
            try {
                await window.firebasePriceHistory.cleanup(0); // پاک کردن تمام رکوردها
                console.log('✅ Firebase Price History پاک شد');
            } catch (error) {
                console.error('❌ خطا در پاک کردن Firebase Price History:', error);
            }
        }
        
        // پاک کردن Firebase Network Database
        if (window.firebaseNetworkDB && window.firebaseNetworkDB.cleanup) {
            try {
                await window.firebaseNetworkDB.cleanup(0); // پاک کردن تمام رکوردها
                console.log('✅ Firebase Network Database پاک شد');
            } catch (error) {
                console.error('❌ خطا در پاک کردن Firebase Network Database:', error);
            }
        }
        
        // پاک کردن مستقیم Firebase Collections
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            try {
                const db = firebase.firestore();
                
                // پاک کردن collection price_history
                const priceHistorySnapshot = await db.collection('price_history').get();
                const priceHistoryBatch = db.batch();
                priceHistorySnapshot.docs.forEach(doc => {
                    priceHistoryBatch.delete(doc.ref);
                });
                await priceHistoryBatch.commit();
                console.log(`✅ ${priceHistorySnapshot.docs.length} رکورد از price_history پاک شد`);
                
                // پاک کردن collection network_trees
                const networkTreesSnapshot = await db.collection('network_trees').get();
                const networkTreesBatch = db.batch();
                networkTreesSnapshot.docs.forEach(doc => {
                    networkTreesBatch.delete(doc.ref);
                });
                await networkTreesBatch.commit();
                console.log(`✅ ${networkTreesSnapshot.docs.length} رکورد از network_trees پاک شد`);
                
                // پاک کردن collection network_nodes
                const networkNodesSnapshot = await db.collection('network_nodes').get();
                const networkNodesBatch = db.batch();
                networkNodesSnapshot.docs.forEach(doc => {
                    networkNodesBatch.delete(doc.ref);
                });
                await networkNodesBatch.commit();
                console.log(`✅ ${networkNodesSnapshot.docs.length} رکورد از network_nodes پاک شد`);
                
            } catch (error) {
                console.error('❌ خطا در پاک کردن Firebase Collections:', error);
            }
        }
        
        // پاک کردن localStorage
        console.log('💾 پاک کردن localStorage...');
        const localStorageKeys = [
            'network_tree_nodes',
            'network_tree_full',
            'tokenPriceHistory',
            'pointPriceHistory',
            'cpa_products',
            'activeTab',
            'walletAddress',
            'walletData',
            'floatingAIChatHistory',
            'extractedNetworkTree'
        ];
        
        localStorageKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log(`✅ ${key} از localStorage پاک شد`);
        });
        
        // پاک کردن sessionStorage
        console.log('💾 پاک کردن sessionStorage...');
        const sessionStorageKeys = Object.keys(sessionStorage);
        sessionStorageKeys.forEach(key => {
            if (key.startsWith('userProfile_') || key.startsWith('ai_')) {
                sessionStorage.removeItem(key);
                console.log(`✅ ${key} از sessionStorage پاک شد`);
            }
        });
        
        // پاک کردن کش‌های مختلف
        console.log('🧹 پاک کردن کش‌ها...');
        if (window.clearConnectionCache) {
            window.clearConnectionCache();
            console.log('✅ کش اتصال پاک شد');
        }
        
        if (window.clearUserProfileCache) {
            window.clearUserProfileCache();
            console.log('✅ کش پروفایل کاربر پاک شد');
        }
        
        if (window.clearNetworkTreeInterval) {
            window.clearNetworkTreeInterval();
            console.log('✅ interval درخت شبکه پاک شد');
        }
        
        // پاک کردن تاریخچه قیمت‌ها
        if (window.clearAllPriceHistory) {
            await window.clearAllPriceHistory();
            console.log('✅ تاریخچه قیمت‌ها پاک شد');
        }
        
        // پاک کردن دیتابیس شبکه
        if (window.clearNetworkDatabase) {
            window.clearNetworkDatabase();
            console.log('✅ دیتابیس شبکه پاک شد');
        }
        
        // ریست کردن dashboard
        if (window.resetDashboard) {
            window.resetDashboard();
            console.log('✅ داشبورد ریست شد');
        }
        
        // پاک کردن متغیرهای سراسری
        if (typeof connectionCache !== 'undefined') {
            connectionCache = null;
        }
        if (typeof globalConnectionPromise !== 'undefined') {
            globalConnectionPromise = null;
        }
        if (typeof pendingAccountRequest !== 'undefined') {
            pendingAccountRequest = null;
        }
        
        // پاک کردن contractConfig
        if (window.contractConfig) {
            window.contractConfig.provider = null;
            window.contractConfig.signer = null;
            window.contractConfig.contract = null;
            window.contractConfig.address = null;
        }
        
        console.log('✅ پاک کردن کامل دیتابیس و Firebase تمام شد');
        console.log('🔄 صفحه در حال رفرش...');
        
        // رفرش صفحه بعد از 3 ثانیه
        setTimeout(() => {
            location.reload();
        }, 3000);
        
        // حذف این تابع از window
        setTimeout(() => {
            delete window.clearAllDatabaseData;
            console.log('🗑️ دستور پاک کردن دیتابیس حذف شد');
        }, 4000);
        
        return true;
        
    } catch (error) {
        console.error('❌ خطا در پاک کردن دیتابیس:', error);
        return false;
    }
};

// تابع ثبت‌نام رزرو - همان فرم register.html ولی با registerFree
window.openReserveRegistration = function() {
    window.open('register-free.html', '_blank');
};

// تابع بررسی اعتبار آدرس اتریوم
function isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}





// نمایش دستور در کنسول
console.log('💡 دستور پاک کردن کامل دیتابیس و Firebase آماده است: window.clearAllDatabaseData()');
console.log('🎯 باز کردن صفحه ثبت‌نام رزرو: window.openReserveRegistration()');

