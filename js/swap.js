// --- Swap Logic ---
const swapForm = document.getElementById('swapForm');
const swapDirection = document.getElementById('swapDirection');
const swapAmount = document.getElementById('swapAmount');
const swapInfo = document.getElementById('swapInfo');
const swapButton = document.getElementById('swapButton');
const swapStatus = document.getElementById('swapStatus');

// Update rate info
async function updateRateInfo() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum || window);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, LEVELUP_ABI, provider);
        let rateText = '-';
        if (swapDirection.value === 'matic-to-lvl') {
            if (typeof contract._maticToTokens === 'function') {
                const amount = ethers.utils.parseEther((swapAmount.value || '0'));
                const tokens = await contract._maticToTokens(amount);
                rateText = `هر 1 MATIC ≈ ${(ethers.utils.formatUnits(tokens, 18))} LVL`;
            }
        } else {
            if (typeof contract._tokensToMatic === 'function') {
                const amount = ethers.utils.parseUnits((swapAmount.value || '0'), 18);
                const matic = await contract._tokensToMatic(amount);
                rateText = `هر 1 LVL ≈ ${(ethers.utils.formatEther(matic))} MATIC`;
            }
        }
        swapInfo.textContent = 'نرخ تبدیل: ' + rateText;
    } catch (e) {
        swapInfo.textContent = 'نرخ تبدیل: -';
    }
}
async function loadBalances() {
    try {
        const { signer, contract } = await connectWallet();
        const address = await signer.getAddress();
        
        // دریافت موجودی MATIC
        const maticBalance = await signer.provider.getBalance(address);
        document.getElementById('maticBalance').textContent = `MATIC: ${ethers.formatEther(maticBalance)}`;
        
        // دریافت موجودی LVL
        const lvlBalance = await contract.balanceOf(address);
        document.getElementById('lvlBalance').textContent = `LVL: ${ethers.formatUnits(lvlBalance, 18)}`;
    } catch (error) {
        console.error("Error loading balances:", error);
    }
}

// تابع اعتبارسنجی مقدار و فعال/غیرفعال کردن دکمه سواپ
function validateSwapAmount() {
    if (!swapAmount || !swapButton) return;
    const value = parseFloat(swapAmount.value);
    swapButton.disabled = !(value > 0);
}

swapAmount.addEventListener('input', () => {
    updateRateInfo();
    validateSwapAmount();
});

swapDirection.addEventListener('change', () => {
    updateRateInfo();
    validateSwapAmount();
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadBalances();
    validateSwapAmount();
    // بقیه کدهای موجود...
});
// اضافه کردن event listener برای دکمه ماکسیمم
document.getElementById('maxButton').addEventListener('click', setMaxAmount);

// اصلاح تابع setMaxAmount
async function setMaxAmount() {
    try {
        const swapDirection = document.getElementById('swapDirection');
        const swapAmount = document.getElementById('swapAmount');

        if (swapDirection.value === 'matic-to-lvl') {
            const { signer } = await connectWallet();
            const address = await signer.getAddress();
            const rawBalance = await signer.provider.getBalance(address);

            const feeBuffer = ethers.parseEther("0.01");
            const usableBalance = rawBalance > feeBuffer ? rawBalance - feeBuffer : 0n;

            if (usableBalance > 0n) {
                swapAmount.value = ethers.formatEther(usableBalance);
                await updateRateInfo(); // تغییر از updateExchangeRate به updateRateInfo
            }

        } else {
            const { signer, contract } = await connectWallet();
            const address = await signer.getAddress();
            const rawBalance = await contract.balanceOf(address);

            if (rawBalance > 0n) {
                swapAmount.value = ethers.formatUnits(rawBalance, 18);
                await updateRateInfo(); // تغییر از updateExchangeRate به updateRateInfo
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
    swapButton.disabled = true;
    try {
        const { signer, address } = await connectWallet();
        if (!signer) throw new Error('اتصال کیف پول برقرار نشد.');
        const contract = new ethers.Contract(CONTRACT_ADDRESS, LEVELUP_ABI, signer);
        const amount = parseFloat(swapAmount.value);
        if (!amount || amount <= 0) throw new Error('مقدار معتبر وارد کنید.');
        let tx;
        if (swapDirection.value === 'matic-to-lvl') {
            // خرید LVL با MATIC
            tx = await contract.buyTokens({ value: ethers.utils.parseEther(amount.toString()) });
        } else {
            // فروش LVL به MATIC (نیاز به approve دارد)
            // فرض: تابع sellTokens(uint256 amount)
            const tokenAmount = ethers.utils.parseUnits(amount.toString(), 18);
            // approve
            const approveTx = await contract.approve(CONTRACT_ADDRESS, tokenAmount);
            await approveTx.wait();
            tx = await contract.sellTokens(tokenAmount);
        }
        swapStatus.textContent = 'در حال ارسال تراکنش...';
        await tx.wait();
        swapStatus.textContent = 'تراکنش با موفقیت انجام شد!';
        swapAmount.value = '';
        updateRateInfo();
    } catch (err) {
        swapStatus.textContent = 'خطا: ' + (err.message || err);
    }
    swapButton.disabled = false;
});

updateRateInfo();

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // بررسی وجود ethers و contractConfig
        if (typeof ethers === 'undefined' || !window.contractConfig) {
            throw new Error("Ethers.js or contract config not loaded");
        }

        // راه‌اندازی فرم سواپ
        setupSwapForm();

        // به‌روزرسانی نرخ تبدیل
        await updateExchangeRate();

    } catch (error) {
        console.error("Error in swap page:", error);
        showSwapError("خطا در بارگذاری صفحه سواپ");
    }
});

// راه‌اندازی فرم سواپ
function setupSwapForm() {
    const swapForm = document.getElementById('swapForm');
    const swapDirection = document.getElementById('swapDirection');
    const swapAmount = document.getElementById('swapAmount');
    const swapButton = document.getElementById('swapButton');

    if (!swapForm || !swapDirection || !swapAmount || !swapButton) return;

    // به‌روزرسانی نرخ تبدیل هنگام تغییر جهت
    swapDirection.addEventListener('change', updateExchangeRate);
    
    // به‌روزرسانی نرخ تبدیل هنگام تغییر مقدار
    swapAmount.addEventListener('input', updateExchangeRate);

    // مدیریت ارسال فرم
    swapForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await performSwap();
    });
}

// به‌روزرسانی نرخ تبدیل
async function updateExchangeRate() {
    try {
        const swapDirection = document.getElementById('swapDirection');
        const swapAmount = document.getElementById('swapAmount');
        const swapInfo = document.getElementById('swapInfo');

        if (!swapDirection || !swapAmount || !swapInfo) return;

        const direction = swapDirection.value;
        const amount = parseFloat(swapAmount.value) || 0;

        if (amount <= 0) {
            swapInfo.textContent = 'نرخ تبدیل: -';
            return;
        }

        // بررسی اتصال کیف پول
        const connection = await checkConnection();
        if (!connection.connected) {
            swapInfo.textContent = 'لطفا ابتدا کیف پول خود را متصل کنید';
            return;
        }

        const { contract } = await connectWallet();

        let estimatedAmount;
        if (direction === 'matic-to-lvl') {
            const maticAmount = ethers.parseEther(amount.toString());
            const tokenAmount = await contract.estimateBuy(maticAmount);
            estimatedAmount = ethers.formatUnits(tokenAmount, 18);
            swapInfo.textContent = `نرخ تبدیل: ${amount} MATIC = ${estimatedAmount} LVL`;
        } else {
            const tokenAmount = ethers.parseUnits(amount.toString(), 18);
            const maticAmount = await contract.estimateSell(tokenAmount);
            estimatedAmount = ethers.formatEther(maticAmount);
            swapInfo.textContent = `نرخ تبدیل: ${amount} LVL = ${estimatedAmount} MATIC`;
        }

    } catch (error) {
        console.error("Error updating exchange rate:", error);
        const swapInfo = document.getElementById('swapInfo');
        if (swapInfo) swapInfo.textContent = 'خطا در محاسبه نرخ تبدیل';
    }
}

// انجام عملیات سواپ
async function performSwap() {
    try {
        const swapDirection = document.getElementById('swapDirection');
        const swapAmount = document.getElementById('swapAmount');
        const swapButton = document.getElementById('swapButton');
        const swapStatus = document.getElementById('swapStatus');

        if (!swapDirection || !swapAmount || !swapButton || !swapStatus) return;

        const direction = swapDirection.value;
        const amount = parseFloat(swapAmount.value);

        if (amount <= 0) {
            showSwapError("لطفا مقدار معتبری وارد کنید");
            return;
        }

        // بررسی اتصال کیف پول
        const connection = await checkConnection();
        if (!connection.connected) {
            showSwapError("لطفا ابتدا کیف پول خود را متصل کنید");
            return;
        }

        // غیرفعال کردن دکمه
        swapButton.disabled = true;
        swapButton.textContent = 'در حال انجام سواپ...';
        swapStatus.textContent = 'در حال پردازش تراکنش...';

        let result;
        if (direction === 'matic-to-lvl') {
            result = await buyTokens(amount);
        } else {
            result = await sellTokens(amount);
        }

        // نمایش نتیجه موفق
        swapStatus.textContent = `سواپ با موفقیت انجام شد! تراکنش: ${result.transactionHash}`;
        swapStatus.style.color = '#4CAF50';

        // پاک کردن فرم
        swapAmount.value = '';

    } catch (error) {
        console.error("Swap error:", error);
        showSwapError("خطا در انجام سواپ: " + error.message);
    } finally {
        // فعال کردن مجدد دکمه
        const swapButton = document.getElementById('swapButton');
        if (swapButton) {
            swapButton.disabled = false;
            swapButton.textContent = 'انجام سواپ';
        }
    }
}

// نمایش خطای سواپ
function showSwapError(message) {
    const swapStatus = document.getElementById('swapStatus');
    if (swapStatus) {
        swapStatus.textContent = message;
        swapStatus.style.color = '#ff6b6b';
    }
} 