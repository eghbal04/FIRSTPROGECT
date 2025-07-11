// افکت تایپ ساده داشبورد برای نمایش خطوط اطلاعات
// New: Blinking cursor and waiting effect until data is loaded

// زبان ترمینال: 'fa' یا 'en'
window.dashboardTerminalLang = 'en';

// خطوط ترمینال به دو زبان (فارسی با اعداد فارسی)
window.dashboardTerminalLines = {
  en: function(data) {
    return [
      '╔══════════════════════════════════════════════════════════════╗',
      '║                    CONTINUOUS PROFIT ACADEMY                 ║',
      '║                        CPA TERMINAL v2.0                    ║',
      '╚══════════════════════════════════════════════════════════════╝',
      '',
      '🚀 Welcome to CPA Terminal!',
      '📊 Loading blockchain data...',
      '',
      '╔══════════════════════════════════════════════════════════════╗',
      '║                        SYSTEM STATUS                         ║',
      '╚══════════════════════════════════════════════════════════════╝',
      '',
      `🌐 All Wallets: ${data.wallets}`,
      `💰 Total Supply: ${data.totalSupply}`,
      `🎯 Total Points: ${data.totalPoints}`,
      `💎 Point Value: ${data.pointValue}`,
      `📈 Current Token Price: ${data.tokenPrice}`,
      `🏦 Contract Token Bal.: ${data.contractTokenBalance}`,
      `💚 Help Fund: ${data.cashback}`,
      `💵 USDC Contract Bal.: ${data.usdcBalance}`,
      '',
      '╔══════════════════════════════════════════════════════════════╗',
      '║                    TERMINAL READY                            ║',
      '╚══════════════════════════════════════════════════════════════╝'
    ];
  }
};

// Helper function to format prices in scientific notation
function formatPriceScientific(price) {
  if (price === 0 || price === '0') return '0';
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return price;
  if (numPrice < 0.000001) {
    return numPrice.toExponential(6);
  }
  return numPrice.toFixed(6);
}

// هنگام بارگذاری اولیه، جهت و فونت را بر اساس زبان تنظیم کن
function setDashboardTerminalDirection() {
  var terminal = document.getElementById('dashboard-terminal-info');
  if (terminal) {

      terminal.style.direction = 'ltr';
      terminal.style.textAlign = 'left';
      terminal.style.fontFamily = 'monospace';
    }
  
}
document.addEventListener('DOMContentLoaded', setDashboardTerminalDirection);

window.typewriterDashboardInfo = function(lines, isWaiting = false) {
  const el = document.getElementById('dashboard-terminal-info');
  if (!el) return;
  
  if (isWaiting) {
    // نمایش کرسر چشمک‌زن برای انتظار
    el.textContent = '|';
    let cursorVisible = true;
    const cursorInterval = setInterval(() => {
      el.textContent = cursorVisible ? '|' : ' ';
      cursorVisible = !cursorVisible;
    }, 500);
    
    // ذخیره interval برای پاک کردن بعداً
    el._cursorInterval = cursorInterval;
    return;
  }
  
  // پاک کردن interval قبلی
  if (el._cursorInterval) {
    clearInterval(el._cursorInterval);
    el._cursorInterval = null;
  }
  
  el.textContent = '';
  let line = 0, char = 0;
  
  function type() {
    if (line < lines.length) {
      if (char < lines[line].length) {
        el.textContent += lines[line][char];
        char++;
        setTimeout(type, 25); // کمی سریع‌تر
      } else {
        el.textContent += '\n';
        line++;
        char = 0;
        setTimeout(type, 60); // کمی سریع‌تر
      }
    }
  }
  type();
};

// تابع جدید برای بروزرسانی ترمینال با زبان انتخابی
window.updateDashboardTerminalInfo = async function() {
  try {
    if (!window.contractConfig || !window.contractConfig.contract) {
      try { await window.connectWallet(); } catch (e) {
        window.typewriterDashboardInfo([
          '╔══════════════════════════════════════════════════════════════╗',
          '║                    WALLET NOT CONNECTED                     ║',
          '╚══════════════════════════════════════════════════════════════╝',
          '',
          '🔌 Please connect your wallet to view dashboard data',
          '🔄 Retrying connection...',
          '',
          'Click the wallet connect button to proceed.'
        ]);
        return;
      }
    }
    const contract = window.contractConfig.contract;
    const data = {
      totalPoints: window.contractStats.totalPoints,
      usdcBalance: window.contractStats.usdcBalance,
      tokenBalance: window.contractStats.tokenBalance,
      wallets: window.contractStats.wallets,
      totalSupply: window.contractStats.totalSupply
    };
    try { data.pointValue = formatPriceScientific(parseFloat(ethers.formatUnits(await contract.getPointValue(), 18))) + ' CPA'; } catch(e){ data.pointValue = '-'; }
    try { 
      const priceRaw = await contract.getTokenPrice(); 
      const priceFormatted = formatPriceScientific(ethers.formatUnits(priceRaw, 18));
      data.tokenPrice = priceFormatted;
    } catch(e){ data.tokenPrice = '-'; }
    try { data.contractTokenBalance = formatPriceScientific(ethers.formatUnits(await contract.balanceOf(contract.target), 18)) + ' CPA'; } catch(e){ data.contractTokenBalance = '-'; }
    try { data.cashback = formatPriceScientific(ethers.formatUnits(await (contract.cashBack ? contract.cashBack() : contract.cashback()), 18)) + ' CPA'; } catch(e){ data.cashback = '-'; }
        // USDC Contract Balance - Using contract's getContractUSDCBalance function
        try {
          const usdcBalanceRaw = await contract.getContractUSDCBalance();
          const usdcBalanceFormatted = formatPriceScientific(ethers.formatUnits(usdcBalanceRaw, 6));
          data.usdcBalance = usdcBalanceFormatted + ' USDC';
        } catch(e){ 
          console.error('Error fetching USDC balance via contract function:', e);
          // Fallback to direct USDC contract call
          try {
            if (typeof USDC_ADDRESS !== 'undefined' && typeof USDC_ABI !== 'undefined') {
              const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, contract.provider);
              const usdcBalanceRaw = await usdcContract.balanceOf(contract.target);
              const usdcBalanceFormatted = formatPriceScientific(ethers.formatUnits(usdcBalanceRaw, 6));
              data.usdcBalance = usdcBalanceFormatted + ' USDC';
            } else {
              data.usdcBalance = 'Config Error';
            }
          } catch(fallbackError) {
            console.error('Fallback USDC balance fetch failed:', fallbackError);
            data.usdcBalance = 'Error: ' + e.message;
          }
        }
    const lines = window.dashboardTerminalLines.en(data);
    window.typewriterDashboardInfo(lines);
  } catch (e) {
    window.typewriterDashboardInfo([
      '╔══════════════════════════════════════════════════════════════╗',
      '║                        ERROR DETECTED                        ║',
      '╚══════════════════════════════════════════════════════════════╝',
      '',
      '❌ Error loading dashboard info',
      '🔄 Retrying connection...',
      '',
      'Please check your wallet connection and try again.'
    ]);
  }
};

// هندل کلیک اولیه دکمه زبان (در صورت بارگذاری بعدی)
document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('dashboard-lang-btn');
  if (btn) btn.onclick = window.toggleDashboardTerminalLang;
});
