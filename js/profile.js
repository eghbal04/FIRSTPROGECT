// --- Profile Page Logic ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // بررسی وجود ethers و contractConfig
        if (typeof ethers === 'undefined' || !window.contractConfig) {
            throw new Error("Ethers.js or contract config not loaded");
        }

        // بارگذاری اطلاعات پروفایل
        await loadUserProfile();

        // راه‌اندازی دکمه کپی لینک دعوت
        setupReferralCopy();

    } catch (error) {
        console.error("Error in profile page:", error);
        showProfileError("خطا در بارگذاری پروفایل");
    }
});

// بارگذاری اطلاعات پروفایل کاربر
async function loadUserProfile() {
    try {
        // بررسی اتصال کیف پول
        const connection = await checkConnection();
        if (!connection.connected) {
            showProfileError("لطفا ابتدا کیف پول خود را متصل کنید");
            return;
        }

        // دریافت اطلاعات کاربر
        const profile = await fetchUserProfile();
        const { contract, address } = await connectWallet();

        // دریافت اطلاعات تکمیلی از قرارداد
        const [userData, isClaimable, registrationPrice, maticPrice, lvlPrice] = await Promise.all([
            contract.users(address),
            contract.isClaimable(address),
            contract.getRegistrationPrice(),
            contract.getLatestMaticPrice(), // قیمت MATIC به دلار (با 8 رقم اعشار)
            contract.getLatestLvlPrice()    // قیمت LVL به دلار (با 8 رقم اعشار)
        ]);

        // به‌روزرسانی UI
        updateProfileUI(profile, userData, isClaimable, registrationPrice, maticPrice, lvlPrice);

    } catch (error) {
        console.error("Error loading profile:", error);
        showProfileError("خطا در بارگذاری اطلاعات پروفایل");
    }
}

// به‌روزرسانی UI پروفایل
function updateProfileUI(profile, userData, isClaimable, registrationPrice, maticPrice, lvlPrice) {
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    // اطلاعات اصلی
    updateElement('profile-address', profile.address);
    updateElement('profile-referrer', userData.referrer || 'بدون معرف');
    updateElement('profile-matic', profile.maticBalance + ' MATIC');
    updateElement('profile-lvl', profile.lvlBalance + ' LVL');

    // تبدیل قیمت‌ها به مقادیر خوانا
    const maticPriceInUSD = parseFloat(ethers.formatUnits(maticPrice, 8)); // تبدیل از 8 رقم اعشار
    const lvlPriceInUSD = parseFloat(ethers.formatUnits(lvlPrice, 8));     // تبدیل از 8 رقم اعشار

    // محاسبه ارزش دلاری (واقعی)
    const maticUSD = (parseFloat(profile.maticBalance) * maticPriceInUSD).toFixed(2);
    const lvlUSD = (parseFloat(profile.lvlBalance) * lvlPriceInUSD).toFixed(2);
    
    updateElement('profile-matic-usd', `(~$${maticUSD})`);
    updateElement('profile-lvl-usd', `(~$${lvlUSD})`);

    // اطلاعات باینری
    const binaryPoints = ethers.formatUnits(userData.binaryPoints, 18);
    const binaryPointCap = ethers.formatUnits(userData.binaryPointCap, 18);
    const binaryPointsClaimed = ethers.formatUnits(userData.binaryPointsClaimed, 18);
    
    updateElement('profile-income-cap', binaryPointCap);
    updateElement('profile-received', binaryPointsClaimed);

    // لینک دعوت
    const referralLink = `${window.location.origin}/?ref=${profile.address}`;
    updateElement('profile-referral-link', referralLink);

    // نمایش وضعیت
    const statusElement = document.getElementById('profileStatus');
    if (statusElement) {
        statusElement.textContent = 'اطلاعات پروفایل بارگذاری شد';
        statusElement.style.color = '#4CAF50';
    }
}

// راه‌اندازی دکمه کپی لینک دعوت
function setupReferralCopy() {
    const copyBtn = document.getElementById('copyProfileReferral');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            try {
                const { address } = await connectWallet();
                const referralLink = `${window.location.origin}/?ref=${address}`;
                
                await navigator.clipboard.writeText(referralLink);
                copyBtn.textContent = 'کپی شد!';
                setTimeout(() => copyBtn.textContent = 'کپی', 1500);
            } catch (error) {
                console.error("Error copying referral link:", error);
                showProfileError("خطا در کپی کردن لینک دعوت");
            }
        });
    }
}

// تابع نمایش خطا
function showProfileError(message) {
    const statusElement = document.getElementById('profileStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = '#ff6b6b';
    }
}

// تابع اتصال به کیف پول
async function connectWallet() {
    if (!window.contractConfig) {
        throw new Error("Contract config not initialized");
    }

    await window.contractConfig.initializeWeb3();
    return {
        provider: window.contractConfig.provider,
        contract: window.contractConfig.contract,
        signer: window.contractConfig.signer,
        address: await window.contractConfig.signer.getAddress()
    };
}

// تابع دریافت پروفایل کاربر
async function fetchUserProfile() {
    try {
        const { provider, contract, address } = await connectWallet();

        // دریافت موجودی‌ها به صورت موازی
        const [maticBalance, lvlBalance] = await Promise.all([
            provider.getBalance(address),
            contract.balanceOf(address)
        ]);

        return {
            address,
            maticBalance: ethers.formatEther(maticBalance),
            lvlBalance: ethers.formatUnits(lvlBalance, 18)
        };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
}

// تابع بررسی وضعیت اتصال
async function checkConnection() {
    try {
        const { provider, address } = await connectWallet();
        const network = await provider.getNetwork();
        
        return {
            connected: true,
            address,
            network: network.name,
            chainId: network.chainId
        };
    } catch (error) {
        return {
            connected: false,
            error: error.message
        };
    }
}