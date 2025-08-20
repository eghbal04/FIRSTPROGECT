// مدیریت رویدادهای درخت - اول mobile popup را امتحان کن، سپس network popup
window.showUserPopup = function(address, user) {
  console.log('🔍 showUserPopup called, checking available popups...');
  
  // اول mobile popup را امتحان کن
  if (window.mobileUserPopup && typeof window.mobileUserPopup.show === 'function') {
    console.log('✅ Using mobile popup');
    return window.mobileUserPopup.show(address, user);
  }
  
  // اگر mobile popup موجود نبود، network popup را استفاده کن
  if (typeof window.networkShowUserPopup === 'function') {
    console.log('✅ Using network popup');
    return window.networkShowUserPopup(address, user);
  }
  
  console.log('❌ No popup available');
  // اگر هنوز لود نشده، از خطا جلوگیری کن
};
