// نمایش پیام ثبت‌نام برای تب‌های قفل شده
function showRegistrationPrompt() {
  // Remove existing prompt if any
  const existingPrompt = document.getElementById('registration-prompt');
  if (existingPrompt) existingPrompt.remove();
  
  const prompt = document.createElement('div');
  prompt.id = 'registration-prompt';
  prompt.style = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #232946, #181c2a);
    border: 2px solid #a786ff;
    border-radius: 20px;
    padding: 2rem;
    z-index: 10000;
    text-align: center;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  `;
  
  prompt.innerHTML = `
    <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
    <h3 style="color: #00ff88; margin-bottom: 1rem;">دسترسی محدود</h3>
    <p style="color: #fff; margin-bottom: 1.5rem; line-height: 1.6;">
      این بخش فقط برای کاربران فعال باز است.<br>
      لطفاً ابتدا ثبت‌نام کنید تا به تمام امکانات دسترسی داشته باشید.
    </p>
    <button onclick="closeRegistrationPrompt()" style="
      background: linear-gradient(135deg, #a786ff, #8b6bff);
      color: #fff;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 10px;
      cursor: pointer;
      font-weight: bold;
      margin-right: 0.5rem;
    ">بستن</button>
    <button onclick="showDirectRegistrationForm()" style="
      background: linear-gradient(135deg, #00ff88, #00cc66);
      color: #232946;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 10px;
      cursor: pointer;
      font-weight: bold;
    ">ثبت‌نام</button>
  `;
  
  document.body.appendChild(prompt);
  
  // Add overlay
  const overlay = document.createElement('div');
  overlay.style = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.8);
    z-index: 9999;
  `;
  overlay.id = 'registration-prompt-overlay';
  document.body.appendChild(overlay);
}

// بستن پیام ثبت‌نام
window.closeRegistrationPrompt = function() {
  const prompt = document.getElementById('registration-prompt');
  const overlay = document.getElementById('registration-prompt-overlay');
  if (prompt) prompt.remove();
  if (overlay) overlay.remove();
};

// رفتن به صفحه ثبت‌نام
window.goToRegistration = function() {
  closeRegistrationPrompt();
  // استفاده از تابع نمایش مستقیم فرم ثبت‌نام
  if (typeof window.showDirectRegistrationForm === 'function') {
    window.showDirectRegistrationForm();
  } else if (typeof window.showTab === 'function') {
    window.showTab('register');
  }
};

// تابع نمایش مستقیم فرم ثبت‌نام (برای tabs.js)
window.showDirectRegistrationForm = async function() {
  try {
    // بستن پیام ثبت‌نام فعلی
    const existingPrompt = document.getElementById('registration-prompt');
    const existingOverlay = document.getElementById('registration-prompt-overlay');
    if (existingPrompt) existingPrompt.remove();
    if (existingOverlay) existingOverlay.remove();
    
    // اتصال به کیف پول
    const connection = await window.connectWallet();
    const { contract, address, provider } = connection;
    
    // دریافت آدرس معرف (deployer)
    let referrerAddress;
    try {
      referrerAddress = await contract.deployer();
    } catch (e) {
      console.error('Error getting deployer address:', e);
      referrerAddress = address; // fallback to connected address
    }
    
    // نمایش فرم ثبت‌نام
    if (typeof window.showRegisterForm === 'function') {
      window.showRegisterForm(referrerAddress, '', address, provider, contract);
    } else {
      // fallback به تب شبکه
      if (typeof window.showTab === 'function') {
        window.showTab('network');
      }
    }
    
  } catch (error) {
    console.error('Error showing direct registration form:', error);
    // در صورت خطا، به تب شبکه هدایت کن
    if (typeof window.showTab === 'function') {
      window.showTab('network');
    }
  }
};

// مدیریت نمایش و سوییچ تب‌ها
window.navigateToPage = function(pageUrl) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    window.location.href = pageUrl;
  }, 300);
};
window.showTab = async function(tab) {
  // Check if user is activated for restricted tabs
  const restrictedTabs = ['shop', 'reports', 'learning', 'news'];
  if (restrictedTabs.includes(tab)) {
    try {
      if (window.getUserProfile) {
        const profile = await window.getUserProfile();
        if (!profile.activated) {
          // Show registration prompt for locked tabs
          showRegistrationPrompt();
          return;
        }
      }
    } catch (error) {
      console.warn('Could not check user status:', error);
      showRegistrationPrompt();
      return;
    }
  }

  const tabs = ['network','profile','reports','swap','transfer','news','shop','learning','about'];
  tabs.forEach(function(name) {
    var mainEl = document.getElementById('main-' + name);
    if (mainEl) {
      if (name === tab) {
        mainEl.style.display = '';
        mainEl.style.opacity = '0';
        mainEl.style.transform = 'translateY(20px)';
        setTimeout(() => {
          mainEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          mainEl.style.opacity = '1';
          mainEl.style.transform = 'translateY(0)';
        }, 50);
      } else {
        mainEl.style.display = 'none';
        mainEl.style.opacity = '1';
        mainEl.style.transform = 'translateY(0)';
      }
    }
    var btnEl = document.getElementById('tab-' + name + '-btn');
    if (btnEl) btnEl.classList.toggle('active', name === tab);
  });
  const targetElement = document.getElementById('main-' + tab);
  if (targetElement) {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      }, 200);
    }, 100);
  }
  try {
    switch(tab) {
      case 'network':
        if (typeof window.initializeNetworkTab === 'function') {
          await window.initializeNetworkTab();
        } else {
          if (typeof updateNetworkStats === 'function') await updateNetworkStats();
          if (typeof renderNetworkTree === 'function') await renderNetworkTree();
        }
        break;
      case 'profile':
        if (typeof loadUserProfile === 'function') await loadUserProfile();
        break;
      case 'reports':
        if (typeof loadReports === 'function') await loadReports();
        break;
      case 'swap':
        if (window.swapManager) {
          await window.swapManager.refreshSwapData();
        }
        break;
      case 'transfer':
        break;
      case 'news':
        if (typeof loadNews === 'function') loadNews();
        if (typeof loadTutorials === 'function') loadTutorials();
        break;
      case 'shop':
        if (typeof loadProducts === 'function') loadProducts();
        break;
      case 'learning':
        if (typeof initializeLearningTab === 'function') initializeLearningTab();
        break;
      case 'about': break;
    }
  } catch (error) {
    console.error(`Error loading data for tab ${tab}:`, error);
  }
}

// Check user status on page load and redirect if needed
window.checkUserAccessOnLoad = async function() {
  // Get current tab from URL or default
  const urlParams = new URLSearchParams(window.location.search);
  const currentTab = urlParams.get('tab') || 'network';
  
  const restrictedTabs = ['shop', 'reports', 'learning', 'news'];
  if (restrictedTabs.includes(currentTab)) {
    try {
      if (window.getUserProfile) {
        const profile = await window.getUserProfile();
        if (!profile.activated) {
          // Redirect to network tab and show prompt
          if (typeof window.showTab === 'function') {
            window.showTab('network');
          }
          setTimeout(() => {
            showRegistrationPrompt();
          }, 1000);
        }
      }
    } catch (error) {
      console.warn('Could not check user status on load:', error);
    }
  }
};

// Run access check when page loads
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    window.checkUserAccessOnLoad();
  }, 2000); // Wait for user profile to load
}); 