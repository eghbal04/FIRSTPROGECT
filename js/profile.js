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
        // وضعیت ثبت‌نام بر اساس index > 0
        if (profile.userStruct && profile.userStruct.index && BigInt(profile.userStruct.index) > 0n) {
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
    return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
// Function to calculate left and right wallet counts using fastest binary tree traversal
async function calculateWalletCounts(userIndex, contract) {
    try {
        console.log(`🚀 Starting ultra-fast wallet count calculation for index ${userIndex}...`);
        
        // Get direct children indices
        const leftChildIndex = BigInt(userIndex) * 2n;
        const rightChildIndex = BigInt(userIndex) * 2n + 1n;
        
        // Use Promise.all for parallel execution with optimized counting
        const [leftResult, rightResult] = await Promise.all([
            countSubtreeUltraFast(leftChildIndex, contract),
            countSubtreeUltraFast(rightChildIndex, contract)
        ]);
        
        console.log(`✅ Ultra-fast wallet counts: Left=${leftResult}, Right=${rightResult}`);
        return { leftCount: leftResult, rightCount: rightResult };
        
    } catch (error) {
        console.error(`Error in ultra-fast wallet count calculation:`, error);
        return { leftCount: 0, rightCount: 0 };
    }
}

// Ultra-fast subtree counting using optimized depth-first traversal with early termination
async function countSubtreeUltraFast(startIndex, contract) {
    let count = 0;
    const stack = [startIndex];
    const maxDepth = 20; // Prevent infinite loops
    const processedIndices = new Set();
    
    while (stack.length > 0) {
        const currentIndex = stack.pop();
        const indexStr = currentIndex.toString();
        
        // Skip if already processed or too deep
        if (processedIndices.has(indexStr) || stack.length > maxDepth) continue;
        processedIndices.add(indexStr);
        
        try {
            // Direct index to address check - fastest method
            const address = await contract.indexToAddress(currentIndex);
            
            // Quick validation - if address exists and is not zero, count it
            if (address && address !== '0x0000000000000000000000000000000000000000') {
                count++;
                
                // Add children to stack for depth-first traversal (faster for binary trees)
                const leftChild = BigInt(currentIndex) * 2n;
                const rightChild = BigInt(currentIndex) * 2n + 1n;
                
                stack.push(rightChild); // Push right first (LIFO - left will be processed first)
                stack.push(leftChild);
            }
        } catch (e) {
            // Skip errors and continue - don't log to avoid spam
            continue;
        }
    }
    
    return count;
}

// Function to update wallet counts display in profile
async function updateWalletCountsDisplay() {
    try {
        if (!window.connectWallet) return;
        
        const { contract, address } = await window.connectWallet();
        if (!contract || !address) return;
        
        const user = await contract.users(address);
        if (!user || !(user.index && BigInt(user.index) > 0n)) return;
        
        const userIndex = parseInt(user.index);
        const counts = await calculateWalletCounts(userIndex, contract);
        
        // Update display in profile
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
        
        console.log(`✅ Wallet counts display updated: Left=${counts.leftCount}, Right=${counts.rightCount}`);
        
    } catch (error) {
        console.error(`Error updating wallet counts display:`, error);
    }
}

// تابع ارتقاع سقف با استفاده از purchaseEBAConfig
async function purchaseEBAConfig(amount, payout = 100, seller = '0x0000000000000000000000000000000000000000') {
    try {
        console.log('🔄 شروع ارتقاع سقف با مقدار:', amount, 'payout:', payout, 'seller:', seller);
        
        if (!window.connectWallet) {
            throw new Error('اتصال کیف پول فعال نیست');
        }
        
        const { contract, address } = await window.connectWallet();
        if (!contract || !address) {
            throw new Error('اتصال کیف پول برقرار نشد');
        }
        
        // بررسی اینکه کاربر ثبت‌نام شده باشد
        const user = await contract.users(address);
        if (!user || !user.index || BigInt(user.index) === 0n) {
            throw new Error('ابتدا باید ثبت‌نام کنید');
        }
        
        // تبدیل مقدار به wei
        const amountInWei = ethers.parseUnits(amount.toString(), 18);
        
        // بررسی موجودی کاربر
        const userBalance = await contract.balanceOf(address);
        if (userBalance < amountInWei) {
            throw new Error('موجودی کافی برای ارتقاع ندارید');
        }
        
        // اعتبارسنجی payout (باید بین 30 تا 100 باشد)
        if (payout <= 30 || payout > 100) {
            throw new Error('درصد payout باید بین 30 تا 100 باشد');
        }
        
        console.log('⏳ ارسال تراکنش ارتقاع سقف...');
        
        // انجام تراکنش ارتقاع با پارامترهای صحیح
        const tx = await contract.purchase(amountInWei, payout, seller);
        
        console.log('⏳ منتظر تایید تراکنش...');
        await tx.wait();
        
        console.log('✅ ارتقاع سقف با موفقیت انجام شد');
        
        return {
            success: true,
            transactionHash: tx.hash,
            message: 'ارتقاع سقف با موفقیت انجام شد!'
        };
        
    } catch (error) {
        console.error('❌ خطا در ارتقاع سقف:', error);
        
        let errorMessage = 'خطا در ارتقاع سقف';
        
        if (error.code === 4001) {
            errorMessage = 'تراکنش توسط کاربر لغو شد';
        } else if (error.message && error.message.includes('insufficient funds')) {
            errorMessage = 'موجودی کافی برای ارتقاع ندارید';
        } else if (error.message && error.message.includes('user denied')) {
            errorMessage = 'تراکنش توسط کاربر رد شد';
        } else if (error.message && error.message.includes('network')) {
            errorMessage = 'خطای شبکه - لطفاً اتصال اینترنت خود را بررسی کنید';
        } else if (error.message && error.message.includes('execution reverted')) {
            errorMessage = 'تراکنش ناموفق بود - شرایط ارتقاع را بررسی کنید';
        } else if (error.message && error.message.includes('not registered')) {
            errorMessage = 'ابتدا باید ثبت‌نام کنید';
        } else if (error.message && error.message.includes('Amount must be greater than 0')) {
            errorMessage = 'مقدار باید بیشتر از صفر باشد';
        } else if (error.message && error.message.includes('Invalid payout percent')) {
            errorMessage = 'درصد payout نامعتبر است (باید بین 30 تا 100 باشد)';
        } else {
            errorMessage = error.message || 'خطای نامشخص در ارتقاع سقف';
        }
        
        throw new Error(errorMessage);
    }
}

// تابع راه‌اندازی دکمه ارتقاع سقف
function setupUpgradeCapButton(user, contract, address) {
    const upgradeBtn = document.getElementById('upgrade-cap-btn');
    const modal = document.getElementById('upgrade-cap-modal');
    const amountInput = document.getElementById('upgrade-cap-amount');
    const balanceEl = document.getElementById('upgrade-cap-balance');
    const currentCapEl = document.getElementById('upgrade-cap-current');
    const confirmBtn = document.getElementById('upgrade-cap-confirm');
    const cancelBtn = document.getElementById('upgrade-cap-cancel');
    const statusEl = document.getElementById('upgrade-cap-status');
    
    if (!upgradeBtn || !modal) return;
    
    // نمایش مودال
    upgradeBtn.onclick = () => {
        modal.style.display = 'block';
        loadUpgradeCapData();
    };
    
    // بستن مودال
    cancelBtn.onclick = () => {
        modal.style.display = 'none';
        statusEl.textContent = '';
    };
    
    // بستن مودال با کلیک خارج از آن
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            statusEl.textContent = '';
        }
    };
    
    // بارگذاری اطلاعات ارتقاع
    async function loadUpgradeCapData() {
        try {
            const balance = await contract.balanceOf(address);
            const balanceFormatted = Number(ethers.formatUnits(balance, 18)).toFixed(6);
            balanceEl.textContent = balanceFormatted + ' IAM';
            
            const currentCap = user.binaryPointCap || 0;
            currentCapEl.textContent = currentCap.toString();
            
            // محاسبه اطلاعات ارتقاع طبق قرارداد
            await calculateUpgradeInfo();
            
        } catch (error) {
            console.error('خطا در بارگذاری اطلاعات ارتقاع:', error);
            balanceEl.textContent = 'خطا در بارگذاری';
            currentCapEl.textContent = 'خطا در بارگذاری';
        }
    }
    
    // محاسبه اطلاعات ارتقاع طبق قرارداد
    async function calculateUpgradeInfo() {
        try {
            // دریافت قیمت ثبت‌نام
            const regPrice = await contract.getRegPrice();
            const regPriceNum = Number(ethers.formatUnits(regPrice, 18));
            
            // محاسبه قیمت هر پوینت (یک سوم قیمت ثبت‌نام)
            const pointPrice = regPriceNum / 3;
            
            // بررسی زمان آخرین ارتقاع
            const lastUpgradeTime = Number(user.upgradeTime || 0);
            const now = Math.floor(Date.now() / 1000);
            const fourWeeks = 4 * 7 * 24 * 3600; // 4 هفته
            const timeSinceUpgrade = now - lastUpgradeTime;
            
            // بررسی اینکه آیا می‌تواند ارتقاع کند
            const canUpgrade = timeSinceUpgrade >= fourWeeks;
            
            // محاسبه تعداد پوینت‌های قابل خرید
            const totalPurchased = Number(user.totalPurchasedKind || 0) / 1e18;
            const uptopoint = regPriceNum / 3; // حداقل مقدار برای یک پوینت
            const availablePoints = Math.floor(totalPurchased / uptopoint);
            
            // حداکثر 2 پوینت در ماه
            const maxPointsThisMonth = Math.min(2, availablePoints);
            
            // به‌روزرسانی UI
            updateUpgradeUI({
                canUpgrade,
                timeSinceUpgrade,
                fourWeeks,
                pointPrice,
                maxPointsThisMonth,
                totalPurchased,
                uptopoint
            });
            
        } catch (error) {
            console.error('خطا در محاسبه اطلاعات ارتقاع:', error);
        }
    }
    
    // به‌روزرسانی UI ارتقاع
    function updateUpgradeUI(info) {
        // به‌روزرسانی محتوای مودال
        const modalContent = document.querySelector('#upgrade-cap-modal > div > div');
        if (modalContent) {
            const timeLeft = info.fourWeeks - info.timeSinceUpgrade;
            const daysLeft = Math.floor(timeLeft / (24 * 3600));
            const hoursLeft = Math.floor((timeLeft % (24 * 3600)) / 3600);
            
            let statusText = '';
            if (info.canUpgrade) {
                statusText = `✅ آماده برای ارتقاع! (${info.maxPointsThisMonth} پوینت قابل خرید)`;
            } else {
                statusText = `⏳ ${daysLeft} روز و ${hoursLeft} ساعت تا ارتقاع بعدی`;
            }
            
            // به‌روزرسانی متن‌های مودال
            const infoDiv = document.createElement('div');
            infoDiv.innerHTML = `
                <div style="margin-bottom:1rem;padding:1rem;background:rgba(255,107,51,0.1);border-radius:8px;border:1px solid #ff6b3333;">
                    <div style="color:#ff6b35;font-weight:bold;margin-bottom:0.5rem;">📊 اطلاعات ارتقاع:</div>
                    <div style="color:#ccc;font-size:0.9em;line-height:1.4;">
                        <div>💰 قیمت هر پوینت: ${info.pointPrice.toFixed(6)} IAM</div>
                        <div>📈 کل خریدهای شما: ${info.totalPurchased.toFixed(6)} IAM</div>
                        <div>🎯 حداقل برای یک پوینت: ${info.uptopoint.toFixed(6)} IAM</div>
                        <div>⭐ پوینت‌های قابل خرید: ${info.maxPointsThisMonth}</div>
                        <div style="margin-top:0.5rem;color:#00ff88;font-weight:bold;">${statusText}</div>
                    </div>
                </div>
            `;
            
            // جایگزینی یا اضافه کردن اطلاعات
            const existingInfo = modalContent.querySelector('.upgrade-info');
            if (existingInfo) {
                existingInfo.remove();
            }
            infoDiv.className = 'upgrade-info';
            modalContent.insertBefore(infoDiv, modalContent.firstChild);
        }
    }
    
    // تایید ارتقاع
    confirmBtn.onclick = async () => {
        const amount = parseFloat(amountInput.value);
        
        if (!amount || amount <= 0) {
            statusEl.textContent = '❌ لطفاً مقدار معتبری وارد کنید';
            statusEl.style.color = '#ff4444';
            return;
        }
        
        try {
            confirmBtn.disabled = true;
            statusEl.textContent = '⏳ در حال ارتقاع سقف...';
            statusEl.style.color = '#a786ff';
            
            // فراخوانی تابع ارتقاع با payout = 100
            const result = await purchaseEBAConfig(amount, 100);
            
            statusEl.textContent = '✅ ارتقاع سقف با موفقیت انجام شد!';
            statusEl.style.color = '#00ff88';
            
            // بستن مودال بعد از 2 ثانیه
            setTimeout(() => {
                modal.style.display = 'none';
                statusEl.textContent = '';
                // بارگذاری مجدد پروفایل
                if (typeof loadProfile === 'function') {
                    loadProfile();
                }
            }, 2000);
            
        } catch (error) {
            statusEl.textContent = '❌ خطا: ' + error.message;
            statusEl.style.color = '#ff4444';
        } finally {
            confirmBtn.disabled = false;
        }
    };
}

// اضافه کردن توابع به window برای دسترسی جهانی
window.calculateWalletCounts = calculateWalletCounts;
window.updateWalletCountsDisplay = updateWalletCountsDisplay;
window.purchaseEBAConfig = purchaseEBAConfig;
window.setupUpgradeCapButton = setupUpgradeCapButton;