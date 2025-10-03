// Profile Module - فقط توابع مخصوص پروفایل

// No caching - always fetch live data
async function loadUserProfileOnce() {
    return await window.getUserProfile();
}

// تابع انتظار برای اتصال کیف پول
async function waitForWalletConnection() {
    let attempts = 0;
    const maxAttempts = 3; // کاهش به 3 ثانیه برای جلوگیری از قفل شدن صفحه
    
    while (attempts < maxAttempts) {
        try {
            const result = await window.checkConnection();
            if (result.connected) {
                return result;
            }
        } catch (error) {
        }
        
        await new Promise(resolve => setTimeout(resolve, 500)); // کاهش زمان انتظار
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
        const isActive = !!(profile.userStruct && profile.userStruct.index && BigInt(profile.userStruct.index) > 0n);
        if (profile.address && isActive) {
            const fullLink = window.location.origin + '/register.html?ref=' + profile.address;
            linkEl.href = fullLink;
            linkEl.textContent = fullLink;
            linkEl.style.pointerEvents = 'auto';
            linkEl.style.opacity = '1';
        } else {
            linkEl.href = '#';
            linkEl.textContent = isActive ? 'لینک دعوت در دسترس نیست' : 'برای دریافت لینک، اکانت را فعال کنید';
            linkEl.style.pointerEvents = 'none';
            linkEl.style.opacity = '0.6';
        }
    }

    const copyBtn = document.getElementById('copyProfileReferral');
    if (copyBtn) {
        copyBtn.onclick = async () => {
            try {
                if (profile.address) {
                    const isActive = !!(profile.userStruct && profile.userStruct.index && BigInt(profile.userStruct.index) > 0n);
                    if (!isActive) { throw new Error('اکانت شما هنوز فعال نشده است'); }
                    const fullLink = window.location.origin + '/register.html?ref=' + profile.address;
                    
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

    // Helper for scientific/compact display (3 significant digits)
    function formatScientificDisplay(value) {
        const n = Number(value);
        if (!isFinite(n) || n === 0) return '0';
        const abs = Math.abs(n);
        if (abs >= 1e6 || abs < 1e-2) {
            return n.toExponential(2).replace('e', 'E');
        }
        return Number(n.toPrecision(3)).toString();
    }

    const purchasedKindEl = document.getElementById('profile-purchased-kind');
    const purchasedKindUsdEl = document.getElementById('profile-purchased-kind-usd');
    if (purchasedKindEl) {
        const rawValue = Number(profile.userStruct.totalPurchasedKind || 0) / 1e18;
        purchasedKindEl.textContent = formatScientificDisplay(rawValue) + ' IAM';
        if (purchasedKindUsdEl) {
            purchasedKindUsdEl.textContent = '≈ $--';
            try {
                if (window.contractConfig && window.contractConfig.contract && typeof window.contractConfig.contract.getTokenPrice === 'function') {
                    window.contractConfig.contract.getTokenPrice().then((tpRaw) => {
                        const tokenPrice = Number(ethers.formatUnits(tpRaw, 18));
                        const usdValue = rawValue * tokenPrice;
                        purchasedKindUsdEl.textContent = '≈ $' + Number(usdValue.toPrecision(3)).toString();
                    }).catch(() => {});
                }
            } catch (_) {}
        }
    }

    const refclimedEl = document.getElementById('profile-refclimed');
    if (refclimedEl) {
        const refVal = Number(profile.userStruct.refclimed || 0) / 1e18;
        refclimedEl.textContent = formatScientificDisplay(refVal) + ' IAM';
    }

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
    
    // مدیریت وضعیت دکمه پاداش ماهانه: فعال اگر حداقل یکی از فرزندان خالی باشد
    const claimMonthlyBtn = document.getElementById('monthly-cashback-btn');
    if (claimMonthlyBtn) {
        const leftPoints = Number(profile.userStruct.leftPoints || 0);
        const rightPoints = Number(profile.userStruct.rightPoints || 0);
        const atLeastOneEmpty = (leftPoints === 0) || (rightPoints === 0);

        if (atLeastOneEmpty) {
            // نمایش و فعال‌سازی دکمه وقتی حداقل یکی خالی است
            claimMonthlyBtn.style.display = 'block';
            claimMonthlyBtn.disabled = false;
            claimMonthlyBtn.style.opacity = '1';
            claimMonthlyBtn.style.cursor = 'pointer';
        } else {
            // عدم نمایش وقتی هر دو پر هستند
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
                console.log('🔄 Copy button clicked');
                
                // First try to get the link from the displayed element
                const linkElement = document.getElementById('profile-referral-link');
                if (linkElement && linkElement.textContent) {
                    const referralLink = linkElement.textContent;
                    console.log('📋 Copying link from element:', referralLink);
                    
                    // تلاش برای کپی کردن
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(referralLink);
                        newCopyBtn.textContent = 'کپی شد!';
                        setTimeout(() => newCopyBtn.textContent = 'Copy', 1500);
                        return;
                    } else {
                        // روش جایگزین برای مرورگرهای قدیمی
                        const textArea = document.createElement('textarea');
                        textArea.value = referralLink;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        newCopyBtn.textContent = 'کپی شد!';
                        setTimeout(() => newCopyBtn.textContent = 'Copy', 1500);
                        return;
                    }
                }
                
                // Fallback: generate link from wallet connection
                const { address } = await window.connectWallet();
                if (!address) {
                    throw new Error('آدرس کیف پول در دسترس نیست');
                }
                
                // Get user profile to get index
                const profile = await loadUserProfileOnce();
                const isActive = !!(profile && profile.userStruct && profile.userStruct.index && BigInt(profile.userStruct.index) > 0n);
                if (!isActive) { throw new Error('اکانت شما هنوز فعال نشده است'); }
                const referralLink = `${window.location.origin}/register.html?ref=${address}`;
                
                console.log('📋 Generated link:', referralLink);
                
                // تلاش برای کپی کردن
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(referralLink);
                    newCopyBtn.textContent = 'کپی شد!';
                    setTimeout(() => newCopyBtn.textContent = 'Copy', 1500);
                } else {
                    // روش جایگزین برای مرورگرهای قدیمی
                    const textArea = document.createElement('textarea');
                    textArea.value = referralLink;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    newCopyBtn.textContent = 'کپی شد!';
                    setTimeout(() => newCopyBtn.textContent = 'Copy', 1500);
                }
            } catch (error) {
                console.error('❌ Copy error:', error);
                newCopyBtn.textContent = 'خطا در کپی';
                setTimeout(() => newCopyBtn.textContent = 'Copy', 1500);
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
    // Setup copy button for referral link
    const copyBtn = document.getElementById('copyProfileReferral');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            try {
                console.log('🔄 Copy button clicked (DOMContentLoaded)');
                
                const linkElement = document.getElementById('profile-referral-link');
                if (linkElement && linkElement.textContent) {
                    const referralLink = linkElement.textContent;
                    console.log('📋 Copying link:', referralLink);
                    
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(referralLink);
                        copyBtn.textContent = 'کپی شد!';
                        setTimeout(() => copyBtn.textContent = 'Copy', 1500);
                    } else {
                        const textArea = document.createElement('textarea');
                        textArea.value = referralLink;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        copyBtn.textContent = 'کپی شد!';
                        setTimeout(() => copyBtn.textContent = 'Copy', 1500);
                    }
                } else {
                    copyBtn.textContent = 'خطا: لینک یافت نشد';
                    setTimeout(() => copyBtn.textContent = 'Copy', 1500);
                }
            } catch (error) {
                console.error('❌ Copy error:', error);
                copyBtn.textContent = 'خطا در کپی';
                setTimeout(() => copyBtn.textContent = 'Copy', 1500);
            }
        });
    }
    
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
    const claimMonthlyBtn = document.getElementById('monthly-cashback-btn');
    const claimMonthlyStatus = document.getElementById('monthly-cashback-msg');
    if (claimMonthlyBtn && claimMonthlyStatus) {
        claimMonthlyBtn.onclick = async function() {
            claimMonthlyBtn.disabled = true;
            claimMonthlyStatus.style.display = 'block';
            claimMonthlyStatus.textContent = 'در حال برداشت پاداش ماهانه...';
            claimMonthlyStatus.className = 'profile-status loading';
            try {
                const result = await window.claimMonthlyReward();
                claimMonthlyStatus.style.display = 'block';
                claimMonthlyStatus.textContent = 'برداشت ماهانه با موفقیت انجام شد!\nکد تراکنش: ' + result.transactionHash;
                claimMonthlyStatus.className = 'profile-status success';
                // پیام را مدت بیشتری نگه داریم و سپس (اختیاری) رفرش کنیم
                // setTimeout(() => location.reload(), 5000);
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
                claimMonthlyStatus.style.display = 'block';
                claimMonthlyStatus.textContent = msg;
                claimMonthlyStatus.className = 'profile-status error';
            }
            // اجازه می‌دهیم کاربر پیام را ببیند؛ دکمه پس از چند ثانیه دوباره فعال شود
            setTimeout(() => { claimMonthlyBtn.disabled = false; }, 4000);
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

// Upgrade cap with purchaseEBAConfig (English messages)
async function purchaseEBAConfig(amount) {
    try {
        console.log('🔄 Starting upgrade cap with amount:', amount);
        
        if (!window.connectWallet) {
            throw new Error('Wallet connection is not active');
        }
        
        const { contract, address } = await window.connectWallet();
        
        if (!contract || !address) {
            throw new Error('Wallet connection failed');
        }
        
        // Ensure user is registered
        const user = await contract.users(address);
        if (!user || !user.index || BigInt(user.index) === 0n) {
            throw new Error('You must register first');
        }
        
        // Convert amount to wei
        const amountInWei = ethers.parseUnits(amount.toString(), 18);
        
        // Check user balance
        const userBalance = await contract.balanceOf(address);
        if (userBalance < amountInWei) {
            throw new Error('Insufficient IAM balance for upgrade');
        }
        
        // Let the contract decide all upgrade conditions
        // The contract will check:
        // - totalPurchasedKind >= uptopoint
        // - upgradeTime + 4 weeks <= block.timestamp
        // - payout between 30-100%
        // - amount > 0
        
        console.log('⏳ Submitting upgrade transaction...');
        
        // Send transaction - using payout=100 and contract as seller for upgrades
        const contractAddress = contract.target || contract.address;
        const tx = await contract.purchase(amountInWei, 100, contractAddress);
        
        console.log('⏳ Waiting for transaction confirmation...');
        await tx.wait();
        
        console.log('✅ Upgrade cap completed successfully');
        
        return {
            success: true,
            transactionHash: tx.hash,
            message: 'Upgrade cap completed successfully!'
        };
        
    } catch (error) {
        console.error('❌ Upgrade cap error:', error);
        
        let errorMessage = 'Upgrade cap error';
        
        if (error.code === 4001) {
            errorMessage = 'Transaction cancelled by user';
        } else if (error.message && error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient IAM balance for upgrade';
        } else if (error.message && error.message.includes('user denied')) {
            errorMessage = 'Transaction rejected by user';
        } else if (error.message && error.message.includes('network')) {
            errorMessage = 'Network error - please check your internet or blockchain network';
        } else if (error.message && error.message.includes('execution reverted')) {
            // Contract will handle all validation - show generic message
            errorMessage = 'Transaction failed - contract validation failed. Check if you meet upgrade conditions.';
        } else if (error.message && error.message.includes('not registered')) {
            errorMessage = 'You must register first';
        } else if (error.message && error.message.includes('Amount must be greater than 0')) {
            errorMessage = 'Amount must be greater than 0';
        } else if (error.message && error.message.includes('Invalid payout percent')) {
            errorMessage = 'Invalid payout percent (must be between 30 and 100)';
        } else {
            errorMessage = error.message || 'Unknown upgrade cap error';
        }
        
        throw new Error(errorMessage);
    }
}

// تابع راه‌اندازی دکمه ارتقاع سقف
function setupUpgradeCapButton(user, contract, address) {
    console.log('🔧 Setting up upgrade cap button...');
    
    const upgradeBtn = document.getElementById('upgrade-cap-btn');
    const modal = document.getElementById('upgrade-cap-modal');
    const amountInput = document.getElementById('upgrade-cap-amount');
    const amountUsdEl = document.getElementById('upgrade-cap-amount-usd');
    const balanceEl = document.getElementById('upgrade-cap-balance');
    const currentCapEl = document.getElementById('upgrade-cap-current');
    const confirmBtn = document.getElementById('upgrade-cap-confirm');
    const cancelBtn = document.getElementById('upgrade-cap-cancel');
    const statusEl = document.getElementById('upgrade-cap-status');
    
    console.log('🔍 Elements found:', {
        upgradeBtn: !!upgradeBtn,
        modal: !!modal,
        amountInput: !!amountInput,
        confirmBtn: !!confirmBtn,
        cancelBtn: !!cancelBtn
    });
    
    if (!upgradeBtn || !modal) {
        console.error('❌ Required elements not found for upgrade cap button');
        return;
    }
    
    // نمایش مودال
    upgradeBtn.addEventListener('click', () => {
        console.log('🖱️ Upgrade cap button clicked!');
        
        // Check if button is disabled (timer is active)
        if (upgradeBtn.disabled) {
            console.log('❌ Upgrade cap button is disabled - timer is active');
            return;
        }
        
        modal.style.display = 'block';
        loadUpgradeCapData();
    });
    
    // بستن مودال
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        statusEl.textContent = '';
    });
    
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
            if (amountUsdEl) updateAmountUsdPreview();
            
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
            
            // محاسبه تعداد پوینت‌های قابل خرید
            const totalPurchased = Number(user.totalPurchasedKind || 0) / 1e18;
            const uptopoint = regPriceNum / 3; // حداقل مقدار برای یک پوینت
            const availablePoints = Math.floor(totalPurchased / uptopoint);
            
            // حداکثر 2 پوینت در ماه
            const maxPointsThisMonth = Math.min(2, availablePoints);
            
            // به‌روزرسانی UI
            updateUpgradeUI({
                pointPrice,
                maxPointsThisMonth,
                totalPurchased,
                uptopoint
            });
            
        } catch (error) {
            console.error('Error calculating upgrade info:', error);
        }
    }
    
    // USD preview for entered IAM amount
    function updateAmountUsdPreview() {
        try {
            if (!amountUsdEl) return;
            const val = parseFloat(amountInput && amountInput.value ? amountInput.value : '');
            if (!val || val <= 0) { amountUsdEl.textContent = '≈ $0.00'; return; }
            if (typeof contract.getTokenPrice === 'function') {
                contract.getTokenPrice().then((tpRaw) => {
                    const price = Number(ethers.formatUnits(tpRaw, 18));
                    const usd = val * price;
                    amountUsdEl.textContent = '≈ $' + usd.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
                }).catch(() => { amountUsdEl.textContent = '≈ $—'; });
            }
        } catch (_) {}
    }
    if (amountInput && amountUsdEl) { amountInput.addEventListener('input', updateAmountUsdPreview); }
    
    // به‌روزرسانی UI ارتقاع
    function updateUpgradeUI(info) {
        // به‌روزرسانی محتوای مودال
        const modalContent = document.querySelector('#upgrade-cap-modal > div > div');
        if (modalContent) {
            // به‌روزرسانی متن‌های مودال
            const infoDiv = document.createElement('div');
            infoDiv.innerHTML = `
                <div style="margin-bottom:1rem;padding:1rem;background:rgba(255,107,51,0.1);border-radius:8px;border:1px solid #ff6b3333;">
                    <div style="color:#ff6b35;font-weight:bold;margin-bottom:0.5rem;">📊 Upgrade Info:</div>
                    <div style="color:#ccc;font-size:0.9em;line-height:1.4;">
                        <div>💰 Price per point: ${info.pointPrice.toFixed(6)} IAM</div>
                        <div>📈 Your total purchases: ${info.totalPurchased.toFixed(6)} IAM</div>
                        <div>🎯 Min for one point: ${info.uptopoint.toFixed(6)} IAM</div>
                        <div>⭐ Points available: ${info.maxPointsThisMonth}</div>
                        <div style="margin-top:0.5rem;color:#00ff88;font-weight:bold;">✅ Contract will automatically determine upgrade eligibility</div>
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
    
    // Confirm upgrade (force payout=100 and seller=contract)
    confirmBtn.addEventListener('click', async () => {
        console.log('🖱️ Confirm upgrade button clicked!');
        const amount = parseFloat(amountInput.value);
        
        if (!amount || amount <= 0) {
            statusEl.textContent = '❌ Please enter a valid amount';
            statusEl.style.color = '#ff4444';
            return;
        }
        
        try {
            confirmBtn.disabled = true;
            statusEl.textContent = '⏳ Upgrading cap...';
            statusEl.style.color = '#a786ff';
            
            // Call purchaseEBAConfig with amount only
            const result = await purchaseEBAConfig(amount);
            
            statusEl.textContent = '✅ Upgrade completed successfully!';
            statusEl.style.color = '#00ff88';
            
            // Close modal after 2 seconds
            setTimeout(() => {
                modal.style.display = 'none';
                statusEl.textContent = '';
                // Reload profile
                if (typeof loadProfile === 'function') {
                    loadProfile();
                }
            }, 2000);
            
        } catch (error) {
            statusEl.textContent = '❌ Error: ' + error.message;
            statusEl.style.color = '#ff4444';
        } finally {
            confirmBtn.disabled = false;
        }
    });
}

// اضافه کردن توابع به window برای دسترسی جهانی
window.calculateWalletCounts = calculateWalletCounts;
window.updateWalletCountsDisplay = updateWalletCountsDisplay;
window.purchaseEBAConfig = purchaseEBAConfig;
window.setupUpgradeCapButton = setupUpgradeCapButton;