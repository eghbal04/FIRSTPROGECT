// config.js - Contract Configuration and Utility Functions

// Contract addresses
const IAM_ADDRESS_OLD = '0x2D3923A5ba62B2bec13b9181B1E9AE0ea2C8118D'; // Old contract (default)
const IAM_ADDRESS_NEW = '0x2DdDD3Bfc8B591296695fFA1EF74F7114140cC26'; // New contract
const DAI_ADDRESS = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';

// Set default to OLD contract for all pages
const IAM_ADDRESS = IAM_ADDRESS_OLD; // Default address

// Define contract numbers for swap page
const CONTRACT_1_ADDRESS = IAM_ADDRESS_OLD;
const CONTRACT_2_ADDRESS = IAM_ADDRESS_OLD;
const CONTRACT_3_ADDRESS = IAM_ADDRESS_OLD;
const CONTRACT_4_ADDRESS = IAM_ADDRESS_OLD;
const CONTRACT_5_ADDRESS = IAM_ADDRESS_NEW;

// Expose to window
    window.IAM_ADDRESS = IAM_ADDRESS;
window.DAI_ADDRESS = DAI_ADDRESS;

// Basic config placeholder for other scripts
window.contractConfig = {
    IAM_ADDRESS,
    DAI_ADDRESS,
};

// Minimal ABI for required reads
const MIN_IAM_ABI = (window.IAM_ABI && Array.isArray(window.IAM_ABI)) ? window.IAM_ABI : [
    // users(address) returns User struct
    { "inputs": [{"internalType":"address","name":"","type":"address"}], "name":"users", "outputs": [
        {"internalType":"uint256","name":"index","type":"uint256"},
        {"internalType":"uint256","name":"binaryPoints","type":"uint256"},
        {"internalType":"uint256","name":"binaryPointCap","type":"uint256"},
        {"internalType":"uint256","name":"binaryPointsClaimed","type":"uint256"},
        {"internalType":"uint256","name":"totalPurchasedKind","type":"uint256"},
        {"internalType":"uint256","name":"upgradeTime","type":"uint256"},
        {"internalType":"uint256","name":"lastClaimTime","type":"uint256"},
        {"internalType":"uint256","name":"leftPoints","type":"uint256"},
        {"internalType":"uint256","name":"rightPoints","type":"uint256"},
        {"internalType":"uint256","name":"lastMonthlyClaim","type":"uint256"},
        {"internalType":"uint256","name":"totalMonthlyRewarded","type":"uint256"},
        {"internalType":"uint256","name":"refclimed","type":"uint256"},
        {"internalType":"uint256","name":"depositedAmount","type":"uint256"}
    ], "stateMutability":"view", "type":"function" },
    { "inputs": [{"internalType":"address","name":"account","type":"address"}], "name":"balanceOf", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view", "type":"function" },
    { "inputs": [], "name": "name", "outputs": [{"internalType":"string","name":"","type":"string"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "symbol", "outputs": [{"internalType":"string","name":"","type":"string"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "decimals", "outputs": [{"internalType":"uint8","name":"","type":"uint8"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "totalSupply", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "owner", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "deployer", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
    { "inputs": [{"internalType":"address","name":"","type":"address"}], "name": "addressToIndex", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [{"internalType":"uint256","name":"","type":"uint256"}], "name": "indexToAddress", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
    // Optional/common getters
    { "inputs": [], "name": "totalUsers", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getTotalUsers", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "usersCount", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "dai", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "daiAddress", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
    // ERC20 Transfer functions
    { "inputs": [{"internalType":"address","name":"to","type":"address"}, {"internalType":"uint256","name":"amount","type":"uint256"}], "name": "transfer", "outputs": [{"internalType":"bool","name":"","type":"bool"}], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{"internalType":"address","name":"from","type":"address"}, {"internalType":"address","name":"to","type":"address"}, {"internalType":"uint256","name":"amount","type":"uint256"}], "name": "transferFrom", "outputs": [{"internalType":"bool","name":"","type":"bool"}], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{"internalType":"address","name":"spender","type":"address"}, {"internalType":"uint256","name":"amount","type":"uint256"}], "name": "approve", "outputs": [{"internalType":"bool","name":"","type":"bool"}], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{"internalType":"address","name":"owner","type":"address"}, {"internalType":"address","name":"spender","type":"address"}], "name": "allowance", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    // Price getters (try all common names)
    { "inputs": [], "name": "registrationPrice", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getRegistrationPrice", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "regPrice", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "activatePrice", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getTokenPrice", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "tokenPrice", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "pointPrice", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getPointPrice", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "binaryPointPrice", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    // Claimable points (total)
    { "inputs": [], "name": "claimablePoints", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getClaimablePoints", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "totalClaimablePoints", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "totalClaimableBinaryPoints", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "wallets", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getRegPrice", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    // Tree helpers
    { "inputs": [{"internalType":"uint256","name":"index","type":"uint256"}], "name": "getLeftAddress", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
    { "inputs": [{"internalType":"uint256","name":"index","type":"uint256"}], "name": "getRightAddress", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
    { "inputs": [{"internalType":"uint256","name":"index","type":"uint256"}], "name": "getLeftChild", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "pure", "type": "function" },
    { "inputs": [{"internalType":"uint256","name":"index","type":"uint256"}], "name": "getRightChild", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "pure", "type": "function" },
    { "inputs": [{"internalType":"uint256","name":"index","type":"uint256"}], "name": "getParent", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "pure", "type": "function" },
    { "inputs": [{"internalType":"uint256","name":"index","type":"uint256"}], "name": "getupper", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
    { "inputs": [{"internalType":"uint256","name":"index","type":"uint256"}], "name": "getReferrer", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
    { "inputs": [{"internalType":"address","name":"user","type":"address"}], "name": "getUserTree", "outputs": [
        {"internalType":"address","name":"left","type":"address"},
        {"internalType":"address","name":"right","type":"address"},
        {"internalType":"uint256","name":"binaryPoints","type":"uint256"},
        {"internalType":"uint256","name":"binaryPointCap","type":"uint256"},
        {"internalType":"uint256","name":"depositedAmount","type":"uint256"},
        {"internalType":"uint256","name":"lastMonthlyClaim","type":"uint256"},
        {"internalType":"uint256","name":"totalMonthlyRewarded","type":"uint256"},
        {"internalType":"uint256","name":"refclimed","type":"uint256"}
      ], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getPointValue", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    // Voting status
    { "inputs": [{"internalType":"address","name":"user","type":"address"}], "name": "getVoteStatus", "outputs": [
        {"internalType":"uint256","name":"totalLikes","type":"uint256"},
        {"internalType":"uint256","name":"totalDislikes","type":"uint256"},
        {"internalType":"uint8","name":"userVoteStatus","type":"uint8"}
      ], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getContractdaiBalance", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "cashBack", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    // Write: withdrawals (claim rewards, monthly cashback)
    { "inputs": [], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{"internalType":"uint256","name":"amount","type":"uint256"}], "name": "claimMonthlyReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    // Write: transfer index ownership (as provided)
    { "inputs": [{"internalType":"address","name":"newOwner","type":"address"}], "name": "transferIndexOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    // Write: registration flows
    { "inputs": [
        {"internalType":"address","name":"referrer","type":"address"},
        {"internalType":"address","name":"upper","type":"address"},
        {"internalType":"address","name":"newUser","type":"address"}
      ],
      "name": "registerAndActivate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    { "inputs": [
        {"internalType":"address","name":"referrer","type":"address"},
        {"internalType":"address","name":"newUser","type":"address"}
      ],
      "name": "registerFree",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // Write: voting
    { "inputs": [
        {"internalType":"address","name":"user","type":"address"},
        {"internalType":"bool","name":"isLike","type":"bool"}
      ],
      "name": "voteUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // Write: purchase function for upgrades (3 parameters only)
    { "inputs": [
        {"internalType":"uint256","name":"amountIAM","type":"uint256"},
        {"internalType":"uint256","name":"payout","type":"uint256"},
        {"internalType":"address","name":"seller","type":"address"}
      ],
      "name": "purchase",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
];

// Ensure ABI is available globally from config
if (!window.IAM_ABI || !Array.isArray(window.IAM_ABI) || window.IAM_ABI.length === 0) {
    window.IAM_ABI = MIN_IAM_ABI;
}

// Helpers to access ABI and split functions
window.getCurrentAbi = function() {
    return Array.isArray(window.IAM_ABI) && window.IAM_ABI.length ? window.IAM_ABI : MIN_IAM_ABI;
};
window.getAbiFunctions = function() {
    const abi = window.getCurrentAbi();
    const read = abi.filter(x => x.type === 'function' && (x.stateMutability === 'view' || x.stateMutability === 'pure'));
    const write = abi.filter(x => x.type === 'function' && !(x.stateMutability === 'view' || x.stateMutability === 'pure'));
    return { read, write };
};

// Set global variables for compatibility
window.CONTRACT_1_ADDRESS = CONTRACT_1_ADDRESS;
window.CONTRACT_2_ADDRESS = CONTRACT_2_ADDRESS;
window.CONTRACT_3_ADDRESS = CONTRACT_3_ADDRESS;
window.CONTRACT_4_ADDRESS = CONTRACT_4_ADDRESS;
window.CONTRACT_5_ADDRESS = CONTRACT_5_ADDRESS;
window.DAI_ADDRESS = DAI_ADDRESS;
window.IAM_ADDRESS = CONTRACT_1_ADDRESS; // Default to old contract
window.IAM_ADDRESS_OLD = IAM_ADDRESS_OLD;
window.IAM_ADDRESS_NEW = IAM_ADDRESS_NEW;

// Contract configuration object
window.contractConfig = {
    address: CONTRACT_1_ADDRESS, // Default to old contract
    ABI: MIN_IAM_ABI,
    contract: null
};

// Wait for ethers to be available
async function waitForEthers() {
    let attempts = 0;
    const maxAttempts = 50;
    
    while (attempts < maxAttempts) {
        if (typeof ethers !== 'undefined' && ethers.providers) {
            console.log('✅ Ethers v5 detected');
            return ethers;
        } else if (typeof ethers !== 'undefined' && ethers.BrowserProvider) {
            console.log('✅ Ethers v6 detected');
            return ethers;
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Ethers library not found after maximum attempts');
}

// Connect wallet function
async function connectWallet() {
    try {
        console.log('🔍 Debugging wallet connection...');
        console.log('🔍 window.ethereum:', typeof window.ethereum);
        
        if (!window.ethereum) {
            throw new Error('MetaMask not installed');
        }
        
        const ethers = await waitForEthers();
        console.log('✅ Ethers v6 fully loaded after', Date.now() - Date.now(), 'ms');
        
        // Get current contract address
        const currentContractAddress = window.getIAMAddress();
        console.log('🔍 Using stored contract address:', currentContractAddress);
        
        console.log('🔍 Connecting wallet with contract address:', currentContractAddress);
        
        let provider, signer, contract;
        
        if (ethers.BrowserProvider) {
            console.log('🔧 Using ethers v6');
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            contract = new ethers.Contract(currentContractAddress, MIN_IAM_ABI, signer);
        } else {
            console.log('🔧 Using ethers v5');
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            contract = new ethers.Contract(currentContractAddress, MIN_IAM_ABI, signer);
        }
        
        console.log('✅ Wallet connected successfully:', await signer.getAddress());
        
        // Update global contract config
        window.contractConfig.contract = contract;
        window.contractConfig.address = currentContractAddress;
        
        return {
            provider,
            signer,
            address: await signer.getAddress(),
            contract,
            config: window.contractConfig
        };
        
    } catch (error) {
        console.error('❌ Wallet connection failed:', error);
        throw error;
    }
}

// Get IAM address function
function getIAMAddress() {
    const stored = localStorage.getItem('selectedContractAddress');
    if (stored) {
        return stored;
    }
    
    // Default to old contract for all pages
    return CONTRACT_1_ADDRESS;
}

// Set IAM address function
function setIAMAddress(address) {
    localStorage.setItem('selectedContractAddress', address);
    window.IAM_ADDRESS = address;
}

// Set global functions
window.connectWallet = connectWallet;
window.getIAMAddress = getIAMAddress;
window.setIAMAddress = setIAMAddress;

// Helper functions for user validation (checks user.index)
function isUserActive(user) {
    if (!user) return false;
    
    // Only check user.index
    if (user.index !== undefined && user.index !== null) {
        return BigInt(user.index) !== 0n;
    }
    
    return false;
}

function getUserNumValue(user) {
    if (!user) return null;
    
    // Only check user.index
    if (user.index !== undefined && user.index !== null) {
        return BigInt(user.index);
    }
    
    return null;
}

// Make helper functions globally available
window.isUserActive = isUserActive;
window.getUserNumValue = getUserNumValue;

console.log('✅ Clean config loaded - Old Contract (Default)');
console.log('📍 Contract Addresses:');
console.log('   Old Contract (Default):', IAM_ADDRESS_OLD);
console.log('   New Contract:', IAM_ADDRESS_NEW);
console.log('   Current IAM_ADDRESS:', window.IAM_ADDRESS);
console.log('🔧 ABI Functions:', MIN_IAM_ABI.length);
