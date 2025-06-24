document.addEventListener('DOMContentLoaded', async () => {
    console.log("Welcome to the new LevelUp Platform!");

    const connectButton = document.getElementById('connectButton');
    if (!connectButton) return;

    connectButton.addEventListener('click', async () => {
        await connectWalletAndUpdateUI(connectButton);
    });

    // تلاش برای اتصال خودکار هنگام بارگذاری صفحه
    await autoConnectWallet(connectButton);
});

// تابعی که اتصال کیف پول رو انجام میده و UI رو آپدیت میکنه
async function connectWalletAndUpdateUI(connectButton) {
    try {
        connectButton.textContent = 'در حال اتصال...';
        connectButton.disabled = true;

        // اتصال به کیف پول
        const { address } = await connectWallet();

        // دریافت پروفایل کاربر
        const profile = await fetchUserProfile();

        // به‌روزرسانی UI
        updateConnectionUI(profile, address);

    } catch (error) {
        console.error("Connection error:", error);
        alert("اتصال کیف پول ناموفق بود: " + error.message);
    } finally {
        connectButton.textContent = 'اتصال کیف پول';
        connectButton.disabled = false;
    }
}

// تلاش برای اتصال خودکار به کیف پول
async function autoConnectWallet(connectButton) {
    if (typeof window.ethereum === 'undefined') {
        console.log("کیف پول اتریوم شناسایی نشد");
        return;
    }

    try {
        // درخواست اتصال خودکار (اگر کاربر قبلاً اجازه داده باشد، بدون درخواست دوباره متصل می شود)
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (accounts.length > 0) {
            const address = accounts[0];
            console.log("Wallet connected automatically:", address);

            // دریافت پروفایل کاربر
            const profile = await fetchUserProfile();

            // آپدیت UI بر اساس اتصال خودکار
            updateConnectionUI(profile, address);

            // آپدیت دکمه کانکت برای کاربر
            if (connectButton) {
                connectButton.textContent = 'متصل: ' + shortenAddress(address);
                connectButton.style.background = 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)';
                connectButton.disabled = true;
            }
        }
    } catch (error) {
        console.log("اتصال خودکار موفق نبود یا کاربر رد کرد", error);
    }
}

// سایر توابع اصلی
function updateConnectionUI(profile, address) {
    const connectButton = document.getElementById('connectButton');
    if (connectButton) {
        connectButton.textContent = 'متصل: ' + shortenAddress(address);
        connectButton.style.background = 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)';
        connectButton.disabled = true;
    }

    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    updateElement('user-address', address);
    updateElement('matic-balance', profile.maticBalance + ' MATIC');
    updateElement('lvl-balance', profile.lvlBalance + ' LVL');

    const userDashboard = document.getElementById('user-dashboard');
    const mainContent = document.getElementById('main-content');

    if (userDashboard) userDashboard.style.display = 'block';
    if (mainContent) mainContent.style.display = 'none';

    if (typeof updateTokenStats === 'function') {
        updateTokenStats();
    }
}

function shortenAddress(address) {
    if (!address) return '---';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
