// Browser compatibility layer
// این فایل برای جلوگیری از خطای "exports is not defined" ایجاد شده است

// اطمینان از وجود متغیر سراسری exports
if (typeof exports === 'undefined') {
  // استفاده از var تا در اسکوپ سراسری تعریف شود
  var exports = {};
}

// تعریف exports در global scope
if (typeof window !== 'undefined') {
  window.exports = window.exports || {};
} else {
  global.exports = global.exports || {};
}

// تعریف module در global scope
if (typeof window !== 'undefined') {
  window.module = window.module || { exports: {} };
} else {
  global.module = global.module || { exports: {} };
}

// تعریف require در global scope
if (typeof window !== 'undefined') {
  window.require = window.require || function(id) {
    console.warn('require() called but not available in browser:', id);
    return {};
  };
} else {
  global.require = global.require || function(id) {
    console.warn('require() called but not available in browser:', id);
    return {};
  };
}

console.log('✅ Browser compatibility layer loaded');

