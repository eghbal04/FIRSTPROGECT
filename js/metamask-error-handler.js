/**
 * MetaMask Error Handler
 * مدیریت خطاهای MetaMask و جلوگیری از نمایش خطاهای deprecated
 */

(function() {
    'use strict';
    
    // ذخیره console.error اصلی
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // فیلتر کردن خطاهای MetaMask
    function filterMetaMaskErrors(message) {
        if (typeof message !== 'string') return true;
        
        // خطاهای MetaMask که باید نادیده گرفته شوند
        const ignoredErrors = [
            'ethereum.send(...) is deprecated',
            'getEnabledChains does not exist',
            'isDefaultWallet does not exist',
            'MetaMask - RPC Error',
            'The method "getEnabledChains" does not exist',
            'The method "isDefaultWallet" does not exist'
        ];
        
        return !ignoredErrors.some(error => message.includes(error));
    }
    
    // Override console.error
    console.error = function(...args) {
        const message = args.join(' ');
        if (filterMetaMaskErrors(message)) {
            originalConsoleError.apply(console, args);
        }
    };
    
    // Override console.warn
    console.warn = function(...args) {
        const message = args.join(' ');
        if (filterMetaMaskErrors(message)) {
            originalConsoleWarn.apply(console, args);
        }
    };
    
    // مدیریت خطاهای unhandled promise rejection
    window.addEventListener('unhandledrejection', function(event) {
        const error = event.reason;
        
        if (error && typeof error === 'object') {
            // بررسی خطاهای MetaMask
            if (error.code === -32601 && 
                (error.message.includes('getEnabledChains') || 
                 error.message.includes('isDefaultWallet'))) {
                console.log('🔇 MetaMask RPC method not available (ignored)');
                event.preventDefault();
                return;
            }
        }
        
        // سایر خطاها را نمایش دهید
        originalConsoleError('Unhandled Promise Rejection:', error);
    });
    
    // مدیریت خطاهای عمومی
    window.addEventListener('error', function(event) {
        const error = event.error;
        
        if (error && typeof error === 'object') {
            // بررسی خطاهای MetaMask
            if (error.code === -32601 && 
                (error.message && (error.message.includes('getEnabledChains') || 
                 error.message.includes('isDefaultWallet')))) {
                console.log('🔇 MetaMask RPC method not available (ignored)');
                event.preventDefault();
                return;
            }
        }
        
        // سایر خطاها را نمایش دهید
        originalConsoleError('Global Error:', error);
    });
    
    console.log('✅ MetaMask error handler loaded');
})();
