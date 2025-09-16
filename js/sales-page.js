// Sales Page JavaScript - Personal Sales Page Management

class SalesPageManager {
    constructor() {
        this.products = [];
        this.currentUser = null;
        this.editingProductId = null;
        this.init();
    }
    
    async init() {
        try {
            await this.loadUserData();
            await this.loadProducts();
            this.setupEventListeners();
            this.updateStats();
        } catch (error) {
            console.error('Error initializing sales page:', error);
            this.showError('Error loading sales page');
        }
    }
    
    // Load user data
    async loadUserData() {
        try {
            if (!window.connectWallet) {
                throw new Error('Wallet connection is not active');
            }
            
            const { contract, address } = await window.connectWallet();
            if (!contract || !address) {
                throw new Error('Wallet connection failed');
            }
            
            // Get user information
            const user = await contract.users(address);
            if (!user || !user.index || BigInt(user.index) === 0n) {
                throw new Error('You must register first');
            }
            
            // Get likes count
            let likesCount = 0;
            try {
                const voteStatus = await contract.getVoteStatus(address);
                if (voteStatus && voteStatus.length >= 2) {
                    likesCount = parseInt(voteStatus[0].toString());
                }
            } catch (e) {
                console.warn('Error getting likes:', e);
            }
            
            // Get IAM balance
            const balance = await contract.balanceOf(address);
            const balanceFormatted = Number(ethers.formatUnits(balance, 18));
            
            this.currentUser = {
                address,
                index: user.index.toString(),
                likes: likesCount,
                balance: balanceFormatted,
                name: this.generateUserName(address)
            };
            
            this.updateUserInfo();
            
        } catch (error) {
            console.error('Error loading user data:', error);
            throw error;
        }
    }
    
    // Generate user name based on address
    generateUserName(address) {
        const names = ['Professional Seller', 'Successful Entrepreneur', 'Skilled Trader', 'Experienced Merchant', 'Creative Vendor'];
        const hash = address.slice(2, 8);
        const index = parseInt(hash, 16) % names.length;
        return names[index];
    }
    
    // Update user information in UI
    updateUserInfo() {
        const userNameEl = document.getElementById('user-name');
        const likesCountEl = document.getElementById('likes-count');
        const userBalanceEl = document.getElementById('user-balance');
        const userAvatarEl = document.getElementById('user-avatar');
        
        if (userNameEl) userNameEl.textContent = this.currentUser.name;
        if (likesCountEl) likesCountEl.textContent = this.currentUser.likes;
        if (userBalanceEl) userBalanceEl.textContent = this.currentUser.balance.toFixed(2);
        if (userAvatarEl) userAvatarEl.textContent = this.getUserAvatar(this.currentUser.name);
        
    }
    
    // Get user avatar
    getUserAvatar(name) {
        const avatars = ['👤', '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🎓', '👩‍🎓'];
        const hash = name.charCodeAt(0);
        return avatars[hash % avatars.length];
    }
    
    
    
    // Load products - no caching
    async loadProducts() {
        try {
            // No caching - always start with empty array
            this.products = [];
            this.renderProducts();
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Error loading products');
        }
    }
    
    // No caching needed
    saveProducts() {
        // No caching - data is always fresh
    }
    
    // Render products
    renderProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;
        
        if (this.products.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #a786ff;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">📦</div>
                    <h3>No products added yet</h3>
                    <p>Add your first product to start selling</p>
                </div>
            `;
            return;
        }
        
        const productsHTML = this.products.map(product => `
            <div class="product-card">
                <div class="product-image">${product.image}</div>
                <h4 class="product-title">${product.name}</h4>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price} IAM</div>
                <div style="color: #a786ff; font-size: 0.9rem; margin-bottom: 15px;">
                    Payout: ${product.payout || 100}%
                </div>
                <div class="product-actions">
                    <button class="buy-btn disabled" disabled>
                        Buy (${product.price} IAM)
                    </button>
                    <button class="edit-btn" onclick="salesManager.editProduct(${product.id})">Edit</button>
                    <button class="delete-btn" onclick="salesManager.deleteProduct(${product.id})">Delete</button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = productsHTML;
    }
    
    // Update statistics
    updateStats() {
        const totalProducts = this.products.length;
        const totalSales = this.products.reduce((sum, product) => sum + (product.sales || 0), 0);
        const totalRevenue = this.products.reduce((sum, product) => sum + (product.sales || 0) * product.price, 0);
        
        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('total-sales').textContent = totalSales;
        document.getElementById('total-revenue').textContent = totalRevenue.toFixed(2);
        document.getElementById('user-balance').textContent = this.currentUser.balance.toFixed(2);
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Add/edit product form
        const form = document.getElementById('product-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProductSubmit();
            });
        }
        
        // Close modal by clicking outside
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeProductModal();
                }
            });
        }
    }
    
    // Open add product modal
    openAddProductModal() {
        this.editingProductId = null;
        document.getElementById('modal-title').textContent = 'Add New Product';
        document.getElementById('product-form').reset();
        document.getElementById('product-image').value = '🎁';
        document.getElementById('product-payout').value = '100';
        document.getElementById('product-modal').style.display = 'block';
    }
    
    // Close product modal
    closeProductModal() {
        document.getElementById('product-modal').style.display = 'none';
        this.editingProductId = null;
    }
    
    // Edit product
    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        this.editingProductId = productId;
        document.getElementById('modal-title').textContent = 'Edit Product';
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-payout').value = product.payout || 100;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-modal').style.display = 'block';
    }
    
    // Delete product
    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts();
            this.renderProducts();
            this.updateStats();
        }
    }
    
    // Handle product form submission
    handleProductSubmit() {
        const name = document.getElementById('product-name').value.trim();
        const description = document.getElementById('product-description').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        const payout = parseFloat(document.getElementById('product-payout').value);
        const image = document.getElementById('product-image').value.trim() || '🎁';
        
        if (!name || !description || isNaN(price) || price <= 0 || isNaN(payout) || payout < 0 || payout > 100) {
            this.showError('Please fill in all fields correctly. Payout must be between 0-100%');
            return;
        }
        
        if (this.editingProductId) {
            // Edit existing product
            const productIndex = this.products.findIndex(p => p.id === this.editingProductId);
            if (productIndex !== -1) {
                this.products[productIndex] = {
                    ...this.products[productIndex],
                    name,
                    description,
                    price,
                    payout,
                    image
                };
            }
        } else {
            // Add new product
            const newProduct = {
                id: Date.now(),
                name,
                description,
                price,
                payout,
                image,
                sales: 0,
                createdAt: new Date().toISOString()
            };
            this.products.push(newProduct);
        }
        
        this.saveProducts();
        this.renderProducts();
        this.updateStats();
        this.closeProductModal();
        this.showSuccess('Product saved successfully');
    }
    
    // Buy product
    async buyProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        try {
            // Show purchase modal
            this.showPurchaseModal(product);
        } catch (error) {
            console.error('Error buying product:', error);
            this.showError('Error buying product');
        }
    }
    
    // Show purchase modal
    showPurchaseModal(product) {
        const modal = document.getElementById('purchase-modal');
        const content = document.getElementById('purchase-content');
        
        content.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">${product.image}</div>
                <h3 style="color: #00ff88; margin-bottom: 10px;">${product.name}</h3>
                <p style="color: #a786ff; margin-bottom: 15px;">${product.description}</p>
                <div style="font-size: 1.5rem; color: #00ff88; font-weight: bold; margin-bottom: 20px;">
                    Price: ${product.price} IAM
                </div>
            </div>
            
            <div style="background: rgba(167, 134, 255, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="color: #a786ff; font-weight: bold; margin-bottom: 10px;">Purchase Information:</div>
                <div style="color: #e0e6f7; font-size: 0.9rem; line-height: 1.5;">
                    • 5% of the amount is burned<br>
                    • 50% goes to the binary pool<br>
                    • 50% is paid to the seller<br>
                    • Transaction is recorded on the blockchain
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button class="btn-secondary" onclick="salesManager.closePurchaseModal()">Cancel</button>
                <button class="btn-primary" onclick="salesManager.confirmPurchase(${product.id})">
                    Confirm Purchase (${product.price} IAM)
                </button>
            </div>
        `;
        
        modal.style.display = 'block';
    }
    
    // Close purchase modal
    closePurchaseModal() {
        document.getElementById('purchase-modal').style.display = 'none';
    }
    
    // Confirm purchase
    async confirmPurchase(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        try {
            // Use existing purchaseEBAConfig function
            if (!window.purchaseEBAConfig) {
                throw new Error('Purchase function is not available');
            }
            
            // Calculate payout (50% to seller)
            const payout = 50;
            
            this.showLoading('Processing purchase...');
            
            // Call purchase function
            const result = await window.purchaseEBAConfig(
                product.price,
                payout,
                this.currentUser.address
            );
            
            if (result.success) {
                // Update sales statistics
                product.sales = (product.sales || 0) + 1;
                this.saveProducts();
                this.renderProducts();
                this.updateStats();
                
                this.closePurchaseModal();
                this.showSuccess(`Purchase completed successfully! Transaction ID: ${result.transactionHash}`);
            } else {
                throw new Error(result.message || 'Purchase failed');
            }
            
        } catch (error) {
            console.error('Error confirming purchase:', error);
            this.showError('Purchase error: ' + error.message);
        }
    }
    
    // Show loading message
    showLoading(message) {
        const content = document.getElementById('purchase-content');
        if (content) {
            content.innerHTML = `<div class="loading">${message}</div>`;
        }
    }
    
    // Show success message
    showSuccess(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00ff88, #a786ff);
            color: #181c2a;
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    }
    
    // Show error message
    showError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff4444, #ff6b6b);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(255, 68, 68, 0.3);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 5000);
    }
}

// Global functions for HTML access
window.openAddProductModal = function() {
    if (window.salesManager) {
        window.salesManager.openAddProductModal();
    }
};

window.closeProductModal = function() {
    if (window.salesManager) {
        window.salesManager.closeProductModal();
    }
};

window.closePurchaseModal = function() {
    if (window.salesManager) {
        window.salesManager.closePurchaseModal();
    }
};



// Initialize sales page
document.addEventListener('DOMContentLoaded', function() {
    // Check wallet connection
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
            if (accounts && accounts.length > 0) {
                window.salesManager = new SalesPageManager();
            } else {
                document.body.innerHTML = `
                    <div style="text-align: center; padding: 50px; color: #ff4444;">
                        <h2>Please connect your wallet first</h2>
                        <p>To use the sales page, you must connect your wallet</p>
                        <a href="index.html" style="color: #a786ff; text-decoration: none;">Back to Homepage</a>
                    </div>
                `;
            }
        });
    } else {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #ff4444;">
                <h2>Wallet not found</h2>
                <p>Please install a Web3 wallet</p>
                <a href="index.html" style="color: #a786ff; text-decoration: none;">Back to Homepage</a>
            </div>
        `;
    }
});
