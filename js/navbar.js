// Injects a responsive navbar at the top of the page
(function() {
  const style = document.createElement('style');
  style.textContent = `
    /* Modern Navbar Styles */
    .cpa-navbar {
      width: 100vw;
      color: #fff;
      position: fixed;
      top: 0; left: 0; z-index: 10000;
      font-family: 'Vazirmatn', 'Inter', 'SF Pro Display', sans-serif;
      backdrop-filter: blur(24px) saturate(200%);
      -webkit-backdrop-filter: blur(24px) saturate(200%);
      background: linear-gradient(135deg, 
        rgba(15,15,23,0.95) 0%, 
        rgba(24,28,42,0.95) 50%, 
        rgba(35,41,70,0.95) 100%);
      border-bottom: 1px solid rgba(0,255,136,0.15);
      box-shadow: 
        0 8px 32px rgba(0,0,0,0.4),
        0 1px 0 rgba(255,255,255,0.1) inset;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .cpa-navbar-container { 
      max-width: 1400px; 
      margin: 0 auto; 
      padding: 0.8rem 1.5rem; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      min-height: 72px; 
    }
    
    /* Modern Balance Cards */
    .cpa-userbar { 
      display: flex; 
      align-items: center; 
      gap: 0.8rem; 
      padding: 0.6rem 1rem; 
      background: linear-gradient(135deg, 
        rgba(0,255,136,0.08) 0%, 
        rgba(167,134,255,0.08) 100%);
      border: 1px solid rgba(0,255,136,0.2);
      border-radius: 16px; 
      backdrop-filter: blur(12px);
      box-shadow: 
        0 4px 16px rgba(0,255,136,0.1),
        0 1px 0 rgba(255,255,255,0.1) inset;
    }
    .cpa-userbar .pill { 
      background: linear-gradient(135deg, 
        rgba(0,255,136,0.1) 0%, 
        rgba(167,134,255,0.1) 100%);
      border: 1px solid rgba(255,255,255,0.15); 
      padding: 0.4rem 0.8rem; 
      border-radius: 12px; 
      font-size: 0.9rem; 
      font-weight: 600; 
      letter-spacing: 0.5px; 
      color: #ffffff; 
      backdrop-filter: blur(8px);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .cpa-userbar .pill::before {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    .cpa-userbar .pill:hover::before {
      left: 100%;
    }
    .cpa-userbar .pill:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,255,136,0.2);
    }
    .cpa-userbar .addr { display: none; }
    .cpa-navbar-logo {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      font-weight: 800;
      font-size: 1.1rem;
      color: #00ff88;
      text-decoration: none;
    }
    .cpa-navbar-logo img {
      height: 28px; width: 28px;
      border-radius: 50%;
      box-shadow: 0 2px 8px #00ff8840;
      object-fit: cover;
      background: #181c2a;
    }
    /* Navbar links hidden (using hamburger only) */
    .cpa-navbar-links { display: none !important; }
    .cpa-navbar-link {
      color: #fff;
      text-decoration: none;
      font-size: 0.98rem;
      font-weight: 700;
      padding: 0.5rem 0.9rem;
      border: none;
      background: none;
      transition: color 0.2s, background 0.2s, box-shadow 0.2s;
      position: relative;
      display: flex;
      align-items: center;
      height: 100%;
      min-width: 96px;
      flex-shrink: 0;
      justify-content: center;
      border-radius: 12px;
      margin: 0 0.1rem;
    }
    /* Honeycomb Menu */
    .honeycomb-toggle {
      background: none;
      border: 1px solid rgba(167,134,255,0.35);
      color: #a786ff;
      padding: 0.4rem 0.6rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .honeycomb-toggle:hover { color: #181c2a; background: linear-gradient(135deg,#00ff88,#a786ff); }
    .honeycomb-menu {
      display: none;
      position: fixed;
      top: 60px;
      left: 0;
      width: 100vw;
      z-index: 9999;
      padding: 1.2rem 2vw 1.6rem 2vw;
      background: rgba(24,28,42,0.86);
      backdrop-filter: blur(12px) saturate(160%);
      -webkit-backdrop-filter: blur(12px) saturate(160%);
      border-bottom: 1px solid rgba(167,134,255,0.18);
      box-shadow: 0 14px 36px rgba(0,0,0,0.35);
    }
    .honeycomb-menu.open { display: block; animation: fadeIn 0.18s ease-in; }
    .honey-rows { max-width: 980px; margin: 0 auto; }
    .honey-row { display: flex; justify-content: center; align-items: center; gap: 55px; }
    /* هندسه شش‌ضلعی: عرض 110px، ضلع بالایی = 55px */
    .honey-row + .honey-row { margin-top: -24px; }
    .honey-row.offset { padding-inline-start: 82px; }
    @media (max-width: 680px){
      .honey-row { gap: 40px; }
      .honey-row + .honey-row { margin-top: -20px; }
      .honey-row.offset { padding-inline-start: 75px; }
    }
    .hex-link {
      width: 110px; height: 96px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: #ffffff; text-decoration: none; font-weight: 800; font-size: 0.95rem;
      background: linear-gradient(135deg, #1a1f2e, #232946);
      border: 1px solid rgba(167,134,255,0.3);
      clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0 50%);
      transition: transform 0.2s, box-shadow 0.2s, background 0.2s, color 0.2s;
      box-shadow: 0 6px 16px rgba(0,0,0,0.25);
      margin: 0;
    }
    .hex-spacer { visibility: hidden; pointer-events: none; }
    .hex-link small { font-size: 0.75rem; color: #b8c1ec; margin-top: 4px; }
    .hex-link:hover { transform: translateY(-4px); background: linear-gradient(135deg,#00ff88,#a786ff); color: #181c2a; box-shadow: 0 12px 24px rgba(0,255,136,0.2); }
    .cpa-navbar-link:first-child { margin-right: 0.5rem; }
    .cpa-navbar-link:last-child { margin-left: 0.5rem; }
    .cpa-navbar-link:not(:last-child)::after {
      content: '';
      display: inline-block;
      width: 1px;
      height: 1.4em;
      background: rgba(255,255,255,0.18);
      margin-right: 0.1rem;
      margin-left: 0.1rem;
      align-self: center;
    }
    .cpa-navbar-link:hover, .cpa-navbar-link:focus {
      color: #181c2a;
      background: linear-gradient(90deg, #00ff88 60%, #a786ff 100%);
      box-shadow: 0 2px 12px #00ff8840;
      outline: none;
    }
    /* Dropdown styles */
    .cpa-navbar-dropdown { position: relative; display: inline-block; }
    .cpa-navbar-dropdown-content {
      display: none;
      position: absolute;
      right: 0;
      background: #232946;
      min-width: 180px;
      box-shadow: 0 8px 24px rgba(0,255,136,0.10);
      border-radius: 8px;
      z-index: 10001;
      padding: 0.5rem 0;
      margin-top: 0.5rem;
    }
    .cpa-navbar-dropdown-content a {
      color: #fff;
      padding: 0.6rem 1.2rem;
      text-decoration: none;
      display: block;
      font-size: 1rem;
      border-radius: 6px;
      transition: background 0.2s, color 0.2s;
    }
    .cpa-navbar-dropdown-content a:hover {
      background: rgba(0,255,136,0.13);
      color: #00ff88;
    }
    .cpa-navbar-dropdown:hover .cpa-navbar-dropdown-content,
    .cpa-navbar-dropdown:focus-within .cpa-navbar-dropdown-content {
      display: block;
    }
    .cpa-navbar-dropdown-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 1rem;
      font-weight: 500;
      padding: 0.3rem 0.9rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .cpa-navbar-dropdown-btn:hover {
      background: rgba(0,255,136,0.13);
      color: #00ff88;
    }
    /* Modern Hamburger Button - Fixed Bottom Left */
    .cpa-navbar-hamburger {
      display: flex !important;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 3px;
      position: fixed !important;
      bottom: 20px !important;
      left: 20px !important;
      top: auto !important;
      right: auto !important;
      background: linear-gradient(135deg, 
        rgba(0,255,136,0.12) 0%, 
        rgba(167,134,255,0.12) 100%);
      border: 1px solid rgba(0,255,136,0.3);
      color: #ffffff;
      font-size: 0;
      padding: 0;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      backdrop-filter: blur(12px);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        0 8px 24px rgba(0,255,136,0.2),
        0 1px 0 rgba(255,255,255,0.1) inset;
      z-index: 10002;
      overflow: hidden;
      margin: 0;
      transform: none;
    }
    
    .cpa-navbar-hamburger::before {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      transition: left 0.4s ease;
    }
    
    .cpa-navbar-hamburger:hover::before {
      left: 100%;
    }
    
    .cpa-navbar-hamburger:hover {
      transform: translateY(-2px);
      border-color: rgba(0,255,136,0.5);
      box-shadow: 
        0 8px 24px rgba(0,255,136,0.25),
        0 1px 0 rgba(255,255,255,0.15) inset;
    }
    
    /* Hamburger Lines */
    .cpa-navbar-hamburger span {
      width: 20px;
      height: 2px;
      background: currentColor;
      border-radius: 1px;
      transition: all 0.3s ease;
      display: block;
    }
    
    /* Active State Animation */
    .cpa-navbar-hamburger.active span:first-child {
      transform: rotate(45deg) translate(5px, 5px);
    }
    .cpa-navbar-hamburger.active span:last-child {
      transform: rotate(-45deg) translate(7px, -6px);
    }
    .cpa-navbar-hamburger.active span:nth-child(2) {
      opacity: 0;
    }
    /* Modern Sidebar Menu */
    .cpa-navbar-mobile-menu {
      display: none;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      right: auto;
      width: 320px;
      max-width: 85vw;
      min-height: 100vh;
      background: linear-gradient(180deg, 
        rgba(15,15,23,0.98) 0%, 
        rgba(24,28,42,0.98) 50%, 
        rgba(35,41,70,0.98) 100%);
      box-shadow: 
        4px 0 24px rgba(0,0,0,0.4),
        0 0 0 1px rgba(0,255,136,0.1) inset;
      z-index: 10001;
      padding: 2rem 1.5rem;
      border-radius: 0 24px 24px 0;
      animation: slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
      max-height: 100vh;
      align-items: stretch;
      direction: rtl;
      backdrop-filter: blur(24px) saturate(200%);
      -webkit-backdrop-filter: blur(24px) saturate(200%);
      transform: translateX(-100%);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .cpa-navbar-mobile-menu.open {
      transform: translateX(0);
    }
    
    @keyframes slideInLeft {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    
    /* Modern Overlay */
    .cpa-navbar-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      z-index: 10000;
      transition: all 0.3s ease;
      opacity: 0;
    }
    
    .cpa-navbar-overlay.open {
      display: block;
      opacity: 1;
    }
    
    /* Sidebar Header & Logo */
    .cpa-navbar-mobile-header {
      padding: 1rem 0 2rem 0;
      border-bottom: 1px solid rgba(167,134,255,0.15);
      margin-bottom: 1rem;
    }
    
    .cpa-navbar-logo-sidebar {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0 1.2rem;
    }
    
    .cpa-navbar-logo-sidebar .logo-circle {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #00ff88, #a786ff);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1rem;
      color: #1a1f2e;
      box-shadow: 
        0 4px 16px rgba(0,255,136,0.3),
        0 1px 0 rgba(255,255,255,0.2) inset;
    }
    
    .cpa-navbar-logo-sidebar span {
      font-size: 1.2rem;
      font-weight: 700;
      color: #ffffff;
      text-shadow: 0 2px 8px rgba(0,255,136,0.3);
    }
    
    /* Link Icons */
    .cpa-navbar-mobile-menu .link-icon {
      font-size: 1.1rem;
      margin-left: 0.5rem;
      transition: transform 0.3s ease;
    }
    
    .cpa-navbar-mobile-menu .cpa-navbar-link:hover .link-icon {
      transform: scale(1.1);
    }
    /* Modern Sidebar Links */
    .cpa-navbar-mobile-menu .cpa-navbar-link {
      font-size: 1rem;
      font-weight: 500;
      padding: 0.8rem 1.2rem;
      color: #e0e6f7;
      border-radius: 12px;
      margin: 0.25rem 0;
      text-align: right;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 0.8rem;
      border: 1px solid transparent;
      background: linear-gradient(135deg, 
        rgba(255,255,255,0.03) 0%, 
        rgba(0,255,136,0.02) 100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    
    .cpa-navbar-mobile-menu .cpa-navbar-link::before {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0,255,136,0.1), transparent);
      transition: left 0.4s ease;
    }
    
    .cpa-navbar-mobile-menu .cpa-navbar-link:hover::before {
      left: 100%;
    }
    
    .cpa-navbar-mobile-menu .cpa-navbar-link:hover {
      background: linear-gradient(135deg, 
        rgba(0,255,136,0.1) 0%, 
        rgba(167,134,255,0.1) 100%);
      border-color: rgba(0,255,136,0.3);
      color: #00ff88;
      transform: translateX(4px);
      box-shadow: 
        0 4px 16px rgba(0,255,136,0.15),
        0 1px 0 rgba(255,255,255,0.1) inset;
    }
    /* Modern Section Titles */
    .cpa-navbar-mobile-menu .cpa-navbar-section-title {
      font-size: 0.8rem;
      color: #a786ff;
      font-weight: 700;
      margin: 1.5rem 0 0.8rem 0;
      letter-spacing: 1px;
      text-align: right;
      text-transform: uppercase;
      padding: 0.5rem 1.2rem;
      border-bottom: 1px solid rgba(167,134,255,0.2);
      background: linear-gradient(135deg, 
        rgba(167,134,255,0.05) 0%, 
        rgba(0,255,136,0.05) 100%);
      border-radius: 8px;
      position: relative;
    }
    
    .cpa-navbar-mobile-menu .cpa-navbar-section-title::before {
      content: '';
      position: absolute;
      left: 0; top: 50%;
      width: 3px; height: 60%;
      background: linear-gradient(180deg, #a786ff, #00ff88);
      border-radius: 2px;
      transform: translateY(-50%);
    }
    .cpa-navbar-mobile-close {
      position: absolute;
      top: 18px;
      left: 18px;
      font-size: 2.2rem;
      color: #fff;
      background: none;
      border: none;
      z-index: 10003;
      cursor: pointer;
      transition: color 0.2s;
    }
    .cpa-navbar-mobile-close:hover {
      color: #00ff88;
    }
    @keyframes slideDownNav {
      from { transform: translateY(-40px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @media (max-width: 700px) {
      .cpa-navbar {
        flex-direction: row;
        justify-content: center;
        padding: 0.2rem 0.1rem;
        min-height: 44px;
        backdrop-filter: blur(18px) saturate(180%);
        -webkit-backdrop-filter: blur(18px) saturate(180%);
      }
    }
    /* Responsive Design */
    @media (max-width: 480px) {
      .cpa-navbar-container {
        padding: 0.6rem 1rem;
        min-height: 64px;
      }
      
      .cpa-userbar {
        gap: 0.5rem;
        padding: 0.4rem 0.8rem;
      }
      
      .cpa-userbar .pill {
        font-size: 0.8rem;
        padding: 0.3rem 0.6rem;
      }
      
      .cpa-navbar-mobile-menu {
        width: 280px;
        padding: 1.5rem 1rem;
      }
      
      .cpa-navbar-logo-sidebar .logo-circle {
        width: 40px;
        height: 40px;
        font-size: 0.9rem;
      }
      
      .cpa-navbar-logo-sidebar span {
        font-size: 1.1rem;
      }
      
      /* Hamburger button for mobile */
      .cpa-navbar-hamburger {
        bottom: 16px !important;
        left: 16px !important;
        width: 52px !important;
        height: 52px !important;
      }
    }
    
    @media (max-width: 320px) {
      .cpa-navbar-mobile-menu {
        width: 260px;
      }
      
      .cpa-userbar .pill {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
      }
      
      /* Smaller hamburger for very small screens */
      .cpa-navbar-hamburger {
        bottom: 12px !important;
        left: 12px !important;
        width: 48px !important;
        height: 48px !important;
      }
    }
  `;
  document.head.appendChild(style);

  const navbar = document.createElement('nav');
  navbar.className = 'cpa-navbar';
  navbar.innerHTML = `
    <div class="cpa-navbar-container">
      <div class="cpa-userbar" id="cpa-userbar">
        <span class="pill" id="nav-matic">POL: --</span>
        <span class="pill" id="nav-cpa">CPA: --</span>
        <span class="pill" id="nav-dai">DAI: --</span>
      </div>
      <button class="cpa-navbar-hamburger" id="navbar-hamburger" aria-label="باز کردن منو">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <div class="cpa-navbar-overlay" id="navbar-overlay"></div>
    <div class="cpa-navbar-mobile-menu" id="navbar-mobile-menu" style="display:none;">
      <div class="cpa-navbar-mobile-header">
        <div class="cpa-navbar-logo-sidebar">
          <div class="logo-circle">CPA</div>
          <span>CPA Forex</span>
        </div>
      </div>
      <div class="cpa-navbar-mobile-section">
        <div class="cpa-navbar-section-title">دسترسی سریع</div>
        <a href="index.html#main-dashboard" class="cpa-navbar-link">
          <span class="link-icon">🏠</span>خانه
        </a>
        <a href="index.html#main-swap" class="cpa-navbar-link" id="navbar-swap-link-mobile">
          <span class="link-icon">🔄</span>تبدیل
        </a>
        <a href="index.html#main-transfer" class="cpa-navbar-link" id="navbar-transfer-link-mobile">
          <span class="link-icon">💸</span>ترانسفر
        </a>
        <a href="professional-tree.html" class="cpa-navbar-link" id="navbar-network-link-mobile">
          <span class="link-icon">🌐</span>همکاران
        </a>
        <a href="register.html" class="cpa-navbar-link">
          <span class="link-icon">📝</span>ثبت‌نام
        </a>
        <a href="register-free.html" class="cpa-navbar-link">
          <span class="link-icon">🎫</span>رزرو
        </a>
      </div>
      <div class="cpa-navbar-mobile-section">
        <div class="cpa-navbar-section-title">ابزارها</div>
        <a href="reports.html" class="cpa-navbar-link">
          <span class="link-icon">📊</span>گزارش
        </a>
        <a href="profile.html" class="cpa-navbar-link">
          <span class="link-icon">👤</span>پروفایل
        </a>
        <a href="products.html" class="cpa-navbar-link">
          <span class="link-icon">🛍️</span>محصولات
        </a>
        <a href="utility.html" class="cpa-navbar-link">
          <span class="link-icon">🛠️</span>ابزارها
        </a>
      </div>
      <div class="cpa-navbar-mobile-section">
        <div class="cpa-navbar-section-title">اطلاعات</div>
        <a href="learning.html" class="cpa-navbar-link">
          <span class="link-icon">📚</span>آموزش
        </a>
        <a href="news.html" class="cpa-navbar-link">
          <span class="link-icon">📰</span>اخبار
        </a>
        <a href="about.html" class="cpa-navbar-link">
          <span class="link-icon">ℹ️</span>درباره‌ما
        </a>
        <a href="transfer-ownership.html" class="cpa-navbar-link">
          <span class="link-icon">🔑</span>انتقال مالکیت
        </a>
      </div>
    </div>
  `;
  // Insert at the top of the body
  document.addEventListener('DOMContentLoaded', function() {
    document.body.insertBefore(navbar, document.body.firstChild);
    document.body.style.marginTop = '84px';
  });

  // Hamburger dropdown logic + Swap/Transfer handlers
  document.addEventListener('DOMContentLoaded', function(){
    const hamburger = document.getElementById('navbar-hamburger');
    const mobileMenu = document.getElementById('navbar-mobile-menu');
    const overlay = document.getElementById('navbar-overlay');
    const closeBtn = document.getElementById('navbar-mobile-close');
    let menuOpen = false;
    
    function openMenu() {
      if (mobileMenu && overlay) {
        mobileMenu.style.display = 'flex';
        overlay.style.display = 'block';
        setTimeout(() => {
          mobileMenu.classList.add('open');
          overlay.classList.add('open');
          hamburger.classList.add('active');
        }, 10);
        menuOpen = true;
        document.body.style.overflow = 'hidden';
      }
    }
    
    function closeMenu() {
      if (mobileMenu && overlay) {
        mobileMenu.classList.remove('open');
        overlay.classList.remove('open');
        hamburger.classList.remove('active');
        setTimeout(() => {
          mobileMenu.style.display = 'none';
          overlay.style.display = 'none';
        }, 400);
        menuOpen = false;
        document.body.style.overflow = '';
      }
    }
    
    if (hamburger) hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      menuOpen ? closeMenu() : openMenu();
    });
    
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
    
    document.addEventListener('click', function(e) {
      if (menuOpen && mobileMenu && !mobileMenu.contains(e.target) && e.target !== hamburger) {
        closeMenu();
      }
    });

    function goTo(section){
      const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
      if (isIndex) {
        if (typeof showMainSection === 'function') showMainSection(section);
        const t = document.getElementById(section); if (t) setTimeout(()=>t.scrollIntoView({behavior:'smooth',block:'start'}), 100);
      } else { window.location.href = `index.html#${section}`; }
    }
    const swapLinkMobile = document.getElementById('navbar-swap-link-mobile');
    const transferLinkMobile = document.getElementById('navbar-transfer-link-mobile');
    const networkLinkMobile = document.getElementById('navbar-network-link-mobile');
    if (swapLinkMobile) swapLinkMobile.onclick = function(e){ e.preventDefault(); closeMenu(); goTo('main-swap'); };
    if (transferLinkMobile) transferLinkMobile.onclick = function(e){ e.preventDefault(); closeMenu(); goTo('main-transfer'); };
    if (networkLinkMobile) networkLinkMobile.onclick = function(e){ e.preventDefault(); closeMenu(); window.location.href = 'professional-tree.html'; };

    // --- Fast, resilient userbar balances ---
    (function(){
      const maticEl = document.getElementById('nav-matic');
      const cpaEl = document.getElementById('nav-cpa');
      const daiEl = document.getElementById('nav-dai');

      // Prefill from cache (≤ 2 دقیقه)
      try {
        const cached = JSON.parse(localStorage.getItem('cpa_nav_balances')||'null');
        if (cached && (Date.now() - (cached.ts||0) < 2*60*1000)) {
          if (maticEl && cached.pol != null) maticEl.textContent = 'POL: ' + cached.pol;
          if (cpaEl && cached.cpa != null) cpaEl.textContent = 'CPA: ' + cached.cpa;
          if (daiEl && cached.dai != null) daiEl.textContent = 'DAI: ' + cached.dai;
        } else {
          // Optics for loading state
          if (maticEl) maticEl.textContent = 'POL: …';
          if (cpaEl) cpaEl.textContent = 'CPA: …';
          if (daiEl) daiEl.textContent = 'DAI: …';
        }
      } catch {}

      function formatCompact(num, smallDecimals=4, compactDecimals=2){
        if (!isFinite(num)) return '--';
        const abs = Math.abs(num);
        if (abs < 1) return num.toFixed(smallDecimals);
        const units = [
          { v: 1e18, s: 'e' }, { v: 1e15, s: 'q' }, { v: 1e12, s: 't' },
          { v: 1e9, s: 'b' }, { v: 1e6, s: 'm' }, { v: 1e3, s: 'k' }
        ];
        for (const u of units) if (abs >= u.v) return (num / u.v).toFixed(compactDecimals) + u.s;
        return num.toFixed(compactDecimals);
      }

      function withTimeout(promise, ms=3500) {
        return Promise.race([
          promise,
          new Promise((_, reject)=>setTimeout(()=>reject(new Error('timeout')), ms))
        ]);
      }

      async function getAddressFast(provider){
        try {
          if (window.contractConfig && window.contractConfig.address) return window.contractConfig.address;
          if (window.ethereum && typeof window.ethereum.request === 'function') {
            const acc = await withTimeout(window.ethereum.request({ method: 'eth_accounts' }), 1500);
            if (acc && acc[0]) return acc[0];
          }
        } catch {}
        return null;
      }

      async function updateUserbar(){
        try {
          if (typeof window.ethers === 'undefined') return schedule(3000);
          const baseProvider = (window.contractConfig && window.contractConfig.provider) || (window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null);
          if (!baseProvider) return schedule(3000);
          const address = await getAddressFast(baseProvider);
          if (!address) return schedule(3000);

          const retry = (fn) => (typeof window.retryRpcOperation === 'function') ? window.retryRpcOperation(fn, 2) : fn();

          // Build calls
          const calls = [];
          calls.push(retry(()=>withTimeout(baseProvider.getBalance(address), 3000)));
          if (window.CPA_ADDRESS && window.CPA_ABI) {
            const cpa = new ethers.Contract(window.CPA_ADDRESS, window.CPA_ABI, baseProvider);
            calls.push(retry(()=>withTimeout(cpa.balanceOf(address), 3000)));
          } else {
            calls.push(Promise.resolve(null));
          }
          if (window.DAI_ADDRESS && window.DAI_ABI) {
            const dai = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, baseProvider);
            calls.push(retry(()=>withTimeout(dai.balanceOf(address), 3000)));
          } else {
            calls.push(Promise.resolve(null));
          }

          const [polWei, cpaBal, daiBal] = await Promise.all(calls);
          if (polWei && maticEl) maticEl.textContent = 'POL: ' + formatCompact(Number(ethers.formatEther(polWei)), 4, 2);
          if (cpaBal != null && cpaEl) cpaEl.textContent = 'CPA: ' + formatCompact(Number(ethers.formatUnits(cpaBal, 18)), 4, 2);
          if (daiBal != null && daiEl) daiEl.textContent = 'DAI: ' + formatCompact(Number(ethers.formatUnits(daiBal, 18)), 2, 2);

          // Cache
          try {
            const cache = {
              ts: Date.now(),
              pol: polWei ? maticEl.textContent.replace('POL: ','') : null,
              cpa: cpaBal!=null ? cpaEl.textContent.replace('CPA: ','') : null,
              dai: daiBal!=null ? daiEl.textContent.replace('DAI: ','') : null
            };
            localStorage.setItem('cpa_nav_balances', JSON.stringify(cache));
          } catch {}

          schedule(10000); // refresh every 10s after success
        } catch (e) {
          // Keep previous values; retry soon
          schedule(4000);
        }
      }

      function schedule(ms){ setTimeout(updateUserbar, ms); }

      // Kick off quickly
      setTimeout(updateUserbar, 200);

      // React to wallet events
      if (window.ethereum && typeof window.ethereum.on === 'function') {
        window.ethereum.on('accountsChanged', ()=>updateUserbar());
        window.ethereum.on('chainChanged', ()=>setTimeout(updateUserbar, 300));
      }
    })();
  });

  // لینک‌های قدیمی حذف شدند؛ نیازی به تزریق/اصلاح وجود ندارد

  // منوی موبایل حذف شد؛ فقط منوی کندویی استفاده می‌شود

  // لینک‌های ناوبار قدیمی حذف شدند؛ هدایت از طریق کندو انجام می‌شود

  // Only add the floating bottom bar on index.html
  // Helper for bottom bar navigation (only on index.html)
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    window.showMainSection = function(sectionId) {
      const ids = ['main-swap','main-transfer','main-profile','main-reports','main-register'];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === sectionId) ? '' : 'none';
      });
      const target = document.getElementById(sectionId);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({behavior:'smooth',block:'start'});
        }, 100);
      }
    };
  }

  // در index.html اگر هشی وجود دارد، بخش مربوطه را نمایش بده
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    document.addEventListener('DOMContentLoaded', function() {
      const hash = window.location.hash;
      if (hash === '#main-swap' || hash === '#main-transfer') {
        if (typeof showMainSection === 'function') showMainSection(hash.replace('#',''));
        const target = document.getElementById(hash.replace('#',''));
        if (target) setTimeout(() => target.scrollIntoView({behavior:'smooth',block:'start'}), 100);
      }
    });
  }
})(); 