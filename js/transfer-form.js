// TransferManager - Independent token transfer management
// Contract addresses and ABIs
const IAM_ADDRESS_TRANSFER_NEW = '0x63F5a2085906f5fcC206d6589d78038FBc74d2FE'; // New contract
const IAM_ADDRESS_TRANSFER_OLD = '0xd7eDAdcae9073FD69Ae1081B057922F41Adf0607'; // Old contract
const DAI_ADDRESS_TRANSFER = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';
const POL_ADDRESS = '0x0000000000000000000000000000000000000000'; // Native MATIC

// Default to new contract
let IAM_ADDRESS_TRANSFER = IAM_ADDRESS_TRANSFER_NEW;

const DAI_ABI_TRANSFER = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
];

const IAM_ABI_TRANSFER = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
];

class TransferManager {
    constructor() {
        console.log('🏗️ Creating TransferManager instance...');
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.daiContract = null;
        this.isRefreshing = false;

        console.log('✅ TransferManager created');
    }





    async connectWallet() {
        try {
            console.log('🔗 Connecting to wallet...');
            
            // Use existing contractConfig if available
            if (window.contractConfig && window.contractConfig.signer) {
                console.log('✅ Using existing wallet connection');
                this.provider = window.contractConfig.provider;
                this.signer = window.contractConfig.signer;
                this.contract = new ethers.Contract(IAM_ADDRESS_TRANSFER, IAM_ABI_TRANSFER, this.signer);
                this.daiContract = new ethers.Contract(DAI_ADDRESS_TRANSFER, DAI_ABI_TRANSFER, this.signer);
                return true;
            }
            
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask not installed');
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Create provider and signer
            if (typeof ethers.providers !== 'undefined' && ethers.providers.Web3Provider) {
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
            } else if (typeof ethers.BrowserProvider !== 'undefined') {
                this.provider = new ethers.BrowserProvider(window.ethereum);
            } else {
                throw new Error('Ethers.js provider not available');
            }
            this.signer = this.provider.getSigner();
            
            // Create contract instances
            this.contract = new ethers.Contract(IAM_ADDRESS_TRANSFER, IAM_ABI_TRANSFER, this.signer);
            this.daiContract = new ethers.Contract(DAI_ADDRESS_TRANSFER, DAI_ABI_TRANSFER, this.signer);
            
            console.log('✅ Wallet connected successfully');
            return true;
        } catch (error) {
            console.error('❌ Error connecting wallet:', error);
            throw error;
        }
    }

    async updateDaiBalance() {
        if (!this.signer || !this.daiContract) return;
        try {
            const address = await this.signer.getAddress();
            const daiBalance = await this.daiContract.balanceOf(address);
            const el = document.getElementById('transfer-dai-balance');
            if (el) {
                // Handle different ethers.js versions
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
                    value = ethers.utils.formatUnits(daiBalance, 18);
                } else if (typeof ethers.formatUnits !== 'undefined') {
                    value = ethers.formatUnits(daiBalance, 18);
                } else {
                    // Manual conversion
                    value = (parseFloat(daiBalance.toString()) / Math.pow(10, 18)).toString();
                }
                el.textContent = parseFloat(value).toFixed(2);
            }
        } catch (e) {
            const el = document.getElementById('transfer-dai-balance');
            if (el) el.textContent = 'Unable to load';
        }
    }

    async updateIAMBalance() {
        if (!this.signer || !this.contract) return;
        try {
            const address = await this.signer.getAddress();
            const iamBalance = await this.contract.balanceOf(address);
            const el = document.getElementById('transfer-IAM-balance');
            if (el) {
                // Handle different ethers.js versions
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
                    value = ethers.utils.formatUnits(iamBalance, 18);
                } else if (typeof ethers.formatUnits !== 'undefined') {
                    value = ethers.formatUnits(iamBalance, 18);
                } else {
                    // Manual conversion
                    value = (parseFloat(iamBalance.toString()) / Math.pow(10, 18)).toString();
                }
                el.textContent = Math.floor(parseFloat(value));
            }
        } catch (e) {
            const el = document.getElementById('transfer-IAM-balance');
            if (el) el.textContent = 'Unable to load';
        }
    }

    async updatePOLBalance() {
        if (!this.signer) return;
        try {
            const address = await this.signer.getAddress();
            const polBalance = await this.provider.getBalance(address);
            const el = document.getElementById('transfer-poly-balance');
            if (el) {
                // Handle different ethers.js versions
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatEther) {
                    value = ethers.utils.formatEther(polBalance);
                } else if (typeof ethers.formatEther !== 'undefined') {
                    value = ethers.formatEther(polBalance);
                } else {
                    // Manual conversion
                    value = (parseFloat(polBalance.toString()) / Math.pow(10, 18)).toString();
                }
                el.textContent = parseFloat(value).toFixed(4);
            }
        } catch (e) {
            const el = document.getElementById('transfer-poly-balance');
            if (el) el.textContent = 'Unable to load';
        }
    }

    async loadTransferData() {
        if (this.isRefreshing) return;
        this.isRefreshing = true;
        
        try {
            console.log('🔄 Loading transfer data...');
            
            if (!this.signer) {
                console.log('⚠️ No signer available');
                return;
            }
            
            console.log('✅ Contract connection established');
            
            // Load all balances
            await Promise.all([
                this.updateDaiBalance(),
                this.updateIAMBalance(),
                this.updatePOLBalance()
            ]);
            
            console.log('✅ Transfer data loaded');
        } catch (error) {
            console.error('❌ Error loading transfer data:', error);
        } finally {
            this.isRefreshing = false;
        }
    }

    async initializeTransfer() {
        try {
            console.log('🔄 Starting TransferManager initialization...');
            
            // Connect to wallet
            await this.connectWallet();
            console.log('✅ Wallet connected');
            
            // Load transfer data
            await this.loadTransferData();
            console.log('✅ Transfer data loaded');
            
            // Setup event listeners
            this.setupEventListeners();
            console.log('✅ Event listeners configured');
            
            // Contract selection removed - using new contract by default
            console.log('✅ Using new contract by default');
            
            console.log('✅ TransferManager successfully initialized');
        } catch (error) {
            console.error('❌ Error initializing TransferManager:', error);
            throw error;
        }
    }

    setupEventListeners() {
        const transferForm = document.getElementById('transferForm');
        if (!transferForm) return;

        transferForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleTransfer(e);
        });

        // Max button
        const maxBtn = document.getElementById('maxAmountBtn');
        if (maxBtn) {
            maxBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default button behavior
                e.stopPropagation(); // Stop event bubbling
                this.setMaxAmount();
            });
        }


    }

    // Show status message
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('transferStatus');
        if (!statusEl) return;
        
        let className = 'transfer-status';
        let icon = '';
        
        switch(type) {
            case 'success':
                className += ' success';
                icon = '✅ ';
                break;
            case 'error':
                className += ' error';
                icon = '❌ ';
                break;
            case 'loading':
                className += ' loading';
                icon = '⏳ ';
                break;
            default:
                className += ' info';
                icon = 'ℹ️ ';
        }
        
        statusEl.className = className;
        statusEl.textContent = icon + message;
    }

    async setMaxAmount() {
        const tokenSelect = document.getElementById('transferToken');
        const amountInput = document.getElementById('transferAmount');
        
        if (!tokenSelect || !amountInput) return;
        
        const token = tokenSelect.value.toLowerCase();
        
        try {
            if (token === 'dai') {
                const address = await this.signer.getAddress();
                const balance = await this.daiContract.balanceOf(address);
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
                    value = ethers.utils.formatUnits(balance, 18);
                } else if (typeof ethers.formatUnits !== 'undefined') {
                    value = ethers.formatUnits(balance, 18);
                } else {
                    value = (parseFloat(balance.toString()) / Math.pow(10, 18)).toString();
                }
                amountInput.value = parseFloat(value).toFixed(6);
            } else if (token === 'iam') {
                const address = await this.signer.getAddress();
                const balance = await this.contract.balanceOf(address);
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatUnits) {
                    value = ethers.utils.formatUnits(balance, 18);
                } else if (typeof ethers.formatUnits !== 'undefined') {
                    value = ethers.formatUnits(balance, 18);
                } else {
                    value = (parseFloat(balance.toString()) / Math.pow(10, 18)).toString();
                }
                // Round down and subtract 100 tokens to be safe
                const safeAmount = Math.floor(parseFloat(value)) - 100;
                amountInput.value = safeAmount > 0 ? safeAmount : '0';
            } else if (token === 'pol') {
                const address = await this.signer.getAddress();
                const balance = await this.provider.getBalance(address);
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.formatEther) {
                    value = ethers.utils.formatEther(balance);
                } else if (typeof ethers.formatEther !== 'undefined') {
                    value = ethers.formatEther(balance);
                } else {
                    value = (parseFloat(balance.toString()) / Math.pow(10, 18)).toString();
                }
                // Leave some for gas and round down
                const maxAmount = parseFloat(value) - 0.01;
                amountInput.value = maxAmount > 0 ? Math.floor(maxAmount) : '0';
            }
        } catch (error) {
            console.error('❌ Error setting max amount:', error);
        }
    }

    async handleTransfer(e) {
        const transferForm = e.target;
        const transferBtn = transferForm.querySelector('button[type="submit"]');
        const oldText = transferBtn ? transferBtn.textContent : '';
        
        if (transferBtn) {
            transferBtn.disabled = true;
            transferBtn.textContent = 'Processing Transfer...';
        }

        const transferToInput = document.getElementById('transferTo');
        const to = transferToInput.getAttribute('data-full-address') || transferToInput.value.trim();
        const amount = parseFloat(document.getElementById('transferAmount').value);
        const token = document.getElementById('transferToken').value;
        const status = document.getElementById('transferStatus');
        
        status.textContent = '';
        status.className = 'transfer-status';
        
        if (!to || !amount || amount <= 0) {
            status.textContent = 'Please enter a valid destination address and amount (minimum 0.000001)';
            status.className = 'transfer-status error';
            if (transferBtn) { transferBtn.disabled = false; transferBtn.textContent = oldText; }
            return;
        }
        
        if (!this.signer) {
            status.textContent = 'Wallet connection not established. Please connect your wallet first.';
            status.className = 'transfer-status error';
            if (transferBtn) { transferBtn.disabled = false; transferBtn.textContent = oldText; }
            return;
        }
        
        try {
            status.textContent = '🚀 Initiating transfer... Please wait while we process your transaction.';
            status.className = 'transfer-status loading';
            
            if (token.toLowerCase() === 'pol') {
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.parseEther) {
                    value = ethers.utils.parseEther(amount.toString());
                } else if (typeof ethers.parseEther !== 'undefined') {
                    value = ethers.parseEther(amount.toString());
                } else {
                    value = (parseFloat(amount) * Math.pow(10, 18)).toString();
                }
                const tx = await this.signer.sendTransaction({
                    to,
                    value: value
                });
                status.textContent = '⏳ MATIC transfer submitted! Waiting for blockchain confirmation...';
                status.className = 'transfer-status loading';
                await tx.wait();
                status.textContent = '🎉 MATIC transfer completed successfully!\nTransaction ID: ' + tx.hash;
                status.className = 'transfer-status success';
            } else if (token.toLowerCase() === 'dai') {
                let parsedAmount;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.parseUnits) {
                    parsedAmount = ethers.utils.parseUnits(amount.toString(), 18);
                } else if (typeof ethers.parseUnits !== 'undefined') {
                    parsedAmount = ethers.parseUnits(amount.toString(), 18);
                } else {
                    parsedAmount = (parseFloat(amount) * Math.pow(10, 18)).toString();
                }
                const tx = await this.daiContract.transfer(to, parsedAmount);
                status.textContent = '⏳ DAI transfer submitted! Waiting for blockchain confirmation...';
                status.className = 'transfer-status loading';
                await tx.wait();
                status.textContent = '🎉 DAI transfer completed successfully!\nTransaction ID: ' + tx.hash;
                status.className = 'transfer-status success';
            } else {
                // IAM Token Transfer
                let value;
                if (typeof ethers.utils !== 'undefined' && ethers.utils.parseUnits) {
                    value = ethers.utils.parseUnits(amount.toString(), 18);
                } else if (typeof ethers.parseUnits !== 'undefined') {
                    value = ethers.parseUnits(amount.toString(), 18);
                } else {
                    value = (parseFloat(amount) * Math.pow(10, 18)).toString();
                }
                
                console.log('🔄 IAM Transfer Details:', {
                    to: to,
                    amount: amount,
                    value: value.toString(),
                    contract: this.contract.address
                });
                
                const tx = await this.contract.transfer(to, value);
                status.textContent = '⏳ IAM transfer submitted! Waiting for blockchain confirmation...';
                status.className = 'transfer-status loading';
                await tx.wait();
                status.textContent = '🎉 IAM transfer completed successfully!\nTransaction ID: ' + tx.hash;
                status.className = 'transfer-status success';
            }
            
            transferForm.reset();
            await this.loadTransferData(); // Refresh balances after successful transfer
            
        } catch (error) {
            let msg = error && error.message ? error.message : error;
            if (msg.includes('user rejected')) msg = '❌ Transaction cancelled by user. Please try again when ready.';
            else if (msg.includes('insufficient funds')) msg = '❌ Insufficient balance for gas fees or transfer amount. Please check your wallet balance.';
            else if (msg.includes('insufficient balance')) msg = '❌ Insufficient token balance. Please check your wallet and try again.';
            else if (msg.includes('invalid address')) msg = '❌ Invalid destination address. Please enter a valid wallet address.';
            else if (msg.includes('not allowed') || msg.includes('only owner')) msg = '❌ You are not authorized to perform this operation. Please check your permissions.';
            else if (msg.includes('already transferred') || msg.includes('already exists')) msg = '❌ This transfer has already been completed or is a duplicate. Please check your transaction history.';
            else if (msg.includes('slippage')) msg = '❌ Price difference is too high. Please adjust the amount and try again.';
            else if (msg.includes('price changed')) msg = '❌ Token price has changed. Please refresh and try again.';
            else if (msg.includes('nonce')) msg = '❌ Transaction sequence error. Please try again in a moment.';
            else if (msg.includes('execution reverted')) msg = '❌ Transfer failed. Please check the destination address and amount.';
            else if (msg.includes('network') || msg.includes('connection')) msg = '❌ Network connection error. Please check your internet connection and try again.';
            else if (msg.includes('timeout')) msg = '❌ Transaction timeout. Please try again with higher gas fees.';
            else if (msg.includes('gas')) msg = '❌ Insufficient gas for transaction. Please increase gas limit.';
            else if (msg.includes('revert')) msg = '❌ Transfer failed. Please verify the destination address and try again.';
            else msg = '❌ Transfer error: ' + msg + '. Please try again.';
            
            status.textContent = msg;
            status.className = 'transfer-status error';
        }
        
        if (transferBtn) { 
            transferBtn.disabled = false; 
            transferBtn.textContent = oldText; 
        }
    }
}

// Make TransferManager available globally
window.TransferManager = TransferManager; 