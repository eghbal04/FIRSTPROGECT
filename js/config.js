// Minimal config (cleaned)

// Contract addresses
const IAM_ADDRESS = '0x2D3923A5ba62B2bec13b9181B1E9AE0ea2C8118D';
const DAI_ADDRESS = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';

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
    // Price getters (try all common names)
    { "inputs": [], "name": "registrationPrice", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getRegistrationPrice", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
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
    { "inputs": [], "name": "getPointValue", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getContractdaiBalance", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "cashBack", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    // Write: transfer index ownership (as provided)
    { "inputs": [{"internalType":"address","name":"newOwner","type":"address"}], "name": "transferIndexOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
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

// Allow replacing ABI at runtime
window.setIAMAbi = function(newAbiArray) {
    if (Array.isArray(newAbiArray) && newAbiArray.length > 0) {
        window.IAM_ABI = newAbiArray;
    }
};

// Helper: load common contract variables via ABI (best-effort)
async function loadContractVariables(contract) {
    const meta = {};
    const tryCall = async (name, fn, transform) => {
        try {
            if (typeof contract[fn] === 'function') {
                const v = await contract[fn]();
                meta[name] = transform ? transform(v) : v;
            }
        } catch {}
    };
    await tryCall('name', 'name');
    await tryCall('symbol', 'symbol');
    await tryCall('decimals', 'decimals', v => (typeof v === 'bigint' ? Number(v) : Number(v)));
    await tryCall('totalSupply', 'totalSupply', v => (window.ethers && ethers.formatUnits ? ethers.formatUnits(v, 18) : String(v)));
    await tryCall('owner', 'owner');
    await tryCall('deployer', 'deployer');
    // total users (various common names)
    await tryCall('totalUsers', 'totalUsers', v => v.toString());
    if (meta.totalUsers === undefined) await tryCall('totalUsers', 'getTotalUsers', v => v.toString());
    if (meta.totalUsers === undefined) await tryCall('totalUsers', 'usersCount', v => v.toString());
    // Try to detect DAI address if exposed by contract
    await tryCall('daiAddress', 'dai');
    if (meta.daiAddress === undefined) await tryCall('daiAddress', 'daiAddress');
    return meta;
}

// Provide a single source of truth for wallet connection from config
window.connectWallet = async function() {
    if (!window.ethereum) {
        throw new Error('MetaMask/ethereum provider در دسترس نیست');
    }

    // Return cached connection if valid
    if (window.contractConfig && window.contractConfig.contract && window.contractConfig.signer && window.contractConfig.address) {
        try {
            const currentAddress = await window.contractConfig.signer.getAddress();
            if (currentAddress && currentAddress.toLowerCase() === window.contractConfig.address.toLowerCase()) {
                return window.contractConfig;
            }
        } catch {}
    }

    // Request accounts and build connection
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts && accounts[0] ? accounts[0] : null;
    if (!address) throw new Error('هیچ آدرسی از کیف پول دریافت نشد');

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Build contract with minimal ABI
    const contract = new ethers.Contract(IAM_ADDRESS, MIN_IAM_ABI, signer);
    // Optionally skip metadata reads to avoid noisy RPC errors on pages that don't need them
    let meta = {};
    if (!window.SKIP_META) {
        try { meta = await loadContractVariables(contract); } catch { meta = {}; }
    }

    window.contractConfig = {
        IAM_ADDRESS,
        DAI_ADDRESS: meta.daiAddress || DAI_ADDRESS,
        provider,
        signer,
        contract,
				address,
        meta,
    };

    return window.contractConfig;
};

// Reload contract instance if ABI changes or without reconnecting wallet
window.reloadContractWithAbi = function(newAbi) {
    if (Array.isArray(newAbi) && newAbi.length > 0) {
        window.IAM_ABI = newAbi;
    }
    const abiToUse = (window.IAM_ABI && Array.isArray(window.IAM_ABI)) ? window.IAM_ABI : MIN_IAM_ABI;
    if (!window.contractConfig || !window.contractConfig.signer) {
        throw new Error('ابتدا connectWallet را فراخوانی کنید');
    }
    const { signer } = window.contractConfig;
    const contract = new ethers.Contract(IAM_ADDRESS, abiToUse, signer);
    window.contractConfig.contract = contract;
    return contract;
};

// Generic read call helper
window.callRead = async function(functionName, ...args) {
    const cfg = window.contractConfig || {};
    const contract = cfg.contract;
    if (!contract) throw new Error('قرارداد در دسترس نیست. ابتدا connectWallet را اجرا کنید');
    if (typeof contract[functionName] !== 'function') throw new Error(`تابع ${functionName} در ABI یافت نشد`);
    return await contract[functionName](...args);
};

// Generic write call helper (waits for confirmation)
window.sendWrite = async function(functionName, ...args) {
    const cfg = window.contractConfig || {};
    const contract = cfg.contract;
    if (!contract) throw new Error('قرارداد در دسترس نیست. ابتدا connectWallet را اجرا کنید');
    if (typeof contract[functionName] !== 'function') throw new Error(`تابع ${functionName} در ABI یافت نشد`);
    const tx = await contract[functionName](...args);
    return await tx.wait();
};

// Read/write by full signature to support overloaded functions
window.callReadSignature = async function(signature, ...args) {
    const cfg = window.contractConfig || {};
    const contract = cfg.contract;
    if (!contract) throw new Error('قرارداد در دسترس نیست. ابتدا connectWallet را اجرا کنید');
    try {
        const fn = contract.getFunction(signature);
        return await fn(...args);
  } catch (e) {
        throw new Error(`فراخوانی خواندنی ${signature} ناموفق بود: ${e.message||e}`);
    }
};

window.sendWriteSignature = async function(signature, ...args) {
    const cfg = window.contractConfig || {};
    const contract = cfg.contract;
    if (!contract) throw new Error('قرارداد در دسترس نیست. ابتدا connectWallet را اجرا کنید');
    try {
        const fn = contract.getFunction(signature);
        const tx = await fn(...args);
        return await tx.wait();
  } catch (e) {
        throw new Error(`ارسال تراکنش ${signature} ناموفق بود: ${e.message||e}`);
    }
};


