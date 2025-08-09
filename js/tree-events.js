// مدیریت رویدادهای درخت - فقط به پاپ‌آپ شبکه دلیگیت کن
window.showUserPopup = function(address, user) {
  if (typeof window.networkShowUserPopup === 'function') {
    return window.networkShowUserPopup(address, user);
  }
  // اگر هنوز لود نشده، از خطا جلوگیری کن
};
