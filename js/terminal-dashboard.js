// Separate file for dashboard terminal logic
// This file should be loaded after config.js and before main.js in index.html

(function() {
  // Simple typewriter effect
  function typewriterEffect(elementId, lines, speed = 40) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = '';
    let line = 0, char = 0;
    function type() {
      if (line < lines.length) {
        if (char < lines[line].length) {
          el.textContent += lines[line][char];
          char++;
          setTimeout(type, speed);
        } else {
          el.textContent += '\n';
          line++;
          char = 0;
          setTimeout(type, speed * 4);
        }
      }
    }
    type();
  }

  // Main function to show dashboard info in terminal
  async function showDashboardInfoWithTypewriter() {
    try {
      if (!window.contractConfig || !window.contractConfig.contract) {
        await window.connectWallet();
      }
      const contract = window.contractConfig.contract;
      const lines = [];
      // --- System Info ---
      lines.push('--- System Info ---');
      let wallets = '-';
      try { wallets = (await contract.wallets()).toString(); } catch(e){}
      lines.push(`Total Wallets: ${wallets}`);
      let totalSupply = '-';
      try { totalSupply = ethers.formatUnits(await contract.totalSupply(), 18) + ' CPA'; } catch(e){}
      lines.push(`Total Supply: ${totalSupply}`);
      let totalPoints = '-';
      try {
        totalPoints = (await contract.totalClaimableBinaryPoints()).toString();
      } catch(e){}
      lines.push(`Total Points: ${totalPoints}`);
      let pointValue = '-';
      try { pointValue = parseFloat(ethers.formatUnits(await contract.getPointValue(), 18)).toFixed(2) + ' CPA'; } catch(e){}
      lines.push(`Point Value: ${pointValue}`);
      let tokenPrice = '-';
      try {
        const priceRaw = await contract.getTokenPrice();
        tokenPrice = ethers.formatUnits(priceRaw, 18);
      } catch(e){}
      lines.push(`Token Price: ${tokenPrice}`);
      let contractTokenBalance = '-';
      try { contractTokenBalance = ethers.formatUnits(await contract.balanceOf(contract.target), 18) + ' CPA'; } catch(e){}
      lines.push(`Contract Token Balance: ${contractTokenBalance}`);
      let cashback = '-';
      try { cashback = ethers.formatUnits(await (contract.cashBack ? contract.cashBack() : contract.cashback()), 18) + ' CPA'; } catch(e){}
      lines.push(`Help Fund: ${cashback}`);
      let usdcBalance = '-';
      try {
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, contract.provider);
        usdcBalance = ethers.formatUnits(await usdcContract.balanceOf(contract.target), 6) + ' USDC';
      } catch(e){}
      lines.push(`Contract USDC Balance: ${usdcBalance}`);
      lines.push('');
      // --- User Profile ---
      lines.push('--- User Profile ---');
      let profile = null;
      try {
        profile = await window.getUserProfile();
      } catch(e) {
        lines.push('Error fetching user profile');
      }
      if (profile && profile.activated) {
        // Account Info
        lines.push('Account Info:');
        lines.push(`  Address: ${profile.address}`);
        lines.push(`  Index: ${profile.index}`);
        lines.push(`  Referrer: ${profile.referrer}`);
        lines.push(`  Activated: ${profile.activated ? 'Yes' : 'No'}`);
        lines.push('');
        // Balances
        lines.push('Balances:');
        lines.push(`  MATIC: ${profile.maticBalance}`);
        lines.push(`  CPA: ${profile.lvlBalance}`);
        lines.push(`  POL: ${profile.polBalance}`);
        lines.push(`  USDC: ${profile.usdcBalance}`);
        lines.push(`  CPA Value (USD): ${profile.lvlValueUSD}`);
        lines.push(`  POL Value (USD): ${profile.polValueUSD}`);
        lines.push('');
        // Points & Rewards
        lines.push('Points & Rewards:');
        lines.push(`  Binary Points: ${profile.binaryPoints}`);
        lines.push(`  Binary Point Cap: ${profile.binaryPointCap}`);
        lines.push(`  Claimed Binary Points: ${profile.binaryPointsClaimed}`);
        lines.push(`  Left Points: ${profile.leftPoints}`);
        lines.push(`  Right Points: ${profile.rightPoints}`);
        lines.push(`  Total Monthly Rewarded: ${profile.totalMonthlyRewarded}`);
        lines.push(`  Last Monthly Claim: ${profile.lastMonthlyClaim}`);
        lines.push(`  Last Claim: ${profile.lastClaimTime}`);
        lines.push(`  Referrer Reward: ${profile.refclimed}`);
        lines.push('');
        // Purchases & Deposits
        lines.push('Purchases & Deposits:');
        lines.push(`  Total CPA Purchased: ${profile.totalPurchasedKind}`);
        lines.push(`  Total Deposited: ${profile.depositedAmount}`);
      } else if (profile && !profile.activated) {
        lines.push('You are not registered yet.');
        lines.push('Please register and activate your account to use all features.');
      } else {
        lines.push('User profile not found.');
      }
      lines.push('');
      lines.push('cpa> READY █');
      if (typeof typewriterDashboardInfo === 'function') {
        typewriterDashboardInfo(lines, false);
      } else {
        typewriterEffect('dashboard-terminal-info', lines, 40);
      }
    } catch (e) {
      const errorLines = [
        'Error loading dashboard info',
        (e && e.message ? e.message : String(e)),
        'cpa> READY █'
      ];
      if (typeof typewriterDashboardInfo === 'function') {
        typewriterDashboardInfo(errorLines, false);
      } else {
        typewriterEffect('dashboard-terminal-info', errorLines, 40);
      }
    }
  }

  // Register function globally
  window.showDashboardInfoWithTypewriter = showDashboardInfoWithTypewriter;
})(); 