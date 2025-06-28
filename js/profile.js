// --- Profile Page Logic ---
let isProfileLoading = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("Profile section loaded, waiting for wallet connection...");
        // بررسی وجود ethers و contractConfig
        if (typeof ethers === 'undefined' || !window.contractConfig) {
            throw new Error("Ethers.js or contract config not loaded");
        }

        // بارگذاری اطلاعات پروفایل
        await loadUserProfile();

        // راه‌اندازی دکمه کپی لینک دعوت
        setupReferralCopy();

    } catch (error) {
        console.error("Error in profile section:", error);
        showProfileError("خطا در بارگذاری پروفایل");
    }
});

// تابع بارگذاری پروفایل کاربر
async function loadUserProfile() {
    if (isProfileLoading) {
        console.log("Profile already loading, skipping...");
        return;
    }
    
    isProfileLoading = true;
    
    try {
        console.log("Connecting to wallet for profile data...");
        const { contract, address } = await connectWallet();
        console.log("Wallet connected, fetching profile data...");
        
        // دریافت اطلاعات کاربر
        const userData = await contract.users(address);
        
        // دریافت موجودی‌ها
        const [maticBalance, lvlBalance] = await Promise.all([
            contract.provider.getBalance(address),
            contract.balanceOf(address)
        ]);
        
        // دریافت قیمت‌ها
        const [maticPrice, lvlPrice] = await Promise.all([
            contract.getLatestMaticPrice(),
            contract.getTokenPriceInUSD()
        ]);
        
        // بررسی وضعیت claimable
        const isClaimable = await contract.isClaimable(address);
        
        // دریافت قیمت ثبت‌نام
        const registrationPrice = await contract.getRegistrationPrice();
        
        // فرمت کردن مقادیر
        const profile = {
            address,
            maticBalance: ethers.formatEther(maticBalance),
            lvlBalance: ethers.formatUnits(lvlBalance, 18),
            maticPrice: ethers.formatUnits(maticPrice, 8),
            lvlPrice: ethers.formatUnits(lvlPrice, 8),
            isRegistered: userData.activated,
            binaryPoints: ethers.formatUnits(userData.binaryPoints, 18),
            binaryPointCap: ethers.formatUnits(userData.binaryPointCap, 18),
            referrer: userData.referrer,
            isClaimable
        };
        
        console.log("Profile data fetched successfully:", profile);
        
        // به‌روزرسانی UI
        updateProfileUI(profile, userData, isClaimable, registrationPrice, maticPrice, lvlPrice);
        
    } catch (error) {
        console.error("Error loading user profile:", error);
        showProfileError("خطا در بارگذاری پروفایل: " + error.message);
    } finally {
        isProfileLoading = false;
    }
}

// به‌روزرسانی UI پروفایل
function updateProfileUI(profile, userData, isClaimable, registrationPrice, maticPrice, lvlPrice) {
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    // اطلاعات اصلی
    updateElement('profile-address', shortenAddress(profile.address));
    updateElement('profile-referrer', userData.referrer ? shortenAddress(userData.referrer) : 'بدون معرف');
    // نمایش موجودی‌ها به دلار و توکن
    updateElement('profile-matic', parseFloat(profile.maticBalance).toLocaleString('en-US', {maximumFractionDigits: 4}) + ' MATIC');
    updateElement('profile-lvl', parseFloat(profile.lvlBalance).toLocaleString('en-US', {maximumFractionDigits: 4}) + ' LVL');

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
    const shortReferral = referralLink.length > 32 ? referralLink.substring(0, 20) + '...' + referralLink.slice(-8) : referralLink;
    if (userData.activated) {
        updateElement('profile-referral-link', shortReferral);
    } else {
        updateElement('profile-referral-link', '---');
    }

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

function shortenAddress(address) {
    if (!address) return '---';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}