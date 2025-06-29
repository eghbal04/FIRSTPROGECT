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
        const profile = await window.getUserProfile();
        
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
    const safe = (val, suffix = '') => {
        if (val === undefined || val === null || val === 'undefined' || val === '' || isNaN(val)) return '-';
        if (typeof val === 'string' && val.trim() === '') return '-';
        return val + suffix;
    };

    const updateElement = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = safe(value);
    };

    console.log('Profile data received:', profile);

    updateElement('profile-address', shortenAddress(profile.address));
    updateElement('profile-referrer', shortenAddress(profile.referrer));
    updateElement('profile-matic', profile.maticBalance);
    updateElement('profile-matic-usd', profile.maticValueUSD ? `(${profile.maticValueUSD}$)` : '-');
    updateElement('profile-lvl', profile.lvlBalance);
    updateElement('profile-lvl-usd', profile.lvlValueUSD ? `(${profile.lvlValueUSD}$)` : '-');
    updateElement('profile-income-cap', profile.binaryPointCap);
    updateElement('profile-received', profile.binaryPoints);
    updateElement('profile-referral-link', window.location.origin + '/?ref=' + shortenAddress(profile.address));
    
    // نمایش وضعیت ثبت‌نام - اصلاح شده
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
            } catch (error) {
                console.error("Profile: Error copying referral link:", error);
            }
        });
    }
}

// تابع نمایش خطای پروفایل
function showProfileError(message) {
    const statusElement = document.getElementById('profileStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'profile-status error';
        
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'profile-status';
        }, 5000);
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