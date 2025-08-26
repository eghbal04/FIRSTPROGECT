// Mobile Navigation System
class MobileNavigation {
    constructor() {
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        this.createMobileMenu();
        this.bindEvents();
        this.handleResize();
    }

    createMobileMenu() {
        // Create hamburger button
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.className = 'mobile-hamburger';
        hamburgerBtn.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;
        hamburgerBtn.setAttribute('aria-label', 'Toggle mobile menu');

        // Create mobile menu overlay
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu-overlay';
        mobileMenu.innerHTML = `
            <div class="mobile-menu-content">
                <div class="mobile-menu-header">
                    <h3>IAM PHOENIX</h3>
                    <button class="mobile-menu-close" aria-label="Close menu">×</button>
                </div>
                <nav class="mobile-nav">
                    <ul class="mobile-nav-list">
                        <li><a href="index.html" class="mobile-nav-link">🏠 صفحه اصلی</a></li>
                        <li><a href="about.html" class="mobile-nav-link">ℹ️ درباره ما</a></li>
                        <li><a href="register.html" class="mobile-nav-link">📝 ثبت نام</a></li>
                        <li><a href="profile.html" class="mobile-nav-link">👤 پروفایل</a></li>
                        <li><a href="reports.html" class="mobile-nav-link">📊 گزارشات</a></li>
                        <li><a href="professional-tree.html" class="mobile-nav-link">🌳 درخت حرفه‌ای</a></li>
                        <li><a href="transfer-ownership.html" class="mobile-nav-link">🔄 انتقال مالکیت</a></li>
                        <li><a href="utility.html" class="mobile-nav-link">🛠️ ابزارها</a></li>
                    </ul>
                </nav>
                <div class="mobile-menu-footer">
                    <div class="mobile-wallet-info" id="mobile-wallet-info">
                        <span class="mobile-wallet-status">🔗 اتصال کیف پول</span>
                    </div>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(hamburgerBtn);
        document.body.appendChild(mobileMenu);

        // Store references
        this.hamburgerBtn = hamburgerBtn;
        this.mobileMenu = mobileMenu;
        this.menuContent = mobileMenu.querySelector('.mobile-menu-content');
        this.closeBtn = mobileMenu.querySelector('.mobile-menu-close');
    }

    bindEvents() {
        // Hamburger button click
        this.hamburgerBtn.addEventListener('click', () => {
            this.toggleMenu();
        });

        // Close button click
        this.closeBtn.addEventListener('click', () => {
            this.closeMenu();
        });

        // Close menu when clicking outside
        this.mobileMenu.addEventListener('click', (e) => {
            if (e.target === this.mobileMenu) {
                this.closeMenu();
            }
        });

        // Close menu when clicking on nav links
        const navLinks = this.mobileMenu.querySelectorAll('.mobile-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isMenuOpen = true;
        this.mobileMenu.classList.add('active');
        this.hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Update wallet info if available
        this.updateWalletInfo();
    }

    closeMenu() {
        this.isMenuOpen = false;
        this.mobileMenu.classList.remove('active');
        this.hamburgerBtn.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleResize() {
        // Close menu on larger screens
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMenu();
        }
    }

    updateWalletInfo() {
        const walletInfo = document.getElementById('mobile-wallet-info');
        if (!walletInfo) return;

        // Check if wallet is connected
        const isConnected = window.ethereum && window.ethereum.isConnected();
        const walletAddress = localStorage.getItem('walletAddress');

        if (isConnected && walletAddress) {
            const shortAddress = walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
            walletInfo.innerHTML = `
                <span class="mobile-wallet-status connected">✅ متصل</span>
                <span class="mobile-wallet-address">${shortAddress}</span>
            `;
        } else {
            walletInfo.innerHTML = `
                <span class="mobile-wallet-status">🔗 اتصال کیف پول</span>
            `;
        }
    }
}

// Mobile-specific CSS for navigation
const mobileNavStyles = `
<style id="mobile-navigation-styles">
/* Mobile Hamburger Button */
.mobile-hamburger {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    background: linear-gradient(135deg, #232946, #181c2a);
    border: 2px solid rgba(167, 134, 255, 0.3);
    border-radius: 12px;
    width: 50px;
    height: 50px;
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.mobile-hamburger:hover {
    border-color: rgba(0, 255, 136, 0.5);
    box-shadow: 0 6px 20px rgba(0, 255, 136, 0.2);
}

.hamburger-line {
    width: 24px;
    height: 3px;
    background: #00ff88;
    border-radius: 2px;
    transition: all 0.3s ease;
}

.mobile-hamburger.active .hamburger-line:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
}

.mobile-hamburger.active .hamburger-line:nth-child(2) {
    opacity: 0;
}

.mobile-hamburger.active .hamburger-line:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
}

/* Mobile Menu Overlay */
.mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    z-index: 9998;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.mobile-menu-overlay.active {
    opacity: 1;
    visibility: visible;
}

.mobile-menu-content {
    position: absolute;
    top: 0;
    right: 0;
    width: 85%;
    max-width: 350px;
    height: 100%;
    background: linear-gradient(135deg, #232946 0%, #181c2a 100%);
    border-left: 2px solid rgba(0, 255, 136, 0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
}

.mobile-menu-overlay.active .mobile-menu-content {
    transform: translateX(0);
}

/* Mobile Menu Header */
.mobile-menu-header {
    padding: 2rem 1.5rem 1rem;
    border-bottom: 1px solid rgba(167, 134, 255, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.mobile-menu-header h3 {
    color: #00ff88;
    margin: 0;
    font-size: 1.3rem;
    font-weight: bold;
}

.mobile-menu-close {
    background: rgba(255, 68, 68, 0.2);
    border: 1px solid rgba(255, 68, 68, 0.3);
    color: #ff4444;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.5rem;
    transition: all 0.2s ease;
}

.mobile-menu-close:hover {
    background: rgba(255, 68, 68, 0.3);
    transform: scale(1.1);
}

/* Mobile Navigation */
.mobile-nav {
    flex: 1;
    padding: 1rem 0;
    overflow-y: auto;
}

.mobile-nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.mobile-nav-list li {
    margin: 0;
}

.mobile-nav-link {
    display: block;
    padding: 1rem 1.5rem;
    color: #e0e6f7;
    text-decoration: none;
    font-size: 1.1rem;
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(167, 134, 255, 0.1);
}

.mobile-nav-link:hover {
    background: rgba(0, 255, 136, 0.1);
    color: #00ff88;
    padding-right: 2rem;
}

.mobile-nav-link:active {
    background: rgba(0, 255, 136, 0.2);
    transform: scale(0.98);
}

/* Mobile Menu Footer */
.mobile-menu-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(167, 134, 255, 0.2);
    background: rgba(24, 28, 42, 0.5);
}

.mobile-wallet-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    text-align: center;
}

.mobile-wallet-status {
    font-size: 0.9rem;
    color: #a786ff;
}

.mobile-wallet-status.connected {
    color: #00ff88;
}

.mobile-wallet-address {
    font-family: monospace;
    font-size: 0.8rem;
    color: #b8c1ec;
    background: rgba(167, 134, 255, 0.1);
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    border: 1px solid rgba(167, 134, 255, 0.2);
}

/* Responsive adjustments */
@media (max-width: 480px) {
    .mobile-menu-content {
        width: 100%;
        max-width: none;
    }
    
    .mobile-hamburger {
        top: 0.5rem;
        right: 0.5rem;
        width: 45px;
        height: 45px;
    }
    
    .hamburger-line {
        width: 20px;
        height: 2px;
    }
    
    .mobile-menu-header {
        padding: 1.5rem 1rem 0.8rem;
    }
    
    .mobile-menu-header h3 {
        font-size: 1.2rem;
    }
    
    .mobile-nav-link {
        padding: 0.8rem 1rem;
        font-size: 1rem;
    }
}

/* Landscape orientation adjustments */
@media (max-width: 768px) and (orientation: landscape) {
    .mobile-menu-content {
        width: 70%;
    }
    
    .mobile-menu-header {
        padding: 1rem 1.5rem 0.5rem;
    }
    
    .mobile-nav-link {
        padding: 0.6rem 1.5rem;
    }
}

/* Show hamburger only on mobile */
@media (max-width: 768px) {
    .mobile-hamburger {
        display: flex;
    }
    
    /* Hide desktop navigation on mobile - but keep IAM navbar */
    nav:not(.mobile-nav):not(.IAM-navbar),
    .navbar:not(.mobile-nav):not(.IAM-navbar) {
        display: none !important;
    }
}

/* Hide hamburger on desktop */
@media (min-width: 769px) {
    .mobile-hamburger {
        display: none !important;
    }
    
    .mobile-menu-overlay {
        display: none !important;
    }
}

/* Ensure IAM navbar is always visible */
.IAM-navbar {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
}

/* Animation for menu items */
.mobile-nav-list li {
    opacity: 0;
    transform: translateX(20px);
    animation: slideInRight 0.3s ease forwards;
}

.mobile-nav-list li:nth-child(1) { animation-delay: 0.1s; }
.mobile-nav-list li:nth-child(2) { animation-delay: 0.15s; }
.mobile-nav-list li:nth-child(3) { animation-delay: 0.2s; }
.mobile-nav-list li:nth-child(4) { animation-delay: 0.25s; }
.mobile-nav-list li:nth-child(5) { animation-delay: 0.3s; }
.mobile-nav-list li:nth-child(6) { animation-delay: 0.35s; }
.mobile-nav-list li:nth-child(7) { animation-delay: 0.4s; }
.mobile-nav-list li:nth-child(8) { animation-delay: 0.45s; }

@keyframes slideInRight {
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
    .mobile-nav-link:hover {
        background: transparent;
        padding-right: 1.5rem;
    }
    
    .mobile-nav-link:active {
        background: rgba(0, 255, 136, 0.1);
        transform: scale(0.98);
    }
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', mobileNavStyles);

// Initialize mobile navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MobileNavigation();
});

// Export for use in other scripts
window.MobileNavigation = MobileNavigation;
