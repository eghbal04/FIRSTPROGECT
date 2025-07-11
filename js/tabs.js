// مدیریت نمایش و سوییچ تب‌ها
window.navigateToPage = function(pageUrl) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    window.location.href = pageUrl;
  }, 300);
};
window.showTab = async function(tab) {
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