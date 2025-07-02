// --- Swap Logic ---
const swapForm = document.getElementById('swapForm');
const swapDirection = document.getElementById('swapDirection');
const swapAmount = document.getElementById('swapAmount');
const swapInfo = document.getElementById('swapInfo');
const swapButton = document.getElementById('swapButton');
const swapStatus = document.getElementById('swapStatus');

let userMaticBalance = 0;
let userLvlBalance = 0;

// دکمه سواپ در ابتدا غیرفعال باشد
if (swapButton) {
    swapButton.disabled = true;
    swapButton.textContent = 'مقدار را وارد کنید';
}

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
        document.getElementById('swapInfo').textContent = 'خطا در محاسبه نرخ تبدیل';
    }
}

// تابع بارگذاری موجودی‌ها
async function loadBalances() {
    try {
        const walletConfig = await window.connectWallet();
        if (!walletConfig || !walletConfig.contract || !walletConfig.address || !walletConfig.provider) {
            document.getElementById('maticBalance').textContent = 'POL: اتصال نشده';
            document.getElementById('lvlBalance').textContent = 'LVL: اتصال نشده';
            userMaticBalance = 0;
            userLvlBalance = 0;
            validateSwapAmount(); // وضعیت دکمه را به‌روز کن
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
        // ذخیره موجودی‌ها برای اعتبارسنجی
        userMaticBalance = parseFloat(formattedMatic);
        userLvlBalance = parseFloat(formattedLvl);
        // به‌روزرسانی UI
        document.getElementById('maticBalance').textContent = `POL: ${userMaticBalance.toFixed(4)}`;
        document.getElementById('lvlBalance').textContent = `LVL: ${userLvlBalance.toFixed(2)}`;
        // نمایش قیمت‌ها
        await displaySwapPrices();
        validateSwapAmount(); // وضعیت دکمه را به‌روز کن
    } catch (error) {
        document.getElementById('maticBalance').textContent = 'POL: خطا';
        document.getElementById('lvlBalance').textContent = 'LVL: خطا';
        userMaticBalance = 0;
        userLvlBalance = 0;
        validateSwapAmount(); // وضعیت دکمه را به‌روز کن
    }
}

// تابع اعتبارسنجی مقدار تبدیل
function validateSwapAmount() {
    const amount = document.getElementById('swapAmount').value;
    const submitBtn = document.getElementById('swapButton');
    if (!amount || parseFloat(amount) <= 0) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'مقدار را وارد کنید';
        return false;
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'تبدیل';
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

// تابع نمایش قیمت‌های مختلف
async function displaySwapPrices() {
    try {
        const walletConfig = await window.connectWallet();
        if (!walletConfig || !walletConfig.contract) {
            return;
        }
        const { contract } = walletConfig;
        // دریافت قیمت LVL/MATIC از قرارداد و قیمت MATIC/USD از API
        const [tokenPriceMatic, maticPriceUSD, registrationPrice] = await Promise.all([
            contract.getTokenPrice().catch(() => ethers.parseUnits("0.0012", 18)),
            window.fetchPolUsdPrice(),
            contract.regprice().catch(() => ethers.parseUnits("1000", 18))
        ]);
        const tokenPriceMaticFormatted = ethers.formatUnits(tokenPriceMatic, 18);
        // قیمت LVL/USD = (LVL/MATIC) * (MATIC/USD)
        const tokenPriceUSD = parseFloat(tokenPriceMaticFormatted) * parseFloat(maticPriceUSD);
        const tokenPriceUSDFormatted = tokenPriceUSD.toFixed(6);
        const maticPriceUSDFormatted = parseFloat(maticPriceUSD).toFixed(6);
        const registrationPriceFormatted = ethers.formatUnits(registrationPrice, 18);
        // محاسبه مقدار توکن برای 1 سنت و ...
        const oneCentInUSD = 0.01;
        const oneCentInMatic = (oneCentInUSD * 1e18) / parseFloat(maticPriceUSDFormatted);
        const oneCentInTokens = (oneCentInMatic * 1e18) / parseFloat(tokenPriceMaticFormatted);
        const oneCentInTokensFormatted = oneCentInTokens.toFixed(6);
        const tenCentsInUSD = 0.1;
        const tenCentsInMatic = (tenCentsInUSD * 1e18) / parseFloat(maticPriceUSDFormatted);
        const tenCentsInTokens = (tenCentsInMatic * 1e18) / parseFloat(tokenPriceMaticFormatted);
        const tenCentsInTokensFormatted = tenCentsInTokens.toFixed(6);
        const twelveCentsInUSD = 0.12;
        const twelveCentsInMatic = (twelveCentsInUSD * 1e18) / parseFloat(maticPriceUSDFormatted);
        const twelveCentsInTokens = (twelveCentsInMatic * 1e18) / parseFloat(tokenPriceMaticFormatted);
        const twelveCentsInTokensFormatted = twelveCentsInTokens.toFixed(6);
        // نمایش فقط مقدار توکن ثبت‌نام
        const priceInfoContainer = document.getElementById('swap-price-info');
        if (priceInfoContainer) {
            const priceHTML = `
                <div style="background: rgba(0, 0, 0, 0.6); border-radius: 8px; padding: 1rem; margin: 1rem 0; border-left: 3px solid #00ccff;">
                    <h4 style="color: #00ccff; margin-bottom: 0.8rem;">💱 اطلاعات قیمت سواپ</h4>
                    <div style="display: grid; gap: 0.5rem; font-size: 0.9rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #ccc;">مقدار توکن مورد نیاز برای ثبت‌نام:</span>
                            <span style="color: #a786ff; font-weight: bold;">${registrationPriceFormatted} LVL</span>
                        </div>
                    </div>
                    <div style="font-size: 0.8rem; color: #ccc; margin-top: 0.5rem;">
                        <strong>نکته:</strong> مقدار بالا، مقدار توکن مورد نیاز برای ثبت‌نام در قرارداد است.
                    </div>
                </div>
            `;
            priceInfoContainer.innerHTML = priceHTML;
        }
    } catch (error) {
        console.error('Error displaying swap prices:', error);
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
                let userMessage = 'خطا در انجام تبدیل. لطفاً دوباره تلاش کنید.';

                if (
                    error.code === 4001 ||
                    (typeof error.message === 'string' && (
                        error.message.toLowerCase().includes('user denied') ||
                        error.message.toLowerCase().includes('user rejected') ||
                        error.message.toLowerCase().includes('rejected by user')
                    ))
                ) {
                    userMessage = 'تراکنش توسط کاربر لغو شد.';
                } else if (typeof error.message === 'string') {
                    if (error.message.toLowerCase().includes('insufficient funds')) {
                        userMessage = 'موجودی شما کافی نیست.';
                    } else if (error.message.toLowerCase().includes('insufficient contract matic')) {
                        userMessage = 'موجودی MATIC قرارداد کافی نیست. لطفاً ابتدا MATIC به قرارداد ارسال کنید یا منتظر بمانید.';
                    } else if (error.message.toLowerCase().includes('execution reverted')) {
                        // بررسی خطاهای خاص قرارداد
                        if (error.message.toLowerCase().includes('insufficient contract matic')) {
                            userMessage = 'موجودی MATIC قرارداد کافی نیست. لطفاً ابتدا MATIC به قرارداد ارسال کنید.';
                        } else if (error.message.toLowerCase().includes('insufficient balance')) {
                            userMessage = 'موجودی توکن شما کافی نیست.';
                        } else if (error.message.toLowerCase().includes('amount too small')) {
                            userMessage = 'مقدار وارد شده خیلی کم است.';
                        } else if (error.message.toLowerCase().includes('amount too large')) {
                            userMessage = 'مقدار وارد شده خیلی زیاد است.';
                        } else {
                            userMessage = 'تراکنش توسط قرارداد رد شد. مقدار یا شرایط را بررسی کنید.';
                        }
                    } else if (error.message.toLowerCase().includes('replacement transaction underpriced')) {
                        userMessage = 'کارمزد تراکنش کافی نیست. لطفاً کارمزد را افزایش دهید.';
                    } else if (error.message.toLowerCase().includes('nonce too low')) {
                        userMessage = 'شماره تراکنش قدیمی است. لطفاً دوباره تلاش کنید.';
                    } else if (error.message.toLowerCase().includes('gas required exceeds allowance')) {
                        userMessage = 'کارمزد تراکنش کافی نیست. لطفاً کارمزد را افزایش دهید.';
                    }
                }

                showSwapError(userMessage);
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