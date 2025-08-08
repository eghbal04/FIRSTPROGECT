/**
 * Final Configuration Test - تست نهایی تنظیمات
 */

function finalConfigTest() {
    console.log('🔍 تست نهایی تنظیمات DAI→USDC');
    console.log('=====================================');
    
    // بررسی آدرس‌ها
    console.log('\n📍 آدرس‌ها:');
    console.log('window.DAI_ADDRESS:', window.DAI_ADDRESS);
    console.log('window.USDC_ADDRESS:', window.USDC_ADDRESS);
    console.log('آدرس DAI صحیح:', '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063');
    console.log('آیا آدرس‌ها درست است؟', 
        window.DAI_ADDRESS === '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' &&
        window.USDC_ADDRESS === '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
    );
    
    // بررسی سیستم‌ها
    console.log('\n⚙️ سیستم‌ها:');
    console.log('Smart Dashboard Updater:', typeof window.smartUpdate);
    console.log('Central Dashboard Updater:', typeof window.centralDashboardUpdater);
    console.log('Debugger Functions:', typeof window.debugUSDCBalance, typeof window.quickUSDCCheck);
    
    // تست موجودی (در صورت اتصال کیف پول)
    if (window.contractConfig?.contract) {
        console.log('\n💰 تست موجودی:');
        testBalance();
    } else {
        console.log('\n❌ کیف پول متصل نیست - تست موجودی امکان‌پذیر نیست');
    }
    
    console.log('\n✅ تست کامل شد!');
}

async function testBalance() {
    try {
        const contract = window.contractConfig.contract;
        const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, contract.provider);
        const balance = await daiContract.balanceOf(contract.target);
        const formatted = ethers.formatUnits(balance, 18);
        
        console.log('- آدرس قرارداد:', contract.target);
        console.log('- موجودی خام:', balance.toString());
        console.log('- موجودی فرمت شده:', formatted, 'DAI');
        console.log('- نمایش در UI:', formatted, 'USDC');
        console.log('- دسیمال استفاده شده: 18 (DAI)');
        
    } catch (error) {
        console.error('❌ خطا در تست موجودی:', error.message);
    }
}

// اضافه کردن به window
window.finalConfigTest = finalConfigTest;

console.log('🧪 Final Config Test loaded - استفاده: finalConfigTest()');