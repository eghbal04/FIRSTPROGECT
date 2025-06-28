// shop.js
let isShopLoading = false;

document.addEventListener('DOMContentLoaded', function() {
    // Shop section loaded, waiting for wallet connection...
    waitForWalletConnection();
});

async function waitForWalletConnection() {
    try {
        // Shop section loaded, waiting for wallet connection...
        await loadProducts();
    } catch (error) {
        console.error('Error in shop section:', error);
        showShopError("خطا در بارگذاری فروشگاه");
    }
}

// محصولات فروشگاه
const products = [
    {
        id: 1,
        name: "دوره آموزشی بلاکچین",
        description: "آموزش جامع مفاهیم بلاکچین و ارزهای دیجیتال",
        price: 50,
        currency: "USD",
        icon: "🔗",
        color: "#00ff88"
    },
    {
        id: 2,
        name: "دوره آموزشی DeFi",
        description: "آموزش امور مالی غیرمتمرکز و پروتکل‌های DeFi",
        price: 75,
        currency: "USD",
        icon: "💰",
        color: "#00ccff"
    },
    {
        id: 3,
        name: "دوره آموزشی NFT",
        description: "آموزش کامل مفاهیم NFT و نحوه ساخت و فروش",
        price: 60,
        currency: "USD",
        icon: "🎨",
        color: "#ff6b6b"
    },
    {
        id: 4,
        name: "دوره آموزشی Smart Contracts",
        description: "آموزش نوشتن قراردادهای هوشمند با Solidity",
        price: 100,
        currency: "USD",
        icon: "⚡",
        color: "#4ecdc4"
    }
];

// تابع بارگذاری محصولات
async function loadProducts() {
    if (isShopLoading) {
        // Shop already loading, skipping...
        return;
    }
    
    isShopLoading = true;
    
    try {
        // Connecting to wallet for shop data...
        const { contract, address } = await connectWallet();
        // Wallet connected, loading shop products...
        
        // دریافت موجودی LVL کاربر
        const lvlBalance = await contract.balanceOf(address);
        const lvlPrice = await contract.getLatestLvlPrice();
        
        // محاسبه ارزش دلاری موجودی LVL
        const lvlValueUSD = (parseFloat(ethers.formatEther(lvlBalance)) * parseFloat(ethers.formatUnits(lvlPrice, 8))).toFixed(2);
        
        // تبدیل موجودی LVL به عدد
        const userLVLBalance = parseFloat(ethers.formatEther(lvlBalance));
        
        // نمایش محصولات با موجودی واقعی LVL
        displayProducts(products, lvlValueUSD, userLVLBalance);
        
        // Shop products loaded successfully
        
    } catch (error) {
        console.error('Error loading shop products:', error);
        showShopError("خطا در بارگذاری محصولات");
    } finally {
        isShopLoading = false;
    }
}

// تابع نمایش محصولات
function displayProducts(products, userBalanceUSD, userLVLBalance) {
    const productsList = document.getElementById('products-list');
    if (!productsList) {
        console.error('Products list container not found');
        return;
    }

    // پاک کردن محتوای قبلی
    productsList.innerHTML = '';

    // نمایش موجودی کاربر
    const balanceDisplay = document.createElement('div');
    balanceDisplay.className = 'shop-balance';
    balanceDisplay.innerHTML = `
        <h4 class="shop-balance-title">موجودی شما</h4>
        <div class="shop-balance-usd">$${userBalanceUSD}</div>
        <div class="shop-balance-lvl">(~${userLVLBalance.toFixed(2)} LVL)</div>
    `;
    productsList.appendChild(balanceDisplay);

    // نمایش محصولات
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // محاسبه قیمت در LVL (تقریبی - 1 USD = 1 LVL برای سادگی)
        const priceInLVL = product.price; // فعلاً همان قیمت USD را استفاده می‌کنیم
        
        // بررسی اینکه آیا کاربر موجودی کافی دارد
        const hasSufficientBalance = userLVLBalance >= priceInLVL;
        
        productCard.innerHTML = `
            <div class="product-icon" style="background: ${product.color};">${product.icon}</div>
            <div style="flex: 1;">
                <h4 class="product-title">${product.name}</h4>
                <p class="product-desc">${product.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span class="product-price">${priceInLVL} LVL</span>
                        <br>
                        <span class="product-price-usd">(~$${product.price})</span>
                        ${!hasSufficientBalance ? `<br><span class="product-insufficient">موجودی ناکافی</span>` : ''}
                    </div>
                    <button class="buy-btn ${hasSufficientBalance ? 'enabled' : 'disabled'}" 
                            data-product-id="${product.id}" 
                            data-price="${priceInLVL}"
                            ${!hasSufficientBalance ? 'disabled' : ''}>
                        ${hasSufficientBalance ? 'خرید محصول' : 'موجودی ناکافی'}
                    </button>
                </div>
            </div>
        `;
        productsList.appendChild(productCard);
    });

    // راه‌اندازی خرید محصولات
    setupProductPurchases();
}

// راه‌اندازی خرید محصولات
function setupProductPurchases() {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;

    productsList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('buy-btn')) {
            const productId = parseInt(e.target.dataset.productId);
            const price = parseFloat(e.target.dataset.price);
            
            await purchaseProduct(productId, price, e.target);
        }
    });
}

// خرید محصول
async function purchaseProduct(productId, price, button) {
    try {
        // بررسی اتصال کیف پول
        const connection = await checkConnection();
        if (!connection.connected) {
            showShopError("لطفا ابتدا کیف پول خود را متصل کنید");
            return;
        }

        // بررسی موجودی کاربر
        const profile = await fetchUserProfile();
        const userBalance = parseFloat(profile.lvlBalance);
        
        if (userBalance < price) {
            showShopError("موجودی شما کافی نیست. موجودی: " + userBalance + " LVL");
            return;
        }

        // تأیید خرید
        const confirmed = confirm(`آیا از خرید این محصول به قیمت ${price} LVL اطمینان دارید؟`);
        if (!confirmed) return;

        // غیرفعال کردن دکمه
        button.disabled = true;
        button.textContent = 'در حال خرید...';

        // انجام تراکنش خرید - استفاده از آدرس deployer به عنوان فروشگاه
        const { contract } = await connectWallet();
        const amountInWei = ethers.parseUnits(price.toString(), 18);
        
        // استفاده از آدرس deployer قرارداد به عنوان آدرس فروشگاه
        const deployerAddress = await contract.deployer();
        
        const tx = await contract.transfer(deployerAddress, amountInWei);
        await tx.wait();

        // نمایش پیام موفقیت
        showShopSuccess(`محصول با موفقیت خریداری شد! تراکنش: ${tx.hash}`);
        
        // به‌روزرسانی محصولات بعد از خرید موفق
        setTimeout(async () => {
            try {
                await loadProducts();
            } catch (error) {
                console.error("Error refreshing products after purchase:", error);
            }
        }, 2000);

    } catch (error) {
        console.error("Purchase error:", error);
        showShopError("خطا در خرید محصول: " + error.message);
    } finally {
        // فعال کردن مجدد دکمه
        button.disabled = false;
        button.textContent = 'خرید محصول';
    }
}

// نمایش خطای فروشگاه
function showShopError(message) {
    const shopStatus = document.getElementById('shopStatus');
    if (shopStatus) {
        shopStatus.textContent = message;
        shopStatus.style.color = '#ff6b6b';
    }
}

// نمایش پیام موفقیت فروشگاه
function showShopSuccess(message) {
    const shopStatus = document.getElementById('shopStatus');
    if (shopStatus) {
        shopStatus.textContent = message;
        shopStatus.style.color = '#4CAF50';
    }
}

// تابع اتصال به کیف پول
async function connectWallet() {
    try {
        console.log('Shop: Attempting to connect wallet...');
        
        // بررسی اتصال موجود
        if (window.contractConfig && window.contractConfig.contract) {
            console.log('Shop: Wallet already connected');
            return window.contractConfig;
        }
        
        // بررسی اتصال MetaMask موجود
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                console.log('Shop: MetaMask already connected, initializing Web3...');
                try {
                    await initializeWeb3();
                    return window.contractConfig;
                } catch (error) {
                    console.log('Shop: Failed to initialize Web3:', error);
                    throw new Error('خطا در راه‌اندازی Web3');
                }
            }
        }
        
        console.log('Shop: No existing connection, user needs to connect manually');
        throw new Error('لطفاً ابتدا کیف پول خود را متصل کنید');
        
    } catch (error) {
        console.error('Shop: Error connecting wallet:', error);
        showShopError('خطا در اتصال به کیف پول');
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
            lvlBalance: ethers.formatEther(lvlBalance)
        };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
} 