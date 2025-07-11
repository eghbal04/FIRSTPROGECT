// نمایش و بروزرسانی قیمت توکن
window.formatTokenPrice = function(priceWei) {
  if (!priceWei || priceWei === '0') return '0.000000000000000000';
  let priceString = priceWei.toString();
  while (priceString.length < 18) priceString = '0' + priceString;
  if (priceString.length > 18) priceString = priceString.slice(-18);
  const result = '0.' + priceString;
  return result;
}
async function updateTokenPriceDisplay() {
  try {
    if (!window.contractConfig || !window.contractConfig.contract) {
      await window.connectWallet();
      if (!window.contractConfig || !window.contractConfig.contract) {
        const el = document.getElementById('chart-lvl-usd');
        if (el) el.textContent = 'اتصال ناموفق';
        return;
      }
    }
    const contract = window.contractConfig.contract;
    const tokenPrice = await contract.getTokenPrice();
    const priceFormatted = window.formatTokenPrice(tokenPrice);
    const el = document.getElementById('chart-lvl-usd');
    if (el) el.textContent = priceFormatted;
    try {
      const pointValue = await contract.getPointValue();
      const pointValueFormatted = parseFloat(ethers.formatUnits(pointValue, 18)).toFixed(2);
      const el2 = document.getElementById('point-value');
      if (el2) el2.textContent = pointValueFormatted + ' CPA';
    } catch (error) {}
  } catch (error) {
    const el = document.getElementById('chart-lvl-usd');
    if (el) el.textContent = 'خطا در بارگذاری';
  }
} 