// Browser-compatible index.js
// این فایل برای جلوگیری از خطای "exports is not defined" ایجاد شده است

// تعریف exports در ابتدا - این خط باید قبل از هر چیز اجرا شود
var exports = window.exports = {};

// اگر module تعریف نشده، آن را تعریف کن
if (typeof module === 'undefined') {
  window.module = { exports: {} };
}

// اگر require تعریف نشده، آن را تعریف کن
if (typeof require === 'undefined') {
  window.require = function(id) {
    console.warn('require() called but not available in browser:', id);
    return {};
  };
}

console.log('✅ Browser compatibility layer loaded');