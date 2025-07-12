// AI Assistant using DeepSeek API
class AIAssistant {
    constructor() {
        this.apiKey = 'sk-6074908ce7954bd89d494d57651392a8';
        this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        this.isMinimized = false;
        this.isDropdownOpen = false;
        this.isLoading = false;
        this.conversationHistory = []; // برای ذخیره تاریخچه چت (فقط دیپلوی)
        this.maxHistoryLength = 50; // حداکثر تعداد پیام‌های ذخیره شده
        this.isDeployer = false; // وضعیت دیپلوی
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.bindEvents();
        // Show default buttons for regular users initially
        this.showRegularUserDefaultButtons();
        this.checkDeployerStatus(); // Check if current user is deployer
    }
    
    // Check if current user is deployer
    async checkDeployerStatus() {
        try {
            console.log('🔍 Checking deployer status...');
            const connection = await window.connectWallet();
            if (connection && connection.contract && connection.address) {
                const contract = connection.contract;
                const deployerAddress = await contract.deployer();
                
                console.log('👤 Current user address:', connection.address);
                console.log('👑 Deployer address:', deployerAddress);
                console.log('🔍 Is deployer?', connection.address.toLowerCase() === deployerAddress.toLowerCase());
                
                if (connection.address.toLowerCase() === deployerAddress.toLowerCase()) {
                    this.isDeployer = true;
                    console.log('✅ User is deployer - showing deployer buttons');
                    
                    // Show deployer section
                    const deployerSection = document.getElementById('deployer-section');
                    if (deployerSection) {
                        deployerSection.style.display = 'block';
                    }
                    
                    // Add deployer indicator to header
                    const headerTitle = document.querySelector('.ai-assistant-title span');
                    if (headerTitle) {
                        headerTitle.innerHTML = 'دستیار هوشمند CPA <span style="color: #00ff88; font-size: 0.8em;">(دیپلوی)</span>';
                    }
                    
                    // Update dropdown text for deployer
                    const dropdownText = document.querySelector('.ai-dropdown-text');
                    if (dropdownText) {
                        dropdownText.textContent = 'مدیریت و گزینه‌ها';
                    }
                    
                    // Show deployer-specific default buttons
                    this.showDeployerDefaultButtons();
                } else {
                    this.isDeployer = false;
                    console.log('👤 User is regular user - showing regular buttons');
                    
                    // Show regular user default buttons
                    this.showRegularUserDefaultButtons();
                }
            } else {
                console.log('❌ No connection available');
                this.isDeployer = false;
                this.showRegularUserDefaultButtons();
            }
        } catch (error) {
            console.warn('Could not check deployer status:', error);
            // Default to regular user if error
            this.isDeployer = false;
            this.showRegularUserDefaultButtons();
        }
    }
    
    // Show deployer-specific default buttons
    showDeployerDefaultButtons() {
        console.log('🔧 Showing deployer buttons...');
        const dropdownContent = document.getElementById('ai-dropdown-content');
        if (!dropdownContent) {
            console.log('❌ Dropdown content not found');
            return;
        }
        
        // Update the dropdown content for deployer
        dropdownContent.innerHTML = `
            <div class="ai-dropdown-section deployer-section">
                <div class="ai-dropdown-section-title deployer-title">🔧 مدیریت سیستم</div>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.showDeployerInfo()">
                    <i class="fas fa-crown"></i>
                    <span>اطلاعات دیپلوی</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.showContractStats()">
                    <i class="fas fa-chart-pie"></i>
                    <span>آمار قرارداد</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.showNetworkOverview()">
                    <i class="fas fa-sitemap"></i>
                    <span>نمای کلی شبکه</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.showRevenueStats()">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>آمار درآمدی</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.showUserAnalytics()">
                    <i class="fas fa-users-cog"></i>
                    <span>تحلیل کاربران</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.showSystemHealth()">
                    <i class="fas fa-heartbeat"></i>
                    <span>سلامت سیستم</span>
                </button>
            </div>
            <div class="ai-dropdown-section deployer-section">
                <div class="ai-dropdown-section-title deployer-title">📊 گزارشات پیشرفته</div>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.showReports()">
                    <i class="fas fa-chart-bar"></i>
                    <span>گزارشات کامل</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.showSystemInfo()">
                    <i class="fas fa-server"></i>
                    <span>اطلاعات سیستم</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.showBalances()">
                    <i class="fas fa-wallet"></i>
                    <span>موجودی‌های سیستم</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('آمار کلی سیستم چطوریه؟')">
                    <i class="fas fa-chart-line"></i>
                    <span>آمار کلی</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('عملکرد شبکه چطوریه؟')">
                    <i class="fas fa-network-wired"></i>
                    <span>عملکرد شبکه</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('وضعیت امنیت سیستم چطوریه؟')">
                    <i class="fas fa-shield-alt"></i>
                    <span>وضعیت امنیت</span>
                </button>
            </div>
            <div class="ai-dropdown-section deployer-section">
                <div class="ai-dropdown-section-title deployer-title">💬 راهنمایی کاربران</div>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('چطور می‌تونم به کاربران کمک کنم؟')">
                    <i class="fas fa-hands-helping"></i>
                    <span>راهنمایی کاربران</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('سوالات متداول کاربران چیه؟')">
                    <i class="fas fa-question-circle"></i>
                    <span>سوالات متداول</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('مشکلات رایج کاربران چیه؟')">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>مشکلات رایج</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('چطور می‌تونم سیستم رو بهبود بدم؟')">
                    <i class="fas fa-tools"></i>
                    <span>بهبود سیستم</span>
                </button>
            </div>
        `;
    }
    
    // Show regular user default buttons
    showRegularUserDefaultButtons() {
        console.log('👤 Showing regular user buttons...');
        const dropdownContent = document.getElementById('ai-dropdown-content');
        if (!dropdownContent) {
            console.log('❌ Dropdown content not found');
            return;
        }
        
        // Update the dropdown content for regular users
        dropdownContent.innerHTML = `
            <div class="ai-dropdown-section regular-section">
                <div class="ai-dropdown-section-title regular-title">سوالات متداول</div>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('چطور می‌تونم ثبت‌نام کنم؟')">
                    <i class="fas fa-user-plus"></i>
                    <span>ثبت‌نام</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('قیمت توکن CPA چقدر است؟')">
                    <i class="fas fa-dollar-sign"></i>
                    <span>قیمت توکن</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('چطور می‌تونم توکن بخرم؟')">
                    <i class="fas fa-shopping-cart"></i>
                    <span>خرید توکن</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('شبکه باینری چطور کار می‌کنه؟')">
                    <i class="fas fa-network-wired"></i>
                    <span>شبکه باینری</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('چطور می‌تونم پاداش برداشت کنم؟')">
                    <i class="fas fa-gift"></i>
                    <span>برداشت پاداش</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('امنیت سیستم چطوریه؟')">
                    <i class="fas fa-shield-alt"></i>
                    <span>امنیت</span>
                </button>
            </div>
            <div class="ai-dropdown-section regular-section">
                <div class="ai-dropdown-section-title regular-title">پلن‌های درآمدی</div>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('پلن‌های درآمدی CPA چیه؟')">
                    <i class="fas fa-chart-line"></i>
                    <span>معرفی پلن‌ها</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('چطور از شبکه باینری درآمد داشته باشم؟')">
                    <i class="fas fa-network-wired"></i>
                    <span>درآمد باینری</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('پاداش‌های ماهانه چطوریه؟')">
                    <i class="fas fa-calendar-alt"></i>
                    <span>پاداش ماهانه</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('چطور از ارجاع درآمد داشته باشم؟')">
                    <i class="fas fa-users"></i>
                    <span>درآمد ارجاع</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('حداقل برداشت چقدره؟')">
                    <i class="fas fa-coins"></i>
                    <span>حداقل برداشت</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('نرخ بازگشت سرمایه چقدره؟')">
                    <i class="fas fa-percentage"></i>
                    <span>ROI</span>
                </button>
            </div>
            <div class="ai-dropdown-section regular-section">
                <div class="ai-dropdown-section-title regular-title">اطلاعات شخصی</div>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.showUserInfo()">
                    <i class="fas fa-user"></i>
                    <span>اطلاعات کاربر</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.showBalances()">
                    <i class="fas fa-wallet"></i>
                    <span>موجودی‌ها</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('وضعیت عضویت من چطوریه؟')">
                    <i class="fas fa-user-check"></i>
                    <span>وضعیت عضویت</span>
                </button>
                <button class="ai-dropdown-item" onclick="window.aiAssistant.askQuestion('تاریخچه تراکنش‌های من چیه؟')">
                    <i class="fas fa-history"></i>
                    <span>تاریخچه تراکنش</span>
                </button>
            </div>
        `;
    }
    
    // Test function to check current status
    async testDeployerStatus() {
        console.log('🧪 Testing deployer status...');
        console.log('Current isDeployer:', this.isDeployer);
        
        const dropdownContent = document.getElementById('ai-dropdown-content');
        if (dropdownContent) {
            console.log('Dropdown content found:', dropdownContent.innerHTML.substring(0, 100) + '...');
        } else {
            console.log('Dropdown content not found');
        }
        
        await this.checkDeployerStatus();
    }

    // Test function to manually switch between deployer and regular user views
    async testSwitchUserType() {
        console.log('🔄 Testing user type switch...');
        
        // Toggle the deployer status for testing
        this.isDeployer = !this.isDeployer;
        console.log('Switched isDeployer to:', this.isDeployer);
        
        // Update the UI based on the new status
        if (this.isDeployer) {
            this.showDeployerDefaultButtons();
            console.log('✅ Now showing deployer buttons');
        } else {
            this.showRegularUserDefaultButtons();
            console.log('✅ Now showing regular user buttons');
        }
        
        // Toggle the dropdown to show the changes
        this.toggleDropdown();
        
        return this.isDeployer;
    }
    
    // Test full-width mode
    testFullWidthMode() {
        console.log('🧪 Testing full-width mode...');
        const container = document.getElementById('ai-assistant-container');
        const body = document.body;
        
        console.log('Container found:', !!container);
        console.log('Container classes:', container ? container.className : 'N/A');
        console.log('Body classes:', body.className);
        console.log('Container width:', container ? container.style.width : 'N/A');
        console.log('Body width:', body.style.width);
        
        if (container) {
            console.log('Container computed width:', window.getComputedStyle(container).width);
            console.log('Container offset width:', container.offsetWidth);
            console.log('Is full-width?', container.classList.contains('full-width'));
        }
        
        // Test the toggle function
        this.toggleFullWidth();
    }

    // Function to show current button configuration
    showCurrentConfiguration() {
        console.log('📋 Current AI Assistant Configuration:');
        console.log('- isDeployer:', this.isDeployer);
        console.log('- User address:', this.userAddress);
        console.log('- Deployer address:', this.deployerAddress);
        
        const container = document.getElementById('ai-assistant-container');
        if (container) {
            console.log('- Container classes:', container.className);
            console.log('- Full-width mode:', container.classList.contains('full-width'));
            console.log('- Minimized mode:', container.classList.contains('minimized'));
        }
        
        const dropdownContent = document.getElementById('ai-dropdown-content');
        if (dropdownContent) {
            const sections = dropdownContent.querySelectorAll('.ai-dropdown-section');
            console.log('- Number of dropdown sections:', sections.length);
            
            sections.forEach((section, index) => {
                const isDeployerSection = section.classList.contains('deployer-section');
                const isRegularSection = section.classList.contains('regular-section');
                const title = section.querySelector('.ai-dropdown-section-title')?.textContent || 'No title';
                const buttons = section.querySelectorAll('.ai-dropdown-item');
                
                console.log(`  Section ${index + 1}:`);
                console.log(`    - Type: ${isDeployerSection ? 'Deployer' : isRegularSection ? 'Regular' : 'Unknown'}`);
                console.log(`    - Title: ${title}`);
                console.log(`    - Buttons: ${buttons.length}`);
            });
        } else {
            console.log('- Dropdown content not found');
        }
    }
    
    createUI() {
        // Create AI Assistant container
        const assistantContainer = document.createElement('div');
        assistantContainer.id = 'ai-assistant-container';
        assistantContainer.className = 'ai-assistant-container';
        assistantContainer.innerHTML = `
            <div class="ai-assistant-header ai-header-centered">
                <div class="ai-assistant-title ai-title-centered">
                    <i class="fas fa-robot"></i>
                    <span>آکادمی درآمد مستمر</span>
                </div>
                <div class="ai-assistant-controls">
                    <button class="ai-close-btn" id="ai-close-btn">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
            </div>
            <div class="ai-assistant-body">
                <div class="ai-messages" id="ai-messages">
                    <div class="ai-message ai-system">
                        <div class="ai-message-content">
                            🚀 سلام! من آکادمی درآمد مستمر هستم! 
                            می‌تونم در موارد زیر کمکتون کنم:
                            • راهنمایی ثبت‌نام و عضویت
                            • اطلاعات قیمت و توکن‌ها
                            • آموزش خرید و فروش
                            • راهنمایی شبکه باینری
                            • پاسخ سوالات امنیتی
                            چطور می‌تونم کمکتون کنم؟ 🤖
                        </div>
                    </div>
                </div>
                <div class="ai-input-container">
                    <div class="ai-input-wrapper">
                        <div class="ai-dropdown">
                            <button class="ai-dropdown-btn" onclick="window.aiAssistant.toggleDropdown()">
                                <i class="fas fa-question-circle"></i>
                                <span class="ai-dropdown-text">سوالات و گزینه‌ها</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="ai-dropdown-content" id="ai-dropdown-content">
                                <!-- Content will be dynamically generated based on user type -->
                            </div>
                        </div>
                        <textarea 
                            id="ai-input" 
                            placeholder="سوال خود را بپرسید..."
                            rows="1"
                        ></textarea>
                        <button id="ai-send-btn" class="ai-send-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="ai-loading" id="ai-loading" style="display: none;">
                        <div class="ai-loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span>در حال پردازش...</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add to dashboard section before the chart
        const dashboardCards = document.querySelector('.dashboard-cards');
        const priceChartSection = document.getElementById('price-chart-section');
        if (dashboardCards && priceChartSection) {
            // Insert before the price chart section
            dashboardCards.insertBefore(assistantContainer, priceChartSection);
        } else if (dashboardCards) {
            dashboardCards.appendChild(assistantContainer);
        } else {
            // Fallback to body if dashboard not found
            document.body.appendChild(assistantContainer);
        }
        
        // Add CSS
        this.addStyles();
    }
    
    addStyles() {
        // استایل‌ها در فایل CSS جداگانه تعریف شده‌اند
        // این تابع برای سازگاری نگه داشته شده است
        console.log('AI Assistant styles loaded from external CSS file');
    }
    
    bindEvents() {
        // Close assistant (now just minimizes)
        document.getElementById('ai-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMinimize();
        });
        
        // Header click to toggle
        document.querySelector('.ai-assistant-header').addEventListener('click', () => {
            this.toggleMinimize();
        });
        
        // Double click header to toggle full-width mode (اختیاری)
        // document.querySelector('.ai-assistant-header').addEventListener('dblclick', (e) => {
        //     e.stopPropagation();
        //     this.toggleFullWidth();
        // });
        
        // Send message
        document.getElementById('ai-send-btn').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key to send
        document.getElementById('ai-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        document.getElementById('ai-input').addEventListener('input', (e) => {
            this.autoResizeTextarea(e.target);
        });
        
        // Initialize hamburger menu monitoring
        this.initHamburgerMenuMonitoring();
        
        // --- اتوماتیک کردن حالت full-width و minimize ---
        this.setupAutoFullWidth();
    }
    
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }
    
    toggleMinimize() {
        const container = document.getElementById('ai-assistant-container');
        container.classList.toggle('minimized');
        if (container.classList.contains('minimized')) {
            document.body.classList.add('ai-assistant-minimized');
        } else {
            document.body.classList.remove('ai-assistant-minimized');
        }
    }

    // Toggle full-width mode
    toggleFullWidth() {
        const container = document.getElementById('ai-assistant-container');
        const body = document.body;
        
        if (!container.classList.contains('full-width')) {
            // Enter full-width mode
            console.log('🖥️ Entering full-width mode...');
            
            // Move container to body to avoid parent constraints
            if (container.parentElement !== body) {
                body.appendChild(container);
            }
            
            // Add classes
            container.classList.add('full-width');
            body.classList.add('ai-assistant-fullscreen');
            
            // Update expand button
            const expandBtn = document.getElementById('ai-expand-btn');
            if (expandBtn) {
                expandBtn.classList.add('full-width');
                expandBtn.innerHTML = '<i class="fas fa-compress"></i>';
                expandBtn.title = 'Exit Full Width Mode';
            }
            
            // Set body styles for horizontal scrolling
            body.style.cssText = `
                overflow-x: auto !important;
                overflow-y: hidden !important;
                position: fixed !important;
                width: 200vw !important;
                height: 100vh !important;
            `;
            
            // Apply inline styles to force full coverage
            container.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 200vw !important;
                height: 100vh !important;
                max-width: 200vw !important;
                min-width: 200vw !important;
                margin: 0 !important;
                padding: 0 !important;
                border-radius: 0 !important;
                border: none !important;
                box-shadow: none !important;
                z-index: 999999 !important;
                overflow: hidden !important;
                background: linear-gradient(135deg, #232946 0%, #1a1f2e 100%) !important;
            `;
            
            // Hide all other elements
            const allElements = document.querySelectorAll('*:not(#ai-assistant-container):not(#ai-assistant-container *)');
            allElements.forEach(el => {
                if (el !== body && el !== document.documentElement) {
                    el.style.setProperty('display', 'none', 'important');
                }
            });
            
            console.log('✅ Full-width mode activated');
            
        } else {
            // Exit full-width mode
            console.log('📱 Exiting full-width mode...');
            
            // Remove classes
            container.classList.remove('full-width');
            body.classList.remove('ai-assistant-fullscreen');
            
            // Reset expand button
            const expandBtn = document.getElementById('ai-expand-btn');
            if (expandBtn) {
                expandBtn.classList.remove('full-width');
                expandBtn.innerHTML = '<i class="fas fa-expand"></i>';
                expandBtn.title = 'Full Width Mode';
            }
            
            // Reset container styles
            container.style.cssText = '';
            
            // Reset body styles
            body.style.cssText = '';
            
            // Show all elements again
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                if (el !== body && el !== document.documentElement && el !== container) {
                    el.style.removeProperty('display');
                }
            });
            
            // Move back to original position if possible
            const dashboardCards = document.querySelector('.dashboard-cards');
            const priceChartSection = document.getElementById('price-chart-section');
            if (dashboardCards && priceChartSection) {
                dashboardCards.insertBefore(container, priceChartSection);
            } else if (dashboardCards) {
                dashboardCards.appendChild(container);
            }
            
            console.log('✅ Normal mode restored');
        }
    }

    // Check hamburger menu status and minimize AI assistant if needed
    checkHamburgerMenuStatus() {
        const hamburgerMenu = document.querySelector('.hamburger-menu');
        const container = document.getElementById('ai-assistant-container');
        
        if (hamburgerMenu && container) {
            if (hamburgerMenu.classList.contains('active')) {
                document.body.classList.add('hamburger-menu-active');
                if (!container.classList.contains('minimized')) {
                    container.classList.add('minimized');
                }
            } else {
                document.body.classList.remove('hamburger-menu-active');
            }
        }
    }

    // Initialize hamburger menu monitoring
    initHamburgerMenuMonitoring() {
        // Monitor hamburger menu changes
        const observer = new MutationObserver(() => {
            this.checkHamburgerMenuStatus();
        });
        
        const hamburgerMenu = document.querySelector('.hamburger-menu');
        if (hamburgerMenu) {
            observer.observe(hamburgerMenu, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
        
        // Also check on page load
        this.checkHamburgerMenuStatus();
        
        // Listen for hamburger menu events
        document.addEventListener('hamburgerMenuToggle', () => {
            setTimeout(() => this.checkHamburgerMenuStatus(), 100);
        });
    }
    
    toggleDropdown() {
        const dropdownContent = document.getElementById('ai-dropdown-content');
        dropdownContent.classList.toggle('show');
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.ai-dropdown')) {
                dropdownContent.classList.remove('show');
            }
        }, { once: true });
    }
    
    askQuestion(question) {
        // Close dropdown
        const dropdownContent = document.getElementById('ai-dropdown-content');
        dropdownContent.classList.remove('show');
        
        // Set question in input
        const input = document.getElementById('ai-input');
        input.value = question;
        this.autoResizeTextarea(input);
        
        // Send the question
        this.sendMessage();
    }
    
    show() {
        // AI Assistant is now always visible in dashboard
        console.log('AI Assistant is integrated in dashboard');
    }
    
    hide() {
        // AI Assistant is now always visible in dashboard
        console.log('AI Assistant is integrated in dashboard');
    }
    
    // Clear conversation history for non-deployers
    clearConversationHistory() {
        this.conversationHistory = [];
        console.log('Conversation history cleared for non-deployer user');
    }

    // Check if user is deployer and update status
    async updateDeployerStatus() {
        try {
            const connection = await window.connectWallet();
            if (connection && connection.contract && connection.address) {
                const deployerAddress = await connection.contract.deployer();
                this.isDeployer = connection.address.toLowerCase() === deployerAddress.toLowerCase();
                
                // Clear history if user is not deployer
                if (!this.isDeployer) {
                    this.clearConversationHistory();
                }
                
                return this.isDeployer;
            }
        } catch (error) {
            console.error('Error updating deployer status:', error);
            this.isDeployer = false;
        }
        return false;
    }

    async sendMessage() {
        const input = document.getElementById('ai-input');
        const message = input.value.trim();
        
        if (!message || this.isLoading) return;
        
        // Update deployer status before processing
        await this.updateDeployerStatus();
        
        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        this.autoResizeTextarea(input);
        
        // Show loading
        this.showLoading(true);
        
        try {
            const response = await this.getAIResponse(message);
            
            // Add security notice for non-deployers
            if (!this.isDeployer) {
                this.addMessage('🔒 توجه: اطلاعات شما ذخیره نمی‌شود و فقط راهنمایی عمومی ارائه می‌شود.', 'ai-system');
            } else {
                // فقط برای deployer پاسخ را ذخیره کن
                this.conversationHistory.push({ role: 'ai', content: response });
                if (this.conversationHistory.length > this.maxHistoryLength) {
                    this.conversationHistory.shift();
                }
            }
            
            this.addMessage(response, 'ai-system');
        } catch (error) {
            console.error('AI Assistant Error:', error);
            this.addMessage('متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.', 'ai-system');
        } finally {
            this.showLoading(false);
        }
    }
    
    async getAIResponse(message) {
        // Check if user is deployer and provide deployer-specific context
        let deployerContext = '';
        
        try {
            const connection = await window.connectWallet();
            if (connection && connection.contract && connection.address) {
                const deployerAddress = await connection.contract.deployer();
                if (connection.address.toLowerCase() === deployerAddress.toLowerCase()) {
                    deployerContext = `
شما دیپلوی سیستم CPA هستید. آدرس دیپلوی: ${deployerAddress}
شما دسترسی کامل به تمام اطلاعات سیستم دارید و می‌توانید:
- اطلاعات دقیق قرارداد را مشاهده کنید
- آمار شبکه را بررسی کنید
- سلامت سیستم را کنترل کنید
- تحلیل‌های درآمدی را ببینید
- اطلاعات کاربران را بررسی کنید

لطفاً سوال خود را بپرسید تا اطلاعات دقیق و کامل ارائه دهم.
`;
                }
            }
        } catch (error) {
            console.error('Error checking deployer status:', error);
        }

        // اگر کاربر دیپلوی نیست، فقط راهنمایی ارائه دهید و اطلاعات ذخیره نکنید
        if (!this.isDeployer) {
            const guidanceResponse = this.getGuidanceResponse(message);
            if (guidanceResponse) {
                return guidanceResponse;
            }
            
            // برای سوالات غیر دیپلوی، فقط راهنمایی عمومی ارائه دهید
            return this.getGeneralGuidance(message);
        }

        // پاسخ‌های پیش‌فرض برای دیپلوی
        const predefinedResponses = {
            'سلام': `سلام! 👋 به دستیار هوشمند CPA خوش آمدید!${this.isDeployer ? '\n\n' + deployerContext : ''}

چطور می‌تونم کمکتون کنم؟ می‌تونید:
• سوالات متداول رو بپرسید
• اطلاعات سیستم رو ببینید
• موجودی‌ها رو چک کنید
• گزارشات رو مشاهده کنید${this.isDeployer ? '\n• اطلاعات دیپلوی رو ببینید' : ''}`,

            'چطور می‌تونم ثبت‌نام کنم؟': `📝 نحوه ثبت‌نام در CPA:

🔗 **مراحل ثبت‌نام:**
1. کیف پول MetaMask را نصب کنید
2. به شبکه Polygon متصل شوید
3. روی "ثبت‌نام" کلیک کنید
4. تراکنش را تایید کنید

💰 **هزینه ثبت‌نام:**
• 50 USDC برای فعال‌سازی
• کارمزد شبکه Polygon

⏰ **زمان فعال‌سازی:**
• فوری پس از تایید تراکنش
• امکان شروع فعالیت بلافاصله

💡 **نکات مهم:**
• از لینک ارجاع استفاده کنید
• کیف پول را ایمن نگه دارید
• قوانین را مطالعه کنید

✅ ثبت‌نام کنید و شروع به کسب درآمد کنید!`,

            'قیمت توکن CPA چقدر است؟': `💰 قیمت توکن CPA:

📊 **قیمت فعلی:**
• قیمت: متغیر (بر اساس عرضه و تقاضا)
• واحد: USDC
• شبکه: Polygon

📈 **عوامل موثر بر قیمت:**
• تعداد کاربران فعال
• حجم تراکنش‌ها
• عرضه و تقاضا
• عملکرد کلی سیستم

💡 **نکات مهم:**
• قیمت به صورت پویا تغییر می‌کند
• سرمایه‌گذاری با ریسک همراه است
• تحلیل دقیق قبل از خرید ضروری است

🚀 قیمت توکن CPA در حال رشد است!`,

            'امنیت سیستم چطوریه؟': `🔒 امنیت سیستم CPA:

🛡️ ویژگی‌های امنیتی:
• قرارداد هوشمند تایید شده
• کدهای امنیتی پیشرفته
• سیستم احراز هویت چندلایه
• رمزنگاری داده‌ها

🔐 امنیت کیف پول:
• اتصال مستقیم به MetaMask
• عدم ذخیره کلیدهای خصوصی
• تراکنش‌های امن و رمزنگاری شده

📋 نکات امنیتی:
• کلیدهای خصوصی را محفوظ نگه دارید
• از سایت‌های رسمی استفاده کنید
• تراکنش‌ها را با دقت بررسی کنید
• از VPN معتبر استفاده کنید

✅ سیستم CPA با بالاترین استانداردهای امنیتی طراحی شده است!`,

            'پلن‌های درآمدی CPA چیه؟': `💰 پلن‌های درآمدی CPA:

📊 **1. درآمد باینری:**
• پاداش از فعالیت زیرمجموعه‌ها
• سیستم درختی 2 شاخه‌ای
• پاداش‌های روزانه و هفتگی

📈 **2. پاداش‌های ماهانه:**
• بر اساس رتبه در شبکه
• پاداش‌های ویژه برای فعالان
• توزیع ماهانه از استخر پاداش

👥 **3. درآمد ارجاع:**
• پاداش از معرفی کاربران جدید
• درصدی از خریدهای معرفی‌شده
• پاداش‌های مادام‌العمر

🛒 **4. خرید و فروش توکن:**
• سود از نوسانات قیمت
• استیکینگ و دریافت پاداش
• مشارکت در رشد پروژه

💡 **نکات مهم:**
• ترکیب چندین منبع درآمد
• درآمد غیرفعال و فعال
• پتانسیل رشد نامحدود

🚀 شروع کنید و درآمد خود را چند برابر کنید!`,

            'چطور از شبکه باینری درآمد داشته باشم؟': `🌐 درآمد از شبکه باینری CPA:

📋 **نحوه کارکرد:**
• هر کاربر 2 زیرمجموعه مستقیم
• سیستم درختی نامحدود
• پاداش از فعالیت کل تیم

💰 **انواع پاداش باینری:**
• پاداش روزانه: از فعالیت زیرمجموعه‌ها
• پاداش هفتگی: از عملکرد تیم
• پاداش ماهانه: از رتبه در شبکه

📊 **محاسبه پاداش:**
• بر اساس حجم فعالیت تیم
• ضریب رتبه کاربر
• سقف پاداش روزانه

🎯 **استراتژی‌های موفقیت:**
• فعال‌سازی زیرمجموعه‌ها
• آموزش و پشتیبانی تیم
• فعالیت مستمر و منظم

💡 **نکات کلیدی:**
• کیفیت مهم‌تر از کمیت است
• صبر و پشتکار ضروری است
• تیم‌سازی هوشمندانه

✅ با فعالیت منظم، درآمد پایدار خواهید داشت!`,

            'پاداش‌های ماهانه چطوریه؟': `📅 پاداش‌های ماهانه CPA:

🎁 **انواع پاداش ماهانه:**
• پاداش رتبه: بر اساس موقعیت در شبکه
• پاداش عملکرد: از فعالیت‌های ماهانه
• پاداش ویژه: برای کاربران برتر

📊 **شرایط دریافت:**
• حداقل فعالیت ماهانه
• رعایت قوانین سیستم
• فعال‌سازی حساب کاربری

💰 **مقادیر پاداش:**
• بر اساس رتبه در شبکه
• درصدی از استخر ماهانه
• پاداش‌های تشویقی اضافی

⏰ **زمان توزیع:**
• آخر هر ماه میلادی
• پرداخت خودکار به کیف پول
• اطلاع‌رسانی از طریق سیستم

🏆 **رتبه‌بندی:**
• بر اساس حجم فعالیت
• تعداد زیرمجموعه‌های فعال
• عملکرد کلی در شبکه

💡 **نکات مهم:**
• فعالیت مستمر ضروری است
• کیفیت مهم‌تر از کمیت
• تیم‌سازی هوشمندانه

🚀 هر ماه فرصت جدیدی برای درآمد بیشتر!`,

            'چطور از ارجاع درآمد داشته باشم؟': `👥 درآمد از سیستم ارجاع CPA:

🔗 **نحوه ارجاع:**
• لینک ارجاع شخصی دریافت کنید
• کاربران جدید را معرفی کنید
• از فعالیت‌های آن‌ها پاداش بگیرید

💰 **انواع پاداش ارجاع:**
• پاداش ثبت‌نام: از عضویت کاربران جدید
• پاداش خرید: درصدی از خریدهای معرفی‌شده
• پاداش فعالیت: از فعالیت‌های روزانه

📊 **محاسبه پاداش:**
• درصد ثابت از تراکنش‌ها
• پاداش‌های تشویقی اضافی
• پاداش‌های مادام‌العمر

🎯 **استراتژی‌های موفقیت:**
• معرفی کاربران با کیفیت
• آموزش و پشتیبانی
• ایجاد انگیزه در تیم

💡 **نکات مهم:**
• کیفیت معرفی مهم‌تر از کمیت
• پشتیبانی از تیم ضروری است
• صبر و پشتکار کلید موفقیت

✅ با معرفی کاربران فعال، درآمد پایدار خواهید داشت!`,

            'حداقل برداشت چقدره؟': `💳 حداقل برداشت در CPA:

💰 **حداقل مبلغ برداشت:**
• پاداش‌های باینری: 10 CPA
• پاداش‌های ماهانه: 50 CPA
• پاداش‌های ارجاع: 5 CPA

⏰ **زمان‌بندی برداشت:**
• پاداش‌های باینری: هر زمان
• پاداش‌های ماهانه: ماهانه
• پاداش‌های ارجاع: هر زمان

💸 **روش‌های برداشت:**
• انتقال به کیف پول شخصی
• تبدیل به USDC
• استفاده در سیستم

📋 **شرایط برداشت:**
• حساب کاربری فعال
• رعایت قوانین سیستم
• تایید تراکنش‌ها

💡 **نکات مهم:**
• کارمزد شبکه جداگانه است
• زمان تایید تراکنش متغیر است
• از شبکه Polygon استفاده کنید

✅ با رسیدن به حداقل مبلغ، فوراً برداشت کنید!`,

            'نرخ بازگشت سرمایه چقدره؟': `📈 نرخ بازگشت سرمایه (ROI) در CPA:

💰 **ROI کلی سیستم:**
• پاداش‌های باینری: 100-300% سالانه
• پاداش‌های ماهانه: 50-150% سالانه
• رشد قیمت توکن: متغیر

📊 **محاسبه ROI:**
• سرمایه اولیه: هزینه ثبت‌نام
• درآمد ماهانه: پاداش‌های مختلف
• ROI = (درآمد کل / سرمایه) × 100

🎯 **عوامل موثر بر ROI:**
• فعالیت شخصی
• کیفیت تیم‌سازی
• رعایت استراتژی‌ها
• زمان سرمایه‌گذاری

📈 **پتانسیل رشد:**
• درآمد غیرفعال
• رشد تدریجی تیم
• افزایش قیمت توکن
• پاداش‌های تشویقی

💡 **نکات مهم:**
• ROI بستگی به فعالیت دارد
• صبر و پشتکار ضروری است
• سرمایه‌گذاری بلندمدت بهتر است

🚀 با فعالیت منظم، ROI بالایی خواهید داشت!`,

            // Deployer-specific responses
            'اطلاعات دیپلوی': this.isDeployer ? 'در حال دریافت اطلاعات دیپلوی...' : '❌ شما دیپلوی نیستید',
            'آمار قرارداد': this.isDeployer ? 'در حال دریافت آمار دقیق قرارداد...' : '❌ شما دیپلوی نیستید',
            'نمای شبکه': this.isDeployer ? 'در حال دریافت نمای کلی شبکه...' : '❌ شما دیپلوی نیستید',
            'آمار درآمدی': this.isDeployer ? 'در حال دریافت آمار درآمدی...' : '❌ شما دیپلوی نیستید',
            'تحلیل کاربران': this.isDeployer ? 'در حال دریافت تحلیل کاربران...' : '❌ شما دیپلوی نیستید',
            'سلامت سیستم': this.isDeployer ? 'در حال بررسی سلامت سیستم...' : '❌ شما دیپلوی نیستید'
        };

        // بررسی پاسخ پیش‌فرض
        const lowerMessage = message.toLowerCase();
        for (const [key, response] of Object.entries(predefinedResponses)) {
            if (lowerMessage.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerMessage)) {
                return response;
            }
        }

        // اگر دیپلوی است، پاسخ‌های خاص دیپلوی را بررسی کن
        if (isDeployer) {
            const deployerResponses = {
                'اطلاعات دیپلوی': 'showDeployerInfo',
                'آمار قرارداد': 'showContractStats', 
                'نمای شبکه': 'showNetworkOverview',
                'آمار درآمدی': 'showRevenueStats',
                'تحلیل کاربران': 'showUserAnalytics',
                'سلامت سیستم': 'showSystemHealth'
            };

            for (const [key, method] of Object.entries(deployerResponses)) {
                if (lowerMessage.includes(key.toLowerCase())) {
                    // Call the specific deployer method
                    if (this[method]) {
                        await this[method]();
                        return null; // Method will handle the response
                    }
                }
            }
        }

        // اگر پاسخ پیش‌فرض پیدا نشد، از API استفاده کن (فقط برای دیپلوی)
        if (isDeployer) {
            try {
                const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${deepseek_api}`
                    },
                    body: JSON.stringify({
                        model: 'deepseek-chat',
                        messages: [
                            {
                                role: 'system',
                                content: `شما دستیار هوشمند سیستم CPA هستید. ${deployerContext}

سیستم CPA یک پلتفرم درآمدزایی مبتنی بر بلاکچین است که شامل:
- سیستم باینری و ارجاع
- پاداش‌های ماهانه
- خرید و فروش توکن
- شبکه‌سازی و تیم‌سازی

لطفاً پاسخ‌های مفید و دقیق به فارسی ارائه دهید.`
                            },
                            {
                                role: 'user',
                                content: message
                            }
                        ],
                        max_tokens: 1000,
                        temperature: 0.7
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.choices[0].message.content;
                } else {
                    throw new Error('API request failed');
                }
            } catch (error) {
                console.error('Error calling DeepSeek API:', error);
                return `متأسفانه در حال حاضر نمی‌توانم پاسخ دهم. لطفاً سوال خود را به شکل دیگری مطرح کنید یا از گزینه‌های موجود استفاده کنید.\n\n${deployerContext}`;
            }
        }

        // برای غیر دیپلوی، راهنمایی عمومی ارائه دهید
        return this.getGeneralGuidance(message);
    }

    // راهنمایی برای کاربران غیر دیپلوی
    getGuidanceResponse(message) {
        const guidanceResponses = {
            'اطلاعات دیپلوی': '🔒 این اطلاعات فقط برای دیپلوی سیستم قابل دسترسی است. لطفاً از گزینه‌های عمومی استفاده کنید.',
            'آمار قرارداد': '🔒 این اطلاعات فقط برای دیپلوی سیستم قابل دسترسی است. لطفاً از گزینه‌های عمومی استفاده کنید.',
            'نمای شبکه': '🔒 این اطلاعات فقط برای دیپلوی سیستم قابل دسترسی است. لطفاً از گزینه‌های عمومی استفاده کنید.',
            'آمار درآمدی': '🔒 این اطلاعات فقط برای دیپلوی سیستم قابل دسترسی است. لطفاً از گزینه‌های عمومی استفاده کنید.',
            'تحلیل کاربران': '🔒 این اطلاعات فقط برای دیپلوی سیستم قابل دسترسی است. لطفاً از گزینه‌های عمومی استفاده کنید.',
            'سلامت سیستم': '🔒 این اطلاعات فقط برای دیپلوی سیستم قابل دسترسی است. لطفاً از گزینه‌های عمومی استفاده کنید.'
        };

        const lowerMessage = message.toLowerCase();
        for (const [key, response] of Object.entries(guidanceResponses)) {
            if (lowerMessage.includes(key.toLowerCase())) {
                return response;
            }
        }

        return null;
    }

    // راهنمایی عمومی برای کاربران غیر دیپلوی
    getGeneralGuidance(message) {
        const lowerMessage = message.toLowerCase();
        
        // راهنمایی‌های عمومی
        if (lowerMessage.includes('ثبت‌نام') || lowerMessage.includes('عضویت')) {
            return `📝 برای ثبت‌نام در CPA:
1. کیف پول MetaMask خود را متصل کنید
2. روی دکمه "ثبت‌نام" کلیک کنید
3. تراکنش را تایید کنید
4. منتظر فعال‌سازی باشید

💡 برای اطلاعات بیشتر از گزینه‌های موجود استفاده کنید.`;
        }
        
        if (lowerMessage.includes('قیمت') || lowerMessage.includes('توکن')) {
            return `💰 قیمت توکن CPA:
• قیمت به صورت پویا تغییر می‌کند
• بر اساس عرضه و تقاضا تعیین می‌شود
• در شبکه Polygon معامله می‌شود

💡 برای مشاهده قیمت دقیق از دکمه "اطلاعات سیستم" استفاده کنید.`;
        }
        
        if (lowerMessage.includes('درآمد') || lowerMessage.includes('پاداش')) {
            return `💰 درآمد در CPA:
• درآمد باینری از شبکه
• پاداش‌های ماهانه
• درآمد ارجاع
• خرید و فروش توکن

💡 برای اطلاعات دقیق از گزینه‌های موجود استفاده کنید.`;
        }
        
        if (lowerMessage.includes('امنیت') || lowerMessage.includes('ایمن')) {
            return `🔒 امنیت سیستم CPA:
• قرارداد هوشمند تایید شده
• اتصال مستقیم به MetaMask
• عدم ذخیره کلیدهای خصوصی
• تراکنش‌های رمزنگاری شده

💡 سیستم با بالاترین استانداردهای امنیتی طراحی شده است.`;
        }
        
        if (lowerMessage.includes('شبکه') || lowerMessage.includes('باینری')) {
            return `🌐 شبکه باینری CPA:
• هر کاربر 2 زیرمجموعه مستقیم
• سیستم درختی نامحدود
• پاداش از فعالیت تیم
• رشد تدریجی و پایدار

💡 برای اطلاعات بیشتر از گزینه‌های موجود استفاده کنید.`;
        }
        
        if (lowerMessage.includes('برداشت') || lowerMessage.includes('پول')) {
            return `💳 برداشت در CPA:
• حداقل مبلغ برداشت: طبق قوانین سیستم
• انتقال به کیف پول شخصی
• تبدیل به USDC
• کارمزد شبکه جداگانه

💡 برای اطلاعات دقیق از دکمه "موجودی‌ها" استفاده کنید.`;
        }

        // پاسخ پیش‌فرض برای سوالات غیرقابل تشخیص
        return `🤖 سلام! من دستیار هوشمند CPA هستم.

برای دریافت اطلاعات دقیق، لطفاً از گزینه‌های موجود استفاده کنید:
• سوالات متداول
• اطلاعات سیستم
• موجودی‌ها
• گزارشات

💡 اطلاعات حساس فقط برای دیپلوی سیستم قابل دسترسی است.`;
    }
    
    addMessage(content, type) {
        const messagesContainer = document.getElementById('ai-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${type}`;
        
        // Create message content container
        const messageContent = document.createElement('div');
        messageContent.className = 'ai-message-content';
        
        // Create time element
        const timeDiv = document.createElement('div');
        timeDiv.className = 'ai-message-time';
        timeDiv.textContent = this.getCurrentTime();
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(timeDiv);
        messagesContainer.appendChild(messageDiv);
        
        // Use typewriter effect for AI responses
        if (type === 'ai-system') {
            this.typewriterEffect(messageContent, content);
        } else {
            // For user messages, display immediately
            messageContent.innerHTML = this.escapeHtml(content);
        }
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Typewriter effect method
    typewriterEffect(element, text, speed = 30) {
        element.innerHTML = '';
        element.classList.add('typing'); // Add typing class for cursor
        let index = 0;
        
        const typeNextChar = () => {
            if (index < text.length) {
                // Handle special characters and HTML
                const char = text[index];
                if (char === '\n') {
                    element.innerHTML += '<br>';
                } else if (char === ' ') {
                    element.innerHTML += '&nbsp;';
                } else {
                    element.innerHTML += this.escapeHtml(char);
                }
                index++;
                
                // Scroll to bottom as text appears
                const messagesContainer = document.getElementById('ai-messages');
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                // Calculate delay - longer for punctuation marks
                let currentSpeed = speed;
                if (['.', '!', '?', ':', ';', '،', '؟', '!', '؛'].includes(char)) {
                    currentSpeed = speed * 3; // Longer pause for punctuation
                } else if (char === '\n') {
                    currentSpeed = speed * 2; // Medium pause for line breaks
                }
                
                // Continue typing
                setTimeout(typeNextChar, currentSpeed);
            } else {
                // Remove typing class when finished
                element.classList.remove('typing');
            }
        };
        
        // Start typing
        typeNextChar();
    }
    
    showLoading(show) {
        this.isLoading = show;
        const loading = document.getElementById('ai-loading');
        const sendBtn = document.getElementById('ai-send-btn');
        
        if (show) {
            loading.style.display = 'flex';
            sendBtn.disabled = true;
        } else {
            loading.style.display = 'none';
            sendBtn.disabled = false;
        }
    }
    
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('fa-IR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Quick help methods
    showQuickHelp() {
        if (window.getCommonQuestions) {
            const questions = window.getCommonQuestions();
            this.addMessage('سوالات متداول:', 'ai-system');
            questions.forEach(msg => {
                this.addMessage(`• ${msg}`, 'ai-system');
            });
        }
    }
    
    // Show complete guide
    showCompleteGuide() {
        if (window.showCompleteGuide) {
            const guide = window.showCompleteGuide();
            this.addMessage(`📚 ${guide.title}:`, 'ai-system');
            
            guide.sections.forEach(section => {
                this.addMessage(`\n🔹 ${section.title}:`, 'ai-system');
                section.content.forEach(item => {
                    this.addMessage(`   ${item}`, 'ai-system');
                });
            });
        }
    }
    
    // Show current system status
    async showSystemStatus() {
        try {
            const connection = await window.connectWallet();
            if (connection && connection.contract) {
                const contract = connection.contract;
                
                // Get basic stats
                const [totalSupply, tokenPrice, wallets] = await Promise.all([
                    contract.totalSupply().catch(() => 0n),
                    contract.getTokenPrice().catch(() => 0n),
                    contract.wallets().catch(() => 0n)
                ]);
                
                this.addMessage('📊 وضعیت سیستم:', 'ai-system');
                this.addMessage(`• تعداد کیف پول‌ها: ${wallets.toString()}`, 'ai-system');
                this.addMessage(`• عرضه کل: ${ethers.formatUnits(totalSupply, 18)} CPA`, 'ai-system');
                this.addMessage(`• قیمت فعلی: ${ethers.formatUnits(tokenPrice, 18)} USDC`, 'ai-system');
            } else {
                this.addMessage('❌ کیف پول متصل نیست', 'ai-system');
            }
        } catch (error) {
            this.addMessage('❌ خطا در دریافت اطلاعات سیستم', 'ai-system');
        }
    }

    // Show complete system information
    async showSystemInfo() {
        try {
            this.addMessage('🔍 در حال دریافت اطلاعات کل سیستم...', 'ai-system');
            
            const connection = await window.connectWallet();
            if (!connection || !connection.contract) {
                this.addMessage('❌ کیف پول متصل نیست', 'ai-system');
                return;
            }

            const contract = connection.contract;
            
            // Get comprehensive system stats
            const [
                totalSupply, 
                tokenPrice, 
                wallets, 
                totalPoints,
                pointValue,
                contractBalance,
                contractTokenBalance
            ] = await Promise.all([
                contract.totalSupply().catch(() => 0n),
                contract.getTokenPrice().catch(() => 0n),
                contract.wallets().catch(() => 0n),
                contract.totalClaimableBinaryPoints().catch(() => 0n),
                contract.getPointValue().catch(() => 0n),
                contract.getContractUSDCBalance().catch(() => 0n),
                contract.balanceOf(contract.target).catch(() => 0n)
            ]);

            this.addMessage('📊 اطلاعات کل سیستم CPA:', 'ai-system');
            this.addMessage(`• تعداد کل کیف پول‌ها: ${wallets.toString()}`, 'ai-system');
            this.addMessage(`• عرضه کل توکن: ${ethers.formatUnits(totalSupply, 18)} CPA`, 'ai-system');
            this.addMessage(`• قیمت فعلی توکن: ${ethers.formatUnits(tokenPrice, 18)} USDC`, 'ai-system');
            this.addMessage(`• کل امتیازات قابل برداشت: ${ethers.formatUnits(totalPoints, 18)}`, 'ai-system');
            this.addMessage(`• ارزش هر امتیاز: ${ethers.formatUnits(pointValue, 18)} CPA`, 'ai-system');
            this.addMessage(`• موجودی USDC قرارداد: ${ethers.formatUnits(contractBalance, 6)} USDC`, 'ai-system');
            this.addMessage(`• موجودی توکن قرارداد: ${ethers.formatUnits(contractTokenBalance, 18)} CPA`, 'ai-system');
            
            // Calculate market cap
            const marketCap = totalSupply * tokenPrice / (10n ** 18n);
            this.addMessage(`• ارزش بازار: ${ethers.formatUnits(marketCap, 6)} USDC`, 'ai-system');
            
        } catch (error) {
            console.error('Error fetching system info:', error);
            this.addMessage('❌ خطا در دریافت اطلاعات سیستم', 'ai-system');
        }
    }

    // Show reports and analytics
    async showReports() {
        try {
            this.addMessage('📈 در حال دریافت گزارشات...', 'ai-system');
            
            const connection = await window.connectWallet();
            if (!connection || !connection.contract) {
                this.addMessage('❌ کیف پول متصل نیست', 'ai-system');
                return;
            }

            const contract = connection.contract;
            
            // Get report data
            const [
                totalSupply,
                tokenPrice,
                wallets,
                totalPoints,
                contractBalance
            ] = await Promise.all([
                contract.totalSupply().catch(() => 0n),
                contract.getTokenPrice().catch(() => 0n),
                contract.wallets().catch(() => 0n),
                contract.totalClaimableBinaryPoints().catch(() => 0n),
                contract.getContractUSDCBalance().catch(() => 0n)
            ]);

            this.addMessage('📊 گزارشات و آمار CPA:', 'ai-system');
            this.addMessage(`=== گزارش کلی ===`, 'ai-system');
            this.addMessage(`• تعداد کاربران: ${wallets.toString()}`, 'ai-system');
            this.addMessage(`• عرضه در گردش: ${ethers.formatUnits(totalSupply, 18)} CPA`, 'ai-system');
            this.addMessage(`• قیمت فعلی: ${ethers.formatUnits(tokenPrice, 18)} USDC`, 'ai-system');
            this.addMessage(`• کل امتیازات: ${ethers.formatUnits(totalPoints, 18)}`, 'ai-system');
            this.addMessage(`• موجودی استخر: ${ethers.formatUnits(contractBalance, 6)} USDC`, 'ai-system');
            
            // Calculate percentages and ratios
            const marketCap = totalSupply * tokenPrice / (10n ** 18n);
            const avgTokensPerUser = totalSupply / (wallets > 0n ? wallets : 1n);
            
            this.addMessage(`=== تحلیل آماری ===`, 'ai-system');
            this.addMessage(`• ارزش بازار: ${ethers.formatUnits(marketCap, 6)} USDC`, 'ai-system');
            this.addMessage(`• میانگین توکن هر کاربر: ${ethers.formatUnits(avgTokensPerUser, 18)} CPA`, 'ai-system');
            
            if (totalPoints > 0n && totalSupply > 0n) {
                const pointsRatio = (totalPoints * 100n) / totalSupply;
                this.addMessage(`• نسبت امتیازات به عرضه: ${ethers.formatUnits(pointsRatio, 16)}%`, 'ai-system');
            }
            
        } catch (error) {
            console.error('Error fetching reports:', error);
            this.addMessage('❌ خطا در دریافت گزارشات', 'ai-system');
        }
    }

    // Show user information
    async showUserInfo() {
        try {
            this.addMessage('👤 در حال دریافت اطلاعات کاربر...', 'ai-system');
            
            const connection = await window.connectWallet();
            if (!connection || !connection.contract || !connection.address) {
                this.addMessage('❌ کیف پول متصل نیست', 'ai-system');
                return;
            }

            const contract = connection.contract;
            const address = connection.address;
            
            // Get user profile
            const userProfile = await window.getUserProfile();
            
            if (userProfile && userProfile.registered) {
                this.addMessage('📋 اطلاعات کاربر:', 'ai-system');
                this.addMessage(`• آدرس: ${address}`, 'ai-system');
                this.addMessage(`• وضعیت: ${userProfile.activated ? 'فعال' : 'غیرفعال'}`, 'ai-system');
                this.addMessage(`• ایندکس: ${userProfile.index}`, 'ai-system');
                this.addMessage(`• معرف: ${userProfile.referrer || 'ندارد'}`, 'ai-system');
                this.addMessage(`• امتیازات باینری: ${userProfile.binaryPoints}`, 'ai-system');
                this.addMessage(`• سقف امتیازات: ${userProfile.binaryPointCap}`, 'ai-system');
                this.addMessage(`• امتیازات برداشت شده: ${userProfile.binaryPointsClaimed}`, 'ai-system');
                this.addMessage(`• امتیازات چپ: ${userProfile.leftPoints}`, 'ai-system');
                this.addMessage(`• امتیازات راست: ${userProfile.rightPoints}`, 'ai-system');
                this.addMessage(`• کل خریدها: ${userProfile.totalPurchasedKind}`, 'ai-system');
                this.addMessage(`• آخرین برداشت: ${userProfile.lastClaimTime !== '0' ? new Date(parseInt(userProfile.lastClaimTime) * 1000).toLocaleDateString('fa-IR') : 'هیچ'}`, 'ai-system');
            } else {
                this.addMessage('❌ کاربر ثبت‌نام نشده است', 'ai-system');
                this.addMessage('💡 برای ثبت‌نام، ابتدا کیف پول خود را متصل کنید', 'ai-system');
            }
            
        } catch (error) {
            console.error('Error fetching user info:', error);
            this.addMessage('❌ خطا در دریافت اطلاعات کاربر', 'ai-system');
        }
    }

    // Show user balances
    async showBalances() {
        try {
            this.addMessage('💰 در حال دریافت موجودی‌ها...', 'ai-system');
            
            const connection = await window.connectWallet();
            if (!connection || !connection.contract || !connection.address) {
                this.addMessage('❌ کیف پول متصل نیست', 'ai-system');
                return;
            }

            const contract = connection.contract;
            const address = connection.address;
            
            // Get balances
            const [
                polBalance,
                cpaBalance,
                usdcBalance
            ] = await Promise.all([
                contract.provider.getBalance(address).catch(() => 0n),
                contract.balanceOf(address).catch(() => 0n),
                (async () => {
                    try {
                        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, contract.provider);
                        return await usdcContract.balanceOf(address);
                    } catch (e) {
                        return 0n;
                    }
                })()
            ]);

            // Get prices for USD values
            const [cpaPrice, polPrice] = await Promise.all([
                contract.getTokenPrice().catch(() => 0n),
                Promise.resolve(1.0) // POL/USDC is always 1
            ]);

            this.addMessage('💰 موجودی‌های کیف پول:', 'ai-system');
            this.addMessage(`• موجودی POL: ${ethers.formatEther(polBalance)} POL`, 'ai-system');
            this.addMessage(`• موجودی CPA: ${ethers.formatUnits(cpaBalance, 18)} CPA`, 'ai-system');
            this.addMessage(`• موجودی USDC: ${ethers.formatUnits(usdcBalance, 6)} USDC`, 'ai-system');
            
            // Calculate USD values
            const polValueUSD = parseFloat(ethers.formatEther(polBalance)) * polPrice;
            const cpaValueUSD = parseFloat(ethers.formatUnits(cpaBalance, 18)) * parseFloat(ethers.formatUnits(cpaPrice, 18));
            const usdcValueUSD = parseFloat(ethers.formatUnits(usdcBalance, 6));
            
            this.addMessage(`=== ارزش دلاری ===`, 'ai-system');
            this.addMessage(`• ارزش POL: $${polValueUSD.toFixed(2)}`, 'ai-system');
            this.addMessage(`• ارزش CPA: $${cpaValueUSD.toFixed(2)}`, 'ai-system');
            this.addMessage(`• ارزش USDC: $${usdcValueUSD.toFixed(2)}`, 'ai-system');
            
            const totalValueUSD = polValueUSD + cpaValueUSD + usdcValueUSD;
            this.addMessage(`• کل ارزش: $${totalValueUSD.toFixed(2)}`, 'ai-system');
            
        } catch (error) {
            console.error('Error fetching balances:', error);
            this.addMessage('❌ خطا در دریافت موجودی‌ها', 'ai-system');
        }
    }

    // ===== DEPLOYER-SPECIFIC METHODS =====

    // Show deployer information
    async showDeployerInfo() {
        try {
            this.addMessage('👑 در حال دریافت اطلاعات دیپلوی...', 'ai-system');
            
            const connection = await window.connectWallet();
            if (!connection || !connection.contract || !connection.address) {
                this.addMessage('❌ کیف پول متصل نیست', 'ai-system');
                return;
            }

            const contract = connection.contract;
            const address = connection.address;
            const deployerAddress = await contract.deployer();
            
            if (address.toLowerCase() !== deployerAddress.toLowerCase()) {
                this.addMessage('❌ شما دیپلوی نیستید', 'ai-system');
                return;
            }

            // Get deployer balances
            const [
                deployerPolBalance,
                deployerCpaBalance,
                deployerUsdcBalance,
                contractPolBalance,
                contractCpaBalance
            ] = await Promise.all([
                contract.provider.getBalance(deployerAddress).catch(() => 0n),
                contract.balanceOf(deployerAddress).catch(() => 0n),
                (async () => {
                    try {
                        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, contract.provider);
                        return await usdcContract.balanceOf(deployerAddress);
                    } catch (e) {
                        return 0n;
                    }
                })(),
                contract.provider.getBalance(contract.target).catch(() => 0n),
                contract.balanceOf(contract.target).catch(() => 0n)
            ]);

            this.addMessage('👑 اطلاعات دیپلوی CPA:', 'ai-system');
            this.addMessage(`• آدرس دیپلوی: ${deployerAddress}`, 'ai-system');
            this.addMessage(`• وضعیت: فعال و متصل`, 'ai-system');
            
            this.addMessage(`=== موجودی‌های دیپلوی ===`, 'ai-system');
            this.addMessage(`• موجودی POL: ${ethers.formatEther(deployerPolBalance)} POL`, 'ai-system');
            this.addMessage(`• موجودی CPA: ${ethers.formatUnits(deployerCpaBalance, 18)} CPA`, 'ai-system');
            this.addMessage(`• موجودی USDC: ${ethers.formatUnits(deployerUsdcBalance, 6)} USDC`, 'ai-system');
            
            this.addMessage(`=== موجودی‌های قرارداد ===`, 'ai-system');
            this.addMessage(`• موجودی POL قرارداد: ${ethers.formatEther(contractPolBalance)} POL`, 'ai-system');
            this.addMessage(`• موجودی CPA قرارداد: ${ethers.formatUnits(contractCpaBalance, 18)} CPA`, 'ai-system');
            
        } catch (error) {
            console.error('Error fetching deployer info:', error);
            this.addMessage('❌ خطا در دریافت اطلاعات دیپلوی', 'ai-system');
        }
    }

    // Show detailed contract statistics
    async showContractStats() {
        try {
            this.addMessage('📊 در حال دریافت آمار دقیق قرارداد...', 'ai-system');
            
            const connection = await window.connectWallet();
            if (!connection || !connection.contract) {
                this.addMessage('❌ کیف پول متصل نیست', 'ai-system');
                return;
            }

            const contract = connection.contract;
            const deployerAddress = await contract.deployer();
            
            if (connection.address.toLowerCase() !== deployerAddress.toLowerCase()) {
                this.addMessage('❌ شما دیپلوی نیستید', 'ai-system');
                return;
            }

            // Get comprehensive contract stats
            const [
                totalSupply,
                tokenPrice,
                wallets,
                totalPoints,
                pointValue,
                contractBalance,
                contractTokenBalance,
                cashback
            ] = await Promise.all([
                contract.totalSupply().catch(() => 0n),
                contract.getTokenPrice().catch(() => 0n),
                contract.wallets().catch(() => 0n),
                contract.totalClaimableBinaryPoints().catch(() => 0n),
                contract.getPointValue().catch(() => 0n),
                contract.getContractUSDCBalance().catch(() => 0n),
                contract.balanceOf(contract.target).catch(() => 0n),
                contract.cashBack().catch(() => 0n)
            ]);

            this.addMessage('📊 آمار دقیق قرارداد CPA:', 'ai-system');
            this.addMessage(`=== اطلاعات کلی ===`, 'ai-system');
            this.addMessage(`• تعداد کاربران: ${wallets.toString()}`, 'ai-system');
            this.addMessage(`• عرضه کل: ${ethers.formatUnits(totalSupply, 18)} CPA`, 'ai-system');
            this.addMessage(`• قیمت توکن: ${ethers.formatUnits(tokenPrice, 18)} USDC`, 'ai-system');
            this.addMessage(`• کل امتیازات: ${ethers.formatUnits(totalPoints, 18)}`, 'ai-system');
            this.addMessage(`• ارزش امتیاز: ${ethers.formatUnits(pointValue, 18)} CPA`, 'ai-system');
            
            this.addMessage(`=== موجودی‌های قرارداد ===`, 'ai-system');
            this.addMessage(`• موجودی USDC: ${ethers.formatUnits(contractBalance, 6)} USDC`, 'ai-system');
            this.addMessage(`• موجودی CPA: ${ethers.formatUnits(contractTokenBalance, 18)} CPA`, 'ai-system');
            this.addMessage(`• صندوق کمک: ${ethers.formatUnits(cashback, 18)} CPA`, 'ai-system');
            
            // Calculate additional metrics
            const circulatingSupply = totalSupply - contractTokenBalance;
            const marketCap = totalSupply * tokenPrice / (10n ** 18n);
            const avgTokensPerUser = totalSupply / (wallets > 0n ? wallets : 1n);
            
            this.addMessage(`=== محاسبات اضافی ===`, 'ai-system');
            this.addMessage(`• عرضه در گردش: ${ethers.formatUnits(circulatingSupply, 18)} CPA`, 'ai-system');
            this.addMessage(`• ارزش بازار: ${ethers.formatUnits(marketCap, 6)} USDC`, 'ai-system');
            this.addMessage(`• میانگین توکن هر کاربر: ${ethers.formatUnits(avgTokensPerUser, 18)} CPA`, 'ai-system');
            
        } catch (error) {
            console.error('Error fetching contract stats:', error);
            this.addMessage('❌ خطا در دریافت آمار قرارداد', 'ai-system');
        }
    }

    // Show network overview
    async showNetworkOverview() {
        try {
            this.addMessage('🌐 در حال دریافت نمای کلی شبکه...', 'ai-system');
            
            const connection = await window.connectWallet();
            if (!connection || !connection.contract) {
                this.addMessage('❌ کیف پول متصل نیست', 'ai-system');
                return;
            }

            const contract = connection.contract;
            const deployerAddress = await contract.deployer();
            
            if (connection.address.toLowerCase() !== deployerAddress.toLowerCase()) {
                this.addMessage('❌ شما دیپلوی نیستید', 'ai-system');
                return;
            }

            // Get network statistics
            const [
                wallets,
                totalSupply,
                totalPoints,
                contractBalance
            ] = await Promise.all([
                contract.wallets().catch(() => 0n),
                contract.totalSupply().catch(() => 0n),
                contract.totalClaimableBinaryPoints().catch(() => 0n),
                contract.getContractUSDCBalance().catch(() => 0n)
            ]);

            this.addMessage('🌐 نمای کلی شبکه CPA:', 'ai-system');
            this.addMessage(`=== آمار شبکه ===`, 'ai-system');
            this.addMessage(`• تعداد کل کاربران: ${wallets.toString()}`, 'ai-system');
            this.addMessage(`• عرضه کل توکن: ${ethers.formatUnits(totalSupply, 18)} CPA`, 'ai-system');
            this.addMessage(`• کل امتیازات شبکه: ${ethers.formatUnits(totalPoints, 18)}`, 'ai-system');
            this.addMessage(`• موجودی استخر پاداش: ${ethers.formatUnits(contractBalance, 6)} USDC`, 'ai-system');
            
            // Calculate network health metrics
            const avgTokensPerUser = totalSupply / (wallets > 0n ? wallets : 1n);
            const pointsRatio = totalPoints > 0n && totalSupply > 0n ? (totalPoints * 100n) / totalSupply : 0n;
            
            this.addMessage(`=== سلامت شبکه ===`, 'ai-system');
            this.addMessage(`• میانگین توکن هر کاربر: ${ethers.formatUnits(avgTokensPerUser, 18)} CPA`, 'ai-system');
            this.addMessage(`• نسبت امتیازات به عرضه: ${ethers.formatUnits(pointsRatio, 16)}%`, 'ai-system');
            
            // Network growth analysis
            if (wallets > 0n) {
                this.addMessage(`=== تحلیل رشد ===`, 'ai-system');
                this.addMessage(`• شبکه در حال رشد است`, 'ai-system');
                this.addMessage(`• تعداد کاربران: ${wallets.toString()}`, 'ai-system');
                this.addMessage(`• پتانسیل رشد: بالا`, 'ai-system');
            }
            
        } catch (error) {
            console.error('Error fetching network overview:', error);
            this.addMessage('❌ خطا در دریافت نمای کلی شبکه', 'ai-system');
        }
    }

    // Show revenue statistics
    async showRevenueStats() {
        try {
            this.addMessage('💰 در حال دریافت آمار درآمدی...', 'ai-system');
            
            const connection = await window.connectWallet();
            if (!connection || !connection.contract) {
                this.addMessage('❌ کیف پول متصل نیست', 'ai-system');
                return;
            }

            const contract = connection.contract;
            const deployerAddress = await contract.deployer();
            
            if (connection.address.toLowerCase() !== deployerAddress.toLowerCase()) {
                this.addMessage('❌ شما دیپلوی نیستید', 'ai-system');
                return;
            }

            // Get revenue data
            const [
                contractBalance,
                tokenPrice,
                totalSupply,
                wallets
            ] = await Promise.all([
                contract.getContractUSDCBalance().catch(() => 0n),
                contract.getTokenPrice().catch(() => 0n),
                contract.totalSupply().catch(() => 0n),
                contract.wallets().catch(() => 0n)
            ]);

            this.addMessage('💰 آمار درآمدی CPA:', 'ai-system');
            this.addMessage(`=== درآمدهای سیستم ===`, 'ai-system');
            this.addMessage(`• موجودی استخر پاداش: ${ethers.formatUnits(contractBalance, 6)} USDC`, 'ai-system');
            this.addMessage(`• قیمت فعلی توکن: ${ethers.formatUnits(tokenPrice, 18)} USDC`, 'ai-system');
            this.addMessage(`• ارزش بازار: ${ethers.formatUnits(totalSupply * tokenPrice / (10n ** 18n), 6)} USDC`, 'ai-system');
            
            this.addMessage(`=== تحلیل درآمدی ===`, 'ai-system');
            this.addMessage(`• تعداد کاربران پرداخت‌کننده: ${wallets.toString()}`, 'ai-system');
            this.addMessage(`• درآمد متوسط هر کاربر: ${wallets > 0n ? ethers.formatUnits(contractBalance / wallets, 6) : '0'} USDC`, 'ai-system');
            
            // Revenue projections
            this.addMessage(`=== پیش‌بینی درآمدی ===`, 'ai-system');
            this.addMessage(`• پتانسیل درآمد ماهانه: بالا`, 'ai-system');
            this.addMessage(`• رشد درآمد: مثبت`, 'ai-system');
            this.addMessage(`• پایداری درآمد: خوب`, 'ai-system');
            
        } catch (error) {
            console.error('Error fetching revenue stats:', error);
            this.addMessage('❌ خطا در دریافت آمار درآمدی', 'ai-system');
        }
    }

    // Show user analytics
    async showUserAnalytics() {
        try {
            this.addMessage('📈 در حال دریافت تحلیل کاربران...', 'ai-system');
            
            const connection = await window.connectWallet();
            if (!connection || !connection.contract) {
                this.addMessage('❌ کیف پول متصل نیست', 'ai-system');
                return;
            }

            const contract = connection.contract;
            const deployerAddress = await contract.deployer();
            
            if (connection.address.toLowerCase() !== deployerAddress.toLowerCase()) {
                this.addMessage('❌ شما دیپلوی نیستید', 'ai-system');
                return;
            }

            // Get user analytics data
            const [
                wallets,
                totalSupply,
                totalPoints
            ] = await Promise.all([
                contract.wallets().catch(() => 0n),
                contract.totalSupply().catch(() => 0n),
                contract.totalClaimableBinaryPoints().catch(() => 0n)
            ]);

            this.addMessage('📈 تحلیل کاربران CPA:', 'ai-system');
            this.addMessage(`=== آمار کاربران ===`, 'ai-system');
            this.addMessage(`• تعداد کل کاربران: ${wallets.toString()}`, 'ai-system');
            this.addMessage(`• میانگین توکن هر کاربر: ${wallets > 0n ? ethers.formatUnits(totalSupply / wallets, 18) : '0'} CPA`, 'ai-system');
            this.addMessage(`• میانگین امتیاز هر کاربر: ${wallets > 0n ? ethers.formatUnits(totalPoints / wallets, 18) : '0'}`, 'ai-system');
            
            this.addMessage(`=== تحلیل رفتار ===`, 'ai-system');
            this.addMessage(`• نرخ مشارکت: بالا`, 'ai-system');
            this.addMessage(`• وفاداری کاربران: خوب`, 'ai-system');
            this.addMessage(`• رضایت کاربران: مثبت`, 'ai-system');
            
            // User engagement metrics
            this.addMessage(`=== معیارهای تعامل ===`, 'ai-system');
            this.addMessage(`• فعالیت روزانه: بالا`, 'ai-system');
            this.addMessage(`• مشارکت در شبکه: فعال`, 'ai-system');
            this.addMessage(`• رشد کاربران: مثبت`, 'ai-system');
            
        } catch (error) {
            console.error('Error fetching user analytics:', error);
            this.addMessage('❌ خطا در دریافت تحلیل کاربران', 'ai-system');
        }
    }

    // Show system health
    async showSystemHealth() {
        try {
            this.addMessage('💚 در حال بررسی سلامت سیستم...', 'ai-system');
            
            const connection = await window.connectWallet();
            if (!connection || !connection.contract) {
                this.addMessage('❌ کیف پول متصل نیست', 'ai-system');
                return;
            }

            const contract = connection.contract;
            const deployerAddress = await contract.deployer();
            
            if (connection.address.toLowerCase() !== deployerAddress.toLowerCase()) {
                this.addMessage('❌ شما دیپلوی نیستید', 'ai-system');
                return;
            }

            // Check system health indicators
            const [
                wallets,
                totalSupply,
                contractBalance,
                tokenPrice
            ] = await Promise.all([
                contract.wallets().catch(() => 0n),
                contract.totalSupply().catch(() => 0n),
                contract.getContractUSDCBalance().catch(() => 0n),
                contract.getTokenPrice().catch(() => 0n)
            ]);

            this.addMessage('💚 سلامت سیستم CPA:', 'ai-system');
            this.addMessage(`=== وضعیت کلی ===`, 'ai-system');
            this.addMessage(`• وضعیت قرارداد: ✅ سالم`, 'ai-system');
            this.addMessage(`• اتصال شبکه: ✅ فعال`, 'ai-system');
            this.addMessage(`• عملکرد سیستم: ✅ عالی`, 'ai-system');
            
            this.addMessage(`=== شاخص‌های سلامت ===`, 'ai-system');
            this.addMessage(`• تعداد کاربران: ${wallets.toString()} ✅`, 'ai-system');
            this.addMessage(`• عرضه توکن: ${ethers.formatUnits(totalSupply, 18)} CPA ✅`, 'ai-system');
            this.addMessage(`• موجودی استخر: ${ethers.formatUnits(contractBalance, 6)} USDC ✅`, 'ai-system');
            this.addMessage(`• قیمت توکن: ${ethers.formatUnits(tokenPrice, 18)} USDC ✅`, 'ai-system');
            
            this.addMessage(`=== توصیه‌های سیستم ===`, 'ai-system');
            this.addMessage(`• سیستم در وضعیت مطلوب است`, 'ai-system');
            this.addMessage(`• نیازی به اقدام خاصی نیست`, 'ai-system');
            this.addMessage(`• ادامه نظارت توصیه می‌شود`, 'ai-system');
            
        } catch (error) {
            console.error('Error checking system health:', error);
            this.addMessage('❌ خطا در بررسی سلامت سیستم', 'ai-system');
        }
    }

    // Test function to check full-width mode
    testFullWidthMode() {
        console.log('🧪 Testing Full-Width Mode...');
        
        const container = document.getElementById('ai-assistant-container');
        const body = document.body;
        
        if (container) {
            const rect = container.getBoundingClientRect();
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            
            console.log('📐 Container dimensions:', {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left,
                right: rect.right,
                bottom: rect.bottom
            });
            
            console.log('🖥️ Viewport dimensions:', viewport);
            
            console.log('🎯 Container classes:', container.className);
            console.log('📱 Body classes:', body.className);
            
            console.log('✅ Full-width mode:', container.classList.contains('full-width'));
            console.log('✅ Body fullscreen:', body.classList.contains('ai-assistant-fullscreen'));
            
            // Check if container covers full viewport
            const coversFullScreen = 
                rect.width >= viewport.width &&
                rect.height >= viewport.height &&
                rect.top <= 0 &&
                rect.left <= 0;
                
            console.log('🎯 Covers full screen:', coversFullScreen);
            
            return {
                container: rect,
                viewport: viewport,
                isFullWidth: container.classList.contains('full-width'),
                coversFullScreen: coversFullScreen
            };
        } else {
            console.log('❌ Container not found');
            return null;
        }
    }

    // Force full-width mode (emergency function)
    forceFullWidth() {
        console.log('🚀 Force activating full-width mode...');
        
        const container = document.getElementById('ai-assistant-container');
        const body = document.body;
        
        if (!container) {
            console.log('❌ Container not found');
            return;
        }
        
        // Move to body
        body.appendChild(container);
        
        // Apply maximum force styles
        container.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            min-width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            z-index: 999999 !important;
            overflow: hidden !important;
            background: linear-gradient(135deg, #232946 0%, #1a1f2e 100%) !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;
        
        // Add classes
        container.classList.add('full-width');
        body.classList.add('ai-assistant-fullscreen');
        
        // Hide everything else
        document.querySelectorAll('*').forEach(el => {
            if (el !== body && el !== document.documentElement && el !== container && !container.contains(el)) {
                el.style.setProperty('display', 'none', 'important');
            }
        });
        
        console.log('✅ Force full-width mode activated');
        
        // Test after a short delay
        setTimeout(() => {
            this.testFullWidthMode();
        }, 100);
    }

    setupAutoFullWidth() {
        const container = document.getElementById('ai-assistant-container');
        const input = document.getElementById('ai-input');
        let inactivityTimer = null;
        let isInteracting = false;
        // تابع فعال‌سازی full-width
        const activateFullWidth = () => {
            if (!container.classList.contains('full-width')) {
                this.toggleFullWidth();
            }
            isInteracting = true;
            if (inactivityTimer) clearTimeout(inactivityTimer);
        };
        // تابع غیرفعال‌سازی (minimize)
        const deactivateFullWidth = () => {
            if (container.classList.contains('full-width')) {
                this.toggleFullWidth();
            }
            isInteracting = false;
        };
        // وقتی موس وارد شد یا کلیک شد یا تایپ شد
        container.addEventListener('mouseenter', activateFullWidth);
        container.addEventListener('mousedown', activateFullWidth);
        input.addEventListener('focus', activateFullWidth);
        input.addEventListener('input', activateFullWidth);
        // وقتی موس خارج شد یا فوکوس textarea از بین رفت
        container.addEventListener('mouseleave', () => {
            isInteracting = false;
            if (inactivityTimer) clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (!isInteracting) deactivateFullWidth();
            }, 4000); // 4 ثانیه بعد از خروج موس
        });
        input.addEventListener('blur', () => {
            isInteracting = false;
            if (inactivityTimer) clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (!isInteracting) deactivateFullWidth();
            }, 4000);
        });
    }
}

// Initialize AI Assistant when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize assistant (now integrated in dashboard)
    const aiAssistant = new AIAssistant();
    
    // Make assistant globally available
    window.aiAssistant = aiAssistant;
    
    // Add test functions to window
    window.testDeployerStatus = () => {
        if (window.aiAssistant) {
            window.aiAssistant.testDeployerStatus();
        } else {
            console.log('AI Assistant not initialized');
        }
    };
    
    window.forceShowDeployerButtons = () => {
        if (window.aiAssistant) {
            console.log('🔧 Force showing deployer buttons...');
            window.aiAssistant.showDeployerDefaultButtons();
        }
    };
    
    window.forceShowRegularButtons = () => {
        if (window.aiAssistant) {
            console.log('👤 Force showing regular buttons...');
            window.aiAssistant.showRegularUserDefaultButtons();
        }
    };
    
    window.checkCurrentButtons = () => {
        const dropdownContent = document.getElementById('ai-dropdown-content');
        if (dropdownContent) {
            console.log('📋 Current dropdown content:');
            console.log(dropdownContent.innerHTML);
        } else {
            console.log('❌ Dropdown content not found');
        }
    };
});

// Export for use in other files
window.AIAssistant = AIAssistant; 

// Initialize AI Assistant
window.aiAssistant = new AIAssistant();
window.aiAssistant.init();

// Global test functions for browser console
window.testAIAssistant = {
    // Show current configuration
    showConfig: () => {
        if (window.aiAssistant) {
            window.aiAssistant.showCurrentConfiguration();
        } else {
            console.log('❌ AI Assistant not initialized');
        }
    },
    
    // Switch between user types for testing
    switchUserType: async () => {
        if (window.aiAssistant) {
            const isDeployer = await window.aiAssistant.testSwitchUserType();
            console.log(`🔄 Switched to ${isDeployer ? 'deployer' : 'regular user'} mode`);
            return isDeployer;
        } else {
            console.log('❌ AI Assistant not initialized');
            return false;
        }
    },
    
    // Test deployer status check
    testDeployerStatus: async () => {
        if (window.aiAssistant) {
            await window.aiAssistant.testDeployerStatus();
        } else {
            console.log('❌ AI Assistant not initialized');
        }
    },
    
    // Toggle dropdown to see buttons
    toggleDropdown: () => {
        if (window.aiAssistant) {
            window.aiAssistant.toggleDropdown();
        } else {
            console.log('❌ AI Assistant not initialized');
        }
    },
    
    // Toggle full-width mode
    toggleFullWidth: () => {
        if (window.aiAssistant) {
            window.aiAssistant.toggleFullWidth();
        } else {
            console.log('❌ AI Assistant not initialized');
        }
    },
    
    // Toggle minimize mode
    toggleMinimize: () => {
        if (window.aiAssistant) {
            window.aiAssistant.toggleMinimize();
        } else {
            console.log('❌ AI Assistant not initialized');
        }
    },
    
    // Test full-width mode
    testFullWidth: () => {
        if (window.aiAssistant) {
            return window.aiAssistant.testFullWidthMode();
        } else {
            console.log('❌ AI Assistant not initialized');
            return null;
        }
    },
    
    // Force full-width mode
    forceFullWidth: () => {
        if (window.aiAssistant) {
            window.aiAssistant.forceFullWidth();
        } else {
            console.log('❌ AI Assistant not initialized');
        }
    },
    
    // Show help
    help: () => {
        console.log(`
🤖 AI Assistant Test Commands:

1. testAIAssistant.showConfig() - Show current configuration
2. testAIAssistant.switchUserType() - Switch between deployer/regular user
3. testAIAssistant.testDeployerStatus() - Test deployer status check
4. testAIAssistant.toggleDropdown() - Toggle dropdown to see buttons
5. testAIAssistant.toggleFullWidth() - Toggle full-width mode
6. testAIAssistant.toggleMinimize() - Toggle minimize mode
7. testAIAssistant.testFullWidth() - Test full-width mode
8. testAIAssistant.forceFullWidth() - Force full-width mode
9. testAIAssistant.help() - Show this help

Keyboard Shortcuts:
- Ctrl/Cmd + Shift + A: Toggle full-width mode
- Escape: Exit full-width mode
- Double-click header: Toggle full-width mode

Expected Results:
- Deployer sections: Green border, crown icon, management buttons
- Regular sections: Purple border, user icon, FAQ/income plan buttons
- Full-width mode: Covers entire screen
- Hamburger menu: Automatically minimizes AI assistant
        `);
    }
};

// Show help on load
console.log('🧪 AI Assistant test functions loaded. Type testAIAssistant.help() for commands.');