/**
 * Smart Dashboard Updater - سیستم بروزرسانی هوشمند داشبورد
 * فقط در صورت تغییر واقعی مقادیر، UI را بروزرسانی می‌کند
 */

class SmartDashboardUpdater {
    constructor() {
        this.previousValues = new Map(); // ذخیره مقادیر قبلی
        this.isEnabled = true;
        this.debugMode = false; // برای مشاهده تغییرات
    }

    /**
     * مقایسه و بروزرسانی هوشمند مقدار
     * @param {string|HTMLElement} element - عنصر یا ID عنصر
     * @param {string|number} newValue - مقدار جدید
     * @param {Object} options - تنظیمات اختیاری
     * @returns {boolean} - آیا بروزرسانی انجام شد یا نه
     */
    smartUpdate(element, newValue, options = {}) {
        if (!this.isEnabled) {
            return false;
        }

        const el = typeof element === 'string' ? document.getElementById(element) : element;
        if (!el) return false;

        const elementId = el.id || `element_${Date.now()}`;
        const currentValue = String(newValue);
        const previousValue = this.previousValues.get(elementId);

        // بررسی تغییر مقدار
        if (previousValue === currentValue) {
            if (this.debugMode) {
                console.log(`⚡ هیچ تغییری در ${elementId}: ${currentValue}`);
            }
            return false; // هیچ تغییری نیست، بروزرسانی نکن
        }

        // ذخیره مقدار جدید
        this.previousValues.set(elementId, currentValue);

        // انجام بروزرسانی
        if (this.debugMode) {
            console.log(`🔄 بروزرسانی ${elementId}: ${previousValue} → ${currentValue}`);
        }

        // استفاده از سیستم انتقال نرم اگر موجود باشد
        if (window.updateValueSmoothly) {
            window.updateValueSmoothly(el, newValue, {
                transitionDuration: 500,
                numberAnimation: true,
                preventFlicker: true,
                ...options
            });
        } else {
            el.textContent = newValue;
        }

        return true; // بروزرسانی انجام شد
    }

    /**
     * بروزرسانی هوشمند چندین مقدار
     * @param {Array} updates - آرایه از آپدیت‌ها
     * @returns {number} - تعداد بروزرسانی‌های انجام شده
     */
    smartUpdateMultiple(updates) {
        let updatedCount = 0;
        const actualUpdates = [];

        // ابتدا بررسی کن کدام مقادیر واقعا تغییر کرده‌اند
        updates.forEach(update => {
            const { element, value, options } = update;
            const el = typeof element === 'string' ? document.getElementById(element) : element;
            if (!el) return;

            const elementId = el.id || `element_${Date.now()}`;
            const currentValue = String(value);
            const previousValue = this.previousValues.get(elementId);

            if (previousValue !== currentValue) {
                this.previousValues.set(elementId, currentValue);
                actualUpdates.push(update);
                updatedCount++;

                if (this.debugMode) {
                    console.log(`🔄 بروزرسانی ${elementId}: ${previousValue} → ${currentValue}`);
                }
            }
        });

        // فقط مقادیر تغییر یافته را بروزرسانی کن
        if (actualUpdates.length > 0) {
            if (window.updateMultipleValuesSmoothly) {
                window.updateMultipleValuesSmoothly(actualUpdates);
            } else {
                actualUpdates.forEach(update => {
                    const el = typeof update.element === 'string' ? 
                        document.getElementById(update.element) : update.element;
                    if (el) el.textContent = update.value;
                });
            }
        }

        if (this.debugMode && updatedCount > 0) {
            console.log(`📊 ${updatedCount} از ${updates.length} مقدار بروزرسانی شد`);
        }

        return updatedCount;
    }

    /**
     * تابع بروزرسانی امن هوشمند (جایگزین safeUpdate)
     */
    smartSafeUpdate(id, value) {
        if (value === undefined || value === null || value === 'Error' || value === 'در دسترس نیست') {
            return false; // مقدار معتبر نیست، بروزرسانی نکن
        }

        return this.smartUpdate(id, value, {
            transitionDuration: 600,
            numberAnimation: true,
            preventFlicker: true
        });
    }

    /**
     * مقایسه عمیق دو مقدار (برای object ها و array ها)
     */
    deepEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (typeof a !== typeof b) return false;
        
        if (typeof a === 'object') {
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length) return false;
            
            for (let key of aKeys) {
                if (!this.deepEqual(a[key], b[key])) return false;
            }
            return true;
        }
        
        return false;
    }

    /**
     * بررسی تغییرات در یک object کامل (مثل stats داشبورد)
     */
    hasObjectChanged(objectKey, newObject) {
        const previousObject = this.previousValues.get(objectKey);
        const hasChanged = !this.deepEqual(previousObject, newObject);
        
        if (hasChanged) {
            this.previousValues.set(objectKey, JSON.parse(JSON.stringify(newObject)));
        }
        
        return hasChanged;
    }

    /**
     * ریست کردن تمام مقادیر ذخیره شده
     */
    reset() {
        this.previousValues.clear();
        console.log('🔄 تمام مقادیر قبلی پاک شد');
    }

    /**
     * فعال/غیرفعال کردن سیستم
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`${enabled ? '✅' : '❌'} سیستم بروزرسانی هوشمند ${enabled ? 'فعال' : 'غیرفعال'} شد`);
    }

    /**
     * فعال/غیرفعال کردن حالت debug
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`${enabled ? '🐛' : '📊'} حالت debug ${enabled ? 'فعال' : 'غیرفعال'} شد`);
    }

    /**
     * دریافت آمار بروزرسانی‌ها
     */
    getStats() {
        return {
            totalTrackedElements: this.previousValues.size,
            isEnabled: this.isEnabled,
            debugMode: this.debugMode
        };
    }
}

// ایجاد نمونه سراسری
window.smartDashboardUpdater = new SmartDashboardUpdater();

// توابع سراسری برای سادگی استفاده
window.smartUpdate = function(element, value, options) {
    return window.smartDashboardUpdater.smartUpdate(element, value, options);
};

window.smartUpdateMultiple = function(updates) {
    return window.smartDashboardUpdater.smartUpdateMultiple(updates);
};

window.smartSafeUpdate = function(id, value) {
    return window.smartDashboardUpdater.smartSafeUpdate(id, value);
};

// تابع بررسی تغییرات object
window.hasObjectChanged = function(objectKey, newObject) {
    return window.smartDashboardUpdater.hasObjectChanged(objectKey, newObject);
};

console.log('✅ Smart Dashboard Updater loaded successfully');