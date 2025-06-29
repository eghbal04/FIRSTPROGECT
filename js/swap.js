// --- Swap Logic ---
const swapForm = document.getElementById('swapForm');
const swapDirection = document.getElementById('swapDirection');
const swapAmount = document.getElementById('swapAmount');
const swapInfo = document.getElementById('swapInfo');
const swapButton = document.getElementById('swapButton');
const swapStatus = document.getElementById('swapStatus');

// تابع بررسی اتصال کیف پول
async function checkConnection() {
    try {
        const result = await window.checkConnection();
        if (!result.connected) {
            showSwapError('لطفاً ابتدا کیف پول خود را متصل کنید');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Swap: Connection check failed:', error);
        showSwapError('خطا در بررسی اتصال کیف پول');
        return false;
    }
}

// تابع به‌روزرسانی اطلاعات نرخ تبدیل
async function updateRateInfo() {
    try {
        const amount = document.getElementById('swapAmount').value;
        const direction = document.getElementById('swapDirection').value;
        
        if (!amount || parseFloat(amount) <= 0) {
            document.getElementById('swapInfo').textContent = 'نرخ تبدیل: -';
            return;
        }
        
        const walletConfig = await window.connectWallet();
        
        if (!walletConfig || !walletConfig.contract) {
            document.getElementById('swapInfo').textContent = 'نرخ تبدیل: اتصال نشده';
            return;
        }
        
        const { contract } = walletConfig;
        
        if (direction === 'matic-to-lvl') {
            const estimated = await contract.estimateBuy(ethers.parseEther(amount));
            const estimatedFormatted = ethers.formatUnits(estimated, 18);
            document.getElementById('swapInfo').textContent = `نرخ تبدیل: ${amount} POL = ${estimatedFormatted} LVL`;
        } else {
            const estimated = await contract.estimateSell(ethers.parseUnits(amount, 18));
            const estimatedFormatted = ethers.formatEther(estimated);
            document.getElementById('swapInfo').textContent = `نرخ تبدیل: ${amount} LVL = ${estimatedFormatted} POL`;
        }
        
    } catch (error) {
        console.error('Swap: Error updating rate info:', error);
        document.getElementById('swapInfo').textContent = 'خطا در محاسبه نرخ تبدیل';
    }
}

// تابع بارگذاری موجودی‌ها
async function loadBalances() {
    try {
        const walletConfig = await window.connectWallet();
        
        if (!walletConfig || !walletConfig.contract || !walletConfig.address || !walletConfig.provider) {
            console.log('Swap: No wallet connection available');
            document.getElementById('maticBalance').textContent = 'POL: اتصال نشده';
            document.getElementById('lvlBalance').textContent = 'LVL: اتصال نشده';
            return;
        }
        
        const { contract, address, provider } = walletConfig;
        
        // دریافت موجودی‌ها
        const [maticBalance, lvlBalance] = await Promise.all([
            provider.getBalance(address),
            contract.balanceOf(address)
        ]);
        
        // فرمت کردن موجودی‌ها
        const formattedMatic = ethers.formatEther(maticBalance);
        const formattedLvl = ethers.formatUnits(lvlBalance, 18);
        
        // به‌روزرسانی UI
        document.getElementById('maticBalance').textContent = `POL: ${parseFloat(formattedMatic).toFixed(4)}`;
        document.getElementById('lvlBalance').textContent = `LVL: ${parseFloat(formattedLvl).toFixed(2)}`;
        
    } catch (error) {
        console.error('Swap: Error loading balances:', error);
        document.getElementById('maticBalance').textContent = 'POL: خطا';
        document.getElementById('lvlBalance').textContent = 'LVL: خطا';
    }
}

// تابع اعتبارسنجی مقدار تبدیل
function validateSwapAmount() {
    const amount = document.getElementById('swapAmount').value;
    const direction = document.getElementById('swapDirection').value;
    const submitBtn = document.getElementById('swapButton');
    
    if (!amount || parseFloat(amount) <= 0) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'مقدار را وارد کنید';
        return false;
    }
    
    submitBtn.disabled = false;
    submitBtn.textContent = direction === 'matic-to-lvl' ? 'تبدیل POL به LVL' : 'تبدیل LVL به POL';
    return true;
}

// تابع تنظیم حداکثر مقدار
async function setMaxAmount() {
    try {
        const direction = document.getElementById('swapDirection').value;
        const walletConfig = await window.connectWallet();
        
        if (!walletConfig || !walletConfig.contract || !walletConfig.address || !walletConfig.provider) {
            showSwapError('لطفاً ابتدا کیف پول را متصل کنید');
            return;
        }
        
        const { contract, address, provider } = walletConfig;
        
        let maxAmount;
        
        if (direction === 'matic-to-lvl') {
            // برای تبدیل POL به LVL، حداکثر موجودی POL
            const maticBalance = await provider.getBalance(address);
            maxAmount = ethers.formatEther(maticBalance);
        } else {
            // برای تبدیل LVL به POL، حداکثر موجودی LVL
            const lvlBalance = await contract.balanceOf(address);
            maxAmount = ethers.formatUnits(lvlBalance, 18);
        }
        
        // کسر کمی برای کارمزد تراکنش
        const adjustedAmount = parseFloat(maxAmount) * 0.99;
        document.getElementById('swapAmount').value = adjustedAmount.toFixed(6);
        
        // به‌روزرسانی اطلاعات نرخ تبدیل
        await updateRateInfo();
        
    } catch (error) {
        console.error('Swap: Error setting max amount:', error);
        showSwapError('خطا در تنظیم حداکثر مقدار');
    }
}

// تابع نمایش خطای swap
function showSwapError(message) {
    const statusElement = document.getElementById('swapStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'swap-status error';
        
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'swap-status';
        }, 5000);
    }
}

// تابع نمایش موفقیت swap
function showSwapSuccess(message) {
    const statusElement = document.getElementById('swapStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'swap-status success';
        
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'swap-status';
        }, 5000);
    }
}

// راه‌اندازی event listeners
document.addEventListener('DOMContentLoaded', function() {
    const swapForm = document.getElementById('swapForm');
    const swapDirection = document.getElementById('swapDirection');
    const swapAmount = document.getElementById('swapAmount');
    const maxButton = document.getElementById('maxButton');
    const swapButton = document.getElementById('swapButton');
    
    if (swapForm) {
        swapForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                // بررسی اتصال
                if (!await checkConnection()) {
                    return;
                }
                
                const direction = swapDirection.value;
                const amount = swapAmount.value;
                
                if (!validateSwapAmount()) {
                    return;
                }
                
                // نمایش وضعیت loading
                swapButton.disabled = true;
                swapButton.textContent = 'در حال پردازش...';
                showSwapSuccess('در حال پردازش تراکنش...');
                
                const walletConfig = await window.connectWallet();
                
                if (!walletConfig || !walletConfig.contract) {
                    showSwapError('لطفاً ابتدا کیف پول را متصل کنید');
                    return;
                }
                
                const { contract } = walletConfig;
                let tx;
                if (direction === 'matic-to-lvl') {
                    // تبدیل POL به LVL
                    const maticWei = ethers.parseEther(amount);
                    tx = await contract.buyTokens({ value: maticWei });
                } else {
                    // تبدیل LVL به POL
                    const lvlWei = ethers.parseUnits(amount, 18);
                    tx = await contract.sellTokens(lvlWei);
                }
                
                await tx.wait();
                
                showSwapSuccess('تراکنش با موفقیت انجام شد!');
                
                // به‌روزرسانی موجودی‌ها
                await loadBalances();
                
            } catch (error) {
                console.error('Swap: Error processing transaction:', error);
                showSwapError('خطا در پردازش تراکنش: ' + error.message);
            } finally {
                swapButton.disabled = false;
                swapButton.textContent = 'تبدیل';
            }
        });
    }
    
    if (swapDirection) {
        swapDirection.addEventListener('change', function() {
            validateSwapAmount();
            updateRateInfo();
        });
    }
    
    if (swapAmount) {
        swapAmount.addEventListener('input', function() {
            validateSwapAmount();
            updateRateInfo();
        });
    }
    
    if (maxButton) {
        maxButton.addEventListener('click', setMaxAmount);
    }
    
    // بارگذاری اولیه
    loadBalances();
});

console.log('Swap module loaded successfully'); 