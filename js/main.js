// main.js
// Clear console at the beginning of the program
console.clear();

document.addEventListener('DOMContentLoaded', async () => {
    const connectButton = document.getElementById('connectButton');
    const walletConnectButton = document.getElementById('walletConnectButton');

    if (connectButton) {
        connectButton.addEventListener('click', async () => {
            await connectWalletAndUpdateUI('metamask');
        });
    }
    
    if (walletConnectButton) {
        walletConnectButton.addEventListener('click', async () => {
            await connectWalletAndUpdateUI('walletconnect');
        });
    }
    
    // === Adding hidden owner panel button to hamburger menu ===

    // Update navbar based on user status
    await updateNavbarBasedOnUserStatus();

    // Dashboard cashback
    const cashbackValueEl = document.getElementById('dashboard-cashback-value');
    if (cashbackValueEl) {
        try {
            let cashback = await window.contractConfig.contract.cashBack();
            cashback = cashback.toString();
            cashbackValueEl.textContent = Number(cashback) / 1e18 + ' IAM';
            const cashbackDescEl = document.getElementById('dashboard-cashback-desc');
            if (cashbackDescEl) {
                cashbackDescEl.textContent = `5% of each registration is added to this fund. Current total: ${Number(cashback) / 1e18} IAM`;
            }
        } catch (e) {
            cashbackValueEl.textContent = '-';
            const cashbackDescEl = document.getElementById('dashboard-cashback-desc');
            if (cashbackDescEl) {
                cashbackDescEl.textContent = '5% of each registration is added to this fund.';
            }
        }
    }
    await updateContractStats();
    // Update all dashboard cards simultaneously with Promise.all
    if (window.contractConfig && window.contractConfig.contract) {
      const contract = window.contractConfig.contract;
      try {
        const [
          totalSupply,
          daiBalance,
          tokenBalance,
          wallets,
          totalPoints
        ] = await Promise.all([
          contract.totalSupply(),
          // Use correct function name for DAI balance
                  contract.getContractdaiBalance ? contract.getContractdaiBalance() :
        (new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, contract.provider)).balanceOf(contract.target),
          contract.balanceOf ? contract.balanceOf(contract.target) : Promise.resolve(0),
          contract.wallets(),
          contract.totalClaimableBinaryPoints()
        ]);
        const setFormatted = (id, val, decimals = 18, suffix = '') => { 
          const el = document.getElementById(id); 
          if (el) {
            const num = Number(val) / Math.pow(10, decimals);
            const formatted = num.toLocaleString('en-US', {maximumFractionDigits: 2}) + suffix;
            el.textContent = formatted;
          } 
        };
        
        setFormatted('circulating-supply', totalSupply, 18, ''); // Remove IAM suffix
        setFormatted('dashboard-dai-balance', daiBalance, 18, ''); // Remove DAI suffix
        setFormatted('contract-token-balance', tokenBalance, 18, ''); // Remove IAM suffix
        setFormatted('dashboard-wallets-count', wallets, 0, '');
        // set('total-points', Math.floor(Number(totalPoints) / 1e18).toLocaleString('en-US'));
        // set('total-points', '-');
      } catch (e) {
        // set('total-points', '-');
      }
    }



    // Display contract address in dashboard card (without button, only by clicking on address)
    const contractAddress = (window.contractConfig && window.contractConfig.IAM_ADDRESS) ? window.contractConfig.IAM_ADDRESS : (typeof IAM_ADDRESS !== 'undefined' ? IAM_ADDRESS : '');
    const dashAddrEl = document.getElementById('dashboard-contract-address');
    if (dashAddrEl && contractAddress) {
        dashAddrEl.textContent = contractAddress;
        dashAddrEl.style.cursor = 'pointer';
        dashAddrEl.style.userSelect = 'all';
        dashAddrEl.style.background = 'rgba(0,255,136,0.07)';
        dashAddrEl.style.padding = '2px 8px';
        dashAddrEl.style.borderRadius = '6px';
        dashAddrEl.title = 'Click to copy';
        dashAddrEl.onclick = function() {
            navigator.clipboard.writeText(contractAddress);
            const old = dashAddrEl.textContent;
            dashAddrEl.textContent = 'Copied!';
            dashAddrEl.style.background = '#bbf7d0';
            setTimeout(() => {
                dashAddrEl.textContent = old;
                dashAddrEl.style.background = 'rgba(0,255,136,0.07)';
            }, 1200);
        };
    }
    // Remove any additional copy button if exists
    const dashCopyBtn = document.getElementById('dashboard-contract-copy-btn');
    if (dashCopyBtn) dashCopyBtn.remove();

    // Update total points along with other dashboard values
    const totalPointsEl = document.getElementById('total-points');
    if (totalPointsEl && window.contractConfig && window.contractConfig.contract) {
      try {
        // Use totalClaimablePoints function to display total binary points
        const contract = window.contractConfig.contract;
        const result = await contract.totalClaimablePoints();
        // Use ethers.formatUnits for correct BigInt to number conversion
        const totalPoints = parseInt(ethers.formatUnits(result, 0));
        
        totalPointsEl.textContent = totalPoints.toLocaleString('en-US');
        console.log(`📊 Total binary points: ${totalPoints.toLocaleString('en-US')}`);
        
      } catch (e) {
        console.warn('⚠️ Error getting binary points:', e);
        totalPointsEl.textContent = '-';
      }
    }
});

function shortenAddress(address) {
    if (!address) return '---';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function shorten(address) {
    if (!address) return '---';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// Function to add owner button to the end of hamburger menu only for owner


// Function to connect wallet with specific type
async function connectWalletAndUpdateUI(walletType) {
    try {
        const connection = await connectWallet();
        const { contract, address, provider } = connection;
        
        // Update connection UI
        updateConnectionUI(null, address, walletType);
        
        // Check user status (without showing registration form)
        try {
            const userData = await contract.users(address);
            console.log('User data on wallet connection:', userData);
        } catch (userDataError) {
            console.warn('Could not fetch user data:', userDataError);
        }
        
        // Update navbar based on user status
        await updateNavbarBasedOnUserStatus();
        
        // Update locks
        await lockTabsForDeactivatedUsers();
        
        // Update transfer balances
        setTimeout(() => {
            if (window.updateTransferBalancesOnConnect) {
                window.updateTransferBalancesOnConnect();
            }
        }, 2000);
        
        // Update user status bar after wallet connection
        setTimeout(() => {
            if (typeof window.updateUserStatusBar === 'function') {
                window.updateUserStatusBar();
            }
        }, 1500);
        
        return connection;
    } catch (error) {
        console.error('Error in connectWalletAndUpdateUI:', error);
        throw error;
    }
}

// Update updateConnectionUI function to support different wallet types
function updateConnectionUI(profile, address, walletType) {
    const connectButton = document.getElementById('connectButton');
    const walletConnectButton = document.getElementById('walletConnectButton');
    
    if (walletType === 'metamask' && connectButton) {
        connectButton.textContent = 'Connected: ' + shortenAddress(address);
        connectButton.style.background = 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)';
        connectButton.disabled = true;
    } else if (walletType === 'walletconnect' && walletConnectButton) {
        walletConnectButton.textContent = 'Connected: ' + shortenAddress(address);
        walletConnectButton.style.background = 'linear-gradient(90deg, #3b99fc 0%, #2a7de1 100%)';
        walletConnectButton.disabled = true;
    }

    // Other UI updates
const updateElement = (id, value) => {
    const element = document.getElementById(id);
    if (!element) return;
    
    // Format large numbers
    if (typeof value === 'string' && value.includes('.')) {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            if (num >= 1000000) {
                value = (num / 1000000).toFixed(2) + 'M';
            } else if (num >= 1000) {
                value = (num / 1000).toFixed(2) + 'K';
            } else {
                value = num.toLocaleString('en-US', {
                maximumFractionDigits: 6
            });
            }
        }
    }
    
    element.textContent = value;
};

    updateElement('user-address', shortenAddress(address));
            updateElement('dai-balance', profile.daiBalance); // Remove DAI suffix
        updateElement('profile-dai', profile.daiBalance); // Remove DAI suffix

    const userDashboard = document.getElementById('user-dashboard');
    const mainContent = document.getElementById('main-content');

    if (userDashboard) userDashboard.style.display = 'block';
    if (mainContent) mainContent.style.display = 'none';
    
    // Initialize binary reward timer
    if (profile.lastClaimTime) {
        // Check if startBinaryClaimCountdown function exists
        if (typeof window.startBinaryClaimCountdown === 'function') {
            window.startBinaryClaimCountdown(profile.lastClaimTime);
        } else {
            // If function doesn't exist, initialize timer directly
            const timerEl = document.getElementById('binary-claim-timer');
            if (timerEl) {
                function updateTimer() {
                    const now = Math.floor(Date.now() / 1000);
                    const nextClaim = Number(profile.lastClaimTime) + 12 * 3600;
                    const diff = nextClaim - now;
                    if (diff <= 0) {
                        timerEl.textContent = '';
                        return;
                    }
                    const hours = Math.floor(diff / 3600);
                    const minutes = Math.floor((diff % 3600) / 60);
                    const seconds = diff % 60;
                    timerEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes
                        .toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    setTimeout(updateTimer, 1000);
                }
                updateTimer();
            }
        }
    }
    
    // Update navbar based on user status
    updateNavbarBasedOnUserStatus();
    
    // After UI update:
    setTimeout(window.addOwnerPanelButtonIfOwner, 500);
}

// fetchUserProfile function that is called in main.js
async function fetchUserProfile() {
    try {
        const connectionResult = await connectWallet();
        if (!connectionResult || !connectionResult.contract || !connectionResult.address) {
            throw new Error('Wallet connection not available');
        }
        const { contract, address } = connectionResult;
        // Get balances
        const provider = contract.provider;
        const signer = contract.signer || (provider && provider.getSigner ? await provider.getSigner() : null);
        let daiBalance = '0';
        if (signer && typeof window.DAI_ADDRESS !== 'undefined' && typeof window.DAI_ABI !== 'undefined') {
          const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, signer);
          const daiRaw = await window.retryRpcOperation(() => daiContract.balanceOf(address), 2);
          daiBalance = ethers.formatUnits(daiRaw, 18); // DAI has 18 decimals
        }
        // Get user data
        const userData = await window.retryRpcOperation(() => contract.users(address), 2);
        // Get IAM/MATIC and MATIC/USD prices
        const [tokenPriceMatic, maticPriceUSD] = await Promise.all([
            window.retryRpcOperation(() => contract.getTokenPrice(), 2),
            window.fetchPolUsdPrice()
        ]);
        const formattedMaticBalance = ethers.formatEther(maticBalance);
        const formattedLvlBalance = ethers.formatUnits(lvlBalance, 18);
        const tokenPriceMaticFormatted = ethers.formatUnits(tokenPriceMatic, 18);
        // IAM/USD price = (IAM/MATIC) * (MATIC/USD)
        const tokenPriceUSD = parseFloat(tokenPriceMaticFormatted) * parseFloat(maticPriceUSD);
        // Calculate USD value
        const maticValueUSD = parseFloat(formattedMaticBalance) * parseFloat(maticPriceUSD);
        const lvlValueUSD = parseFloat(formattedLvlBalance) * tokenPriceUSD;
        return {
            address,
            daiBalance,
            isRegistered: !!(userData && userData.index && BigInt(userData.index) > 0n),
            binaryPoints: ethers.formatUnits(userData.binaryPoints, 18),
            binaryPointCap: userData.binaryPointCap.toString(),
            referrer: userData.referrer
        };
    } catch (error) {
        return {
            address: '---',
            daiBalance: '0',
            isRegistered: false,
            binaryPoints: '0',
            binaryPointCap: '0',
            referrer: '---'
        };
    }
}

// Function to connect to wallet
async function connectWallet() {
    try {
        // Check existing connection
        if (window.contractConfig && window.contractConfig.contract && window.contractConfig.address) {
            return window.contractConfig;
        }
        
        // Check existing MetaMask connection
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                try {
                    if (window.contractConfig && typeof window.contractConfig.initializeWeb3 === 'function') {
                        await window.contractConfig.initializeWeb3();
                    } else {
                        throw new Error('initializeWeb3 function not available');
                    }
                    return window.contractConfig;
                } catch (error) {
                    throw new Error('Error initializing Web3');
                }
            }
        }
        
        throw new Error('Please connect your wallet first');
        
    } catch (error) {
        throw error;
    }
}

// Define connectWallet function in window for use in other files
window.connectWallet = connectWallet;

// Function to update navbar based on user status
async function updateNavbarBasedOnUserStatus() {
    try {
        const connection = await checkConnection();
        if (!connection.connected) {
            // If user is not connected, reset navbar to default
            resetNavbarToDefault();
            return;
        }

        const connectionResult = await connectWallet();
        if (!connectionResult || !connectionResult.contract || !connectionResult.address) {
            throw new Error('Wallet connection not available');
        }
        const { contract, address } = connectionResult;
        
        try {
            const userData = await window.retryRpcOperation(() => contract.users(address), 2);
            
            if (userData && userData.index && BigInt(userData.index) > 0n) {
                // User is active
                updateNavbarForActiveUser();
                
                // Update user ID display
                if (userData.index) {
                    updateIAMIdDisplay(userData.index);
                }
            } else {
                // User is not active
                resetNavbarToDefault();
            }
        } catch (error) {
            console.error('Error checking user status:', error);
            resetNavbarToDefault();
        }
    } catch (error) {
        console.warn('Error updating navbar:', error);
        resetNavbarToDefault();
    }
}

// Function to change navbar for active users
function updateNavbarForActiveUser() {
    // Change in desktop navbar
    const desktopRegisterLink = document.querySelector('.desktop-nav a[href="#main-register"]');
    if (desktopRegisterLink) {
        desktopRegisterLink.innerHTML = '<i class="fa-solid fa-arrow-up icon" aria-hidden="true"></i><span class="label">Increase Cap</span>';
        desktopRegisterLink.title = 'Increase Cap';
    }
    
    // Change in mobile navbar
    const mobileRegisterLink = document.querySelector('.fab-menu a[href="#main-register"]');
    if (mobileRegisterLink) {
        mobileRegisterLink.innerHTML = '<i class="fa-solid fa-arrow-up icon" aria-hidden="true"></i><span class="label">Increase Cap</span>';
        mobileRegisterLink.title = 'Increase Cap';
    }
}

// Function to reset navbar to default state
function resetNavbarToDefault() {
    // Reset desktop navbar
    const desktopRegisterLink = document.querySelector('.desktop-nav a[href="#main-register"]');
    if (desktopRegisterLink) {
        desktopRegisterLink.innerHTML = '<i class="fa-solid fa-user-plus icon" aria-hidden="true"></i><span class="label">Register</span>';
        desktopRegisterLink.title = 'Register';
    }
    
    // Reset mobile navbar
    const mobileRegisterLink = document.querySelector('.fab-menu a[href="#main-register"]');
    if (mobileRegisterLink) {
        mobileRegisterLink.innerHTML = '<i class="fa-solid fa-user-plus icon" aria-hidden="true"></i><span class="label">Register</span>';
        mobileRegisterLink.title = 'Register';
    }
}

// Function to check wallet connection
async function checkConnection() {
    try {
        const { provider, address } = await connectWallet();
        const network = await provider.getNetwork();
        
        return {
            connected: true,
            address,
            network: network.name,
            chainId: network.chainId
        };
    } catch (error) {
        return {
            connected: false,
            error: error.message
        };
    }
}

// Initialize price chart when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize price chart after a short delay to ensure all modules are loaded
    setTimeout(async () => {
        try {
            if (window.priceChart && window.priceChart.initialize) {
                await window.priceChart.initialize();
            }
        } catch (error) {
        }
    }, 1000);
});

// Cache for user profile
let userProfileCache = null;
let userProfileCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

async function loadUserProfileOnce() {
    const now = Date.now();
    
    // If cache is valid, use it
    if (userProfileCache && (now - userProfileCacheTime) < CACHE_DURATION) {
        return userProfileCache;
    }
    
    try {
        // Get new profile
        if (window.getUserProfile) {
            userProfileCache = await window.getUserProfile();
            userProfileCacheTime = now;
            return userProfileCache;
        } else {
            console.warn('getUserProfile function not available');
            return null;
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        return null;
    }
}

// Function to clear profile cache
function clearUserProfileCache() {
    userProfileCache = null;
    userProfileCacheTime = 0;
    console.log('User profile cache cleared');
}

// Export for use in other files
window.clearUserProfileCache = clearUserProfileCache;

// Tab locking disabled
async function lockTabsForDeactivatedUsers() { return; }


// Show registration message for locked tabs
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
        <h3 style="color: #00ff88; margin-bottom: 1rem; font-size: 1.3rem;">Limited Access</h3>
        <p style="color: #b8c1ec; margin-bottom: 1.5rem; line-height: 1.6;">
            This section is only open for active users.<br>
            Please register first to access all features.
        </p>
        <button onclick="showDirectRegistrationForm()" style="
            background: linear-gradient(135deg, #a786ff, #8b6bff);
            color: #fff;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 12px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
        ">Register Now</button>
    `;
    
    document.body.appendChild(prompt);
    
    // Close on background click
    const overlay = document.createElement('div');
    overlay.id = 'registration-prompt-overlay';
    overlay.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
    `;
    overlay.onclick = () => {
        prompt.remove();
        overlay.remove();
    };
    document.body.appendChild(overlay);
}

// Function to test lock status
window.testLockStatus = async function() {
    try {
        console.log('🔍 Testing lock status...');
        
        const profile = await loadUserProfileOnce();
        // User profile loaded
        
        if (profile) {
            // Profile loaded successfully
        } else {
            // No profile available
        }
        
        // Check tab lock status
        const lockedTabs = document.querySelectorAll('.locked-tab');
        const lockedMenuItems = document.querySelectorAll('.locked-menu-item') || [];

        return {
            profile: profile,
            lockedTabs: lockedTabs.length,
            lockedMenuItems: lockedMenuItems.length
        };
    } catch (error) {
        console.error('Error testing lock status:', error);
        return { error: error.message };
    }
};

// Function to show direct registration form
window.showDirectRegistrationForm = async function() {
    try {
        // Add loading state to button
        const registrationButton = document.getElementById('main-registration-button');
        if (registrationButton) {
            registrationButton.classList.add('loading');
            const button = registrationButton.querySelector('button');
            if (button) {
                button.textContent = '⏳ Loading...';
            }
        }
        
        // Close current registration message
        const existingPrompt = document.getElementById('registration-prompt');
        const existingOverlay = document.getElementById('registration-prompt-overlay');
        if (existingPrompt) existingPrompt.remove();
        if (existingOverlay) existingOverlay.remove();
        
        // Connect to wallet
        const connection = await window.connectWallet();
        const { contract, address, provider } = connection;
        
        // Determine referrer address without sensitive contract calls
        let referrerAddress = '';
        try {
            if (typeof getReferrerFromURL === 'function') {
                referrerAddress = getReferrerFromURL();
            }
            if (!referrerAddress && typeof getReferrerFromStorage === 'function') {
                referrerAddress = getReferrerFromStorage();
            }
        } catch {}
        if (!referrerAddress) referrerAddress = address;
        
        // Show registration form
        if (typeof window.showRegisterForm === 'function') {
            window.showRegisterForm(referrerAddress, '', address, provider, contract);
        } else {
            // fallback to network tab
            if (typeof window.showTab === 'function') {
                window.showTab('network');
            }
        }
        
        // Remove loading state
        if (registrationButton) {
            registrationButton.classList.remove('loading');
            const button = registrationButton.querySelector('button');
            if (button) {
                button.textContent = '🚀 Register Now';
            }
        }
        
    } catch (error) {
        console.error('Error showing direct registration form:', error);
        
        // Remove loading state on error
        const registrationButton = document.getElementById('main-registration-button');
        if (registrationButton) {
            registrationButton.classList.remove('loading');
            const button = registrationButton.querySelector('button');
            if (button) {
                button.textContent = '🚀 Register Now';
            }
        }
        
        // On error, redirect to network tab
        if (typeof window.showTab === 'function') {
            window.showTab('network');
        }
    }
};

document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== DOMContentLoaded: Starting user status check ===');
    
    // First apply locks
    await lockTabsForDeactivatedUsers();
    
    // Then check if user is not active
    try {
        if (window.getUserProfile) {
            console.log('getUserProfile function is available');
            const profile = await loadUserProfileOnce();
            console.log('User profile loaded on page load:', profile);
            console.log('Profile type:', typeof profile);
            console.log('Profile activated:', profile?.activated);
            console.log('Profile index:', profile?.index);
            console.log('Profile index type:', typeof profile?.index);
            
            // More detailed user status check
            const hasIndex = profile && profile.index && BigInt(profile.index) > 0n;
            const isActivated = profile && profile.activated;
            const isActive = isActivated && hasIndex;
            
            console.log('User status breakdown:');
            console.log('- hasIndex:', hasIndex);
            console.log('- isActivated:', isActivated);
            console.log('- isActive:', isActive);
            
            if (isActive) {
                console.log('User is active');
            } else {
                console.log('User is not active (registration form removed as requested)');
            }
        } else {
            console.log('getUserProfile function is NOT available');
        }
    } catch (error) {
        console.log('Could not check user status on load:', error);
        console.log('Error details:', error.message);
        console.log('Error stack:', error.stack);
    }
    
    // Restore active tab from localStorage
    const savedTab = localStorage.getItem('currentActiveTab');
    if (savedTab && typeof window.showTab === 'function') {
        // Wait a bit for page to fully load
        setTimeout(() => {
            window.showTab(savedTab);
        }, 500);
    }
    
    console.log('=== DOMContentLoaded: User status check completed ===');
});

// Function to test lock status - removed

// Execute lock tests after 3 seconds
setTimeout(() => {
    if (typeof window.testLockStatus === 'function') {
        window.testLockStatus();
    }
}, 3000);

// Function to force lock everything - removed

// Show welcome and registration message for inactive users - DISABLED
window.showWelcomeRegistrationPrompt = async function() {
    console.log('=== showWelcomeRegistrationPrompt: DISABLED as requested ===');
    // This function has been disabled as per user request to remove registration form from page load
    return;
};

// Function to close welcome modal
window.closeWelcomeModal = function() {
    const modal = document.getElementById('welcome-registration-modal');
    if (modal) {
        modal.remove();
    }
};

// Function for direct registration
window.registerNow = function() {
    closeWelcomeModal();
    // Use direct registration form function
    if (typeof window.showDirectRegistrationForm === 'function') {
        window.showDirectRegistrationForm();
    } else if (typeof window.showTab === 'function') {
        window.showTab('network');
    }
};

// Function to manage main registration button
window.manageMainRegistrationButton = async function() {
    try {
        // Check user status
        if (!window.getUserProfile) {
            console.log('getUserProfile function not available');
            return;
        }
        
        const profile = await loadUserProfileOnce();
        const registrationButton = document.getElementById('main-registration-button');
        
        if (!registrationButton) {
            console.log('Main registration button not found');
            return;
        }
        
        if (!(profile.index && BigInt(profile.index) > 0n)) {
            // User not registered - show button
            registrationButton.style.display = 'block';
            
            // Update registration cost
            try {
                if (window.contractConfig && window.contractConfig.contract) {
                    const price = await window.getRegPrice(window.contractConfig.contract);
                    const formattedPrice = parseFloat(ethers.formatUnits(price, 18)).toFixed(0);
                    const costDisplay = document.getElementById('registration-cost-display');
                    if (costDisplay) {
                        costDisplay.textContent = `${formattedPrice} IAM`;
                    }
                }
            } catch (e) {
                console.log('Could not update registration cost:', e);
            }
            
            console.log('✅ Main registration button shown for unregistered user');
        } else {
            // User registered - hide button
            registrationButton.style.display = 'none';
            console.log('✅ Main registration button hidden for registered user');
        }
        
    } catch (error) {
        console.error('Error managing main registration button:', error);
        // In case of error, hide the button
        const registrationButton = document.getElementById('main-registration-button');
        if (registrationButton) {
            registrationButton.style.display = 'none';
        }
    }
};

// Function to clear main registration button (after successful registration)
window.hideMainRegistrationButton = function() {
    const registrationButton = document.getElementById('main-registration-button');
    if (registrationButton) {
        registrationButton.style.display = 'none';
        console.log('✅ Main registration button hidden after successful registration');
    }
};

// Check referral link after 2 seconds
setTimeout(() => {
    if (typeof window.showRegistrationFormForInactiveUser === 'function') {
        window.showRegistrationFormForInactiveUser();
    }
}, 2000);

// Manage main registration button after 3 seconds
setTimeout(() => {
    if (typeof window.manageMainRegistrationButton === 'function') {
        window.manageMainRegistrationButton();
    }
}, 3000);

// Function to display referral and commission information
window.showReferralInfo = function() {
    const referralModal = document.createElement('div');
    referralModal.id = 'referral-info-modal';
    referralModal.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    referralModal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #232946, #181c2a);
            border: 2px solid #00ff88;
            border-radius: 24px;
            padding: 2.5rem;
            max-width: 600px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            position: relative;
        ">
            <!-- Close Button -->
            <button onclick="closeReferralModal()" style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                color: #00ff88;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            " onmouseover="this.style.background='rgba(0,255,136,0.1)'" onmouseout="this.style.background='none'">×</button>
            
            <!-- Referral Icon -->
            <div style="font-size: 4rem; margin-bottom: 1rem;">🤝</div>
            
            <!-- Title -->
            <h2 style="
                color: #00ff88;
                margin-bottom: 1rem;
                font-size: 1.8rem;
                font-weight: bold;
            ">IAM Referral System</h2>
            
            <!-- Description -->
            <p style="
                color: #b8c1ec;
                margin-bottom: 1.5rem;
                line-height: 1.6;
                font-size: 1.1rem;
            ">
                Earn commission and income by referring your friends!
            </p>
            
            <!-- Referral Information Card -->
            <div style="
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 16px;
                padding: 1.5rem;
                margin: 1.5rem 0;
                backdrop-filter: blur(10px);
            ">
                <h3 style="
                    color: #00ff88;
                    margin-bottom: 1rem;
                    font-size: 1.3rem;
                    font-weight: bold;
                ">💰 Commission Structure</h3>
                
                <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1rem;
                ">
                    <div style="text-align: center;">
                        <div style="
                            color: #00ccff;
                            font-size: 1.5rem;
                            font-weight: bold;
                            margin-bottom: 0.3rem;
                        ">5%</div>
                        <div style="
                            color: #b8c1ec;
                            font-size: 0.9rem;
                        ">Direct Commission</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="
                            color: #a786ff;
                            font-size: 1.5rem;
                            font-weight: bold;
                            margin-bottom: 0.3rem;
                        ">2%</div>
                        <div style="
                            color: #b8c1ec;
                            font-size: 0.9rem;
                        ">Indirect Commission</div>
                    </div>
                </div>
                
                <div style="
                    color: #00ff88;
                    font-size: 0.9rem;
                    line-height: 1.4;
                    margin-top: 1rem;
                ">
                    💡 For every 100 IAM registration, you receive 5 IAM direct commission
                </div>
            </div>
            
            <!-- Referral Benefits Card -->
            <div style="
                background: rgba(167, 134, 255, 0.1);
                border: 1px solid rgba(167, 134, 255, 0.3);
                border-radius: 16px;
                padding: 1.5rem;
                margin: 1.5rem 0;
                backdrop-filter: blur(10px);
            ">
                <h3 style="
                    color: #a786ff;
                    margin-bottom: 1rem;
                    font-size: 1.3rem;
                    font-weight: bold;
                ">🎯 Referral Benefits</h3>
                
                <div style="
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0.8rem;
                    text-align: right;
                ">
                    <div style="
                        color: #b8c1ec;
                        font-size: 0.9rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    ">
                        <span style="color: #00ff88;">✅</span>
                        Continuous income from referred activities
                    </div>
                    <div style="
                        color: #b8c1ec;
                        font-size: 0.9rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    ">
                        <span style="color: #00ff88;">✅</span>
                        Commission from all sub-transactions
                    </div>
                    <div style="
                        color: #b8c1ec;
                        font-size: 0.9rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    ">
                        <span style="color: #00ff88;">✅</span>
                        Special rewards for successful referrals
                    </div>
                    <div style="
                        color: #b8c1ec;
                        font-size: 0.9rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    ">
                        <span style="color: #00ff88;">✅</span>
                        Access to referral management tools
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 2rem;
            ">
                <button onclick="copyReferralLink()" style="
                    background: linear-gradient(135deg, #a786ff, #8b6bff);
                    color: #fff;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    flex: 1;
                    max-width: 200px;
                " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 20px rgba(167,134,255,0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                    📋 Copy Referral Link
                </button>
                
                <button onclick="closeReferralModal()" style="
                    background: rgba(255, 255, 255, 0.1);
                    color: #b8c1ec;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    flex: 1;
                    max-width: 200px;
                " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(referralModal);
};

// Function to close referral modal
window.closeReferralModal = function() {
    const modal = document.getElementById('referral-info-modal');
    if (modal) {
        modal.remove();
    }
};

// Function to copy referral link
window.copyReferralLink = async function() {
    try {
        const profile = await loadUserProfileOnce();
        const currentUrl = window.location.origin + window.location.pathname;
        const referralLink = `${currentUrl}?ref=${profile.address}`;
        
        await navigator.clipboard.writeText(referralLink);
        
        // Display success message
        const successMsg = document.createElement('div');
        successMsg.style = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00ff88, #00cc66);
            color: #181c2a;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: bold;
            z-index: 10002;
            animation: slideInRight 0.3s ease;
        `;
        successMsg.textContent = '✅ Referral link copied!';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
        }, 3000);
        
    } catch (error) {
        console.error('Error copying referral link:', error);
    }
};

// Countdown timer for next online session (only for active users)
const nextSessionDate = new Date("2025-07-01T16:30:00+03:30"); // Set the date and time of the next session here
function updateSessionTimer() {
    const now = new Date();
    const diff = nextSessionDate - now;
    if (diff <= 0) {
        document.getElementById('session-timer').textContent = "Online session is in progress!";
        return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    document.getElementById('session-timer').textContent =
        `${days} days and ${hours} hours and ${minutes} minutes and ${seconds} seconds`;
}
if (document.getElementById('session-timer')) {
    setInterval(updateSessionTimer, 1000);
    updateSessionTimer();
}
(async function() {
    if (window.getUserProfile) {
        const profile = await loadUserProfileOnce();
        if (profile && profile.index && BigInt(profile.index) > 0n) {
            var sessionBox = document.getElementById('session-timer-box');
            if (sessionBox) sessionBox.style.display = 'block';
        }
    }
})();

// Display token price for all users (even without wallet connection)
async function showTokenPricesForAll() {
    try {
        // If contractConfig and contract are ready
        if (window.contractConfig && window.contractConfig.contract) {
            const contract = window.contractConfig.contract;
            // IAM to DAI price (token price is directly to DAI)
            const tokenPrice = await contract.getTokenPrice();
            const tokenPriceFormatted = ethers.formatUnits(tokenPrice, 18);
            
            // Display in elements
            const IAMUsd = document.getElementById('chart-lvl-usd');
            if (IAMUsd) IAMUsd.textContent = '$' + tokenPriceFormatted;
        }
    } catch (e) {
        // If there was an error, display default value
        const IAMUsd = document.getElementById('chart-lvl-usd');
        if (IAMUsd) IAMUsd.textContent = '-';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(showTokenPricesForAll, 1200);
});

// Display balance and dollar value only with wallet connection
async function showUserBalanceBox() {
    const box = document.getElementById('user-balance-box');
    if (!box) return;
    try {
        const connectionResult = await connectWallet();
        if (!connectionResult || !connectionResult.contract || !connectionResult.address) {
            throw new Error('Wallet connection not available');
        }
        const { contract, address } = connectionResult;
        // Get balance and price with retry mechanism
        const [lvlBalance, tokenPrice] = await Promise.all([
            window.retryRpcOperation(() => contract.balanceOf(address), 2),
            window.retryRpcOperation(() => contract.getTokenPrice(), 2)
        ]);
        const lvl = ethers.formatUnits(lvlBalance, 18);
        const tokenPriceFormatted = ethers.formatUnits(tokenPrice, 18);
        const usdValue = (parseFloat(lvl) * parseFloat(tokenPriceFormatted)).toFixed(2);
        document.getElementById('user-lvl-balance').textContent = lvl;
        document.getElementById('user-lvl-usd-value').textContent = usdValue + ' $';
        box.style.display = 'block';
    } catch (e) {
        box.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(showUserBalanceBox, 1500);
});

// Function to display information of a network node in your balance box
window.updateUserBalanceBoxWithNode = async function(address, userData) {
    console.log('updateUserBalanceBoxWithNode called with:', address, userData);
    console.log('UserData fields:', Object.keys(userData || {}));
    console.log('All userData values:', userData);
    console.log('binaryPoints:', userData?.binaryPoints);
    console.log('binaryPointCap:', userData?.binaryPointCap);
    console.log('activated:', userData?.activated);
    console.log('leftPoints:', userData?.leftPoints);
    console.log('rightPoints:', userData?.rightPoints);
    console.log('index:', userData?.index);
    console.log('totalPurchasedKind:', userData?.totalPurchasedKind);
    console.log('binaryPointsClaimed:', userData?.binaryPointsClaimed);
    console.log('depositedAmount:', userData?.depositedAmount);
    
    const box = document.getElementById('user-balance-box');
    if (!box) {
        console.log('user-balance-box not found');
        return;
    }
    console.log('Found user-balance-box, setting display to block');
    box.style.display = 'block';
    
    // Shortened address
    const shortAddress = address ? `${address.slice(0, 3)}...${address.slice(-2)}` : '-';
    console.log('Short address:', shortAddress);
    
    // Get referrer from contract
    let referrerAddress = '-';
    try {
        if (window.contractConfig && window.contractConfig.contract) {
            const contract = window.contractConfig.contract;
            const userIndex = userData?.index;
            if (userIndex && userIndex > 0) {
                referrerAddress = await contract.getReferrer(userIndex);
                referrerAddress = referrerAddress && referrerAddress !== '0x0000000000000000000000000000000000000000' 
                    ? shortenAddress(referrerAddress) : '-';
            }
        }
    } catch (e) {
        console.log('Error getting referrer:', e);
        referrerAddress = '-';
    }
    
    // Main information
    const lvlBalanceElement = document.getElementById('user-lvl-balance');
    
    if (lvlBalanceElement) {
        // Get real IAM balance from contract
        let balanceInIAM = '-';
        try {
            if (window.contractConfig && window.contractConfig.contract) {
                const contract = window.contractConfig.contract;
                const balance = await contract.balanceOf(address);
                const balanceStr = balance ? (typeof balance === 'bigint' ? balance.toString() : balance) : null;
                // Convert from wei to IAM (18 decimal places)
                balanceInIAM = balanceStr ? (parseInt(balanceStr) / Math.pow(10, 18)).toFixed(2) : null;
            }
        } catch (e) {
            console.log('Error getting IAM balance:', e);
            balanceInIAM = '-';
        }
        lvlBalanceElement.textContent = balanceInIAM ? balanceInIAM : '-'; // Remove IAM suffix
        console.log('Updated lvl balance:', lvlBalanceElement.textContent);
    }
    
    // Create or update additional information section
    let extraInfo = document.getElementById('node-extra-info');
    if (!extraInfo) {
        extraInfo = document.createElement('div');
        extraInfo.id = 'node-extra-info';
        extraInfo.style.cssText = `
            margin-top: 0.5rem;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(10px);
        `;
        box.appendChild(extraInfo);
        console.log('Created new extra-info div');
    }
    
    // Categorized information content - compact and optimized for mobile
    extraInfo.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; font-size: 0.8rem;">
            <!-- Address and status in one row -->
            <div style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; padding-bottom: 0.3rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="color: #b8c1ec; font-family: monospace; font-size: 0.75rem;">${shortAddress}</div>
                <div style="color: ${userData?.[4] ? '#4ade80' : '#f87171'}; font-size: 0.7rem; padding: 0.1rem 0.4rem; background: ${userData?.[4] ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)'}; border-radius: 3px;">
                    ${userData?.[4] ? 'Active' : 'Inactive'}
                </div>
            </div>
            
            <!-- Referrer -->
            <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                                        <div style="color: #a786ff; font-size: 0.7rem; opacity: 0.8;">👤 Referrer</div>
                <div style="color: #b8c1ec; font-size: 0.7rem; font-family: monospace;">
                    ${referrerAddress}
                </div>
            </div>
            
            <!-- Income Cap -->
            <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                <div style="color: #a786ff; font-size: 0.7rem; opacity: 0.8;">💰 Cap</div>
                <div style="color: #b8c1ec; font-size: 0.7rem;">${userData?.[2] ? (typeof userData[2] === 'bigint' ? userData[2].toString() : userData[2]) : '-'} Points</div>
            </div>
            
            <!-- Left Points -->
            <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                <div style="color: #a786ff; font-size: 0.7rem; opacity: 0.8;">⬅️ Left</div>
                <div style="color: #b8c1ec; font-size: 0.7rem;">${userData?.[8] ? (typeof userData[8] === 'bigint' ? userData[8].toString() : userData[8]) : '-'}</div>
            </div>
            
            <!-- Right Points -->
            <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                <div style="color: #a786ff; font-size: 0.7rem; opacity: 0.8;">➡️ Right</div>
                <div style="color: #b8c1ec; font-size: 0.7rem;">${userData?.[7] ? (typeof userData[7] === 'bigint' ? userData[7].toString() : userData[7]) : '-'}</div>
            </div>
            
            <!-- Referral Link -->
            <div style="grid-column: 1 / -1; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.2rem; padding-top: 0.2rem; border-top: 1px solid rgba(255,255,255,0.1);">
                <div style="color: #a786ff; font-size: 0.7rem; opacity: 0.8;">🔗 Invite:</div>
                <div style="color: #b8c1ec; font-size: 0.65rem; font-family: monospace; flex: 1;">${shortWallet(address)}</div>
                <button onclick="copyReferralLink('${address}')" style="background: #a786ff; color: white; border: none; border-radius: 3px; padding: 0.2rem 0.4rem; font-size: 0.6rem; cursor: pointer;">Copy</button>
            </div>
        </div>
    `;
    console.log('Updated extra info content');
};

// تابع کوتاه کردن آدرس
function shortWallet(address) {
    if (!address) return '-';
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
}

// تابع کپی کردن لینک رفرال
window.copyReferralLink = function(address) {
    const referralLink = `${window.location.origin}${window.location.pathname}?ref=${address}`;
    navigator.clipboard.writeText(referralLink).then(() => {
        // نمایش پیام موفقیت
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'کپی شد!';
        button.style.background = '#4ade80';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#a786ff';
        }, 2000);
    }).catch(err => {
        console.error('خطا در کپی کردن لینک:', err);
        // روش جایگزین برای مرورگرهای قدیمی
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'کپی شد!';
        button.style.background = '#4ade80';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#a786ff';
        }, 2000);
    });
};

window.networkRendered = false;

// تابع کوتاه کردن آدرس
function shortWallet(address) {
    if (!address) return '-';
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
}

// تابع کپی کردن لینک رفرال
window.copyReferralLink = function(address) {
    const referralLink = `${window.location.origin}${window.location.pathname}?ref=${address}`;
    navigator.clipboard.writeText(referralLink).then(() => {
        // نمایش پیام موفقیت
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'کپی شد!';
        button.style.background = '#4ade80';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#a786ff';
        }, 2000);
    }).catch(err => {
        console.error('خطا در کپی کردن لینک:', err);
        // روش جایگزین برای مرورگرهای قدیمی
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'کپی شد!';
        button.style.background = '#4ade80';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#a786ff';
        }, 2000);
    });
};


document.addEventListener('click', function(e) {
  if (e.target.classList.contains('empty-node')) {
    (async function() {
      const { contract, address, provider } = await window.connectWallet();
      const userData = await contract.users(address);
      let referrerAddress;
      let defaultNewWallet = '';
      if (userData.activated) {
        // Case 1: User is registered and wants to get subordinates
        const childIndex = e.target.getAttribute('data-index');
        const parentIndex = Math.floor(Number(childIndex) / 2);
        referrerAddress = await contract.indexToAddress(BigInt(parentIndex));
        defaultNewWallet = '';
      } else {
        // Case 2 and 3: User is not registered
        referrerAddress = getReferrerFromURL() || getReferrerFromStorage();
        if (!referrerAddress) {
          if (typeof window.getDeployerAddress === 'function') {
            referrerAddress = await window.getDeployerAddress(contract);
          } else {
            try {
          referrerAddress = await contract.deployer();
            } catch (deployerError) {
              console.warn('Error getting deployer:', deployerError);
              referrerAddress = address || '0x0000000000000000000000000000000000000000';
            }
          }
        }
        defaultNewWallet = address;
      }
      showRegisterForm(referrerAddress, defaultNewWallet, address, provider, contract);
    })();
  }
});

// Registration form with new wallet address input and display of MATIC and token balance - optimized for mobile
window.showRegisterForm = async function(referrerAddress, defaultNewWallet, connectedAddress, provider, contract) {
  let old = document.getElementById('register-form-modal');
  if (old) old.remove();

  // Check registration status of connected wallet
  let isRegistered = false;
  try {
    if (contract && connectedAddress) {
      const userData = await contract.users(connectedAddress);
      isRegistered = userData && userData.activated;
    }
  } catch (e) { isRegistered = false; }

  // Determine input value and readonly state
  let walletInputValue = '';
  let walletInputReadonly = false;
  if (!isRegistered && connectedAddress) {
    walletInputValue = connectedAddress;
    walletInputReadonly = true;
  } else {
    walletInputValue = '';
    walletInputReadonly = false;
  }

  const modal = document.createElement('div');
  modal.id = 'register-form-modal';
  modal.style = `
    position: fixed;
    z-index: 3000;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.7rem;
    box-sizing: border-box;
  `;

  // Determine referrer input value and readonly state
  let referrerInputValue = referrerAddress;
  let referrerInputReadonly = false;
  
  // First check if the connected user is active and has an index
  try {
    if (contract && connectedAddress) {
      const connectedUserData = await contract.users(connectedAddress);
      if (connectedUserData.activated) {
        // If user is active, use their own address as referrer
        referrerInputValue = connectedAddress;
        referrerInputReadonly = true;
      } else {
        // If user is not active, use previous methods
        // First get from URL
        if (typeof getReferrerFromURL === 'function') {
          referrerInputValue = getReferrerFromURL();
        }
        
        // If not in URL, get from localStorage
        if (!referrerInputValue && typeof getReferrerFromStorage === 'function') {
          referrerInputValue = getReferrerFromStorage();
        }
        
        // If still not available, use deployer
        if (!referrerInputValue) {
          if (typeof window.getDeployerAddress === 'function') {
            referrerInputValue = await window.getDeployerAddress(contract);
          } else {
            try {
          referrerInputValue = await contract.deployer();
            } catch (deployerError) {
              console.warn('Error getting deployer:', deployerError);
              // In case of error, use current address
              referrerInputValue = connectedAddress || '0x0000000000000000000000000000000000000000';
            }
          }
        }
      }
    }
  } catch (e) {
    // In case of error, use deployer
    if (typeof window.getDeployerAddress === 'function') {
      referrerInputValue = await window.getDeployerAddress(contract);
    } else {
      try {
    referrerInputValue = await contract.deployer();
      } catch (deployerError) {
        console.warn('Error getting deployer:', deployerError);
        // In case of error, use current address
        referrerInputValue = connectedAddress || '0x0000000000000000000000000000000000000000';
      }
    }
  }

  modal.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #181c2a, #232946);
      padding: 1rem 0.7rem;
      border-radius: 12px;
      box-shadow: 0 10px 24px rgba(0,0,0,0.35);
      width: 100%;
      max-width: 95vw;
      max-height: 95vh;
      overflow-y: auto;
      direction: rtl;
      position: relative;
      border: 1.5px solid #a786ff;
      font-size: 0.97rem;
    ">
      <!-- Header -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.7rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #a786ff;
      ">
        <h3 style="
          color: #00ff88;
          margin: 0;
          font-size: 1.05rem;
          font-weight: bold;
          text-align: center;
          flex: 1;
        ">📝 New Registration</h3>
        <button id="register-form-close" style="
          background: none;
          border: none;
          color: #fff;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.2rem;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">×</button>
      </div>

      <!-- Referrer Input -->
      <div style="
        background: rgba(167, 134, 255, 0.08);
        border: 1px solid #a786ff;
        border-radius: 8px;
        padding: 0.6rem 0.7rem;
        margin-bottom: 0.7rem;
      ">
        <label for="register-referrer-address" style="color: #a786ff; font-weight: bold; margin-bottom: 0.3rem; font-size:0.95em; display:block;">👤 Referrer:</label>
        <input id="register-referrer-address"
          type="text"
          value="${referrerInputValue}"
          ${referrerInputReadonly ? 'readonly' : ''}
          style="
            width: 100%;
            padding: 0.5rem 0.7rem;
            border-radius: 5px;
            border: 1.2px solid #a786ff;
            background: rgba(0,0,0,0.18);
            color: #fff;
            font-family: monospace;
            font-size: 0.95rem;
            direction: ltr;
            text-align: left;
            box-sizing: border-box;
            margin-bottom: 0.1rem;
          "
        />
      </div>

      <!-- Referrer Index Input -->
      <div style="
        background: rgba(167, 134, 255, 0.05);
        border: 1px solid #a786ff;
        border-radius: 8px;
        padding: 0.6rem 0.7rem;
        margin-bottom: 0.7rem;
      ">
        <label for="register-referrer-index" style="color: #a786ff; font-weight: bold; margin-bottom: 0.3rem; font-size:0.95em; display:block;">🔢 Referrer Index (Optional):</label>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <input id="register-referrer-index"
            type="number"
            placeholder="0"
            min="0"
            style="
              flex: 1;
              padding: 0.5rem 0.7rem;
              border-radius: 5px;
              border: 1.2px solid #a786ff;
              background: rgba(0,0,0,0.18);
              color: #fff;
              font-family: monospace;
              font-size: 0.95rem;
              direction: ltr;
              text-align: left;
              box-sizing: border-box;
            "
          />
          <button type="button" id="register-get-referrer-address-btn" style="
            background: linear-gradient(135deg, #00ff88, #00cc66);
            color: #232946;
            font-weight: bold;
            border: none;
            border-radius: 5px;
            padding: 0.5rem 0.8rem;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
          ">🔍 Get Address</button>
        </div>
        <small style="color: #b8c1ec; font-size: 0.8rem; margin-top: 0.2rem; display: block;">Enter referrer index to automatically get wallet address</small>
      </div>

      <!-- New Wallet Input -->
      <div style="margin-bottom: 0.7rem;">
        <label for="register-new-wallet" style="
          display: block;
          color: #fff;
          font-weight: bold;
          margin-bottom: 0.3rem;
          font-size:0.95em;
        ">🔑 New Wallet Address:</label>
        <input id="register-new-wallet" 
          type="text" 
          placeholder="0x..." 
          value="${walletInputValue}"
          ${walletInputReadonly ? 'readonly' : ''}
          style="
            width: 100%;
            padding: 0.7rem 0.7rem;
            border-radius: 7px;
            border: 1.5px solid #a786ff;
            background: rgba(0,0,0,0.18);
            color: #fff;
            font-family: monospace;
            font-size: 0.97rem;
            direction: ltr;
            text-align: left;
            box-sizing: border-box;
            transition: border-color 0.3s;
            height: 2.2rem;
          "
          onfocus="this.style.borderColor='#00ff88'"
          onblur="this.style.borderColor='#a786ff'"
        />
      </div>

      <!-- Balance Info -->
      <div style="
        background: rgba(0, 255, 136, 0.07);
        border: 1px solid #00ff88;
        border-radius: 8px;
        padding: 0.6rem 0.7rem;
        margin-bottom: 0.7rem;
      ">
        <div style="color: #00ff88; font-weight: bold; margin-bottom: 0.5rem; font-size:0.95em;">💰 Your Balances:</div>
        <div style="display: grid; gap: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size:0.95em;">
            <span style="color: #fff;">🟣 POL:</span>
            <span id="register-matic-balance" style="color: #a786ff; font-weight: bold;">Loading...</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size:0.95em;">
            <span style="color: #fff;">🟢 IAM:</span>
            <span id="register-IAM-balance" style="color: #00ff88; font-weight: bold;">Loading...</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size:0.95em;">
            <span style="color: #fff;">💵 DAI:</span>
            <span id="register-dai-balance" style="color: #00ccff; font-weight: bold;">Loading...</span>
          </div>
        </div>
      </div>

      <!-- Required Amount -->
      <div style="
        background: rgba(255, 107, 107, 0.07);
        border: 1px solid #ff6b6b;
        border-radius: 8px;
        padding: 0.6rem 0.7rem;
        margin-bottom: 0.7rem;
      ">
        <div style="color: #ff6b6b; font-weight: bold; margin-bottom: 0.3rem; font-size:0.95em;">⚠️ Required Amount:</div>
        <div id="register-required-dai" style="
          color: #ff6b6b;
          font-size: 1rem;
          font-weight: bold;
          text-align: center;
        ">Loading...</div>
      </div>

      <!-- Action Buttons -->
      <div style="
        display: flex;
        gap: 0.5rem;
        flex-direction: column;
      ">
        <button id="register-form-confirm" style="
          background: linear-gradient(135deg, #00ff88, #00cc66);
          color: #232946;
          font-weight: bold;
          padding: 0.7rem 0;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0, 255, 136, 0.18);
        " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,255,136,0.22)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(0,255,136,0.18)'">
          ✅ Register
        </button>
        <button id="register-form-cancel" style="
          background: linear-gradient(135deg, #a786ff, #8b6bff);
          color: #fff;
          font-weight: bold;
          padding: 0.7rem 0;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(167, 134, 255, 0.18);
        " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(167,134,255,0.22)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(167,134,255,0.18)'">
          ❌ Cancel
        </button>
      </div>

      <!-- Status Message -->
      <div id="register-form-status" style="
        margin-top: 0.7rem;
        padding: 0.5rem;
        border-radius: 6px;
        text-align: center;
        font-weight: bold;
        min-height: 18px;
        font-size:0.97em;
      "></div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close button functionality
  document.getElementById('register-form-close').onclick = () => modal.remove();
  document.getElementById('register-form-cancel').onclick = () => modal.remove();
  
  // Close on background click
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  // Get and display MATIC and token balance and required registration amount
  (async function() {
    try {
      // Ensure provider, contract, and connectedAddress are initialized
      if (!provider || !contract || !connectedAddress) {
        const connection = await window.connectWallet();
        provider = connection.provider;
        contract = connection.contract;
        connectedAddress = connection.address;
      }
      let matic = '-';
      let IAM = '-';
      let dai = '-';
      let requiredDai = '-';

      if (provider && connectedAddress) {
        try {
          const bal = await provider.getBalance(connectedAddress);
          matic = window.ethers ? window.ethers.formatUnits(bal, 18) : bal.toString();
        } catch (e) {
          matic = 'Error getting POL';
        }
      }
      if (contract && connectedAddress) {
        try {
          const IAMBal = await contract.balanceOf(connectedAddress);
          IAM = window.ethers ? window.ethers.formatUnits(IAMBal, 18) : IAMBal.toString();
        } catch (e) {
          IAM = 'Error getting IAM';
        }
        // Get DAI balance
        try {
          const DAI_ABI = ["function balanceOf(address) view returns (uint256)"];
          const daiContract = new ethers.Contract(window.DAI_ADDRESS, DAI_ABI, provider || contract.provider);
          const daiBal = await daiContract.balanceOf(connectedAddress);
          dai = window.ethers ? window.ethers.formatUnits(daiBal, 18) : daiBal.toString(); // DAI has 18 decimals
        } catch (e) {
          dai = 'Error getting DAI';
        }
        // Required registration amount from contract
        try {
          if (window.getRegPrice) {
            const regPrice = await window.getRegPrice(contract);
            let priceValue = parseFloat(window.ethers.formatUnits(regPrice, 18));
            requiredDai = Math.round(priceValue) + ' IAM'; // Round without decimals
          } else {
            requiredDai = '...';
          }
        } catch (e) {
          requiredDai = 'Error';
        }
      }
      document.getElementById('register-matic-balance').textContent = matic;
      document.getElementById('register-IAM-balance').textContent = IAM;
      document.getElementById('register-dai-balance').textContent = dai;
      document.getElementById('register-required-dai').textContent = requiredDai;

      if (window.displayUserBalances) {
        await window.displayUserBalances();
      }
    } catch (e) {
      document.getElementById('register-matic-balance').textContent = '-';
      document.getElementById('register-IAM-balance').textContent = '-';
      document.getElementById('register-dai-balance').textContent = '-';
      document.getElementById('register-required-dai').textContent = '-';
    }
  })();
  
  // Button to get address from index in temporary form
  const registerGetReferrerAddressBtn = document.getElementById('register-get-referrer-address-btn');
  const registerReferrerIndexInput = document.getElementById('register-referrer-index');
  
  if (registerGetReferrerAddressBtn && registerReferrerIndexInput) {
    registerGetReferrerAddressBtn.onclick = async function() {
      try {
        const index = parseInt(registerReferrerIndexInput.value);
        if (isNaN(index) || index < 0) {
          const statusDiv = document.getElementById('register-form-status');
          if (statusDiv) {
            statusDiv.textContent = 'Please enter a valid index';
          }
          return;
        }
        
        registerGetReferrerAddressBtn.textContent = 'Loading...';
        registerGetReferrerAddressBtn.disabled = true;
        
        // Get address from index
        const address = await contract.indexToAddress(BigInt(index));
        
        // Check if user is active
        const userData = await contract.users(address);
        if (!userData.activated) {
          const statusDiv = document.getElementById('register-form-status');
          if (statusDiv) {
            statusDiv.textContent = `User with index ${index} is not active`;
          }
          return;
        }
        
        // Update referrer address field
        const referrerAddressInput = document.getElementById('register-referrer-address');
        if (referrerAddressInput) {
          referrerAddressInput.value = address;
        }
        
        const statusDiv = document.getElementById('register-form-status');
        if (statusDiv) {
          statusDiv.textContent = `✅ Referrer address received: ${address.substring(0, 6)}...${address.substring(38)}`;
        }
        
      } catch (error) {
        console.error('Error getting address from index:', error);
        let errorMessage = 'Error getting address';
        
        if (error.message.includes('reverted')) {
          errorMessage = 'Index is not valid or user does not exist';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network connection error';
        }
        
        const statusDiv = document.getElementById('register-form-status');
        if (statusDiv) {
          statusDiv.textContent = errorMessage;
        }
      } finally {
        registerGetReferrerAddressBtn.textContent = '🔍 Get Address';
        registerGetReferrerAddressBtn.disabled = false;
      }
    };
  }
  
  document.getElementById('register-form-confirm').onclick = async function() {
    const statusDiv = document.getElementById('register-form-status');
    let newWallet = document.getElementById('register-new-wallet').value.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(newWallet)) {
      statusDiv.textContent = 'New wallet address is not valid!';
      return;
    }
    try {
      const { contract } = await window.connectWallet();
      await contract.registerAndActivate(referrerAddress, newWallet);
      statusDiv.textContent = 'Registration completed successfully!';
      
      // Hide main registration button
      if (typeof window.hideMainRegistrationButton === 'function') {
        window.hideMainRegistrationButton();
      }
      
      // Clear profile cache and re-run locking without refresh
      if (typeof window.clearUserProfileCache === 'function') window.clearUserProfileCache();
      setTimeout(() => { 
        if (typeof lockTabsForDeactivatedUsers === 'function') lockTabsForDeactivatedUsers();
        modal.remove();
      }, 1200);
    } catch (e) {
      statusDiv.textContent = 'Registration error: ' + (e && e.message ? e.message : e);
    }
  };
}

function showUserPopup(address, user) {
  // Delegate to the network popup to avoid duplicate implementations
  if (typeof window.networkShowUserPopup === 'function') {
    return window.networkShowUserPopup(address, user);
  }
  // No-op fallback
}

document.addEventListener('DOMContentLoaded', async function() {
    // First apply locks
    await lockTabsForDeactivatedUsers();
    
    // Check user status without showing registration form
    try {
        if (window.getUserProfile) {
            const profile = await loadUserProfileOnce();
            console.log('User profile loaded on page load:', profile);
            
            // Check user status (for logging only)
            const isActive = profile && profile.activated && profile.index && BigInt(profile.index) > 0n;
            
            if (isActive) {
                console.log('User is active');
            } else {
                console.log('User is not active (registration form removed as requested)');
            }
        }
    } catch (error) {
        console.log('Could not check user status on load:', error);
    }
    
    // Restore active tab from localStorage
    const savedTab = localStorage.getItem('currentActiveTab');
    if (savedTab && typeof window.showTab === 'function') {
        // کمی صبر کن تا صفحه کاملاً لود شود
        setTimeout(() => {
            window.showTab(savedTab);
        }, 500);
    }
});

// New function to display registration form for inactive users - ONLY FOR REFERRAL LINKS
window.showRegistrationFormForInactiveUser = async function() {
    console.log('=== showRegistrationFormForInactiveUser: Checking for referral link ===');
    
    // Check if there's a referral link in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = urlParams.get('ref') || urlParams.get('referrer') || urlParams.get('r');
    
    if (referrer && /^0x[a-fA-F0-9]{40}$/.test(referrer)) {
        console.log('✅ Referral link detected:', referrer);
        
        // Check if user is not already registered
        try {
            if (window.getUserProfile) {
                const profile = await loadUserProfileOnce();
                const isActive = profile && profile.activated && profile.index && BigInt(profile.index) > 0n;
                
                if (!isActive) {
                    console.log('✅ User is not registered, showing registration form for referral link');
                    showReferralRegistrationForm(referrer);
                } else {
                    console.log('❌ User is already registered, not showing registration form');
                }
            }
        } catch (error) {
            console.log('Error checking user status for referral registration:', error);
        }
    } else {
        console.log('❌ No valid referral link found in URL');
    }
};

// تابع نمایش فرم ثبت‌نام برای لینک رفرال
function showReferralRegistrationForm(referrerAddress) {
    const modal = document.createElement('div');
    modal.id = 'referral-registration-modal';
    modal.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #232946, #181c2a);
            border: 2px solid #00ff88;
            border-radius: 24px;
            padding: 2.5rem;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            position: relative;
        ">
            <!-- دکمه بستن -->
            <button onclick="closeReferralRegistrationModal()" style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                color: #fff;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: background 0.3s;
            " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">✕</button>
            
            <div style="margin-bottom: 2rem;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">🎯</div>
                <h2 style="color: #00ff88; margin-bottom: 1rem; font-size: 1.5rem;">Registration with Referral Link</h2>
                <p style="color: #ccc; margin-bottom: 1.5rem; line-height: 1.6;">
                    You have entered through a referral link. To register in the IAM network, please connect your wallet.
                </p>
                <div style="background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem;">
                    <div style="color: #00ff88; font-weight: bold; margin-bottom: 0.5rem;">Your Referral:</div>
                    <div style="color: #fff; font-family: monospace; font-size: 0.9rem; word-break: break-all;">
                        ${referrerAddress}
                    </div>
                </div>
            </div>
            
            <div id="referral-registration-content">
                <button id="referral-connect-wallet-btn" style="
                    background: linear-gradient(135deg, #00ff88, #00cc6a);
                    color: #000;
                    border: none;
                    border-radius: 12px;
                    padding: 1rem 2rem;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    width: 100%;
                    margin-bottom: 1rem;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    🔗 Connect Wallet
                </button>
                
                <div id="referral-registration-status" style="margin-top: 1rem;"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener for connect wallet button
    const connectBtn = document.getElementById('referral-connect-wallet-btn');
    const statusDiv = document.getElementById('referral-registration-status');
    
    connectBtn.onclick = async function() {
        try {
            connectBtn.textContent = 'Connecting...';
            connectBtn.disabled = true;
            
            // Connect wallet
            await window.connectWallet();
            
            // Check if user is already registered
            const profile = await loadUserProfileOnce();
            const isActive = profile && profile.activated && profile.index && BigInt(profile.index) > 0n;
            
            if (isActive) {
                statusDiv.innerHTML = '<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;">You are already registered!</div>';
    return;
            }
            
            // Show registration form
            statusDiv.innerHTML = `
                <div style="background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3); border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
                    <div style="color: #00ff88; font-weight: bold; margin-bottom: 0.5rem;">Registration Information:</div>
                    <div style="color: #fff; margin-bottom: 0.5rem;">Referral: ${referrerAddress}</div>
                    <div style="color: #fff; margin-bottom: 0.5rem;">Your Address: ${window.contractConfig.signer.address}</div>
                </div>
                <button id="referral-register-btn" style="
                    background: linear-gradient(135deg, #a786ff, #8b5cf6);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    padding: 1rem 2rem;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    width: 100%;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    🚀 Register in Network
                </button>
            `;
            
            // Add event listener for register button
            const registerBtn = document.getElementById('referral-register-btn');
            registerBtn.onclick = async function() {
                try {
                    registerBtn.textContent = 'Registering...';
                    registerBtn.disabled = true;
                    
                    const { contract } = window.contractConfig;
                    
                    // Register user with referrer
                    const tx = await contract.registerAndActivate(referrerAddress, window.contractConfig.signer.address);
                    await tx.wait();
                    
                    statusDiv.innerHTML = '<div style="color:#00ff88;background:rgba(0,255,136,0.1);padding:0.8rem;border-radius:6px;">✅ Registration completed successfully!</div>';
                    
                    // Close modal after 3 seconds
                    setTimeout(() => {
                        closeReferralRegistrationModal();
                        window.location.reload();
                    }, 3000);
                    
                } catch (error) {
                    console.error('Registration error:', error);
                    statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;">Registration error: ${error.message}</div>`;
                    registerBtn.textContent = '🚀 Register in Network';
                    registerBtn.disabled = false;
                }
            };
            
        } catch (error) {
            console.error('Error connecting wallet for referral registration:', error);
            statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;">Wallet connection error: ${error.message}</div>`;
        } finally {
            connectBtn.textContent = '🔗 Connect Wallet';
            connectBtn.disabled = false;
        }
    };
};

// تابع بستن مودال ثبت‌نام رفرال
window.closeReferralRegistrationModal = function() {
    const modal = document.getElementById('referral-registration-modal');
    if (modal) {
        modal.remove();
    }
};

// تابع مدیریت فرم ثبت‌نام دائمی
window.initializePermanentRegistrationForm = function() {
    const form = document.getElementById('permanent-registration-form');
    const connectBtn = document.getElementById('connect-wallet-btn');
    const registerBtn = document.getElementById('permanent-register-btn');
    const userAddressInput = document.getElementById('permanent-user-address');
    const referrerAddressInput = document.getElementById('permanent-referrer-address');
    const statusDiv = document.getElementById('permanent-registration-status');
    const walletStatusDiv = document.getElementById('wallet-connection-status');
    const balancesDiv = document.getElementById('permanent-balances-display');
    
    if (!form) return;
    
    // دکمه اتصال کیف پول
    if (connectBtn) {
        connectBtn.onclick = async function() {
            try {
                connectBtn.textContent = 'Connecting...';
                connectBtn.disabled = true;
                
                const connection = await connectWallet();
                await updatePermanentRegistrationForm(connection);
                
            } catch (error) {
                console.error('Error connecting wallet:', error);
                statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">Wallet connection error: ${error.message}</div>`;
            } finally {
                connectBtn.textContent = '🔗 Connect Wallet';
                connectBtn.disabled = false;
            }
        };
    }
    
    // دکمه دریافت آدرس از ایندکس
    const getReferrerAddressBtn = document.getElementById('get-referrer-address-btn');
    const referrerIndexInput = document.getElementById('permanent-referrer-index');
    
    if (getReferrerAddressBtn && referrerIndexInput) {
        getReferrerAddressBtn.onclick = async function() {
            try {
                if (!window.contractConfig || !window.contractConfig.contract) {
                    statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">Please connect your wallet first</div>`;
                    return;
                }
                
                const index = parseInt(referrerIndexInput.value);
                if (isNaN(index) || index < 0) {
                    statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">Please enter a valid index</div>`;
                    return;
                }
                
                getReferrerAddressBtn.textContent = 'Getting...';
                getReferrerAddressBtn.disabled = true;
                
                const { contract } = window.contractConfig;
                
                // دریافت آدرس از ایندکس
                const address = await contract.indexToAddress(BigInt(index));
                
                // بررسی فعال بودن کاربر
                const userData = await contract.users(address);
                if (!userData.activated) {
                    statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">User with index ${index} is not active</div>`;
                    return;
                }
                
                // به‌روزرسانی فیلد آدرس معرف
                if (referrerAddressInput) {
                    referrerAddressInput.value = address;
                }
                
                statusDiv.innerHTML = `<div style="color:#00ff88;background:rgba(0,255,136,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">✅ Referrer address received: ${address.substring(0, 6)}...${address.substring(38)}</div>`;
                
            } catch (error) {
                console.error('Error getting address from index:', error);
                let errorMessage = 'Error getting address';
                
                if (error.message.includes('reverted')) {
                    errorMessage = 'Index is not valid or user does not exist';
                } else if (error.message.includes('network')) {
                    errorMessage = 'Network connection error';
                }
                
                statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">${errorMessage}</div>`;
            } finally {
                getReferrerAddressBtn.textContent = '🔍 Get Address';
                getReferrerAddressBtn.disabled = false;
            }
        };
    }
    
    // فرم ثبت‌نام
    form.onsubmit = async function(e) {
        e.preventDefault();

        registerBtn.disabled = true;
        registerBtn.textContent = 'Registering...';

        if (!window.contractConfig || !window.contractConfig.contract) {
            statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">Please connect your wallet first</div>`;
            registerBtn.disabled = false;
            registerBtn.textContent = '🚀 Register';
            return;
        }

        const userAddress = userAddressInput.value.trim();
        const referrerAddress = referrerAddressInput.value.trim();

        if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
            statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">User wallet address is not valid</div>`;
            registerBtn.disabled = false;
            registerBtn.textContent = '🚀 Register';
            return;
        }

        if (!referrerAddress || !/^0x[a-fA-F0-9]{40}$/.test(referrerAddress)) {
            statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">Referrer address is not valid</div>`;
            registerBtn.disabled = false;
            registerBtn.textContent = '🚀 Register';
            return;
        }

        try {
            registerBtn.textContent = 'در حال ثبت‌نام...';
            registerBtn.disabled = true;
            statusDiv.innerHTML = '';
            
            const { contract } = window.contractConfig;
            
            // Check if referrer is valid
            const refData = await contract.users(referrerAddress);
            if (!refData.activated) {
                throw new Error('Referrer is not active');
            }
            
            // Check if new user is not already registered
            const userData = await contract.users(userAddress);
            if (userData.activated) {
                throw new Error('This address is already registered');
            }
            
            // ثبت‌نام
            const tx = await contract.registerAndActivate(referrerAddress, userAddress);
            statusDiv.innerHTML = `<div style="color:#00ff88;background:rgba(0,255,136,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">⏳ Waiting for transaction confirmation...</div>`;
            
            await tx.wait();
            
            statusDiv.innerHTML = `<div style="color:#00ff88;background:rgba(0,255,136,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">✅ Registration completed successfully!</div>`;
            
            // Clear form
            userAddressInput.value = '';
            referrerAddressInput.value = '';
            
            // Update form
            setTimeout(() => {
                updatePermanentRegistrationForm(window.contractConfig);
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration error';
            
            if (error.code === 4001) {
                errorMessage = 'Cancelled by user';
            } else if (error.message.includes('activated')) {
                errorMessage = error.message;
            } else if (error.message.includes('registered')) {
                errorMessage = error.message;
            } else if (error.message.includes('insufficient')) {
                errorMessage = 'Insufficient balance';
            }
            
            statusDiv.innerHTML = `<div style="color:#ff4444;background:rgba(255,68,68,0.1);padding:0.8rem;border-radius:6px;margin-top:0.5rem;">${errorMessage}</div>`;
        } finally {
            registerBtn.textContent = '🚀 Register';
            registerBtn.disabled = false;
        }
    };
    
    // مقداردهی اولیه
    if (window.contractConfig && window.contractConfig.contract) {
        updatePermanentRegistrationForm(window.contractConfig);
    }
};

// تابع به‌روزرسانی فرم ثبت‌نام دائمی
async function updatePermanentRegistrationForm(connection) {
    const walletStatusDiv = document.getElementById('wallet-connection-status');
    const registerBtn = document.getElementById('permanent-register-btn');
    const userAddressInput = document.getElementById('permanent-user-address');
    const referrerAddressInput = document.getElementById('permanent-referrer-address');
    const balancesDiv = document.getElementById('permanent-balances-display');
    const IAMBalanceDiv = document.getElementById('permanent-IAM-balance');
    const maticBalanceDiv = document.getElementById('permanent-matic-balance');
    
    if (!connection || !connection.contract) {
        // Wallet not connected
        if (walletStatusDiv) {
            walletStatusDiv.innerHTML = `
                <div style="color:#ff4444;font-weight:bold;margin-bottom:0.5rem;">⚠️ Wallet not connected</div>
                <p style="color:#b8c1ec;margin:0;font-size:0.9rem;">Please connect your wallet first</p>
                <button type="button" id="connect-wallet-btn" style="background:linear-gradient(90deg,#00ff88,#a786ff);color:#181c2a;font-weight:bold;border:none;border-radius:8px;padding:0.7rem 2rem;font-size:1rem;cursor:pointer;margin-top:0.5rem;transition:all 0.3s;">
                    🔗 Connect Wallet
                </button>
            `;
        }
        
        if (registerBtn) {
            registerBtn.textContent = '🔒 Connect wallet first';
            registerBtn.disabled = true;
        }
        
        if (balancesDiv) {
            balancesDiv.style.display = 'none';
        }
        
        return;
    }
    
    try {
        const { contract, address } = connection;
        
        // Update wallet status
        if (walletStatusDiv) {
            walletStatusDiv.innerHTML = `
                <div style="color:#00ff88;font-weight:bold;margin-bottom:0.5rem;">✅ Wallet connected</div>
                <p style="color:#b8c1ec;margin:0;font-size:0.9rem;">Address: ${address.substring(0, 6)}...${address.substring(38)}</p>
            `;
        }
        
        // Update register button
        if (registerBtn) {
            registerBtn.textContent = '🚀 Register';
            registerBtn.disabled = false;
        }
        
        // Set addresses
        if (userAddressInput) {
            userAddressInput.value = address;
        }
        
        if (referrerAddressInput) {
            // Get referrer address
            let referrerAddress = '';
            try {
                // First check if connected user is active and has index
                const connectedUserData = await contract.users(address);
                if (connectedUserData.activated) {
                    // If user is active, use their own address as referrer
                    referrerAddress = address;
                } else {
                    // If user is not active, use previous methods
                    if (typeof getReferrerFromURL === 'function') {
                        referrerAddress = getReferrerFromURL();
                    }
                    
                    if (!referrerAddress && typeof getReferrerFromStorage === 'function') {
                        referrerAddress = getReferrerFromStorage();
                    }
                    
                    if (!referrerAddress) {
                        if (typeof window.getDeployerAddress === 'function') {
                            referrerAddress = await window.getDeployerAddress(contract);
                        } else {
                            try {
                        referrerAddress = await contract.deployer();
                            } catch (deployerError) {
                                console.warn('Error getting deployer:', deployerError);
                                referrerAddress = address || '0x0000000000000000000000000000000000000000';
                            }
                        }
                    }
                }
            } catch (e) {
                // In case of error, use deployer
                if (typeof window.getDeployerAddress === 'function') {
                    referrerAddress = await window.getDeployerAddress(contract);
                } else {
                    try {
                referrerAddress = await contract.deployer();
                    } catch (deployerError) {
                        console.warn('Error getting deployer:', deployerError);
                        referrerAddress = address || '0x0000000000000000000000000000000000000000';
                    }
                }
            }
            
            referrerAddressInput.value = referrerAddress;
        }
        
        // Function to shorten large numbers
        function formatLargeNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            } else {
                return num.toFixed(2);
            }
        }
        
        // Update balances
        if (balancesDiv && IAMBalanceDiv && maticBalanceDiv) {
            try {
                const [IAMBalance, maticBalance] = await Promise.all([
                    contract.balanceOf(address),
                    connection.provider.getBalance(address)
                ]);
                
                const IAMFormatted = parseFloat(ethers.formatUnits(IAMBalance, 18));
                const maticFormatted = parseFloat(ethers.formatEther(maticBalance));
                
                IAMBalanceDiv.textContent = formatLargeNumber(IAMFormatted);
                IAMBalanceDiv.title = IAMFormatted.toLocaleString('en-US', {maximumFractionDigits: 4}) + ' IAM';
                maticBalanceDiv.textContent = formatLargeNumber(maticFormatted);
                maticBalanceDiv.title = maticFormatted.toLocaleString('en-US', {maximumFractionDigits: 4}) + ' MATIC';
                
                balancesDiv.style.display = 'block';
                
            } catch (error) {
                console.error('Error fetching balances:', error);
                balancesDiv.style.display = 'none';
            }
        }
        
        // Update registration cost
        try {
            const price = await window.getRegPrice(contract);
            const formattedPrice = parseFloat(ethers.formatUnits(price, 18)).toFixed(0);
            const costDisplay = document.getElementById('permanent-registration-cost');
            if (costDisplay) {
                costDisplay.textContent = `${formattedPrice} IAM`;
            }
        } catch (e) {
            console.log('Could not update registration cost:', e);
        }
        
    } catch (error) {
        console.error('Error updating permanent registration form:', error);
    }
}

// Initialize permanent registration form on page load
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.initializePermanentRegistrationForm === 'function') {
        window.initializePermanentRegistrationForm();
    }
});

// Function to load transfer tab
window.loadTransferTab = async function() {
    try {
        console.log('Loading transfer tab...');
        
        // Check wallet connection
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.log('Wallet not connected, loading transfer tab with connection message');
            
            // Show wallet connection message
            const transferContainer = document.querySelector('.transfer-container');
            if (transferContainer) {
                const existingMessage = transferContainer.querySelector('.wallet-connection-message');
                if (!existingMessage) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'wallet-connection-message';
                    messageDiv.style.cssText = `
                        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                        color: #fff;
                        padding: 1.5rem;
                        border-radius: 12px;
                        margin-bottom: 1.5rem;
                        text-align: center;
                        font-weight: bold;
                        border: 2px solid #ff4757;
                        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
                    `;
                    messageDiv.innerHTML = `
                        <div style="font-size: 2rem; margin-bottom: 1rem;">🔒</div>
                        <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">در ترنسفر موجودی شما به ولت متصل نیست</div>
                        <div style="font-size: 1rem; margin-bottom: 1rem; opacity: 0.9;">
                            لطفاً ابتدا کیف پول خود را متصل کنید
                        </div>
                        <div style="display: flex; gap: 0.5rem; justify-content: center;">
                            <button onclick="connectWallet()" style="
                                background: linear-gradient(135deg, #00ff88, #00cc66);
                                color: #232946;
                                border: none;
                                padding: 0.8rem 1.5rem;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: bold;
                                font-size: 1rem;
                            ">اتصال کیف پول</button>
                            <button onclick="refreshWalletConnection()" style="
                                background: linear-gradient(135deg, #ff9500, #ff8000);
                                color: #fff;
                                border: none;
                                padding: 0.8rem 1rem;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: bold;
                                font-size: 0.9rem;
                            ">🔄 تلاش مجدد</button>
                        </div>
                    `;
                    transferContainer.insertBefore(messageDiv, transferContainer.firstChild);
                }
            }
            
            // به‌روزرسانی موجودی‌ها با پیام خطا
            await updateTransferBalances(null, null, null);
            return;
        }
        
        const { contract, address, provider } = window.contractConfig;
        console.log('Contract and address available, updating balances...');
        
        // حذف پیام اتصال کیف پول اگر وجود دارد
        const existingMessage = document.querySelector('.wallet-connection-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // به‌روزرسانی موجودی‌ها
        await updateTransferBalances(contract, address, provider);
        
        // شروع به‌روزرسانی خودکار
        window.startTransferBalanceAutoRefresh();
        

        
        console.log('Transfer tab loaded successfully');
        
    } catch (error) {
        console.error('Error loading transfer tab:', error);
    }
};

// تابع به‌روزرسانی موجودی‌ها در قسمت ترنسفر
async function updateTransferBalances(contract, address, provider) {
    try {
        const daiBalanceDiv = document.getElementById('transfer-dai-balance');
        const polyBalanceDiv = document.getElementById('transfer-poly-balance');
        const IAMBalanceDiv = document.getElementById('transfer-IAM-balance');
        
        if (!daiBalanceDiv || !polyBalanceDiv || !IAMBalanceDiv) {
            console.log('Transfer balance elements not found');
            return;
        }
        
        // بررسی اتصال کیف پول
        if (!contract || !address || !provider) {
            console.log('Wallet not connected, showing connection message');
            
            // نمایش پیام اتصال کیف پول
            const balanceContainer = document.querySelector('.transfer-container .balance-check');
            if (balanceContainer) {
                const existingMessage = balanceContainer.querySelector('.wallet-connection-message');
                if (!existingMessage) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'wallet-connection-message';
                    messageDiv.style.cssText = `
                        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                        color: #fff;
                        padding: 1rem;
                        border-radius: 8px;
                        margin-bottom: 1rem;
                        text-align: center;
                        font-weight: bold;
                        border: 2px solid #ff4757;
                    `;
                    messageDiv.innerHTML = `
                        <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">🔒</div>
                        <div>در ترنسفر موجودی شما به ولت متصل نیست</div>
                        <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">
                            لطفاً ابتدا کیف پول خود را متصل کنید
                        </div>
                    `;
                    balanceContainer.insertBefore(messageDiv, balanceContainer.firstChild);
                }
            }
            
            // تنظیم مقادیر به حالت خطا
            polyBalanceDiv.textContent = 'متصل نیست';
            IAMBalanceDiv.textContent = 'متصل نیست';
            daiBalanceDiv.textContent = 'متصل نیست';
            return;
        }
        
        // حذف پیام اتصال کیف پول اگر وجود دارد
        const existingMessage = document.querySelector('.wallet-connection-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        console.log('Updating transfer balances for address:', address);
        
        // دریافت موجودی POL (MATIC)
        let polyBalance = '-';
        try {
            const polyBal = await provider.getBalance(address);
            polyBalance = parseFloat(ethers.formatEther(polyBal)).toFixed(4);
            console.log('POL balance:', polyBalance);
        } catch (e) {
            console.error('Error getting POL balance:', e);
            polyBalance = 'خطا';
        }
        
        // تابع کوتاه کردن اعداد بزرگ
        function formatLargeNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            } else {
                return num.toFixed(2);
            }
        }
        
        // دریافت موجودی IAM
        let IAMBalance = '-';
        let IAMUsdValue = 0;
        let IAMFullAmount = 0;
        try {
            const IAMBal = await contract.balanceOf(address);
            IAMFullAmount = parseFloat(ethers.formatUnits(IAMBal, 18));
            IAMBalance = formatLargeNumber(IAMFullAmount);
            console.log('IAM balance:', IAMBalance);
            
            // محاسبه معادل دلاری IAM
            try {
                if (typeof contract.getTokenPrice === 'function') {
                    const tokenPriceRaw = await contract.getTokenPrice();
                    const tokenPrice = Number(ethers.formatUnits(tokenPriceRaw, 18));
                    IAMUsdValue = IAMFullAmount * tokenPrice;
                    console.log('IAM USD value:', IAMUsdValue);
                }
            } catch (e) {
                console.log('خطا در دریافت قیمت توکن:', e);
            }
        } catch (e) {
            console.error('Error getting IAM balance:', e);
            IAMBalance = 'خطا';
        }
        
        // دریافت موجودی DAI
        let daiBalance = '-';
        try {
            const DAI_ADDRESS = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'; // آدرس صحیح DAI در قرارداد
            const DAI_ABI = ["function balanceOf(address) view returns (uint256)"];
            const daiContract = new ethers.Contract(DAI_ADDRESS, DAI_ABI, provider);
            const daiBal = await daiContract.balanceOf(address);
            daiBalance = parseFloat(ethers.formatUnits(daiBal, 18)).toFixed(2); // DAI has 18 decimals
            console.log('DAI balance:', daiBalance);
                } catch (e) {
          console.error('Error getting DAI balance:', e);
          daiBalance = 'خطا';
        }
        
        // به‌روزرسانی نمایش + ذخیره مقدار خام برای استفاده دکمه «حداکثر»
        polyBalanceDiv.textContent = polyBalance;
        polyBalanceDiv.dataset.value = (isNaN(Number(polyBalance)) ? '0' : String(polyBalance));
        IAMBalanceDiv.textContent = IAMBalance;
        if (IAMFullAmount > 0) {
            IAMBalanceDiv.title = IAMFullAmount.toLocaleString('en-US', {maximumFractionDigits: 4}) + ' IAM';
        }
        // مقدار کامل IAM را در data ذخیره کن تا از نمایش کوتاه‌شده (K/M) مستقل باشیم
        IAMBalanceDiv.dataset.value = String(IAMFullAmount);
        daiBalanceDiv.textContent = daiBalance;
        daiBalanceDiv.dataset.value = (isNaN(Number(daiBalance)) ? '0' : String(daiBalance));
        
        // نمایش معادل دلاری IAM
        const IAMUsdDiv = document.getElementById('transfer-IAM-usd');
        if (IAMUsdDiv && IAMBalance !== '-' && IAMBalance !== 'خطا') {
            IAMUsdDiv.textContent = `≈ $${formatLargeNumber(IAMUsdValue)}`;
        } else if (IAMUsdDiv) {
            IAMUsdDiv.textContent = '-';
        }
        
        console.log('Transfer balances updated successfully');
        
    } catch (error) {
        console.error('Error updating transfer balances:', error);
        
        // نمایش پیام خطا
        const balanceContainer = document.querySelector('.transfer-container .balance-check');
        if (balanceContainer) {
            const existingMessage = balanceContainer.querySelector('.wallet-connection-message');
            if (!existingMessage) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'wallet-connection-message';
                messageDiv.style.cssText = `
                    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                    color: #fff;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    text-align: center;
                    font-weight: bold;
                    border: 2px solid #ff4757;
                `;
                messageDiv.innerHTML = `
                    <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">⚠️</div>
                    <div>خطا در بارگذاری موجودی‌ها</div>
                    <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">
                        لطفاً دوباره تلاش کنید
                    </div>
                `;
                balanceContainer.insertBefore(messageDiv, balanceContainer.firstChild);
            }
        }
    }
}

// تابع به‌روزرسانی موجودی‌های ترنسفر در زمان اتصال کیف پول
window.updateTransferBalancesOnConnect = async function() {
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.log('Wallet not connected, cannot update transfer balances');
            return;
        }
        
        const { contract, address, provider } = window.contractConfig;
        
        // حذف پیام اتصال کیف پول اگر وجود دارد
        const existingMessage = document.querySelector('.wallet-connection-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        await updateTransferBalances(contract, address, provider);
        
        // شروع به‌روزرسانی خودکار اگر هنوز شروع نشده
        if (!window.transferBalanceInterval) {
            window.startTransferBalanceAutoRefresh();
        }
        
    } catch (error) {
        console.error('Error updating transfer balances on connect:', error);
    }
};

// فراخوانی تابع به‌روزرسانی موجودی‌های ترنسفر در زمان اتصال کیف پول
document.addEventListener('DOMContentLoaded', function() {
    // بررسی اتصال کیف پول و به‌روزرسانی موجودی‌های ترنسفر
    if (window.contractConfig && window.contractConfig.contract) {
        setTimeout(() => {
            window.updateTransferBalancesOnConnect();
        }, 1000);
    }
    
    // دکمه بروزرسانی دستی حذف شد - اکنون بروزرسانی خودکار است
    
    // اضافه کردن event listener برای دکمه اتصال کیف پول در تب ترنسفر
    document.addEventListener('click', function(e) {
        if (e.target && e.target.onclick && e.target.onclick.toString().includes('connectWallet()')) {
            // اگر دکمه اتصال کیف پول کلیک شد، بعد از اتصال موجودی‌ها را به‌روزرسانی کن
            setTimeout(() => {
                if (window.updateTransferBalancesOnConnect) {
                    window.updateTransferBalancesOnConnect();
                }
            }, 2000);
        }
    });
    
    // حذف دکمه شناور ایندکس در زمان بارگذاری صفحه
    setTimeout(() => {
        if (window.removeFloatingIAMId) {
            window.removeFloatingIAMId();
        }
    }, 1000);
});

// تابع به‌روزرسانی خودکار موجودی‌های ترنسفر
window.startTransferBalanceAutoRefresh = function() {
    if (window.transferBalanceInterval) {
        clearInterval(window.transferBalanceInterval);
    }
    
    /* // Transfer balance interval غیرفعال شده
    window.transferBalanceInterval = setInterval(async () => {
        try {
            if (window.contractConfig && window.contractConfig.contract) {
                const { contract, address, provider } = window.contractConfig;
                await updateTransferBalances(contract, address, provider);
            }
        } catch (error) {
            console.error('Error in auto-refresh transfer balances:', error);
        }
    }, 30000); // غیرفعال شده برای بهینه‌سازی - سیستم مرکزی جایگزین شده
    */
    console.log('⚠️ Transfer balance interval غیرفعال شده برای بهینه‌سازی عملکرد');
};

// تابع توقف به‌روزرسانی خودکار
window.stopTransferBalanceAutoRefresh = function() {
    if (window.transferBalanceInterval) {
        clearInterval(window.transferBalanceInterval);
        window.transferBalanceInterval = null;
    }
};

// تابع تولید ID بر اساس ایندکس کاربر (فرمت: IAM00000 + index)
function generateIAMId(index) {
    try {
        const asBigInt = (typeof index === 'bigint') ? index : BigInt(index ?? 0);
        const padded = asBigInt.toString().padStart(5, '0');
        return 'IAM' + padded;
    } catch (e) {
        return 'IAM00000';
    }
}

// تعریف تابع generateIAMId در window برای استفاده در فایل‌های دیگر
window.generateIAMId = generateIAMId;

// تابع نمایش ID در گوشه بالا سمت راست - غیرفعال شده
function displayIAMIdInCorner(index) {
    // حذف ID قبلی اگر وجود دارد
    const existingId = document.getElementById('IAM-id-corner');
    if (existingId) existingId.remove();
    
    // غیرفعال شده - دیگر نمایش داده نمی‌شود
    return;
    
    /*
    if (!index || index === 0) return;
    
    const IAMId = generateIAMId(index);
    
    // ایجاد عنصر ID
    const idElement = document.createElement('div');
    idElement.id = 'IAM-id-corner';
    idElement.textContent = IAMId;
    idElement.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: linear-gradient(135deg, #00ff88, #a786ff);
        color: #181c2a;
        padding: 8px 12px;
        border-radius: 8px;
        font-family: monospace;
        font-weight: bold;
        font-size: 0.9rem;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0,255,136,0.3);
        border: 1px solid rgba(167,134,255,0.3);
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    // اضافه کردن hover effect
    idElement.onmouseover = function() {
        this.style.transform = 'scale(1.05)';
        this.style.boxShadow = '0 4px 12px rgba(0,255,136,0.4)';
    };
    
    idElement.onmouseout = function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 2px 8px rgba(0,255,136,0.3)';
    };
    
    // Click to copy
    idElement.onclick = function() {
        navigator.clipboard.writeText(IAMId);
        const originalText = this.textContent;
        this.textContent = 'Copied!';
        this.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        setTimeout(() => {
            this.textContent = originalText;
            this.style.background = 'linear-gradient(135deg, #00ff88, #a786ff)';
        }, 1000);
    };
    
    document.body.appendChild(idElement);
    */
}

// Function to update ID display in all sections
function updateIAMIdDisplay(index) {
    const IAMId = generateIAMId(index);
    
    // Update in profile
    const profileIndexEl = document.getElementById('profile-index');
    if (profileIndexEl) {
        profileIndexEl.textContent = IAMId;
    }
    
    // Update in dashboard
    const dashboardIndexEl = document.getElementById('dashboard-user-index');
    if (dashboardIndexEl) {
        dashboardIndexEl.textContent = IAMId;
    }
    
    // Display user information section in dashboard
    const dashboardUserInfo = document.getElementById('dashboard-user-info');
    if (dashboardUserInfo) {
        dashboardUserInfo.style.display = 'block';
        
        // Update wallet address
        const dashboardUserAddress = document.getElementById('dashboard-user-address');
        if (dashboardUserAddress && window.contractConfig && window.contractConfig.address) {
            dashboardUserAddress.textContent = shortenAddress(window.contractConfig.address);
        }
        
        // Update status
        const dashboardUserStatus = document.getElementById('dashboard-user-status');
        if (dashboardUserStatus) {
            dashboardUserStatus.textContent = 'Active';
            dashboardUserStatus.style.color = '#00ff88';
        }
    }
    
    // Update in network
    const networkIndexEl = document.getElementById('network-user-index');
    if (networkIndexEl) {
        networkIndexEl.textContent = IAMId;
    }
    
    // Display in corner - disabled
    // displayIAMIdInCorner(index);
}

// Function to remove floating index button
window.removeFloatingIAMId = function() {
    const existingId = document.getElementById('IAM-id-corner');
    if (existingId) {
        existingId.remove();
        console.log('✅ Floating index removed');
    }
};

// Function to clear cache and retry wallet connection
window.refreshWalletConnection = async function() {
    try {
        console.log('🔄 Refreshing wallet connection...');
        
        // Clear caches
        if (window.clearConnectionCache) {
            window.clearConnectionCache();
        }
        
        // Clear global variables
        if (typeof connectionCache !== 'undefined') {
            connectionCache = null;
        }
        if (typeof globalConnectionPromise !== 'undefined') {
            globalConnectionPromise = null;
        }
        if (typeof pendingAccountRequest !== 'undefined') {
            pendingAccountRequest = null;
        }
        
        // Clear contractConfig
        if (window.contractConfig) {
            window.contractConfig.provider = null;
            window.contractConfig.signer = null;
            window.contractConfig.contract = null;
            window.contractConfig.address = null;
        }
        
        // تلاش مجدد اتصال
        const connection = await window.connectWallet();
        
        if (connection && connection.contract && connection.address) {
            console.log('✅ Wallet connection refreshed successfully');
            
            // رفرش شبکه بعد از اتصال مجدد
            setTimeout(async () => {
                try {
                    await window.refreshNetworkAfterConnection(connection);
                } catch (error) {
                    console.warn('Error refreshing network data after wallet refresh:', error);
                }
            }, 1000); // 1 ثانیه صبر کن
            
            return connection;
        } else {
            throw new Error('اتصال کیف پول ناموفق بود');
        }
        
    } catch (error) {
        console.error('❌ Error refreshing wallet connection:', error);
        throw error;
    }
};









// تابع دریافت کل پوینت‌های باینری از قرارداد
window.getTotalBinaryPoints = async function() {
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.error('❌ قرارداد متصل نیست');
            return 0;
        }
        
        const contract = window.contractConfig.contract;
        const result = await contract.totalClaimablePoints();
        // استفاده از ethers.formatUnits برای تبدیل صحیح BigInt به عدد
        const totalPoints = parseInt(ethers.formatUnits(result, 0));
        
        console.log(`📊 کل پوینت‌های باینری: ${totalPoints.toLocaleString('en-US')}`);
        return totalPoints;
        
    } catch (error) {
        console.error('❌ خطا در دریافت پوینت‌های باینری:', error);
        return 0;
    }
};





// تابع بررسی اعتبار آدرس اتریوم
function isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Function to check Ethereum address validity
function isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Function to update contract statistics
async function updateContractStats() {
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            return;
        }
        
        const contract = window.contractConfig.contract;
        
        // Update contract statistics
        const [totalSupply, daiBalance, tokenBalance, wallets, totalPoints] = await Promise.all([
            contract.totalSupply(),
            contract.getContractdaiBalance ? contract.getContractdaiBalance() :
            (new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, contract.provider)).balanceOf(contract.target),
            contract.balanceOf ? contract.balanceOf(contract.target) : Promise.resolve(0),
            contract.wallets(),
            contract.totalClaimableBinaryPoints()
        ]);
        
        const setFormatted = (id, val, decimals = 18, suffix = '') => { 
            const el = document.getElementById(id); 
            if (el) {
                const num = Number(val) / Math.pow(10, decimals);
                const formatted = num.toLocaleString('en-US', {maximumFractionDigits: 2}) + suffix;
                el.textContent = formatted;
            } 
        };
        
        setFormatted('circulating-supply', totalSupply, 18, '');
        setFormatted('dashboard-dai-balance', daiBalance, 18, '');
        setFormatted('contract-token-balance', tokenBalance, 18, '');
        setFormatted('dashboard-wallets-count', wallets, 0, '');
        
    } catch (e) {
        console.warn('Error updating contract stats:', e);
    }
}

// Function to update user status bar
window.updateUserStatusBar = async function() {
    console.log('🔄 updateUserStatusBar function called');
    try {
        const userStatusBar = document.getElementById('user-status-bar');
        const userStatusIdValue = document.getElementById('user-status-id-value');
        const userStatusWallet = document.getElementById('user-status-wallet');
        const userStatusLikes = document.getElementById('user-status-likes');
        const userStatusDislikes = document.getElementById('user-status-dislikes');
        const userStatusConnection = document.getElementById('user-status-connection');
        const userStatusPulse = document.getElementById('user-status-pulse');

        console.log('🔍 User status bar elements found:', {
            userStatusBar: !!userStatusBar,
            userStatusIdValue: !!userStatusIdValue,
            userStatusWallet: !!userStatusWallet,
            userStatusLikes: !!userStatusLikes,
            userStatusDislikes: !!userStatusDislikes,
            userStatusConnection: !!userStatusConnection,
            userStatusPulse: !!userStatusPulse
        });

        // Check for required elements (connection and pulse are optional)
        if (!userStatusBar || !userStatusIdValue || !userStatusLikes || !userStatusDislikes) {
            console.warn('Required user status bar elements not found:', {
                userStatusBar: !!userStatusBar,
                userStatusIdValue: !!userStatusIdValue,
                userStatusWallet: !!userStatusWallet,
                userStatusLikes: !!userStatusLikes,
                userStatusDislikes: !!userStatusDislikes
            });
            // Set default values for available elements
            if (userStatusBar) userStatusBar.style.display = 'block';
            if (userStatusIdValue) userStatusIdValue.textContent = 'Not Connected';
            if (userStatusWallet) userStatusWallet.textContent = 'Not Connected';
            if (userStatusLikes) userStatusLikes.textContent = '0';
            if (userStatusDislikes) userStatusDislikes.textContent = '0';
            return;
        }

        if (!window.contractConfig || !window.contractConfig.signer || !window.contractConfig.contract) {
            console.log('🔍 Wallet not connected, showing default values');
            // Show status bar even when wallet is not connected, but with default values
            if (userStatusBar) userStatusBar.style.display = 'block';
            if (userStatusIdValue) userStatusIdValue.textContent = 'Not Connected';
            if (userStatusWallet) userStatusWallet.textContent = 'Not Connected';
            if (userStatusLikes) userStatusLikes.textContent = '0';
            if (userStatusDislikes) userStatusDislikes.textContent = '0';
            const userStarRating = document.getElementById('user-star-rating');
            if (userStarRating) userStarRating.style.display = 'none';
            return;
        }

        const address = window.contractConfig.signer.address;
        let contract = window.contractConfig.contract;

        // Ensure contract has the correct ABI by creating a fresh instance if needed
        if (!contract.users || !contract.getVoteStatus) {
            try {
                const { ethers } = await import('https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js');
                contract = new ethers.Contract(window.contractConfig.contract.address, window.IAM_ABI, window.contractConfig.signer);
            } catch (error) {
                console.warn('Error creating fresh contract instance:', error);
            }
        }

        userStatusBar.style.display = 'block';

        // Update wallet address display
        if (userStatusWallet && address) {
            const shortAddress = address.substring(0, 6) + '...' + address.substring(address.length - 4);
            userStatusWallet.textContent = shortAddress;
            userStatusWallet.title = address;
            
            // Add click to copy functionality
            userStatusWallet.onclick = async function() {
                try {
                    await navigator.clipboard.writeText(address);
                    
                    // Visual feedback
                    const originalText = this.textContent;
                    const originalColor = this.style.color;
                    const originalBackground = this.style.background;
                    
                    this.textContent = '✅ Copied!';
                    this.style.color = '#00ff88';
                    this.style.background = 'rgba(0, 255, 136, 0.1)';
                    this.style.border = '1px solid rgba(0, 255, 136, 0.5)';
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.style.color = originalColor;
                        this.style.background = originalBackground;
                        this.style.border = 'none';
                    }, 2000);
                } catch (err) {
                    console.error('Error copying address:', err);
                    
                    // Error feedback
                    const originalText = this.textContent;
                    const originalColor = this.style.color;
                    
                    this.textContent = '❌ Error';
                    this.style.color = '#ff4444';
                    
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.style.color = originalColor;
                    }, 2000);
                }
            };
        }

        try {
            const userData = await contract.users(address);
            if (userData && userData.index && userData.index > 0) {
                const formattedUserId = 'IAM' + userData.index.toString().padStart(5, '0');
                if (userStatusIdValue) userStatusIdValue.textContent = formattedUserId;

                const voteStatus = await contract.getVoteStatus(address);
                if (voteStatus && voteStatus.length >= 2) {
                    if (userStatusLikes) userStatusLikes.textContent = voteStatus[0].toString();
                    if (userStatusDislikes) userStatusDislikes.textContent = voteStatus[1].toString();
                } else {
                    if (userStatusLikes) userStatusLikes.textContent = '0';
                    if (userStatusDislikes) userStatusDislikes.textContent = '0';
                }

                // Calculate star rating based on binaryPointsClaimed
                const userStarRating = document.getElementById('user-star-rating');
                const userStarCount = document.getElementById('user-star-count');

                if (userData.binaryPointsClaimed && userData.binaryPointsClaimed.toString() !== '0') {
                    const points = parseInt(userData.binaryPointsClaimed.toString());
                    let starCount = 0;
                    if (points >= 10000) { starCount = 5; }
                    else if (points >= 1000) { starCount = 4; }
                    else if (points >= 100) { starCount = 3; }
                    else if (points >= 10) { starCount = 2; }
                    else if (points >= 1) { starCount = 1; }

                    userStarCount.innerHTML = '';
                    for (let i = 0; i < starCount; i++) {
                        const starSpan = document.createElement('span');
                        starSpan.textContent = '⭐';
                        starSpan.style.color = '#ffd700';
                        starSpan.style.fontSize = '0.8rem';
                        userStarCount.appendChild(starSpan);
                    }
                    userStarRating.style.display = starCount > 0 ? 'flex' : 'none';
                } else {
                    userStarCount.innerHTML = '';
                    userStarRating.style.display = 'none';
                }
                updateCardSizes();
            } else {
                if (userStatusIdValue) userStatusIdValue.textContent = 'Not Registered';
                if (userStatusLikes) userStatusLikes.textContent = '0';
                if (userStatusDislikes) userStatusDislikes.textContent = '0';
                const userStarRating = document.getElementById('user-star-rating');
                if (userStarRating) userStarRating.style.display = 'none';
                // User is registered but not active
                console.log('🔍 User is registered but not active');
            }
        } catch (error) {
            console.warn('Error getting user data:', error);
            console.warn('❌ Error getting user data:', error);
            if (userStatusIdValue) userStatusIdValue.textContent = 'Error';
            if (userStatusLikes) userStatusLikes.textContent = '0';
            if (userStatusDislikes) userStatusDislikes.textContent = '0';
        }

        console.log('✅ User status bar updated successfully');

    } catch (error) {
        console.warn('❌ Error updating user status bar:', error);
        // Ensure status bar is visible even if there's an error
        const userStatusBar = document.getElementById('user-status-bar');
        if (userStatusBar) {
            userStatusBar.style.display = 'block';
        }
    }
};

// Function to update card sizes based on content
function updateCardSizes() {
    try {
        const userIdCard = document.querySelector('.user-id-card');
        const walletCard = document.querySelector('.wallet-card');
        const likesCard = document.querySelector('.likes-card');
        const dislikesCard = document.querySelector('.dislikes-card');

        const userStatusIdValue = document.getElementById('user-status-id-value');
        const userStatusWallet = document.getElementById('user-status-wallet');
        const userStatusLikes = document.getElementById('user-status-likes');
        const userStatusDislikes = document.getElementById('user-status-dislikes');

        const userIdLength = userStatusIdValue ? userStatusIdValue.textContent.length : 0;
        const walletLength = userStatusWallet ? userStatusWallet.textContent.length : 0;
        const likesLength = userStatusLikes ? userStatusLikes.textContent.length : 0;
        const dislikesLength = userStatusDislikes ? userStatusDislikes.textContent.length : 0;

        function getContentLengthCategory(length) {
            if (length <= 5) return 'short';
            if (length <= 10) return 'medium';
            if (length <= 20) return 'long';
            return 'very-long';
        }

        if (userIdCard) { userIdCard.setAttribute('data-content-length', getContentLengthCategory(userIdLength)); }
        if (walletCard) { walletCard.setAttribute('data-content-length', getContentLengthCategory(walletLength)); }
        if (likesCard) { likesCard.setAttribute('data-content-length', getContentLengthCategory(likesLength)); }
        if (dislikesCard) { dislikesCard.setAttribute('data-content-length', getContentLengthCategory(dislikesLength)); }

        [userIdCard, walletCard, likesCard, dislikesCard].forEach(card => {
            if (card) { card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'; }
        });
    } catch (error) { console.warn('Error updating card sizes:', error); }
}

// Initialize user status bar on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DOMContentLoaded: Initializing user status bar...');
    
    // Check if elements exist
    const userStatusBar = document.getElementById('user-status-bar');
    const userStatusIdValue = document.getElementById('user-status-id-value');
    const userStatusWallet = document.getElementById('user-status-wallet');
    const userStatusLikes = document.getElementById('user-status-likes');
    const userStatusDislikes = document.getElementById('user-status-dislikes');
    
    console.log('🔍 User status bar elements found:', {
        userStatusBar: !!userStatusBar,
        userStatusIdValue: !!userStatusIdValue,
        userStatusWallet: !!userStatusWallet,
        userStatusLikes: !!userStatusLikes,
        userStatusDislikes: !!userStatusDislikes
    });
    
    // Update user status bar immediately
    if (typeof window.updateUserStatusBar === 'function') {
        console.log('✅ updateUserStatusBar function found, calling it...');
        window.updateUserStatusBar();
    } else {
        console.log('❌ updateUserStatusBar function not found');
    }
    
    // Update user status bar after a short delay
    setTimeout(() => {
        if (typeof window.updateUserStatusBar === 'function') {
            console.log('🔄 Calling updateUserStatusBar after 2 seconds...');
            window.updateUserStatusBar();
        }
    }, 2000);

    // Update user status bar every 30 seconds
    setInterval(() => {
        if (typeof window.updateUserStatusBar === 'function') {
            window.updateUserStatusBar();
        }
    }, 30000);
});

// Add test function to window for debugging
window.testUserStatusBar = function() {
    console.log('🧪 Testing user status bar...');
    console.log('🔍 Contract config:', !!window.contractConfig);
    if (window.contractConfig) {
        console.log('🔍 Contract:', !!window.contractConfig.contract);
        console.log('🔍 Signer:', !!window.contractConfig.signer);
        console.log('🔍 Address:', window.contractConfig.address);
    }
    
    if (typeof window.updateUserStatusBar === 'function') {
        console.log('✅ Calling updateUserStatusBar...');
        window.updateUserStatusBar();
    } else {
        console.log('❌ updateUserStatusBar function not found');
    }
};









