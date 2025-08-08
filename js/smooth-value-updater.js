/**
 * Smooth Value Updater - سیستم بروزرسانی نرم مقادیر داشبورد
 * جلوگیری از تغییرات ناگهانی و نامنظم در نمایش مقادیر
 */

class SmoothValueUpdater {
    constructor() {
        this.updateQueue = new Map(); // صف بروزرسانی برای هر عنصر
        this.isProcessing = new Map(); // بررسی پردازش
        this.lastValues = new Map(); // آخرین مقادیر ذخیره شده
        this.config = {
            transitionDuration: 400, // مدت زمان انتقال (میلی‌ثانیه)
            updateDelay: 100, // تاخیر بین بروزرسانی‌ها
            numberAnimation: true, // انیمیشن عددی
            preventFlicker: true // جلوگیری از چشمک زدن
        };
    }

    /**
     * بروزرسانی نرم یک عنصر
     * @param {string|HTMLElement} element - عنصر یا ID عنصر
     * @param {string|number} newValue - مقدار جدید
     * @param {Object} options - تنظیمات اختیاری
     */
    async updateValue(element, newValue, options = {}) {
        const el = typeof element === 'string' ? document.getElementById(element) : element;
        if (!el) return;

        const elementId = el.id || `element_${Date.now()}`;
        const currentValue = el.textContent || el.innerText;
        
        // اگر مقدار تغییری نکرده، هیچ کاری نکن
        if (currentValue === String(newValue)) {
            return;
        }

        // اگر این عنصر در حال پردازش است، به صف اضافه کن
        if (this.isProcessing.get(elementId)) {
            this.updateQueue.set(elementId, { element: el, value: newValue, options });
            return;
        }

        // شروع پردازش
        this.isProcessing.set(elementId, true);
        
        try {
            await this._performSmoothUpdate(el, newValue, options);
        } finally {
            this.isProcessing.set(elementId, false);
            
            // بررسی صف برای بروزرسانی‌های معلق
            if (this.updateQueue.has(elementId)) {
                const queued = this.updateQueue.get(elementId);
                this.updateQueue.delete(elementId);
                // تاخیر کوتاه قبل از بروزرسانی بعدی
                setTimeout(() => {
                    this.updateValue(queued.element, queued.value, queued.options);
                }, this.config.updateDelay);
            }
        }
    }

    /**
     * اجرای بروزرسانی نرم
     */
    async _performSmoothUpdate(element, newValue, options) {
        const settings = { ...this.config, ...options };
        
        // اضافه کردن کلاس‌های CSS برای انیمیشن
        this._addTransitionClasses(element);
        
        // اگر عنصر عددی است، انیمیشن عددی اعمال کن
        if (settings.numberAnimation && this._isNumeric(newValue)) {
            await this._animateNumericValue(element, newValue, settings);
        } else {
            await this._animateTextValue(element, newValue, settings);
        }
        
        // حذف کلاس‌های موقتی
        this._removeTransitionClasses(element);
    }

    /**
     * انیمیشن مقادیر عددی - با حفظ فرمت
     */
    async _animateNumericValue(element, targetValue, settings) {
        // استخراج فرمت از مقدار هدف
        const targetString = String(targetValue);
        const hasComma = targetString.includes(',');
        const suffix = this._extractSuffix(targetString);
        const prefix = this._extractPrefix(targetString);
        
        const currentText = element.textContent || '0';
        const currentValue = parseFloat(currentText.replace(/[^\d.-]/g, '')) || 0;
        const target = parseFloat(targetString.replace(/[^\d.-]/g, '')) || 0;
        
        if (Math.abs(currentValue - target) < 0.0001) {
            element.textContent = targetValue;
            return;
        }

        // برای داشبورد، بدون انیمیشن تدریجی - فقط فید نرم
        element.classList.add('updating-value');
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // مقدار نهایی با فرمت کامل
        element.textContent = targetValue;
        
        element.classList.remove('updating-value');
    }
    
    /**
     * استخراج پسوند از رشته (مثل CPA، DAI و ...)
     */
    _extractSuffix(str) {
        const match = str.match(/\s*([A-Z]+)\s*$/);
        return match ? match[1] : '';
    }
    
    /**
     * استخراج پیشوند از رشته
     */
    _extractPrefix(str) {
        const match = str.match(/^([^0-9]*)/);
        return match ? match[1] : '';
    }

    /**
     * انیمیشن مقادیر متنی - بهبود یافته
     */
    async _animateTextValue(element, newValue, settings) {
        // برای متن، فقط انتقال فید سریع
        element.classList.add('updating-value');
        
        await new Promise(resolve => setTimeout(resolve, 30));
        
        element.textContent = newValue;
        
        await new Promise(resolve => setTimeout(resolve, 20));
        element.classList.remove('updating-value');
        
        // حذف تنظیمات موقتی
        setTimeout(() => {
            element.style.transition = '';
            element.style.opacity = '';
        }, settings.transitionDuration / 2);
    }

    /**
     * اضافه کردن کلاس‌های CSS
     */
    _addTransitionClasses(element) {
        element.classList.add('smooth-value-transition', 'dashboard-value', 'updating');
    }

    /**
     * حذف کلاس‌های CSS
     */
    _removeTransitionClasses(element) {
        setTimeout(() => {
            element.classList.remove('updating', 'value-changing');
        }, this.config.transitionDuration);
    }

    /**
     * بررسی عددی بودن مقدار
     */
    _isNumeric(value) {
        const numericPattern = /^-?\d*\.?\d+/;
        return numericPattern.test(String(value));
    }

    /**
     * بروزرسانی چندین عنصر همزمان
     */
    async updateMultiple(updates) {
        const promises = updates.map(update => {
            const { element, value, options } = update;
            return this.updateValue(element, value, options);
        });
        
        await Promise.all(promises);
    }

    /**
     * تنظیم پیکربندی
     */
    configure(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * پاک کردن تمام صف‌ها
     */
    clearQueue() {
        this.updateQueue.clear();
        this.isProcessing.clear();
    }
}

// ایجاد نمونه سراسری
window.smoothValueUpdater = new window.smoothValueUpdater?.constructor() || new SmoothValueUpdater();

// تابع سراسری برای سادگی استفاده
window.updateValueSmoothly = function(element, value, options) {
    return window.smoothValueUpdater.updateValue(element, value, options);
};

// تابع سراسری برای بروزرسانی چندین مقدار
window.updateMultipleValuesSmoothly = function(updates) {
    return window.smoothValueUpdater.updateMultiple(updates);
};

console.log('✅ Smooth Value Updater loaded successfully');