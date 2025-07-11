// افکت تایپ ساده داشبورد برای نمایش خطوط اطلاعات
// New: Blinking cursor and waiting effect until data is loaded

// زبان ترمینال: 'fa' یا 'en'
window.dashboardTerminalLang = 'en';

// خطوط ترمینال به دو زبان (فارسی با اعداد فارسی)
// Utility: Remove box-drawing characters from all output lines
function removeBoxDrawingChars(lines) {
  const boxChars = /[╔╗╝╚═║]+/g;
  return lines.map(line => line.replace(boxChars, '').trim());
}

window.dashboardTerminalLines = {
  en: function(data) {
    const lines = [
      'CONTINUOUS PROFIT ACADEMY',
      '',
      '🚀 Welcome to CPA!',
      '📊 Loading blockchain data...',
      '',
      'SYSTEM STATUS',
      '',
      `🌐 All Wallets: ${data.wallets}`,
      `💰 Total Supply: ${data.totalSupply}`,
      `💸 Binary Pool: ${data.binaryPool}`,
      `🟢 Point Value: ${data.pointValue}`,
      '',
      'READY'
    ];
    return removeBoxDrawingChars(lines);
  },
  fa: function(data) {
    const lines = [
      'آکادمی سود مستمر',
      '',
      '🚀 خوش آمدید!',
      '📊 در حال بارگذاری اطلاعات بلاکچین...',
      '',
      'وضعیت سیستم',
      '',
      `🌐 تعداد کیف پول‌ها: ${data.wallets}`,
      `💰 عرضه کل: ${data.totalSupply}`,
      `💸 استخر باینری: ${data.binaryPool}`,
      `🟢 ارزش هر امتیاز: ${data.pointValue}`,
      '',
      'آماده'
    ];
    return removeBoxDrawingChars(lines);
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

  // حذف کرسر چشمک‌زن در حالت انتظار
  if (isWaiting) {
    el.textContent = '';
    return;
  }

  if (el._cursorInterval) {
    clearInterval(el._cursorInterval);
    el._cursorInterval = null;
  }

  el.innerHTML = '';
  let line = 0, char = 0;
  let lastLineStart = 0;

  function type() {
    if (line < lines.length) {
      let prefix = (lines[line].trim() !== '') ? 'cpa> ' : '';
      // Special style for the first line (title)
      if (line === 0 && lines[line].trim() !== '') {
        const span = document.createElement('span');
        span.className = 'dashboard-terminal-title';
        span.textContent = lines[line];
        el.appendChild(span);
        el.appendChild(document.createElement('br'));
        el.appendChild(document.createElement('br'));
        line++;
        // Ensure only one empty line after the title
        while (line < lines.length && lines[line].trim() === '') line++;
        setTimeout(type, 60);
        return;
      }
      if (char === 0) el.innerHTML += prefix;
      if (char < lines[line].length) {
        el.innerHTML += lines[line][char];
        char++;
        setTimeout(type, 25);
      } else {
        el.innerHTML += '<br>';
        line++;
        char = 0;
        setTimeout(type, 60);
      }
    } else {
      // Blinking cursor only after 'READY'
      let html = el.innerHTML;
      // Remove any previous cursor
      html = html.replace(/\|<span class="dashboard-cursor">\|<\/span>/g, '');
      // Find the last non-empty line
      let linesArr = html.split('<br>');
      let lastIdx = linesArr.length - 1;
      while (lastIdx > 0 && linesArr[lastIdx].trim() === '') lastIdx--;
      // Only add cursor if last line is 'cpa> READY' (case-insensitive)
      if (linesArr[lastIdx].toLowerCase().includes('ready')) {
        function setCursor(visible) {
          let newLines = linesArr.slice();
          newLines[lastIdx] = newLines[lastIdx].replace(/\|<span class="dashboard-cursor">\|<\/span>/g, '');
          if (visible) newLines[lastIdx] += '<span class="dashboard-cursor">|</span>';
          el.innerHTML = newLines.join('<br>');
        }
        let visible = true;
        setCursor(visible);
        el._cursorInterval = setInterval(() => {
          visible = !visible;
          setCursor(visible);
        }, 500);
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
          'WALLET NOT CONNECTED',
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
    // --- Fetch contract state variables ---
    let stateVars = [];
    try { data.pointValue = formatPriceScientific(parseFloat(ethers.formatUnits(await contract.getPointValue(), 18))) + ' CPA'; } catch(e){ data.pointValue = '-'; }
    try { 
      const priceRaw = await contract.getTokenPrice(); 
      const priceFormatted = formatPriceScientific(ethers.formatUnits(priceRaw, 18));
      data.tokenPrice = priceFormatted;
    } catch(e){ data.tokenPrice = '-'; }
    try { data.contractTokenBalance = formatPriceScientific(ethers.formatUnits(await contract.balanceOf(contract.target), 18)) + ' CPA'; } catch(e){ data.contractTokenBalance = '-'; }
    try { data.cashback = formatPriceScientific(ethers.formatUnits(await (contract.cashBack ? contract.cashBack() : contract.cashback()), 18)) + ' CPA'; } catch(e){ data.cashback = '-'; }
    // USDC Contract Balance
    try {
      const usdcBalanceRaw = await contract.getContractUSDCBalance();
      const usdcBalanceFormatted = formatPriceScientific(ethers.formatUnits(usdcBalanceRaw, 6));
      data.usdcBalance = usdcBalanceFormatted + ' USDC';
    } catch(e){ 
      data.usdcBalance = 'Error';
    }
    stateVars = [
      'CONTRACT STATE',
      '--------------',
      `Total Supply: ${data.totalSupply}`,
      `Wallets: ${data.wallets}`,
      `Point Value: ${data.pointValue}`,
      `Token Price: ${data.tokenPrice}`,
      `Contract Token Balance: ${data.contractTokenBalance}`,
      `Cashback: ${data.cashback}`,
      `USDC Contract Balance: ${data.usdcBalance}`,
      ''
    ];
    // --- Fetch user profile and add to terminal ---
    let profileLines = [];
    try {
      const profile = await window.getUserProfile();
      if (profile) {
        profileLines = [
          'USER PROFILE',
          '-------------',
          `Address: ${profile.address}`,
          `Referrer: ${profile.referrer}`,
          `Activated: ${profile.activated}`,
          `Registered: ${profile.registered}`,
          `Index: ${profile.index}`,
          `Left Points: ${profile.leftPoints}`,
          `Right Points: ${profile.rightPoints}`,
          `Binary Points: ${profile.binaryPoints}`,
          `Binary Point Cap: ${profile.binaryPointCap}`,
          `Binary Points Claimed: ${profile.binaryPointsClaimed}`,
          `Total Purchased (CPA): ${profile.totalPurchasedKind}`,
          `Total Purchased (MATIC): ${profile.totalPurchasedMATIC}`,
          `Deposited Amount: ${profile.depositedAmount}`,
          `Referral Claimed: ${profile.refclimed}`,
          `Last Claim Time: ${profile.lastClaimTime}`,
          `Last Monthly Claim: ${profile.lastMonthlyClaim}`,
          `Total Monthly Rewarded: ${profile.totalMonthlyRewarded}`,
          `CPA Balance: ${profile.lvlBalance}`,
          `POL Balance: ${profile.polBalance}`,
          `MATIC Balance: ${profile.maticBalance}`,
          `USDC Balance: ${profile.usdcBalance}`,
          `CPA Value (USD): ${profile.lvlValueUSD}`,
          `POL Value (USD): ${profile.polValueUSD}`,
          ''
        ];
      }
    } catch (e) {
      profileLines = ['','USER PROFILE','Error loading user profile',''];
    }
    // --- List external/public functions from ABI ---
    let abiLines = [];
    try {
      const abi = window.contractConfig.LEVELUP_ABI || [];
      abiLines = ['EXTERNAL FUNCTIONS','------------------'];
      abi.forEach(item => {
        if(item.type === 'function') {
          const inputs = (item.inputs || []).map(i => i.type).join(',');
          abiLines.push(`${item.name}(${inputs})`);
        }
      });
      abiLines.push('');
    } catch(e) {
      abiLines = ['','EXTERNAL FUNCTIONS','Error loading ABI',''];
    }
    // --- Compose all lines ---
    let lines = [];
    lines = lines.concat(stateVars, profileLines, abiLines);
    lines.push('READY');
    window.typewriterDashboardInfo(lines);
  } catch (e) {
    window.typewriterDashboardInfo([
      'ERROR DETECTED',
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
