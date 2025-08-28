// Display registration message for locked tabs
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
    <h3 style="color: #00ff88; margin-bottom: 1rem;">Limited Access</h3>
    <p style="color: #fff; margin-bottom: 1.5rem; line-height: 1.6;">
      This section is only open for active users.<br>
      Please register first to access all features.
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
    ">Close</button>
    <button onclick="showDirectRegistrationForm()" style="
      background: linear-gradient(135deg, #00ff88, #00cc66);
      color: #232946;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 10px;
      cursor: pointer;
      font-weight: bold;
    ">Register</button>
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

// Close registration message
window.closeRegistrationPrompt = function() {
  const prompt = document.getElementById('registration-prompt');
  const overlay = document.getElementById('registration-prompt-overlay');
  if (prompt) prompt.remove();
  if (overlay) overlay.remove();
};

// Go to registration page
window.goToRegistration = function() {
  closeRegistrationPrompt();
  // Use direct registration form display function
  if (typeof window.showDirectRegistrationForm === 'function') {
    window.showDirectRegistrationForm();
  } else if (typeof window.showTab === 'function') {
    window.showTab('register');
  }
};

// Function to display direct registration form (for tabs.js)
window.showDirectRegistrationForm = async function() {
  try {
    // Close current registration message
    const existingPrompt = document.getElementById('registration-prompt');
    const existingOverlay = document.getElementById('registration-prompt-overlay');
    if (existingPrompt) existingPrompt.remove();
    if (existingOverlay) existingOverlay.remove();
    
    // Connect to wallet
    const connection = await window.connectWallet();
    const { contract, address, provider } = connection;
    
    // Get referrer address (deployer)
    let referrerAddress;
    try {
      // First check if the connected user is active and has an index
      const connectedUserData = await contract.users(address);
      const isActive = connectedUserData && connectedUserData.index && BigInt(connectedUserData.index) > 0n;
      // If user has an index, they are considered active
      referrerAddress = isActive ? address : await contract.deployer();
    } catch (e) {
      console.error('Error getting referrer address:', e);
      referrerAddress = address; // fallback to connected address
    }
    
    // Display registration form
    if (typeof window.showRegisterForm === 'function') {
      window.showRegisterForm(referrerAddress, '', address, provider, contract);
    } else {
      // fallback to network tab
      if (typeof window.showTab === 'function') {
        window.showTab('network');
      }
    }
    
  } catch (error) {
    console.error('Error showing direct registration form:', error);
    // In case of error, redirect to network tab
    if (typeof window.showTab === 'function') {
      window.showTab('network');
    }
  }
};

// Manage display and switch tabs
window.navigateToPage = function(pageUrl) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    window.location.href = pageUrl;
  }, 300);
};
window.showTab = async function(tab) {
  // Save active tab in localStorage
  localStorage.setItem('currentActiveTab', tab);
  
  // Tab authentication disabled

  const tabs = ['network','profile','reports','swap','transfer','register','news','shop','learning','about'];
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
        {
          const hasNetworkContainer = typeof document !== 'undefined' && document.getElementById('network-tree');
          if (!hasNetworkContainer) break;
          if (typeof window.initializeNetworkTab === 'function') {
            await window.initializeNetworkTab();
          } else {
            if (typeof updateNetworkStats === 'function') await updateNetworkStats();
            if (typeof renderNetworkTree === 'function') await renderNetworkTree();
          }
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
  // Retrieve active tab from localStorage
  const savedTab = localStorage.getItem('currentActiveTab');
  const urlParams = new URLSearchParams(window.location.search);
  const urlTab = urlParams.get('tab');
  
  // Priority: URL parameter > localStorage > default
  const currentTab = urlTab || savedTab || 'network';
  
  // Tab authentication disabled; display saved or default tab
  if (typeof window.showTab === 'function') {
    window.showTab(currentTab);
  }
};

// Run access check when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Check active tab from old localStorage (for compatibility)
  const oldActiveTab = localStorage.getItem('activeTab');
  if (oldActiveTab) {
    localStorage.setItem('currentActiveTab', oldActiveTab);
    localStorage.removeItem('activeTab');
  }
  
  // Run access check with slight delay
  setTimeout(() => {
    window.checkUserAccessOnLoad();
  }, 1000); // Wait for user profile to load
}); 