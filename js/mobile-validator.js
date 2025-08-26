// Mobile Validator - Test and Validate Mobile Responsiveness
class MobileValidator {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.init();
    }

    init() {
        // Run validation after page loads
        setTimeout(() => {
            this.validateMobileResponsiveness();
            this.validateTouchTargets();
            this.validateViewport();
            this.validatePerformance();
            this.validateAccessibility();
            this.reportResults();
        }, 1000);
    }

    validateMobileResponsiveness() {
        // Check if viewport meta tag exists
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            this.addIssue('Missing viewport meta tag');
        } else if (!viewport.content.includes('width=device-width')) {
            this.addIssue('Viewport meta tag missing width=device-width');
        }

        // Check for mobile-responsive CSS
        const mobileCSS = document.querySelector('link[href*="mobile-responsive.css"]');
        if (!mobileCSS) {
            this.addIssue('Mobile responsive CSS not loaded');
        }

        // Check for mobile navigation script
        const mobileNav = document.querySelector('script[src*="mobile-navigation.js"]');
        if (!mobileNav) {
            this.addIssue('Mobile navigation script not loaded');
        }

        // Check for mobile optimizer script
        const mobileOpt = document.querySelector('script[src*="mobile-optimizer.js"]');
        if (!mobileOpt) {
            this.addIssue('Mobile optimizer script not loaded');
        }

        // Validate responsive breakpoints
        this.validateBreakpoints();
    }

    validateBreakpoints() {
        const breakpoints = [
            { name: 'Mobile Small', width: 320, height: 568 },
            { name: 'Mobile Medium', width: 375, height: 667 },
            { name: 'Mobile Large', width: 414, height: 896 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Desktop Small', width: 1024, height: 768 },
            { name: 'Desktop Large', width: 1440, height: 900 }
        ];

        breakpoints.forEach(breakpoint => {
            this.simulateBreakpoint(breakpoint);
        });
    }

    simulateBreakpoint(breakpoint) {
        // Store original dimensions
        const originalWidth = window.innerWidth;
        const originalHeight = window.innerHeight;

        // Simulate breakpoint
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: breakpoint.width
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: breakpoint.height
        });

        // Trigger resize event
        window.dispatchEvent(new Event('resize'));

        // Check for horizontal overflow
        setTimeout(() => {
            const body = document.body;
            const html = document.documentElement;
            const maxWidth = Math.max(
                body.scrollWidth,
                body.offsetWidth,
                html.clientWidth,
                html.scrollWidth,
                html.offsetWidth
            );

            if (maxWidth > breakpoint.width) {
                this.addWarning(`Horizontal overflow detected at ${breakpoint.name} (${breakpoint.width}px)`);
            }

            // Restore original dimensions
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: originalWidth
            });
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: originalHeight
            });

            // Trigger resize event again
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }

    validateTouchTargets() {
        // Check touch target sizes
        const touchElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
        
        touchElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const minSize = 44; // Apple's recommended minimum touch target size

            if (rect.width < minSize || rect.height < minSize) {
                this.addWarning(`Touch target too small: ${element.tagName} (${Math.round(rect.width)}x${Math.round(rect.height)}px)`);
            }

            // Check for proper spacing between touch targets
            const nearbyElements = this.findNearbyElements(element, 8);
            nearbyElements.forEach(nearby => {
                const distance = this.calculateDistance(element, nearby);
                if (distance < 8) {
                    this.addWarning(`Touch targets too close: ${element.tagName} and ${nearby.tagName}`);
                }
            });
        });
    }

    findNearbyElements(element, maxDistance) {
        const nearby = [];
        const rect = element.getBoundingClientRect();
        const allElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');

        allElements.forEach(other => {
            if (other !== element) {
                const otherRect = other.getBoundingClientRect();
                const distance = this.calculateDistance(rect, otherRect);
                if (distance <= maxDistance) {
                    nearby.push(other);
                }
            }
        });

        return nearby;
    }

    calculateDistance(rect1, rect2) {
        const center1 = { x: rect1.left + rect1.width / 2, y: rect1.top + rect1.height / 2 };
        const center2 = { x: rect2.left + rect2.width / 2, y: rect2.top + rect2.height / 2 };
        
        return Math.sqrt(
            Math.pow(center1.x - center2.x, 2) + Math.pow(center1.y - center2.y, 2)
        );
    }

    validateViewport() {
        // Check viewport settings
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            const content = viewport.content;
            
            if (!content.includes('initial-scale=1.0')) {
                this.addWarning('Viewport missing initial-scale=1.0');
            }
            
            if (!content.includes('user-scalable=yes')) {
                this.addWarning('Viewport should allow user scaling for accessibility');
            }
        }

        // Check for safe area support
        const safeAreaCSS = getComputedStyle(document.documentElement).getPropertyValue('--sat');
        if (!safeAreaCSS || safeAreaCSS === '') {
            this.addWarning('Safe area CSS variables not defined for notched devices');
        }
    }

    validatePerformance() {
        // Check for performance issues
        const images = document.querySelectorAll('img');
        let unoptimizedImages = 0;

        images.forEach(img => {
            if (!img.loading || img.loading !== 'lazy') {
                unoptimizedImages++;
            }
            
            if (img.src && img.src.includes('http') && !img.src.includes('data:')) {
                // Check if image is optimized
                if (img.naturalWidth > 1920 || img.naturalHeight > 1080) {
                    this.addWarning(`Large image detected: ${img.src} (${img.naturalWidth}x${img.naturalHeight})`);
                }
            }
        });

        if (unoptimizedImages > 0) {
            this.addWarning(`${unoptimizedImages} images missing lazy loading`);
        }

        // Check for heavy scripts
        const scripts = document.querySelectorAll('script[src]');
        let totalScriptSize = 0;

        scripts.forEach(script => {
            if (script.src.includes('js/')) {
                // Estimate script size (this is a rough estimate)
                totalScriptSize += 50; // Assume average 50KB per script
            }
        });

        if (totalScriptSize > 500) {
            this.addWarning(`Large script bundle detected (estimated ${totalScriptSize}KB)`);
        }
    }

    validateAccessibility() {
        // Check for accessibility issues
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.textContent.trim() && !button.querySelector('img[alt]')) {
                this.addWarning('Button missing accessible text or alt text');
            }
        });

        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.alt && !img.role) {
                this.addWarning('Image missing alt text');
            }
        });

        const links = document.querySelectorAll('a');
        links.forEach(link => {
            if (!link.textContent.trim() && !link.querySelector('img[alt]')) {
                this.addWarning('Link missing accessible text');
            }
        });

        // Check for proper heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            if (level > lastLevel + 1) {
                this.addWarning(`Heading hierarchy skipped: ${heading.tagName} after h${lastLevel}`);
            }
            lastLevel = level;
        });

        // Check for keyboard navigation
        const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
        focusableElements.forEach(element => {
            if (element.tabIndex === -1 && !element.disabled) {
                this.addWarning('Focusable element with tabindex=-1');
            }
        });
    }

    addIssue(message) {
        this.issues.push({
            message,
            timestamp: new Date().toISOString(),
            url: window.location.href
        });
    }

    addWarning(message) {
        this.warnings.push({
            message,
            timestamp: new Date().toISOString(),
            url: window.location.href
        });
    }

    reportResults() {
        if (this.issues.length === 0 && this.warnings.length === 0) {
            console.log('✅ Mobile validation passed - No issues found');
            return;
        }

        console.group('📱 Mobile Validation Report');
        
        if (this.issues.length > 0) {
            console.group('❌ Issues Found:');
            this.issues.forEach(issue => {
                console.error(`• ${issue.message}`);
            });
            console.groupEnd();
        }

        if (this.warnings.length > 0) {
            console.group('⚠️ Warnings:');
            this.warnings.forEach(warning => {
                console.warn(`• ${warning.message}`);
            });
            console.groupEnd();
        }

        console.log(`📊 Summary: ${this.issues.length} issues, ${this.warnings.length} warnings`);
        console.groupEnd();


    }



    // Public method to run validation manually
    static runValidation() {
        return new MobileValidator();
    }
}

// Initialize validation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only run validation in development mode
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' || 
        window.location.hostname.includes('dev') ||
        window.location.search.includes('validate=true')) {
        new MobileValidator();
    }
});

// Export for manual validation
window.MobileValidator = MobileValidator;

// Add validation trigger to window for manual testing
window.validateMobile = () => {
    MobileValidator.runValidation();
};
