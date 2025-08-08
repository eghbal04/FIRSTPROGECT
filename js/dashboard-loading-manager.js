/**
 * Dashboard Loading Manager - برای مدیریت loading states
 */

class DashboardLoadingManager {
    constructor() {
        this.loadingElements = new Map();
        this.pendingUpdates = new Map();
        this.isLoading = false;
    }
    
    // تنظیم حالت loading برای element
    setLoading(elementId, isLoading = true) {
        const el = document.getElementById(elementId);
        if (!el) return;
        
        if (isLoading) {
            if (!this.loadingElements.has(elementId)) {
                this.loadingElements.set(elementId, el.textContent);
            }
            el.textContent = '...';
            el.classList.add('loading-state');
        } else {
            el.classList.remove('loading-state');
        }
    }
    
    // بروزرسانی مقدار با فرمت
    updateValue(elementId, rawValue, decimals = 18, suffix = '') {
        const el = document.getElementById(elementId);
        if (!el) return;
        
        try {
            let formatted;
            
            if (rawValue === null || rawValue === undefined || rawValue === '') {
                formatted = 'در دسترس نیست';
            } else {
                const num = Number(rawValue) / Math.pow(10, decimals);
                if (isNaN(num)) {
                    formatted = 'خطا';
                } else {
                    formatted = num.toLocaleString('en-US', {maximumFractionDigits: 2}) + suffix;
                }
            }
            
            // حذف loading state و بروزرسانی مقدار
            this.setLoading(elementId, false);
            
            // استفاده از smooth update اگر موجود است
            if (window.smartUpdate) {
                window.smartUpdate(elementId, formatted);
            } else {
                el.textContent = formatted;
            }
            
        } catch (error) {
            console.error(`خطا در فرمت کردن ${elementId}:`, error);
            el.textContent = 'خطا';
            this.setLoading(elementId, false);
        }
    }
    
    // بروزرسانی چندین مقدار به صورت همزمان
    updateMultiple(updates) {
        updates.forEach(update => {
            const { id, value, decimals = 18, suffix = '' } = update;
            this.updateValue(id, value, decimals, suffix);
        });
    }
    
    // تنظیم loading برای تمام elements داشبورد
    setDashboardLoading(isLoading = true) {
        const dashboardElements = [
            'circulating-supply',
            'dashboard-dai-balance', 
            'contract-token-balance',
            'dashboard-wallets-count',
            'total-points',
            'dashboard-cashback-value',
            'dashboard-point-value',
            'dashboard-token-price',
            'dashboard-registration-price'
        ];
        
        dashboardElements.forEach(id => {
            this.setLoading(id, isLoading);
        });
        
        this.isLoading = isLoading;
    }
    
    // بررسی آیا داشبورد در حال loading است
    isDashboardLoading() {
        return this.isLoading;
    }
}

// ایجاد instance سراسری
window.dashboardLoadingManager = new DashboardLoadingManager();

// CSS برای loading state
const loadingCSS = `
.loading-state {
    color: #888 !important;
    animation: pulse 1.5s ease-in-out infinite alternate;
}

@keyframes pulse {
    from { opacity: 0.6; }
    to { opacity: 1; }
}
`;

// اضافه کردن CSS
const style = document.createElement('style');
style.textContent = loadingCSS;
document.head.appendChild(style);

console.log('📊 Dashboard Loading Manager loaded');