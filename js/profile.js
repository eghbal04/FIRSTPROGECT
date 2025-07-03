// Profile Module - فقط توابع مخصوص پروفایل

// تابع انتظار برای اتصال کیف پول
async function waitForWalletConnection() {
    let attempts = 0;
    const maxAttempts = 30; // 30 ثانیه
    
    while (attempts < maxAttempts) {
        try {
            const result = await window.checkConnection();
            if (result.connected) {
                return result;
            }
        } catch (error) {
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
    }
    
    throw new Error('Profile: Timeout waiting for wallet connection');
}

// تابع بارگذاری پروفایل کاربر
async function loadUserProfile() {
    try {
        await waitForWalletConnection();
        
        const profile = await window.getUserProfile();
        
        if (!profile || !profile.address) {
            throw new Error('Invalid profile data received');
        }
        
        updateProfileUI(profile);
        
        setupReferralCopy();
        
    } catch (error) {
        showProfileError('خطا در بارگذاری پروفایل: ' + error.message);
    }
}

// تابع به‌روزرسانی UI پروفایل
function updateProfileUI(profile) {
    const formatNumber = (val, decimals = 4) => {
        if (!val || isNaN(Number(val))) return '۰';
        return Number(val).toLocaleString('en-US', { maximumFractionDigits: decimals });
    };

    const shorten = (address) => {
        if (!address) return '---';
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    };

    const addressEl = document.getElementById('profile-address');
    if (addressEl) addressEl.textContent = profile.address ? shorten(profile.address) : '---';

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

    const maticEl = document.getElementById('profile-matic');
    if (maticEl) maticEl.textContent = formatNumber(profile.maticBalance || profile.polBalance, 6);
    const maticUsdEl = document.getElementById('profile-matic-usd');
    if (maticUsdEl) {
        const usd = profile.polValueUSD || profile.maticValueUSD;
        maticUsdEl.textContent = usd && usd !== '0' ? `(${formatNumber(usd, 2)}$)` : '';
    }
    const lvlEl = document.getElementById('profile-lvl');
    if (lvlEl) lvlEl.textContent = formatNumber(profile.lvlBalance, 6);
    const lvlUsdEl = document.getElementById('profile-lvl-usd');
    if (lvlUsdEl) {
        if (profile.lvlValueUSD && profile.lvlValueUSD !== '0') {
            const lvlValue = Number(profile.lvlValueUSD);
            if (lvlValue > 1_000_000) {
                lvlUsdEl.textContent = `(${lvlValue.toExponential(3)}$)`;
                lvlUsdEl.title = 'ارزش دلاری غیرواقعی به دلیل نقدینگی یا عرضه کم توکن. این مقدار واقعی نیست.';
                lvlUsdEl.style.color = '#ff6b6b';
            } else {
                lvlUsdEl.textContent = `(${formatNumber(profile.lvlValueUSD, 2)}$)`;
                lvlUsdEl.title = '';
                lvlUsdEl.style.color = '';
            }
        } else {
            lvlUsdEl.textContent = '';
            lvlUsdEl.title = '';
            lvlUsdEl.style.color = '';
        }
    }

    const capEl = document.getElementById('profile-income-cap');
    if (capEl) capEl.textContent = profile.binaryPointCap || '۰';
    const receivedEl = document.getElementById('profile-received');
    if (receivedEl) receivedEl.textContent = profile.binaryPointsClaimed || '۰';

    const linkEl = document.getElementById('profile-referral-link');
    if (linkEl) linkEl.textContent = profile.address
        ? shorten(profile.address)
        : 'لینک دعوت در دسترس نیست';

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

    const purchasedKindEl = document.getElementById('profile-purchased-kind');
    if (purchasedKindEl) {
        let rawValue = Number(profile.totalPurchasedKind) / 1e18;
        let lvlDisplay = rawValue.toLocaleString('en-US', { maximumFractionDigits: 5, minimumFractionDigits: 0 });
        lvlDisplay += ' LVL';
        purchasedKindEl.textContent = lvlDisplay;
    }

    const refclimedEl = document.getElementById('profile-refclimed');
    if (refclimedEl) refclimedEl.textContent = profile.refclimed ? Number(profile.refclimed) / 1e18 + ' LVL' : '۰';

    // مدیریت وضعیت دکمه کلایم بر اساس پوینت‌های باینری
    const claimBtn = document.getElementById('profile-claim-btn');
    if (claimBtn) {
        const binaryPoints = Number(profile.binaryPoints || 0);
        const hasPoints = binaryPoints > 0;
        
        claimBtn.disabled = !hasPoints;
        
        if (hasPoints) {
            claimBtn.textContent = `💰 برداشت پاداش‌های باینری (${formatNumber(profile.binaryPoints)} پوینت)`;
            claimBtn.style.opacity = '1';
            claimBtn.style.cursor = 'pointer';
        } else {
            claimBtn.textContent = '💰 برداشت پاداش‌های باینری (بدون پوینت)';
            claimBtn.style.opacity = '0.5';
            claimBtn.style.cursor = 'not-allowed';
        }
    }

    const leftPointsEl = document.getElementById('profile-leftPoints');
    if (leftPointsEl) leftPointsEl.textContent = profile.leftPoints || '۰';
    const rightPointsEl = document.getElementById('profile-rightPoints');
    if (rightPointsEl) rightPointsEl.textContent = profile.rightPoints || '۰';
    const lastClaimTimeEl = document.getElementById('profile-lastClaimTime');
    if (lastClaimTimeEl) lastClaimTimeEl.textContent = formatTimestamp(profile.lastClaimTime);
    const lastMonthlyClaimEl = document.getElementById('profile-lastMonthlyClaim');
    if (lastMonthlyClaimEl) lastMonthlyClaimEl.textContent = formatTimestamp(profile.lastMonthlyClaim);
    const totalMonthlyRewardedEl = document.getElementById('profile-totalMonthlyRewarded');
    if (totalMonthlyRewardedEl) totalMonthlyRewardedEl.textContent = profile.totalMonthlyRewarded || '۰';
    const depositedAmountEl = document.getElementById('profile-depositedAmount');
    if (depositedAmountEl) depositedAmountEl.textContent = profile.depositedAmount || '۰';
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
                showProfileError('خطا در کپی کردن لینک دعوت');
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
        return { connected: false, error: error.message };
    }
}

// تابع کوتاه کردن آدرس
function shortenAddress(address) {
    if (!address) return '---';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

document.addEventListener('DOMContentLoaded', function() {
    const claimBtn = document.getElementById('profile-claim-btn');
    const claimStatus = document.getElementById('profile-claim-status');
    if (claimBtn && claimStatus) {
        claimBtn.onclick = async function() {
            claimBtn.disabled = true;
            claimStatus.textContent = 'در حال برداشت...';
            claimStatus.className = 'profile-status loading';
            try {
                const result = await window.claimRewards();
                claimStatus.textContent = 'برداشت با موفقیت انجام شد!\nکد تراکنش: ' + result.transactionHash;
                claimStatus.className = 'profile-status success';
                setTimeout(() => location.reload(), 1200);
            } catch (e) {
                claimStatus.textContent = 'خطا در برداشت: ' + (e && e.message ? e.message : e);
                claimStatus.className = 'profile-status error';
            }
            claimBtn.disabled = false;
        };
    }
});

function formatTimestamp(ts) {
    if (!ts || ts === '0') return '---';
    const date = new Date(Number(ts) * 1000);
    return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
}