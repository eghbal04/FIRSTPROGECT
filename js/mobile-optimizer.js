// Mobile Optimizer - Enhanced Mobile Experience
class MobileOptimizer {
    constructor() {
        this.isMobile = this.checkMobile();
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.init();
    }

    init() {
        if (this.isMobile) {
            this.setupViewport();
            this.setupTouchHandlers();
            this.setupScrollOptimization();
            this.setupFormOptimization();
            this.setupImageOptimization();
            this.setupPerformanceOptimization();
            this.setupOrientationHandling();
        }
    }

    checkMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    setupViewport() {
        // Ensure proper viewport meta tag
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        // Set optimal viewport settings for mobile
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
        
        // Add safe area support for notched devices
        document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
        document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)');
        document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)');
    }

    setupTouchHandlers() {
        // Prevent double-tap zoom on buttons and links
        const touchElements = document.querySelectorAll('button, a, input, select, textarea');
        touchElements.forEach(element => {
            element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
            element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        });

        // Add touch feedback
        this.addTouchFeedback();
    }

    handleTouchStart(e) {
        this.touchStartY = e.touches[0].clientY;
        this.touchStartX = e.touches[0].clientX;
        
        // Add touch feedback class
        e.target.classList.add('touch-active');
    }

    handleTouchEnd(e) {
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        
        // Remove touch feedback class
        e.target.classList.remove('touch-active');
        
        // Check for swipe gestures
        const deltaY = Math.abs(touchEndY - this.touchStartY);
        const deltaX = Math.abs(touchEndX - this.touchStartX);
        
        if (deltaY > 50 && deltaY > deltaX) {
            // Vertical swipe detected
            if (touchEndY > this.touchStartY) {
                this.handleSwipeDown();
            } else {
                this.handleSwipeUp();
            }
        }
    }

    handleSwipeDown() {
        // Handle swipe down gesture (e.g., close modals, refresh)
        const modals = document.querySelectorAll('.modal, .popup, .mobile-menu-overlay');
        modals.forEach(modal => {
            if (modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    }

    handleSwipeUp() {
        // Handle swipe up gesture (e.g., open menus, show more content)
        // This can be customized based on specific needs
    }

    addTouchFeedback() {
        // Add CSS for touch feedback
        const touchFeedbackCSS = `
            <style id="touch-feedback-styles">
                .touch-active {
                    transform: scale(0.98) !important;
                    opacity: 0.8 !important;
                    transition: all 0.1s ease !important;
                }
                
                /* Prevent text selection on touch */
                * {
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    -khtml-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                }
                
                /* Allow text selection on inputs and textareas */
                input, textarea, [contenteditable] {
                    -webkit-user-select: text;
                    -moz-user-select: text;
                    -ms-user-select: text;
                    user-select: text;
                }
                
                /* Optimize touch targets */
                button, a, input, select, textarea {
                    min-height: 44px;
                    min-width: 44px;
                }
                
                /* Smooth scrolling for touch devices */
                html {
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                }
                
                /* Optimize images for mobile */
                img {
                    max-width: 100%;
                    height: auto;
                }
                
                /* Prevent horizontal scroll */
                body {
                    overflow-x: hidden;
                    width: 100%;
                }
                
                /* Optimize tables for mobile */
                table {
                    display: block;
                    overflow-x: auto;
                    white-space: nowrap;
                }
                
                /* Mobile-friendly form elements */
                input[type="text"], input[type="email"], input[type="password"], 
                input[type="number"], input[type="tel"], input[type="url"],
                textarea, select {
                    font-size: 16px !important;
                    padding: 12px !important;
                    border-radius: 8px !important;
                    border: 1px solid rgba(167, 134, 255, 0.3) !important;
                    background: rgba(255, 255, 255, 0.05) !important;
                    color: #fff !important;
                }
                
                input:focus, textarea:focus, select:focus {
                    outline: none !important;
                    border-color: #00ff88 !important;
                    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1) !important;
                }
                
                /* Mobile-optimized buttons */
                button, .btn {
                    font-size: 16px !important;
                    padding: 12px 20px !important;
                    border-radius: 8px !important;
                    border: none !important;
                    background: linear-gradient(135deg, #00ff88, #a786ff) !important;
                    color: #232946 !important;
                    font-weight: bold !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    min-height: 48px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                
                button:active, .btn:active {
                    transform: scale(0.98) !important;
                    opacity: 0.8 !important;
                }
                
                /* Mobile-friendly cards */
                .card, .about-card, .utility-card {
                    border-radius: 12px !important;
                    padding: 16px !important;
                    margin-bottom: 16px !important;
                    background: rgba(35, 41, 70, 0.8) !important;
                    border: 1px solid rgba(167, 134, 255, 0.2) !important;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
                }
                
                /* Mobile-optimized status bubble */
                #online-session-bubble {
                    position: fixed !important;
                    top: 16px !important;
                    left: 16px !important;
                    right: 16px !important;
                    z-index: 1000 !important;
                    background: linear-gradient(90deg, #00ff88, #a786ff) !important;
                    color: #232946 !important;
                    padding: 12px 16px !important;
                    border-radius: 12px !important;
                    font-size: 14px !important;
                    font-weight: bold !important;
                    box-shadow: 0 4px 16px rgba(0, 255, 136, 0.3) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    flex-wrap: wrap !important;
                    gap: 8px !important;
                }
                
                /* Mobile-friendly tree view */
                .tree-container {
                    padding: 16px !important;
                    margin: 16px !important;
                    border-radius: 12px !important;
                    background: rgba(35, 41, 70, 0.9) !important;
                    border: 1px solid rgba(167, 134, 255, 0.2) !important;
                }
                
                .tree-viewport {
                    max-height: 60vh !important;
                    overflow-y: auto !important;
                    -webkit-overflow-scrolling: touch !important;
                }
                
                /* Mobile-optimized navigation */
                .mobile-nav-link {
                    padding: 16px 20px !important;
                    font-size: 16px !important;
                    border-bottom: 1px solid rgba(167, 134, 255, 0.1) !important;
                    transition: all 0.2s ease !important;
                }
                
                .mobile-nav-link:active {
                    background: rgba(0, 255, 136, 0.1) !important;
                    transform: scale(0.98) !important;
                }
                
                /* Mobile-friendly modals */
                .modal, .popup {
                    width: 95% !important;
                    max-width: 400px !important;
                    margin: 20px auto !important;
                    border-radius: 12px !important;
                    padding: 20px !important;
                }
                
                /* Mobile-optimized loading states */
                .loading {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    padding: 20px !important;
                }
                
                .loading::after {
                    content: '';
                    width: 24px;
                    height: 24px;
                    border: 3px solid rgba(0, 255, 136, 0.3);
                    border-top: 3px solid #00ff88;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Mobile-friendly grid layouts */
                .grid, .about-cards, .utility-grid {
                    display: grid !important;
                    grid-template-columns: 1fr !important;
                    gap: 16px !important;
                }
                
                @media (min-width: 481px) and (max-width: 768px) {
                    .grid, .about-cards, .utility-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                
                @media (min-width: 769px) {
                    .grid, .about-cards, .utility-grid {
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
                    }
                }
                
                /* Mobile-optimized typography */
                h1 { font-size: 24px !important; line-height: 1.2 !important; }
                h2 { font-size: 20px !important; line-height: 1.3 !important; }
                h3 { font-size: 18px !important; line-height: 1.4 !important; }
                p { font-size: 16px !important; line-height: 1.6 !important; }
                
                /* Mobile-friendly spacing */
                .container, .about-section, .register-form {
                    padding: 16px !important;
                    margin: 16px auto !important;
                }
                
                /* Mobile-optimized three buttons */
                .three-buttons-row {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 12px !important;
                }
                
                .three-btn {
                    width: 100% !important;
                    padding: 16px !important;
                    font-size: 16px !important;
                    min-height: 48px !important;
                }
                
                @media (min-width: 481px) and (max-width: 768px) {
                    .three-buttons-row {
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    
                    .three-btn:nth-child(3) {
                        grid-column: 1 / -1 !important;
                    }
                }
                
                @media (min-width: 769px) {
                    .three-buttons-row {
                        flex-direction: row !important;
                    }
                    
                    .three-btn {
                        flex: 1 !important;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', touchFeedbackCSS);
    }

    setupScrollOptimization() {
        // Optimize scrolling performance
        document.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16), { passive: true });
        
        // Add scroll restoration for better UX
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }

    handleScroll() {
        // Handle scroll events with throttling for performance
        // This can be used for scroll-based animations or effects
    }

    setupFormOptimization() {
        // Optimize form inputs for mobile
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // Prevent zoom on focus for iOS
            if (input.type !== 'file') {
                input.addEventListener('focus', () => {
                    input.style.fontSize = '16px';
                });
            }
            
            // Add mobile-friendly validation
            input.addEventListener('invalid', this.handleInvalidInput.bind(this));
        });
    }

    handleInvalidInput(e) {
        // Custom validation handling for mobile
        e.preventDefault();
        e.target.classList.add('invalid');
        
        // Show mobile-friendly error message
        this.showMobileError(e.target, e.target.validationMessage);
    }

    showMobileError(input, message) {
        // Remove existing error
        const existingError = input.parentNode.querySelector('.mobile-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error element
        const error = document.createElement('div');
        error.className = 'mobile-error';
        error.textContent = message;
        error.style.cssText = `
            color: #ff4444;
            font-size: 14px;
            margin-top: 4px;
            padding: 8px;
            background: rgba(255, 68, 68, 0.1);
            border: 1px solid rgba(255, 68, 68, 0.3);
            border-radius: 6px;
        `;
        
        input.parentNode.appendChild(error);
        
        // Remove error after 3 seconds
        setTimeout(() => {
            if (error.parentNode) {
                error.remove();
            }
            input.classList.remove('invalid');
        }, 3000);
    }

    setupImageOptimization() {
        // Optimize images for mobile
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Add lazy loading for better performance
            if (!img.loading) {
                img.loading = 'lazy';
            }
            
            // Add error handling
            img.addEventListener('error', () => {
                img.style.display = 'none';
            });
        });
    }

    setupPerformanceOptimization() {
        // Optimize performance for mobile devices
        this.debounceResize();
        this.optimizeAnimations();
    }

    debounceResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    handleResize() {
        // Handle resize events with debouncing
        this.isMobile = this.checkMobile();
        
        // Update mobile-specific styles
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
        } else {
            document.body.classList.remove('mobile-device');
        }
    }

    optimizeAnimations() {
        // Reduce animations on mobile for better performance
        if (this.isMobile && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.style.setProperty('--animation-duration', '0.1s');
        }
    }

    setupOrientationHandling() {
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
    }

    handleOrientationChange() {
        // Handle orientation change events
        const isLandscape = window.innerWidth > window.innerHeight;
        
        if (isLandscape) {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        } else {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        }
        
        // Trigger resize event
        window.dispatchEvent(new Event('resize'));
    }

    // Utility functions
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
}

// Initialize mobile optimizer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MobileOptimizer();
});

// Export for use in other scripts
window.MobileOptimizer = MobileOptimizer;
