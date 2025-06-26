// shop.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // بررسی وجود ethers و contractConfig
        if (typeof ethers === 'undefined' || !window.contractConfig) {
            throw new Error("Ethers.js or contract config not loaded");
        }

        // بارگذاری محصولات
        loadProducts();

        // راه‌اندازی خرید محصولات
        setupProductPurchases();

    } catch (error) {
        console.error("Error in shop page:", error);
        showShopError("خطا در بارگذاری فروشگاه");
    }
});

// محصولات فروشگاه
const shopProducts = [
    {
        id: 1,
        title: "دوره آموزشی بلاکچین",
        description: "آموزش جامع مفاهیم بلاکچین و ارزهای دیجیتال",
        price: 100, // قیمت به LVL
        category: "آموزشی"
    },
    {
        id: 2,
        title: "دوره برنامه‌نویسی Solidity",
        description: "آموزش نوشتن قراردادهای هوشمند",
        price: 150,
        category: "آموزشی"
    },
    {
        id: 3,
        title: "کتاب راهنمای سرمایه‌گذاری",
        description: "راهنمای کامل سرمایه‌گذاری در ارزهای دیجیتال",
        price: 50,
        category: "کتاب"
    },
    {
        id: 4,
        title: "مشاوره خصوصی",
        description: "جلسه مشاوره 1 ساعته با متخصص",
        price: 200,
        category: "مشاوره"
    }
];

// بارگذاری محصولات
function loadProducts() {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;

    // فرض: قیمت LVL به دلار را از getPrices می‌گیریم
    getPrices().then(prices => {
        const lvlPriceUSD = parseFloat(prices.tokenPriceUSD);
        productsList.innerHTML = shopProducts.map(product => {
            const usdPrice = (product.price * lvlPriceUSD).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 8});
            return `
                <div class="product-card">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 1rem;">
                        <img src="../lvl.jpg" alt="LVL" style="width: 24px; height: 24px; border-radius: 50%;">
                        <h3 class="product-title">${product.title}</h3>
                    </div>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-price">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <img src="../lvl.jpg" alt="LVL" style="width: 18px; height: 18px; border-radius: 50%;">
                            <span>${product.price} LVL (~$${usdPrice} USD)</span>
                        </div>
                    </div>
                    <button class="buy-btn" data-product-id="${product.id}" data-price="${product.price}">
                        خرید محصول
                    </button>
                </div>
            `;
        }).join('');
    });
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

        // انجام تراکنش خرید (در اینجا می‌توانید منطق خاص خود را اضافه کنید)
        // برای مثال، انتقال توکن به آدرس فروشگاه
        const { contract } = await connectWallet();
        const amountInWei = ethers.parseUnits(price.toString(), 18);
        
        // در اینجا می‌توانید آدرس فروشگاه را تنظیم کنید
        const shopAddress = "0x0000000000000000000000000000000000000000"; // آدرس فروشگاه
        
        const tx = await contract.transfer(shopAddress, amountInWei);
        await tx.wait();

        // نمایش پیام موفقیت
        showShopSuccess(`محصول با موفقیت خریداری شد! تراکنش: ${tx.hash}`);
        
        // به‌روزرسانی موجودی بدون رفرش صفحه
        // setTimeout(() => {
        //     location.reload();
        // }, 2000);
        
        // به جای رفرش، فقط پیام موفقیت نمایش داده می‌شود
        // کاربر می‌تواند خودش صفحه را رفرش کند اگر نیاز داشت

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