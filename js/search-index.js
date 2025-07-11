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
          searchStatus.textContent = 'آدرس ولت پیدا شد';
          searchStatus.className = 'transfer-status success';
          document.getElementById('transferTo').value = address;
        }
      } catch (err) {
        searchStatus.textContent = 'خطا در جستجو: ' + (err && err.message ? err.message : err);
        searchStatus.className = 'transfer-status error';
        document.getElementById('transferTo').value = '';
      }
    };
  }
}); 