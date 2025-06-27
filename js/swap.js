// --- Swap Logic ---
const swapForm = document.getElementById('swapForm');
const swapDirection = document.getElementById('swapDirection');
const swapAmount = document.getElementById('swapAmount');
const swapInfo = document.getElementById('swapInfo');
const swapButton = document.getElementById('swapButton');
const swapStatus = document.getElementById('swapStatus');

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
    const value = swapAmount.value;
    // مقدار باید عدد مثبت و معتبر باشد (در هر دو حالت)
    const parsed = parseFloat(value);
    swapButton.disabled = !(parsed > 0 && value !== '' && !isNaN(parsed));
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
            }
        } else {
            const { contract, address } = await connectWallet();
            const rawBalance = await contract.balanceOf(address);
            if (rawBalance > 0n) {
                // فقط عدد صحیح بدون اعشار
                const maxInt = Math.floor(parseFloat(ethers.formatUnits(rawBalance, 18)));
                swapAmount.value = maxInt;
                await updateRateInfo();
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

// حذف نسخه‌های تکراری و local از connectWallet و ...
// استفاده فقط از توابع مشترک web3-interactions.js

// showSwapError را نگه دارید
function showSwapError(message) {
    const swapStatus = document.getElementById('swapStatus');
    if (swapStatus) {
        swapStatus.textContent = message;
        swapStatus.style.color = '#ff6b6b';
    }
} 