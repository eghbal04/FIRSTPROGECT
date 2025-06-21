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
    document.getElementById('connect-wallet').addEventListener('click', connectWallet);
    
    // بروزرسانی قیمت توکن
    document.getElementById('update-price').addEventListener('click', updateTokenPrice);
    
    // ثبت نام و فعالسازی
    document.getElementById('register-activate').addEventListener('click', registerAndActivate);
    
    // دریافت پاداش باینری
    document.getElementById('claim-binary').addEventListener('click', claimBinaryReward);
    
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
        
    } catch (error) {
        console.error('خطا در تنظیم کیف پول:', error);
        showToast('خطا در بارگذاری اطلاعات کیف پول', 'error');
    }
}

// بروزرسانی UI کیف پول
function updateWalletUI() {
    // نمایش اطلاعات کاربر
    document.getElementById('wallet-address').value = userAddress;
    document.getElementById('user-info').style.display = 'block';
    
    // بروزرسانی وضعیت
    const walletStatus = document.getElementById('wallet-status');
    walletStatus.className = 'alert alert-success d-flex align-items-center';
    walletStatus.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> کیف پول متصل شده است';
    
    // ایجاد لینک معرف
    const referralLink = `${window.location.origin}${window.location.pathname}?ref=${userAddress}`;
    document.getElementById('referral-link').value = referralLink;
    
    updateConnectButton();
}

// بروزرسانی دکمه اتصال
function updateConnectButton(text = null) {
    const button = document.getElementById('connect-wallet');
    
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
    
    const walletStatus = document.getElementById('wallet-status');
    walletStatus.className = 'alert alert-warning d-flex align-items-center';
    walletStatus.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i> کیف پول متصل نشده است';
    
    updateConnectButton();
    disableButtons();
    
    // پاک کردن داده‌ها
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
    const binaryPoints = userData.binaryPoints.toString();
    const binaryPointCap = userData.binaryPointCap.toString();
    
    document.getElementById('binary-points').textContent = binaryPoints;
    document.getElementById('binary-point-cap').textContent = binaryPointCap;
    
    // محاسبه درصد پیشرفت
    const progressPercent = binaryPointCap > 0 
        ? (parseInt(binaryPoints) / parseInt(binaryPointCap)) * 100 
        : 0;
    
    document.getElementById('binary-progress').style.width = `${Math.min(progressPercent, 100)}%`;
    
    // فعال/غیرفعال کردن دکمه دریافت پاداش
    const claimButton = document.getElementById('claim-binary');
    const canClaim = userData.activated && parseInt(binaryPoints) > parseInt(userData.binaryPointsClaimed);
    
    claimButton.disabled = !canClaim;
    if (canClaim) {
        claimButton.className = 'btn btn-warning w-100';
        claimButton.innerHTML = '<i class="bi bi-cash-stack"></i> دریافت پاداش';
    } else {
        claimButton.className = 'btn btn-secondary w-100';
        claimButton.innerHTML = '<i class="bi bi-cash-stack"></i> پاداشی موجود نیست';
    }
}

let lastTokenPrice = null;

async function loadTokenPrice() {
    if (!contract) return;

    try {
        // دریافت قیمت واقعی از کانترکت
        const rawPrice = await contract.getLatestLvlPrice();
        const newPrice = Number(rawPrice) / 1e8; // چون معمولا قیمت با 8 رقم اعشار داده میشه

        // نمایش قیمت در UI
        document.getElementById('token-price').textContent = newPrice.toFixed(8);

        // محاسبه تغییر قیمت
        if (lastTokenPrice !== null) {
            const diff = newPrice - lastTokenPrice;
            const percentChange = (diff / lastTokenPrice) * 100;

            const changeElement = document.getElementById('price-change');
            changeElement.textContent = `${diff >= 0 ? '+' : ''}${percentChange.toFixed(2)}%`;
            changeElement.className = diff >= 0 ? 'text-success' : 'text-danger';
        }

        // به‌روزرسانی مقدار قبلی
        lastTokenPrice = newPrice;

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
            parseFloat(ethers.utils.formatEther(maticBal)).toFixed(6);
        
        // دریافت موجودی توکن
        const tokenBal = await contract.balanceOf(userAddress);
        tokenBalance = tokenBal;
        document.getElementById('token-balance').value = 
            parseFloat(ethers.utils.formatEther(tokenBal)).toFixed(6);
        
        // محاسبه ارزش دلاری 
        const maticPrice = await contract.getLatestMaticPrice();
        const maticPriceUsd = Number(maticPrice) / 1e8;
        const totalMaticValue = parseFloat(ethers.utils.formatEther(maticBal));
        const usdValue = totalMaticValue * maticPriceUsd;
        if(document.getElementById('Musd-value'))
            document.getElementById('Musd-value').value = `$${usdValue.toFixed(2)}`;
        if(document.getElementById('matic-price-userbox'))
            document.getElementById('matic-price-userbox').textContent = maticPriceUsd.toFixed(4);

        // محاسبه ارزش دلاری توکن LVL (فرض می‌گیریم تابعی مشابه برای قیمتش هست)
        const tokenPrice = await contract.getLatestLvlPrice();
        const tokenPriceUsd = Number(tokenPrice) / 1e8;
        const totalTokenValue = parseFloat(ethers.utils.formatEther(tokenBal));
        const tokenUsdValue = totalTokenValue * tokenPriceUsd;
        if(document.getElementById('Tusd-value'))
            document.getElementById('Tusd-value').value = `$${tokenUsdValue.toFixed(2)}`;
        if(document.getElementById('lvl-price-userbox'))
            document.getElementById('lvl-price-userbox').textContent = tokenPriceUsd.toFixed(4);
        
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
        
        document.getElementById('total-supply').textContent =
            ethers.utils.formatEther(totalSupply).replace(/\.0+$/, '');
        document.getElementById('total-holders').textContent = totalUsers.String();
        document.getElementById('binary-pool-amount').textContent =
            Number(ethers.utils.formatEther(binaryPool)).toLocaleString('fa-IR', {maximumFractionDigits: 4});
        
        // حجم معاملات واقعی (جمع خرید و فروش توکن) با BigNumber
        let totalVolume = ethers.BigNumber.from(0);
        if (contract.filters && contract.queryFilter) {
            const buyEvents = await contract.queryFilter(contract.filters.TokensBought());
            const sellEvents = await contract.queryFilter(contract.filters.TokensSold());
            let buySum = buyEvents.reduce((sum, ev) => sum.add(ev.args.maticAmount), ethers.BigNumber.from(0));
            let sellSum = sellEvents.reduce((sum, ev) => sum.add(ev.args.maticAmount), ethers.BigNumber.from(0));
            totalVolume = buySum.add(sellSum);
        }
        document.getElementById('total-volume').textContent =
            Number(ethers.utils.formatEther(totalVolume)).toLocaleString('fa-IR', {maximumFractionDigits: 4});
        
    } catch (error) {
        console.error("خطا در بارگذاری آمار سیستم:", error);
    }
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

// بارگذاری درخت شبکه
async function loadNetworkTree() {
    if (!userAddress || !contract) return;
    
    try {
        const treeContainer = document.getElementById('tree-container');
        treeContainer.innerHTML = '<div class="text-center"><div class="loading-spinner mb-3"></div><p class="text-muted">در حال بارگذاری درخت شبکه...</p></div>';
        
        // دریافت اطلاعات کاربر
        const user = await contract.users(userAddress);
        
        // بروزرسانی آمار شبکه
        const totalUsers = await contract.totalUsers();
        document.getElementById('total-users').textContent = totalUsers.toString();
        
        // محاسبه تعداد کاربران چپ و راست (شبیه‌سازی)
        const leftUsers = user.leftChild.toString() !== '0' ? Math.floor(Math.random() * 10) + 1 : 0;
        const rightUsers = user.rightChild.toString() !== '0' ? Math.floor(Math.random() * 10) + 1 : 0;
        
        document.getElementById('left-users').textContent = leftUsers;
        document.getElementById('right-users').textContent = rightUsers;
        document.getElementById('total-purchased').textContent = 
            parseFloat(ethers.utils.formatEther(user.totalPurchasedMATIC || 0)).toFixed(4);
        
        // اگر کاربر فعال نشده است
        if (!user.activated) {
            treeContainer.innerHTML = '<div class="text-center"><p class="text-muted">برای مشاهده درخت شبکه باید حساب خود را فعال کنید</p></div>';
            return;
        }
        
        // ساخت درخت ساده
        const treeHtml = createSimpleTree(user);
        treeContainer.innerHTML = treeHtml;
        
    } catch (error) {
        console.error("خطا در بارگذاری درخت شبکه:", error);
        document.getElementById('tree-container').innerHTML = 
            '<div class="text-center"><p class="text-danger">خطا در بارگذاری درخت شبکه</p></div>';
    }
}

// ایجاد درخت ساده
function createSimpleTree(user) {
    const hasLeft = user.left !== ethers.constants.AddressZero;
    const hasRight = user.right !== ethers.constants.AddressZero;
    
    return `
        <div class="d-flex flex-column align-items-center">
            <div class="tree-node">
                <div class="node-content node-active">
                    <small>شما</small>
                </div>
            </div>
            <div class="d-flex justify-content-center gap-5 mt-4">
                <div class="tree-node">
                    <div class="node-content ${hasLeft ? 'node-active' : 'node-inactive'}">
                        <small>${hasLeft ? 'فعال' : 'خالی'}</small>
                    </div>
                    <small class="text-muted mt-2">سمت چپ</small>
                </div>
                <div class="tree-node">
                    <div class="node-content ${hasRight ? 'node-active' : 'node-inactive'}">
                        <small>${hasRight ? 'فعال' : 'خالی'}</small>
                    </div>
                    <small class="text-muted mt-2">سمت راست</small>
                </div>
            </div>
        </div>
    `;
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

