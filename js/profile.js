// Profile Module - فقط توابع مخصوص پروفایل

// تابع انتظار برای اتصال کیف پول
async function waitForWalletConnection() {
    let attempts = 0;
    const maxAttempts = 30; // 30 ثانیه
    
    while (attempts < maxAttempts) {
        try {
            const result = await window.checkConnection();
            if (result.connected) {
                console.log('Profile: Wallet connected, loading profile...');
                return result;
            }
        } catch (error) {
            console.log('Profile: Waiting for wallet connection...', attempts + 1);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
    }
    
    throw new Error('Profile: Timeout waiting for wallet connection');
}

// تابع بارگذاری پروفایل کاربر
async function loadUserProfile() {
    try {
        console.log('Profile: Loading user profile...');
        
        // انتظار برای اتصال کیف پول
        await waitForWalletConnection();
        
        // دریافت پروفایل کاربر - استفاده از تابع صحیح
        console.log('Profile: Calling getUserProfile...');
        const profile = await window.getUserProfile();
        console.log('Profile: getUserProfile returned:', profile);
        
        // بررسی اعتبار داده‌های پروفایل
        if (!profile || !profile.address) {
            throw new Error('Invalid profile data received');
        }
        
        // به‌روزرسانی UI
        updateProfileUI(profile);
        
        // راه‌اندازی دکمه کپی
        setupReferralCopy();
        
        console.log('Profile: User profile loaded successfully');
        
    } catch (error) {
        console.error('Profile: Error loading user profile:', error);
        showProfileError('خطا در بارگذاری پروفایل: ' + error.message);
    }
}

// تابع به‌روزرسانی UI پروفایل
function updateProfileUI(profile) {
    console.log('Profile: Updating UI with profile data:', profile);

    // فرمت‌دهی اعداد
    const formatNumber = (val, decimals = 4) => {
        if (!val || isNaN(Number(val))) return '۰';
        return Number(val).toLocaleString('en-US', { maximumFractionDigits: decimals });
    };

    // کوتاه کردن آدرس
    const shorten = (address) => {
        if (!address) return '---';
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    };

    // آدرس کاربر
    const addressEl = document.getElementById('profile-address');
    if (addressEl) addressEl.textContent = profile.address ? shorten(profile.address) : '---';

    // معرف
    let referrerText = 'بدون معرف';
    if (profile.referrer) {
        if (profile.referrer.toLowerCase() === profile.address.toLowerCase()) {
            referrerText = 'خود شما';
        } else {
            referrerText = shorten(profile.referrer);
        }
    }
    const referrerEl = document.getElementById('profile-referrer');
    if (referrerEl) referrerEl.textContent = referrerText;

    // موجودی‌ها
    const maticEl = document.getElementById('profile-matic');
    if (maticEl) maticEl.textContent = formatNumber(profile.maticBalance, 6);
    const maticUsdEl = document.getElementById('profile-matic-usd');
    if (maticUsdEl) maticUsdEl.textContent = profile.maticValueUSD && profile.maticValueUSD !== '0'
        ? `(${formatNumber(profile.maticValueUSD, 2)}$)` : '';
    const lvlEl = document.getElementById('profile-lvl');
    if (lvlEl) lvlEl.textContent = formatNumber(profile.lvlBalance, 6);
    const lvlUsdEl = document.getElementById('profile-lvl-usd');
    if (lvlUsdEl) lvlUsdEl.textContent = profile.lvlValueUSD && profile.lvlValueUSD !== '0'
        ? `(${formatNumber(profile.lvlValueUSD, 2)}$)` : '';

    // سقف درآمد باینری و دریافتی
    const capEl = document.getElementById('profile-income-cap');
    if (capEl) capEl.textContent = profile.binaryPointCap ? parseInt(profile.binaryPointCap) : '۰';
    const receivedEl = document.getElementById('profile-received');
    if (receivedEl) receivedEl.textContent = profile.binaryPoints || '۰';

    // لینک دعوت (نمایش کوتاه، کپی کامل)
    const linkEl = document.getElementById('profile-referral-link');
    if (linkEl) linkEl.textContent = profile.address
        ? shorten(profile.address)
        : 'لینک دعوت در دسترس نیست';

    // دکمه کپی لینک دعوت را طوری تنظیم کن که لینک کامل را کپی کند
    const copyBtn = document.getElementById('copyProfileReferral');
    if (copyBtn) {
        copyBtn.onclick = async () => {
            if (profile.address) {
                const fullLink = window.location.origin + '/?ref=' + profile.address;
                await navigator.clipboard.writeText(fullLink);
                copyBtn.textContent = 'کپی شد!';
                setTimeout(() => copyBtn.textContent = 'کپی', 1500);
            }
        };
    }

    // وضعیت ثبت‌نام
    const statusElement = document.getElementById('profileStatus');
    if (statusElement) {
        if (profile.registered) {
            statusElement.textContent = 'کاربر ثبت‌نام شده';
            statusElement.className = 'profile-status success';
        } else {
            statusElement.textContent = 'کاربر ثبت‌نام نشده';
            statusElement.className = 'profile-status error';
        }
    }
}

// تابع راه‌اندازی دکمه کپی لینک دعوت
function setupReferralCopy() {
    const copyBtn = document.getElementById('copyProfileReferral');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            try {
                const { address } = await window.connectWallet();
                const referralLink = `${window.location.origin}/?ref=${address}`;
                
                await navigator.clipboard.writeText(referralLink);
                copyBtn.textContent = 'کپی شد!';
                setTimeout(() => copyBtn.textContent = 'کپی', 1500);
                console.log('Profile: Referral link copied to clipboard');
            } catch (error) {
                console.error("Profile: Error copying referral link:", error);
                showProfileError('خطا در کپی کردن لینک دعوت');
            }
        });
        console.log('Profile: Referral copy button setup complete');
    } else {
        console.warn('Profile: Copy button not found');
    }
}

// تابع نمایش خطای پروفایل
function showProfileError(message) {
    console.error('Profile: Showing error:', message);
    const statusElement = document.getElementById('profileStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'profile-status error';
        
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'profile-status';
        }, 5000);
    } else {
        console.error('Profile: Status element not found for error display');
    }
}

// تابع بررسی اتصال (برای استفاده داخلی)
async function checkConnection() {
    try {
        return await window.checkConnection();
    } catch (error) {
        console.error('Profile: Connection check failed:', error);
        return { connected: false, error: error.message };
    }
}

// تابع کوتاه کردن آدرس
function shortenAddress(address) {
    if (!address) return '---';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

console.log('Profile module loaded successfully');