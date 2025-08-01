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

// پاکسازی کاراکترهای غیرمجاز برای نمایش صحیح تایپ‌رایتر
function cleanText(str) {
  return (str || '').replace(/[^\x20-\x7E\n\r\t]/g, ''); // فقط کاراکترهای قابل نمایش انگلیسی
}

// پاکسازی پیشرفته خطوط برای تایپ‌رایتر (فقط کاراکترهای مجاز)
function cleanLine(line) {
  return (line || '').replace(/[^a-zA-Z0-9_\-.,:()\[\]\/\s]/g, '');
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

  // ست کردن direction و font-family برای اطمینان از خوانایی
  el.style.direction = 'ltr';
  el.style.textAlign = 'left';
  el.style.fontFamily = "'Fira Mono', 'Consolas', 'Courier New', 'Noto Sans Arabic', monospace";

  // حالت انتظار (کرسر چشمک‌زن)
  if (isWaiting) {
    el.textContent = '';
    return;
  }

  if (el._cursorInterval) {
    clearInterval(el._cursorInterval);
    el._cursorInterval = null;
  }

  el.textContent = '';
  let line = 0;

  function typeLine() {
    if (line < lines.length) {
      el.textContent += (lines[line] || '') + '\n';
      line++;
      setTimeout(typeLine, 40);
    } else {
      // کرسر چشمک‌زن فقط بعد از READY
      let text = el.textContent;
      let linesArr = text.split('\n');
      let lastIdx = linesArr.length - 1;
      while (lastIdx > 0 && linesArr[lastIdx].trim() === '') lastIdx--;
      if (linesArr[lastIdx].toLowerCase().includes('ready')) {
        function setCursor(visible) {
          let newLines = linesArr.slice();
          newLines[lastIdx] = newLines[lastIdx].replace(/\|$/, '');
          if (visible) newLines[lastIdx] += '|';
          el.textContent = newLines.join('\n');
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
  typeLine();
};

// تابع جدید برای بروزرسانی ترمینال با زبان انتخابی
window.updateDashboardTerminalInfo = async function() {
  const el = document.getElementById('dashboard-terminal-info');
  if (!el) return;
  let lines = [];
  // --- CONTRACT STATE ---
  lines.push('CONTRACT STATE');
  lines.push('--------------');
  let totalSupply = '-';
  let wallets = '-';
  let pointValue = '-';
  let tokenPrice = '-';
  let contractTokenBalance = '-';
  let cashback = '-';
  let daiBalance = '-';
  try {
    if (window.contractConfig && window.contractConfig.contract) {
      const contract = window.contractConfig.contract;
      wallets = (await contract.wallets()).toString();
      totalSupply = ethers.formatUnits(await contract.totalSupply(), 18) + ' CPA';
      pointValue = parseFloat(ethers.formatUnits(await contract.getPointValue(), 18)).toFixed(2) + ' CPA';
      tokenPrice = ethers.formatUnits(await contract.getTokenPrice(), 18);
      contractTokenBalance = ethers.formatUnits(await contract.balanceOf(contract.target), 18) + ' CPA';
      cashback = ethers.formatUnits(await (contract.cashBack ? contract.cashBack() : contract.cashback()), 18) + ' CPA';
      if (typeof window.DAI_ADDRESS !== 'undefined' && typeof window.DAI_ABI !== 'undefined') {
        const daiAddress = window.DAI_ADDRESS;
        const daiAbi = window.DAI_ABI;
        const daiContract = new ethers.Contract(daiAddress, daiAbi, contract.provider);
        daiBalance = ethers.formatUnits(await daiContract.balanceOf(contract.target), 18) + ' DAI';
      }
    }
  } catch(e){}
  lines.push(`Total Wallets: ${wallets}`);
  lines.push(`Total Supply: ${totalSupply}`);
  lines.push(`Point Value: ${pointValue}`);
  lines.push(`Token Price: ${tokenPrice}`);
  lines.push(`Contract Token Balance: ${contractTokenBalance}`);
  lines.push(`Help Fund: ${cashback}`);
  lines.push(`Contract DAI Balance: ${daiBalance}`);
  lines.push('');
  // --- USER PROFILE ---
  let profile = null;
  try { profile = await window.getUserProfile(); } catch(e){}
  if (profile && profile.address) {
    lines.push('USER PROFILE');
    lines.push('-------------');
    lines.push(`Address: ${profile.address}`);
    lines.push(`Activated: ${profile.activated}`);
    lines.push(`Registered: ${profile.registered}`);
    lines.push(`Index: ${profile.index}`);
    lines.push(`Referrer: ${profile.referrer}`);
    lines.push('');
    lines.push('Balances:');
    lines.push(`  MATIC: ${profile.maticBalance}`);
    lines.push(`  CPA: ${profile.lvlBalance}`);
    lines.push(`  POL: ${profile.polBalance}`);
    lines.push(`  DAI: ${profile.daiBalance}`);
    lines.push(`  CPA Value (USD): ${profile.lvlValueUSD}`);
    lines.push(`  POL Value (USD): ${profile.polValueUSD}`);
    lines.push('');
    lines.push('Points & Rewards:');
    lines.push(`  Binary Points: ${profile.binaryPoints}`);
    lines.push(`  Binary Point Cap: ${profile.binaryPointCap}`);
    lines.push(`  Claimed Binary Points: ${profile.binaryPointsClaimed}`);
    lines.push(`  Left Points: ${profile.leftPoints}`);
    lines.push(`  Right Points: ${profile.rightPoints}`);
    lines.push(`  Total Monthly Rewarded: ${profile.totalMonthlyRewarded}`);
    lines.push(`  Last Monthly Claim: ${profile.lastMonthlyClaim}`);
    lines.push(`  Last Claim: ${profile.lastClaimTime}`);
    lines.push(`  Referrer Reward: ${profile.refclimed ? Math.floor(Number(profile.refclimed) / 1e18) : '0'}`);
    lines.push('');
    lines.push('Purchases & Deposits:');
    lines.push(`  Total CPA Purchased: ${profile.totalPurchasedKind}`);
    lines.push(`  Total Deposited: ${profile.depositedAmount}`);
    lines.push('');
  }
  lines.push('READY');
  el.style.direction = 'ltr';
  el.style.textAlign = 'left';
  el.style.fontFamily = "'Fira Mono', 'Consolas', 'Courier New', 'Noto Sans Arabic', monospace";
  el.textContent = lines.join('\n');
};

// هندل کلیک اولیه دکمه زبان (در صورت بارگذاری بعدی)
document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('dashboard-lang-btn');
  if (btn) btn.onclick = window.toggleDashboardTerminalLang;
});
