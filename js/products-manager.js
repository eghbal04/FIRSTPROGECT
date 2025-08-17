// مدیریت محصولات و فروشندگان
class ProductsManager {
    constructor() {
        this.products = [];
        this.sellers = [];
        this.subAdmins = [];
        this.currentUser = null;
        this.isAdmin = false;
        
        this.init();
    }
    
    async init() {
        await this.checkUserAccess();
        this.loadData();
        this.setupEventListeners();
    }
    
    // بررسی دسترسی کاربر
    async checkUserAccess() {
        try {
            if (typeof window.connectWallet === 'function') {
                const { contract } = await window.connectWallet();
                const userAddress = window.ethereum.selectedAddress;
                
                if (userAddress) {
                    // استفاده از users(address) به جای getUserIndex
                    const userData = await contract.users(userAddress);
                    const userIndex = userData.index;
                    this.currentUser = {
                        address: userAddress,
                        index: userIndex
                    };
                    // بررسی دسترسی ادمین (ایندکس‌های 1، 2، 3)
                    this.isAdmin = userIndex >= 1 && userIndex <= 3;
                    if (this.isAdmin) {
                        this.showAdminPanel();
                    }
                }
            }
        } catch (error) {
            console.error('خطا در بررسی دسترسی کاربر:', error);
        }
    }
    
    // بارگذاری داده‌ها
    loadData() {
        // پاک‌سازی محصولات ذخیره‌شده برای رفع مشکل seller آبجکت
        localStorage.removeItem('IAM_products');
        // بارگذاری محصولات از localStorage یا API
        const savedProducts = localStorage.getItem('IAM_products');
        if (savedProducts) {
            this.products = JSON.parse(savedProducts);
        } else {
            // محصولات پیش‌فرض
            this.products = [
                {
                    id: 1,
                    title: "دوره آموزشی فارکس",
                    description: "دوره کامل آموزش فارکس از مبتدی تا پیشرفته",
                    price: 500,
                    payout: 20,
                    seller: "0x1234567890123456789012345678901234567890",
                    sellerName: "آکادمی فارکس",
                    image: "📚",
                    sellerPageUrl: "seller1.html",
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: "سیگنال‌های معاملاتی",
                    description: "سیگنال‌های روزانه معاملات فارکس",
                    price: 200,
                    payout: 15,
                    seller: "0x2345678901234567890123456789012345678901",
                    sellerName: "تیم سیگنال",
                    image: "📊",
                    sellerPageUrl: "seller2.html",
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    title: "ربات معاملاتی",
                    description: "ربات خودکار معاملات فارکس",
                    price: 1000,
                    payout: 25,
                    seller: "0x3456789012345678901234567890123456789012",
                    sellerName: "تیم ربات",
                    image: "🤖",
                    sellerPageUrl: "seller3.html",
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveProducts();
        }
        
        // بارگذاری فروشندگان
        const savedSellers = localStorage.getItem('IAM_sellers');
        if (savedSellers) {
            this.sellers = JSON.parse(savedSellers);
        } else {
            this.sellers = [
                {
                    address: "0x1234567890123456789012345678901234567890",
                    name: "آکادمی فارکس",
                    pageUrl: "seller1.html",
                    description: "مرکز آموزش فارکس",
                    createdAt: new Date().toISOString()
                },
                {
                    address: "0x2345678901234567890123456789012345678901",
                    name: "تیم سیگنال",
                    pageUrl: "seller2.html",
                    description: "ارائه سیگنال‌های معاملاتی",
                    createdAt: new Date().toISOString()
                },
                {
                    address: "0x3456789012345678901234567890123456789012",
                    name: "تیم ربات",
                    pageUrl: "seller3.html",
                    description: "ربات‌های معاملاتی",
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveSellers();
        }
        
        // بارگذاری ساب ادمین‌ها
        const savedSubAdmins = localStorage.getItem('IAM_subadmins');
        if (savedSubAdmins) {
            this.subAdmins = JSON.parse(savedSubAdmins);
        }
        
        this.displayProducts();
        this.loadSellersFilter();
    }
    
    // ذخیره محصولات
    saveProducts() {
        localStorage.setItem('IAM_products', JSON.stringify(this.products));
    }
    
    // ذخیره فروشندگان
    saveSellers() {
        localStorage.setItem('IAM_sellers', JSON.stringify(this.sellers));
    }
    
    // ذخیره ساب ادمین‌ها
    saveSubAdmins() {
        localStorage.setItem('IAM_subadmins', JSON.stringify(this.subAdmins));
    }
    
    // نمایش محصولات
    displayProducts(productsToShow = null) {
        const grid = document.getElementById('products-grid');
        if (!grid) return;
        
        const products = productsToShow || this.products;
        grid.innerHTML = '';
        
        products.forEach(product => {
            const card = this.createProductCard(product);
            grid.appendChild(card);
        });
    }
    
    // ایجاد کارت محصول
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <div class="product-title">${product.title}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-price">${product.price}</div>
                <div class="product-seller">
                    فروشنده: ${product.sellerName}
                    <a href="#" class="profile-link" data-address="${product.seller}" onclick="openUserProfile('${product.seller}')" style="margin-right: 10px; color: #1976d2; text-decoration: none;">👤 پروفایل</a>
                </div>
                <div class="purchase-form">
                    <button class="purchase-btn" onclick="productsManager.purchaseProduct(${product.id})" disabled>خرید محصول</button>
                </div>
                <a href="${product.sellerPageUrl || '#'}" class="seller-page-link">صفحه فروشنده</a>
                ${this.isAdmin ? `<button class="admin-btn danger" onclick="productsManager.removeProduct(${product.id})">حذف</button>` : ''}
            </div>
        `;
        return card;
    }
    
    // خرید محصول
    async purchaseProduct(productId) {
        try {
            const product = this.products.find(p => p.id === productId);
            if (!product) {
                this.showMessage('خطا: محصول یافت نشد', 'error');
                return;
            }
            // اتصال به ولت
            const userAddress = await connectWallet();
            if (!userAddress) {
                this.showMessage('خطا: کیف پول متصل نیست', 'error');
                return;
            }
            const { contract, provider } = await window.connectWallet();
            // --- اضافه کردن بررسی موجودی توکن ERC20 ---
            const tokenAddress = window.DAI_ADDRESS;
            const tokenAbi = window.DAI_ABI;
            if (!tokenAddress || !tokenAbi) {
                this.showMessage('خطا: اطلاعات توکن موجود نیست', 'error');
                return;
            }
            const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
            const balance = await tokenContract.balanceOf(userAddress);
            if (balance.lt(ethers.BigNumber.from(product.price))) {
                this.showMessage('خطا: موجودی کافی نیست', 'error');
                return;
            }
            // استخراج sellerAddress به صورت رشته (در صورت آبجکت تو در تو)
            let sellerAddress = product.seller;
            let safetyCounter = 0;
            while (typeof sellerAddress === 'object' && sellerAddress.address && safetyCounter < 5) {
                sellerAddress = sellerAddress.address;
                safetyCounter++;
            }
            console.log('sellerAddress for contract:', sellerAddress, typeof sellerAddress);
            if (typeof sellerAddress !== 'string') {
                this.showMessage('خطا: آدرس فروشنده نامعتبر است', 'error');
                return;
            }
            // فراخوانی تابع purchase در قرارداد
            const tx = await contract.purchase(product.price, product.payout, sellerAddress);
            await tx.wait();
            this.showMessage('خرید با موفقیت انجام شد!', 'success');
            this.recordTransaction(product, product.price);
        } catch (error) {
            console.error('خطا در خرید:', error);
            this.showMessage('خطا در خرید محصول: ' + error.message, 'error');
        }
    }
    
    // ثبت تراکنش
    recordTransaction(product, amount) {
        const transaction = {
            id: Date.now(),
            productId: product.id,
            productTitle: product.title,
            amount: amount,
            seller: product.seller,
            sellerName: product.sellerName,
            payout: product.payout,
            buyer: this.currentUser?.address,
            timestamp: new Date().toISOString()
        };
        
        const transactions = JSON.parse(localStorage.getItem('IAM_transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('IAM_transactions', JSON.stringify(transactions));
    }
    
    // فیلتر کردن محصولات
    filterProducts() {
        const searchTerm = document.getElementById('search-products')?.value.toLowerCase() || '';
        const sellerFilter = document.getElementById('seller-filter')?.value || '';
        const priceFilter = document.getElementById('price-filter')?.value || '';
        
        let filtered = this.products.filter(product => {
            const matchesSearch = product.title.toLowerCase().includes(searchTerm) || 
                                product.description.toLowerCase().includes(searchTerm);
            const matchesSeller = !sellerFilter || product.seller === sellerFilter;
            const matchesPrice = !priceFilter || this.checkPriceRange(product.price, priceFilter);
            
            return matchesSearch && matchesSeller && matchesPrice;
        });
        
        this.displayProducts(filtered);
    }
    
    checkPriceRange(price, range) {
        switch(range) {
            case '0-100': return price >= 0 && price <= 100;
            case '100-500': return price > 100 && price <= 500;
            case '500-1000': return price > 500 && price <= 1000;
            case '1000+': return price > 1000;
            default: return true;
        }
    }
    
    // بارگذاری فیلتر فروشندگان
    loadSellersFilter() {
        const sellerFilter = document.getElementById('seller-filter');
        if (!sellerFilter) return;
        
        sellerFilter.innerHTML = '<option value="">همه فروشندگان</option>';
        
        this.sellers.forEach(seller => {
            const option = document.createElement('option');
            option.value = seller.address;
            option.textContent = seller.name;
            sellerFilter.appendChild(option);
        });
    }
    
    // مدیریت فروشندگان
    addSeller() {
        const address = document.getElementById('seller-address')?.value;
        const name = document.getElementById('seller-name')?.value;
        const pageUrl = document.getElementById('seller-page-url')?.value;
        const description = document.getElementById('seller-description')?.value;
        
        if (!address || !name) {
            this.showMessage('لطفاً آدرس و نام فروشنده را وارد کنید', 'error');
            return;
        }
        
        // بررسی تکراری نبودن آدرس
        if (this.sellers.find(s => s.address === address)) {
            this.showMessage('این آدرس قبلاً ثبت شده است', 'error');
            return;
        }
        
        const newSeller = {
            address,
            name,
            pageUrl: pageUrl || `seller_${Date.now()}.html`,
            description: description || '',
            createdAt: new Date().toISOString()
        };
        
        this.sellers.push(newSeller);
        this.saveSellers();
        this.loadSellersFilter();
        this.showMessage('فروشنده با موفقیت اضافه شد', 'success');
        this.clearSellerForm();
    }
    
    removeSeller() {
        const address = document.getElementById('seller-address')?.value;
        const index = this.sellers.findIndex(s => s.address === address);
        
        if (index > -1) {
            // بررسی اینکه آیا محصولی از این فروشنده وجود دارد
            const hasProducts = this.products.some(p => p.seller === address);
            if (hasProducts) {
                this.showMessage('ابتدا محصولات این فروشنده را حذف کنید', 'error');
                return;
            }
            
            this.sellers.splice(index, 1);
            this.saveSellers();
            this.loadSellersFilter();
            this.showMessage('فروشنده با موفقیت حذف شد', 'success');
            this.clearSellerForm();
        } else {
            this.showMessage('فروشنده یافت نشد', 'error');
        }
    }
    
    clearSellerForm() {
        const fields = ['seller-address', 'seller-name', 'seller-page-url', 'seller-description'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) element.value = '';
        });
    }
    
    // مدیریت محصولات
    addProduct() {
        const title = document.getElementById('product-title')?.value;
        const description = document.getElementById('product-description')?.value;
        const price = parseInt(document.getElementById('product-price')?.value);
        const payout = parseInt(document.getElementById('product-payout')?.value);
        const seller = document.getElementById('product-seller')?.value;
        const image = document.getElementById('product-image')?.value || '📦';
        
        if (!title || !description || !price || !payout || !seller) {
            this.showMessage('لطفاً تمام فیلدها را پر کنید', 'error');
            return;
        }
        
        if (payout < 1 || payout > 100) {
            this.showMessage('درصد تبلیغات باید بین 1 تا 100 باشد', 'error');
            return;
        }
        
        const sellerData = this.sellers.find(s => s.address === seller);
        if (!sellerData) {
            this.showMessage('فروشنده یافت نشد', 'error');
            return;
        }
        
        const newProduct = {
            id: Date.now(),
            title,
            description,
            price,
            payout,
            seller,
            sellerName: sellerData.name,
            image,
            sellerPageUrl: sellerData.pageUrl,
            createdAt: new Date().toISOString()
        };
        
        this.products.push(newProduct);
        this.saveProducts();
        this.displayProducts();
        this.showMessage('محصول با موفقیت اضافه شد', 'success');
        this.clearProductForm();
    }
    
    removeProduct(productId) {
        const index = this.products.findIndex(p => p.id === productId);
        
        if (index > -1) {
            this.products.splice(index, 1);
            this.saveProducts();
            this.displayProducts();
            this.showMessage('محصول با موفقیت حذف شد', 'success');
        } else {
            this.showMessage('محصول یافت نشد', 'error');
        }
    }
    
    clearProductForm() {
        const fields = ['product-title', 'product-description', 'product-price', 'product-payout', 'product-seller', 'product-image'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) element.value = '';
        });
    }
    
    // مدیریت ساب ادمین
    addSubAdmin() {
        const address = document.getElementById('subadmin-address')?.value;
        const name = document.getElementById('subadmin-name')?.value;
        const permissions = document.getElementById('subadmin-permissions')?.value || 'products';
        
        if (!address || !name) {
            this.showMessage('لطفاً آدرس و نام ساب ادمین را وارد کنید', 'error');
            return;
        }
        
        // بررسی تکراری نبودن آدرس
        if (this.subAdmins.find(s => s.address === address)) {
            this.showMessage('این آدرس قبلاً ثبت شده است', 'error');
            return;
        }
        
        const newSubAdmin = {
            address,
            name,
            permissions,
            createdAt: new Date().toISOString()
        };
        
        this.subAdmins.push(newSubAdmin);
        this.saveSubAdmins();
        this.showMessage('ساب ادمین با موفقیت اضافه شد', 'success');
        this.clearSubAdminForm();
    }
    
    removeSubAdmin() {
        const address = document.getElementById('subadmin-address')?.value;
        const index = this.subAdmins.findIndex(s => s.address === address);
        
        if (index > -1) {
            this.subAdmins.splice(index, 1);
            this.saveSubAdmins();
            this.showMessage('ساب ادمین با موفقیت حذف شد', 'success');
            this.clearSubAdminForm();
        } else {
            this.showMessage('ساب ادمین یافت نشد', 'error');
        }
    }
    
    clearSubAdminForm() {
        const fields = ['subadmin-address', 'subadmin-name', 'subadmin-permissions'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) element.value = '';
        });
    }
    
    // نمایش پنل ادمین
    showAdminPanel() {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
        }
    }
    
    // نمایش پیام
    showMessage(message, type) {
        const messageDiv = document.getElementById('admin-message');
        if (messageDiv) {
            messageDiv.innerHTML = `<div class="status-message status-${type}">${message}</div>`;
            
            setTimeout(() => {
                messageDiv.innerHTML = '';
            }, 5000);
        }
        
        // نمایش پیام عمومی
        console.log(`${type.toUpperCase()}: ${message}`);
    }
    
    // تنظیم رویدادها
    setupEventListeners() {
        // فیلترها
        const searchInput = document.getElementById('search-products');
        const sellerFilter = document.getElementById('seller-filter');
        const priceFilter = document.getElementById('price-filter');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterProducts());
        }
        if (sellerFilter) {
            sellerFilter.addEventListener('change', () => this.filterProducts());
        }
        if (priceFilter) {
            priceFilter.addEventListener('change', () => this.filterProducts());
        }
        
        // دکمه‌های ادمین
        const addSellerBtn = document.querySelector('button[onclick="addSeller()"]');
        const removeSellerBtn = document.querySelector('button[onclick="removeSeller()"]');
        const addProductBtn = document.querySelector('button[onclick="addProduct()"]');
        const removeProductBtn = document.querySelector('button[onclick="removeProduct()"]');
        const addSubAdminBtn = document.querySelector('button[onclick="addSubAdmin()"]');
        const removeSubAdminBtn = document.querySelector('button[onclick="removeSubAdmin()"]');
        
        if (addSellerBtn) {
            addSellerBtn.onclick = () => this.addSeller();
        }
        if (removeSellerBtn) {
            removeSellerBtn.onclick = () => this.removeSeller();
        }
        if (addProductBtn) {
            addProductBtn.onclick = () => this.addProduct();
        }
        if (removeProductBtn) {
            removeProductBtn.onclick = () => this.removeProduct();
        }
        if (addSubAdminBtn) {
            addSubAdminBtn.onclick = () => this.addSubAdmin();
        }
        if (removeSubAdminBtn) {
            removeSubAdminBtn.onclick = () => this.removeSubAdmin();
        }
    }
    
    // دریافت آمار
    getStats() {
        return {
            totalProducts: this.products.length,
            totalSellers: this.sellers.length,
            totalSubAdmins: this.subAdmins.length,
            totalTransactions: JSON.parse(localStorage.getItem('IAM_transactions') || '[]').length
        };
    }
    
    // صادرات داده‌ها
    exportData() {
        return {
            products: this.products,
            sellers: this.sellers,
            subAdmins: this.subAdmins,
            transactions: JSON.parse(localStorage.getItem('IAM_transactions') || '[]')
        };
    }
    
    // واردات داده‌ها
    importData(data) {
        if (data.products) {
            this.products = data.products;
            this.saveProducts();
        }
        if (data.sellers) {
            this.sellers = data.sellers;
            this.saveSellers();
        }
        if (data.subAdmins) {
            this.subAdmins = data.subAdmins;
            this.saveSubAdmins();
        }
        if (data.transactions) {
            localStorage.setItem('IAM_transactions', JSON.stringify(data.transactions));
        }
        
        this.loadData();
        this.showMessage('داده‌ها با موفقیت وارد شدند', 'success');
    }
    

}

// ایجاد نمونه سراسری
let productsManager;

// راه‌اندازی پس از بارگذاری صفحه
document.addEventListener('DOMContentLoaded', function() {
    productsManager = new ProductsManager();
});

// توابع سراسری برای استفاده در HTML
window.addSeller = function() { productsManager?.addSeller(); };
window.removeSeller = function() { productsManager?.removeSeller(); };
window.addProduct = function() { productsManager?.addProduct(); };
window.removeProduct = function() { productsManager?.removeProduct(); };
window.addSubAdmin = function() { productsManager?.addSubAdmin(); };
window.removeSubAdmin = function() { productsManager?.removeSubAdmin(); };
window.purchaseProduct = function(id) { productsManager?.purchaseProduct(id); };
 