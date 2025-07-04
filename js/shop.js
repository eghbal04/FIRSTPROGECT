// shop.js
let isShopLoading = false;
let shopSubAdmins = [];
let currentEditingShopAdmin = null;

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

// محصولات فروشگاه با درصد سود ثابت (خدماتی: درصد بالاتر، فیزیکی: درصد پایین‌تر)
const products = [
    {
        id: 1,
        name: "دوره آموزشی بلاکچین",
        description: "آموزش جامع مفاهیم بلاکچین و ارزهای دیجیتال",
        price: 50,
        currency: "USD",
        icon: "🔗",
        color: "#00ff88",
        percent: 70 // خدماتی - سود بالا
    },
    {
        id: 2,
        name: "دوره آموزشی DeFi",
        description: "آموزش امور مالی غیرمتمرکز و پروتکل‌های DeFi",
        price: 75,
        currency: "USD",
        icon: "💰",
        color: "#00ccff",
        percent: 65 // خدماتی - سود بالا
    },
    {
        id: 3,
        name: "دوره آموزشی NFT",
        description: "آموزش کامل مفاهیم NFT و نحوه ساخت و فروش",
        price: 60,
        currency: "USD",
        icon: "🎨",
        color: "#ff6b6b",
        percent: 60 // خدماتی - سود بالا
    },
    {
        id: 4,
        name: "پکیج سخت‌افزاری کیف پول",
        description: "کیف پول سخت‌افزاری فیزیکی برای نگهداری امن رمزارزها",
        price: 120,
        currency: "USD",
        icon: "💾",
        color: "#4ecdc4",
        percent: 35 // فیزیکی - سود پایین
    },
    {
        id: 5,
        name: "کتاب چاپی بلاکچین",
        description: "کتاب فیزیکی آموزش بلاکچین و رمزارزها",
        price: 40,
        currency: "USD",
        icon: "📚",
        color: "#ffb347",
        percent: 25 // فیزیکی - سود پایین
    }
];

// آرایه سفارشات (در حافظه موقت)
const orders = [];

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
        const deployerAddress = await contract.deployer();
        // Wallet connected, loading shop products...
        
        // دریافت موجودی LVL کاربر
        const lvlBalance = await contract.balanceOf(address);
        const lvlPrice = await contract.getTokenPrice();
        
        // دریافت باقیمانده خرید کاربر
        const user = await contract.users(address);
        const totalPurchasedKind = user.totalPurchasedKind || 0n;
        const purchasedKindFormatted = parseFloat(ethers.formatUnits(totalPurchasedKind, 18));
        
        // محاسبه ارزش دلاری موجودی LVL
        const lvlValueUSD = (parseFloat(ethers.formatEther(lvlBalance)) * parseFloat(ethers.formatUnits(lvlPrice, 18))).toFixed(2);
        
        // تبدیل موجودی LVL به عدد
        const userLVLBalance = parseFloat(ethers.formatEther(lvlBalance));
        
        // نمایش محصولات با موجودی واقعی LVL و باقیمانده خرید
        displayProducts(products, lvlValueUSD, userLVLBalance, purchasedKindFormatted);
        
        // اگر کاربر deployer است، گزینه‌های مدیریتی را نمایش بده
        if (address.toLowerCase() === deployerAddress.toLowerCase()) {
            showAdminOptions();
        }
        // Shop products loaded successfully
        
    } catch (error) {
        console.error('Error loading shop products:', error);
        showShopError("خطا در بارگذاری محصولات");
    } finally {
        isShopLoading = false;
    }
}

// تابع نمایش محصولات
function displayProducts(products, userBalanceUSD, userLVLBalance, purchasedKind) {
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
        <div class="shop-balance-purchased" style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #a786ff33; color: #a786ff; font-size: 0.9rem;">
            باقیمانده خریدهای قبلی: ${purchasedKind.toFixed(5)} LVL
        </div>
    `;
    productsList.appendChild(balanceDisplay);

    // نمایش محصولات
    products.forEach((product) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // محاسبه قیمت در LVL (تقریبی - 1 USD = 1 LVL برای سادگی)
        const priceInLVL = product.price; // فعلاً همان قیمت USD را استفاده می‌کنیم
        
        // بررسی اینکه آیا کاربر موجودی کافی دارد
        const hasSufficientBalance = userLVLBalance >= priceInLVL;
        
        // نمایش درصد سود ثابت (غیرقابل انتخاب)
        const percentDisplay = `<span style='font-size:0.95em; color:#a786ff;'>حاشیه سود: ${product.percent}%</span>`;
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
                        <br>
                        ${percentDisplay}
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
            // درصد ثابت هر محصول
            const product = products.find(p => p.id === productId);
            const percent = product ? product.percent : 30;
            await purchaseProduct(productId, price, percent, e.target);
        }
    });
}

// خرید محصول
async function purchaseProduct(productId, price, percent, button) {
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
        const confirmed = confirm(`آیا از خرید این محصول به قیمت ${price} LVL با ${percent}% ورود به باینری اطمینان دارید؟`);
        if (!confirmed) return;

        // غیرفعال کردن دکمه
        button.disabled = true;
        button.textContent = 'در حال خرید...';

        // انجام تراکنش خرید - استفاده از آدرس deployer به عنوان فروشگاه
        const { contract, address } = await connectWallet();
        const priceFixed = Number(price).toFixed(6);
        const amountInWei = ethers.parseUnits(priceFixed, 18);
        const payoutPercent = percent; // عدد صحیح درصد
        // استفاده از آدرس deployer قرارداد به عنوان آدرس فروشگاه
        const deployerAddress = await contract.deployer();
        const tx = await contract.purchase(amountInWei, payoutPercent);
        await tx.wait();

        // ثبت سفارش
        const product = products.find(p => p.id === productId);
        const order = {
            id: orders.length + 1,
            productId: productId,
            productName: product ? product.name : 'محصول ناشناخته',
            customerAddress: address,
            price: price,
            percent: percent,
            transactionHash: tx.hash,
            timestamp: new Date().toLocaleString('fa-IR'),
            status: 'completed'
        };
        orders.push(order);

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
        // اگر کاربر تراکنش را رد کرد، پیام کوتاه نمایش بده
        if (
            error.code === 4001 ||
            (error.message && error.message.includes('user denied')) ||
            (error.info && error.info.error && error.info.error.code === 4001)
        ) {
            showShopError("لغو توسط کاربر");
        } else {
            showShopError("خطا در خرید محصول: " + error.message);
        }
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
        // استفاده از تابع مرکزی connectWallet
        if (window.connectWallet) {
            const result = await window.connectWallet();
            if (result && result.contract && result.address) {
                return result;
            }
        }
        
        // بررسی اتصال موجود
        if (window.contractConfig && window.contractConfig.contract && window.contractConfig.address) {
            return {
                contract: window.contractConfig.contract,
                address: window.contractConfig.address,
                signer: window.contractConfig.signer,
                provider: window.contractConfig.provider
            };
        }
        
        // بررسی اتصال MetaMask موجود
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                try {
                    if (window.initializeWeb3) {
                        await window.initializeWeb3();
                        if (window.contractConfig && window.contractConfig.contract) {
                            return {
                                contract: window.contractConfig.contract,
                                address: window.contractConfig.address,
                                signer: window.contractConfig.signer,
                                provider: window.contractConfig.provider
                            };
                        }
                    }
                } catch (error) {
                    console.error('Error initializing Web3:', error);
                }
            }
        }
        
        throw new Error('لطفاً ابتدا کیف پول خود را متصل کنید');
        
    } catch (error) {
        console.error('Shop: Error connecting wallet:', error);
        throw error;
    }
}

// تابع بررسی وضعیت اتصال
async function checkConnection() {
    try {
        const result = await connectWallet();
        if (!result || !result.contract || !result.address) {
            throw new Error('Wallet connection failed');
        }
        
        const { contract, address } = result;
        const deployerAddress = await contract.deployer();
        
        if (address.toLowerCase() === deployerAddress.toLowerCase()) {
            // کاربر ادمین اصلی است
            showAdminOptions();
        } else if (isShopSubAdmin(address)) {
            // کاربر ساب ادمین شاپ است
            showAdminOptions();
            setupLimitedShopAdminControls(address);
        }
        
        await fetchUserProfile();
        return { connected: true, address, contract };
    } catch (e) {
        console.error('Error checking connection:', e);
        showShopError('خطا در اتصال به کیف پول: ' + (e.message || e));
        return { connected: false, error: e.message };
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
            maticBalance: ethers.formatEther(maticBalance), // POL
            lvlBalance: ethers.formatEther(lvlBalance)
        };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
}

function showAdminOptions() {
    // جلوگیری از تکرار پنل ادمین شاپ
    if (document.querySelector('.shop-admin-panel')) return;

    const productsList = document.getElementById('products-list');
    if (!productsList) return;
    const adminDiv = document.createElement('div');
    adminDiv.className = 'shop-admin-panel';
    adminDiv.innerHTML = `
        <h4 style="color:#ff6b6b;margin-top:1.5rem;">مدیریت فروشگاه (فقط دیپلویِر)</h4>
        <button id="add-product-btn" style="margin:0.5rem;">افزودن محصول جدید</button>
        <button id="edit-products-btn" style="margin:0.5rem;">ویرایش محصولات</button>
        <button id="view-orders-btn" style="margin:0.5rem;">مشاهده سفارشات</button>
        <button id="deposit-matic-btn" style="margin:0.5rem;background:#00ccff;color:#fff;">واریز متیک به قرارداد</button>
        <div id="add-product-form-container" style="display:none;margin-top:1rem;"></div>
        <div id="edit-products-form-container" style="display:none;margin-top:1rem;"></div>
        <div id="view-orders-container" style="display:none;margin-top:1rem;"></div>
    `;
    productsList.prepend(adminDiv);

    document.getElementById('add-product-btn').onclick = showAddProductForm;
    document.getElementById('edit-products-btn').onclick = showEditProductsForm;
    document.getElementById('view-orders-btn').onclick = showOrdersList;
    document.getElementById('deposit-matic-btn').onclick = depositMaticToContract;
    
    // راه‌اندازی کنترل‌های ساب ادمین شاپ
    setupShopSubAdminControls();
}

function showAddProductForm() {
    const formContainer = document.getElementById('add-product-form-container');
    if (!formContainer) return;
    formContainer.style.display = 'block';
    formContainer.innerHTML = `
        <form id="add-product-form" style="background:#181c2a;padding:1rem;border-radius:12px;box-shadow:0 2px 8px #0002;">
            <h5 style="color:#00ccff;">افزودن محصول جدید</h5>
            <input type="text" id="new-product-name" placeholder="نام محصول" required style="margin:0.5rem;width:90%;"><br>
            <input type="text" id="new-product-desc" placeholder="توضیحات محصول" required style="margin:0.5rem;width:90%;"><br>
            <input type="number" id="new-product-price" placeholder="قیمت (LVL)" required min="1" style="margin:0.5rem;width:90%;"><br>
            <input type="text" id="new-product-icon" placeholder="ایموجی یا آیکون" maxlength="2" style="margin:0.5rem;width:90%;"><br>
            <input type="color" id="new-product-color" value="#00ccff" style="margin:0.5rem;"><br>
            <input type="number" id="new-product-percent" placeholder="درصد سود (مثلاً 30)" required min="1" max="100" style="margin:0.5rem;width:90%;"><br>
            <button type="submit" style="margin:0.5rem;background:#00ff88;color:#000;">ثبت محصول</button>
            <button type="button" id="cancel-add-product" style="margin:0.5rem;">انصراف</button>
        </form>
    `;
    document.getElementById('cancel-add-product').onclick = () => {
        formContainer.style.display = 'none';
        formContainer.innerHTML = '';
    };
    document.getElementById('add-product-form').onsubmit = handleAddProductSubmit;
}

function handleAddProductSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('new-product-name').value.trim();
    const description = document.getElementById('new-product-desc').value.trim();
    const price = parseFloat(document.getElementById('new-product-price').value);
    const icon = document.getElementById('new-product-icon').value.trim() || '🛒';
    const color = document.getElementById('new-product-color').value || '#00ccff';
    const percent = parseInt(document.getElementById('new-product-percent').value) || 30;
    if (!name || !description || isNaN(price) || price <= 0) {
        alert('لطفاً همه فیلدها را به درستی وارد کنید.');
        return;
    }
    // افزودن محصول به لیست (در حافظه موقت)
    const newProduct = {
        id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name,
        description,
        price,
        currency: 'USD',
        icon,
        color,
        percent
    };
    products.push(newProduct);
    // بستن فرم و رفرش محصولات
    document.getElementById('add-product-form-container').style.display = 'none';
    document.getElementById('add-product-form-container').innerHTML = '';
    loadProducts();
    showShopSuccess('محصول جدید با موفقیت اضافه شد!');
}

async function depositMaticToContract() {
    try {
        const { contract, address } = await connectWallet();
        const contractAddress = contract.target || contract.address;
        // مقدار واریزی (مثلاً 0.1 متیک)
        const amount = prompt('مقدار متیک برای واریز به قرارداد را وارد کنید:', '0.1');
        if (!amount || isNaN(amount) || Number(amount) <= 0) return;
        const amountInWei = ethers.parseEther(amount);
        // ارسال تراکنش به آدرس قرارداد (تابع receive)
        const tx = await window.contractConfig.signer.sendTransaction({
            to: contractAddress,
            value: amountInWei
        });
        await tx.wait();
        showShopSuccess('واریز با موفقیت انجام شد! هش تراکنش: ' + tx.hash);
    } catch (e) {
        showShopError('خطا در واریز متیک: ' + (e.message || e));
    }
}

function showEditProductsForm() {
    const formContainer = document.getElementById('edit-products-form-container');
    if (!formContainer) return;
    
    formContainer.style.display = 'block';
    
    // بررسی دسترسی حذف محصول
    const currentAddress = window.contractConfig?.address;
    const canDelete = !currentAddress || checkShopSubAdminPermissions(currentAddress, 'perm-delete-product');
    
    // ایجاد لیست محصولات برای ویرایش
    let productsHtml = '';
    products.forEach((product, index) => {
        const deleteButton = canDelete ? 
            `<button type="button" onclick="deleteProduct(${product.id})" style="background:#ff6b6b;color:#fff;padding:0.3rem 0.8rem;border:none;border-radius:4px;cursor:pointer;">حذف محصول</button>` : '';
        
        productsHtml += `
            <div class="edit-product-item" style="background:#181c2a;padding:1rem;margin:0.5rem 0;border-radius:8px;border:1px solid #333;">
                <h6 style="color:#00ccff;margin:0 0 0.5rem 0;">محصول ${index + 1}: ${product.name}</h6>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.5rem;">
                    <input type="text" id="edit-name-${product.id}" value="${product.name}" placeholder="نام محصول" style="padding:0.3rem;">
                    <input type="text" id="edit-desc-${product.id}" value="${product.description}" placeholder="توضیحات" style="padding:0.3rem;">
                    <input type="number" id="edit-price-${product.id}" value="${product.price}" placeholder="قیمت" style="padding:0.3rem;">
                    <input type="text" id="edit-icon-${product.id}" value="${product.icon}" placeholder="آیکون" maxlength="2" style="padding:0.3rem;">
                    <input type="color" id="edit-color-${product.id}" value="${product.color}" style="padding:0.3rem;width:100%;">
                    <input type="number" id="edit-percent-${product.id}" value="${product.percent}" placeholder="درصد سود" min="1" max="100" style="padding:0.3rem;">
                </div>
                <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
                    <button type="button" onclick="handleEditProduct(${product.id})" style="background:#00ff88;color:#000;padding:0.3rem 0.8rem;border:none;border-radius:4px;cursor:pointer;">ذخیره تغییرات</button>
                    ${deleteButton}
                </div>
            </div>
        `;
    });
    
    formContainer.innerHTML = `
        <div style="background:#181c2a;padding:1rem;border-radius:12px;box-shadow:0 2px 8px #0002;">
            <h5 style="color:#00ccff;margin-bottom:1rem;">ویرایش محصولات</h5>
            <div id="edit-products-list">
                ${productsHtml}
            </div>
            <button type="button" id="cancel-edit-products" style="margin-top:1rem;background:#666;color:#fff;padding:0.5rem 1rem;border:none;border-radius:4px;cursor:pointer;">بستن</button>
        </div>
    `;
    
    document.getElementById('cancel-edit-products').onclick = () => {
        formContainer.style.display = 'none';
        formContainer.innerHTML = '';
    };
}

function handleEditProduct(productId) {
    // بررسی دسترسی ویرایش محصول
    const currentAddress = window.contractConfig?.address;
    if (currentAddress && !checkShopSubAdminPermissions(currentAddress, 'perm-edit-product')) {
        showShopError('شما دسترسی ویرایش محصول ندارید.');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        alert('محصول یافت نشد!');
        return;
    }
    
    const name = document.getElementById(`edit-name-${productId}`).value.trim();
    const description = document.getElementById(`edit-desc-${productId}`).value.trim();
    const price = parseFloat(document.getElementById(`edit-price-${productId}`).value);
    const icon = document.getElementById(`edit-icon-${productId}`).value.trim() || '🛒';
    const color = document.getElementById(`edit-color-${productId}`).value || '#00ccff';
    const percent = parseInt(document.getElementById(`edit-percent-${productId}`).value) || 30;
    
    if (!name || !description || isNaN(price) || price <= 0 || isNaN(percent) || percent <= 0) {
        alert('لطفاً همه فیلدها را به درستی وارد کنید.');
        return;
    }
    
    // بروزرسانی محصول
    product.name = name;
    product.description = description;
    product.price = price;
    product.icon = icon;
    product.color = color;
    product.percent = percent;
    
    // رفرش محصولات
    loadProducts();
    showShopSuccess('محصول با موفقیت ویرایش شد!');
}

function deleteProduct(productId) {
    // بررسی دسترسی حذف محصول
    const currentAddress = window.contractConfig?.address;
    if (currentAddress && !checkShopSubAdminPermissions(currentAddress, 'perm-delete-product')) {
        showShopError('شما دسترسی حذف محصول ندارید.');
        return;
    }
    
    if (!confirm('آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟')) {
        return;
    }
    
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
        alert('محصول یافت نشد!');
        return;
    }
    
    // حذف محصول از آرایه
    products.splice(productIndex, 1);
    
    // رفرش محصولات
    loadProducts();
    showShopSuccess('محصول با موفقیت حذف شد!');
    
    // اگر فرم ویرایش باز است، آن را بروزرسانی کن
    const formContainer = document.getElementById('edit-products-form-container');
    if (formContainer && formContainer.style.display !== 'none') {
        showEditProductsForm();
    }
}

function showOrdersList() {
    const container = document.getElementById('view-orders-container');
    if (!container) return;
    
    container.style.display = 'block';
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div style="background:#181c2a;padding:1rem;border-radius:12px;box-shadow:0 2px 8px #0002;">
                <h5 style="color:#00ccff;margin-bottom:1rem;">مشاهده سفارشات</h5>
                <p style="color:#888;text-align:center;padding:2rem;">هنوز هیچ سفارشی ثبت نشده است.</p>
                <button type="button" id="cancel-view-orders" style="background:#666;color:#fff;padding:0.5rem 1rem;border:none;border-radius:4px;cursor:pointer;">بستن</button>
            </div>
        `;
    } else {
        let ordersHtml = '';
        orders.forEach((order, index) => {
            const shortAddress = order.customerAddress.substring(0, 6) + '...' + order.customerAddress.substring(order.customerAddress.length - 4);
            const shortHash = order.transactionHash.substring(0, 10) + '...' + order.transactionHash.substring(order.transactionHash.length - 8);
            
            ordersHtml += `
                <div class="order-item" style="background:#181c2a;padding:1rem;margin:0.5rem 0;border-radius:8px;border:1px solid #333;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                        <h6 style="color:#00ccff;margin:0;">سفارش #${order.id}</h6>
                        <span style="background:#4CAF50;color:#fff;padding:0.2rem 0.5rem;border-radius:4px;font-size:0.8rem;">${order.status}</span>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;font-size:0.9rem;">
                        <div><strong>محصول:</strong> ${order.productName}</div>
                        <div><strong>قیمت:</strong> ${order.price} LVL</div>
                        <div><strong>درصد سود:</strong> ${order.percent}%</div>
                        <div><strong>مشتری:</strong> ${shortAddress}</div>
                        <div><strong>تاریخ:</strong> ${order.timestamp}</div>
                        <div><strong>تراکنش:</strong> <span style="color:#00ccff;cursor:pointer;" onclick="copyToClipboard('${order.transactionHash}')" title="کپی هش تراکنش">${shortHash}</span></div>
                    </div>
                    <div style="margin-top:0.5rem;display:flex;gap:0.5rem;">
                        <button type="button" onclick="viewOrderDetails(${order.id})" style="background:#00ccff;color:#fff;padding:0.3rem 0.8rem;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">جزئیات کامل</button>
                        <button type="button" onclick="copyOrderInfo(${order.id})" style="background:#ffb347;color:#000;padding:0.3rem 0.8rem;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">کپی اطلاعات</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = `
            <div style="background:#181c2a;padding:1rem;border-radius:12px;box-shadow:0 2px 8px #0002;">
                <h5 style="color:#00ccff;margin-bottom:1rem;">مشاهده سفارشات (${orders.length} سفارش)</h5>
                <div style="margin-bottom:1rem;display:flex;gap:0.5rem;">
                    <button type="button" onclick="exportOrdersToCSV()" style="background:#00ff88;color:#000;padding:0.5rem 1rem;border:none;border-radius:4px;cursor:pointer;">خروجی CSV</button>
                    <button type="button" onclick="clearAllOrders()" style="background:#ff6b6b;color:#fff;padding:0.5rem 1rem;border:none;border-radius:4px;cursor:pointer;">پاک کردن همه</button>
                </div>
                <div id="orders-list">
                    ${ordersHtml}
                </div>
                <button type="button" id="cancel-view-orders" style="margin-top:1rem;background:#666;color:#fff;padding:0.5rem 1rem;border:none;border-radius:4px;cursor:pointer;">بستن</button>
            </div>
        `;
    }
    
    document.getElementById('cancel-view-orders').onclick = () => {
        container.style.display = 'none';
        container.innerHTML = '';
    };
}

function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        alert('سفارش یافت نشد!');
        return;
    }
    
    const details = `
سفارش #${order.id}

محصول: ${order.productName}
قیمت: ${order.price} LVL
درصد سود: ${order.percent}%
آدرس مشتری: ${order.customerAddress}
هش تراکنش: ${order.transactionHash}
تاریخ: ${order.timestamp}
وضعیت: ${order.status}
    `;
    
    alert(details);
}

function copyOrderInfo(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        alert('سفارش یافت نشد!');
        return;
    }
    
    const orderInfo = `سفارش #${order.id} - ${order.productName} - ${order.price} LVL - ${order.customerAddress} - ${order.transactionHash}`;
    copyToClipboard(orderInfo);
    showShopSuccess('اطلاعات سفارش کپی شد!');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showShopSuccess('متن کپی شد!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showShopSuccess('متن کپی شد!');
    });
}

function exportOrdersToCSV() {
    if (orders.length === 0) {
        alert('هیچ سفارشی برای خروجی وجود ندارد!');
        return;
    }
    
    const csvContent = [
        ['ID', 'Product Name', 'Price (LVL)', 'Percent', 'Customer Address', 'Transaction Hash', 'Timestamp', 'Status'],
        ...orders.map(order => [
            order.id,
            order.productName,
            order.price,
            order.percent,
            order.customerAddress,
            order.transactionHash,
            order.timestamp,
            order.status
        ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showShopSuccess('فایل CSV با موفقیت دانلود شد!');
}

function clearAllOrders() {
    if (!confirm('آیا مطمئن هستید که می‌خواهید همه سفارشات را پاک کنید؟ این عمل قابل بازگشت نیست.')) {
        return;
    }
    
    orders.length = 0;
    showShopSuccess('همه سفارشات پاک شدند!');
    
    // بروزرسانی نمایش سفارشات
    const container = document.getElementById('view-orders-container');
    if (container && container.style.display !== 'none') {
        showOrdersList();
    }
}

// --- ساب ادمین شاپ ---
function setupShopSubAdminControls() {
    const addBtn = document.getElementById('add-shop-sub-admin-btn');
    const viewBtn = document.getElementById('view-shop-sub-admins-btn');
    if (addBtn) addBtn.onclick = showAddShopSubAdminModal;
    if (viewBtn) viewBtn.onclick = toggleShopSubAdminsList;
    setupShopSubAdminModals();
    loadShopSubAdmins();
}

function setupShopSubAdminModals() {
    const modal = document.getElementById('shop-sub-admin-modal');
    const deleteModal = document.getElementById('shop-delete-confirm-modal');
    const form = document.getElementById('shop-sub-admin-form');
    document.getElementById('cancel-shop-sub-admin-btn').onclick = () => {
        modal.style.display = 'none';
        resetShopSubAdminForm();
    };
    document.getElementById('cancel-shop-delete-btn').onclick = () => {
        deleteModal.style.display = 'none';
    };
    document.getElementById('confirm-shop-delete-btn').onclick = deleteShopSubAdmin;
    form.onsubmit = (e) => {
        e.preventDefault();
        saveShopSubAdmin();
    };
    modal.onclick = (e) => { if (e.target === modal) { modal.style.display = 'none'; resetShopSubAdminForm(); } };
    deleteModal.onclick = (e) => { if (e.target === deleteModal) deleteModal.style.display = 'none'; };
}

function showAddShopSubAdminModal() {
    const modal = document.getElementById('shop-sub-admin-modal');
    const title = document.getElementById('shop-modal-title');
    const form = document.getElementById('shop-sub-admin-form');
    title.textContent = 'افزودن ساب ادمین شاپ';
    form.reset();
    currentEditingShopAdmin = null;
    modal.style.display = 'flex';
}

function showEditShopSubAdminModal(admin) {
    const modal = document.getElementById('shop-sub-admin-modal');
    const title = document.getElementById('shop-modal-title');
    title.textContent = 'ویرایش ساب ادمین شاپ';
    currentEditingShopAdmin = admin;
    document.getElementById('shop-sub-admin-name').value = admin.name;
    document.getElementById('shop-sub-admin-address').value = admin.address;
    document.getElementById('shop-sub-admin-role').value = admin.role;
    document.getElementById('shop-sub-admin-description').value = admin.description || '';
    const permissions = admin.permissions || [];
    document.querySelectorAll('input[name="shop-permissions"]').forEach(checkbox => {
        checkbox.checked = permissions.includes(checkbox.id);
    });
    modal.style.display = 'flex';
}

function saveShopSubAdmin() {
    const name = document.getElementById('shop-sub-admin-name').value.trim();
    const address = document.getElementById('shop-sub-admin-address').value.trim();
    const role = document.getElementById('shop-sub-admin-role').value;
    const description = document.getElementById('shop-sub-admin-description').value.trim();
    if (!name || !address || !role) {
        showShopError('لطفاً تمام فیلدهای ضروری را پر کنید.');
        return;
    }
    if (!address.startsWith('0x') || address.length !== 42) {
        showShopError('آدرس کیف پول نامعتبر است.');
        return;
    }
    const permissions = [];
    document.querySelectorAll('input[name="shop-permissions"]:checked').forEach(checkbox => {
        permissions.push(checkbox.id);
    });
    const subAdmin = {
        id: currentEditingShopAdmin ? currentEditingShopAdmin.id : Date.now().toString(),
        name,
        address: address.toLowerCase(),
        role,
        description,
        permissions,
        createdAt: currentEditingShopAdmin ? currentEditingShopAdmin.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    if (currentEditingShopAdmin) {
        const index = shopSubAdmins.findIndex(admin => admin.id === currentEditingShopAdmin.id);
        if (index !== -1) shopSubAdmins[index] = subAdmin;
    } else {
        shopSubAdmins.push(subAdmin);
    }
    saveShopSubAdminsToStorage();
    document.getElementById('shop-sub-admin-modal').style.display = 'none';
    resetShopSubAdminForm();
    renderShopSubAdminsList();
    showShopSuccess(currentEditingShopAdmin ? 'ساب ادمین ویرایش شد.' : 'ساب ادمین جدید اضافه شد.');
}

function deleteShopSubAdmin() {
    if (!currentEditingShopAdmin) return;
    const index = shopSubAdmins.findIndex(admin => admin.id === currentEditingShopAdmin.id);
    if (index !== -1) {
        shopSubAdmins.splice(index, 1);
        saveShopSubAdminsToStorage();
        renderShopSubAdminsList();
        document.getElementById('shop-delete-confirm-modal').style.display = 'none';
        showShopSuccess('ساب ادمین حذف شد.');
    }
}

function showDeleteShopConfirmModal(admin) {
    currentEditingShopAdmin = admin;
    document.getElementById('shop-delete-admin-name').textContent = admin.name;
    document.getElementById('shop-delete-admin-address').textContent = admin.address;
    document.getElementById('shop-delete-confirm-modal').style.display = 'flex';
}

function toggleShopSubAdminsList() {
    const list = document.getElementById('shop-sub-admins-list');
    const btn = document.getElementById('view-shop-sub-admins-btn');
    if (list.style.display === 'none') {
        list.style.display = 'block';
        btn.textContent = '👥 مخفی کردن';
        renderShopSubAdminsList();
    } else {
        list.style.display = 'none';
        btn.textContent = '👥 مشاهده ساب ادمین‌ها';
    }
}

function renderShopSubAdminsList() {
    const container = document.getElementById('shop-sub-admins-container');
    if (!container) return;
    container.innerHTML = '';
    if (shopSubAdmins.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center; padding: 1rem;">هیچ ساب ادمینی تعریف نشده است.</p>';
        return;
    }
    shopSubAdmins.forEach(admin => {
        const adminElement = createShopSubAdminElement(admin);
        container.appendChild(adminElement);
    });
}

function createShopSubAdminElement(admin) {
    const template = document.getElementById('shop-sub-admin-template');
    const clone = template.cloneNode(true);
    clone.style.display = 'flex';
    clone.id = `shop-sub-admin-${admin.id}`;
    clone.querySelector('.shop-sub-admin-name').textContent = admin.name;
    clone.querySelector('.shop-sub-admin-address').textContent = admin.address;
    clone.querySelector('.shop-sub-admin-role').textContent = getShopRoleDisplayName(admin.role);
    const editBtn = clone.querySelector('.edit-btn');
    const removeBtn = clone.querySelector('.remove-btn');
    editBtn.onclick = () => showEditShopSubAdminModal(admin);
    removeBtn.onclick = () => showDeleteShopConfirmModal(admin);
    return clone;
}

function getShopRoleDisplayName(role) {
    const roleNames = {
        'product_manager': 'مدیر محصولات',
        'order_support': 'پشتیبانی سفارشات',
        'warehouse': 'انباردار',
        'custom': 'سفارشی'
    };
    return roleNames[role] || role;
}

function loadShopSubAdmins() {
    try {
        const stored = localStorage.getItem('shopSubAdmins');
        if (stored) shopSubAdmins = JSON.parse(stored);
    } catch (e) { shopSubAdmins = []; }
}
function saveShopSubAdminsToStorage() {
    try { localStorage.setItem('shopSubAdmins', JSON.stringify(shopSubAdmins)); } catch (e) {}
}
function resetShopSubAdminForm() {
    document.getElementById('shop-sub-admin-form').reset();
    currentEditingShopAdmin = null;
}
function checkShopSubAdminPermissions(address, permission) {
    const subAdmin = shopSubAdmins.find(admin => admin.address.toLowerCase() === address.toLowerCase());
    if (!subAdmin) return false;
    return subAdmin.permissions.includes(permission);
}
function isShopSubAdmin(address) {
    return shopSubAdmins.some(admin => admin.address.toLowerCase() === address.toLowerCase());
}
function setupLimitedShopAdminControls(address) {
    const subAdmin = shopSubAdmins.find(admin => admin.address.toLowerCase() === address.toLowerCase());
    if (!subAdmin) return;
    // مخفی کردن بخش مدیریت ساب ادمین شاپ
    const subAdminManagement = document.querySelector('.shop-sub-admin-management');
    if (subAdminManagement) subAdminManagement.style.display = 'none';
    const permissions = subAdmin.permissions || [];
    if (!permissions.includes('perm-add-product')) {
        const btn = document.getElementById('add-product-btn');
        if (btn) btn.style.display = 'none';
    }
    if (!permissions.includes('perm-edit-product')) {
        const btn = document.getElementById('edit-products-btn');
        if (btn) btn.style.display = 'none';
    }
    if (!permissions.includes('perm-delete-product')) {
        // حذف دکمه حذف در فرم ویرایش محصولات در handleEditProduct و showEditProductsForm کنترل می‌شود
    }
    if (!permissions.includes('perm-view-orders')) {
        const btn = document.getElementById('view-orders-btn');
        if (btn) btn.style.display = 'none';
    }
    if (!permissions.includes('perm-deposit-matic')) {
        const btn = document.getElementById('deposit-matic-btn');
        if (btn) btn.style.display = 'none';
    }
    showShopSuccess(`خوش آمدید ${subAdmin.name}! شما با نقش ${getShopRoleDisplayName(subAdmin.role)} وارد شده‌اید.`);
} 