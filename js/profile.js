// --- Profile Page Logic ---
let isProfileLoading = false;

document.addEventListener('DOMContentLoaded', function() {
    // Profile section loaded, waiting for wallet connection...
    waitForWalletConnection();
});

async function waitForWalletConnection() {
    try {
        // Profile section loaded, waiting for wallet connection...
        await loadUserProfile();
    } catch (error) {
        console.error('Error in profile section:', error);
        showProfileError("خطا در بارگذاری پروفایل");
    }
}

// تابع بارگذاری پروفایل کاربر
async function loadUserProfile() {
    if (isProfileLoading) {
        // Profile already loading, skipping...
        return;
    }
    
    isProfileLoading = true;
    
    try {
        // Connecting to wallet for profile data...
        const { contract, signer, provider, address } = await connectWallet();
        
        // بررسی اینکه آیا همه موارد مورد نیاز موجود هستند
        if (!contract || !signer || !provider || !address) {
            throw new Error("Wallet connection incomplete");
        }
        
        // Wallet connected, fetching profile data...
        
        // دریافت اطلاعات کاربر
        const userData = await contract.users(address);
        const maticBalance = await provider.getBalance(address);
        const lvlBalance = await contract.balanceOf(address);
        const maticPrice = await contract.getLatestMaticPrice();
        const lvlPrice = await contract.getLatestLvlPrice();
        
        // محاسبه ارزش دلاری
        const maticValueUSD = (parseFloat(ethers.formatEther(maticBalance)) * parseFloat(ethers.formatUnits(maticPrice, 8))).toFixed(2);
        const lvlValueUSD = (parseFloat(ethers.formatEther(lvlBalance)) * parseFloat(ethers.formatUnits(lvlPrice, 8))).toFixed(2);
        
        // بررسی اینکه آیا کاربر ثبت‌نام کرده است
        const isRegistered = userData.index > 0;
        
        const profile = {
            address: address,
            maticBalance: ethers.formatEther(maticBalance),
            lvlBalance: ethers.formatEther(lvlBalance),
            maticPrice: ethers.formatUnits(maticPrice, 8),
            lvlPrice: ethers.formatUnits(lvlPrice, 8),
            maticValueUSD: maticValueUSD,
            lvlValueUSD: lvlValueUSD,
            isRegistered: isRegistered,
            referrer: isRegistered ? userData.referrer : 'کاربر ثبت‌نام نکرده',
            incomeCap: isRegistered ? userData.binaryPointCap.toString() : '0',
            received: isRegistered ? ethers.formatEther(userData.binaryPointsClaimed) : '0',
            referralLink: `${window.location.origin}${window.location.pathname}?ref=${address}`
        };
        
        // Profile data fetched successfully: ${profile}
        updateProfileUI(profile);
        
    } catch (error) {
        console.error('Error loading profile data:', error);
        showProfileError("خطا در بارگذاری اطلاعات پروفایل: " + error.message);
    } finally {
        isProfileLoading = false;
    }
}

// به‌روزرسانی UI پروفایل
function updateProfileUI(profile) {
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    // اطلاعات اصلی
    updateElement('profile-address', shortenAddress(profile.address));
    updateElement('profile-referrer', profile.referrer === 'کاربر ثبت‌نام نکرده' ? profile.referrer : shortenAddress(profile.referrer));
    // نمایش موجودی‌ها به دلار و توکن
    updateElement('profile-matic', parseFloat(profile.maticBalance).toLocaleString('en-US', {maximumFractionDigits: 4}) + ' MATIC');
    updateElement('profile-lvl', parseFloat(profile.lvlBalance).toLocaleString('en-US', {maximumFractionDigits: 4}) + ' LVL');

    // تبدیل قیمت‌ها به مقادیر خوانا - profile.maticPrice و profile.lvlPrice قبلاً فرمت شده‌اند
    const maticPriceInUSD = parseFloat(profile.maticPrice); // قبلاً با formatUnits تبدیل شده
    const lvlPriceInUSD = parseFloat(profile.lvlPrice);     // قبلاً با formatUnits تبدیل شده

    // محاسبه ارزش دلاری (واقعی)
    const maticUSD = (parseFloat(profile.maticBalance) * maticPriceInUSD).toFixed(2);
    const lvlUSD = (parseFloat(profile.lvlBalance) * lvlPriceInUSD).toFixed(2);
    
    updateElement('profile-matic-usd', `(~$${maticUSD})`);
    updateElement('profile-lvl-usd', `(~$${lvlUSD})`);

    // اطلاعات باینری - profile.received قبلاً به string تبدیل شده
    const binaryPoints = profile.received; // قبلاً فرمت شده
    const binaryPointCap = profile.incomeCap;
    const binaryPointsClaimed = profile.received; // قبلاً فرمت شده
    
    // نمایش سقف درآمد باینری (تعداد پوینت‌های قابل دریافت در هر 12 ساعت)
    const incomeCapDisplay = `${binaryPointCap} پوینت (هر 12 ساعت)`;
    
    updateElement('profile-income-cap', incomeCapDisplay);
    updateElement('profile-received', Math.round(parseFloat(binaryPointsClaimed)));

    // لینک دعوت
    const referralLink = profile.referralLink;
    const shortReferral = referralLink.length > 32 ? referralLink.substring(0, 20) + '...' + referralLink.slice(-8) : referralLink;
    updateElement('profile-referral-link', shortReferral);

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
    try {
        console.log('Profile: Attempting to connect wallet...');
        
        // بررسی اتصال موجود
        if (window.contractConfig && window.contractConfig.contract) {
            console.log('Profile: Wallet already connected');
            return window.contractConfig;
        }
        
        // بررسی اتصال MetaMask موجود
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                console.log('Profile: MetaMask already connected, initializing Web3...');
                try {
                    await initializeWeb3();
                    return window.contractConfig;
                } catch (error) {
                    console.log('Profile: Failed to initialize Web3:', error);
                    throw new Error('خطا در راه‌اندازی Web3');
                }
            }
        }
        
        console.log('Profile: No existing connection, user needs to connect manually');
        throw new Error('لطفاً ابتدا کیف پول خود را متصل کنید');
        
    } catch (error) {
        console.error('Profile: Error connecting wallet:', error);
        showProfileError('خطا در اتصال به کیف پول');
        throw error;
    }
}

// تابع دریافت پروفایل کاربر
async function fetchUserProfile() {
    try {
        const { provider, contract, address } = await connectWallet();
        
        // بررسی اینکه آیا همه موارد مورد نیاز موجود هستند
        if (!provider || !contract || !address) {
            throw new Error("Wallet connection incomplete");
        }

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