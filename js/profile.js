// Profile Module - فقط توابع مخصوص پروفایل

window.cachedUserProfile = window.cachedUserProfile || null;
async function loadUserProfileOnce() {
    if (window.cachedUserProfile) return window.cachedUserProfile;
    window.cachedUserProfile = await window.getUserProfile();
    return window.cachedUserProfile;
}

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
        
        const profile = await loadUserProfileOnce();
        
        if (!profile || !profile.address) {
            throw new Error('Invalid profile data received');
        }
        
        updateProfileUI(profile);
        
        setupReferralCopy();
        
        startBinaryClaimCountdown(profile.lastClaimTime);
        
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
        if (profile.referrer === '0x0000000000000000000000000000000000000000') {
            referrerText = 'بدون معرف';
        } else if (profile.referrer.toLowerCase() === profile.address.toLowerCase()) {
            referrerText = 'خود شما';
        } else {
            referrerText = shorten(profile.referrer);
        }
    }
    const referrerEl = document.getElementById('profile-referrer');
    if (referrerEl) referrerEl.textContent = referrerText;

    const usdcEl = document.getElementById('profile-usdc');
    if (usdcEl) usdcEl.textContent = profile.usdcBalance ? formatNumber(profile.usdcBalance, 2) + ' USDC' : '0 USDC';

    const capEl = document.getElementById('profile-income-cap');
    if (capEl) capEl.textContent = profile.binaryPointCap || '۰';
    const receivedEl = document.getElementById('profile-received');
    if (receivedEl) receivedEl.textContent = profile.binaryPointsClaimed || '۰';

    const linkEl = document.getElementById('profile-referral-link');
    if (linkEl) {
        if (profile.address) {
            const fullLink = window.location.origin + '/?ref=' + profile.address;
            linkEl.href = fullLink;
            linkEl.textContent = fullLink;
            linkEl.style.pointerEvents = 'auto';
            linkEl.style.opacity = '1';
        } else {
            linkEl.href = '#';
            linkEl.textContent = 'لینک دعوت در دسترس نیست';
            linkEl.style.pointerEvents = 'none';
            linkEl.style.opacity = '0.6';
        }
    }

    const copyBtn = document.getElementById('copyProfileReferral');
    if (copyBtn) {
        copyBtn.onclick = async () => {
            try {
                if (profile.address) {
                    const fullLink = window.location.origin + '/?ref=' + profile.address;
                    console.log('Copying referral link:', fullLink);
                    
                    // تلاش برای کپی کردن
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(fullLink);
                        copyBtn.textContent = 'کپی شد!';
                        setTimeout(() => copyBtn.textContent = 'کپی', 1500);
                    } else {
                        // روش جایگزین برای مرورگرهای قدیمی
                        const textArea = document.createElement('textarea');
                        textArea.value = fullLink;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        copyBtn.textContent = 'کپی شد!';
                        setTimeout(() => copyBtn.textContent = 'کپی', 1500);
                    }
                } else {
                    console.error('No profile address available');
                    copyBtn.textContent = 'خطا: آدرس موجود نیست';
                    setTimeout(() => copyBtn.textContent = 'کپی', 1500);
                }
            } catch (error) {
                console.error('Error copying referral link:', error);
                copyBtn.textContent = 'خطا در کپی';
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
            claimBtn.textContent = `💰 برداشت پاداش‌های باینری (⏳ 12 ساعت)`;
            claimBtn.style.opacity = '1';
            claimBtn.style.cursor = 'pointer';
        } else {
            claimBtn.textContent = '💰 برداشت پاداش‌های باینری (⏳ 12 ساعت)';
            claimBtn.style.opacity = '0.5';
            claimBtn.style.cursor = 'not-allowed';
        }
    }

    const leftPointsEl = document.getElementById('profile-leftPoints');
    if (leftPointsEl) leftPointsEl.textContent = profile.leftPoints || '۰';
    const rightPointsEl = document.getElementById('profile-rightPoints');
    if (rightPointsEl) rightPointsEl.textContent = profile.rightPoints || '۰';
    
    // مدیریت وضعیت دکمه پاداش ماهانه بر اساس خالی بودن فرزندان
    const claimMonthlyBtn = document.getElementById('profile-claim-monthly-btn');
    if (claimMonthlyBtn) {
        const leftPoints = Number(profile.leftPoints || 0);
        const rightPoints = Number(profile.rightPoints || 0);
        const bothChildrenEmpty = leftPoints === 0 && rightPoints === 0;
        
        if (bothChildrenEmpty) {
            // نمایش دکمه اگر هر دو فرزند خالی هستند
            claimMonthlyBtn.style.display = 'block';
            claimMonthlyBtn.disabled = false;
            claimMonthlyBtn.style.opacity = '1';
            claimMonthlyBtn.style.cursor = 'pointer';
        } else {
            // مخفی کردن دکمه اگر حداقل یکی از فرزندان خالی نیست
            claimMonthlyBtn.style.display = 'none';
        }
    }
    
    const lastClaimTimeEl = document.getElementById('profile-lastClaimTime');
    if (lastClaimTimeEl) lastClaimTimeEl.textContent = formatTimestamp(profile.lastClaimTime);
    const lastMonthlyClaimEl = document.getElementById('profile-lastMonthlyClaim');
    if (lastMonthlyClaimEl) lastMonthlyClaimEl.textContent = formatTimestamp(profile.lastMonthlyClaim);
    const totalMonthlyRewardedEl = document.getElementById('profile-totalMonthlyRewarded');
    if (totalMonthlyRewardedEl) totalMonthlyRewardedEl.textContent = profile.totalMonthlyRewarded || '۰';
    const depositedAmountEl = document.getElementById('profile-depositedAmount');
    if (depositedAmountEl) depositedAmountEl.textContent = profile.depositedAmount || '۰';

    // موجودی متیک
    const maticEl = document.getElementById('profile-matic');
    if (maticEl) maticEl.textContent = profile.maticBalance ? formatNumber(profile.maticBalance, 4) + ' MATIC' : '0 MATIC';
    // موجودی CPA
    const cpaEl = document.getElementById('profile-lvl');
    if (cpaEl) cpaEl.textContent = profile.lvlBalance ? formatNumber(profile.lvlBalance, 4) + ' CPA' : '0 CPA';
    // تعداد پوینت
    const pointsEl = document.getElementById('profile-total-points');
    if (pointsEl) pointsEl.textContent = profile.binaryPoints ? formatNumber(profile.binaryPoints, 0) : '۰';
    // تعداد پوینت‌های دریافت‌نشده
    const unclaimedPointsEl = document.getElementById('profile-unclaimed-points');
    if (unclaimedPointsEl) {
        const total = Number(profile.binaryPoints || 0);
        const claimed = Number(profile.binaryPointsClaimed || 0);
        const unclaimed = Math.max(total - claimed, 0);
        unclaimedPointsEl.textContent = isNaN(unclaimed) ? '۰' : unclaimed.toLocaleString('en-US', {maximumFractionDigits: 0});
    }
}

// Add/replace this function to update the referrer field in the profile section
async function updateProfileReferrer() {
  try {
    if (!window.connectWallet) return;
    const { contract, address } = await window.connectWallet();
    if (!contract || !address) return;
    const user = await contract.users(address);
    let referrer = '-';
    if (user && user.index !== undefined) {
      let idx = user.index;
      if (typeof idx === 'bigint') idx = Number(idx);
      else idx = parseInt(idx);
      console.log('[Referrer Debug] user.index =', idx);
      if (idx === 0) {
        referrer = address; // Only if index is 0
        console.log('[Referrer Debug] index=0, referrer set to self:', referrer);
      } else {
        try {
          referrer = await contract.getReferrer(idx);
          console.log('[Referrer Debug] getReferrer(', idx, ') =', referrer);
        } catch (e) {
          referrer = '-';
          console.log('[Referrer Debug] getReferrer error:', e);
        }
      }
    } else {
      console.log('[Referrer Debug] user or user.index undefined:', user);
    }
    const refEl = document.getElementById('profile-referrer');
    if (refEl) {
      if (referrer === '0x0000000000000000000000000000000000000000' || referrer === '-' || !referrer) {
        refEl.textContent = 'بدون معرف';
      } else if (referrer.toLowerCase() === address.toLowerCase()) {
        refEl.textContent = 'خود شما';
      } else {
        refEl.textContent = shorten(referrer);
      }
    }
  } catch (e) {
    const refEl = document.getElementById('profile-referrer');
    if (refEl) refEl.textContent = 'بدون معرف';
    console.log('[Referrer Debug] Exception:', e);
  }
}

// Patch loadUserProfile to always update referrer from contract after profile loads
if (window.loadUserProfile) {
  const origLoadUserProfile = window.loadUserProfile;
  window.loadUserProfile = async function() {
    await origLoadUserProfile.apply(this, arguments);
    await updateProfileReferrer(); // Always update referrer from contract, no delay
  };
}

// تابع راه‌اندازی دکمه کپی لینک دعوت
function setupReferralCopy() {
    const copyBtn = document.getElementById('copyProfileReferral');
    if (copyBtn) {
        // حذف event listener های قبلی برای جلوگیری از تداخل
        copyBtn.replaceWith(copyBtn.cloneNode(true));
        const newCopyBtn = document.getElementById('copyProfileReferral');
        
        newCopyBtn.addEventListener('click', async () => {
            try {
                const { address } = await window.connectWallet();
                if (!address) {
                    throw new Error('آدرس کیف پول در دسترس نیست');
                }
                
                const referralLink = `${window.location.origin}/?ref=${address}`;
                console.log('Copying referral link from setupReferralCopy:', referralLink);
                
                // تلاش برای کپی کردن
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(referralLink);
                    newCopyBtn.textContent = 'کپی شد!';
                    setTimeout(() => newCopyBtn.textContent = 'کپی', 1500);
                } else {
                    // روش جایگزین برای مرورگرهای قدیمی
                    const textArea = document.createElement('textarea');
                    textArea.value = referralLink;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    newCopyBtn.textContent = 'کپی شد!';
                    setTimeout(() => newCopyBtn.textContent = 'کپی', 1500);
                }
            } catch (error) {
                console.error('Error in setupReferralCopy:', error);
                showProfileError('خطا در کپی کردن لینک دعوت: ' + error.message);
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

    // دکمه برداشت پاداش ماهانه
    const claimMonthlyBtn = document.getElementById('profile-claim-monthly-btn');
    const claimMonthlyStatus = document.getElementById('profile-claim-monthly-status');
    if (claimMonthlyBtn && claimMonthlyStatus) {
        claimMonthlyBtn.onclick = async function() {
            claimMonthlyBtn.disabled = true;
            claimMonthlyStatus.textContent = 'در حال برداشت پاداش ماهانه...';
            claimMonthlyStatus.className = 'profile-status loading';
            try {
                const result = await window.claimMonthlyReward();
                claimMonthlyStatus.textContent = 'برداشت ماهانه با موفقیت انجام شد!\nکد تراکنش: ' + result.transactionHash;
                claimMonthlyStatus.className = 'profile-status success';
                setTimeout(() => location.reload(), 1200);
            } catch (e) {
                let msg = e && e.message ? e.message : e;
                if (msg && msg.includes('No cashback available')) {
                    msg = 'شما در حال حاضر پاداش ماهانه‌ای برای برداشت ندارید.\n\nتوضیح: پاداش ماهانه فقط زمانی قابل برداشت است که مقدار کافی از فعالیت یا خرید ماهانه داشته باشید و هنوز آن را دریافت نکرده باشید.';
                }
                claimMonthlyStatus.textContent = 'خطا در برداشت ماهانه: ' + msg;
                claimMonthlyStatus.className = 'profile-status error';
            }
            claimMonthlyBtn.disabled = false;
        };
    }
});

function formatTimestamp(ts) {
    if (!ts || ts === '0') return '---';
    const date = new Date(Number(ts) * 1000);
    return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
}

// شمارش معکوس برای دکمه برداشت پاداش‌های باینری
function startBinaryClaimCountdown(lastClaimTime) {
    const timerEl = document.getElementById('binary-claim-timer');
    if (!timerEl) return;
    function updateTimer() {
        const now = Math.floor(Date.now() / 1000);
        const nextClaim = Number(lastClaimTime) + 12 * 3600;
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

// اضافه کردن تابع به window برای دسترسی جهانی
window.startBinaryClaimCountdown = startBinaryClaimCountdown;