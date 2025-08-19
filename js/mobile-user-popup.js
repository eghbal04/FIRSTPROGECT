// نمایش اطلاعات کاربر در موبایل
class MobileUserPopup {
    constructor() {
        this.popup = null;
        this.backdrop = null;
        this.touchStartY = 0;
        this.currentY = 0;
        this.isScrolling = false;
        this.setupPopup();
    }

    setupPopup() {
        // ایجاد پاپ‌آپ اصلی
        this.popup = document.createElement('div');
        this.popup.id = 'user-popup';
        
        // ایجاد backdrop
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
            transition: opacity 0.3s ease;
            z-index: 9998;
            display: none;
        `;
        
        // اضافه کردن به DOM
        document.body.appendChild(this.backdrop);
        document.body.appendChild(this.popup);
        
        // تنظیم event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // کلیک روی backdrop
        this.backdrop.addEventListener('click', () => this.hide());

        // تنظیم gesture برای موبایل با بهبود اسکرول
        this.popup.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
            this.popup.style.transition = 'none';
            this.isScrolling = false;
        });

        this.popup.addEventListener('touchmove', (e) => {
            this.currentY = e.touches[0].clientY;
            const deltaY = this.currentY - this.touchStartY;
            const scrollContainer = this.popup.querySelector('.popup-content');
            
            // بررسی اینکه آیا محتوا قابل اسکرول است
            if (scrollContainer) {
                const isAtTop = scrollContainer.scrollTop === 0;
                const isAtBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight;
                
                // اگر در بالای محتوا هستیم و به پایین می‌کشیم، یا در پایین محتوا هستیم و به بالا می‌کشیم
                if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
                    e.preventDefault();
                    this.popup.style.transform = `translateY(${deltaY}px)`;
                    const opacity = Math.max(0.5 - (deltaY / 1000), 0);
                    this.backdrop.style.opacity = opacity.toString();
                } else {
                    // اجازه اسکرول در محتوا
                    this.isScrolling = true;
                }
            } else {
                // اگر محتوای قابل اسکرول نداریم، فقط اجازه کشیدن به پایین
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
            this.popup.style.transition = 'transform 0.3s ease-out';
            
            // فقط اگر اسکرول نکرده باشیم، پاپ‌آپ را ببندیم
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
            {icon:'🎯', label:'امتیاز باینری', val:user.binaryPoints},
            {icon:'🏆', label:'سقف باینری', val:user.binaryPointCap},
            {icon:'💎', label:'پاداش باینری', val:user.totalMonthlyRewarded},
            {icon:'✅', label:'امتیاز دریافتی', val:user.binaryPointsClaimed},
            {icon:'🤝', label:'درآمد رفرال', val:user.refclimed ? Math.floor(Number(user.refclimed) / 1e18) : 0},
            {icon:'💰', label:'سپرده کل', val:user.depositedAmount ? Math.floor(Number(user.depositedAmount) / 1e18) : 0},
            {icon:'⬅️', label:'امتیاز چپ', val:user.leftPoints},
            {icon:'➡️', label:'امتیاز راست', val:user.rightPoints}
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
                                <span class="label">شناسه کاربر</span>
                                <span class="value" onclick="navigator.clipboard.writeText('${IAMId}')">${IAMId}</span>
                            </div>
                            <div class="user-status ${isActive ? 'active' : 'inactive'}">
                                ${isActive ? '✅ فعال' : '❌ غیرفعال'}
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
                        <div class="balance-title">موجودی‌های زنده</div>
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

        // نمایش پاپ‌آپ و backdrop
        this.backdrop.style.display = 'block';
        this.popup.classList.add('active');
        setTimeout(() => {
            this.backdrop.style.opacity = '0.5';
        }, 50);

        // دریافت موجودی‌های زنده
        this.getLiveBalances(walletAddress);
        
        // تنظیم اندازه اولیه کارت‌ها بر اساس محتوا
        this.adjustCardSizes();
        
        // اضافه کردن event listeners برای کارت‌ها
        this.setupCardEventListeners();
    }

    hide() {
        this.popup.style.transform = 'translateY(100%)';
        this.backdrop.style.opacity = '0';
        
        setTimeout(() => {
            this.popup.classList.remove('active');
            this.backdrop.style.display = 'none';
            this.popup.style.transform = '';
        }, 300);
    }

    shortAddress(addr) {
        if (!addr || addr === '-') return '-';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }

    formatValue(value) {
        if (value === undefined || value === null) return '-';
        
        // تبدیل به عدد
        const numValue = Number(value);
        if (isNaN(numValue)) return value.toString();
        
        // اگر عدد بزرگ است، فرمت مناسب نمایش بده
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
        
        // تنظیم مجدد اندازه کارت‌ها
        this.adjustCardSizes();
    }

    setupCardEventListeners() {
        // اضافه کردن event listener برای کارت‌های آمار
        const statItems = this.popup.querySelectorAll('.stat-item');
        statItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCard(item);
            });
        });
        
        // اضافه کردن event listener برای کارت موجودی‌ها
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
        
        // تنظیم اندازه کارت‌های آمار
        statItems.forEach(item => {
            const valueElement = item.querySelector('.stat-value');
            const content = valueElement.textContent;
            
            // اگر محتوا طولانی است، پیشنهاد expand بده
            if (content.length > 15 || content.includes('K') || content.includes('M')) {
                item.style.cursor = 'pointer';
            }
        });
        
        // تنظیم اندازه کارت موجودی‌ها
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
        if (!address || address === '-') return;

        try {
            // دریافت موجودی IAM
            if (window.contractConfig && window.contractConfig.contract) {
                const { contract } = window.contractConfig;
                const iamBalance = await contract.balanceOf(address);
                const iamElement = document.getElementById('IAM-balance');
                if (iamElement) {
                    iamElement.textContent = this.formatValue(iamBalance);
                }
            }

            // دریافت موجودی MATIC
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const maticBalance = await provider.getBalance(address);
                const maticElement = document.getElementById('matic-balance');
                if (maticElement) {
                    maticElement.textContent = this.formatValue(ethers.utils.formatEther(maticBalance));
                }
            }

            // دریافت موجودی DAI (اگر توکن DAI موجود باشد)
            if (window.contractConfig && window.contractConfig.daiToken) {
                try {
                    const daiBalance = await window.contractConfig.daiToken.balanceOf(address);
                    const daiElement = document.getElementById('dai-balance');
                    if (daiElement) {
                        daiElement.textContent = this.formatValue(ethers.utils.formatEther(daiBalance));
                    }
                } catch (error) {
                    console.warn('Could not fetch DAI balance:', error);
                }
            }
        } catch (error) {
            console.warn('Error fetching live balances:', error);
        }
    }

    // تابع تست برای بررسی عملکرد
    testExpandCollapse() {
        console.log('Testing expand/collapse functionality...');
        
        const statItems = this.popup.querySelectorAll('.stat-item');
        const liveBalances = this.popup.querySelector('#live-balances');
        
        console.log('Found stat items:', statItems.length);
        console.log('Found live balances:', !!liveBalances);
        
        // تست کلیک روی اولین کارت آمار
        if (statItems.length > 0) {
            console.log('Testing first stat item...');
            this.toggleCard(statItems[0]);
        }
        
        // تست کلیک روی کارت موجودی‌ها
        if (liveBalances) {
            console.log('Testing live balances...');
            this.toggleCard(liveBalances);
        }
    }
}

// ایجاد نمونه جهانی
window.mobileUserPopup = new MobileUserPopup();

// اضافه کردن تابع تست به window برای دسترسی از console
window.testMobilePopup = function() {
    if (window.mobileUserPopup) {
        window.mobileUserPopup.testExpandCollapse();
    } else {
        console.log('Mobile popup not initialized');
    }
};

// تابع تست ساده برای بررسی لود شدن
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

// تابع تست برای نمایش پاپ‌آپ با داده‌های نمونه
window.testMobilePopupShow = function() {
    if (!window.mobileUserPopup) {
        console.log('❌ Mobile popup not available');
        return;
    }
    
    console.log('🧪 Showing test mobile popup...');
    
    // داده‌های نمونه برای تست
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
    
    // نمایش پاپ‌آپ
    window.mobileUserPopup.show(testAddress, testUser);
    
    console.log('✅ Test popup should be visible now');
    console.log('💡 Try clicking on the cards to test expand/collapse functionality');
};

// تست خودکار بعد از لود صفحه
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.testMobilePopupLoad();
    }, 2000);
});
