// Typewriter effect class
class TypewriterEffect {
    constructor(element, text, speed = 50) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.currentIndex = 0;
        this.isTyping = false;
    }

    async start() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        this.element.textContent = '';
        this.currentIndex = 0;
        
        while (this.currentIndex < this.text.length) {
            this.element.textContent += this.text[this.currentIndex];
            this.currentIndex++;
            await this.delay(this.speed);
        }
        
        this.isTyping = false;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stop() {
        this.isTyping = false;
        this.element.textContent = this.text;
    }
}

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

    async show(address, user) {
        console.log('🔄 MobileUserPopup.show called with:', { address, user });
        
        if (!user) {
            console.log('❌ No user data provided');
            return;
        }

        // Validate user data
        if (user.index === undefined || user.index === null) {
            console.log('❌ User index is undefined or null');
            return;
        }

        const IAMId = user.index !== undefined ? (window.generateIAMId ? window.generateIAMId(user.index) : user.index) : user.index;
        const walletAddress = address || '-';
        const isActive = (user && user.index && BigInt(user.index) > 0n) || false;
        
        console.log('📊 User info:', {
            IAMId,
            walletAddress,
            isActive,
            userIndex: user.index
        });
        
        const infoList = [
            {icon:'🎯', label:'Binary Points', val:user.binaryPoints},
            {icon:'🏆', label:'Binary Cap', val:user.binaryPointCap},
            {icon:'💎', label:'Binary Reward', val:user.totalMonthlyRewarded},
            {icon:'✅', label:'Claimed Points', val:user.binaryPointsClaimed},
            {icon:'🤝', label:'Referral Income', val:user.refclimed ? Math.floor(Number(user.refclimed) / 1e18) : 0},
            {icon:'💰', label:'Total Deposit', val:user.depositedAmount ? Math.floor(Number(user.depositedAmount) / 1e18) : 0},
            {icon:'⬅️', label:'Left Points', val:user.leftPoints},
            {icon:'➡️', label:'Right Points', val:user.rightPoints},
            {icon:'👥', label:'Left Wallets', val:'Loading...', id:'left-wallets-count'},
            {icon:'👥', label:'Right Wallets', val:'Loading...', id:'right-wallets-count'},
            {icon:'📊', label:'Total Wallets', val:'Loading...', id:'total-wallets-count'}
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
                                <span class="value" id="user-id-value" onclick="navigator.clipboard.writeText('${IAMId}')">Loading...</span>
                            </div>
                            <div class="user-status ${isActive ? 'active' : 'inactive'}" id="user-status">
                                Loading...
                            </div>
                        </div>
                        <div class="user-wallet" id="user-wallet" onclick="navigator.clipboard.writeText('${walletAddress}')">
                            Loading...
                        </div>
                    </div>

                    <div class="user-stats">
                        ${infoList.map((info, index) => `
                            <div class="stat-item collapsed" data-index="${index}">
                                <div class="stat-icon">${info.icon}</div>
                                <div class="stat-details">
                                    <div class="stat-label">${info.label}</div>
                                    <div class="stat-value" id="${info.id || `stat-value-${index}`}">${info.val}</div>
                                </div>
                                <div class="expand-indicator">▼</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div id="live-balances" class="live-balances collapsed">
                        <div class="balance-title">Live Balances</div>
                        <div class="balance-grid">
                            <div class="balance-item">
                                <div class="balance-left">
                                    <span class="balance-icon">🟢</span>
                                    <span class="balance-name">IAM</span>
                                </div>
                                <span class="balance-value" id="IAM-balance">-</span>
                            </div>
                            <div class="balance-item">
                                <div class="balance-left">
                                    <span class="balance-icon">🟣</span>
                                    <span class="balance-name">MATIC</span>
                                </div>
                                <span class="balance-value" id="matic-balance">-</span>
                            </div>
                            <div class="balance-item">
                                <div class="balance-left">
                                    <span class="balance-icon">💵</span>
                                    <span class="balance-name">DAI</span>
                                </div>
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

        // Start typewriter effects
        console.log('🔄 Starting typewriter effects...');
        await this.startTypewriterEffects(IAMId, isActive, walletAddress, infoList);
        console.log('✅ Typewriter effects completed');

        // Load wallet counts with DFS
        console.log('🔄 Loading wallet counts...');
        await this.loadWalletCounts(user.index);
        console.log('✅ Wallet counts loaded');

        // Get live balances
        console.log('🔄 Getting live balances...');
        this.getLiveBalances(walletAddress);
        
        // Also try comprehensive debug
        setTimeout(() => {
            console.log('🔄 Starting comprehensive debug...');
            this.debugAllBalances(walletAddress);
        }, 1000);
        
        // Setup initial card sizes based on content
        this.adjustCardSizes();
        
        // Add event listeners for cards
        this.setupCardEventListeners();
    }

    async startTypewriterEffects(IAMId, isActive, walletAddress, infoList) {
        console.log('⌨️ Starting typewriter effects...');
        console.log('📊 Input data:', { IAMId, isActive, walletAddress, infoListLength: infoList.length });
        
        try {
            // User ID typewriter
            const userIdElement = document.getElementById('user-id-value');
            if (userIdElement) {
                console.log('🔄 Typing User ID:', IAMId);
                const userIdTypewriter = new TypewriterEffect(userIdElement, IAMId, 30);
                await userIdTypewriter.start();
                console.log('✅ User ID typed');
            } else {
                console.log('❌ User ID element not found');
            }
            
            // Wait a bit before next effect
            await this.delay(200);
            
            // User status typewriter
            const statusElement = document.getElementById('user-status');
            if (statusElement) {
                const statusText = isActive ? '✅ Active' : '❌ Inactive';
                console.log('🔄 Typing Status:', statusText);
                const statusTypewriter = new TypewriterEffect(statusElement, statusText, 50);
                await statusTypewriter.start();
                console.log('✅ Status typed');
            } else {
                console.log('❌ Status element not found');
            }
            
            // Wait a bit before next effect
            await this.delay(200);
            
            // Wallet address typewriter
            const walletElement = document.getElementById('user-wallet');
            if (walletElement) {
                const walletText = this.shortAddress(walletAddress);
                console.log('🔄 Typing Wallet:', walletText);
                const walletTypewriter = new TypewriterEffect(walletElement, walletText, 40);
                await walletTypewriter.start();
                console.log('✅ Wallet typed');
            } else {
                console.log('❌ Wallet element not found');
            }
        
            // Wait a bit before stats
            await this.delay(300);
            
            // Stats typewriter effects (sequential)
            console.log('🔄 Typing stats:', infoList.length);
            for (let i = 0; i < infoList.length; i++) {
                const info = infoList[i];
                const statElement = document.getElementById(info.id || `stat-value-${i}`);
                if (statElement) {
                    const statText = this.formatValue(info.val);
                    console.log(`🔄 Typing ${info.label}:`, statText);
                    const statTypewriter = new TypewriterEffect(statElement, statText, 60);
                    await statTypewriter.start();
                    console.log(`✅ ${info.label} typed`);
                    
                    // Small delay between stats
                    await this.delay(100);
                } else {
                    console.log(`❌ Stat element not found for ${info.label}`);
                }
            }
            
            console.log('✅ All typewriter effects completed');
        } catch (error) {
            console.error('❌ Error in typewriter effects:', error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Load wallet counts with DFS
    async loadWalletCounts(userIndex) {
        console.log(`📊 Loading wallet counts for user ${userIndex}...`);
        
        try {
            // Show loading state
            const leftElement = document.getElementById('left-wallets-count');
            const rightElement = document.getElementById('right-wallets-count');
            const totalElement = document.getElementById('total-wallets-count');
            
            if (leftElement) leftElement.textContent = 'Loading...';
            if (rightElement) rightElement.textContent = 'Loading...';
            if (totalElement) totalElement.textContent = 'Loading...';
            
            // Count wallets with DFS
            const counts = await this.countWalletsInSubtrees(userIndex);
            
            console.log('📊 Wallet counts result:', counts);
            
            // Update with typewriter effect
            if (leftElement && counts.leftCount !== undefined) {
                const leftTypewriter = new TypewriterEffect(leftElement, counts.leftCount.toString(), 30);
                await leftTypewriter.start();
            } else if (leftElement) {
                leftElement.textContent = '0';
            }
            
            await this.delay(200);
            
            if (rightElement && counts.rightCount !== undefined) {
                const rightTypewriter = new TypewriterEffect(rightElement, counts.rightCount.toString(), 30);
                await rightTypewriter.start();
            } else if (rightElement) {
                rightElement.textContent = '0';
            }
            
            await this.delay(200);
            
            if (totalElement && counts.totalCount !== undefined) {
                const totalTypewriter = new TypewriterEffect(totalElement, counts.totalCount.toString(), 30);
                await totalTypewriter.start();
            } else if (totalElement) {
                totalElement.textContent = '1';
            }
            
            console.log('✅ Wallet counts loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading wallet counts:', error);
            
            // Show error state
            const leftElement = document.getElementById('left-wallets-count');
            const rightElement = document.getElementById('right-wallets-count');
            const totalElement = document.getElementById('total-wallets-count');
            
            if (leftElement) leftElement.textContent = 'Error';
            if (rightElement) rightElement.textContent = 'Error';
            if (totalElement) totalElement.textContent = 'Error';
        }
    }

    // Search function with 10 billion depth limit
    async searchUserByIndex(index, maxDepth = Infinity) {
        console.log(`🔍 Searching user by index: ${index} with depth limit: ${maxDepth}`);
        
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.log('❌ Contract not connected');
            return null;
        }
        
        try {
            const contract = window.contractConfig.contract;
            
            // Get address by index
            const address = await contract.indexToAddress(BigInt(index));
            
            if (!address || address === '0x0000000000000000000000000000000000000000') {
                console.log('❌ No address found for index:', index);
                return null;
            }
            
            // Get user data
            const user = await contract.users(address);
            
            console.log('✅ User found:', { index, address, user });
            
            return {
                index: index,
                address: address,
                user: user
            };
            
        } catch (error) {
            console.error('❌ Error searching user by index:', error);
            return null;
        }
    }

    // Search function with depth limit for tree traversal (BFS)
    async searchUserInTree(startIndex = 1, targetIndex, maxDepth = Infinity) {
        console.log(`🌳 Searching user ${targetIndex} in tree starting from ${startIndex} with depth limit: ${maxDepth}`);
        
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.log('❌ Contract not connected');
            return null;
        }
        
        try {
            const contract = window.contractConfig.contract;
            const visited = new Set();
            const queue = [{ index: startIndex, depth: 0 }];
            
            while (queue.length > 0) {
                const current = queue.shift();
                
                // Check depth limit
                if (current.depth > maxDepth) {
                    console.log(`⚠️ Reached depth limit: ${maxDepth}`);
                    break;
                }
                
                // Skip if already visited
                if (visited.has(current.index)) {
                    continue;
                }
                
                visited.add(current.index);
                
                // Check if this is the target
                if (current.index === targetIndex) {
                    console.log(`✅ Found target user at depth: ${current.depth}`);
                    
                    // Get user data
                    const address = await contract.indexToAddress(BigInt(current.index));
                    const user = await contract.users(address);
                    
                    return {
                        index: current.index,
                        address: address,
                        user: user,
                        depth: current.depth
                    };
                }
                
                // Get children if within depth limit
                if (current.depth < maxDepth) {
                    try {
                        const address = await contract.indexToAddress(BigInt(current.index));
                        const tree = await contract.getUserTree(address);
                        
                        if (tree && tree.left && tree.left !== '0x0000000000000000000000000000000000000000') {
                            const leftIndex = await contract.getIndexByAddress(tree.left);
                            queue.push({ index: Number(leftIndex), depth: current.depth + 1 });
                        }
                        
                        if (tree && tree.right && tree.right !== '0x0000000000000000000000000000000000000000') {
                            const rightIndex = await contract.getIndexByAddress(tree.right);
                            queue.push({ index: Number(rightIndex), depth: current.depth + 1 });
                        }
                        
                    } catch (error) {
                        console.warn(`⚠️ Error getting children for index ${current.index}:`, error);
                    }
                }
            }
            
            console.log('❌ User not found in tree within depth limit');
            return null;
            
        } catch (error) {
            console.error('❌ Error searching user in tree:', error);
            return null;
        }
    }

    // Advanced DFS search with 10 billion depth limit
    async searchUserWithDFS(startIndex = 1, targetIndex, maxDepth = Infinity) {
        console.log(`🔍 Advanced DFS search for user ${targetIndex} starting from ${startIndex} with depth limit: ${maxDepth}`);
        
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.log('❌ Contract not connected');
            return null;
        }
        
        try {
            const contract = window.contractConfig.contract;
            const visited = new Set();
            
            // DFS recursive function
            const dfsRecursive = async (currentIndex, depth) => {
                // Check depth limit
                if (depth > maxDepth) {
                    console.log(`⚠️ Reached depth limit: ${maxDepth}`);
                    return null;
                }
                
                // Skip if already visited
                if (visited.has(currentIndex)) {
                    return null;
                }
                
                visited.add(currentIndex);
                
                // Check if this is the target
                if (currentIndex === targetIndex) {
                    console.log(`✅ Found target user at depth: ${depth}`);
                    
                    // Get user data
                    const address = await contract.indexToAddress(BigInt(currentIndex));
                    const user = await contract.users(address);
                    
                    return {
                        index: currentIndex,
                        address: address,
                        user: user,
                        depth: depth
                    };
                }
                
                // Get children if within depth limit
                if (depth < maxDepth) {
                    try {
                        const address = await contract.indexToAddress(BigInt(currentIndex));
                        const tree = await contract.getUserTree(address);
                        
                        // Search left child first (DFS)
                        if (tree && tree.left && tree.left !== '0x0000000000000000000000000000000000000000') {
                            const leftIndex = await contract.getIndexByAddress(tree.left);
                            const leftResult = await dfsRecursive(Number(leftIndex), depth + 1);
                            if (leftResult) return leftResult;
                        }
                        
                        // Search right child
                        if (tree && tree.right && tree.right !== '0x0000000000000000000000000000000000000000') {
                            const rightIndex = await contract.getIndexByAddress(tree.right);
                            const rightResult = await dfsRecursive(Number(rightIndex), depth + 1);
                            if (rightResult) return rightResult;
                        }
                        
                    } catch (error) {
                        console.warn(`⚠️ Error getting children for index ${currentIndex}:`, error);
                    }
                }
                
                return null;
            };
            
            // Start DFS search
            const result = await dfsRecursive(startIndex, 0);
            
            if (result) {
                console.log('✅ DFS search completed successfully');
                return result;
            } else {
                console.log('❌ User not found in DFS search within depth limit');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Error in DFS search:', error);
            return null;
        }
    }

    // Count wallets in left and right subtrees with DFS
    async countWalletsInSubtrees(userIndex, maxDepth = Infinity) {
        console.log(`📊 Counting wallets in subtrees for user ${userIndex} with depth limit: ${maxDepth}`);
        
        if (!window.contractConfig || !window.contractConfig.contract) {
            console.log('❌ Contract not connected');
            return { leftCount: 0, rightCount: 0, totalCount: 1 };
        }
        
        try {
            const contract = window.contractConfig.contract;
            
            // Get user's tree structure first
            const userAddress = await contract.indexToAddress(BigInt(userIndex));
            console.log(`🔍 User address: ${userAddress}`);
            
            const userTree = await contract.getUserTree(userAddress);
            console.log(`🌳 User tree:`, userTree);
            
            let leftCount = 0;
            let rightCount = 0;
            
            // Count left subtree
            if (userTree && userTree.left && userTree.left !== '0x0000000000000000000000000000000000000000') {
                console.log(`⬅️ Counting left subtree from: ${userTree.left}`);
                leftCount = await this.countSubtreeWallets(userTree.left, contract, maxDepth);
                console.log(`✅ Left count: ${leftCount}`);
            } else {
                console.log(`❌ No left child found`);
            }
            
            // Count right subtree
            if (userTree && userTree.right && userTree.right !== '0x0000000000000000000000000000000000000000') {
                console.log(`➡️ Counting right subtree from: ${userTree.right}`);
                rightCount = await this.countSubtreeWallets(userTree.right, contract, maxDepth);
                console.log(`✅ Right count: ${rightCount}`);
            } else {
                console.log(`❌ No right child found`);
            }
            
            const totalCount = leftCount + rightCount + 1; // +1 for the user itself
            
            console.log(`✅ Final wallet counts - Left: ${leftCount}, Right: ${rightCount}, Total: ${totalCount}`);
            
            return {
                leftCount: leftCount,
                rightCount: rightCount,
                totalCount: totalCount
            };
            
        } catch (error) {
            console.error('❌ Error counting wallets in subtrees:', error);
            return { leftCount: 0, rightCount: 0, totalCount: 1 };
        }
    }

    // Helper function to count wallets in a subtree
    async countSubtreeWallets(rootAddress, contract, maxDepth) {
        const visited = new Set();
        let count = 0;
        
        // DFS function to count wallets
        const countWalletsDFS = async (address, depth) => {
            // Check depth limit
            if (depth > maxDepth) {
                return 0;
            }
            
            // Skip if already visited
            if (visited.has(address)) {
                return 0;
            }
            
            visited.add(address);
            let localCount = 1; // Count current user
            
            try {
                const tree = await contract.getUserTree(address);
                
                // Count left subtree
                if (tree && tree.left && tree.left !== '0x0000000000000000000000000000000000000000') {
                    localCount += await countWalletsDFS(tree.left, depth + 1);
                }
                
                // Count right subtree
                if (tree && tree.right && tree.right !== '0x0000000000000000000000000000000000000000') {
                    localCount += await countWalletsDFS(tree.right, depth + 1);
                }
                
            } catch (error) {
                console.warn(`⚠️ Error counting wallets for address ${address}:`, error);
            }
            
            return localCount;
        };
        
        try {
            count = await countWalletsDFS(rootAddress, 0);
            console.log(`📊 Subtree count for ${rootAddress}: ${count}`);
        } catch (error) {
            console.error(`❌ Error counting subtree for ${rootAddress}:`, error);
            count = 0;
        }
        
        return count;
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
        
        // Get DOM elements
        const iamElement = document.getElementById('IAM-balance');
        const maticElement = document.getElementById('matic-balance');
        const daiElement = document.getElementById('dai-balance');
        
        console.log('🔍 DOM elements found:', {
            iam: !!iamElement,
            matic: !!maticElement,
            dai: !!daiElement
        });

        // Simple approach: try to get balances using available methods
        try {
            // Try to get provider and contract
            let provider, contract;
            
            // Method 1: Try connectWallet
            if (typeof window.connectWallet === 'function') {
                try {
                    console.log('🔄 Trying connectWallet...');
                    const connection = await window.connectWallet();
                    if (connection) {
                        provider = connection.provider;
                        contract = connection.contract;
                        console.log('✅ Got provider and contract from connectWallet');
                    }
                } catch (error) {
                    console.log('❌ connectWallet failed:', error.message);
                }
            }
            
            // Method 2: Try contractConfig
            if (!provider && window.contractConfig) {
                try {
                    console.log('🔄 Trying contractConfig...');
                    provider = window.contractConfig.provider;
                    contract = window.contractConfig.contract;
                    console.log('✅ Got provider and contract from contractConfig');
                } catch (error) {
                    console.log('❌ contractConfig failed:', error.message);
                }
            }
            
            // Method 3: Try ethereum
            if (!provider && window.ethereum) {
                try {
                    console.log('🔄 Trying ethereum...');
                    provider = new ethers.BrowserProvider(window.ethereum);
                    console.log('✅ Got provider from ethereum');
                } catch (error) {
                    console.log('❌ ethereum failed:', error.message);
                }
            }
            
            // Now try to get balances
            if (provider) {
                // Get MATIC balance
                try {
                    console.log('🔄 Getting MATIC balance...');
                    const maticBalance = await provider.getBalance(address);
                    const formattedMATIC = ethers.formatEther(maticBalance);
                    console.log('✅ MATIC balance:', formattedMATIC);
                    
                    if (maticElement) {
                        maticElement.textContent = this.formatValue(formattedMATIC);
                    }
                } catch (error) {
                    console.log('❌ MATIC balance error:', error.message);
                    if (maticElement) maticElement.textContent = '❌';
                }
                
                // Get DAI balance
                if (window.DAI_ADDRESS && window.DAI_ABI) {
                    try {
                        console.log('🔄 Getting DAI balance...');
                        const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, provider);
                        const daiBalance = await daiContract.balanceOf(address);
                        const formattedDAI = ethers.formatEther(daiBalance);
                        console.log('✅ DAI balance:', formattedDAI);
                        
                        if (daiElement) {
                            daiElement.textContent = this.formatValue(formattedDAI);
                        }
                    } catch (error) {
                        console.log('❌ DAI balance error:', error.message);
                        if (daiElement) daiElement.textContent = '❌';
                    }
                }
            }
            
            if (contract && typeof contract.balanceOf === 'function') {
                // Get IAM balance
                try {
                    console.log('🔄 Getting IAM balance...');
                    const iamBalance = await contract.balanceOf(address);
                    const formattedIAM = ethers.formatEther(iamBalance);
                    console.log('✅ IAM balance:', formattedIAM);
                    
                    if (iamElement) {
                        iamElement.textContent = this.formatValue(formattedIAM);
                    }
                } catch (error) {
                    console.log('❌ IAM balance error:', error.message);
                    if (iamElement) iamElement.textContent = '❌';
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

    // Test function for live balances
    async testLiveBalances() {
        console.log('🧪 Testing live balances...');
        
        // Check if DAI_ADDRESS and DAI_ABI are available
        console.log('🔍 DAI Configuration:', {
            DAI_ADDRESS: window.DAI_ADDRESS,
            DAI_ABI: window.DAI_ABI,
            hasEthers: typeof ethers !== 'undefined',
            hasEthereum: !!window.ethereum,
            hasContractConfig: !!window.contractConfig
        });
        
        // Test with a sample address
        const testAddress = '0x1234567890123456789012345678901234567890';
        console.log('🔄 Testing with address:', testAddress);
        
        try {
            // Test DAI balance fetching
            if (window.DAI_ADDRESS && window.DAI_ABI && window.ethereum) {
                console.log('🔄 Testing DAI balance fetching...');
                const provider = new ethers.BrowserProvider(window.ethereum);
                const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, provider);
                
                try {
                    const daiBalance = await daiContract.balanceOf(testAddress);
                    console.log('✅ DAI balance fetched successfully:', daiBalance.toString());
                } catch (error) {
                    console.warn('❌ Error fetching DAI balance:', error);
                }
            } else {
                console.warn('❌ DAI configuration not available');
            }
        } catch (error) {
            console.error('❌ Error in testLiveBalances:', error);
        }
    }

    // Direct test function for MATIC and IAM balance
    async testMATICAndIAMBalance(address) {
        console.log('🧪 Testing MATIC and IAM balance directly for address:', address);
        
        if (!address || address === '-') {
            console.log('❌ No valid address provided');
            return;
        }

        try {
            // Check configuration
            console.log('🔍 Configuration:', {
                hasEthers: typeof ethers !== 'undefined',
                hasEthereum: !!window.ethereum,
                hasContractConfig: !!window.contractConfig,
                hasConnectWallet: typeof window.connectWallet === 'function'
            });

            // Try different methods
            const methods = [
                { name: 'connectWallet', fn: () => window.connectWallet() },
                { name: 'contractConfig', fn: () => window.contractConfig },
                { name: 'ethereum', fn: () => new ethers.BrowserProvider(window.ethereum) }
            ];

            for (const method of methods) {
                try {
                    console.log(`🔄 Trying ${method.name} method...`);
                    const connection = await method.fn();
                    
                    if (connection) {
                        let contract, provider;
                        
                        if (method.name === 'connectWallet') {
                            ({ contract, provider } = connection);
                        } else if (method.name === 'contractConfig') {
                            contract = connection.contract;
                            provider = connection.provider;
                        } else {
                            provider = connection;
                        }
                        
                        // Get IAM balance
                        if (contract && typeof contract.balanceOf === 'function') {
                            try {
                                console.log(`🔄 Fetching IAM balance via ${method.name}...`);
                                const iamBalance = await contract.balanceOf(address);
                                const formattedBalance = typeof ethers !== 'undefined' ? 
                                    ethers.formatEther(iamBalance) : 
                                    (Number(iamBalance) / 1e18).toString();
                                
                                console.log(`✅ IAM balance via ${method.name}:`, formattedBalance);
                                
                                // Update UI
                                const iamElement = document.getElementById('IAM-balance');
                                if (iamElement) {
                                    iamElement.textContent = this.formatValue(formattedBalance);
                                }
                            } catch (error) {
                                console.warn(`❌ Error fetching IAM balance via ${method.name}:`, error);
                            }
                        }
                        
                        // Get MATIC balance
                        if (provider) {
                            try {
                                console.log(`🔄 Fetching MATIC balance via ${method.name}...`);
                                const maticBalance = await provider.getBalance(address);
                                const formattedBalance = typeof ethers !== 'undefined' ? 
                                    ethers.formatEther(maticBalance) : 
                                    (Number(maticBalance) / 1e18).toString();
                                
                                console.log(`✅ MATIC balance via ${method.name}:`, formattedBalance);
                                
                                // Update UI
                                const maticElement = document.getElementById('matic-balance');
                                if (maticElement) {
                                    maticElement.textContent = this.formatValue(formattedBalance);
                                }
                            } catch (error) {
                                console.warn(`❌ Error fetching MATIC balance via ${method.name}:`, error);
                            }
                        }
                        
                        return; // Success, exit
                    }
                } catch (error) {
                    console.warn(`❌ Error with ${method.name} method:`, error);
                }
            }
            
            console.warn('❌ All methods failed');
            
        } catch (error) {
            console.error('❌ Error in testMATICAndIAMBalance:', error);
        }
    }

    // Direct test function for DAI balance
    async testDAIBalance(address) {
        console.log('🧪 Testing DAI balance directly for address:', address);
        
        if (!address || address === '-') {
            console.log('❌ No valid address provided');
            return;
        }

        try {
            // Check DAI configuration
            console.log('🔍 DAI Configuration:', {
                DAI_ADDRESS: window.DAI_ADDRESS,
                DAI_ABI: window.DAI_ABI,
                hasEthers: typeof ethers !== 'undefined',
                hasEthereum: !!window.ethereum
            });

            if (!window.DAI_ADDRESS || !window.DAI_ABI) {
                console.warn('❌ DAI configuration not available');
                return;
            }

            // Try different methods
            const methods = [
                { name: 'connectWallet', fn: () => window.connectWallet() },
                { name: 'contractConfig', fn: () => window.contractConfig?.provider },
                { name: 'ethereum', fn: () => new ethers.BrowserProvider(window.ethereum) }
            ];

            for (const method of methods) {
                try {
                    console.log(`🔄 Trying ${method.name} method...`);
                    const provider = await method.fn();
                    
                    if (provider) {
                        const DAI_ABI = window.DAI_ABI || [
                            "function balanceOf(address owner) view returns (uint256)",
                            "function decimals() view returns (uint8)",
                            "function symbol() view returns (string)"
                        ];
                        
                        const daiContract = new ethers.Contract(window.DAI_ADDRESS, DAI_ABI, provider);
                        const daiBalance = await daiContract.balanceOf(address);
                        
                        const formattedBalance = typeof ethers !== 'undefined' ? 
                            ethers.formatEther(daiBalance) : 
                            (Number(daiBalance) / 1e18).toString();
                        
                        console.log(`✅ DAI balance via ${method.name}:`, formattedBalance);
                        
                        // Update UI
                        const daiElement = document.getElementById('dai-balance');
                        if (daiElement) {
                            daiElement.textContent = this.formatValue(formattedBalance);
                        }
                        
                        return; // Success, exit
                    }
                } catch (error) {
                    console.warn(`❌ Error with ${method.name} method:`, error);
                }
            }
            
            console.warn('❌ All methods failed');
            
        } catch (error) {
            console.error('❌ Error in testDAIBalance:', error);
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

// Test function for search with 10 billion depth limit
window.testMobilePopupSearch = async function(index = 1) {
    if (!window.mobileUserPopup) {
        console.log('❌ Mobile popup not available');
        return;
    }
    
    console.log(`🧪 Testing search with 10 billion depth limit for index: ${index}`);
    
    try {
        // Test direct index search
        const result = await window.mobileUserPopup.searchUserByIndex(index);
        
        if (result) {
            console.log('✅ Search result:', result);
            
            // Show popup with search result
            await window.mobileUserPopup.show(result.address, result.user);
            
            console.log('✅ Popup shown with search result');
        } else {
            console.log('❌ No user found for index:', index);
        }
        
    } catch (error) {
        console.error('❌ Error in search test:', error);
    }
};

// Test function for tree search with depth limit
window.testMobilePopupTreeSearch = async function(startIndex = 1, targetIndex = 5) {
    if (!window.mobileUserPopup) {
        console.log('❌ Mobile popup not available');
        return;
    }
    
    console.log(`🧪 Testing tree search with 10 billion depth limit from ${startIndex} to ${targetIndex}`);
    
    try {
        const result = await window.mobileUserPopup.searchUserInTree(startIndex, targetIndex);
        
        if (result) {
            console.log('✅ Tree search result:', result);
            
            // Show popup with search result
            await window.mobileUserPopup.show(result.address, result.user);
            
            console.log('✅ Popup shown with tree search result');
        } else {
            console.log('❌ User not found in tree search');
        }
        
    } catch (error) {
        console.error('❌ Error in tree search test:', error);
    }
};

// Test function for advanced DFS search
window.testMobilePopupDFSSearch = async function(startIndex = 1, targetIndex = 5) {
    if (!window.mobileUserPopup) {
        console.log('❌ Mobile popup not available');
        return;
    }
    
    console.log(`🧪 Testing advanced DFS search with 10 billion depth limit from ${startIndex} to ${targetIndex}`);
    
    try {
        const result = await window.mobileUserPopup.searchUserWithDFS(startIndex, targetIndex);
        
        if (result) {
            console.log('✅ DFS search result:', result);
            
            // Show popup with search result
            await window.mobileUserPopup.show(result.address, result.user);
            
            console.log('✅ Popup shown with DFS search result');
        } else {
            console.log('❌ User not found in DFS search');
        }
        
    } catch (error) {
        console.error('❌ Error in DFS search test:', error);
    }
};

// Test function for wallet counting
window.testMobilePopupWalletCount = async function(userIndex = 1) {
    if (!window.mobileUserPopup) {
        console.log('❌ Mobile popup not available');
        return;
    }
    
    console.log(`🧪 Testing wallet counting with DFS for user ${userIndex}`);
    
    try {
        const counts = await window.mobileUserPopup.countWalletsInSubtrees(userIndex);
        
        console.log('✅ Wallet counts:', counts);
        
        // Show popup with wallet counts
        const address = await window.contractConfig.contract.indexToAddress(BigInt(userIndex));
        const user = await window.contractConfig.contract.users(address);
        
        await window.mobileUserPopup.show(address, user);
        
        console.log('✅ Popup shown with wallet counts');
        
    } catch (error) {
        console.error('❌ Error in wallet count test:', error);
    }
};

// Simple test function to debug wallet counting
window.testWalletCountSimple = async function(userIndex = 1) {
    console.log(`🧪 Simple wallet count test for user ${userIndex}`);
    
    if (!window.contractConfig || !window.contractConfig.contract) {
        console.log('❌ Contract not connected');
        return;
    }
    
    try {
        const contract = window.contractConfig.contract;
        
        // Get user address
        const userAddress = await contract.indexToAddress(BigInt(userIndex));
        console.log(`🔍 User address: ${userAddress}`);
        
        // Get user tree
        const userTree = await contract.getUserTree(userAddress);
        console.log(`🌳 User tree:`, userTree);
        
        // Check if user has children
        if (userTree && userTree.left && userTree.left !== '0x0000000000000000000000000000000000000000') {
            console.log(`⬅️ Left child: ${userTree.left}`);
        } else {
            console.log(`❌ No left child`);
        }
        
        if (userTree && userTree.right && userTree.right !== '0x0000000000000000000000000000000000000000') {
            console.log(`➡️ Right child: ${userTree.right}`);
        } else {
            console.log(`❌ No right child`);
        }
        
        // Test wallet counting
        if (window.mobileUserPopup) {
            const counts = await window.mobileUserPopup.countWalletsInSubtrees(userIndex);
            console.log('✅ Final counts:', counts);
        }
        
    } catch (error) {
        console.error('❌ Error in simple test:', error);
    }
};

// Test function for infinite tree traversal
window.testInfiniteTreeTraversal = async function(method = 'bfs', startIndex = 1) {
    console.log(`🧪 Testing infinite tree traversal with ${method.toUpperCase()} from index ${startIndex}`);
    
    try {
        const startTime = Date.now();
        
        // Test infinite traversal
        const users = await window.traverseAllUsers(method, startIndex, Infinity);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ Infinite ${method.toUpperCase()} traversal completed!`);
        console.log(`📊 Found ${users.length} users in ${duration}ms`);
        console.log(`⚡ Average: ${(users.length / (duration / 1000)).toFixed(2)} users/second`);
        
        // Show first few users
        console.log('👥 First 5 users:', users.slice(0, 5));
        
        // Show depth distribution
        const depthStats = {};
        users.forEach(user => {
            depthStats[user.depth] = (depthStats[user.depth] || 0) + 1;
        });
        console.log('📈 Depth distribution:', depthStats);
        
        return users;
        
    } catch (error) {
        console.error('❌ Error in infinite tree traversal test:', error);
        return null;
    }
};

// Test function for mobile-optimized infinite tree
window.testMobileInfiniteTree = async function() {
    console.log('🧪 Testing mobile-optimized infinite tree...');
    
    try {
        // Test different traversal methods
        const methods = ['bfs', 'dfs', 'unlimited'];
        const results = {};
        
        for (const method of methods) {
            console.log(`🔄 Testing ${method.toUpperCase()}...`);
            const startTime = Date.now();
            
            const users = await window.traverseAllUsers(method, 1, Infinity);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            results[method] = {
                count: users.length,
                duration: duration,
                speed: users.length / (duration / 1000)
            };
            
            console.log(`✅ ${method.toUpperCase()}: ${users.length} users in ${duration}ms`);
        }
        
        console.log('📊 Performance comparison:', results);
        
        // Find best method
        const bestMethod = Object.keys(results).reduce((a, b) => 
            results[a].speed > results[b].speed ? a : b
        );
        
        console.log(`🏆 Best method: ${bestMethod.toUpperCase()} (${results[bestMethod].speed.toFixed(2)} users/sec)`);
        
        return results;
        
    } catch (error) {
        console.error('❌ Error in mobile infinite tree test:', error);
        return null;
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

// Test function for DAI balance
window.testDAIBalance = async function(address) {
    if (!window.mobileUserPopup) {
        console.log('❌ Mobile popup not available');
        return;
    }
    
    console.log(`🧪 Testing DAI balance for address: ${address}`);
    
    try {
        await window.mobileUserPopup.testDAIBalance(address);
    } catch (error) {
        console.error('❌ Error in DAI balance test:', error);
    }
};

// Test function for live balances
window.testLiveBalances = async function() {
    if (!window.mobileUserPopup) {
        console.log('❌ Mobile popup not available');
        return;
    }
    
    console.log('🧪 Testing live balances...');
    
    try {
        await window.mobileUserPopup.testLiveBalances();
    } catch (error) {
        console.error('❌ Error in live balances test:', error);
    }
};

// Test function for MATIC and IAM balance
window.testMATICAndIAMBalance = async function(address) {
    if (!window.mobileUserPopup) {
        console.log('❌ Mobile popup not available');
        return;
    }
    
    console.log(`🧪 Testing MATIC and IAM balance for address: ${address}`);
    
    try {
        await window.mobileUserPopup.testMATICAndIAMBalance(address);
    } catch (error) {
        console.error('❌ Error in MATIC and IAM balance test:', error);
    }
};

// Test function for all balances
window.testAllBalances = async function(address) {
    if (!window.mobileUserPopup) {
        console.log('❌ Mobile popup not available');
        return;
    }
    
    console.log(`🧪 Testing all balances for address: ${address}`);
    
    try {
        // Test MATIC and IAM
        await window.mobileUserPopup.testMATICAndIAMBalance(address);
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test DAI
        await window.mobileUserPopup.testDAIBalance(address);
        
        console.log('✅ All balance tests completed');
    } catch (error) {
        console.error('❌ Error in all balances test:', error);
    }
};

// Comprehensive debug function
window.debugAllBalances = async function(address) {
    if (!window.mobileUserPopup) {
        console.log('❌ Mobile popup not available');
        return;
    }
    
    console.log('🔍 === COMPREHENSIVE BALANCE DEBUG ===');
    console.log('📍 Address:', address);
    
    if (!address || address === '-') {
        console.log('❌ No valid address provided');
        return;
    }

    // Check all dependencies
    console.log('🔍 Dependencies Check:');
    console.log('  - window.ethereum:', !!window.ethereum);
    console.log('  - ethers:', typeof ethers !== 'undefined');
    console.log('  - window.contractConfig:', !!window.contractConfig);
    console.log('  - window.connectWallet:', typeof window.connectWallet === 'function');
    console.log('  - window.DAI_ADDRESS:', window.DAI_ADDRESS);
    console.log('  - window.DAI_ABI:', !!window.DAI_ABI);

    if (window.contractConfig) {
        console.log('  - contractConfig.contract:', !!window.contractConfig.contract);
        console.log('  - contractConfig.provider:', !!window.contractConfig.provider);
        console.log('  - contractConfig.address:', window.contractConfig.address);
    }

    // Check DOM elements
    console.log('🔍 DOM Elements Check:');
    const iamElement = document.getElementById('IAM-balance');
    const maticElement = document.getElementById('matic-balance');
    const daiElement = document.getElementById('dai-balance');
    console.log('  - IAM-balance element:', !!iamElement);
    console.log('  - matic-balance element:', !!maticElement);
    console.log('  - dai-balance element:', !!daiElement);

    if (iamElement) console.log('  - IAM current value:', iamElement.textContent);
    if (maticElement) console.log('  - MATIC current value:', maticElement.textContent);
    if (daiElement) console.log('  - DAI current value:', daiElement.textContent);

    // Test each method step by step
    console.log('🔍 Testing Methods:');

    // Method 1: connectWallet
    if (typeof window.connectWallet === 'function') {
        try {
            console.log('🔄 Method 1: connectWallet');
            const connection = await window.connectWallet();
            console.log('  - Connection result:', !!connection);
            
            if (connection) {
                const { contract, provider } = connection;
                console.log('  - Contract:', !!contract);
                console.log('  - Provider:', !!provider);
                
                if (contract && typeof contract.balanceOf === 'function') {
                    try {
                        console.log('  - Testing IAM balance...');
                        const iamBalance = await contract.balanceOf(address);
                        console.log('  - IAM balance raw:', iamBalance.toString());
                        const formattedIAM = ethers.formatEther(iamBalance);
                        console.log('  - IAM balance formatted:', formattedIAM);
                        
                        if (iamElement) {
                            iamElement.textContent = window.mobileUserPopup.formatValue(formattedIAM);
                            console.log('  - ✅ IAM balance updated in UI');
                        }
                    } catch (error) {
                        console.log('  - ❌ IAM balance error:', error.message);
                    }
                }
                
                if (provider) {
                    try {
                        console.log('  - Testing MATIC balance...');
                        const maticBalance = await provider.getBalance(address);
                        console.log('  - MATIC balance raw:', maticBalance.toString());
                        const formattedMATIC = ethers.formatEther(maticBalance);
                        console.log('  - MATIC balance formatted:', formattedMATIC);
                        
                        if (maticElement) {
                            maticElement.textContent = window.mobileUserPopup.formatValue(formattedMATIC);
                            console.log('  - ✅ MATIC balance updated in UI');
                        }
                    } catch (error) {
                        console.log('  - ❌ MATIC balance error:', error.message);
                    }
                }
            }
        } catch (error) {
            console.log('  - ❌ connectWallet error:', error.message);
        }
    }

    // Method 2: contractConfig
    if (window.contractConfig && window.contractConfig.contract) {
        try {
            console.log('🔄 Method 2: contractConfig');
            const { contract, provider } = window.contractConfig;
            
            if (contract && typeof contract.balanceOf === 'function') {
                try {
                    console.log('  - Testing IAM balance via contractConfig...');
                    const iamBalance = await contract.balanceOf(address);
                    const formattedIAM = ethers.formatEther(iamBalance);
                    console.log('  - IAM balance via contractConfig:', formattedIAM);
                    
                    if (iamElement && iamElement.textContent === '-') {
                        iamElement.textContent = window.mobileUserPopup.formatValue(formattedIAM);
                        console.log('  - ✅ IAM balance updated via contractConfig');
                    }
                } catch (error) {
                    console.log('  - ❌ IAM balance via contractConfig error:', error.message);
                }
            }
            
            if (provider) {
                try {
                    console.log('  - Testing MATIC balance via contractConfig...');
                    const maticBalance = await provider.getBalance(address);
                    const formattedMATIC = ethers.formatEther(maticBalance);
                    console.log('  - MATIC balance via contractConfig:', formattedMATIC);
                    
                    if (maticElement && maticElement.textContent === '-') {
                        maticElement.textContent = window.mobileUserPopup.formatValue(formattedMATIC);
                        console.log('  - ✅ MATIC balance updated via contractConfig');
                    }
                } catch (error) {
                    console.log('  - ❌ MATIC balance via contractConfig error:', error.message);
                }
            }
        } catch (error) {
            console.log('  - ❌ contractConfig error:', error.message);
        }
    }

    // Method 3: ethereum
    if (window.ethereum) {
        try {
            console.log('🔄 Method 3: ethereum');
            const provider = new ethers.BrowserProvider(window.ethereum);
            
            try {
                console.log('  - Testing MATIC balance via ethereum...');
                const maticBalance = await provider.getBalance(address);
                const formattedMATIC = ethers.formatEther(maticBalance);
                console.log('  - MATIC balance via ethereum:', formattedMATIC);
                
                if (maticElement && maticElement.textContent === '-') {
                    maticElement.textContent = window.mobileUserPopup.formatValue(formattedMATIC);
                    console.log('  - ✅ MATIC balance updated via ethereum');
                }
            } catch (error) {
                console.log('  - ❌ MATIC balance via ethereum error:', error.message);
            }
        } catch (error) {
            console.log('  - ❌ ethereum error:', error.message);
        }
    }

    // Test DAI
    if (window.DAI_ADDRESS && window.DAI_ABI) {
        console.log('🔄 Testing DAI balance...');
        
        const methods = [
            { name: 'connectWallet', fn: () => window.connectWallet() },
            { name: 'contractConfig', fn: () => window.contractConfig?.provider },
            { name: 'ethereum', fn: () => new ethers.BrowserProvider(window.ethereum) }
        ];

        for (const method of methods) {
            try {
                console.log(`  - Testing DAI via ${method.name}...`);
                const provider = await method.fn();
                
                if (provider) {
                    const daiContract = new ethers.Contract(window.DAI_ADDRESS, window.DAI_ABI, provider);
                    const daiBalance = await daiContract.balanceOf(address);
                    const formattedDAI = ethers.formatEther(daiBalance);
                    console.log(`  - DAI balance via ${method.name}:`, formattedDAI);
                    
                    if (daiElement) {
                        daiElement.textContent = window.mobileUserPopup.formatValue(formattedDAI);
                        console.log(`  - ✅ DAI balance updated via ${method.name}`);
                    }
                    break; // Success, exit
                }
            } catch (error) {
                console.log(`  - ❌ DAI via ${method.name} error:`, error.message);
            }
        }
    }

    console.log('🔍 === DEBUG COMPLETED ===');
};
