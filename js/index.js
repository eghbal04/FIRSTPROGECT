// Browser-compatible index.js
// این فایل برای جلوگیری از خطای "exports is not defined" ایجاد شده است

// تعریف شیء exports به‌صورت امن بدون ایجاد متغیر global به نام exports
window.exports = window.exports || {};
// در صورت نیاز در کدهای دیگر، می‌توان از window.exports استفاده کرد

// اگر module تعریف نشده، آن را تعریف کن
if (typeof window.module === 'undefined') { window.module = { exports: {} }; }

// اگر require تعریف نشده، آن را تعریف کن
if (typeof require === 'undefined') {
  window.require = function(id) {
    console.warn('require() called but not available in browser:', id);
    return {};
  };
}

console.log('✅ Browser compatibility layer loaded');