// register.js - Registration and upgrade management
let isRegisterLoading = false;
let registerDataLoaded = false;
let registerTabSelected = false;

document.addEventListener('DOMContentLoaded', function() {
    // Register section loaded, waiting for wallet connection...
});

// Function to get and display the required token amount for registration
window.updateRegisterRequiredAmount = function() {
    const el = document.getElementById('register-required-usdc') || document.getElementById('register-IAM-required');
    if (el) el.innerText = '100 IAM';
};

// Function to load registration data
async function loadRegisterData(contract, address, tokenPriceUSDFormatted) {
    if (isRegisterLoading || registerDataLoaded) {
        return;
    }
    
    // Only if register tab is selected
    if (!registerTabSelected) {
        return;
    }
    
    isRegisterLoading = true;
    
    try {
        
        // Check wallet connection
        if (!window.contractConfig || !window.contractConfig.contract) {
            return;
        }
        
        const { contract, address } = window.contractConfig;
        
        // Get user data
        const userData = await contract.users(address);
        
        // Change to USDC:
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
        const usdcBalance = await usdcContract.balanceOf(address);
        const usdcDecimals = await usdcContract.decimals();
        const usdcBalanceFormatted = ethers.formatUnits(usdcBalance, usdcDecimals);
        
        // Get prices and registration information
        // Try to get registration price from contract, fallback to hardcoded value
        let regprice;
        try {
            // First try getRegPrice (new function)
            if (typeof contract.getRegPrice === 'function') {
                regprice = await contract.getRegPrice();
            }

        } catch (e) {
            regprice = ethers.parseUnits('100', 18);
        }
        
        const tokenPriceMatic = await contract.getTokenPrice(); // Token price in MATIC
        const tokenPriceFormatted = ethers.formatUnits(tokenPriceMatic, 18);
        // IAM/USDC price (directly from contract)
        const tokenPriceUSDFormatted = tokenPriceFormatted;
        const regpriceFormatted = ethers.formatUnits(regprice, 18); // Required token amount
        const regpriceUSD = ethers.formatUnits(regprice, 8); // Dollar amount
        // Calculate token amount for different values (USDC is always $1)
        const oneCentTokens = 0.01 / parseFloat(tokenPriceFormatted);
        const oneCentTokensFormatted = oneCentTokens.toFixed(6);
        const tenCentsInTokens = 0.1 / parseFloat(tokenPriceFormatted);
        const tenCentsInTokensFormatted = tenCentsInTokens.toFixed(6);
        const twelveCentsInTokens = 0.12 / parseFloat(tokenPriceFormatted);
        const twelveCentsInTokensFormatted = twelveCentsInTokens.toFixed(6);
        // Calculate dollar value of balance
        const IAMBalanceUSD = (parseFloat(usdcBalanceFormatted) * parseFloat(tokenPriceUSDFormatted)).toFixed(2);
        // Update balance display
        await window.displayUserBalances();
        // Check registration status
        if (userData && userData.index && BigInt(userData.index) > 0n) {
            // Only show upgrade form
            const profileContainer = document.querySelector('#main-register .profile-container');
            if (profileContainer) profileContainer.style.display = 'none';
            const upgradeForm = document.getElementById('upgrade-form');
            if (upgradeForm) upgradeForm.style.display = 'block';
            // Disable referrer input
            const refInput = document.getElementById('referrer-address');
            if (refInput) refInput.readOnly = true;
            await loadUpgradeData(contract, address, tokenPriceUSDFormatted);
            // Show new register button
            const newRegisterBtn = document.getElementById('new-register-btn');
            if (newRegisterBtn) newRegisterBtn.style.display = '';
        } else {
            // Only show simple registration form
            const profileContainer = document.querySelector('#main-register .profile-container');
            if (profileContainer) profileContainer.style.display = '';
            const upgradeForm = document.getElementById('upgrade-form');
            if (upgradeForm) upgradeForm.style.display = 'none';
            // Enable referrer input
            const refInput = document.getElementById('referrer-address');
            if (refInput) refInput.readOnly = false;
            // Hide new register button
            const newRegisterBtn = document.getElementById('new-register-btn');
            if (newRegisterBtn) newRegisterBtn.style.display = 'none';
        }
        
        registerDataLoaded = true;
    } catch (error) {
        showRegisterError("Error loading registration data");
    } finally {
        isRegisterLoading = false;
    }
}

// Function to set register tab status
window.setRegisterTabSelected = function(selected) {
    registerTabSelected = selected;
    if (selected && !registerDataLoaded) {
        // Reset loading status for reload
        registerDataLoaded = false;
        isRegisterLoading = false;
    }
}

// Function to load upgrade data
async function loadUpgradeData(contract, address, tokenPriceUSDFormatted) {
    try {
        // Update upgrade calculations
        await updateUpgradeCalculations();
    } catch (error) {
        console.error("Error loading upgrade data:", error);
    }
}

// Function to update upgrade calculations
async function updateUpgradeCalculations() {
    try {
        const { contract, address } = window.contractConfig;
        const userData = await contract.users(address);
        
        if (userData && userData.index && BigInt(userData.index) > 0n) {
            const currentLevel = parseInt(userData.level);
            const nextLevel = currentLevel + 1;
            
            // Get upgrade requirements
            const upgradeRequirements = await contract.getUpgradeRequirements(nextLevel);
            const requiredPoints = upgradeRequirements.requiredPoints;
            const pointsGain = upgradeRequirements.pointsGain;
            const newCap = upgradeRequirements.newCap;
            
            // Update display
            const pointsGainElement = document.getElementById('upgrade-points-gain');
            if (pointsGainElement) {
                pointsGainElement.textContent = `${pointsGain} points (new cap: ${newCap})`;
            }
            
            const requiredPointsElement = document.getElementById('upgrade-required-points');
            if (requiredPointsElement) {
                requiredPointsElement.textContent = requiredPoints.toString();
            }
        }
    } catch (error) {
        console.error("Error updating upgrade calculations:", error);
    }
}

// Function to setup registration button
function setupRegisterButton() {
    const registerBtn = document.getElementById('register-btn');
    const registerStatus = document.getElementById('register-status');
    if (registerBtn) {
        registerBtn.onclick = async () => {
            const oldText = registerBtn.textContent;
            registerBtn.disabled = true;
            registerBtn.innerHTML = '<span class="spinner" style="display:inline-block;width:18px;height:18px;border:2px solid #fff;border-top:2px solid #00ff88;border-radius:50%;margin-left:8px;vertical-align:middle;animation:spin 0.8s linear infinite;"></span> Registering...';
            if (registerStatus) registerStatus.textContent = '';
            try {
                await performRegistration();
                if (registerStatus) registerStatus.textContent = '✅ Registration completed successfully!';
                registerBtn.style.display = 'none';
            } catch (error) {
                let msg = error && error.message ? error.message : error;
                if (error.code === 4001 || msg.includes('user denied')) {
                    msg = '❌ Transaction cancelled by user.';
                } else if (error.code === -32002 || msg.includes('Already processing')) {
                    msg = '⏳ MetaMask is processing a previous request. Please wait a moment.';
                } else if (error.code === 'NETWORK_ERROR' || msg.includes('network')) {
                    msg = '❌ Network error! Check your internet or blockchain network connection.';
                } else if (msg.includes('insufficient funds')) {
                    msg = 'Insufficient balance for transaction fee or registration.';
                } else if (msg.includes('invalid address')) {
                    msg = 'Invalid referrer or destination address.';
                } else if (msg.includes('not allowed') || msg.includes('only owner')) {
                    msg = 'You are not authorized to perform this operation.';
                } else if (msg.includes('already registered') || msg.includes('already exists')) {
                    msg = 'You are already registered or this address is already registered.';
                } else if (msg.includes('execution reverted')) {
                    msg = 'Transaction failed. Check registration conditions.';
                } else {
                    msg = '❌ Registration error: ' + (msg || 'Unknown error');
                }
                if (registerStatus) registerStatus.textContent = msg;
            } finally {
                registerBtn.disabled = false;
                registerBtn.textContent = oldText;
            }
        };
    }
}

// Function to setup upgrade form
function setupUpgradeForm() {
    const upgradeBtn = document.getElementById('upgrade-btn');
    if (upgradeBtn) {
        upgradeBtn.onclick = async () => {
            try {
                await performUpgrade();
            } catch (error) {
                // console.error("Upgrade error:", error);
                showRegisterError("Error in upgrade");
            }
        };
    }
}

// Function to perform registration for new user (connected wallet)
async function performRegistrationForNewUser() {
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('Wallet connection not established');
        }
        const { contract, address } = window.contractConfig;
        
        // Referrer by default: get from input field
        const referrerInput = document.getElementById('referrer-address');
        const referrerAddress = referrerInput && referrerInput.value ? referrerInput.value.trim() : '';
        if (!referrerAddress) {
            throw new Error('Please enter referrer address');
        }
        
        // New user: connected wallet
        const userAddress = address;

        // Approve logic before registration:
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, window.contractConfig.signer);
        const allowance = await usdcContract.allowance(address, window.IAM_ADDRESS);
        if (allowance < regprice) {
          const approveTx = await usdcContract.approve(window.IAM_ADDRESS, regprice);
          await approveTx.wait();
        }
        
        const tx = await contract.registerAndActivate(referrerAddress, referrerAddress, userAddress);
        await tx.wait();
        showRegisterSuccess("Registration completed successfully!");
        
        // Hide main registration button
        if (typeof window.hideMainRegistrationButton === 'function') {
            window.hideMainRegistrationButton();
        }
        
        registerDataLoaded = false;
        setTimeout(() => {
            loadRegisterData(contract, address, tokenPriceUSDFormatted);
        }, 2000);
    } catch (error) {
        showRegisterError(error.message || 'Registration error.');
    }
}

// Function to check index referral line (for register.html compatibility)
window.checkIndexReferralLine = async function() {
    const indexInput = document.getElementById('index-search');
    const refInput = document.getElementById('referrer-address');
    
    if (!indexInput || !refInput) {
        console.log('Index input elements not found');
        return;
    }
    
    let index = '';
    // If starts with IAM, get only numbers
    if (indexInput.value.startsWith('IAM')) {
        index = indexInput.value.replace('IAM', '').replace(/^0+/, '') || '0';
    } else {
        // If only number, use directly
        index = indexInput.value.trim();
    }
    
    console.log(`🔍 Checking index: "${indexInput.value}" -> "${index}"`);
    if (!index) {
        console.log(`❌ Index is empty`);
        return;
    }
    
    try {
        console.log(`🔗 Connecting to contract...`);
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.log(`🔗 Reconnecting to wallet...`);
            await window.connectWallet();
        }
        const contract = window.contractConfig.contract;
        const status = document.getElementById('status-message');
        console.log(`🔗 Contract ready:`, contract ? 'Yes' : 'No');
        
        // Step 1: Check if index exists in network
        let addr = null;
        try {
            addr = await contract.indexToAddress(index);
            console.log(`📍 Address for index ${index}:`, addr);
        } catch (e) {
            console.log(`❌ Error getting address for index ${index}:`, e);
            refInput.value = '';
            if (status) status.style.color = '#d32f2f';
            if (window.showTempMessage) {
                window.showTempMessage(`Error getting address for index ${index}: ${e.message || e}`, 'error');
            }
            return;
        }
        
        // Check if address is empty
        if (!addr || addr === '0x0000000000000000000000000000000000000000') {
            refInput.value = '';
            refInput.style.backgroundColor = '#232946';
            refInput.style.color = '#fff';
            if (status) status.style.color = '#d32f2f';
            if (window.showTempMessage) {
                window.showTempMessage(`❌ Index ${index} does not exist in network. Please enter a valid index.`, 'error');
            }
            return;
        }
        
        // Step 2: Check if user at this index is active
        try {
            const userAtAddress = await contract.users(addr);
            console.log(`👤 User info at index ${index}:`, userAtAddress);
            
            // Check if user is active
            const isActive = userAtAddress && userAtAddress.index && BigInt(userAtAddress.index) > 0n;
            
            if (!isActive) {
                refInput.value = '';
                refInput.style.backgroundColor = '#232946';
                refInput.style.color = '#fff';
                if (status) status.style.color = '#d32f2f';
                if (window.showTempMessage) {
                    window.showTempMessage(`User at index ${index} is not active. Please enter an active user index.`, 'error');
                }
                return;
            }
        } catch (e) {
            console.log(`❌ Error checking user status:`, e);
            refInput.value = '';
            if (status) status.style.color = '#d32f2f';
            if (window.showTempMessage) {
                window.showTempMessage(`Error checking user status at index ${index}. Please try again.`, 'error');
            }
            return;
        }
        
        // Set referrer address in field
        refInput.readOnly = false;
        refInput.disabled = false;
        refInput.value = addr;
        refInput.style.backgroundColor = '#232946';
        refInput.style.color = '#fff';
        
        // Show success message
        if (status) status.style.color = '#388e3c';
        if (window.showTempMessage) {
            window.showTempMessage(`✅ Referrer address set automatically: ${addr}`, 'success');
        }
        
        // Update new position information
        try {
            let left = await contract.getLeftAddress(index);
            let right = await contract.getRightAddress(index);
            let newEmptyIndex = '...';
            let newPositionInfo = '...';
            
            if (left === '0x0000000000000000000000000000000000000000') {
                newEmptyIndex = (BigInt(index) * 2n).toString();
                newPositionInfo = `Left - Index ${newEmptyIndex}`;
            } else if (right === '0x0000000000000000000000000000000000000000') {
                newEmptyIndex = (BigInt(index) * 2n + 1n).toString();
                newPositionInfo = `Right - Index ${newEmptyIndex}`;
            } else {
                newEmptyIndex = 'Full';
                newPositionInfo = 'Both positions filled';
            }
            
            const emptyIndexElement = document.getElementById('empty-index');
            const positionInfoElement = document.getElementById('position-info');
            const parentIndexElement = document.getElementById('parent-index');
            
            if (emptyIndexElement) emptyIndexElement.textContent = newEmptyIndex;
            if (positionInfoElement) positionInfoElement.textContent = newPositionInfo;
            if (parentIndexElement) parentIndexElement.textContent = index;
            
            console.log(`🔄 Position information updated: ${newPositionInfo}`);
        } catch (e) {
            console.log(`Error updating position information:`, e);
        }
        
        // Successful completion
        console.log(`✅ Referrer address set: ${addr}`);
        
    } catch (e) {
        const status = document.getElementById('status-message');
        refInput.value = '';
        if (status) status.style.color = '#d32f2f';
        if (window.showTempMessage) {
            window.showTempMessage(`Error checking index ${index}: ` + (e.message || e), 'error');
        }
    }
};

// Function to perform registration
async function performRegistration() {
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('Wallet connection not established');
        }
        const { contract, address } = window.contractConfig;
        
        // Check current user status
        const currentUserData = await contract.users(address);
        
        if (currentUserData && currentUserData.index && BigInt(currentUserData.index) > 0n) {
            // User is registered - can only register subordinates
            const userAddressInput = document.getElementById('register-user-address') || document.getElementById('new-user-address');
            const userAddress = userAddressInput ? userAddressInput.value.trim() : '';
            
            if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
                throw new Error('New user address is not valid');
            }
            
            // Referrer: current user address
            const referrerAddress = address;
            
            // Check that new user is not registered
            const newUserData = await contract.users(userAddress);
            if (newUserData && newUserData.index && BigInt(newUserData.index) > 0n) {
                throw new Error('This address is already registered');
            }
            
            // Approve logic before registration:
            const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, window.contractConfig.signer);
            const allowance = await usdcContract.allowance(address, window.IAM_ADDRESS);
            if (allowance < regprice) {
              const approveTx = await usdcContract.approve(window.IAM_ADDRESS, regprice);
              await approveTx.wait();
            }
            
            const tx = await contract.registerAndActivate(referrerAddress, referrerAddress, userAddress);
            await tx.wait();
            showRegisterSuccess("Subordinate registration completed successfully!");
        } else {
            // User is not registered - manual mode
            let referrerInput = document.getElementById('referrer-address');
            let referrerAddress = referrerInput && referrerInput.value ? referrerInput.value.trim() : '';
            if (!referrerAddress) {
                referrerAddress = getReferrerFromURL() || getReferrerFromStorage();
            }
            if (!referrerAddress) {
                throw new Error('Please enter referrer address');
            }

            // Approve logic before registration:
            const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, window.contractConfig.signer);
            const allowance = await usdcContract.allowance(address, window.IAM_ADDRESS);
            if (allowance < regprice) {
              const approveTx = await usdcContract.approve(window.IAM_ADDRESS, regprice);
              await approveTx.wait();
            }
            const tx = await contract.registerAndActivate(referrerAddress, referrerAddress, address);
            await tx.wait();
            showRegisterSuccess("Registration completed successfully!");
        }
        
        // مخفی کردن دکمه ثبت‌نام اصلی
        if (typeof window.hideMainRegistrationButton === 'function') {
            window.hideMainRegistrationButton();
        }
        
        registerDataLoaded = false;
        setTimeout(() => {
            loadRegisterData(contract, address, tokenPriceUSDFormatted);
        }, 2000);
    } catch (error) {
        showRegisterError(error.message || 'Registration error.');
    }
}

// Function to get referrer from URL
function getReferrerFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref') || urlParams.get('referrer');
}

// Function to get referrer from localStorage - no caching
function getReferrerFromStorage() {
    return null; // No caching - always get fresh referrer from URL
}

// Function to perform upgrade
async function performUpgrade() {
    try {
        // Use existing connection instead of calling connectWallet
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('No wallet connection');
        }
        
        const { contract, address } = window.contractConfig;
        
        const upgradeAmountInput = document.getElementById('upgrade-amount');
        const amount = parseFloat(upgradeAmountInput.value);
        
        if (!amount || amount <= 0) {
            throw new Error('Invalid upgrade amount');
        }
        
        // Convert amount to wei
        const amountInWei = ethers.parseUnits(amount.toString(), 18);
        
        // Perform upgrade transaction
        const tx = await contract.purchase(amountInWei, 0);
        await tx.wait();
        
        showRegisterSuccess("Upgrade completed successfully!");
        
        // Reset loading status for reload
        registerDataLoaded = false;
        
        // Reload data
        setTimeout(() => {
            loadRegisterData(contract, address, tokenPriceUSDFormatted);
        }, 2000);
        
    } catch (error) {
        // console.error("Upgrade failed:", error);
        throw error;
    }
}

// Function to show success message
function showRegisterSuccess(message) {
    showMessageBox(message || 'Registration completed successfully! Welcome to our user community.', 'success');
}

// Function to show error message
function showRegisterError(message) {
    showMessageBox(message || 'Error in registration. Please try again or contact support.', 'error');
}

// Function to show general messages
function showMessageBox(message, type = 'info') {
    // Remove previous message box if exists
    const existingBox = document.getElementById('message-box');
    if (existingBox) {
        existingBox.remove();
    }
    
    // Create new message box
    const messageBox = document.createElement('div');
    messageBox.id = 'message-box';
    messageBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${type === 'error' ? 'rgba(255, 0, 0, 0.95)' : type === 'success' ? 'rgba(0, 255, 136, 0.95)' : 'rgba(167, 134, 255, 0.95)'};
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 400px;
        text-align: center;
        font-size: 14px;
        line-height: 1.5;
        backdrop-filter: blur(10px);
        border: 1px solid ${type === 'error' ? 'rgba(255, 0, 0, 0.3)' : type === 'success' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(167, 134, 255, 0.3)'};
    `;
    
    // Icon based on message type
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    
    messageBox.innerHTML = `
        <div style="margin-bottom: 10px; font-size: 24px;">${icon}</div>
        <div style="margin-bottom: 15px;">${message}</div>
        <button onclick="this.parentElement.remove()" style="
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 8px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
            Close
        </button>
    `;
    
    document.body.appendChild(messageBox);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageBox.parentElement) {
            messageBox.remove();
        }
    }, 5000);
}

// Function to show temporary messages (for validation)
function showTempMessage(message, type = 'info', duration = 3000) {
    const tempBox = document.createElement('div');
    tempBox.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'rgba(255, 0, 0, 0.9)' : type === 'success' ? 'rgba(0, 255, 136, 0.9)' : 'rgba(167, 134, 255, 0.9)'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        font-size: 13px;
        max-width: 300px;
        backdrop-filter: blur(8px);
        border: 1px solid ${type === 'error' ? 'rgba(255, 0, 0, 0.3)' : type === 'success' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(167, 134, 255, 0.3)'};
        animation: slideIn 0.3s ease;
    `;
    
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    tempBox.innerHTML = `${icon} ${message}`;
    
    document.body.appendChild(tempBox);
    
    setTimeout(() => {
        if (tempBox.parentElement) {
            tempBox.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => tempBox.remove(), 300);
        }
    }, duration);
}

    // Add CSS animations
if (!document.getElementById('message-box-styles')) {
    const style = document.createElement('style');
    style.id = 'message-box-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Function to update balance display
function updateBalanceDisplay(IAMBalance, IAMBalanceUSD) {
    const lvlBalanceElement = document.getElementById('user-lvl-balance');
    const lvlUsdElement = document.getElementById('user-lvl-usd-value');
    
    if (lvlBalanceElement) {
        lvlBalanceElement.textContent = `${parseFloat(IAMBalance).toFixed(2)} USDC`;
    }
    
    if (lvlUsdElement) {
        lvlUsdElement.textContent = `$${IAMBalanceUSD} USD`;
    }
}

// Function to display complete registration information
function displayRegistrationInfo(registrationPrice, regprice, tokenPriceUSD, tokenPriceMatic, oneCentTokens, tenCentsTokens, twelveCentsTokens) {
    const infoContainer = document.getElementById('registration-info');
    if (infoContainer) {
        const infoHTML = `
            <div style="background: rgba(0, 0, 0, 0.6); border-radius: 8px; padding: 1rem; margin: 1rem 0; border-left: 3px solid #a786ff;">
                <h4 style="color: #a786ff; margin-bottom: 0.8rem;">📊 Registration Information</h4>
                <div style="display: grid; gap: 0.5rem; font-size: 0.9rem;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">Required token amount (exactly according to contract):</span>
                        <span style="color: #00ff88; font-weight: bold;">${registrationPrice} USDC</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">Dollar value (contract target):</span>
                        <span style="color: #00ccff; font-weight: bold;">$0.01 USD</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">Current Token Price (USD):</span>
                        <span style="color: #ffffff; font-weight: bold;">$${tokenPriceUSD} USD</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ccc;">Current Token Price (MATIC):</span>
                        <span style="color: #ff9500; font-weight: bold;">${tokenPriceMatic} MATIC</span>
                    </div>
                </div>
                <div style="font-size: 0.85rem; color: #aaa; margin-top: 0.7rem;">
                    The required token amount for registration is exactly the output of the <b>getRegistrationPrice</b> contract function and equals 1 cent ($0.01).
                </div>
            </div>
        `;
        infoContainer.innerHTML = infoHTML;
    }
}

// Function to show registration form for new user (connected wallet)
window.showRegistrationFormForNewUser = async function() {
    const registrationForm = document.getElementById('registration-form');
    if (!registrationForm) return;
    registrationForm.style.display = 'block';

    // Get and display required token amount for registration
    await window.displayUserBalances();

    // Set referrer by default: empty address (user must enter manually)
    let referrer = '';
    
    // Set new user address to connected wallet
    const userAddress = window.contractConfig.address;
    
    // Fill form fields
    const referrerInput = document.getElementById('referrer-address');
    const userAddressInput = document.getElementById('register-user-address') || document.getElementById('new-user-address');
    
    if (referrerInput) {
        referrerInput.value = referrer;
        referrerInput.readOnly = false; // Enable referrer editing
    }
    
    if (userAddressInput) {
        userAddressInput.value = userAddress;
        userAddressInput.readOnly = true; // Disable user address editing
    }
    
    // نمایش پیام راهنما
    const statusElement = document.getElementById('register-status');
    if (statusElement) {
        statusElement.innerHTML = `
            <div style="background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.3); border-radius: 8px; padding: 12px; margin: 10px 0;">
                <strong style="color: #ffc107;">📝 Manual Registration:</strong><br>
                • Please enter the referrer address<br>
                • New user: <span style="color: #a786ff;">${userAddress}</span><br>
                • After entering the referrer address, click the "Register" button
            </div>
        `;
        statusElement.className = 'profile-status info';
    }

    // Setup registration button
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.onclick = async () => {
            const oldText = registerBtn.textContent;
            registerBtn.disabled = true;
            registerBtn.innerHTML = '<span class="spinner" style="display:inline-block;width:18px;height:18px;border:2px solid #fff;border-top:2px solid #00ff88;border-radius:50%;margin-left:8px;vertical-align:middle;animation:spin 0.8s linear infinite;"></span> Registering...';
            
            try {
                await performRegistrationForNewUser();
                if (statusElement) {
                    statusElement.textContent = '✅ Registration completed!';
                    statusElement.className = 'profile-status success';
                }
                registerBtn.style.display = 'none';
            } catch (error) {
                let msg = error && error.message ? error.message : error;
                if (error.code === 4001 || msg.includes('user denied')) {
                    msg = '❌ Transaction cancelled by user.';
                } else if (error.code === -32002 || msg.includes('Already processing')) {
                    msg = '⏳ MetaMask is processing a previous request. Please wait a moment.';
                } else if (error.code === 'NETWORK_ERROR' || msg.includes('network')) {
                    msg = '❌ Network error! Check your internet or blockchain network connection.';
                } else if (msg.includes('insufficient funds')) {
                    msg = '❌ Insufficient balance! Check your IAM or MATIC balance.';
                }
                
                if (statusElement) {
                    statusElement.textContent = msg;
                    statusElement.className = 'profile-status error';
                }
                registerBtn.disabled = false;
                registerBtn.textContent = oldText;
            }
        };
    }
};

// Function to show registration form
window.showRegistrationForm = async function() {
    const registrationForm = document.getElementById('registration-form');
    if (!registrationForm) return;
    registrationForm.style.display = 'block';

    // Get and display required token amount for registration
    // await updateRegisterRequiredAmount(); // Disabled infinite fetch
    
    // Display user balances
    await window.displayUserBalances();

    // For registered users: only ability to register their subordinates
    const { contract, address } = window.contractConfig;
    const currentUserData = await contract.users(address);
    
    if (currentUserData && currentUserData.index && BigInt(currentUserData.index) > 0n) {
        // User is registered - can only register subordinates
        const refInputGroup = document.getElementById('register-ref-input-group');
        const refSummary = document.getElementById('register-ref-summary');
        const walletAddressSpan = document.getElementById('register-wallet-address');
        const referrerAddressSpan = document.getElementById('register-referrer-address');
        
        // Referrer by default: current user address
        const referrer = address;
        const referrerInput = document.getElementById('referrer-address');
        if (referrerInput) {
            referrerInput.value = referrer;
            referrerInput.readOnly = true; // Disable referrer editing
        }
        
        // نمایش پیام راهنما
        const statusElement = document.getElementById('register-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div style="background: rgba(167,134,255,0.1); border: 1px solid rgba(167,134,255,0.3); border-radius: 8px; padding: 12px; margin: 10px 0;">
                    <strong style="color: #a786ff;">👥 Subordinate Registration:</strong><br>
                    • Referrer: <span style="color: #a786ff;">${referrer}</span> (You)<br>
                    • Enter the new user address<br>
                    • You can only register subordinates for yourself
                </div>
            `;
            statusElement.className = 'profile-status info';
        }
        
        // Hide referrer field and show summary
        if (refInputGroup) refInputGroup.style.display = 'none';
        if (refSummary) {
            refSummary.style.display = 'block';
            if (walletAddressSpan) walletAddressSpan.textContent = address;
            if (referrerAddressSpan) referrerAddressSpan.textContent = referrer;
        }
    } else {
        // User is not registered - normal mode
        let referrer = getReferrerFromURL();
        const refInputGroup = document.getElementById('register-ref-input-group');
        const refSummary = document.getElementById('register-ref-summary');
        const walletAddressSpan = document.getElementById('register-wallet-address');
        const referrerAddressSpan = document.getElementById('register-referrer-address');
        let isReferralMode = false;
        if (!referrer) {
            // If not in URL, leave field empty (user must enter manually)
            referrer = '';
        } else {
            // If referrer was in URL, activate referral mode
            isReferralMode = true;
        }
        const referrerInput = document.getElementById('referrer-address');
        if (referrerInput) referrerInput.value = referrer || '';

                    // If referral mode is active, hide input and show summary
        if (isReferralMode) {
            if (refInputGroup) refInputGroup.style.display = 'none';
            if (refSummary) {
                refSummary.style.display = 'block';
                if (walletAddressSpan) walletAddressSpan.textContent = window.contractConfig.address;
                if (referrerAddressSpan) referrerAddressSpan.textContent = referrer;
            }
                 } else {
             if (refInputGroup) refInputGroup.style.display = 'block';
             if (refSummary) refSummary.style.display = 'none';
         }
     }


            // Display user balances
    await window.displayUserBalances();
    
            // Display required amount
    const IAMRequiredSpan = document.getElementById('register-IAM-required');
    if (IAMRequiredSpan) IAMRequiredSpan.textContent = regPrice; // Static value

    // 1. Add logic to fetch MATIC balance and required MATIC for registration
    async function fetchMaticBalance(address, contract) {
      try {
        const maticWei = await contract.provider.getBalance(address);
        return ethers.formatEther(maticWei);
      } catch (e) {
        return '0';
      }
    }

    // 2. Update registration form logic to show MATIC balance and required MATIC
    // (Find the main registration form logic and add after IAM balance logic)

    // Set required MATIC (for registration, e.g. 0.05 MATIC for gas)
    const requiredMatic = 0.05; // You can adjust this value as needed
    const maticRequiredSpan = document.getElementById('register-matic-required');
    if (maticRequiredSpan) maticRequiredSpan.textContent = requiredMatic + ' MATIC';

    // 3. Update register button logic to check both IAM and MATIC balance
    const registerBtn = document.getElementById('register-btn');
    const registerStatus = document.getElementById('register-status');
    if (registerBtn) {
      // Get user address from input (not just connected wallet)
      const userAddressInput = document.getElementById('register-user-address');
      let targetUserAddress = userAddressInput ? userAddressInput.value.trim() : '';
      const referrerInput = document.getElementById('referrer-address');
      let referrer = referrerInput ? referrerInput.value.trim() : '';

      if (!/^0x[a-fA-F0-9]{40}$/.test(targetUserAddress)) {
        showTempMessage('New user wallet address is not valid.', 'error');
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register';
        return;
      }
      if (!/^0x[a-fA-F0-9]{40}$/.test(referrer)) {
        showTempMessage('Referrer address is not valid.', 'error');
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register';
        return;
      }
              // Check that new user is not registered
      let userData;
      try {
        userData = await contract.users(targetUserAddress);
      } catch (e) { userData = null; }
      if (userData && userData.index && BigInt(userData.index) > 0n) {
        showTempMessage('This address is already registered.', 'error');
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register';
        return;
      }
      // بررسی فعال بودن رفرر
      let refData;
      try {
        refData = await contract.users(referrer);
      } catch (e) { refData = null; }
      if (!refData || !(refData.index && BigInt(refData.index) > 0n)) {
        showTempMessage('Referrer is not active.', 'error');
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register';
        return;
      }
              // Check connected wallet balance (address)
      if (parseFloat(userLvlBalance) < parseFloat(requiredTokenAmount)) {
        registerBtn.disabled = true;
        registerBtn.textContent = 'Insufficient IAM balance';
        showTempMessage('Your IAM balance is insufficient for registration. You need at least '+requiredTokenAmount+' IAM. Please top up your wallet or purchase it from the marketplace/IAM token shop.', 'error');
        return;
      } else if (parseFloat(maticBalance) < requiredMatic) {
        registerBtn.disabled = true;
        registerBtn.textContent = 'Insufficient MATIC balance';
        showTempMessage('You need at least '+requiredMatic+' MATIC in your wallet to register.', 'error');
        return;
      }
      // ثبت‌نام
      registerBtn.disabled = true;
      registerBtn.textContent = 'Registering...';
      try {
        await contract.registerAndActivate(referrer, referrer, targetUserAddress);
        showRegisterSuccess('Registration completed successfully!');
        registerBtn.style.display = 'none';
      } catch (e) {
        if (e.code === 4001) {
          showTempMessage('Registration process cancelled by you.', 'error');
        } else {
          showRegisterError('Registration error: ' + (e.message || e));
        }
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register';
      }
    }

            // Registration button
    const newRegisterBtn = document.getElementById('new-register-btn');
    const newRegisterModal = document.getElementById('new-registration-modal');
    const closeNewRegister = document.getElementById('close-new-register');
    const submitNewRegister = document.getElementById('submit-new-register');
    if (newRegisterBtn && newRegisterModal && closeNewRegister && submitNewRegister) {
        newRegisterBtn.onclick = function() {
            newRegisterModal.style.display = 'flex';
        };
        closeNewRegister.onclick = function() {
            newRegisterModal.style.display = 'none';
            document.getElementById('new-user-address').value = '';
            document.getElementById('new-referrer-address').value = '';
            document.getElementById('new-register-status').textContent = '';
            // Hide any duplicate or leftover registration forms
            const allModals = document.querySelectorAll('.new-registration-modal, #new-registration-modal');
            allModals.forEach(m => m.style.display = 'none');
        };
        submitNewRegister.onclick = async function() {
            const userAddr = document.getElementById('new-user-address').value.trim();
            const refAddr = document.getElementById('new-referrer-address').value.trim();
            const statusDiv = document.getElementById('new-register-status');
            if (!userAddr || !refAddr) {
                showTempMessage('Please enter new user address and referrer address', 'error');
                return;
            }
            submitNewRegister.disabled = true;
            const oldText = submitNewRegister.textContent;
            submitNewRegister.textContent = 'Registering...';
            try {
                if (!window.contractConfig || !window.contractConfig.contract) throw new Error('Wallet connection not established');
                const { contract } = window.contractConfig;
                // بررسی معتبر بودن معرف
                const refData = await contract.users(refAddr);
                if (!(refData && refData.index && BigInt(refData.index) > 0n)) throw new Error('Referrer is not active');
                // بررسی ثبت‌نام نبودن نفر جدید
                const userData = await contract.users(userAddr);
                if (userData && userData.index && BigInt(userData.index) > 0n) throw new Error('This address is already registered');
                // ثبت‌نام نفر جدید (با ولت فعلی)
                const tx = await contract.registerAndActivate(refAddr, refAddr, userAddr);
                await tx.wait();
                showRegisterSuccess('New user registration completed successfully!');
                setTimeout(() => location.reload(), 1200);
            } catch (e) {
                showRegisterError(e.message || 'Error registering new user');
            }
            submitNewRegister.disabled = false;
            submitNewRegister.textContent = oldText;
        };
    }
}

    // Simple registration function
async function registerUser(referrer, requiredTokenAmount, targetUserAddress) {
    const { contract, address } = await window.connectWallet();
    if (!contract || !address) throw new Error('Wallet not connected');
    // Convert amount to wei (integer)
    const amountInWei = ethers.parseUnits(requiredTokenAmount, 18);
    await contract.registerAndActivate(referrer, referrer, targetUserAddress);
}

    // Manage display of new registration form and new person registration
window.addEventListener('DOMContentLoaded', function() {
            // Setup main registration button
    setupRegisterButton();
    setupUpgradeForm();
    
    const newRegisterBtn = document.getElementById('new-register-btn');
    const newRegisterModal = document.getElementById('new-registration-modal');
    const closeNewRegister = document.getElementById('close-new-register');
    const submitNewRegister = document.getElementById('submit-new-register');
    if (newRegisterBtn && newRegisterModal && closeNewRegister && submitNewRegister) {
        newRegisterBtn.onclick = function() {
            newRegisterModal.style.display = 'flex';
        };
        closeNewRegister.onclick = function() {
            newRegisterModal.style.display = 'none';
            document.getElementById('new-user-address').value = '';
            document.getElementById('new-referrer-address').value = '';
            document.getElementById('new-register-status').textContent = '';
            // Hide any duplicate or leftover registration forms
            const allModals = document.querySelectorAll('.new-registration-modal, #new-registration-modal');
            allModals.forEach(m => m.style.display = 'none');
        };
        submitNewRegister.onclick = async function() {
            const userAddr = document.getElementById('new-user-address').value.trim();
            const refAddr = document.getElementById('new-referrer-address').value.trim();
            const statusDiv = document.getElementById('new-register-status');
            if (!userAddr || !refAddr) {
                statusDiv.textContent = 'Please enter new user address and referrer address';
                statusDiv.className = 'profile-status error';
                return;
            }
            submitNewRegister.disabled = true;
            const oldText = submitNewRegister.textContent;
            submitNewRegister.textContent = 'Registering...';
            try {
                if (!window.contractConfig || !window.contractConfig.contract) throw new Error('Wallet connection not established');
                const { contract } = window.contractConfig;
                // بررسی معتبر بودن معرف
                const refData = await contract.users(refAddr);
                if (!(refData && refData.index && BigInt(refData.index) > 0n)) throw new Error('Referrer is not active');
                // بررسی ثبت‌نام نبودن نفر جدید
                const userData = await contract.users(userAddr);
                if (userData && userData.index && BigInt(userData.index) > 0n) throw new Error('This address is already registered');
                // ثبت‌نام نفر جدید (با ولت فعلی)
                const tx = await contract.registerAndActivate(refAddr, refAddr, userAddr);
                await tx.wait();
                statusDiv.textContent = 'New user registration completed!';
                statusDiv.className = 'profile-status success';
                setTimeout(() => location.reload(), 1200);
            } catch (e) {
                statusDiv.textContent = e.message || 'Error registering new user';
                statusDiv.className = 'profile-status error';
            }
            submitNewRegister.disabled = false;
            submitNewRegister.textContent = oldText;
        };
    }
});

// Auto-fill referrer and upper from URL (?ref=) on register page
document.addEventListener('DOMContentLoaded', function() {
    function fillRefAndUpper(addr) {
        try {
            var refInput = document.getElementById('referrer-address');
            var refDisplay = document.getElementById('referrer-address-display');
            var upperInput = document.getElementById('upper-address');
            if (refInput) refInput.value = addr;
            if (refDisplay) {
                if (refDisplay.tagName === 'INPUT') refDisplay.value = addr; else refDisplay.textContent = addr;
            }
            if (upperInput) {
                upperInput.value = addr;
                upperInput.setAttribute('data-full-address', addr);
            }
        } catch(_) {}
    }

    try {
        var params = new URLSearchParams(window.location.search);
        var ref = params.get('ref') || params.get('referrer');
        if (!ref) return;
        // If address, fill directly
        if (/^0x[a-fA-F0-9]{40}$/.test(ref)) {
            fillRefAndUpper(ref);
            return;
        }
        // If numeric, resolve to address
        if (/^\d+$/.test(ref)) {
            (async function(){
                try {
                    if (!window.connectWallet) return;
                    const { contract } = await window.connectWallet();
                    if (!contract || typeof contract.indexToAddress !== 'function') return;
                    const addr = await contract.indexToAddress(ref);
                    if (addr && addr !== '0x0000000000000000000000000000000000000000') {
                        // Update URL silently
                        var url = window.location.origin + window.location.pathname + '?ref=' + addr;
                        window.history.replaceState({}, '', url);
                        fillRefAndUpper(addr);
                    }
                } catch (_) {}
            })();
        }
    } catch (_) {}
});

        // Register new person with desired referrer (for network use)
window.registerNewUserWithReferrer = async function(referrer, newUserAddress, statusElement) {
    if (!window.contractConfig || !window.contractConfig.contract) {
        if (statusElement) {
            statusElement.textContent = 'Wallet connection not established';
            statusElement.className = 'profile-status error';
        }
        return;
    }
    const { contract } = window.contractConfig;
    if (!referrer || !newUserAddress) {
        if (statusElement) {
            statusElement.textContent = 'Referrer address and new user address are required';
            statusElement.className = 'profile-status error';
        }
        return;
    }
    if (statusElement) {
        statusElement.textContent = 'Registering...';
        statusElement.className = 'profile-status info';
    }
    try {
        // Check if referrer is active
        const refData = await contract.users(referrer);
        if (!(refData && refData.index && BigInt(refData.index) > 0n)) throw new Error('Referrer is not active');
        // بررسی ثبت‌نام نبودن نفر جدید
        const userData = await contract.users(newUserAddress);
        if (userData && userData.index && BigInt(userData.index) > 0n) throw new Error('This address is already registered');
        // ثبت‌نام نفر جدید (با ولت فعلی)
        const tx = await contract.registerAndActivate(referrer, referrer, newUserAddress);
        await tx.wait();
        
        // مخفی کردن دکمه ثبت‌نام اصلی
        if (typeof window.hideMainRegistrationButton === 'function') {
            window.hideMainRegistrationButton();
        }
        
        if (statusElement) {
            statusElement.textContent = 'New user registration completed!';
            statusElement.className = 'profile-status success';
            setTimeout(() => location.reload(), 1200);
        }
    } catch (e) {
        if (statusElement) {
            statusElement.textContent = e.message || 'Error registering new user';
            statusElement.className = 'profile-status error';
        }
    }
};
window.loadRegisterData = loadRegisterData;

    // Function to display user balances
async function displayUserBalances() {
    try {
        const { contract, address } = await window.connectWallet();
        // Robust initialization for provider
        const provider =
            (contract && contract.provider) ||
            (window.contractConfig && window.contractConfig.provider) ||
            (window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null);
        if (!provider) throw new Error('No provider available for getBalance');

        // Get different balances
        const [IAMBalance, usdcBalance, maticBalance] = await Promise.all([
            contract.balanceOf(address),
            (function() {
                const USDC_ADDRESS = window.USDC_ADDRESS || '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
                const USDC_ABI = window.USDC_ABI || ["function balanceOf(address) view returns (uint256)"];
                const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
                return usdcContract.balanceOf(address);
            })(),
            provider.getBalance(address)
        ]);
        
        // Format balances
        const IAMFormatted = parseFloat(ethers.formatUnits(IAMBalance, 18)).toFixed(4);
        const usdcFormatted = parseFloat(ethers.formatUnits(usdcBalance, 6)).toFixed(2);
        const maticFormatted = parseFloat(ethers.formatEther(maticBalance)).toFixed(4);
        
        // Update balance elements
        const balanceElements = {
            'user-IAM-balance': `${IAMFormatted} IAM`,
            'user-usdc-balance': `${usdcFormatted} USDC`,
            'user-matic-balance': `${maticFormatted} MATIC`,
            'register-IAM-balance': `${IAMFormatted} IAM`,
            'register-usdc-balance': `${usdcFormatted} USDC`,
            'register-matic-balance': `${maticFormatted} MATIC`
        };
        
        // Update all balance elements
        Object.entries(balanceElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                // Updated element
            }
        });
        
        if (balances) {
            // User balances displayed successfully
        }
        
    } catch (error) {
        console.error('❌ Error displaying user balances:', error);
        return null;
    }
}

// Export for global use
window.displayUserBalances = displayUserBalances;

// Add spinner animation CSS to the page if not present
if (!document.getElementById('register-spinner-style')) {
  const style = document.createElement('style');
  style.id = 'register-spinner-style';
  style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

