/**
 * Test Smart Dashboard System - تست سیستم داشبورد هوشمند
 * این فایل برای تست و نمایش عملکرد سیستم بروزرسانی هوشمند است
 */

// تست سیستم بروزرسانی هوشمند
function testSmartDashboard() {
    console.log('🧪 شروع تست سیستم داشبورد هوشمند...');
    
    if (!window.smartDashboardUpdater) {
        console.error('❌ سیستم داشبورد هوشمند بارگذاری نشده');
        return;
    }
    
    // فعال کردن حالت debug
    window.smartDashboardUpdater.setDebugMode(true);
    
    console.log('📊 آمار اولیه:', window.smartDashboardUpdater.getStats());
    
    // تست بروزرسانی با مقدار یکسان
    console.log('\n🔄 تست 1: بروزرسانی با مقدار یکسان');
    const testElement = document.getElementById('circulating-supply');
    if (testElement) {
        const currentValue = testElement.textContent;
        console.log('مقدار فعلی:', currentValue);
        
        // بروزرسانی با همان مقدار - نباید تغییری ایجاد کند
        const result1 = window.smartUpdate('circulating-supply', currentValue);
        console.log('نتیجه تست 1:', result1 ? 'بروزرسانی شد ❌' : 'بروزرسانی نشد ✅');
    }
    
    // تست بروزرسانی با مقدار جدید
    console.log('\n🔄 تست 2: بروزرسانی با مقدار جدید');
    if (testElement) {
        const newValue = 'TEST: ' + Date.now();
        const result2 = window.smartUpdate('circulating-supply', newValue);
        console.log('نتیجه تست 2:', result2 ? 'بروزرسانی شد ✅' : 'بروزرسانی نشد ❌');
        
        // بازگردانی مقدار اصلی
        setTimeout(() => {
            window.smartUpdate('circulating-supply', '-');
        }, 2000);
    }
    
    // تست بروزرسانی چندگانه
    console.log('\n🔄 تست 3: بروزرسانی چندگانه');
    const multipleUpdates = [
        { element: 'total-points', value: 'TEST-POINTS: ' + Date.now() },
        { element: 'dashboard-token-price', value: 'TEST-PRICE: ' + Date.now() },
        { element: 'dashboard-wallets-count', value: 'TEST-COUNT: ' + Date.now() }
    ];
    
    const result3 = window.smartUpdateMultiple(multipleUpdates);
    console.log('نتیجه تست 3:', `${result3} مقدار بروزرسانی شد`);
    
    // بازگردانی مقادیر اصلی
    setTimeout(() => {
        const resetUpdates = [
            { element: 'total-points', value: '-' },
            { element: 'dashboard-token-price', value: '-' },
            { element: 'dashboard-wallets-count', value: '-' }
        ];
        window.smartUpdateMultiple(resetUpdates);
    }, 3000);
    
    // تست تغییر object
    console.log('\n🔄 تست 4: تغییر object');
    const testObject1 = { price: 100, volume: 1000 };
    const testObject2 = { price: 100, volume: 1000 }; // همان مقادیر
    const testObject3 = { price: 101, volume: 1000 }; // مقدار متفاوت
    
    const hasChanged1 = window.hasObjectChanged('testObject', testObject1);
    console.log('تغییر object اول:', hasChanged1 ? 'تغییر کرد ✅' : 'تغییر نکرد ❌');
    
    const hasChanged2 = window.hasObjectChanged('testObject', testObject2);
    console.log('تغییر object دوم (یکسان):', hasChanged2 ? 'تغییر کرد ❌' : 'تغییر نکرد ✅');
    
    const hasChanged3 = window.hasObjectChanged('testObject', testObject3);
    console.log('تغییر object سوم (متفاوت):', hasChanged3 ? 'تغییر کرد ✅' : 'تغییر نکرد ❌');
    
    // نمایش آمار نهایی
    setTimeout(() => {
        console.log('\n📊 آمار نهایی:', window.smartDashboardUpdater.getStats());
        window.smartDashboardUpdater.setDebugMode(false);
        console.log('✅ تست سیستم داشبورد هوشمند تمام شد');
    }, 5000);
}

// تست خودکار در صورت بارگذاری کامل صفحه
document.addEventListener('DOMContentLoaded', function() {
    // تاخیر برای اطمینان از بارگذاری کامل سیستم‌ها
    setTimeout(() => {
        if (window.location.search.includes('test=smart') || 
            window.location.hash.includes('test-smart')) {
            testSmartDashboard();
        }
    }, 3000);
});

// تابع‌های کاربردی برای کنسول
window.testSmartDashboard = testSmartDashboard;

window.enableSmartDebug = function() {
    if (window.smartDashboardUpdater) {
        window.smartDashboardUpdater.setDebugMode(true);
        console.log('🐛 حالت debug فعال شد');
    }
};

window.disableSmartDebug = function() {
    if (window.smartDashboardUpdater) {
        window.smartDashboardUpdater.setDebugMode(false);
        console.log('📊 حالت debug غیرفعال شد');
    }
};

window.getSmartStats = function() {
    if (window.smartDashboardUpdater) {
        return window.smartDashboardUpdater.getStats();
    }
    return 'سیستم بارگذاری نشده';
};

window.resetSmartCache = function() {
    if (window.smartDashboardUpdater) {
        window.smartDashboardUpdater.reset();
        console.log('🔄 کش سیستم هوشمند پاک شد');
    }
};

console.log('🧪 Smart Dashboard Test System loaded - استفاده کنید: testSmartDashboard()');