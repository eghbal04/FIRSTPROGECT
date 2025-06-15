// js/swap.js - سیستم سواپ پیشرفته

class SwapManager {
  constructor() {
      this.fromToken = 'MATIC';
      this.toToken = 'LVL';
      this.fromAmount = 0;
      this.toAmount = 0;
      this.exchangeRate = 0;
      this.slippage = 0.5; // 0.5% slippage
      this.isSwapping = false;
      
      this.initializeEventListeners();
  }

  initializeEventListeners() {
      // Input amount changes
      document.getElementById('from-amount').addEventListener('input', (e) => {
          this.fromAmount = parseFloat(e.target.value) || 0;
          this.calculateToAmount();
      });

      // Token selection
      document.querySelectorAll('[data-token]').forEach(item => {
          item.addEventListener('click', (e) => {
              e.preventDefault();
              const token = e.currentTarget.getAttribute('data-token');
              const isFromToken = e.currentTarget.closest('#fromTokenDropdown');
              
              if (isFromToken) {
                  this.setFromToken(token);
              } else {
                  this.setToToken(token);
              }
          });
      });

      // Swap button
      document.getElementById('swap-button').addEventListener('click', () => {
          this.executeSwap();
      });

      // Max button
      window.setMaxAmount = (type) => {
          if (type === 'from') {
              this.setMaxFromAmount();
          }
      };

      // Swap tokens button
      window.swapTokens = () => {
          this.swapTokenPositions();
      };
  }

  setFromToken(token) {
      this.fromToken = token;
      this.updateTokenDropdown('fromTokenDropdown', token);
      this.updateBalances();
      this.calculateToAmount();
  }

  setToToken(token) {
      this.toToken = token;
      this.updateTokenDropdown('toTokenDropdown', token);
      this.updateBalances();
      this.calculateToAmount();
  }

  updateTokenDropdown(dropdownId, token) {
      const dropdown = document.getElementById(dropdownId);
      const tokenInfo = this.getTokenInfo(token);
      
      dropdown.innerHTML = `
          ${tokenInfo.icon}
          ${token}
      `;
  }

  getTokenInfo(token) {
      const tokens = {
          'MATIC': {
              icon: '<img src="https://cryptologos.cc/logos/polygon-matic-logo.png" width="20" height="20" class="me-2">',
              decimals: 18
          },
          'LVL': {
              icon: '<div class="bg-primary rounded-circle d-inline-block me-2" style="width: 20px; height: 20px;"></div>',
              decimals: 18
          }
      };
      return tokens[token] || tokens['MATIC'];
  }

  async updateBalances() {
      if (!userAddress) return;

      try {
          // Update MATIC balance
          const maticBalance = await provider.getBalance(userAddress);
          const maticFormatted = ethers.utils.formatEther(maticBalance);

          // Update LVL balance
          const lvlBalance = await contract.balanceOf(userAddress);
          const lvlFormatted = ethers.utils.formatEther(lvlBalance);

          // Update UI
          if (this.fromToken === 'MATIC') {
              document.getElementById('from-balance').textContent = parseFloat(maticFormatted).toFixed(4);
          } else {
              document.getElementById('from-balance').textContent = parseFloat(lvlFormatted).toFixed(4);
          }

          if (this.toToken === 'LVL') {
              document.getElementById('to-balance').textContent = parseFloat(lvlFormatted).toFixed(4);
          } else {
              document.getElementById('to-balance').textContent = parseFloat(maticFormatted).toFixed(4);
          }

      } catch (error) {
          console.error('خطا در بروزرسانی موجودی:', error);
      }
  }

  async calculateToAmount() {
      if (this.fromAmount <= 0) {
          document.getElementById('to-amount').value = '';
          this.updateSwapInfo(0, 0);
          return;
      }

      try {
          let toAmount = 0;
          let rate = 0;

          if (this.fromToken === 'MATIC' && this.toToken === 'LVL') {
              // MATIC to LVL
              const maticWei = ethers.utils.parseEther(this.fromAmount.toString());
              toAmount = await contract.estimateBuy(maticWei);
              const toAmountFormatted = ethers.utils.formatEther(toAmount);
              rate = parseFloat(toAmountFormatted) / this.fromAmount;
              
              document.getElementById('to-amount').value = parseFloat(toAmountFormatted).toFixed(6);
              
          } else if (this.fromToken === 'LVL' && this.toToken === 'MATIC') {
              // LVL to MATIC
              const lvlWei = ethers.utils.parseEther(this.fromAmount.toString());
              toAmount = await contract.estimateSell(lvlWei);
              const toAmountFormatted = ethers.utils.formatEther(toAmount);
              rate = parseFloat(toAmountFormatted) / this.fromAmount;
              
              document.getElementById('to-amount').value = parseFloat(toAmountFormatted).toFixed(6);
          }

          this.toAmount = parseFloat(document.getElementById('to-amount').value);
          this.exchangeRate = rate;
          this.updateSwapInfo(rate, this.toAmount);

      } catch (error) {
          console.error('خطا در محاسبه مقدار:', error);
          document.getElementById('to-amount').value = '';
          this.updateSwapInfo(0, 0);
      }
  }

  updateSwapInfo(rate, toAmount) {
      // Update exchange rate
      document.getElementById('exchange-rate').textContent = 
          `1 ${this.fromToken} = ${rate.toFixed(6)} ${this.toToken}`;

      // Calculate price impact (simplified)
      const priceImpact = this.fromAmount > 0 ? (this.fromAmount * 0.001) : 0;
      document.getElementById('price-impact').textContent = `${priceImpact.toFixed(3)}%`;
      
      // Update price impact color
      const priceImpactElement = document.getElementById('price-impact');
      if (priceImpact < 1) {
          priceImpactElement.className = 'text-success';
      } else if (priceImpact < 3) {
          priceImpactElement.className = 'text-warning';
      } else {
          priceImpactElement.className = 'text-danger';
      }

      // Update swap button
      this.updateSwapButton();
  }

  updateSwapButton() {
      const swapButton = document.getElementById('swap-button');
      
      if (!userAddress) {
          swapButton.textContent = 'اتصال کیف پول';
          swapButton.disabled = true;
          swapButton.className = 'btn btn-primary btn-lg w-100';
          return;
      }

      if (this.fromAmount <= 0) {
          swapButton.innerHTML = '<i class="bi bi-arrow-left-right"></i> مقدار وارد کنید';
          swapButton.disabled = true;
          swapButton.className = 'btn btn-secondary btn-lg w-100';
          return;
      }

      if (this.isSwapping) {
          swapButton.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> در حال سواپ...';
          swapButton.disabled = true;
          swapButton.className = 'btn btn-primary btn-lg w-100';
          return;
      }

      swapButton.innerHTML = `<i class="bi bi-arrow-left-right"></i> سواپ ${this.fromToken} به ${this.toToken}`;
      swapButton.disabled = false;
      swapButton.className = 'btn btn-success btn-lg w-100';
  }

  async setMaxFromAmount() {
      if (!userAddress) return;

      try {
          let maxAmount = 0;

          if (this.fromToken === 'MATIC') {
              const balance = await provider.getBalance(userAddress);
              const gasReserve = ethers.utils.parseEther('0.01'); // Reserve for gas
              maxAmount = balance.gt(gasReserve) ? 
                  ethers.utils.formatEther(balance.sub(gasReserve)) : '0';
          } else if (this.fromToken === 'LVL') {
              const balance = await contract.balanceOf(userAddress);
              maxAmount = ethers.utils.formatEther(balance);
          }

          document.getElementById('from-amount').value = parseFloat(maxAmount).toFixed(6);
          this.fromAmount = parseFloat(maxAmount);
          this.calculateToAmount();

      } catch (error) {
          console.error('خطا در تنظیم حداکثر مقدار:', error);
          this.showToast('خطا در تنظیم حداکثر مقدار', 'error');
      }
  }

  swapTokenPositions() {
      const tempToken = this.fromToken;
      const tempAmount = this.fromAmount;

      this.setFromToken(this.toToken);
      this.setToToken(tempToken);

      // Swap amounts
      document.getElementById('from-amount').value = this.toAmount || '';
      this.fromAmount = this.toAmount || 0;
      this.calculateToAmount();
  }

  async executeSwap() {
      if (!userAddress || this.fromAmount <= 0 || this.isSwapping) return;

      this.isSwapping = true;
      this.updateSwapButton();

      try {
          this.showTransactionModal('در حال آماده‌سازی تراکنش...');

          let tx;
          
          if (this.fromToken === 'MATIC' && this.toToken === 'LVL') {
              // Buy tokens with MATIC
              const maticAmount = ethers.utils.parseEther(this.fromAmount.toString());
              
              this.updateTransactionMessage('در حال خرید توکن...');
              tx = await contract.buyTokens({ value: maticAmount });
              
          } else if (this.fromToken === 'LVL' && this.toToken === 'MATIC') {
              // Sell tokens for MATIC
              const tokenAmount = ethers.utils.parseEther(this.fromAmount.toString());
              
              this.updateTransactionMessage('در حال فروش توکن...');
              tx = await contract.sellTokens(tokenAmount);
          }

          this.updateTransactionMessage('در انتظار تایید تراکنش...');
          const receipt = await tx.wait();

          // Success
          this.hideTransactionModal();
          this.showToast(
              `سواپ با موفقیت انجام شد! ${this.fromAmount} ${this.fromToken} به ${this.toAmount.toFixed(6)} ${this.toToken}`,
              'success'
          );

          // Reset form
          document.getElementById('from-amount').value = '';
          document.getElementById('to-amount').value = '';
          this.fromAmount = 0;
          this.toAmount = 0;

          // Update balances
          await this.updateBalances();
          if (typeof loadBalances === 'function') {
              await loadBalances();
          }

      } catch (error) {
          console.error('خطا در سواپ:', error);
          this.hideTransactionModal();
          
          let errorMessage = 'خطا در انجام سواپ';
          if (error.message.includes('insufficient funds')) {
              errorMessage = 'موجودی کافی نیست';
          } else if (error.message.includes('user rejected')) {
              errorMessage = 'تراکنش توسط کاربر لغو شد';
          }
          
          this.showToast(errorMessage, 'error');
      } finally {
          this.isSwapping = false;
          this.updateSwapButton();
      }
  }

  showTransactionModal(message) {
      document.getElementById('transaction-message').textContent = message;
      const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
      modal.show();
  }

  updateTransactionMessage(message) {
      document.getElementById('transaction-message').textContent = message;
  }

  hideTransactionModal() {
      const modal = bootstrap.Modal.getInstance(document.getElementById('transactionModal'));
      if (modal) {
          modal.hide();
      }
  }

  showToast(message, type = 'info') {
      const toastContainer = document.getElementById('toast-container');
      const toastId = 'toast-' + Date.now();
      
      const toastHtml = `
          <div id="${toastId}" class="toast ${type}" role="alert" aria-live="assertive" aria-atomic="true">
              <div class="d-flex">
                  <div class="toast-body">
                      ${message}
                  </div>
                  <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
              </div>
          </div>
      `;
      
      toastContainer.insertAdjacentHTML('beforeend', toastHtml);
      
      const toastElement = document.getElementById(toastId);
      const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
      toast.show();
      
      // Remove toast element after it's hidden
      toastElement.addEventListener('hidden.bs.toast', () => {
          toastElement.remove();
      });
  }
}

// Initialize swap manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.swapManager = new SwapManager();
});

// Update swap manager when wallet is connected
document.addEventListener('walletConnected', () => {
  if (window.swapManager) {
      window.swapManager.updateBalances();
      window.swapManager.updateSwapButton();
  }
});