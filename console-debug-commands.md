# دستورات Debug برای بررسی موجودی DAI

## 🔍 بررسی کامل موجودی DAI

```javascript
// بررسی کامل تمام روش‌های دریافت موجودی DAI
debugDAIBalance()

// بررسی سریع موجودی فعلی
quickDAICheck()

// فعال کردن debug سیستم مرکزی برای دیدن تغییرات DAI
enableCentralDebug()
```

## 🔧 بررسی دستی قرارداد

```javascript
// بررسی اینکه آیا قرارداد تابع getContractdaiBalance دارد
if (window.contractConfig?.contract) {
    const contract = window.contractConfig.contract;
    console.log('getContractdaiBalance:', typeof contract.getContractdaiBalance);
    console.log('getContractDAIBalance:', typeof contract.getContractDAIBalance);
}

// بررسی آدرس‌های DAI
console.log('DAI_ADDRESS:', window.DAI_ADDRESS);
console.log('CPA_ADDRESS:', window.CPA_ADDRESS);
```

## 💰 تست مستقیم موجودی DAI

```javascript
// تست مستقیم از DAI contract
async function testDAIDirect() {
    try {
        const contract = window.contractConfig.contract;
        const daiContract = new ethers.Contract(
            window.DAI_ADDRESS, 
            window.DAI_ABI, 
            contract.provider
        );
        
        // آدرس قرارداد اصلی
        const contractAddress = contract.target || window.CPA_ADDRESS;
        console.log('آدرس قرارداد:', contractAddress);
        
        const balance = await daiContract.balanceOf(contractAddress);
        console.log('موجودی خام:', balance.toString());
        console.log('موجودی فرمت شده:', ethers.formatUnits(balance, 18), 'DAI');
        
    } catch (error) {
        console.error('خطا:', error);
    }
}
testDAIDirect()
```

## 🚀 مقایسه با blockchain explorer

بعد از اجرای دستورات بالا، آدرس قرارداد را در Polygonscan بررسی کنید:
- https://polygonscan.com/address/[CONTRACT_ADDRESS]
- قسمت Token Holdings را ببینید
- مقدار DAI را با نتیجه کد مقایسه کنید

استفاده کنید! 🔍