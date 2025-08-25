// مدیریت کلیک روی گره‌ها و نمایش فرم شناور
class NetworkNodeManager {
    constructor() {
        this.initializeModal();
        this.bindEvents();
    }

    // ایجاد مودال
    initializeModal() {
        const modalHTML = `
            <div class="user-info-modal">
                <div class="user-info-header">
                    <h3 class="user-info-title">اطلاعات کاربر</h3>
                    <button class="close-button">&times;</button>
                </div>
                <div class="user-info-content">
                    <div class="info-group">
                        <div class="info-label">شناسه کاربر</div>
                        <div class="info-value" id="userId">-</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">آدرس کیف پول</div>
                        <div class="info-value" id="userWallet">-</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">نوع کاربر</div>
                        <div class="info-value" id="userType">-</div>
                    </div>
                    <div class="user-stats">
                        <div class="stat-item">
                            <div class="stat-value" id="userBalance">0</div>
                            <div class="stat-label">موجودی</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" id="userReferrals">0</div>
                            <div class="stat-label">زیرمجموعه‌ها</div>
                        </div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">حجم شبکه</div>
                        <div class="info-value" id="networkVolume">0 IAM</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">تاریخ آخرین فعالیت</div>
                        <div class="info-value" id="lastActive">-</div>
                    </div>
                </div>
            </div>
            <div class="modal-backdrop"></div>
        `;

        // افزودن مودال به DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        // ذخیره ارجاع به المان‌های مودال
        this.modal = document.querySelector('.user-info-modal');
        this.backdrop = document.querySelector('.modal-backdrop');
        this.closeButton = this.modal.querySelector('.close-button');
    }

    // اضافه کردن event listeners
    bindEvents() {
        // کلیک روی دکمه بستن
        this.closeButton.addEventListener('click', () => this.hideModal());
        
        // کلیک روی backdrop
        this.backdrop.addEventListener('click', () => this.hideModal());

        // Swipe down برای بستن در موبایل
        let touchStartY = 0;
        this.modal.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });

        this.modal.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - touchStartY;
            
            if (deltaY < 0) { // فقط اجازه swipe به بالا
                this.modal.style.transform = `translateY(${deltaY}px)`;
            }
        });

        this.modal.addEventListener('touchend', (e) => {
            const deltaY = e.changedTouches[0].clientY - touchStartY;
            if (deltaY < -100) { // اگر بیشتر از 100px به بالا کشیده شد
                this.hideModal();
            } else {
                this.modal.style.transform = '';
            }
        });

        // اضافه کردن click handler به همه گره‌های شبکه
        this.addNodeClickHandlers();
    }

    // اضافه کردن event listener به گره‌های شبکه
    addNodeClickHandlers() {
        document.querySelectorAll('.network-node').forEach(node => {
            node.addEventListener('click', async (e) => {
                const nodeId = node.getAttribute('data-id');
                if (nodeId) {
                    await this.showNodeInfo(nodeId);
                }
            });
        });
    }

    // نمایش اطلاعات گره
    async showNodeInfo(nodeId) {
        try {
            // نمایش loading
            this.showLoading();
            
            // دریافت اطلاعات از شبکه
            const userInfo = await window.getUserInfo(nodeId);
            
            // به‌روزرسانی UI
            this.updateModalContent(userInfo);
            
            // نمایش مودال
            this.showModal();
        } catch (error) {
            console.error('Error showing node info:', error);
            this.showError();
        }
    }

    // نمایش حالت loading
    showLoading() {
        this.modal.querySelector('.user-info-content').innerHTML = '<div class="loading-spinner"></div>';
        this.showModal();
    }

    // نمایش خطا
    showError() {
        this.modal.querySelector('.user-info-content').innerHTML = `
            <div class="error-state">
                خطا در دریافت اطلاعات
                <br>
                لطفاً دوباره تلاش کنید
            </div>
        `;
    }

    // به‌روزرسانی محتوای مودال
    updateModalContent(userInfo) {
        document.getElementById('userId').textContent = `IAM${String(userInfo.id).padStart(5, '0')}`;
        document.getElementById('userWallet').textContent = this.formatAddress(userInfo.wallet);
        document.getElementById('userType').textContent = this.getUserTypeLabel(userInfo.type);
        document.getElementById('userBalance').textContent = this.formatNumber(userInfo.balance);
        document.getElementById('userReferrals').textContent = userInfo.referrals;
        document.getElementById('networkVolume').textContent = `${this.formatNumber(userInfo.networkVolume)} IAM`;
        document.getElementById('lastActive').textContent = this.formatDate(userInfo.lastActive);
    }

    // نمایش مودال
    showModal() {
        this.modal.classList.add('active');
        this.backdrop.classList.add('active');
        document.body.style.overflow = 'hidden'; // جلوگیری از اسکرول صفحه
    }

    // مخفی کردن مودال
    hideModal() {
        this.modal.style.transform = '';
        this.modal.classList.remove('active');
        this.backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    // توابع کمکی
    formatAddress(address) {
        if (!address) return '-';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    formatNumber(num) {
        if (!num) return '0';
        return new Intl.NumberFormat('en-US').format(num);
    }

    formatDate(timestamp) {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getUserTypeLabel(type) {
        const types = {
            1: 'کاربر عادی',
            2: 'کاربر ویژه',
            3: 'ادمین'
        };
        return types[type] || 'نامشخص';
    }
}

// ایجاد نمونه از کلاس برای استفاده
window.nodeManager = new NetworkNodeManager();

// فانکشن برای اضافه کردن مجدد event listeners به گره‌های جدید
window.initializeNetworkNodes = function() {
    window.nodeManager.addNodeClickHandlers();
};
