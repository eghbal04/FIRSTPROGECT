/**
 * USDC Balance Debugger - برای بررسی مشکل موجودی USDC (جایگزین DAI)
 */

async function debugUSDCBalance() {
    console.log('🔍 شروع بررسی موجودی USDC...');
    
    try {
        // بررسی اتصال
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.error('❌ قرارداد متصل نیست');
            return;
        }
        
        const contract = window.contractConfig.contract;
        console.log('✅ قرارداد متصل است');
        
        // بررسی آدرس‌های مورد نیاز
        console.log('📍 آدرس‌ها:');
        console.log('- USDC_ADDRESS:', window.USDC_ADDRESS);
        console.log('- DAI_ADDRESS (compatibility):', window.DAI_ADDRESS);
        console.log('- IAM_ADDRESS:', window.IAM_ADDRESS);
        console.log('- Contract Target:', contract.target);
        
        // بررسی توابع قرارداد
        console.log('🔧 توابع قرارداد موجود:');
        console.log('- getContractdaiBalance:', typeof contract.getContractdaiBalance);
        console.log('- getContractDAIBalance:', typeof contract.getContractDAIBalance);
        
        // آزمایش روش‌های مختلف دریافت موجودی USDC
        console.log('\n💰 تست روش‌های مختلف دریافت موجودی USDC:');
        
        // روش 1: تابع قرارداد getContractdaiBalance
        if (typeof contract.getContractdaiBalance === 'function') {
            try {
                const balance1 = await contract.getContractdaiBalance();
                const formatted1 = ethers.formatUnits(balance1, 18);
                console.log('✅ روش 1 (getContractdaiBalance):', formatted1, 'USDC (DAI test)');
            } catch (error) {
                console.log('❌ روش 1 خطا:', error.message);
            }
        } else {
            console.log('❌ روش 1: تابع getContractdaiBalance موجود نیست');
        }
        
        // روش 2: تابع قرارداد getContractDAIBalance
        if (typeof contract.getContractDAIBalance === 'function') {
            try {
                const balance2 = await contract.getContractDAIBalance();
                const formatted2 = ethers.formatUnits(balance2, 18);
                console.log('✅ روش 2 (getContractDAIBalance):', formatted2, 'USDC (DAI test)');
            } catch (error) {
                console.log('❌ روش 2 خطا:', error.message);
            }
        } else {
            console.log('❌ روش 2: تابع getContractDAIBalance موجود نیست');
        }
        
        // روش 3: مستقیم از DAI contract (نمایش USDC)
        if (window.DAI_ADDRESS && window.DAI_ABI) {
            try {
                const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, contract.provider);
                
                // تست با contract.target
                if (contract.target) {
                    const balance3a = await daiContract.balanceOf(contract.target);
                    const formatted3a = ethers.formatUnits(balance3a, 18);
                    console.log('✅ روش 3a (DAI.balanceOf(contract.target)):', formatted3a, 'USDC (DAI test)');
                }
                
                // تست با IAM_ADDRESS
                if (window.IAM_ADDRESS) {
                    const balance3b = await daiContract.balanceOf(window.IAM_ADDRESS);
                    const formatted3b = ethers.formatUnits(balance3b, 18);
                    console.log('✅ روش 3b (DAI.balanceOf(IAM_ADDRESS)):', formatted3b, 'USDC (DAI test)');
                }
                
            } catch (error) {
                console.log('❌ روش 3 خطا:', error.message);
            }
        } else {
            console.log('❌ روش 3: DAI_ADDRESS یا DAI_ABI موجود نیست');
        }
        
        // بررسی آدرس‌ها
        console.log('\n📝 بررسی آدرس‌ها:');
        const daiTestAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';
        const usdcRealAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
        const currentDAI = window.DAI_ADDRESS;
        const currentUSDC = window.USDC_ADDRESS;
        console.log('- آدرس DAI (تست):', daiTestAddress);
        console.log('- آدرس USDC (واقعی):', usdcRealAddress);
        console.log('- آدرس فعلی DAI_ADDRESS:', currentDAI);
        console.log('- آدرس فعلی USDC_ADDRESS:', currentUSDC);
        console.log('- آیا از DAI برای تست استفاده می‌کنیم؟', daiTestAddress.toLowerCase() === currentDAI?.toLowerCase());
        
    } catch (error) {
        console.error('❌ خطای کلی:', error);
    }
}

// تابع بررسی سریع موجودی
async function quickUSDCCheck() {
    try {
        if (!window.contractConfig?.contract) {
            console.log('❌ قرارداد متصل نیست');
            return;
        }
        
        const contract = window.contractConfig.contract;
        
        // روش پیشفرض فعلی
        let daiBalance;
        if (typeof contract.getContractdaiBalance === 'function') {
            daiBalance = await contract.getContractdaiBalance();
            console.log('💰 موجودی USDC (از قرارداد):', ethers.formatUnits(daiBalance, 18), 'USDC (DAI test)');
        } else {
            // Fallback
            const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, contract.provider);
            daiBalance = await daiContract.balanceOf(contract.target);
            console.log('💰 موجودی USDC (مستقیم):', ethers.formatUnits(daiBalance, 18), 'USDC (DAI test)');
        }
        
    } catch (error) {
        console.error('❌ خطا در بررسی سریع:', error.message);
    }
}

// اتصال به کنسول
window.debugUSDCBalance = debugUSDCBalance;
window.quickUSDCCheck = quickUSDCCheck;

// Backward compatibility
window.debugDAIBalance = debugUSDCBalance;
window.quickDAICheck = quickUSDCCheck;

console.log('🔍 USDC Balance Debugger loaded - استفاده: debugUSDCBalance() یا quickUSDCCheck()');
console.log('   (DAI aliases نیز کار می‌کنند: debugDAIBalance(), quickDAICheck())');