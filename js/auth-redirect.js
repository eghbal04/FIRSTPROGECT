// js/auth-redirect.js
window.checkUserActivation = async function() {
  try {
    if (window.getUserProfile) {
      const profile = await window.getUserProfile();
      if (!profile.activated) {
        document.body.innerHTML = '<div style="color:red;text-align:center;margin-top:80px;font-size:1.3rem;font-weight:bold;">شما کاربر فعال نیستید، در حال انتقال به ثبت‌نام...</div>';
        setTimeout(function() {
          window.location.href = "index.html#main-register";
        }, 2000);
        return false;
      }
    }
    var loading = document.getElementById('auth-loading');
    if (loading) loading.remove();
    return true;
  } catch (e) {
    document.body.innerHTML = '<div style="color:red;text-align:center;margin-top:80px;font-size:1.3rem;font-weight:bold;">شما کاربر فعال نیستید، در حال انتقال به ثبت‌نام...</div>';
    setTimeout(function() {
      window.location.href = "index.html#main-register";
    }, 2000);
    return false;
  }
}; 