// جستجوی آدرس با ایندکس

document.addEventListener('DOMContentLoaded', function() {
  const searchBtn = document.getElementById('searchIndexBtn');
  const searchInput = document.getElementById('searchIndex');
  const searchStatus = document.getElementById('searchIndexStatus');

  if (searchBtn && searchInput) {
    searchBtn.onclick = async function() {
      searchStatus.textContent = '';
      const idx = searchInput.value.trim();
      if (!idx || isNaN(idx) || Number(idx) < 0) {
        searchStatus.textContent = 'ایندکس معتبر وارد کنید';
        searchStatus.className = 'transfer-status error';
        return;
      }
      if (!window.contractConfig || !window.contractConfig.contract) {
        searchStatus.textContent = 'اتصال کیف پول برقرار نیست';
        searchStatus.className = 'transfer-status error';
        return;
      }
      try {
        searchStatus.textContent = 'در حال جستجو...';
        searchStatus.className = 'transfer-status loading';
        const contract = window.contractConfig.contract;
        const address = await contract.indexToAddress(BigInt(idx));
        if (!address || address === '0x0000000000000000000000000000000000000000') {
          searchStatus.textContent = 'آدرس ولت برای این ایندکس یافت نشد';
          searchStatus.className = 'transfer-status error';
          document.getElementById('transferTo').value = '';
        } else {
          const transferToInput = document.getElementById('transferTo');
          // ذخیره آدرس کامل در data attribute برای استفاده در ترنسفر
          transferToInput.setAttribute('data-full-address', address);
          // نمایش آدرس کوتاه شده در فیلد ورودی
          const shortenedAddress = `${address.substring(0, 6)}...${address.substring(38)}`;
          transferToInput.value = shortenedAddress;
          
          console.log('Address shortening applied:', {
            fullAddress: address,
            shortenedAddress: shortenedAddress,
            dataAttribute: transferToInput.getAttribute('data-full-address')
          });
          
          searchStatus.textContent = `آدرس ولت پیدا شد: ${shortenedAddress}`;
          searchStatus.className = 'transfer-status success';
        }
      } catch (err) {
        searchStatus.textContent = 'خطا در جستجو: ' + (err && err.message ? err.message : err);
        searchStatus.className = 'transfer-status error';
        document.getElementById('transferTo').value = '';
      }
    };
  }
}); 