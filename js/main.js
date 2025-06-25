// main.js
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Welcome to the new LevelUp Platform!");

    const connectButton = document.getElementById('connectButton');
    const walletConnectButton = document.getElementById('walletConnectButton');
    
    if (connectButton) {
        connectButton.addEventListener('click', async () => {
            await connectWalletAndUpdateUI('metamask');
        });
    }
    
    if (walletConnectButton) {
        walletConnectButton.addEventListener('click', async () => {
            await connectWalletAndUpdateUI('walletconnect');
        });
    }

    // تلاش برای اتصال خودکار هنگام بارگذاری صفحه
    await autoConnectWallet();
});

// تابع اتصال کیف پول با نوع مشخص
async function connectWalletAndUpdateUI(walletType) {
    try {
        const connectButton = document.getElementById('connectButton');
        const walletConnectButton = document.getElementById('walletConnectButton');
        
        if (walletType === 'metamask' && connectButton) {
            connectButton.textContent = 'در حال اتصال...';
            connectButton.disabled = true;
        } else if (walletType === 'walletconnect' && walletConnectButton) {
            walletConnectButton.textContent = 'در حال اتصال...';
            walletConnectButton.disabled = true;
        }

        let connected = false;
        if (walletType === 'metamask') {
            connected = await window.contractConfig.initializeWeb3();
        } else if (walletType === 'walletconnect') {
            connected = await window.contractConfig.connectWithWalletConnect();
        }

        if (!connected) {
            throw new Error("اتصال کیف پول ناموفق بود");
        }

        // دریافت پروفایل کاربر
        const profile = await fetchUserProfile();
        const address = await window.contractConfig.signer.getAddress();

        // به‌روزرسانی UI
        updateConnectionUI(profile, address, walletType);

    } catch (error) {
        console.error("Connection error:", error);
        alert("اتصال کیف پول ناموفق بود: " + error.message);
    } finally {
        const connectButton = document.getElementById('connectButton');
        const walletConnectButton = document.getElementById('walletConnectButton');
        
        if (connectButton) {
            connectButton.textContent = 'اتصال با متامسک';
            connectButton.disabled = false;
        }
        
        if (walletConnectButton) {
            walletConnectButton.textContent = 'اتصال با WalletConnect';
            walletConnectButton.disabled = false;
        }
    }
}

// به‌روزرسانی تابع updateConnectionUI برای پشتیبانی از انواع کیف پول
function updateConnectionUI(profile, address, walletType) {
    const connectButton = document.getElementById('connectButton');
    const walletConnectButton = document.getElementById('walletConnectButton');
    
    if (walletType === 'metamask' && connectButton) {
        connectButton.textContent = 'متصل: ' + shortenAddress(address);
        connectButton.style.background = 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)';
        connectButton.disabled = true;
    } else if (walletType === 'walletconnect' && walletConnectButton) {
        walletConnectButton.textContent = 'متصل: ' + shortenAddress(address);
        walletConnectButton.style.background = 'linear-gradient(90deg, #3b99fc 0%, #2a7de1 100%)';
        walletConnectButton.disabled = true;
    }

    // سایر به‌روزرسانی‌های UI
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