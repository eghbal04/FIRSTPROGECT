(function() {
  'use strict';

  // حذف منوی قبلی اگر وجود داشته باشه
  var oldMenu = document.getElementById('sidebarMenu');
  if (oldMenu) oldMenu.remove();

  // ساید بار جدید
  var sidebar = document.createElement('nav');
  sidebar.className = 'sidebar-menu';
  sidebar.id = 'sidebarMenu';
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-title">CPA Platform</div>
      <div class="sidebar-close" onclick="toggleSidebar()">×</div>
    </div>
    
    <div class="sidebar-content">
      <!-- بخش اصلی -->
      <div class="sidebar-section">
        <div class="section-title" onclick="toggleSidebarSection('home-section')">
          🏠 صفحه اصلی
        </div>
        <div class="section-content collapsed" id="home-section">
          <button onclick="window.location.reload()" class="sidebar-btn">
            <span class="btn-icon">📊</span>
            <span class="btn-text">داشبورد</span>
          </button>
        </div>
      </div>
      
      <!-- بخش حساب کاربری -->
      <div class="sidebar-section">
        <div class="section-title" onclick="toggleSidebarSection('account-section')">
          👤 حساب کاربری
        </div>
        <div class="section-content collapsed" id="account-section">
          <button onclick="showTab('profile')" class="sidebar-btn">
            <span class="btn-icon">👤</span>
            <span class="btn-text">پروفایل</span>
          </button>

          <button onclick="showTab('network')" class="sidebar-btn">
            <span class="btn-icon">🌳</span>
            <span class="btn-text">شبکه همکاران</span>
          </button>
          <button onclick="showTab('reports')" class="sidebar-btn">
            <span class="btn-icon">📊</span>
            <span class="btn-text">گزارش‌ها</span>
          </button>
        </div>
      </div>
      
      <!-- بخش معاملات و مالی -->
      <div class="sidebar-section">
        <div class="section-title" onclick="toggleSidebarSection('trading-section')">
          💰 معاملات
        </div>
        <div class="section-content collapsed" id="trading-section">
          <button onclick="showTab('swap')" class="sidebar-btn">
            <span class="btn-icon">🔄</span>
            <span class="btn-text">تبدیل</span>
          </button>
          <button onclick="showTab('transfer')" class="sidebar-btn">
            <span class="btn-icon">💸</span>
            <span class="btn-text">ترانسفر</span>
          </button>
          <button onclick="navigateToPage('products.html')" class="sidebar-btn">
            <span class="btn-icon">🛍️</span>
            <span class="btn-text">محصولات</span>
          </button>
          <button onclick="navigateToPage('utility.html')" class="sidebar-btn">
            <span class="btn-icon">🛠️</span>
            <span class="btn-text">ابزارها</span>
          </button>
        </div>
      </div>

      <!-- بخش عضویت -->
      <div class="sidebar-section">
        <div class="section-title" onclick="toggleSidebarSection('membership-section')">
          📝 عضویت
        </div>
        <div class="section-content collapsed" id="membership-section">
          <button onclick="navigateToPage('register.html')" class="sidebar-btn">
            <span class="btn-icon">📝</span>
            <span class="btn-text">ثبت‌نام</span>
          </button>
          <button onclick="navigateToPage('register-free.html')" class="sidebar-btn">
            <span class="btn-icon">🎫</span>
            <span class="btn-text">رزرو رایگان</span>
          </button>
        </div>
      </div>
      
      <!-- بخش آموزش و اطلاعات -->
      <div class="sidebar-section">
        <div class="section-title" onclick="toggleSidebarSection('education-section')">
          📚 آموزش و اطلاعات
        </div>
        <div class="section-content collapsed" id="education-section">
          <button onclick="navigateToPage('learning.html')" class="sidebar-btn">
            <span class="btn-icon">🎓</span>
            <span class="btn-text">آموزش</span>
          </button>
          <button onclick="navigateToPage('news.html')" class="sidebar-btn">
            <span class="btn-icon">📰</span>
            <span class="btn-text">اخبار</span>
          </button>
          <button onclick="showTab('about')" class="sidebar-btn">
            <span class="btn-icon">ℹ️</span>
            <span class="btn-text">درباره ما</span>
          </button>
        </div>
      </div>
      
      <!-- بخش ابزارهای پیشرفته -->
      <div class="sidebar-section">
        <div class="section-title" onclick="toggleSidebarSection('advanced-section')">
          🚀 ابزارهای پیشرفته
        </div>
        <div class="section-content collapsed" id="advanced-section">
          <button onclick="navigateToPage('signal.html')" class="sidebar-btn">
            <span class="btn-icon">📈</span>
            <span class="btn-text">سیگنال</span>
          </button>
          <button onclick="navigateToPage('autotrade-license.html')" class="sidebar-btn">
            <span class="btn-icon">🤖</span>
            <span class="btn-text">ربات معاملاتی</span>
          </button>
          <button class="sidebar-btn submenu-toggle" onclick="toggleSubmenu('services-submenu')">
            <span class="btn-icon">🏢</span>
            <span class="btn-text">خدمات ویژه</span>
            <span id="services-arrow" class="btn-arrow">▼</span>
          </button>
          <div id="services-submenu" class="submenu">
            <button onclick="navigateToPage('broker.html')" class="submenu-btn">🏦 بروکرها</button>
            <button onclick="navigateToPage('exchange.html')" class="submenu-btn">💱 صرافی‌ها</button>
            <button onclick="navigateToPage('ib.html')" class="submenu-btn">🤝 ای‌بی</button>
            <button onclick="navigateToPage('agent.html')" class="submenu-btn">👨‍💼 ایجنت</button>
            <button onclick="navigateToPage('admin-prop.html')" class="submenu-btn">📄 پاس پراپ</button>
          </div>
        </div>
      </div>
      
      <!-- بخش مدیریت -->
      <div class="sidebar-section">
        <div class="section-title" onclick="toggleSidebarSection('management-section')">
          ⚙️ مدیریت
        </div>
        <div class="section-content collapsed" id="management-section">
          <button onclick="navigateToPage('admin-owner-panel.html')" class="sidebar-btn admin-only" style="display:none;">
            <span class="btn-icon">👑</span>
            <span class="btn-text">پنل ادمین</span>
          </button>
          <button onclick="navigateToPage('transfer-ownership.html')" class="sidebar-btn">
            <span class="btn-icon">🔄</span>
            <span class="btn-text">انتقال مالکیت</span>
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(sidebar);

  // استایل ساید بار
  var style = document.createElement('style');
  style.textContent = `
  .sidebar-menu {
    position: fixed;
    top: 0;
    right: -320px;
    width: 320px;
    height: 100vh;
    background: linear-gradient(180deg, var(--modern-bg-primary) 0%, var(--modern-bg-secondary) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-left: 1px solid var(--modern-secondary-border);
    z-index: var(--modern-z-modal);
    transition: right var(--modern-transition-slow) cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: var(--modern-shadow-xl);
    font-family: var(--modern-font-family);
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
  }

  .sidebar-menu.open {
    right: 0;
  }

  .sidebar-header {
    background: linear-gradient(135deg, var(--modern-secondary-light), var(--modern-primary-light));
    padding: var(--modern-space-xl) var(--modern-space-xl) var(--modern-space-lg) var(--modern-space-xl);
    border-bottom: 1px solid var(--modern-border-light);
    position: relative;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .sidebar-title {
    color: var(--modern-secondary);
    font-size: var(--modern-font-size-2xl);
    font-weight: 700;
    text-align: right;
    letter-spacing: 1px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .sidebar-close {
    position: absolute;
    top: var(--modern-space-lg);
    left: var(--modern-space-lg);
    width: 40px;
    height: 40px;
    background: var(--modern-border-light);
    border-radius: var(--modern-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--modern-transition-normal);
    color: var(--modern-text-primary);
    font-size: var(--modern-font-size-lg);
    font-weight: 700;
    border: none;
  }

  .sidebar-close:hover {
    background: rgba(255, 100, 100, 0.3);
    transform: scale(1.1);
  }

  .sidebar-content {
    flex: 1;
    padding: 0.7rem;
    overflow-y: auto;
  }

  .sidebar-section {
    margin-bottom: 0.05rem;
  }

  .section-title {
    color: var(--modern-accent);
    font-size: 0.85rem;
    font-weight: bold;
    padding: 0.6rem 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    border: 1px solid rgba(0, 255, 136, 0.3);
    margin-bottom: 0.1rem;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(167, 134, 255, 0.1));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
    user-select: none;
    position: relative;
    text-align: right;
    direction: rtl;
  }

  .section-title:hover {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(167, 134, 255, 0.2));
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.2);
  }

  .section-title.active {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.25), rgba(167, 134, 255, 0.25));
    border-color: rgba(0, 255, 136, 0.5);
    box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);
  }



  .section-content {
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease;
    max-height: 300px;
    opacity: 1;
    margin-bottom: 0.05rem;
  }

  .section-content.collapsed {
    max-height: 0;
    opacity: 0;
    margin: 0;
  }

  .sidebar-btn {
    background: rgba(255, 255, 255, 0.05);
    border: none;
    color: #fff;
    font-size: 0.85rem;
    text-align: right;
    padding: 0.6rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.6rem;
    transition: all 0.3s ease;
    position: relative;
    min-height: 38px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
    direction: rtl;
    margin-bottom: 0.05rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .sidebar-btn:hover {
    background: rgba(0, 255, 136, 0.15);
    color: var(--modern-accent);
    transform: translateX(-5px);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.2);
    border-color: rgba(0, 255, 136, 0.3);
  }

  .btn-icon {
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .btn-text {
    font-weight: 500;
  }

  .submenu {
    margin-top: 0.5rem;
    padding-right: 1rem;
    display: none;
  }

  .submenu-btn {
    background: rgba(255, 255, 255, 0.03);
    border: none;
    color: rgba(255, 255, 255, 0.8);
    padding: 0.6rem 0.8rem;
    margin: 0.2rem 0;
    border-radius: 6px;
    cursor: pointer;
    width: 100%;
    text-align: right;
    font-size: 0.85rem;
    transition: all 0.3s ease;
    direction: rtl;
  }

  .submenu-btn:hover {
    background: rgba(167, 134, 255, 0.15);
    color: var(--modern-primary);
  }

  /* اسکرول بار */
  .sidebar-menu::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar-menu::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }

  .sidebar-menu::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 136, 0.4);
    border-radius: 3px;
  }

  .sidebar-menu::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 136, 0.6);
  }

  /* تبلت */
  @media (max-width: 1024px) and (min-width: 769px) {
    .sidebar-menu {
      width: 300px;
      right: -300px;
    }
  }

  /* موبایل */
  @media (max-width: 768px) {
    .sidebar-menu {
      width: 280px;
      right: -280px;
    }
  }

  /* موبایل کوچک */
  @media (max-width: 480px) {
    .sidebar-menu {
      width: 90vw;
      right: -90vw;
      max-width: 280px;
    }
  }
  `;
  document.head.appendChild(style);

  // تابع‌های کنترل
  window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebarMenu');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  };

  window.toggleSidebarSection = function(sectionId) {
    const targetContent = document.getElementById(sectionId);
    if (!targetContent) return;
    
    // پیدا کردن تیتر هدف
    const targetTitle = targetContent.previousElementSibling;
    
    // بستن همه سکشن‌های دیگر و حذف active class
    const allSections = document.querySelectorAll('.section-content');
    const allTitles = document.querySelectorAll('.section-title');
    
    allSections.forEach(section => {
      if (section.id !== sectionId) {
        section.classList.add('collapsed');
      }
    });
    
    allTitles.forEach(title => {
      if (title !== targetTitle) {
        title.classList.remove('active');
      }
    });
    
    // تغییر وضعیت سکشن هدف
    if (targetContent.classList.contains('collapsed')) {
      targetContent.classList.remove('collapsed');
      targetTitle.classList.add('active');
    } else {
      targetContent.classList.add('collapsed');
      targetTitle.classList.remove('active');
    }
  };

  window.toggleSubmenu = function(id) {
    const submenu = document.getElementById(id);
    const arrowId = id === 'services-submenu' ? 'services-arrow' : 'desc-arrow';
    const arrow = document.getElementById(arrowId);
    
    if (submenu.style.display === 'none' || submenu.style.display === '') {
      submenu.style.display = 'block';
      submenu.style.opacity = '0';
      submenu.style.transform = 'translateY(-10px)';
      submenu.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      setTimeout(() => {
        submenu.style.opacity = '1';
        submenu.style.transform = 'translateY(0)';
      }, 10);
      if (arrow) {
        arrow.style.transform = 'rotate(180deg)';
        arrow.style.transition = 'transform 0.3s ease';
      }
    } else {
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

  // تابع‌های کمکی
  window.navigateToPage = function(page) {
    window.location.href = page;
  };



  // بستن ساید بار با کلیک بیرون از آن
  document.addEventListener('mousedown', function(event) {
    const sidebar = document.getElementById('sidebarMenu');
    if (!sidebar) return;
    if (!sidebar.classList.contains('open')) return;
    if (!sidebar.contains(event.target)) {
      sidebar.classList.remove('open');
    }
  });

  // بستن ساید بار با ESC
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      const sidebar = document.getElementById('sidebarMenu');
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    }
  });

  // نمایش دکمه پنل ادمین در ساید بار برای ادمین‌ها
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(async function() {
      try {
        if (typeof window.getUserProfile === 'function') {
          const profile = await window.getUserProfile();
          let userIndex = Number(profile && profile.index ? profile.index : 0);
          
          // بررسی از قرارداد اگر پروفایل موجود نبود
          if ((!userIndex || isNaN(userIndex)) && window.contractConfig && window.contractConfig.contract && window.contractConfig.address) {
            try {
              const userData = await window.contractConfig.contract.users(window.contractConfig.address);
              if (userData && typeof userData.index !== 'undefined') {
                userIndex = Number(userData.index);
              }
            } catch(_) {}
          }
          
          // نمایش دکمه پنل ادمین برای ایندکس‌های 1، 2، 3
          if ([1,2,3].includes(userIndex)) {
            const adminBtn = document.querySelector('.sidebar-btn.admin-only');
            if (adminBtn) {
              adminBtn.style.display = 'flex';
            }
          }
        }
      } catch(_) {}
    }, 1000);
  });

})();
