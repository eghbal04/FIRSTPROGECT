// js/app.js - نسخه کامل‌شده با چارت

// --- متغیرهای global ---
let userAddress = null;
let userData = null;
let tokenPrice = 0;
let maticBalance = 0;
let tokenBalance = 0;
let isConnecting = false;
let chart;
let chartDataHistory = [];
let chartRange = '1d';

// --- آغاز اجرا ---
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
    initializeChart();
    setupEventListeners();

    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await setupWallet(accounts[0]);
            }
        } catch (error) {
            console.error("خطا در بررسی حساب‌های متصل:", error);
        }
    }
});

async function initializeApp() {
  try {
    if (!window.ethereum) {
      showPersistentAlert('کیف پول Web3 یافت نشد. لطفا MetaMask یا کیف پول مشابه نصب کنید.', 'warning');
      return;
    }

    await window.contractConfig.initializeWeb3();
    const { provider: p, signer: s, contract: c } = window.contractConfig;
    window.provider = p;
    window.signer = s;
    window.contract = c;

    console.log('اپلیکیشن با موفقیت راه‌اندازی شد');
  } catch (error) {
    console.error('خطا در راه‌اندازی اپلیکیشن:', error);
    showPersistentAlert('خطا در راه‌اندازی اپلیکیشن: ' + error.message, 'error');
  }
}

// --- مقداردهی چارت ---

function initializeChart() {
    const ctx = document.getElementById("priceChart")?.getContext("2d");
    if (!ctx) {
        console.warn("عنصر priceChart یافت نشد");
        return;
    }
    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Token Price (USD)",
                    data: [],
                    borderColor: "rgba(75,192,192,1)",
                    fill: false,
                },
                {
                    label: "MATIC Price (USD)",
                    data: [],
                    borderColor: "rgba(255,99,132,1)",
                    fill: false,
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: { display: true, text: "زمان (HH:MM:SS)" }
                },
                y: {
                    display: true,
                    title: { display: true, text: "قیمت (USD)" }
                }
            }
        }
    });

    // کنترل بازه زمانی
    const rangeSelect = document.getElementById('chart-range');
    if (rangeSelect) {
        rangeSelect.addEventListener('change', (e) => {
            chartRange = e.target.value;
            updateChartRange();
        });
    }
}

function updateChartRange() {
    // فیلتر داده‌ها بر اساس بازه انتخابی
    let filtered = [];
    const now = Date.now();
    if (chartRange === '1d') {
        filtered = chartDataHistory.filter(d => now - d.ts <= 24*60*60*1000);
    } else if (chartRange === '7d') {
        filtered = chartDataHistory.filter(d => now - d.ts <= 7*24*60*60*1000);
    } else if (chartRange === '30d') {
        filtered = chartDataHistory.filter(d => now - d.ts <= 30*24*60*60*1000);
    } else {
        filtered = chartDataHistory;
    }
    chart.data.labels = filtered.map(d => d.label);
    chart.data.datasets[0].data = filtered.map(d => d.token);
    chart.data.datasets[1].data = filtered.map(d => d.matic);
    chart.update();
}

// --- رویداد اتصال کیف پول ---
document.addEventListener('walletConnected', () => {
    if (!chart || !contract) {
        console.warn("📉 چارت یا قرارداد هنوز آماده نیست!");
        return;
    }
    fetchPrices();
    setInterval(fetchPrices, 5000);
});

// --- تابع fetchPrices ---
async function fetchPrices() {
    if (!chart) {
        console.warn("⛔️ chart هنوز تعریف نشده.");
        return;
    }

    try {
        const [maticRaw, tokenRaw] = await Promise.all([
            contract.getLatestMaticPrice(),
            contract.getLatestLvlPrice()
        ]);

        const matic = Number(maticRaw) / 1e8;
        const token = Number(tokenRaw) / 1e8;
        const now = new Date();
        const label = now.toLocaleTimeString();
        chartDataHistory.push({
            ts: now.getTime(),
            label,
            token,
            matic
        });
        // فقط 1000 داده آخر را نگه دار
        if (chartDataHistory.length > 1000) chartDataHistory.shift();
        updateChartRange();
    } catch (e) {
        console.error("⚠️ خطا در دریافت قیمت:", e);
    }
}



// تنظیم event listeners
function setupEventListeners() {
    // اتصال کیف پول
    const connectWalletBtn = document.getElementById('connect-wallet');
    if (connectWalletBtn) connectWalletBtn.addEventListener('click', connectWallet);
    
    // بروزرسانی قیمت توکن (دکمه حذف شده است، پس این خط را حذف یا غیرفعال می‌کنیم)
    // const updatePriceBtn = document.getElementById('update-price');
    // if (updatePriceBtn) updatePriceBtn.addEventListener('click', updateTokenPrice);
    
    // ثبت نام و فعالسازی
    const registerActivateBtn = document.getElementById('register-activate');
    if (registerActivateBtn) registerActivateBtn.addEventListener('click', registerAndActivate);
    
    // دریافت پاداش باینری
    const claimBinaryBtn = document.getElementById('claim-binary');
    if (claimBinaryBtn) claimBinaryBtn.addEventListener('click', claimBinaryReward);
    
    // کپی آدرس کیف پول
    window.copyToClipboard = copyToClipboard;
    window.copyReferralLink = copyReferralLink;
    
    // Event listeners برای تغییرات شبکه و حساب
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('disconnect', handleDisconnect);
    }
}

// تابع اتصال کیف پول
async function connectWallet() {
    if (isConnecting) return;
    
    if (!window.ethereum) {
        showToast('لطفا یک کیف پول مانند MetaMask نصب کنید!', 'error');
        return;
    }
    
    isConnecting = true;
    updateConnectButton('در حال اتصال...');
    
    try {
        // درخواست اتصال
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // بررسی شبکه
        await window.contractConfig.switchToPolygon();
        
        // تنظیم کیف پول
        await setupWallet(accounts[0]);
        
        showToast('کیف پول با موفقیت متصل شد!', 'success');
        
    } catch (error) {
        console.error("خطا در اتصال کیف پول:", error);
        
        let errorMessage = 'خطا در اتصال کیف پول';
        if (error.code === 4001) {
            errorMessage = 'اتصال توسط کاربر لغو شد';
        } else if (error.code === -32002) {
            errorMessage = 'درخواست اتصال در انتظار تایید است';
        }
        
        showToast(errorMessage, 'error');
        resetWallet();
    } finally {
        isConnecting = false;
        updateConnectButton();
    }
}

// تنظیم کیف پول پس از اتصال
async function setupWallet(address) {
    try {
        userAddress = address;
        
        // بروزرسانی UI
        updateWalletUI();
        
        // بارگذاری داده‌ها
        await Promise.all([
            loadUserData(),
            loadTokenPrice(),
            loadBalances(),
            loadSystemStats()
        ]);
        
        // فعال کردن دکمه‌ها
        enableButtons();
        
        // ارسال event برای اطلاع سایر کامپوننت‌ها
        document.dispatchEvent(new CustomEvent('walletConnected', { detail: { address } }));
        
        // بروزرسانی وضعیت اتصال کیف پول
        updateWalletStatus(true);
        
    } catch (error) {
        console.error('خطا در تنظیم کیف پول:', error);
        showToast('خطا در بارگذاری اطلاعات کیف پول', 'error');
    }
}

// بروزرسانی UI کیف پول
function updateWalletUI() {
    // نمایش اطلاعات کاربر
    const walletAddressElem = document.getElementById('wallet-address');
    const userInfoElem = document.getElementById('user-info');
    if (walletAddressElem) walletAddressElem.value = userAddress;
    if (userInfoElem) userInfoElem.style.display = 'block';

    // حذف نمایش مستقیم پیغام اتصال در اینجا
    // فقط ایجاد لینک معرف
    const referralLinkElem = document.getElementById('referral-link');
    if (referralLinkElem)
        referralLinkElem.value = `${window.location.origin}${window.location.pathname}?ref=${userAddress}`;

    // نمایش لینک رفرال در لیست وضعیت حساب کاربری (در صورت وجود المنت)
    const referralListElem = document.getElementById('referral-link-list');
    if (referralListElem)
        referralListElem.value = `${window.location.origin}${window.location.pathname}?ref=${userAddress}`;

    // مقداردهی قیمت LVL (دلار) در لیست وضعیت حساب کاربری
    const tokenPriceUserboxElem = document.getElementById('token-price-userbox');
    if (tokenPriceUserboxElem) {
        // اگر مقدار lastTokenPrice معتبر نبود، مقدار را مستقیم از قرارداد بگیر
        if (typeof lastTokenPrice === 'number' && !isNaN(lastTokenPrice) && lastTokenPrice > 0) {
            // فقط نمایش عدد دلاری با تمام ارقام اعشار
            tokenPriceUserboxElem.value = lastTokenPrice.toString();
        } else {
            // مقدار را مستقیم از قرارداد بگیر (همزمان)
            contract.getLatestLvlPrice().then(priceRaw => {
                const price = Number(priceRaw) / 1e8;
                // فقط نمایش عدد دلاری با تمام ارقام اعشار
                tokenPriceUserboxElem.value = price > 0 ? price.toString() : '---';
            }).catch(() => {
                tokenPriceUserboxElem.value = '---';
            });
        }
    }

    updateConnectButton();

    // نمایش اطلاعات کاربر در user-info-list
    const userInfoList = document.getElementById('user-info-list');
    if (userInfoList) {
        userInfoList.innerHTML = `
            <li>آدرس کیف پول: <span class='en-num'>${userAddress || '-'}</span></li>
            <li>موجودی LVL: <span class='en-num'>${document.getElementById('token-balance')?.value || '-'}</span></li>
            <li>موجودی MATIC: <span class='en-num'>${document.getElementById('matic-balance')?.value || '-'}</span></li>
            <li>قیمت LVL (دلار): <span class='en-num'>${document.getElementById('token-price-userbox')?.value || '-'}</span></li>
            <li>لینک معرف: <span class='en-num'>${document.getElementById('referral-link')?.value || '-'}</span></li>
        `;
    }
    // نمایش اطلاعات شبکه در network-info-list
    const networkInfoList = document.getElementById('network-info-list');
    if (networkInfoList) {
        networkInfoList.innerHTML = `
            <li>کل کاربران: <span class='en-num'>${document.getElementById('total-holders')?.textContent || '-'}</span></li>
            <li>کل توکن در گردش: <span class='en-num'>${document.getElementById('circulating-supply')?.value || '-'}</span></li>
            <li>حجم معاملات: <span class='en-num'>${document.getElementById('total-volume')?.textContent || '-'}</span></li>
            <li>استخر باینری: <span class='en-num'>${document.getElementById('binary-pool-amount')?.textContent || '-'}</span></li>
        `;
    }
}

// بروزرسانی دکمه اتصال
function updateConnectButton(text = null) {
    const button = document.getElementById('connect-wallet');
    if (!button) return; // اگر دکمه وجود نداشت، هیچ کاری نکن

    if (text) {
        button.textContent = text;
        button.disabled = true;
    } else if (userAddress) {
        button.innerHTML = '<i class="bi bi-check-circle"></i> متصل شده';
        button.disabled = false;
        button.className = 'btn btn-success btn-lg';
    } else {
        button.innerHTML = '<i class="bi bi-wallet2"></i> اتصال کیف پول';
        button.disabled = false;
        button.className = 'btn btn-primary btn-lg';
    }
}

// بازنشانی کیف پول
function resetWallet() {
    userAddress = null;
    userData = null;
    document.getElementById('user-info').style.display = 'none';
    // حذف نمایش مستقیم پیغام قطع اتصال در اینجا
    updateConnectButton();
    disableButtons();
    clearUserData();
}

// بارگذاری داده‌های کاربر
async function loadUserData() {
    if (!userAddress || !contract) return;
    try {
        // دریافت اطلاعات کاربر از قرارداد
        userData = await contract.users(userAddress);

        // نمایش وضعیت فعالسازی
        updateActivationStatus();

        // نمایش معرف
        document.getElementById('my-referrer').value = 
            userData.referrer === ethers.constants.AddressZero ? 'ندارد' : userData.referrer;

        // نمایش اطلاعات باینری
        updateBinaryInfo();

        // مقدار خرید (purchase-amount) بر اساس مجموع amountLvl از رویدادهای purchase
        if (document.getElementById('purchase-amount')) {
            let purchased = 0;
            if (contract && contract.filters && contract.queryFilter && userAddress) {
                try {
                    // رویداد purchase را پیدا کن (در ABI ممکن است نامش متفاوت باشد)
                    // فرض: event Activated(address indexed user, uint256 amountlvl)
                    const purchaseEvents = await contract.queryFilter(contract.filters.Activated(userAddress));
                    purchased = purchaseEvents.reduce((sum, ev) => sum + parseFloat(ethers.utils.formatEther(ev.args.amountlvl)), 0);
                } catch (e) {
                    purchased = 0;
                }
            }
            document.getElementById('purchase-amount').value = purchased + ' MATIC';
        }
        // سقف درآمد روزانه (binaryPointCap)
        if (document.getElementById('daily-cap')) {
            const dailyCap = userData.binaryPointCap ? parseInt(userData.binaryPointCap.toString()) : 0;
            document.getElementById('daily-cap').value = dailyCap.toLocaleString('en-US') + ' پوینت';
        }

        // بارگذاری درخت شبکه
        await loadNetworkTree();
    } catch (error) {
        console.error("خطا در بارگذاری داده‌های کاربر:", error);
        showToast('خطا در بارگذاری اطلاعات کاربر', 'error');
    }
}

// بروزرسانی وضعیت فعالسازی
function updateActivationStatus() {
    const activationStatus = document.getElementById('activation-status');
    
    if (userData.activated) {
        activationStatus.className = 'alert alert-success d-flex align-items-center';
        activationStatus.innerHTML = '<i class="bi bi-check-circle me-2"></i> حساب شما فعال شده است';
    } else {
        activationStatus.className = 'alert alert-warning d-flex align-items-center';
        activationStatus.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i> حساب شما فعال نشده است';
    }
}

// بروزرسانی اطلاعات باینری
function updateBinaryInfo() {
    const binaryPointsElem = document.getElementById('binary-points');
    const binaryPointCapElem = document.getElementById('binary-point-cap');
    const binaryProgressElem = document.getElementById('binary-progress');
    const claimButton = document.getElementById('claim-binary');
    
    const binaryPoints = userData.binaryPoints ? parseInt(userData.binaryPoints.toString()) : 0;
    const binaryPointCap = userData.binaryPointCap ? parseInt(userData.binaryPointCap.toString()) : 0;
    if (binaryPointsElem) binaryPointsElem.textContent = binaryPoints.toLocaleString('fa-IR');
    if (binaryPointCapElem) binaryPointCapElem.textContent = binaryPointCap.toLocaleString('fa-IR');
    // محاسبه درصد پیشرفت
    const progressPercent = binaryPointCap > 0 
        ? (binaryPoints / binaryPointCap) * 100 
        : 0;
    if (binaryProgressElem) binaryProgressElem.style.width = `${Math.min(progressPercent, 100)}%`;
    // فعال/غیرفعال کردن دکمه دریافت پاداش
    const canClaim = userData.activated && binaryPoints > parseInt(userData.binaryPointsClaimed);
    if (claimButton) {
        claimButton.disabled = !canClaim;
        if (canClaim) {
            claimButton.className = 'btn btn-warning w-100';
            claimButton.innerHTML = '<i class="bi bi-cash-stack"></i> دریافت پاداش';
        } else {
            claimButton.className = 'btn btn-secondary w-100';
            claimButton.innerHTML = '<i class="bi bi-cash-stack"></i> پاداشی موجود نیست';
        }
    }
}

let lastTokenPrice = null;

async function loadTokenPrice() {
    if (!contract) return;
    
    try {
        // فقط قیمت LVL به دلار
        const tokenPriceUsdRaw = await contract.getTokenPriceInUSD();
        const tokenPriceUsd = Number(tokenPriceUsdRaw) / 1e8;
        const tokenPriceUsdElem = document.getElementById('token-price-usd');
        if (tokenPriceUsdElem)
            tokenPriceUsdElem.innerHTML = `$${tokenPriceUsd} <span class='small text-muted'>(USD)</span>`;
        // تغییر رنگ و درصد تغییر قیمت (در صورت نیاز)
        if (lastTokenPrice !== null) {
            // اگر نیاز به درصد تغییر دارید، می‌توانید این بخش را نگه دارید یا حذف کنید
            // اینجا چون فقط قیمت دلاری نمایش داده می‌شود، درصد تغییر را بر اساس دلار محاسبه می‌کنیم
            const diff = tokenPriceUsd - lastTokenPrice;
            const percentChange = (diff / lastTokenPrice) * 100;
            const changeElement = document.getElementById('price-change');
            if (changeElement) {
                changeElement.textContent = `${diff >= 0 ? '+' : ''}${percentChange}%`;
                changeElement.className = diff >= 0 ? 'text-success' : 'text-danger';
            }
        }
        lastTokenPrice = tokenPriceUsd;
    } catch (error) {
        console.error("❌ خطا در بارگذاری قیمت توکن:", error);
    }
}

// بارگذاری موجودی‌ها
async function loadBalances() {
    if (!userAddress || !provider || !contract) return;
    
    try {
        // دریافت موجودی MATIC
        const maticBal = await provider.getBalance(userAddress);
        maticBalance = maticBal;
        document.getElementById('matic-balance').value = 
            parseFloat(ethers.utils.formatEther(maticBal));
        
        // دریافت موجودی توکن
        const tokenBal = await contract.balanceOf(userAddress);
        tokenBalance = tokenBal;
        document.getElementById('token-balance').value = 
            parseFloat(ethers.utils.formatEther(tokenBal));
        
        // محاسبه ارزش دلاری 
        const maticPrice = await contract.getLatestMaticPrice();
        const maticPriceUsd = Number(maticPrice) / 1e8;
        const totalMaticValue = parseFloat(ethers.utils.formatEther(maticBal));
        const usdValue = totalMaticValue * maticPriceUsd;
        if(document.getElementById('Musd-value'))
            document.getElementById('Musd-value').value = `$${usdValue.toFixed(2)}`;
        if(document.getElementById('matic-price-userbox'))
            document.getElementById('matic-price-userbox').textContent = maticPriceUsd;

        // قیمت LVL بر حسب دلار
        const tokenPriceUsdRaw = await contract.getTokenPriceInUSD();
        const tokenPriceUsd = Number(tokenPriceUsdRaw) / 1e8;
        // نمایش قیمت LVL در باکس کاربر (فقط دلار)
        if(document.getElementById('lvl-price-userbox'))
            document.getElementById('lvl-price-userbox').innerHTML =
                `<span>${tokenPriceUsd} <span class='text-success'>USD</span></span>`;
        // ارزش دلاری LVL
        const totalTokenValue = parseFloat(ethers.utils.formatEther(tokenBal));
        const tokenUsdValue = totalTokenValue * tokenPriceUsd;
        if(document.getElementById('Tusd-value'))
            document.getElementById('Tusd-value').value = `$${tokenUsdValue.toFixed(2)}`;
        
    } catch (error) {
        console.error("خطا در بارگذاری موجودی‌ها:", error);
    }
}

// بارگذاری آمار سیستم
async function loadSystemStats() {
    if (!contract) return;
    
    try {
        // آمار کلی
        const totalSupply = await contract.totalSupply();
        const totalUsers = await contract.totalUsers();
        const binaryPool = await contract.binaryPool();
        
        // مقدار کل توکن در گردش (فقط از totalSupply استفاده شود)
        const circulatingSupply = totalSupply;
        // مقدار متیک قرارداد
        let maticReserve = 0;
        if (typeof contract.getContractMaticBalance === 'function') {
            try {
                maticReserve = await contract.getContractMaticBalance();
            } catch (e) {
                maticReserve = 0;
            }
        }
        // نمایش در UI
        const circulatingSupplyElem = document.getElementById('circulating-supply');
        if (circulatingSupplyElem)
            circulatingSupplyElem.value = Number(ethers.utils.formatEther(circulatingSupply));
        const maticReserveElem = document.getElementById('matic-reserve');
        if (maticReserveElem)
            maticReserveElem.value = Number(ethers.utils.formatEther(maticReserve));
        const totalSupplyElem = document.getElementById('total-supply');
        if (totalSupplyElem)
            totalSupplyElem.textContent = Number(ethers.utils.formatEther(totalSupply));
        const totalHoldersElem = document.getElementById('total-holders');
        if (totalHoldersElem)
            totalHoldersElem.textContent = totalUsers.toString();
        const binaryPoolElem = document.getElementById('binary-pool-amount');
        if (binaryPoolElem)
            binaryPoolElem.textContent = Number(ethers.utils.formatEther(binaryPool));
        // حجم معاملات واقعی (جمع خرید و فروش توکن) با BigNumber
        let totalVolume = ethers.BigNumber.from(0);
        if (contract.filters && contract.queryFilter) {
            const buyEvents = await contract.queryFilter(contract.filters.TokensBought());
            const sellEvents = await contract.queryFilter(contract.filters.TokensSold());
            let buySum = buyEvents.reduce((sum, ev) => sum.add(ev.args.maticAmount), ethers.BigNumber.from(0));
            let sellSum = sellEvents.reduce((sum, ev) => sum.add(ev.args.maticAmount), ethers.BigNumber.from(0));
            totalVolume = buySum.add(sellSum);
        }
        const totalVolumeElem = document.getElementById('total-volume');
        if (totalVolumeElem)
            totalVolumeElem.textContent = Number(ethers.utils.formatEther(totalVolume));
        // همگام‌سازی بنر
        updateStatsBanner();
    } catch (error) {
        console.error("خطا در بارگذاری آمار سیستم:", error);
    }
}

// همگام‌سازی آمار بنر تبلیغاتی با آمار اصلی و افزودن کل توکن در گردش و موجودی متیک پشتوانه
function updateStatsBanner() {
    const ids = [
        ['total-supply', 'total-supply-banner'],
        ['circulating-supply', 'circulating-supply-banner'],
        ['total-holders', 'total-holders-banner'],
        ['binary-pool-amount', 'binary-pool-amount-banner'],
        ['matic-reserve', 'matic-reserve-banner'],
        ['total-volume', 'total-volume-banner']
    ];
    ids.forEach(([mainId, bannerId]) => {
        const main = document.getElementById(mainId);
        const banner = document.getElementById(bannerId);
        if (main && banner) banner.textContent = main.textContent;
    });
}

// بروزرسانی قیمت توکن
async function updateTokenPrice() {
    if (!contract) return;
    
    try {
        showTransactionModal('در حال بروزرسانی قیمت توکن...');
        
        const newPrice = await contract.updateTokenPrice();
        await loadTokenPrice();
        
        hideTransactionModal();
        showToast('قیمت توکن با موفقیت به‌روز شد!', 'success');
        
    } catch (error) {
        hideTransactionModal();
        console.error("خطا در بروزرسانی قیمت:", error);
        showToast('خطا در بروزرسانی قیمت: ' + error.message, 'error');
    }
}

// ثبت نام و فعالسازی
async function registerAndActivate() {
    const referrerAddress = document.getElementById('referrer-address').value.trim();
    const activationAmount = document.getElementById('activation-amount').value;
    lvlusd=await contract.getTokenPriceInUSD();
    if (!activationAmount || parseFloat(activationAmount) <= lvlusd*20) {
        showToast('لطفا مقدار معتبری برای فعالسازی وارد کنید', 'error');
        return;
    }
    
    try {
        showTransactionModal('در حال پردازش ثبت نام و فعالسازی...');
        
        let tx;
        const value = ethers.utils.parseEther(activationAmount);
        
        if (referrerAddress && ethers.utils.isAddress(referrerAddress)) {
            tx = await contract.registerAndActivate(referrerAddress, { value });
        } else {
            tx = await contract.registerAndActivate(ethers.constants.AddressZero, { value });
        }
        
        updateTransactionMessage('در انتظار تایید تراکنش...');
        await tx.wait();
        
        // بروزرسانی داده‌ها
        await Promise.all([
            loadUserData(),
            loadBalances(),
            loadSystemStats()
        ]);
        
        hideTransactionModal();
        showToast('ثبت نام و فعالسازی با موفقیت انجام شد!', 'success');
        
    } catch (error) {
        hideTransactionModal();
        console.error("خطا در ثبت نام:", error);
        
        let errorMessage = 'خطا در ثبت نام و فعالسازی';
        if (error.message.includes('insufficient funds')) {
            errorMessage = 'موجودی کافی نیست';
        } else if (error.message.includes('user rejected')) {
            errorMessage = 'تراکنش توسط کاربر لغو شد';
        }
        
        showToast(errorMessage, 'error');
    }
}

// دریافت پاداش باینری
async function claimBinaryReward() {
    if (!userData || !userData.activated) {
        showToast('ابتدا حساب خود را فعال کنید', 'warning');
        return;
    }
    
    try {
        showTransactionModal('در حال پردازش دریافت پاداش باینری...');
        
        const tx = await contract.claimBinaryReward();
        
        updateTransactionMessage('در انتظار تایید تراکنش...');
        await tx.wait();
        
        // بروزرسانی داده‌ها
        await Promise.all([
            loadUserData(),
            loadBalances()
        ]);
        
        hideTransactionModal();
        showToast('پاداش باینری با موفقیت دریافت شد!', 'success');
        
    } catch (error) {
        hideTransactionModal();
        console.error("خطا در دریافت پاداش باینری:", error);
        
        let errorMessage = 'خطا در دریافت پاداش باینری';
        if (error.message.includes('No unclaimed points')) {
            errorMessage = 'پاداش قابل دریافتی وجود ندارد';
        } else if (error.message.includes('Can only claim once per 12 hours')) {
            errorMessage = 'فقط هر 12 ساعت یکبار می‌توانید پاداش دریافت کنید';
        }
        
        showToast(errorMessage, 'error');
    }
}

// بارگذاری بازگشتی و داینامیک درخت شبکه
async function loadNetworkTree(rootAddress = null, container = null, level = 0, maxLevels = 3) {
    if (!contract) return;
    const address = rootAddress || userAddress;
    if (!address) return;
    if (!container) {
        const treeContainer = document.getElementById('tree-container');
        treeContainer.innerHTML = '<div class="text-center"><div class="loading-spinner mb-3"></div><p class="text-muted">در حال بارگذاری درخت شبکه...</p></div>';
        container = treeContainer;
    }
    try {
        const user = await fetchUserNode(address);
        container.innerHTML = '';
        const treeHtml = await renderNetworkTree(user, address, level, maxLevels);
        container.appendChild(treeHtml);
    } catch (error) {
        console.error("خطا در بارگذاری درخت شبکه:", error);
        container.innerHTML = '<div class="text-center"><p class="text-danger">خطا در بارگذاری درخت شبکه</p></div>';
    }
}

// دریافت اطلاعات یک کاربر (گره)
async function fetchUserNode(address) {
    const user = await contract.users(address);
    return {
        address,
        left: user.left,
        right: user.right,
        activated: user.activated,
        referrer: user.referrer,
        // اطلاعات دیگر در صورت نیاز
    };
}

// بازگشتی: ساخت HTML درخت شبکه به صورت مستطیل زیر هم و بازشونده با دکمه نمایش اطلاعات
async function renderNetworkTree(user, address, level, maxLevels) {
    const node = document.createElement('div');
    node.className = 'tree-node-rect';
    // محتوای گره: مستطیل با آدرس مختصر، دکمه باز کردن و دکمه اطلاعات
    node.innerHTML = `
        <div class="node-rect-content${address === userAddress ? ' node-main' : ''}" data-address="${address}">
            <span class="wallet-short">${address === userAddress ? 'شما' : (address.slice(0, 6) + '...' + address.slice(-4))}</span>
            <button class="info-btn" title="نمایش اطلاعات" data-address="${address}"><i class="bi bi-chat-left-text"></i></button>
            ${level < maxLevels ? `<button class="expand-btn" data-address="${address}">+</button>` : ''}
        </div>
    `;
    // دکمه اطلاعات (کامنت)
    const infoBtn = node.querySelector('.info-btn');
    if (infoBtn) {
        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let infoBox = node.querySelector('.node-info-box');
            if (infoBox) {
                infoBox.remove();
                return;
            }
            infoBox = document.createElement('div');
            infoBox.className = 'node-info-box';
            // اطلاعات نمونه: فروش چپ/راست، دریافتی، فعال بودن و ...
            // اعداد به انگلیسی نمایش داده شوند و لیبل‌ها خوانا باشند
            const leftSale = user.leftSale !== undefined && user.leftSale !== null ? Number(user.leftSale).toLocaleString('en-US') : '-';
            const rightSale = user.rightSale !== undefined && user.rightSale !== null ? Number(user.rightSale).toLocaleString('en-US') : '-';
            const receivedAmount = user.receivedAmount !== undefined && user.receivedAmount !== null ? Number(user.receivedAmount).toLocaleString('en-US') : '-';
            infoBox.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;"><b style='color:#39FF14;'>آدرس:</b> <span class="en-num" dir="ltr" style='color:#39FF14;text-align:left;'>${address}</span></div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;"><b style='color:#39FF14;'>فعال:</b> <span style='color:#39FF14;'>${user.activated ? 'بله' : 'خیر'}</span></div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;"><b style='color:#39FF14;'>معرف:</b> <span class="en-num" dir="ltr" style='color:#39FF14;text-align:left;'>${user.referrer && user.referrer !== ethers.constants.AddressZero ? user.referrer : 'ندارد'}</span></div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;"><b style='color:#39FF14;'>فروش سمت چپ:</b> <span class="en-num left-sale" style='color:#39FF14;text-align:left;'>${leftSale}</span></div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;"><b style='color:#39FF14;'>فروش سمت راست:</b> <span class="en-num right-sale" style='color:#39FF14;text-align:left;'>${rightSale}</span></div>
                <div style="display:flex;justify-content:space-between;align-items:center;"><b style='color:#39FF14;'>مقدار دریافتی:</b> <span class="en-num received-amount" style='color:#39FF14;text-align:left;'>${receivedAmount}</span></div>
            `;
            node.appendChild(infoBox);
        });
    }
    // فقط با کلیک باز کن
    if (level < maxLevels) {
        const expandBtn = node.querySelector('.expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                expandBtn.disabled = true;
                expandBtn.textContent = '...';
                // ساخت زیرمجموعه‌ها (چپ و راست)
                const childrenWrapper = document.createElement('div');
                childrenWrapper.className = 'children-rect';
                // چپ
                if (user.left && user.left !== ethers.constants.AddressZero) {
                    const leftUser = await fetchUserNode(user.left);
                    const leftNode = await renderNetworkTree(leftUser, user.left, level + 1, maxLevels);
                    childrenWrapper.appendChild(leftNode);
                } else {
                    const emptyNode = document.createElement('div');
                    emptyNode.className = 'tree-node-rect';
                    emptyNode.innerHTML = `<div class=\"node-rect-content node-inactive\"><span class=\"wallet-short\">خالی</span></div>`;
                    childrenWrapper.appendChild(emptyNode);
                }
                // راست
                if (user.right && user.right !== ethers.constants.AddressZero) {
                    const rightUser = await fetchUserNode(user.right);
                    const rightNode = await renderNetworkTree(rightUser, user.right, level + 1, maxLevels);
                    childrenWrapper.appendChild(rightNode);
                } else {
                    const emptyNode = document.createElement('div');
                    emptyNode.className = 'tree-node-rect';
                    emptyNode.innerHTML = `<div class=\"node-rect-content node-inactive\"><span class=\"wallet-short\">خالی</span></div>`;
                    childrenWrapper.appendChild(emptyNode);
                }
                node.appendChild(childrenWrapper);
                expandBtn.style.display = 'none';
            });
        }
    }
    return node;
}

// Event handlers
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        resetWallet();
        showToast('کیف پول قطع شد', 'warning');
    } else if (accounts[0] !== userAddress) {
        setupWallet(accounts[0]);
        showToast('حساب تغییر کرد', 'info');
    }
}

function handleChainChanged(chainId) {
    window.location.reload();
}

function handleDisconnect() {
    resetWallet();
    showToast('اتصال قطع شد', 'warning');
}

// Utility functions
function enableButtons() {
    document.getElementById('register-activate').disabled = false;
    // سایر دکمه‌ها...
}

function disableButtons() {
    document.getElementById('register-activate').disabled = true;
    document.getElementById('claim-binary').disabled = true;
    // سایر دکمه‌ها...
}

function clearUserData() {
    document.getElementById('binary-points').textContent = '0';
    document.getElementById('binary-point-cap').textContent = '0';
    document.getElementById('binary-progress').style.width = '0%';
    document.getElementById('my-referrer').value = '';
    // سایر فیلدها...
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    showToast('کپی شد!', 'success');
}

function copyReferralLink() {
    const referralLink = document.getElementById('referral-link');
    referralLink.select();
    document.execCommand('copy');
    showToast('لینک معرف کپی شد!', 'success');
}

// Modal functions
function showTransactionModal(message) {
    document.getElementById('transaction-message').textContent = message;
    const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
    modal.show();
}

function updateTransactionMessage(message) {
    document.getElementById('transaction-message').textContent = message;
}

function hideTransactionModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('transactionModal'));
    if (modal) {
        modal.hide();
    }
}

// Toast notifications
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toastId = 'toast-' + Date.now();
    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill'
    };
    
    const toastHtml = `
        <div id="${toastId}" class="toast ${type}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex align-items-center">
                <div class="toast-body d-flex align-items-center">
                    <i class="bi ${icons[type]} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close me-2" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function showPersistentAlert(message, type = 'info') {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', alertHtml);
}

// بررسی پارامتر معرف در URL
function checkReferralInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const refAddress = urlParams.get('ref');
    
    if (refAddress && ethers.utils.isAddress(refAddress)) {
        document.getElementById('referrer-address').value = refAddress;
        showToast('آدرس معرف از لینک تشخیص داده شد', 'info');
    }
}

// اجرای بررسی معرف هنگام بارگذاری صفحه
document.addEventListener('DOMContentLoaded', checkReferralInUrl);

document.addEventListener('walletConnected', (event) => {
  // اکنون مطمئنیم contract مقدار گرفته

  // شروع دریافت قیمت
  fetchPrices();
  setInterval(fetchPrices, 5000);
});

// نمایش موقت پیغام‌های وضعیت کیف پول (۲ ثانیه)
function showWalletStatus(type) {
    const warning = document.getElementById('wallet-status');
    const success = document.getElementById('wallet-status-connected');
    if (type === 'connected') {
        if (warning) warning.style.display = 'none';
        if (success) {
            success.style.display = 'flex';
            setTimeout(() => { success.style.display = 'none'; }, 2000);
        }
    } else if (type === 'disconnected') {
        if (success) success.style.display = 'none';
        if (warning) {
            warning.style.display = 'flex';
            setTimeout(() => { warning.style.display = 'none'; }, 2000);
        }
    }
}

// تابع updateWalletStatus به‌روزرسانی شد تا فقط showWalletStatus را صدا بزند
function updateWalletStatus(connected) {
    if (connected) {
        showWalletStatus('connected');
    } else {
        showWalletStatus('disconnected');
    }
}

// مقداردهی و نمایش اطلاعات پوینت‌ها در وضعیت حساب کاربری
async function updatePointStatusUI() {
    if (!contract || !userAddress) return;
    try {
        // ارزش هر پوینت (دلار)
        const pointValueRaw = await contract.getPointValue(); // اصلاح نام تابع
        const pointValue = Number(pointValueRaw) / 1e8;
        const pointValueElem = document.getElementById('point-value-usd');
        if (pointValueElem) pointValueElem.value = pointValue > 0 ? pointValue : '---';

        // تعداد کل پوینت‌های سازمان
        const orgTotalPointsRaw = await contract.totalPoints();
        const orgTotalPoints = Number(orgTotalPointsRaw);
        const orgTotalPointsElem = document.getElementById('org-total-points');
        if (orgTotalPointsElem) orgTotalPointsElem.value = orgTotalPoints.toLocaleString('en-US');

        // تعداد پوینت دریافتی کاربر
        if (userData && userData.binaryPoints !== undefined) {
            const userPoints = Number(userData.binaryPoints);
            const userPointsElem = document.getElementById('user-received-points');
            if (userPointsElem) userPointsElem.value = userPoints.toLocaleString('en-US');
        }
    } catch (e) {
        console.error('خطا در بارگذاری اطلاعات پوینت:', e);
    }
}

// فراخوانی این تابع بعد از loadUserData و loadSystemStats
const origLoadUserData = loadUserData;
loadUserData = async function() {
    await origLoadUserData.apply(this, arguments);
    updatePointStatusUI();
};
const origLoadSystemStats = loadSystemStats;
loadSystemStats = async function() {
    await origLoadSystemStats.apply(this, arguments);
    updatePointStatusUI();
};
