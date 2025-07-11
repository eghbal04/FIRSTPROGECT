// Hamburger Menu Only (دکمه توسط لوگو جایگزین شده)
(function() {
  // حذف قبلی اگر وجود دارد
  var oldBtn = document.getElementById('hamburgerBtn');
  if (oldBtn) oldBtn.remove();
  var oldMenu = document.getElementById('hamburgerMenu');
  if (oldMenu) oldMenu.remove();

  // دکمه همبرگر حذف شده - لوگو جایگزین شده

  // منوی همبرگر فشرده و زیبا
  var menu = document.createElement('nav');
  menu.className = 'hamburger-menu';
  menu.id = 'hamburgerMenu';
  menu.innerHTML = `
    <div class="menu-header">
      <div class="menu-title">CPA</div>
      <div class="menu-close" onclick="toggleHamburgerMenu()">×</div>
    </div>
    
    <div class="menu-items">
      <!-- بخش اصلی -->
      <div class="menu-section">
        <div class="section-title">🏠 صفحه اصلی</div>
        <button onclick="window.location.reload()" class="menu-btn">
          <span class="btn-icon">📊</span>
          <span class="btn-text">داشبورد</span>
        </button>
      </div>
      
      <!-- بخش حساب کاربری -->
      <div class="menu-section">
        <div class="section-title">👤 حساب کاربری</div>
        <button onclick="showTab('profile')" class="menu-btn">
          <span class="btn-icon">👤</span>
          <span class="btn-text">پروفایل</span>
        </button>
        <button onclick="showTab('network')" class="menu-btn">
          <span class="btn-icon">🌐</span>
          <span class="btn-text">شبکه</span>
        </button>
        <button onclick="showTab('reports')" class="menu-btn">
          <span class="btn-icon">📊</span>
          <span class="btn-text">گزارشات</span>
        </button>
      </div>
      
      <!-- بخش معاملات -->
      <div class="menu-section">
        <div class="section-title">💰 معاملات</div>
        <button onclick="showTab('swap')" class="menu-btn">
          <span class="btn-icon">🔄</span>
          <span class="btn-text">تبدیل</span>
        </button>
        <button onclick="showTab('transfer')" class="menu-btn">
          <span class="btn-icon">💸</span>
          <span class="btn-text">ترانسفر</span>
        </button>
        <button onclick="navigateToPage('shop.html')" class="menu-btn">
          <span class="btn-icon">🛒</span>
          <span class="btn-text">فروشگاه</span>
        </button>
      </div>
      
      <!-- بخش آموزش -->
      <div class="menu-section">
        <div class="section-title">🎓 آموزش</div>
        <button onclick="navigateToPage('news.html')" class="menu-btn">
          <span class="btn-icon">📰</span>
          <span class="btn-text">اخبار</span>
        </button>
        <button onclick="navigateToPage('learning.html')" class="menu-btn">
          <span class="btn-icon">🎓</span>
          <span class="btn-text">آموزش</span>
        </button>
      </div>
      
      <!-- بخش ابزارها -->
      <div class="menu-section">
        <div class="section-title">🛠️ ابزارها</div>
        <button onclick="navigateToPage('signal.html')" class="menu-btn">
          <span class="btn-icon">📈</span>
          <span class="btn-text">سیگنال</span>
        </button>
        <button onclick="navigateToPage('autotrade-license.html')" class="menu-btn">
          <span class="btn-icon">🤖</span>
          <span class="btn-text">ربات</span>
        </button>
        <button onclick="navigateToPage('lottery.html')" class="menu-btn">
          <span class="btn-icon">🎲</span>
          <span class="btn-text">قرعه‌کشی</span>
        </button>
        <button onclick="navigateToPage('admin-prop.html')" class="menu-btn">
          <span class="btn-icon">📄</span>
          <span class="btn-text">پاس پراپ</span>
        </button>
      </div>
      
      <!-- بخش اطلاعات -->
      <div class="menu-section">
        <div class="section-title">ℹ️ اطلاعات</div>
        <button onclick="showTab('about')" class="menu-btn">
          <span class="btn-icon">ℹ️</span>
          <span class="btn-text">درباره ما</span>
        </button>
        <button class="menu-btn submenu-toggle" onclick="toggleSubmenu('desc-submenu')">
          <span class="btn-icon">📚</span>
          <span class="btn-text">توضیحات</span>
          <span id="desc-arrow" class="btn-arrow">▼</span>
        </button>
        <div id="desc-submenu" class="submenu">
          <button onclick="alert('بروکرها')" class="submenu-btn">بروکرها</button>
          <button onclick="alert('صرافی‌ها')" class="submenu-btn">صرافی‌ها</button>
          <button onclick="alert('ای‌بی')" class="submenu-btn">ای‌بی</button>
          <button onclick="alert('ایجنت')" class="submenu-btn">ایجنت</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(menu);

  // استایل منوی فشرده و زیبا
  var style = document.createElement('style');
  style.innerHTML = `
  .hamburger-menu { 
    display: none; 
    flex-direction: column; 
    background: rgba(255, 255, 255, 0.05);
    width: 200px; 
    min-width: 180px; 
    max-width: 220px; 
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(255, 255, 255, 0.1);
    font-size: 0.9rem; 
    padding: 0; 
    gap: 0; 
    border-radius: 24px; 
    animation: slideInMenu 0.25s ease; 
    backdrop-filter: blur(30px) saturate(200%);
    -webkit-backdrop-filter: blur(30px) saturate(200%);
    max-height: 70vh; 
    overflow-y: auto; 
    position: fixed; 
    bottom: 80px; 
    right: 24px; 
    z-index: 999998;
    border: 1px solid rgba(255, 255, 255, 0.4);
  }
  
  .hamburger-menu.open { display: flex; }
  
  .menu-header {
    background: rgba(255, 255, 255, 0.08);
    padding: 0.8rem 1rem;
    border-radius: 24px 24px 0 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  .menu-title {
    font-size: 1rem;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .menu-close {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: rgba(255,255,255,0.9);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.2rem;
    border-radius: 12px;
    transition: all 0.3s ease;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  .menu-close:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  .menu-items {
    padding: 0.5rem 0;
  }
  
  .menu-section {
    margin-bottom: 1.5rem;
    padding: 0 0.8rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
  
  .menu-section:last-child {
    margin-bottom: 0;
  }
  
  .menu-section:hover {
    background: rgba(255, 255, 255, 0.04);
    transform: translateY(-1px);
    transition: all 0.3s ease;
  }
  
  .section-title {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.75rem;
    font-weight: bold;
    padding: 0.6rem 0.8rem 0.4rem 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    border-bottom: 2px solid rgba(0, 255, 136, 0.3);
    margin-bottom: 0.6rem;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 10px 10px 0 0;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(167, 134, 255, 0.1));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  
  .menu-btn {
    background: rgba(255, 255, 255, 0.03); 
    border: none; 
    color: #fff; 
    font-size: 0.9rem; 
    text-align: right; 
    padding: 0.6rem 1rem; 
    border-radius: 0; 
    cursor: pointer; 
    width: 100%; 
    display: flex; 
    align-items: center; 
    gap: 0.6rem; 
    transition: all 0.3s ease; 
    position: relative; 
    min-height: 40px;
    border-left: 3px solid transparent;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  
  .menu-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    border-left-color: rgba(255, 255, 255, 0.7);
    transform: translateX(-3px);
    box-shadow: 
      inset 0 0 20px rgba(255, 255, 255, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  .menu-btn:active {
    transform: translateX(-2px) scale(0.98);
  }
  
  .btn-icon {
    font-size: 1em;
    color: rgba(255, 255, 255, 0.9);
    flex-shrink: 0;
    width: 20px;
    text-align: center;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }
  
  .btn-text {
    flex: 1;
    font-weight: 500;
  }
  
  .btn-arrow {
    color: rgba(255,255,255,0.5);
    font-size: 0.8em;
    transition: all 0.2s ease;
  }
  
  .menu-btn:hover .btn-arrow {
    color: rgba(255, 255, 255, 0.9);
    transform: translateX(2px);
  }
  
  /* Divider removed - using sections instead */
  
  .submenu {
    display: none;
    padding-left: 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    margin: 0.1rem 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    border-left: 2px solid rgba(255, 255, 255, 0.3);
    margin-left: 1rem;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
  
  .submenu-btn {
    background: rgba(255, 255, 255, 0.02);
    border: none;
    color: rgba(255,255,255,0.8);
    font-size: 0.85rem;
    padding: 0.4rem 1rem;
    cursor: pointer;
    width: 100%;
    text-align: right;
    transition: all 0.2s ease;
    border-left: 2px solid transparent;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }
  
  .submenu-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    border-left-color: rgba(255, 255, 255, 0.5);
  }
  
  @media (max-width: 700px) { 
    .hamburger-menu { 
      right: 8px; 
      bottom: 68px; 
      width: 200px;
      max-height: 80vh;
    }
    
    .menu-section {
      margin-bottom: 1.2rem;
      padding: 0 0.3rem;
    }
    
    .section-title {
      font-size: 0.75rem;
      padding: 0.4rem 0.4rem 0.2rem 0.4rem;
      margin-bottom: 0.4rem;
    }
    
    .menu-btn {
      padding: 0.7rem 0.8rem;
      min-height: 44px;
      font-size: 0.95rem;
    }
    
    .btn-icon {
      width: 22px;
      font-size: 1.1em;
    }
  }
  
  @keyframes slideInMenu { 
    from { 
      opacity: 0; 
      transform: translateY(15px) scale(0.95); 
    } 
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    } 
  }
  
  /* Scrollbar styling */
  .hamburger-menu::-webkit-scrollbar {
    width: 3px;
  }
  
  .hamburger-menu::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.1);
    border-radius: 2px;
  }
  
  .hamburger-menu::-webkit-scrollbar-thumb {
    background: rgba(0,255,136,0.3);
    border-radius: 2px;
  }
  
  .hamburger-menu::-webkit-scrollbar-thumb:hover {
    background: rgba(0,255,136,0.5);
  }
  `;
  document.head.appendChild(style);

  // رفتار باز/بسته شدن توسط لوگو کنترل می‌شود
  // ساب منو با انیمیشن زیبا
  window.toggleSubmenu = function(id) {
    var submenu = document.getElementById(id);
    var arrow = document.getElementById('desc-arrow');
    
    if (submenu.style.display === 'none' || submenu.style.display === '') {
      // باز کردن ساب منو
      submenu.style.display = 'block';
      submenu.style.opacity = '0';
      submenu.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        submenu.style.opacity = '1';
        submenu.style.transform = 'translateY(0)';
      }, 10);
      if (arrow) {
        arrow.style.transform = 'rotate(180deg)';
        arrow.style.transition = 'transform 0.3s ease';
      }
    } else {
      // بستن ساب منو
      submenu.style.opacity = '0';
      submenu.style.transform = 'translateY(-10px)';
      submenu.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      setTimeout(() => {
        submenu.style.display = 'none';
      }, 200);
      if (arrow) {
        arrow.style.transform = 'rotate(0deg)';
        arrow.style.transition = 'transform 0.3s ease';
      }
    }
  };
})(); 