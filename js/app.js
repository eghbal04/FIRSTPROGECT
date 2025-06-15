// js/app.js - اپلیکیشن اصلی بروزرسانی شده

// متغیرهای global
let userAddress = null;
let userData = null;
let tokenPrice = 0;
let maticBalance = 0;
let tokenBalance = 0;
let isConnecting = false;

// رویدادهای صفحه
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
    setupEventListeners();
    
    // بررسی اتصال خودکار کیف پول
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

// راه‌اندازی اولیه اپلیکیشن
async function initializeApp() {
    try {
        // بررسی پشتیبانی از Web3
        if (!window.ethereum) {
            showPersistentAlert('کیف پول Web3 یافت نشد. لطفا MetaMask یا کیف پول مشابه نصب کنید.', 'warning');
            return;
        }

        // راه‌اندازی Web3
        await window.contractConfig.initializeWeb3();
        
        // بروزرسانی متغیرهای global
        ({ provider, signer, contract } = window.contractConfig);
        
        console.log('اپلیکیشن با موفقیت راه‌اندازی شد');
        
    } catch (error) {
        console.error('خطا در راه‌اندازی اپلیکیشن:', error);
        showPersistentAlert('خطا در راه‌اندازی اپلیکیشن: ' + error.message, 'error');
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

// بارگذاری قیمت توکن
async function loadTokenPrice() {
    if (!contract) return;
    
    try {
        tokenPrice = await contract.updateTokenPrice();
        const priceFormatted = ethers.utils.formatEther(tokenPrice);
        document.getElementById('token-price').textContent = parseFloat(priceFormatted).toFixed(8);
        
        // شبیه‌سازی تغییر قیمت (در پروژه واقعی از API استفاده کنید)
        const randomChange = (Math.random() - 0.5) * 10;
        const changeElement = document.getElementById('price-change');
        changeElement.textContent = `${randomChange > 0 ? '+' : ''}${randomChange.toFixed(2)}%`;
        changeElement.className = randomChange > 0 ? 'text-success' : 'text-danger';
        
    } catch (error) {
        console.error("خطا در بارگذاری قیمت توکن:", error);
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
        
        // محاسبه ارزش دلاری (شبیه‌سازی)
        const maticPrice = 0.8; // قیمت فرضی MATIC
        const totalMaticValue = parseFloat(ethers.utils.formatEther(maticBal));
        const usdValue = totalMaticValue * maticPrice;
        document.getElementById('usd-value').value = `$${usdValue.toFixed(2)}`;
        
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
            parseFloat(ethers.utils.formatEther(totalSupply)).toFixed(0);
        document.getElementById('total-holders').textContent = totalUsers.toString();
        document.getElementById('binary-pool-amount').textContent = 
            parseFloat(ethers.utils.formatEther(binaryPool)).toFixed(2);
        
        // شبیه‌سازی حجم معاملات
        document.getElementById('total-volume').textContent = 
            (Math.random() * 10000).toFixed(0);
            
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
    
    if (!activationAmount || parseFloat(activationAmount) <= 0) {
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