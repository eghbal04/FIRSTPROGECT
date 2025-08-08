/**
 * Test Central Dashboard Updater - تست سیستم مرکزی
 */

function testCentralUpdater() {
    console.log('🧪 تست سیستم مرکزی داشبورد...');
    
    if (!window.centralDashboardUpdater) {
        console.error('❌ سیستم مرکزی بارگذاری نشده');
        return;
    }
    
    // فعال کردن debug
    enableCentralDebug();
    
    // نمایش آمار
    console.log('📊 آمار سیستم مرکزی:', getCentralUpdaterStats());
    
    // تست manual update
    console.log('🔄 تست بروزرسانی دستی...');
    setTimeout(() => {
        window.centralDashboardUpdater.checkAndUpdateValues();
    }, 1000);
    
    // نمایش نتایج بعد از 10 ثانیه
    setTimeout(() => {
        console.log('📊 آمار نهایی:', getCentralUpdaterStats());
        disableCentralDebug();
        console.log('✅ تست تمام شد');
    }, 10000);
}

// تست خودکار
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.location.search.includes('test=central') || 
            window.location.hash.includes('test-central')) {
            testCentralUpdater();
        }
    }, 5000);
});

// توابع کاربردی
window.testCentralUpdater = testCentralUpdater;

console.log('🧪 Central Updater Test loaded - استفاده: testCentralUpdater()');