/**
 * سیستم اتصال خودکار کیف پول
 * این فایل در صفحاتی که نیاز به کیف پول دارند بارگذاری می‌شود
 */

(function() {
    'use strict';
    
    let autoConnectAttempted = false;
    let retryCount = 0;
    const maxRetries = 3;

    /**
     * تلاش برای اتصال خودکار کیف پول
     */
    async function attemptAutoConnect() {
        if (autoConnectAttempted) {
            return false;
        }
        
        autoConnectAttempted = true;
        console.log('🔄 تلاش برای اتصال خودکار کیف پول...');

        try {
            // بررسی دسترسی به تابع connectWallet
            if (!window.connectWallet) {
                console.log('⚠️ تابع connectWallet در دسترس نیست');
                return false;
            }

            // تلاش برای اتصال
            const connection = await window.connectWallet();
            
            if (connection && connection.address) {
                console.log('✅ کیف پول با موفقیت متصل شد:', connection.address.substring(0, 6) + '...');
                
                // تریگر رویدادهای مربوط به اتصال موفق
                window.dispatchEvent(new CustomEvent('walletConnected', {
                    detail: { connection }
                }));
                
                return true;
            } else {
                console.log('❌ اتصال کیف پول ناموفق بود');
                return false;
            }
            
        } catch (error) {
            console.warn('⚠️ خطا در اتصال خودکار کیف پول:', error.message || error);
            retryCount++;
            
            // تلاش مجدد تا 3 بار
            if (retryCount < maxRetries) {
                console.log(`🔄 تلاش مجدد ${retryCount}/${maxRetries}...`);
                autoConnectAttempted = false;
                setTimeout(() => attemptAutoConnect(), 2000);
            }
            
            return false;
        }
    }

    /**
     * بررسی وضعیت اتصال فعلی
     */
    function checkCurrentConnection() {
        return window.contractConfig && 
               window.contractConfig.address && 
               window.contractConfig.contract;
    }

    /**
     * شروع فرآیند اتصال خودکار
     */
    function initAutoConnect() {
        // اگر قبلاً متصل است، نیازی به اتصال مجدد نیست
        if (checkCurrentConnection()) {
            console.log('✅ کیف پول قبلاً متصل است');
            return;
        }

        // شروع اتصال خودکار بعد از بارگذاری کامل صفحه
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(attemptAutoConnect, 1000);
            });
        } else {
            setTimeout(attemptAutoConnect, 1000);
        }

        // گوش دادن به تغییرات در window.contractConfig
        let checkInterval = setInterval(() => {
            if (checkCurrentConnection()) {
                console.log('✅ کیف پول متصل شد');
                clearInterval(checkInterval);
            }
        }, 2000);

        // متوقف کردن بررسی بعد از 30 ثانیه
        setTimeout(() => {
            clearInterval(checkInterval);
        }, 30000);
    }

    /**
     * تابع عمومی برای اتصال دستی
     */
    window.manualConnectWallet = async function() {
        autoConnectAttempted = false;
        retryCount = 0;
        return await attemptAutoConnect();
    };

    /**
     * نمایش اطلاعات وضعیت اتصال
     */
    window.showWalletConnectionStatus = function() {
        const isConnected = checkCurrentConnection();
        const address = window.contractConfig?.address;
        
        console.log('🔍 وضعیت اتصال کیف پول:');
        console.log('  - متصل:', isConnected ? '✅' : '❌');
        if (address) {
            console.log('  - آدرس:', address.substring(0, 6) + '...' + address.substring(38));
        }
        
        return isConnected;
    };

    // اتصال خودکار غیرفعال شد
    // initAutoConnect();
    // console.log('🚀 سیستم اتصال خودکار کیف پول فعال شد');

})();
