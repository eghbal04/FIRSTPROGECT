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
    const maxAttempts = 15; // کاهش به 15 ثانیه
    
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

// تابع بارگذاری پروفایل کاربر (بازنویسی برای گرفتن اطلاعات کامل ولت و یوزر)
async function loadUserProfile() {
    try {
        await waitForWalletConnection();
        // اتصال به ولت و قرارداد
        let connection = null;
        if (window.connectWallet) {
            connection = await window.connectWallet();
        } else if (window.contractConfig && window.contractConfig.contract && window.contractConfig.address) {
            connection = window.contractConfig;
        }
        if (!connection || !connection.contract || !connection.address) {
            throw new Error('اتصال کیف پول برقرار نشد');
        }
        const { contract, address, provider } = connection;
        // گرفتن اطلاعات یوزر از قرارداد
        const userStruct = await contract.users(address);
        // گرفتن موجودی‌ها
        let maticBalance = '0', lvlBalance = '0', daiBalance = '0';
        if (provider) {
            maticBalance = await provider.getBalance(address);
            maticBalance = ethers.formatEther(maticBalance);
        }
        if (contract.balanceOf) {
            lvlBalance = await contract.balanceOf(address);
            lvlBalance = ethers.formatUnits(lvlBalance, 18);
        }
        // گرفتن DAI
        try {
            if (typeof window.DAI_ADDRESS !== 'undefined' && typeof window.DAI_ABI !== 'undefined') {
                const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, provider);
                const daiRaw = await daiContract.balanceOf(address);
                daiBalance = (Number(daiRaw) / 1e18).toFixed(2); // DAI has 18 decimals
            }
        } catch (e) { daiBalance = '0'; }
        // ساخت پروفایل کامل
        const profile = {
            address,
            maticBalance,
            lvlBalance,
            daiBalance,
            userStruct: userStruct // کل ساختار یوزر قرارداد
        };
        // نمایش اطلاعات در UI
        updateProfileUI(profile);
        setupReferralCopy();
        // اگر تایمر نیاز است:
        if (userStruct && userStruct.lastClaimTime) {
            startBinaryClaimCountdown(userStruct.lastClaimTime);
        }
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
    if (profile.userStruct && profile.userStruct.referrer) {
        if (profile.userStruct.referrer === '0x0000000000000000000000000000000000000000') {
            referrerText = 'بدون معرف';
        } else if (profile.userStruct.referrer.toLowerCase() === profile.address.toLowerCase()) {
            referrerText = 'خود شما';
        } else {
            referrerText = shorten(profile.userStruct.referrer);
        }
    }
    const referrerEl = document.getElementById('profile-referrer');
    if (referrerEl) referrerEl.textContent = referrerText;

    const daiEl = document.getElementById('profile-dai');
            if (daiEl) daiEl.textContent = profile.daiBalance ? formatNumber(profile.daiBalance, 2) + ' DAI' : '0 DAI';

    const capEl = document.getElementById('profile-income-cap');
    if (capEl) capEl.textContent = profile.userStruct.binaryPointCap || '۰';
    const receivedEl = document.getElementById('profile-received');
    if (receivedEl) receivedEl.textContent = profile.userStruct.binaryPointsClaimed || '۰';

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
                    copyBtn.textContent = 'خطا: آدرس موجود نیست';
                    setTimeout(() => copyBtn.textContent = 'کپی', 1500);
                }
            } catch (error) {
                copyBtn.textContent = 'خطا در کپی';
                setTimeout(() => copyBtn.textContent = 'کپی', 1500);
            }
        };
    }

    const statusElement = document.getElementById('profileStatus');
    if (statusElement) {
        // وضعیت ثبت‌نام را فقط بر اساس userStruct.activated نمایش بده
        if (profile.userStruct && profile.userStruct.activated) {
            statusElement.textContent = 'کاربر ثبت‌نام شده';
            statusElement.className = 'profile-status success';
        } else {
            statusElement.textContent = 'کاربر ثبت‌نام نشده';
            statusElement.className = 'profile-status error';
        }
    }

    const purchasedKindEl = document.getElementById('profile-purchased-kind');
    if (purchasedKindEl) {
        let rawValue = Number(profile.userStruct.totalPurchasedKind) / 1e18;
        let lvlDisplay = rawValue.toLocaleString('en-US', { maximumFractionDigits: 5, minimumFractionDigits: 0 });
        lvlDisplay += ' IAM';
        purchasedKindEl.textContent = lvlDisplay;
    }

    const refclimedEl = document.getElementById('profile-refclimed');
    if (refclimedEl) refclimedEl.textContent = profile.userStruct.refclimed ? Math.floor(Number(profile.userStruct.refclimed) / 1e18) + ' IAM' : '۰';

    // مدیریت وضعیت دکمه کلایم بر اساس پوینت‌های باینری
    const claimBtn = document.getElementById('profile-claim-btn');
    if (claimBtn) {
        const binaryPoints = Number(profile.userStruct.binaryPoints || 0);
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
    if (leftPointsEl) leftPointsEl.textContent = profile.userStruct.leftPoints || '۰';
    const rightPointsEl = document.getElementById('profile-rightPoints');
    if (rightPointsEl) rightPointsEl.textContent = profile.userStruct.rightPoints || '۰';
    
    // مدیریت وضعیت دکمه پاداش ماهانه بر اساس خالی بودن فرزندان
    const claimMonthlyBtn = document.getElementById('profile-claim-monthly-btn');
    if (claimMonthlyBtn) {
        const leftPoints = Number(profile.userStruct.leftPoints || 0);
        const rightPoints = Number(profile.userStruct.rightPoints || 0);
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
    if (lastClaimTimeEl) lastClaimTimeEl.textContent = formatTimestamp(profile.userStruct.lastClaimTime);
    const lastMonthlyClaimEl = document.getElementById('profile-lastMonthlyClaim');
    if (lastMonthlyClaimEl) lastMonthlyClaimEl.textContent = formatTimestamp(profile.userStruct.lastMonthlyClaim);
    const totalMonthlyRewardedEl = document.getElementById('profile-totalMonthlyRewarded');
    if (totalMonthlyRewardedEl) totalMonthlyRewardedEl.textContent = profile.userStruct.totalMonthlyRewarded || '۰';
    const depositedAmountEl = document.getElementById('profile-depositedAmount');
    if (depositedAmountEl) {
      let val = profile.userStruct.depositedAmount;
      if (val && typeof val === 'object' && typeof val.toString === 'function') {
        val = ethers.formatUnits(val.toString(), 18);
      } else if (typeof val === 'bigint') {
        val = ethers.formatUnits(val, 18);
      } else if (typeof val === 'string' && val.length > 18) {
        val = ethers.formatUnits(val, 18);
      }
      depositedAmountEl.textContent = val ? val : '۰';
    }

    // موجودی متیک
    const maticEl = document.getElementById('profile-matic');
    if (maticEl) maticEl.textContent = profile.maticBalance ? (Number(profile.maticBalance).toFixed(2) + ' MATIC') : '0 MATIC';
    // موجودی IAM
    const IAMEl = document.getElementById('profile-lvl');
    if (IAMEl) IAMEl.textContent = profile.lvlBalance ? profile.lvlBalance : '0'; // حذف پسوند IAM
    // نمایش ارزش دلاری IAM و POL
    const maticUsdEl = document.getElementById('profile-matic-usd');
    if (maticUsdEl) maticUsdEl.textContent = profile.polValueUSD ? formatNumber(profile.polValueUSD, 2) + ' $' : '0 $';
    const IAMUsdEl = document.getElementById('profile-lvl-usd');
    if (IAMUsdEl) IAMUsdEl.textContent = profile.lvlValueUSD ? formatNumber(profile.lvlValueUSD, 2) + ' $' : '0 $';
    // تعداد پوینت
    const pointsEl = document.getElementById('profile-total-points');
    if (pointsEl) pointsEl.textContent = profile.userStruct.binaryPoints ? formatNumber(profile.userStruct.binaryPoints, 0) : '۰';
    // تعداد پوینت‌های دریافت‌نشده
    const unclaimedPointsEl = document.getElementById('profile-unclaimed-points');
    if (unclaimedPointsEl) {
        const total = Number(profile.userStruct.binaryPoints || 0);
        const claimed = Number(profile.userStruct.binaryPointsClaimed || 0);
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
      if (idx === 0) {
        referrer = address; // Only if index is 0
      } else {
        try {
          referrer = await contract.getReferrer(idx);
        } catch (e) {
          referrer = '-';
        }
      }
    } else {
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

// تابع انتقال مالکیت موقعیت (پروفایل)
window.transferProfileOwnership = async function(newOwnerAddress, statusElement) {
    const btn = document.getElementById('transfer-ownership-btn');
    if (btn) btn.disabled = true;
    if (statusElement) statusElement.textContent = '⏳ در حال انتقال مالکیت...';
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            if (statusElement) statusElement.textContent = '❌ اتصال کیف پول برقرار نیست. لطفاً ابتدا کیف پول خود را متصل کنید.';
            if (btn) btn.disabled = false;
            return;
        }
        const { contract } = window.contractConfig;
        if (!newOwnerAddress || !/^0x[a-fA-F0-9]{40}$/.test(newOwnerAddress)) {
            if (statusElement) statusElement.textContent = '❌ آدرس مقصد معتبر نیست. لطفاً یک آدرس ولت صحیح وارد کنید.';
            if (btn) btn.disabled = false;
            return;
        }
        // ارسال تراکنش انتقال مالکیت
        const tx = await contract.transferIndexOwnership(newOwnerAddress);
        if (statusElement) statusElement.textContent = '⏳ در انتظار تایید تراکنش در کیف پول شما...';
        await tx.wait();
        if (statusElement) statusElement.textContent = '✅ انتقال مالکیت با موفقیت انجام شد! حساب جدید اکنون مالک این موقعیت است.';
    } catch (error) {
        let msg = error && error.message ? error.message : error;
        if (error.code === 4001 || msg.includes('user denied')) {
            msg = '❌ تراکنش توسط کاربر لغو شد.';
        } else if (error.code === -32002 || msg.includes('Already processing')) {
            msg = '⏳ کیف پول شما در حال پردازش یک درخواست دیگر است. لطفاً چند لحظه صبر کنید و دوباره تلاش کنید.';
        } else if (error.code === 'NETWORK_ERROR' || msg.includes('network')) {
            msg = '❌ خطای شبکه! اتصال اینترنت یا شبکه بلاکچین را بررسی کنید.';
        } else if (msg.includes('insufficient funds')) {
            msg = '❌ موجودی کافی برای پرداخت کارمزد یا انتقال وجود ندارد.';
        } else if (msg.includes('invalid address')) {
            msg = '❌ آدرس مقصد نامعتبر است. لطفاً یک آدرس ولت صحیح وارد کنید.';
        } else if (msg.includes('not allowed') || msg.includes('only owner')) {
            msg = '❌ شما مجاز به انجام این عملیات نیستید. فقط مالک فعلی می‌تواند انتقال انجام دهد.';
        } else if (msg.includes('root position') || msg.includes('cannot transfer root')) {
            msg = '❌ موقعیت ریشه قابل انتقال نیست.';
        } else if (msg.includes('New owner has existing index')) {
            msg = '❌ آدرس مقصد قبلاً یک موقعیت فعال دارد و نمی‌تواند مالکیت جدید دریافت کند.';
        } else {
            msg = '❌ خطا در انتقال مالکیت: ' + msg;
        }
        if (statusElement) statusElement.textContent = msg;
    } finally {
        if (btn) btn.disabled = false;
    }
};

// اطمینان از وجود window.checkConnection برای پروفایل
if (!window.checkConnection) {
  window.checkConnection = async function() {
    try {
      if (window.contractConfig && window.contractConfig.contract && window.contractConfig.address) {
        return { connected: true, address: window.contractConfig.address };
      }
      // تلاش برای اتصال
      if (window.connectWallet) {
        const result = await window.connectWallet();
        if (result && result.address) {
          return { connected: true, address: result.address };
        }
      }
      return { connected: false };
    } catch (e) {
      return { connected: false, error: e.message };
    }
  };
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
                let msg = e && e.message ? e.message : e;
                if (e.code === 4001 || (msg && msg.includes('user denied'))) {
                    msg = '❌ تراکنش توسط کاربر لغو شد.';
                } else if (e.code === -32002 || (msg && msg.includes('Already processing'))) {
                    msg = '⏳ متامسک در حال پردازش درخواست قبلی است. لطفاً چند لحظه صبر کنید.';
                } else if (e.code === 'NETWORK_ERROR' || (msg && msg.includes('network'))) {
                    msg = '❌ خطای شبکه! اتصال اینترنت یا شبکه بلاکچین را بررسی کنید.';
                } else if (msg && msg.includes('insufficient funds')) {
                    msg = 'موجودی کافی برای پرداخت کارمزد یا برداشت وجود ندارد.';
                } else if (msg && msg.includes('Cooldown not finished')) {
                    msg = '⏳ هنوز زمان برداشت بعدی فرا نرسیده است. لطفاً تا پایان شمارش معکوس صبر کنید.';
                } else if (msg && msg.includes('execution reverted')) {
                    msg = 'تراکنش ناموفق بود. شرایط برداشت را بررسی کنید.';
                } else {
                    msg = '❌ خطا در برداشت: ' + (msg || 'خطای ناشناخته');
                }
                claimStatus.textContent = msg;
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
                if (e.code === 4001 || (msg && msg.includes('user denied'))) {
                    msg = '❌ تراکنش توسط کاربر لغو شد.';
                } else if (e.code === -32002 || (msg && msg.includes('Already processing'))) {
                    msg = '⏳ متامسک در حال پردازش درخواست قبلی است. لطفاً چند لحظه صبر کنید.';
                } else if (e.code === 'NETWORK_ERROR' || (msg && msg.includes('network'))) {
                    msg = '❌ خطای شبکه! اتصال اینترنت یا شبکه بلاکچین را بررسی کنید.';
                } else if (msg && msg.includes('insufficient funds')) {
                    msg = 'موجودی کافی برای پرداخت کارمزد یا برداشت وجود ندارد.';
                } else if (msg && msg.includes('Cooldown not finished')) {
                    msg = '⏳ هنوز زمان برداشت بعدی فرا نرسیده است. لطفاً تا پایان شمارش معکوس صبر کنید.';
                } else if (msg && msg.includes('execution reverted')) {
                    msg = 'تراکنش ناموفق بود. شرایط برداشت را بررسی کنید.';
                } else if (msg && msg.includes('No cashback available')) {
                    msg = 'شما در حال حاضر پاداش ماهانه‌ای برای برداشت ندارید.\n\nتوضیح: پاداش ماهانه فقط زمانی قابل برداشت است که مقدار کافی از فعالیت یا خرید ماهانه داشته باشید و هنوز آن را دریافت نکرده باشید.';
                } else {
                    msg = '❌ خطا در برداشت ماهانه: ' + (msg || 'خطای ناشناخته');
                }
                claimMonthlyStatus.textContent = msg;
                claimMonthlyStatus.className = 'profile-status error';
            }
            claimMonthlyBtn.disabled = false;
        };
    }

    // اتصال فرم انتقال مالکیت به تابع انتقال
    const btn = document.getElementById('transfer-ownership-btn');
    const input = document.getElementById('transfer-ownership-address');
    const status = document.getElementById('transfer-ownership-status');
    if (btn && input && status) {
        btn.onclick = function() {
            window.transferProfileOwnership(input.value.trim(), status);
        };
    }

    // حذف آدرس قرارداد از پروفایل (اگر وجود داشته باشد)
    const existingContractEl = document.getElementById('profile-contract-address');
    if (existingContractEl) {
        existingContractEl.remove();
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

// تابع محاسبه تعداد ولت‌های سمت راست و چپ
async function calculateWalletCounts(userIndex, contract) {
    try {
        console.log(`🔍 محاسبه تعداد ولت‌ها برای ایندکس ${userIndex}...`);
        
        let leftCount = 0;
        let rightCount = 0;
        
        // بررسی فرزندان مستقیم
        const leftChildIndex = BigInt(userIndex) * 2n;
        const rightChildIndex = BigInt(userIndex) * 2n + 1n;
        
        // بررسی فرزند چپ
        try {
            const leftAddress = await contract.indexToAddress(leftChildIndex);
            if (leftAddress && leftAddress !== '0x0000000000000000000000000000000000000000') {
                const leftUser = await contract.users(leftAddress);
                if (leftUser && leftUser.activated) {
                    leftCount = 1;
                    // محاسبه بازگشتی برای فرزندان فرزند چپ
                    leftCount += await calculateSubtreeCount(leftChildIndex, contract, 'left');
                }
            }
        } catch (e) {
            console.log(`خطا در بررسی فرزند چپ:`, e);
        }
        
        // بررسی فرزند راست
        try {
            const rightAddress = await contract.indexToAddress(rightChildIndex);
            if (rightAddress && rightAddress !== '0x0000000000000000000000000000000000000000') {
                const rightUser = await contract.users(rightAddress);
                if (rightUser && rightUser.activated) {
                    rightCount = 1;
                    // محاسبه بازگشتی برای فرزندان فرزند راست
                    rightCount += await calculateSubtreeCount(rightChildIndex, contract, 'right');
                }
            }
        } catch (e) {
            console.log(`خطا در بررسی فرزند راست:`, e);
        }
        
        console.log(`✅ تعداد ولت‌ها: چپ=${leftCount}, راست=${rightCount}`);
        return { leftCount, rightCount };
        
    } catch (error) {
        console.error(`خطا در محاسبه تعداد ولت‌ها:`, error);
        return { leftCount: 0, rightCount: 0 };
    }
}

// تابع محاسبه بازگشتی تعداد ولت‌ها در زیرمجموعه
async function calculateSubtreeCount(parentIndex, contract, side) {
    let count = 0;
    // const maxDepth = 10; // حذف محدودیت عمق
    async function countRecursive(index) {
        const leftChildIndex = BigInt(index) * 2n;
        const rightChildIndex = BigInt(index) * 2n + 1n;
        let subtreeCount = 0;
        // بررسی فرزند چپ
        try {
            const leftAddress = await contract.indexToAddress(leftChildIndex);
            if (leftAddress && leftAddress !== '0x0000000000000000000000000000000000000000') {
                const leftUser = await contract.users(leftAddress);
                if (leftUser && leftUser.activated) {
                    subtreeCount += 1;
                    subtreeCount += await countRecursive(leftChildIndex);
                }
            }
        } catch (e) {
            // نادیده گرفتن خطاها
        }
        // بررسی فرزند راست
        try {
            const rightAddress = await contract.indexToAddress(rightChildIndex);
            if (rightAddress && rightAddress !== '0x0000000000000000000000000000000000000000') {
                const rightUser = await contract.users(rightAddress);
                if (rightUser && rightUser.activated) {
                    subtreeCount += 1;
                    subtreeCount += await countRecursive(rightChildIndex);
                }
            }
        } catch (e) {
            // نادیده گرفتن خطاها
        }
        return subtreeCount;
    }
    return await countRecursive(parentIndex);
}

// تابع به‌روزرسانی نمایش تعداد ولت‌ها در پروفایل
async function updateWalletCountsDisplay() {
    try {
        if (!window.connectWallet) return;
        
        const { contract, address } = await window.connectWallet();
        if (!contract || !address) return;
        
        const user = await contract.users(address);
        if (!user || !user.activated || !user.index) return;
        
        const userIndex = parseInt(user.index);
        const counts = await calculateWalletCounts(userIndex, contract);
        
        // به‌روزرسانی نمایش در پروفایل
        const leftCountEl = document.getElementById('profile-left-wallets');
        const rightCountEl = document.getElementById('profile-right-wallets');
        
        if (leftCountEl) {
            leftCountEl.textContent = counts.leftCount;
            leftCountEl.style.color = counts.leftCount > 0 ? '#00ff88' : '#666';
        }
        
        if (rightCountEl) {
            rightCountEl.textContent = counts.rightCount;
            rightCountEl.style.color = counts.rightCount > 0 ? '#00ff88' : '#666';
        }
        
        console.log(`✅ نمایش تعداد ولت‌ها به‌روزرسانی شد: چپ=${counts.leftCount}, راست=${counts.rightCount}`);
        
    } catch (error) {
        console.error(`خطا در به‌روزرسانی نمایش تعداد ولت‌ها:`, error);
    }
}

// اضافه کردن توابع به window برای دسترسی جهانی
window.calculateWalletCounts = calculateWalletCounts;
window.updateWalletCountsDisplay = updateWalletCountsDisplay;