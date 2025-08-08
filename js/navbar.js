// Injects a responsive navbar at the top of the page
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .cpa-navbar {
      width: 100vw;
      color: #fff;
      position: fixed;
      top: 0; left: 0; z-index: 10000;
      font-family: 'Montserrat', 'Noto Sans Arabic', sans-serif;
      backdrop-filter: blur(18px) saturate(180%);
      -webkit-backdrop-filter: blur(18px) saturate(180%);
      background: linear-gradient(135deg, rgba(24,28,42,0.9), rgba(35,41,70,0.9));
      border-bottom: 1px solid rgba(167,134,255,0.18);
      box-shadow: 0 8px 30px rgba(0,0,0,0.25);
    }
    .cpa-navbar-container { max-width: 1280px; margin: 0 auto; padding: 0.4rem 1rem; display: grid; grid-template-columns: 1fr; justify-items: center; align-items: center; min-height: 56px; }
    .cpa-userbar { display:flex; align-items:center; gap: 0.6rem; padding: 0.2rem 0.5rem; background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius: 10px; margin: 0 auto; }
    .cpa-userbar .pill { background: rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.12); padding: 0.15rem 0.6rem; border-radius: 999px; font-size: 1.12rem; font-weight: 500; letter-spacing: 0.35px; color: #e6e8ff; font-style: italic; text-transform: uppercase; }
    .cpa-userbar .addr { display:none; }
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
    .cpa-navbar-hamburger {
      display: flex !important;
      position: fixed;
      top: 16px;
      right: 16px;
      left: auto;
      transform: none;
      margin: 0;
      background: rgba(24,28,42,0.7);
      box-shadow: 0 2px 8px #00ff8840;
      z-index: 10002;
      border: none;
      color: #00ff88;
      font-size: 1.5rem;
      padding: 0.5rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cpa-navbar-hamburger:hover {
      background: rgba(0,255,136,0.2);
      color: #fff;
    }
    .cpa-navbar-mobile-menu {
      display: none;
      flex-direction: column;
      position: fixed;
      top: 0;
      right: 0;
      left: auto;
      width: 100vw;
      min-height: 100vh;
      background: rgba(35,41,70,0.95);
      box-shadow: 0 8px 32px #00000033;
      z-index: 10001;
      padding: 5.5rem 0.7rem 2.2rem 0.7rem;
      border-radius: 0 0 18px 18px;
      animation: slideDownNav 0.3s;
      overflow-y: auto;
      max-height: 100vh;
      align-items: center;
      direction: rtl;
      text-align: center;
      backdrop-filter: blur(18px) saturate(180%);
      -webkit-backdrop-filter: blur(18px) saturate(180%);
    }
    .cpa-navbar-mobile-menu .cpa-navbar-link {
      font-size: 1.18rem;
      padding: 1.1rem 0.7rem;
      color: #fff;
      border-radius: 12px;
      margin: 0.2rem 0;
      text-align: center;
      flex-direction: row-reverse;
      justify-content: center;
      border: none;
      background: none;
      width: 100%;
      transition: background 0.2s, color 0.2s;
    }
    .cpa-navbar-mobile-menu .cpa-navbar-link:hover {
      background: rgba(0,255,136,0.13);
      color: #00ff88;
    }
    .cpa-navbar-mobile-menu .cpa-navbar-section-title {
      font-size: 1.05rem;
      color: #a786ff;
      font-weight: bold;
      margin: 1.2rem 0 0.2rem 0;
      letter-spacing: 0.5px;
      text-align: center;
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
    @media (min-width: 700px) {
      .cpa-navbar-links { display: flex !important; }
      .cpa-navbar-hamburger {
        top: 20px;
        right: 20px;
        font-size: 1.8rem;
        padding: 0.6rem;
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
      <button class="cpa-navbar-hamburger" id="navbar-hamburger" aria-label="باز کردن منو">☰</button>
    </div>
    <div class="cpa-navbar-mobile-menu" id="navbar-mobile-menu" style="display:none;">
      <button class="cpa-navbar-mobile-close" id="navbar-mobile-close" aria-label="بستن منو">✕</button>
      <div class="cpa-navbar-mobile-section">
        <div class="cpa-navbar-section-title">ناوبری</div>
        <a href="index.html#main-dashboard" class="cpa-navbar-link">خانه</a>
        <a href="#" class="cpa-navbar-link" id="navbar-swap-link-mobile">تبدیل</a>
        <a href="#" class="cpa-navbar-link" id="navbar-transfer-link-mobile">ترانسفر</a>
        <a href="register.html" class="cpa-navbar-link">ثبت‌نام</a>
        <a href="register-free.html" class="cpa-navbar-link">رزرو</a>
        <a href="reports.html" class="cpa-navbar-link">گزارش</a>
         <a href="professional-tree.html" class="cpa-navbar-link">همکاران</a>
        <a href="profile.html" class="cpa-navbar-link">پروفایل</a>
        <a href="products.html" class="cpa-navbar-link">محصولات</a>
        <a href="utility.html" class="cpa-navbar-link">ابزارها</a>
        <a href="learning.html" class="cpa-navbar-link">آموزش</a>
        <a href="news.html" class="cpa-navbar-link">اخبار</a>
        <a href="about.html" class="cpa-navbar-link">درباره‌ما</a>
        <a href="transfer-ownership.html" class="cpa-navbar-link">انتقال مالکیت</a>
      </div>
    </div>
  `;
  // Insert at the top of the body
  document.addEventListener('DOMContentLoaded', function() {
    document.body.insertBefore(navbar, document.body.firstChild);
    document.body.style.marginTop = '64px';
  });

  // Hamburger dropdown logic + Swap/Transfer handlers
  document.addEventListener('DOMContentLoaded', function(){
    const hamburger = document.getElementById('navbar-hamburger');
    const mobileMenu = document.getElementById('navbar-mobile-menu');
    const closeBtn = document.getElementById('navbar-mobile-close');
    let menuOpen = false;
    function openMenu(){ if (mobileMenu){ mobileMenu.style.display='flex'; menuOpen=true; } }
    function closeMenu(){ if (mobileMenu){ mobileMenu.style.display='none'; menuOpen=false; } }
    if (hamburger) hamburger.addEventListener('click', function(e){ e.stopPropagation(); menuOpen?closeMenu():openMenu(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ closeMenu(); });
    document.addEventListener('click', function(e){ if (menuOpen && mobileMenu && !mobileMenu.contains(e.target) && e.target!==hamburger) closeMenu(); });

    function goTo(section){
      const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
      if (isIndex) {
        if (typeof showMainSection === 'function') showMainSection(section);
        const t = document.getElementById(section); if (t) setTimeout(()=>t.scrollIntoView({behavior:'smooth',block:'start'}), 100);
      } else { window.location.href = `index.html#${section}`; }
    }
    const swapLinkMobile = document.getElementById('navbar-swap-link-mobile');
    const transferLinkMobile = document.getElementById('navbar-transfer-link-mobile');
    if (swapLinkMobile) swapLinkMobile.onclick = function(e){ e.preventDefault(); closeMenu(); goTo('main-swap'); };
    if (transferLinkMobile) transferLinkMobile.onclick = function(e){ e.preventDefault(); closeMenu(); goTo('main-transfer'); };

    // User info fetch
    (async function updateUserbar(){
      try {
        if (typeof window.ethers === 'undefined') return;
        const provider = (window.contractConfig && window.contractConfig.provider) || (window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null);
        if (!provider) return;
        const accounts = window.ethereum ? await window.ethereum.request({ method: 'eth_accounts' }) : [];
        const addr = (accounts && accounts[0]) ? accounts[0] : (window.contractConfig && window.contractConfig.userAddress);
        const addrEl = document.getElementById('nav-addr');
        if (addrEl) addrEl.textContent = addr ? (addr.slice(0,6)+'...'+addr.slice(-4)) : 'Wallet: —';

        const maticEl = document.getElementById('nav-matic');
        const cpaEl = document.getElementById('nav-cpa');
        const daiEl = document.getElementById('nav-dai');
        if (!addr || !provider) return;
        const balWei = await provider.getBalance(addr);
        function formatCompact(num, smallDecimals=4, compactDecimals=2){
          if (!isFinite(num)) return '--';
          const abs = Math.abs(num);
          if (abs < 1) return num.toFixed(smallDecimals);
          const units = [
            { v: 1e18, s: 'e' }, // quintillion
            { v: 1e15, s: 'q' }, // quadrillion
            { v: 1e12, s: 't' },
            { v: 1e9,  s: 'b' },
            { v: 1e6,  s: 'm' },
            { v: 1e3,  s: 'k' }
          ];
          for (const u of units) if (abs >= u.v) return (num / u.v).toFixed(compactDecimals) + u.s;
          return num.toFixed(compactDecimals);
        }
        if (maticEl) maticEl.textContent = 'POL: ' + formatCompact(Number(ethers.formatEther(balWei)), 4, 2);

        if (window.CPA_ADDRESS && window.CPA_ABI) {
          const cpa = new ethers.Contract(window.CPA_ADDRESS, window.CPA_ABI, provider);
          const cpaBal = await cpa.balanceOf(addr);
          if (cpaEl) cpaEl.textContent = 'CPA: ' + formatCompact(Number(ethers.formatUnits(cpaBal, 18)), 4, 2);
        }
        if (window.DAI_ADDRESS && window.DAI_ABI) {
          const dai = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, provider);
          const daiBal = await dai.balanceOf(addr);
          if (daiEl) daiEl.textContent = 'DAI: ' + formatCompact(Number(ethers.formatUnits(daiBal, 18)), 2, 2);
        }

        // refresh periodically
        setTimeout(updateUserbar, 20000);
      } catch (e) {
        console.warn('navbar userbar update failed:', e);
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
      // اسکرول نرم به بخش انتخاب شده
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
        // اسکرول نرم
        const target = document.getElementById(hash.replace('#',''));
        if (target) setTimeout(() => target.scrollIntoView({behavior:'smooth',block:'start'}), 100);
      }
    });
  }
})(); 