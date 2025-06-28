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
        // بررسی اینکه آیا contractConfig موجود است
        if (!window.contractConfig) {
            return {
                connected: false,
                error: "Contract config not initialized"
            };
        }
        
        // بررسی اینکه آیا signer موجود است
        if (!window.contractConfig.signer) {
            return {
                connected: false,
                error: "No signer available"
            };
        }
        
        // بررسی اینکه آیا در حال اتصال هستیم
        if (window.contractConfig.isConnecting) {
            return {
                connected: false,
                error: "Connection in progress"
            };
        }
        
        const address = await window.contractConfig.signer.getAddress();
        if (!address) {
            return {
                connected: false,
                error: "No wallet address"
            };
        }
        
        const provider = window.contractConfig.provider;
        if (!provider) {
            return {
                connected: false,
                error: "No provider available"
            };
        }
        
        const network = await provider.getNetwork();
        
        return {
            connected: true,
            address,
            network: network.name,
            chainId: network.chainId
        };
    } catch (error) {
        console.error("Error checking connection:", error);
        return {
            connected: false,
            error: error.message
        };
    }
}

// تابع اتصال به کیف پول
async function connectWallet() {
    if (!window.contractConfig) {
        throw new Error("Contract config not initialized");
    }
    
    // بررسی اینکه آیا قبلاً متصل هستیم
    if (window.contractConfig.signer && window.contractConfig.contract) {
        try {
            const address = await window.contractConfig.signer.getAddress();
            if (address) {
                return {
                    provider: window.contractConfig.provider,
                    contract: window.contractConfig.contract,
                    signer: window.contractConfig.signer,
                    address: address
                };
            }
        } catch (error) {
            // اگر signer معتبر نیست، دوباره اتصال برقرار کنیم
            console.log("Existing connection invalid, reconnecting...");
        }
    }
    
    // اگر در حال اتصال هستیم، منتظر بمان
    if (window.contractConfig.isConnecting) {
        console.log("Wallet connection in progress, waiting...");
        let waitCount = 0;
        const maxWaitTime = 50; // حداکثر 5 ثانیه
        
        while (window.contractConfig.isConnecting && waitCount < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, 100));
            waitCount++;
            
            // اگر اتصال موفق شد، از حلقه خارج شو
            if (window.contractConfig.signer && window.contractConfig.contract) {
                try {
                    const address = await window.contractConfig.signer.getAddress();
                    if (address) {
                        console.log("Connection completed while waiting");
                        return {
                            provider: window.contractConfig.provider,
                            contract: window.contractConfig.contract,
                            signer: window.contractConfig.signer,
                            address: address
                        };
                    }
                } catch (error) {
                    // ادامه انتظار
                }
            }
        }
        
        // اگر زمان انتظار تمام شد، isConnecting را ریست کن
        if (window.contractConfig.isConnecting) {
            console.log("Connection timeout, resetting isConnecting flag");
            window.contractConfig.isConnecting = false;
        }
    }
    
    // تلاش برای اتصال
    const success = await window.contractConfig.initializeWeb3();
    if (!success) {
        throw new Error("Failed to connect to wallet");
    }
    
    // بررسی اینکه آیا اتصال موفق بود
    if (!window.contractConfig.signer) {
        throw new Error("Failed to connect to wallet");
    }
    
    return {
        provider: window.contractConfig.provider,
        contract: window.contractConfig.contract,
        signer: window.contractConfig.signer,
        address: await window.contractConfig.signer.getAddress()
    };
}

// Update rate info (refactored)
async function updateRateInfo() {
    try {
        const connection = await checkConnection();
        if (!connection.connected) {
            swapInfo.textContent = 'لطفا ابتدا کیف پول خود را متصل کنید';
            return;
        }
        const { contract } = await connectWallet();
        let rateText = '-';
        if (swapDirection.value === 'matic-to-lvl') {
            const amount = swapAmount.value ? ethers.parseEther(swapAmount.value) : 0n;
            if (amount > 0n) {
                const tokens = await contract.estimateBuy(amount);
                rateText = `هر 1 MATIC ≈ ${(ethers.formatUnits(tokens, 18))} LVL`;
            }
        } else {
            const amount = swapAmount.value ? ethers.parseUnits(swapAmount.value, 18) : 0n;
            if (amount > 0n) {
                const matic = await contract.estimateSell(amount);
                rateText = `هر 1 LVL ≈ ${(ethers.formatEther(matic))} MATIC`;
            }
        }
        swapInfo.textContent = 'نرخ تبدیل: ' + rateText;
    } catch (e) {
        swapInfo.textContent = 'نرخ تبدیل: -';
    }
}

async function loadBalances() {
    try {
        const { signer, contract, address } = await connectWallet();
        // دریافت موجودی MATIC
        const maticBalance = await signer.provider.getBalance(address);
        const maticFormatted = parseInt(ethers.formatEther(maticBalance)).toLocaleString('en-US');
        document.getElementById('maticBalance').textContent = `MATIC: ${maticFormatted}`;
        // دریافت موجودی LVL
        const lvlBalance = await contract.balanceOf(address);
        const lvlFormatted = parseInt(ethers.formatUnits(lvlBalance, 18)).toLocaleString('en-US');
        document.getElementById('lvlBalance').textContent = `LVL: ${lvlFormatted}`;
    } catch (error) {
        console.error("Error loading balances:", error);
    }
}

function validateSwapAmount() {
    if (!swapAmount || !swapButton) return;
    
    const value = swapAmount.value.trim(); // حذف فاصله‌های اضافی
    
    // بررسی اینکه آیا مقدار خالی است
    if (value === '' || value === null || value === undefined) {
        swapButton.disabled = true;
        return;
    }
    
    // تبدیل به عدد و بررسی اعتبار
    const parsed = parseFloat(value);
    
    // بررسی اینکه آیا عدد معتبر است
    if (isNaN(parsed) || parsed <= 0) {
        swapButton.disabled = true;
        return;
    }
    
    // بررسی حداقل مقدار (برای جلوگیری از تراکنش‌های خیلی کوچک)
    if (swapDirection.value === 'matic-to-lvl') {
        // حداقل 0.01 MATIC
        if (parsed < 0.01) {
            swapButton.disabled = true;
            return;
        }
    } else {
        // حداقل 1 LVL
        if (parsed < 1) {
            swapButton.disabled = true;
            return;
        }
    }
    
    // اگر همه شرایط برقرار بود، دکمه را فعال کن
    swapButton.disabled = false;
}

swapAmount.addEventListener('input', () => {
    updateRateInfo();
    validateSwapAmount();
});

swapAmount.addEventListener('keyup', () => {
    validateSwapAmount();
});

swapAmount.addEventListener('paste', () => {
    setTimeout(() => {
        validateSwapAmount();
    }, 100);
});

swapDirection.addEventListener('change', () => {
    updateRateInfo();
    validateSwapAmount();
});

document.addEventListener('DOMContentLoaded', async () => {
    // غیرفعال کردن دکمه در ابتدا
    if (swapButton) {
        swapButton.disabled = true;
    }
    
    await loadBalances();
    validateSwapAmount();
});

document.getElementById('maxButton').addEventListener('click', setMaxAmount);

async function setMaxAmount() {
    try {
        if (swapDirection.value === 'matic-to-lvl') {
            const { signer, address } = await connectWallet();
            const rawBalance = await signer.provider.getBalance(address);
            const feeBuffer = ethers.parseEther("0.01");
            const usableBalance = rawBalance > feeBuffer ? rawBalance - feeBuffer : 0n;
            if (usableBalance > 0n) {
                // فقط عدد صحیح بدون اعشار
                const maxInt = Math.floor(parseFloat(ethers.formatEther(usableBalance)));
                swapAmount.value = maxInt;
                await updateRateInfo();
                validateSwapAmount();
            }
        } else {
            const { contract, address } = await connectWallet();
            const rawBalance = await contract.balanceOf(address);
            if (rawBalance > 0n) {
                // فقط عدد صحیح بدون اعشار
                const maxInt = Math.floor(parseFloat(ethers.formatUnits(rawBalance, 18)));
                swapAmount.value = maxInt;
                await updateRateInfo();
                validateSwapAmount();
            }
        }
    } catch (error) {
        console.error("Error setting max amount:", error);
        swapStatus.textContent = 'خطا در دریافت موجودی: ' + error.message;
    }
}

swapForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    swapStatus.textContent = '';
    swapStatus.style.color = '';
    swapButton.disabled = true;
    try {
        const connection = await checkConnection();
        if (!connection.connected) throw new Error('اتصال کیف پول برقرار نشد.');
        const amount = parseFloat(swapAmount.value);
        if (!amount || amount <= 0) throw new Error('مقدار معتبر وارد کنید.');
        let result;
        if (swapDirection.value === 'matic-to-lvl') {
            result = await buyTokens(amount);
        } else {
            result = await sellTokens(amount);
        }
        swapStatus.textContent = 'در حال ارسال تراکنش...';
        swapStatus.style.color = '';
        if (result && result.transactionHash) {
            swapStatus.textContent = 'تراکنش با موفقیت انجام شد!';
            swapStatus.style.color = '#4CAF50';
            setTimeout(() => {
                swapStatus.textContent = '';
                swapStatus.style.color = '';
            }, 4000);
        }
        swapAmount.value = '';
        await updateRateInfo();
        await loadBalances();
    } catch (err) {
        swapStatus.textContent = 'خطا: ' + (err.message || err);
        swapStatus.style.color = '#ff6b6b';
    }
    swapButton.disabled = false;
});

// showSwapError را نگه دارید
function showSwapError(message) {
    const swapStatus = document.getElementById('swapStatus');
    if (swapStatus) {
        swapStatus.textContent = message;
        swapStatus.style.color = '#ff6b6b';
    }
} 