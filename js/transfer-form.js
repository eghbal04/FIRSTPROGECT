// کنترل فرم انتقال توکن

document.addEventListener('DOMContentLoaded', function() {
  async function updateDaiBalance() {
    if (!window.contractConfig || !window.contractConfig.signer) return;
    try {
      // دقیقاً مثل swap.js: گرفتن آدرس کاربر از window.contractConfig.address
      const address = window.contractConfig.address;
      const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, window.contractConfig.signer);
      const daiBalance = await daiContract.balanceOf(address);
      const el = document.getElementById('transfer-dai-balance');
      if (el) {
        const value = ethers.formatUnits(daiBalance, 18); // مثل swap.js
        el.textContent = parseFloat(value).toFixed(2);
      }
    } catch (e) {
      const el = document.getElementById('transfer-dai-balance');
      if (el) el.textContent = 'خطا';
    }
  }
  updateDaiBalance();
  // اتصال به window برای فراخوانی از هر جای دیگر (مانند سواپ)
  window.updateTransferDaiBalance = updateDaiBalance;
  const transferForm = document.getElementById('transferForm');
  if (!transferForm) return;
  transferForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const transferBtn = transferForm.querySelector('button[type="submit"]');
    if (transferBtn) {
      transferBtn.disabled = true;
      var oldText = transferBtn.textContent;
      transferBtn.textContent = 'در حال پردازش...';
    }
    const to = document.getElementById('transferTo').value.trim();
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const token = document.getElementById('transferToken').value;
    const status = document.getElementById('transferStatus');
    status.textContent = '';
    status.className = 'transfer-status';
    if (!to || !amount || amount <= 0) {
      status.textContent = 'آدرس مقصد و مقدار معتبر وارد کنید';
      status.className = 'transfer-status error';
      if (transferBtn) { transferBtn.disabled = false; transferBtn.textContent = oldText; }
      return;
    }
    if (!window.contractConfig || !window.contractConfig.contract || !window.contractConfig.signer) {
      status.textContent = 'اتصال کیف پول برقرار نیست';
      status.className = 'transfer-status error';
      if (transferBtn) { transferBtn.disabled = false; transferBtn.textContent = oldText; }
      return;
    }
    try {
      status.textContent = 'در حال ارسال...';
      status.className = 'transfer-status loading';
      if (token === 'pol') {
        const tx = await window.contractConfig.signer.sendTransaction({
          to,
          value: ethers.parseEther(amount.toString())
        });
        await tx.wait();
        status.textContent = 'انتقال با موفقیت انجام شد!\nکد تراکنش: ' + tx.hash;
        status.className = 'transfer-status success';
      } else if (token === 'dai') {
        const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, window.contractConfig.signer);
        const decimals = 18;
        const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
        const tx = await daiContract.transfer(to, parsedAmount);
        await tx.wait();
        status.textContent = 'انتقال DAI با موفقیت انجام شد!\nکد تراکنش: ' + tx.hash;
        status.className = 'transfer-status success';
      } else {
        const contract = window.contractConfig.contract;
        const tx = await contract.transfer(to, ethers.parseEther(amount.toString()));
        await tx.wait();
        status.textContent = 'انتقال با موفقیت انجام شد!\nکد تراکنش: ' + tx.hash;
        status.className = 'transfer-status success';
      }
      transferForm.reset();
      await updateDaiBalance(); // بعد از انتقال موفق، موجودی DAI را به‌روز کن
    } catch (error) {
      let msg = error && error.message ? error.message : error;
      if (msg.includes('user rejected')) msg = '❌ تراکنش توسط کاربر لغو شد.';
      else if (msg.includes('insufficient funds')) msg = 'موجودی کافی برای پرداخت کارمزد یا انتقال وجود ندارد.';
      else if (msg.includes('insufficient balance')) msg = 'موجودی کافی نیست.';
      else if (msg.includes('invalid address')) msg = 'آدرس مقصد نامعتبر است.';
      else if (msg.includes('not allowed') || msg.includes('only owner')) msg = 'شما مجاز به انجام این عملیات نیستید.';
      else if (msg.includes('already transferred') || msg.includes('already exists')) msg = 'این عملیات قبلاً انجام شده است یا تکراری است.';
      else if (msg.includes('slippage')) msg = 'اختلاف قیمت (slippage) زیاد است. لطفاً مقدار را تغییر دهید.';
      else if (msg.includes('price changed')) msg = 'قیمت تغییر کرده است. لطفاً دوباره تلاش کنید.';
      else if (msg.includes('nonce')) msg = 'خطا در شماره تراکنش. لطفاً دوباره تلاش کنید.';
      else if (msg.includes('execution reverted')) msg = 'تراکنش ناموفق بود. لطفاً شرایط انتقال را بررسی کنید.';
      else if (msg.includes('network') || msg.includes('connection')) msg = '❌ خطا در اتصال شبکه. لطفاً اینترنت خود را بررسی کنید.';
      else if (msg.includes('timeout')) msg = 'زمان تراکنش به پایان رسید. دوباره تلاش کنید.';
      else msg = '❌ خطا در انتقال: ' + msg;
      status.textContent = msg;
      status.className = 'transfer-status error';
    }
    if (transferBtn) { transferBtn.disabled = false; transferBtn.textContent = oldText; }
  });
}); 