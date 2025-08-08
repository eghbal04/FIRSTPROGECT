/**
 * Test Address Configuration Summary
 */

console.log('🔍 آدرس‌های استفاده شده در پروژه:');

console.log('\n📍 آدرس‌های اصلی:');
console.log('- DAI واقعی (Polygon):', '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063');
console.log('- USDC واقعی (Polygon):', '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174');

console.log('\n⚙️ تنظیمات فعلی پروژه:');
console.log('- window.DAI_ADDRESS:', window.DAI_ADDRESS);
console.log('- window.USDC_ADDRESS:', window.USDC_ADDRESS);

console.log('\n📊 مشخصات:');
console.log('- قرارداد استفاده شده: DAI (برای تست)');
console.log('- دسیمال: 18 (DAI decimals)');
console.log('- نمایش در UI: USDC');

console.log('\n🎯 خلاصه:');
console.log('✅ از آدرس DAI استفاده می‌کنیم');
console.log('✅ اما در UI نام USDC نمایش داده می‌شود');
console.log('✅ دسیمال 18 (DAI) استفاده می‌شود');

// Test function
async function testCurrentBalance() {
    try {
        if (!window.contractConfig?.contract) {
            console.log('❌ قرارداد متصل نیست');
            return;
        }
        
        const contract = window.contractConfig.contract;
        const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, contract.provider);
        const balance = await daiContract.balanceOf(contract.target);
        const formatted = ethers.formatUnits(balance, 18);
        
        console.log('\n💰 تست موجودی فعلی:');
        console.log('- آدرس استفاده شده:', window.DAI_ADDRESS);
        console.log('- موجودی خام:', balance.toString());
        console.log('- موجودی فرمت شده:', formatted, 'DAI');
        console.log('- نمایش در UI:', formatted, 'USDC');
        
    } catch (error) {
        console.error('❌ خطا در تست:', error.message);
    }
}

window.testCurrentBalance = testCurrentBalance;

console.log('\n🧪 برای تست موجودی: testCurrentBalance()');