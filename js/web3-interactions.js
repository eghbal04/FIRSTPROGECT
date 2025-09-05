// Web3 Interactions Module - فقط توابع مخصوص تعامل با قرارداد

// تابع خرید توکن
async function buyTokens(maticAmount) {
    try {
        const connection = await window.connectWallet();
        if (!connection || !connection.contract) {
            throw new Error('No wallet connection available');
        }
        
        const { contract } = connection;
        const maticWei = ethers.parseEther(maticAmount.toString());
        const tx = await contract.buyTokens({ value: maticWei });
        const receipt = await tx.wait();
        
        return {
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber
        };
    } catch (error) {
        console.error('Web3: Error buying tokens:', error);
        throw error;
    }
}

// تابع فروش توکن
async function sellTokens(tokenAmount) {
    try {
        const connection = await window.connectWallet();
        if (!connection || !connection.contract) {
            throw new Error('No wallet connection available');
        }
        
        const { contract } = connection;
        const tokenWei = ethers.parseUnits(tokenAmount.toString(), 18);
        const tx = await contract.sellTokens(tokenWei);
        const receipt = await tx.wait();
        
        return {
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber
        };
    } catch (error) {
        console.error('Web3: Error selling tokens:', error);
        throw error;
    }
}

// تابع ثبت‌نام و فعال‌سازی
async function registerAndActivate(referrerAddress, tokenAmount) {
    try {
        const connection = await window.connectWallet();
        if (!connection || !connection.contract) {
            throw new Error('No wallet connection available');
        }
        
        const { contract } = connection;
        const tokenWei = ethers.parseUnits(tokenAmount.toString(), 18);
        const tx = await contract.registerAndActivate(referrerAddress, referrerAddress, tokenWei);
        const receipt = await tx.wait();
        
        return {
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber
        };
    } catch (error) {
        console.error('Web3: Error registering user:', error);
        throw error;
    }
}

// تابع دریافت پاداش‌ها
async function claimRewards() {
    try {
        const connection = await window.connectWallet();
        if (!connection || !connection.contract) {
            throw new Error('No wallet connection available');
        }
        
        const { contract } = connection;
        const tx = await contract.claim();
        const receipt = await tx.wait();
        
        return {
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber
        };
    } catch (error) {
        console.error('Web3: Error claiming rewards:', error);
        throw error;
    }
}

// تابع دریافت درخت کاربر
async function getUserTree(userAddress) {
    try {
        const connection = await window.connectWallet();
        if (!connection || !connection.contract) {
            throw new Error('No wallet connection available');
        }
        
        const { contract } = connection;
        const [left, right, activated, binaryPoints, binaryPointCap] = await contract.getUserTree(userAddress);
        
        return {
            left,
            right,
            activated,
            binaryPoints: ethers.formatUnits(binaryPoints, 18),
            binaryPointCap: parseInt(ethers.formatUnits(binaryPointCap, 18))
        };
    } catch (error) {
        console.error('Web3: Error getting user tree:', error);
        throw error;
    }
}

// تابع فراخوانی تابع قرارداد
async function callContractFunction(functionName, ...args) {
    try {
        const connection = await window.connectWallet();
        if (!connection || !connection.contract) {
            throw new Error('No wallet connection available');
        }
        
        const { contract } = connection;
        
        if (typeof contract[functionName] !== 'function') {
            throw new Error(`Function ${functionName} not found in contract`);
        }
        
        // استفاده از retry برای عملیات‌های حساس
        if (window.retryRpcOperation) {
            return await window.retryRpcOperation(async () => {
                return await contract[functionName](...args);
            });
        } else {
            return await contract[functionName](...args);
        }
    } catch (error) {
        console.error(`Web3: Error calling contract function ${functionName}:`, error);
        throw error;
    }
}