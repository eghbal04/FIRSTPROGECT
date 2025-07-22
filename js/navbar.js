// Injects a responsive navbar at the top of the page
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .cpa-navbar {
      width: 100vw;
      background: linear-gradient(90deg, #181c2a 60%, #00ff88 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.3rem 0.5rem;
      box-shadow: 0 2px 16px rgba(0,255,136,0.08);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 10000;
      font-family: 'Montserrat', 'Noto Sans Arabic', sans-serif;
      min-height: 48px;
    }
    .cpa-navbar-logo {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      font-weight: bold;
      font-size: 1.2rem;
      color: #00ff88;
      text-decoration: none;
    }
    .cpa-navbar-logo img {
      height: 36px;
      width: 36px;
      border-radius: 50%;
      box-shadow: 0 2px 8px #00ff8840;
      object-fit: cover;
      background: #181c2a;
    }
    .cpa-navbar-links {
      display: flex;
      align-items: center;
      gap: 0;
      justify-content: center;
      width: 100%;
      padding: 0 1.2rem;
      box-sizing: border-box;
      overflow-x: auto;
      white-space: nowrap;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE 10+ */
    }
    .cpa-navbar-links::-webkit-scrollbar {
      display: none;
    }
    .cpa-navbar-link {
      color: #fff;
      text-decoration: none;
      font-size: 0.92rem;
      font-weight: 600;
      padding: 0.22rem 0.7rem;
      border: none;
      background: none;
      transition: color 0.2s;
      position: relative;
      display: flex;
      align-items: center;
      height: 100%;
      min-width: 0;
      flex-shrink: 1;
    }
    .cpa-navbar-link:first-child {
      margin-right: 0.5rem;
    }
    .cpa-navbar-link:last-child {
      margin-left: 0.5rem;
    }
    .cpa-navbar-link:not(:last-child)::after {
      content: '';
      display: inline-block;
      width: 1px;
      height: 1.4em;
      background: rgba(255,255,255,0.25);
      margin-right: 0.1rem;
      margin-left: 0.1rem;
      align-self: center;
    }
    .cpa-navbar-link:hover {
      color: #00ff88;
    }
    /* Dropdown styles */
    .cpa-navbar-dropdown {
      position: relative;
      display: inline-block;
    }
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
    @media (max-width: 700px) {
      .cpa-navbar {
        flex-direction: row;
        justify-content: center;
        padding: 0.2rem 0.1rem;
        min-height: 44px;
      }
      .cpa-navbar-links {
        justify-content: center;
      }
      .cpa-navbar-link {
        font-size: 0.86rem;
        padding: 0.13rem 0.45rem;
      }
      .cpa-navbar-link:not(:last-child)::after {
        height: 1.1em;
      }
      .cpa-navbar-dropdown-content { right: auto; left: 0; }
    }
  `;
  document.head.appendChild(style);

  const navbar = document.createElement('nav');
  navbar.className = 'cpa-navbar';
  navbar.innerHTML = `
    <div class="cpa-navbar-links">
      <a href="index.html#main-dashboard" class="cpa-navbar-link">خانه</a>
      <a href="shop.html" class="cpa-navbar-link">🏫 آموزشگاه</a>
      <a href="khadamat.html" class="cpa-navbar-link">🛠 خدمات</a>
      <a href="professional-tree.html" class="cpa-navbar-link">💼 بازاریابی</a>
      <a href="forum.html" class="cpa-navbar-link">💬 چت روم</a>
      <a href="about.html" class="cpa-navbar-link">درباره ما</a>
    </div>
  `;
  // Insert at the top of the body
  document.addEventListener('DOMContentLoaded', function() {
    document.body.insertBefore(navbar, document.body.firstChild);
    // Add margin to body for fixed navbar
    document.body.style.marginTop = '64px';
  });

  // Only add the floating bottom bar on index.html
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    const bottomBar = document.createElement('div');
    bottomBar.className = 'cpa-bottom-bar';
    bottomBar.innerHTML = `
      <button onclick="showMainSection('main-swap')" class="cpa-bottom-btn">🔄<span class="cpa-bottom-label">تبدیل ارز</span></button>
      <button onclick="showMainSection('main-transfer')" class="cpa-bottom-btn">💸<span class="cpa-bottom-label">ترانسفر</span></button>
      <button onclick="showMainSection('main-profile')" class="cpa-bottom-btn">👤<span class="cpa-bottom-label">پروفایل</span></button>
      <button onclick="showMainSection('main-reports')" class="cpa-bottom-btn">📊<span class="cpa-bottom-label">گزارشات</span></button>
      <button onclick="showMainSection('main-register')" class="cpa-bottom-btn">📝<span class="cpa-bottom-label">ثبت‌نام</span></button>
    `;
    document.body.appendChild(bottomBar);

    // Add styles for the floating bottom bar
    const bottomBarStyle = document.createElement('style');
    bottomBarStyle.textContent = `
      .cpa-bottom-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        background: rgba(24,28,42,0.98);
        box-shadow: 0 -2px 16px rgba(0,255,136,0.08);
        display: flex;
        justify-content: space-around;
        align-items: center;
        z-index: 10001;
        padding: 0.15rem 0;
        border-top: 1px solid #222;
      }
      .cpa-bottom-btn {
        flex: 1 1 0;
        background: none;
        border: none;
        color: #fff;
        font-size: 1.05rem;
        font-weight: 600;
        padding: 0.3rem 0.2rem;
        margin: 0 0.1rem;
        border-radius: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, color 0.15s;
        min-width: 0;
        min-height: 36px;
        cursor: pointer;
        position: relative;
      }
      .cpa-bottom-btn:active, .cpa-bottom-btn:hover {
        background: rgba(0,255,136,0.10);
        color: #00ff88;
      }
      .cpa-bottom-btn:not(:last-child)::after {
        content: '';
        display: block;
        position: absolute;
        right: 0;
        top: 25%;
        height: 50%;
        width: 1px;
        background: rgba(255,255,255,0.18);
      }
      .cpa-bottom-label {
        font-size: 0.85em;
        margin-top: 0.1em;
        white-space: nowrap;
      }
      @media (max-width: 700px) {
        .cpa-bottom-bar {
          padding: 0.05rem 0;
        }
        .cpa-bottom-btn {
          font-size: 0.97rem;
          padding: 0.18rem 0.1rem;
        }
        .cpa-bottom-label {
          font-size: 0.78em;
        }
      }
    `;
    document.head.appendChild(bottomBarStyle);
  }

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
      // اگر پروفایل فعال شد، اطلاعات را رفرش کن
      if (sectionId === 'main-profile' && typeof loadUserProfile === 'function') {
        loadUserProfile();
      }
    };
  }
})(); 