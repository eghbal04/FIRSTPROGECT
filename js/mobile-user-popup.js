// Display user information on mobile
class MobileUserPopup {
    constructor() {
        this.popup = null;
        this.backdrop = null;
        this.touchStartY = 0;
        this.currentY = 0;
        this.isScrolling = false;
        this.setupPopup();
        this.setupStyles();
    }

    setupStyles() {
        // Add CSS for left-aligned mobile popup
        if (!document.getElementById('mobile-popup-styles')) {
            const style = document.createElement('style');
            style.id = 'mobile-popup-styles';
            style.textContent = `
                #user-popup {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #232946 0%, #181c2a 100%);
                    border-radius: 20px 20px 0 0;
                    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.3);
                    transform: translateY(100%);
                    transition: transform 0.15s ease-out;
                    z-index: 9999;
                    max-height: 80vh;
                    overflow: hidden;
                    direction: ltr;
                    text-align: left;
                }

                #user-popup.active {
                    transform: translateY(0);
                }

                .popup-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px 8px;
                    border-bottom: 1px solid rgba(167, 134, 255, 0.2);
                }

                .popup-handle {
                    width: 40px;
                    height: 4px;
                    background: rgba(167, 134, 255, 0.5);
                    border-radius: 2px;
                    margin: 0 auto;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: #a786ff;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 50%;
                    transition: background 0.15s ease;
                }

                .close-btn:hover {
                    background: rgba(167, 134, 255, 0.1);
                }

                .popup-content {
                    padding: 0 20px 20px;
                    max-height: calc(80vh - 80px);
                    overflow-y: auto;
                    direction: ltr;
                    text-align: left;
                }

                .user-info-card {
                    background: rgba(28, 28, 40, 0.8);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                }

                .user-header {
                    margin-bottom: 16px;
                }

                .user-primary-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .user-id {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .user-id .label {
                    font-size: 12px;
                    color: #a786ff;
                    font-weight: 500;
                }

                .user-id .value {
                    font-size: 16px;
                    font-weight: bold;
                    color: #fff;
                    cursor: pointer;
                    padding: 4px 8px;
                    background: rgba(167, 134, 255, 0.1);
                    border-radius: 6px;
                    transition: background 0.15s ease;
                }

                .user-id .value:hover {
                    background: rgba(167, 134, 255, 0.2);
                }

                .user-status {
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .user-status.active {
                    background: rgba(0, 255, 136, 0.2);
                    color: #00ff88;
                }

                .user-status.inactive {
                    background: rgba(255, 0, 0, 0.2);
                    color: #ff4444;
                }

                .user-wallet {
                    font-size: 14px;
                    color: #718096;
                    cursor: pointer;
                    padding: 4px 8px;
                    background: rgba(113, 128, 150, 0.1);
                    border-radius: 6px;
                    transition: background 0.15s ease;
                }

                .user-wallet:hover {
                    background: rgba(113, 128, 150, 0.2);
                }

                .user-stats {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(167, 134, 255, 0.05);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    border: 1px solid rgba(167, 134, 255, 0.1);
                }

                .stat-item:hover {
                    background: rgba(167, 134, 255, 0.1);
                    border-color: rgba(167, 134, 255, 0.3);
                }

                .stat-item.expanded {
                    background: rgba(167, 134, 255, 0.15);
                    border-color: rgba(167, 134, 255, 0.4);
                }

                .stat-icon {
                    font-size: 20px;
                    width: 24px;
                    text-align: center;
                }

                .stat-details {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .stat-label {
                    font-size: 12px;
                    color: #a786ff;
                    font-weight: 500;
                }

                .stat-value {
                    font-size: 14px;
                    font-weight: bold;
                    color: #fff;
                }

                .expand-indicator {
                    font-size: 12px;
                    color: #a786ff;
                    transition: transform 0.15s ease;
                }

                .stat-item.expanded .expand-indicator {
                    transform: rotate(180deg);
                }

                .live-balances {
                    background: rgba(0, 255, 136, 0.05);
                    border: 1px solid rgba(0, 255, 136, 0.1);
                    border-radius: 8px;
                    padding: 12px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .live-balances:hover {
                    background: rgba(0, 255, 136, 0.1);
                    border-color: rgba(0, 255, 136, 0.3);
                }

                .live-balances.expanded {
                    background: rgba(0, 255, 136, 0.15);
                    border-color: rgba(0, 255, 136, 0.4);
                }

                .balance-title {
                    font-size: 14px;
                    font-weight: bold;
                    color: #00ff88;
                    margin-bottom: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .balance-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 8px;
                }

                .balance-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    background: rgba(0, 255, 136, 0.05);
                    border-radius: 6px;
                }

                .balance-item span:first-child {
                    font-size: 16px;
                }

                .balance-item span:nth-child(2) {
                    font-size: 12px;
                    color: #a786ff;
                    font-weight: 500;
                    flex: 1;
                }

                .balance-value {
                    font-size: 14px;
                    font-weight: bold;
                    color: #fff;
                }

                @media (max-width: 480px) {
                    #user-popup {
                        max-height: 85vh;
                    }
                    
                    .popup-content {
                        max-height: calc(85vh - 80px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupPopup() {
        // Create main popup
        this.popup = document.createElement('div');
        this.popup.id = 'user-popup';
        
        // Create backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'popup-backdrop';
        this.backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            opacity: 0;
            transition: opacity 0.15s ease;
            z-index: 9998;
            display: none;
        `;
        
        // Add to DOM
        document.body.appendChild(this.backdrop);
        document.body.appendChild(this.popup);
        
        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Click on backdrop
        this.backdrop.addEventListener('click', () => this.hide());

        // Setup gesture for mobile with improved scroll
        this.popup.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
            this.popup.style.transition = 'none';
            this.isScrolling = false;
        });

        this.popup.addEventListener('touchmove', (e) => {
            this.currentY = e.touches[0].clientY;
            const deltaY = this.currentY - this.touchStartY;
            const scrollContainer = this.popup.querySelector('.popup-content');
            
            // Check if content is scrollable
            if (scrollContainer) {
                const isAtTop = scrollContainer.scrollTop === 0;
                const isAtBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight;
                
                // If at top and pulling down, or at bottom and pulling up
                if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
                    e.preventDefault();
                    this.popup.style.transform = `translateY(${deltaY}px)`;
                    const opacity = Math.max(0.5 - (deltaY / 1000), 0);
                    this.backdrop.style.opacity = opacity.toString();
                } else {
                    // Allow scrolling in content
                    this.isScrolling = true;
                }
            } else {
                // If no scrollable content, only allow pulling down
                if (deltaY > 0) {
                    e.preventDefault();
                    this.popup.style.transform = `translateY(${deltaY}px)`;
                    const opacity = Math.max(0.5 - (deltaY / 1000), 0);
                    this.backdrop.style.opacity = opacity.toString();
                }
            }
        });

        this.popup.addEventListener('touchend', () => {
            const deltaY = this.currentY - this.touchStartY;
            this.popup.style.transition = 'transform 0.15s ease-out';
            
            // Only close popup if not scrolling
            if (!this.isScrolling && deltaY > 100) {
                this.hide();
            } else {
                this.popup.style.transform = 'translateY(0)';
                this.backdrop.style.opacity = '0.5';
            }
        });
    }

    show(address, user) {
        if (!user) return;

        const IAMId = user.index !== undefined ? (window.generateIAMId ? window.generateIAMId(user.index) : user.index) : user.index;
        const walletAddress = address || '-';
        const isActive = (user && user.index && BigInt(user.index) > 0n) || false;
        
        const infoList = [
            {icon:'🎯', label:'Binary Points', val:user.binaryPoints},
            {icon:'🏆', label:'Binary Cap', val:user.binaryPointCap},
            {icon:'💎', label:'Binary Reward', val:user.totalMonthlyRewarded},
            {icon:'✅', label:'Claimed Points', val:user.binaryPointsClaimed},
            {icon:'🤝', label:'Referral Income', val:user.refclimed ? Math.floor(Number(user.refclimed) / 1e18) : 0},
            {icon:'💰', label:'Total Deposit', val:user.depositedAmount ? Math.floor(Number(user.depositedAmount) / 1e18) : 0},
            {icon:'⬅️', label:'Left Points', val:user.leftPoints},
            {icon:'➡️', label:'Right Points', val:user.rightPoints}
        ];

        this.popup.innerHTML = `
            <div class="popup-header">
                <div class="popup-handle"></div>
                <button class="close-btn" onclick="window.mobileUserPopup.hide()">×</button>
            </div>
            <div class="popup-content">
                <div class="user-info-card">
                    <div class="user-header">
                        <div class="user-primary-info">
                            <div class="user-id">
                                <span class="label">User ID</span>
                                <span class="value" onclick="navigator.clipboard.writeText('${IAMId}')">${IAMId}</span>
                            </div>
                            <div class="user-status ${isActive ? 'active' : 'inactive'}">
                                ${isActive ? '✅ Active' : '❌ Inactive'}
                            </div>
                        </div>
                        <div class="user-wallet" onclick="navigator.clipboard.writeText('${walletAddress}')">
                            ${this.shortAddress(walletAddress)}
                        </div>
                    </div>

                    <div class="user-stats">
                        ${infoList.map((info, index) => `
                            <div class="stat-item collapsed" data-index="${index}">
                                <div class="stat-icon">${info.icon}</div>
                                <div class="stat-details">
                                    <div class="stat-label">${info.label}</div>
                                    <div class="stat-value">${this.formatValue(info.val)}</div>
                                </div>
                                <div class="expand-indicator">▼</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div id="live-balances" class="live-balances collapsed">
                        <div class="balance-title">Live Balances</div>
                        <div class="balance-grid">
                            <div class="balance-item">
                                <span>🟢</span>
                                <span>IAM</span>
                                <span class="balance-value" id="IAM-balance">-</span>
                            </div>
                            <div class="balance-item">
                                <span>🟣</span>
                                <span>MATIC</span>
                                <span class="balance-value" id="matic-balance">-</span>
                            </div>
                            <div class="balance-item">
                                <span>💵</span>
                                <span>DAI</span>
                                <span class="balance-value" id="dai-balance">-</span>
                            </div>
                        </div>
                        <div class="expand-indicator">▼</div>
                    </div>
                </div>
            </div>
        `;

        // Show popup and backdrop
        this.backdrop.style.display = 'block';
        this.popup.classList.add('active');
        this.backdrop.classList.add('active');
        setTimeout(() => {
            this.backdrop.style.opacity = '0.5';
        }, 25);

        // Get live balances
        this.getLiveBalances(walletAddress);
        
        // Direct test balances
        setTimeout(() => {
            this.testBalancesInPopup(walletAddress);
        }, 500);
        
        // Setup initial card sizes based on content
        this.adjustCardSizes();
        
        // Add event listeners for cards
        this.setupCardEventListeners();
    }

    hide() {
        this.popup.style.transform = 'translateY(100%)';
        this.backdrop.style.opacity = '0';
        
        setTimeout(() => {
            this.popup.classList.remove('active');
            this.backdrop.style.display = 'none';
            this.popup.style.transform = '';
        }, 150);
    }

    shortAddress(addr) {
        if (!addr || addr === '-') return '-';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }

    formatValue(value) {
        if (value === undefined || value === null) return '-';
        
        // Convert to number
        const numValue = Number(value);
        if (isNaN(numValue)) return value.toString();
        
        // If number is large, display appropriate format
        if (numValue >= 1000000) {
            return (numValue / 1000000).toFixed(2) + 'M';
        } else if (numValue >= 1000) {
            return (numValue / 1000).toFixed(2) + 'K';
        } else if (numValue % 1 === 0) {
            return numValue.toString();
        } else {
            return numValue.toFixed(2);
        }
    }

    toggleCard(cardElement) {
        const isExpanded = cardElement.classList.contains('expanded');
        
        if (isExpanded) {
            cardElement.classList.remove('expanded');
            cardElement.classList.add('collapsed');
        } else {
            cardElement.classList.remove('collapsed');
            cardElement.classList.add('expanded');
        }
        
        // Reset card sizes
        this.adjustCardSizes();
    }

    setupCardEventListeners() {
        // Add event listener for stat cards
        const statItems = this.popup.querySelectorAll('.stat-item');
        statItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCard(item);
            });
        });
        
        // Add event listener for balance card
        const liveBalances = this.popup.querySelector('#live-balances');
        if (liveBalances) {
            liveBalances.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCard(liveBalances);
            });
        }
    }

    adjustCardSizes() {
        const statItems = this.popup.querySelectorAll('.stat-item');
        const liveBalances = this.popup.querySelector('#live-balances');
        
        // Adjust stat card sizes
        statItems.forEach(item => {
            const valueElement = item.querySelector('.stat-value');
            const content = valueElement.textContent;
            
            // If content is long, suggest expand
            if (content.length > 15 || content.includes('K') || content.includes('M')) {
                item.style.cursor = 'pointer';
            }
        });
        
        // Adjust balance card size
        if (liveBalances) {
            const balanceValues = liveBalances.querySelectorAll('.balance-value');
            let hasLongContent = false;
            
            balanceValues.forEach(value => {
                if (value.textContent.length > 10) {
                    hasLongContent = true;
                }
            });
            
            if (hasLongContent) {
                liveBalances.style.cursor = 'pointer';
            }
        }
    }

    async getLiveBalances(address) {
        if (!address || address === '-') {
            console.log('❌ No valid address provided for balance fetching');
            return;
        }

        console.log('🔄 Fetching live balances for address:', address);
        console.log('🔍 Connection status:', {
            ethereum: !!window.ethereum,
            contractConfig: !!window.contractConfig,
            contract: !!(window.contractConfig && window.contractConfig.contract),
            provider: !!(window.contractConfig && window.contractConfig.provider)
        });

        try {
            // Method 1: Use window.connectWallet
            if (typeof window.connectWallet === 'function') {
                try {
                    console.log('🔄 Trying window.connectWallet method...');
                    const connection = await window.connectWallet();
                    const { contract, provider, address: connectedAddress } = connection;
                    
                    // Get IAM balance
                    if (contract && typeof contract.balanceOf === 'function') {
                        try {
                            const iamBalance = await contract.balanceOf(address);
                            const iamElement = document.getElementById('IAM-balance');
                            if (iamElement) {
                                const formattedBalance = typeof ethers !== 'undefined' ? 
                                    ethers.formatEther(iamBalance) : 
                                    (Number(iamBalance) / 1e18).toString();
                                iamElement.textContent = this.formatValue(formattedBalance);
                                console.log('✅ IAM balance updated via connectWallet:', formattedBalance);
                            }
                        } catch (error) {
                            console.warn('❌ Error fetching IAM balance via connectWallet:', error);
                            const iamElement = document.getElementById('IAM-balance');
                            if (iamElement) iamElement.textContent = '❌';
                        }
                    }

                    // Get MATIC balance
                    if (provider) {
                        try {
                            const maticBalance = await provider.getBalance(address);
                            const maticElement = document.getElementById('matic-balance');
                            if (maticElement) {
                                const formattedBalance = typeof ethers !== 'undefined' ? 
                                    ethers.formatEther(maticBalance) : 
                                    (Number(maticBalance) / 1e18).toString();
                                maticElement.textContent = this.formatValue(formattedBalance);
                                console.log('✅ MATIC balance updated via connectWallet:', formattedBalance);
                            }
                        } catch (error) {
                            console.warn('❌ Error fetching MATIC balance via connectWallet:', error);
                            const maticElement = document.getElementById('matic-balance');
                            if (maticElement) maticElement.textContent = '❌';
                        }
                    }

                    // Get DAI balance
                    if (window.DAI_ADDRESS && provider) {
                        try {
                            const DAI_ABI = window.DAI_ABI || [
                                "function balanceOf(address owner) view returns (uint256)",
                                "function decimals() view returns (uint8)",
                                "function symbol() view returns (string)"
                            ];
                            const daiContract = new ethers.Contract(window.DAI_ADDRESS, DAI_ABI, provider);
                            const daiBalance = await daiContract.balanceOf(address);
                            const daiElement = document.getElementById('dai-balance');
                            if (daiElement) {
                                const formattedBalance = typeof ethers !== 'undefined' ? 
                                    ethers.formatEther(daiBalance) : 
                                    (Number(daiBalance) / 1e18).toString();
                                daiElement.textContent = this.formatValue(formattedBalance);
                                console.log('✅ DAI balance updated via connectWallet:', formattedBalance);
                            }
                        } catch (error) {
                            console.warn('❌ Error fetching DAI balance via connectWallet:', error);
                            const daiElement = document.getElementById('dai-balance');
                            if (daiElement) daiElement.textContent = '❌';
                        }
                    }

                    return; // If successful, exit here
                } catch (error) {
                    console.warn('❌ Error with window.connectWallet method:', error);
                }
            }

            // Method 2: Use window.contractConfig
            if (window.contractConfig && window.contractConfig.contract) {
                try {
                    console.log('🔄 Trying window.contractConfig method...');
                    const { contract } = window.contractConfig;
                    
                    // Get IAM balance
                    if (typeof contract.balanceOf === 'function') {
                        try {
                            const iamBalance = await contract.balanceOf(address);
                            const iamElement = document.getElementById('IAM-balance');
                            if (iamElement) {
                                const formattedBalance = typeof ethers !== 'undefined' ? 
                                    ethers.formatEther(iamBalance) : 
                                    (Number(iamBalance) / 1e18).toString();
                                iamElement.textContent = this.formatValue(formattedBalance);
                                console.log('✅ IAM balance updated via contractConfig:', formattedBalance);
                            }
                        } catch (error) {
                            console.warn('❌ Error fetching IAM balance via contractConfig:', error);
                            const iamElement = document.getElementById('IAM-balance');
                            if (iamElement) iamElement.textContent = '❌';
                        }
                    }
                } catch (error) {
                    console.warn('❌ Error with window.contractConfig method:', error);
                }
            }

            // Method 3: Use window.ethereum
            if (window.ethereum) {
                try {
                    console.log('🔄 Trying window.ethereum method...');
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    
                    // Get MATIC balance
                    try {
                        const maticBalance = await provider.getBalance(address);
                        const maticElement = document.getElementById('matic-balance');
                        if (maticElement) {
                            const formattedBalance = typeof ethers !== 'undefined' ? 
                                ethers.formatEther(maticBalance) : 
                                (Number(maticBalance) / 1e18).toString();
                            maticElement.textContent = this.formatValue(formattedBalance);
                            console.log('✅ MATIC balance updated via ethereum:', formattedBalance);
                        }
                    } catch (error) {
                        console.warn('❌ Error fetching MATIC balance via ethereum:', error);
                        const maticElement = document.getElementById('matic-balance');
                        if (maticElement) maticElement.textContent = '❌';
                    }
                } catch (error) {
                    console.warn('❌ Error with window.ethereum method:', error);
                }
            }

            // Method 4: Use existing provider
            if (window.contractConfig && window.contractConfig.provider) {
                try {
                    console.log('🔄 Trying existing provider method...');
                    const provider = window.contractConfig.provider;
                    
                    // Get MATIC balance
                    try {
                        const maticBalance = await provider.getBalance(address);
                        const maticElement = document.getElementById('matic-balance');
                        if (maticElement && maticElement.textContent === '-') {
                            const formattedBalance = typeof ethers !== 'undefined' ? 
                                ethers.formatEther(maticBalance) : 
                                (Number(maticBalance) / 1e18).toString();
                            maticElement.textContent = this.formatValue(formattedBalance);
                            console.log('✅ MATIC balance updated via existing provider:', formattedBalance);
                        }
                    } catch (error) {
                        console.warn('❌ Error fetching MATIC balance via existing provider:', error);
                    }
                } catch (error) {
                    console.warn('❌ Error with existing provider method:', error);
                }
            }

            console.log('🏁 Balance fetching completed');
            
        } catch (error) {
            console.warn('❌ General error fetching live balances:', error);
        }
    }

    // Test function to check functionality
    testExpandCollapse() {
        console.log('Testing expand/collapse functionality...');
        
        const statItems = this.popup.querySelectorAll('.stat-item');
        const liveBalances = this.popup.querySelector('#live-balances');
        
        console.log('Found stat items:', statItems.length);
        console.log('Found live balances:', !!liveBalances);
        
        // Test click on first stat card
        if (statItems.length > 0) {
            console.log('Testing first stat item...');
            this.toggleCard(statItems[0]);
        }
        
        // Test click on balance card
        if (liveBalances) {
            console.log('Testing live balances...');
            this.toggleCard(liveBalances);
        }
    }

    // Direct test function for balances in popup
    async testBalancesInPopup(address) {
        console.log('🧪 Testing balances directly in popup for address:', address);
        
        if (!address || address === '-') {
            console.log('❌ No valid address provided');
            return;
        }

        try {
            // Test connection
            if (typeof window.connectWallet === 'function') {
                console.log('🔄 Testing connectWallet in popup...');
                const connection = await window.connectWallet();
                console.log('✅ connectWallet result in popup:', connection);
                
                if (connection && connection.contract) {
                    console.log('🔄 Testing IAM balance in popup...');
                    const iamBalance = await connection.contract.balanceOf(address);
                    const iamElement = document.getElementById('IAM-balance');
                    if (iamElement) {
                        const formattedBalance = typeof ethers !== 'undefined' ? 
                            ethers.formatEther(iamBalance) : 
                            (Number(iamBalance) / 1e18).toString();
                        iamElement.textContent = this.formatValue(formattedBalance);
                        console.log('✅ IAM balance updated in popup:', formattedBalance);
                    }
                }
                
                if (connection && connection.provider) {
                    console.log('🔄 Testing MATIC balance in popup...');
                    const maticBalance = await connection.provider.getBalance(address);
                    const maticElement = document.getElementById('matic-balance');
                    if (maticElement) {
                        const formattedBalance = typeof ethers !== 'undefined' ? 
                            ethers.formatEther(maticBalance) : 
                            (Number(maticBalance) / 1e18).toString();
                        maticElement.textContent = this.formatValue(formattedBalance);
                        console.log('✅ MATIC balance updated in popup:', formattedBalance);
                    }
                }
            } else {
                console.log('❌ window.connectWallet not available in popup');
            }
            
        } catch (error) {
            console.error('❌ Error in testBalancesInPopup:', error);
        }
    }
}

// Create global instance
window.mobileUserPopup = new MobileUserPopup();

// Add test function to window for console access
window.testMobilePopup = function() {
    if (window.mobileUserPopup) {
        window.mobileUserPopup.testExpandCollapse();
    } else {
        console.log('Mobile popup not initialized');
    }
};

// Simple test function to check loading
window.testMobilePopupLoad = function() {
    console.log('🔍 Testing mobile popup load...');
    console.log('MobileUserPopup class:', typeof MobileUserPopup);
    console.log('window.mobileUserPopup:', window.mobileUserPopup);
    console.log('window.testMobilePopup:', typeof window.testMobilePopup);
    
    if (window.mobileUserPopup) {
        console.log('✅ Mobile popup loaded successfully');
        return true;
    } else {
        console.log('❌ Mobile popup not loaded');
        return false;
    }
};

// Test function to show popup with sample data
window.testMobilePopupShow = function() {
    if (!window.mobileUserPopup) {
        console.log('❌ Mobile popup not available');
        return;
    }
    
    console.log('🧪 Showing test mobile popup...');
    
    // Sample data for testing
    const testAddress = '0x1234567890123456789012345678901234567890';
    const testUser = {
        index: 123,
        binaryPoints: 1500000,
        binaryPointCap: 2000000,
        totalMonthlyRewarded: 500000,
        binaryPointsClaimed: 750000,
        refclimed: '1000000000000000000000', // 1 DAI in wei
        depositedAmount: '5000000000000000000000', // 5 DAI in wei
        leftPoints: 800000,
        rightPoints: 700000
    };
    
    // Show popup
    window.mobileUserPopup.show(testAddress, testUser);
    
    console.log('✅ Test popup should be visible now');
    console.log('💡 Try clicking on the cards to test expand/collapse functionality');
};

// Test function to show popup with real data
window.testMobilePopupWithRealData = function() {
    if (!window.mobileUserPopup) {
        console.log('❌ Mobile popup not available');
        return;
    }
    
    console.log('🧪 Showing mobile popup with real data...');
    
    // Use real data
    if (window.contractConfig && window.contractConfig.address) {
        const realAddress = window.contractConfig.address;
        console.log('🔍 Using real address:', realAddress);
        
        // Sample data for testing (you can use real data)
        const testUser = {
            index: 1,
            binaryPoints: 1000000,
            binaryPointCap: 2000000,
            totalMonthlyRewarded: 500000,
            binaryPointsClaimed: 750000,
            refclimed: '1000000000000000000000', // 1 DAI in wei
            depositedAmount: '5000000000000000000000', // 5 DAI in wei
            leftPoints: 800000,
            rightPoints: 700000
        };
        
        // Show popup
        window.mobileUserPopup.show(realAddress, testUser);
        
        console.log('✅ Real data popup should be visible now');
    } else {
        console.log('❌ No real address available');
    }
};

// Simple test function to show popup
window.testMobilePopupSimple = function() {
    if (!window.mobileUserPopup) {
        console.log('❌ Mobile popup not available');
        return;
    }
    
    console.log('🧪 Showing simple mobile popup...');
    
    // Simple data for testing
    const testAddress = '0xB6F844eFE62948647968196257B7DcD2323beF0C';
    const testUser = {
        index: 1,
        binaryPoints: 1000000,
        binaryPointCap: 2000000,
        totalMonthlyRewarded: 500000,
        binaryPointsClaimed: 750000,
        refclimed: '1000000000000000000000',
        depositedAmount: '5000000000000000000000',
        leftPoints: 800000,
        rightPoints: 700000
    };
    
    // Show popup
    window.mobileUserPopup.show(testAddress, testUser);
    
    console.log('✅ Simple popup should be visible now');
    console.log('💡 Check if popup is visible at bottom of screen');
};

// Test function to check balances
window.testMobilePopupBalances = function() {
    if (!window.mobileUserPopup) {
        console.log('❌ Mobile popup not available');
        return;
    }
    
    console.log('🧪 Testing balance fetching...');
    
    // Test with real user address
    if (window.contractConfig && window.contractConfig.address) {
        const realAddress = window.contractConfig.address;
        console.log('🔍 Testing with real address:', realAddress);
        window.mobileUserPopup.getLiveBalances(realAddress);
    } else {
        console.log('⚠️ No real address available, testing with sample address');
        const testAddress = '0xB6F844eFE62948647968196257B7DcD2323beF0C';
        window.mobileUserPopup.getLiveBalances(testAddress);
    }
};

// Direct test function to check balances
window.testBalancesDirectly = async function(address) {
    console.log('🧪 Testing balances directly for address:', address);
    
    if (!address) {
        console.log('❌ No address provided');
        return;
    }
    
    try {
        // Test connection
        if (typeof window.connectWallet === 'function') {
            console.log('🔄 Testing connectWallet...');
            const connection = await window.connectWallet();
            console.log('✅ connectWallet result:', connection);
            
            if (connection && connection.contract) {
                console.log('🔄 Testing IAM balance...');
                const iamBalance = await connection.contract.balanceOf(address);
                console.log('✅ IAM balance raw:', iamBalance);
                console.log('✅ IAM balance formatted:', ethers.formatEther(iamBalance));
            }
            
            if (connection && connection.provider) {
                console.log('🔄 Testing MATIC balance...');
                const maticBalance = await connection.provider.getBalance(address);
                console.log('✅ MATIC balance raw:', maticBalance);
                console.log('✅ MATIC balance formatted:', ethers.formatEther(maticBalance));
            }
        } else {
            console.log('❌ window.connectWallet not available');
        }
        
        // Test contractConfig
        if (window.contractConfig) {
            console.log('🔄 Testing contractConfig...');
            console.log('contractConfig:', window.contractConfig);
            
            if (window.contractConfig.contract) {
                console.log('🔄 Testing contract.balanceOf...');
                const iamBalance = await window.contractConfig.contract.balanceOf(address);
                console.log('✅ IAM balance via contractConfig:', ethers.formatEther(iamBalance));
            }
            
            if (window.contractConfig.provider) {
                console.log('🔄 Testing provider.getBalance...');
                const maticBalance = await window.contractConfig.provider.getBalance(address);
                console.log('✅ MATIC balance via contractConfig:', ethers.formatEther(maticBalance));
            }
        } else {
            console.log('❌ window.contractConfig not available');
        }
        
    } catch (error) {
        console.error('❌ Error in testBalancesDirectly:', error);
    }
};

// Auto test after page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.testMobilePopupLoad();
    }, 1000);
});

// Connection status check function
window.checkMobilePopupConnection = function() {
    console.log('🔍 Checking mobile popup connection status...');
    
    console.log('window.ethereum:', !!window.ethereum);
    console.log('window.contractConfig:', !!window.contractConfig);
    
    if (window.contractConfig) {
        console.log('contractConfig.contract:', !!window.contractConfig.contract);
        console.log('contractConfig.provider:', !!window.contractConfig.provider);
        console.log('contractConfig.address:', window.contractConfig.address);
    }
    
    if (window.ethereum) {
        console.log('ethereum.isMetaMask:', window.ethereum.isMetaMask);
        console.log('ethereum.chainId:', window.ethereum.chainId);
    }
    
    console.log('ethers version:', typeof ethers !== 'undefined' ? 'Available' : 'Not available');
    
    return {
        ethereum: !!window.ethereum,
        contractConfig: !!window.contractConfig,
        contract: !!(window.contractConfig && window.contractConfig.contract),
        provider: !!(window.contractConfig && window.contractConfig.provider),
        address: window.contractConfig ? window.contractConfig.address : null,
        ethers: typeof ethers !== 'undefined'
    };
};
