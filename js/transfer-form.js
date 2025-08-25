// Token transfer form control

document.addEventListener('DOMContentLoaded', function() {
  async function updateDaiBalance() {
    if (!window.contractConfig || !window.contractConfig.signer) return;
    try {
      // Exactly like swap.js: getting user address from window.contractConfig.address
      const address = window.contractConfig.address;
      const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, window.contractConfig.signer);
      const daiBalance = await daiContract.balanceOf(address);
      const el = document.getElementById('transfer-dai-balance');
      if (el) {
        const value = ethers.formatUnits(daiBalance, 18); // like swap.js
        el.textContent = parseFloat(value).toFixed(2);
      }
    } catch (e) {
      const el = document.getElementById('transfer-dai-balance');
      if (el) el.textContent = 'Error';
    }
  }
  updateDaiBalance();
  // Connect to window for calling from anywhere else (like swap)
  window.updateTransferDaiBalance = updateDaiBalance;
  const transferForm = document.getElementById('transferForm');
  if (!transferForm) return;
  transferForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const transferBtn = transferForm.querySelector('button[type="submit"]');
    if (transferBtn) {
      transferBtn.disabled = true;
      var oldText = transferBtn.textContent;
      transferBtn.textContent = 'Processing...';
    }
    const transferToInput = document.getElementById('transferTo');
    // استفاده از آدرس کامل اگر در data attribute ذخیره شده باشد
    const to = transferToInput.getAttribute('data-full-address') || transferToInput.value.trim();
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const token = document.getElementById('transferToken').value;
    const status = document.getElementById('transferStatus');
    status.textContent = '';
    status.className = 'transfer-status';
    if (!to || !amount || amount <= 0) {
      status.textContent = 'Please enter a valid destination address and amount';
      status.className = 'transfer-status error';
      if (transferBtn) { transferBtn.disabled = false; transferBtn.textContent = oldText; }
      return;
    }
    if (!window.contractConfig || !window.contractConfig.contract || !window.contractConfig.signer) {
      status.textContent = 'Wallet connection not established';
      status.className = 'transfer-status error';
      if (transferBtn) { transferBtn.disabled = false; transferBtn.textContent = oldText; }
      return;
    }
    try {
      status.textContent = 'Sending...';
      status.className = 'transfer-status loading';
      if (token === 'pol') {
        const tx = await window.contractConfig.signer.sendTransaction({
          to,
          value: ethers.parseEther(amount.toString())
        });
        await tx.wait();
        status.textContent = 'Transfer completed successfully!\nTransaction ID: ' + tx.hash;
        status.className = 'transfer-status success';
      } else if (token === 'dai') {
        const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, window.contractConfig.signer);
        const decimals = 18;
        const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
        const tx = await daiContract.transfer(to, parsedAmount);
        await tx.wait();
        status.textContent = 'DAI transfer completed successfully!\nTransaction ID: ' + tx.hash;
        status.className = 'transfer-status success';
      } else {
        const contract = window.contractConfig.contract;
        const tx = await contract.transfer(to, ethers.parseEther(amount.toString()));
        await tx.wait();
        status.textContent = 'Transfer completed successfully!\nTransaction ID: ' + tx.hash;
        status.className = 'transfer-status success';
      }
      transferForm.reset();
      await updateDaiBalance(); // After successful transfer, update DAI balance
    } catch (error) {
      let msg = error && error.message ? error.message : error;
      if (msg.includes('user rejected')) msg = '❌ Transaction cancelled by user.';
      else if (msg.includes('insufficient funds')) msg = 'Insufficient balance for fee payment or transfer.';
      else if (msg.includes('insufficient balance')) msg = 'Insufficient balance.';
      else if (msg.includes('invalid address')) msg = 'Invalid destination address.';
      else if (msg.includes('not allowed') || msg.includes('only owner')) msg = 'You are not authorized to perform this operation.';
      else if (msg.includes('already transferred') || msg.includes('already exists')) msg = 'This operation has already been performed or is duplicate.';
      else if (msg.includes('slippage')) msg = 'Price difference (slippage) is too high. Please change the amount.';
      else if (msg.includes('price changed')) msg = 'Price has changed. Please try again.';
      else if (msg.includes('nonce')) msg = 'Error in transaction number. Please try again.';
      else if (msg.includes('execution reverted')) msg = 'Transaction failed. Please check transfer conditions.';
      else if (msg.includes('network') || msg.includes('connection')) msg = '❌ Network connection error. Please check your internet connection.';
      else if (msg.includes('timeout')) msg = 'Transaction time expired. Try again.';
      else msg = '❌ Transfer error: ' + msg;
      status.textContent = msg;
      status.className = 'transfer-status error';
    }
    if (transferBtn) { transferBtn.disabled = false; transferBtn.textContent = oldText; }
  });
}); 