// Simple Floating AI Assistant - Guaranteed to work
class SimpleFloatingAI {
    constructor() {
        this.isVisible = false;
        this.isInitialized = false;
        console.log('🤖 SimpleFloatingAI constructor called');
        this.init();
    }
    
    init() {
        try {
            console.log('🚀 Initializing Simple Floating AI...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.createButton();
                    this.isInitialized = true;
                    console.log('✅ Simple Floating AI initialized successfully');
                });
            } else {
                this.createButton();
                this.isInitialized = true;
                console.log('✅ Simple Floating AI initialized successfully');
            }
        } catch (error) {
            console.error('❌ Error initializing Simple Floating AI:', error);
        }
    }
    
    createButton() {
        console.log('🔨 Creating simple AI button...');
        
        // Remove existing button if it exists
        const existingButton = document.getElementById('simple-ai-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Create button with inline styles
        const button = document.createElement('div');
        button.id = 'simple-ai-button';
        button.innerHTML = '🤖';
        button.title = 'دستیار هوشمند CPA';
        
        // Inline styles for guaranteed visibility
        Object.assign(button.style, {
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #00ff88, #a786ff)',
            borderRadius: '50%',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0, 255, 136, 0.3), 0 0 0 2px rgba(167, 134, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: '#1a1f2e',
            fontWeight: 'bold',
            zIndex: '999999',
            transition: 'all 0.3s ease',
            visibility: 'visible',
            opacity: '1'
        });
        
        // Add hover effect
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateX(-50%) scale(1.1)';
            button.style.boxShadow = '0 12px 40px rgba(0, 255, 136, 0.4), 0 0 0 3px rgba(167, 134, 255, 0.3)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateX(-50%) scale(1)';
            button.style.boxShadow = '0 8px 32px rgba(0, 255, 136, 0.3), 0 0 0 2px rgba(167, 134, 255, 0.2)';
        });
        
        // Add click handler
        button.addEventListener('click', () => {
            this.handleClick();
        });
        
        // Add to page
        document.body.appendChild(button);
        this.isVisible = true;
        console.log('✅ Simple AI button created and visible');
        
        // Add floating animation
        this.startFloatingAnimation(button);
    }
    
    startFloatingAnimation(button) {
        let direction = 1;
        let offset = 0;
        
        const animate = () => {
            offset += 0.5 * direction;
            if (offset > 8) direction = -1;
            if (offset < -8) direction = 1;
            
            button.style.transform = `translateX(-50%) translateY(${offset}px)`;
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    handleClick() {
        console.log('🎯 Simple AI button clicked!');
        
        // Show a simple alert for now
        const message = 'سلام! من دستیار هوشمند CPA هستم. 🤖\n\nمی‌تونم در موارد زیر کمکتون کنم:\n• خرید و فروش توکن\n• بررسی موجودی\n• آمار شبکه\n• راهنمایی\n\nبرای استفاده کامل، به نسخه پیشرفته مراجعه کنید.';
        
        // Create a simple modal
        this.showSimpleModal(message);
    }
    
    showSimpleModal(message) {
        // Remove existing modal
        const existingModal = document.getElementById('simple-ai-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'simple-ai-modal';
        
        // Modal styles
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '999998'
        });
        
        // Modal content
        const content = document.createElement('div');
        Object.assign(content.style, {
            background: 'linear-gradient(135deg, #232946 0%, #1a1f2e 100%)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            color: '#fff',
            fontFamily: 'Noto Sans Arabic, sans-serif',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(0, 255, 136, 0.3)'
        });
        
        content.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🤖</div>
            <h3 style="color: #00ff88; margin-bottom: 1rem;">دستیار هوشمند CPA</h3>
            <div style="white-space: pre-line; line-height: 1.6; margin-bottom: 2rem;">${message}</div>
            <button id="simple-ai-close" style="
                background: linear-gradient(135deg, #00ff88, #a786ff);
                border: none;
                border-radius: 25px;
                padding: 12px 30px;
                color: #1a1f2e;
                font-weight: bold;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.3s ease;
            ">باشه، متوجه شدم</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close button handler
        document.getElementById('simple-ai-close').addEventListener('click', () => {
            modal.remove();
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    show() {
        const button = document.getElementById('simple-ai-button');
        if (button) {
            button.style.visibility = 'visible';
            button.style.opacity = '1';
            this.isVisible = true;
            console.log('✅ Simple AI button shown');
        }
    }
    
    hide() {
        const button = document.getElementById('simple-ai-button');
        if (button) {
            button.style.visibility = 'hidden';
            button.style.opacity = '0';
            this.isVisible = false;
            console.log('🙈 Simple AI button hidden');
        }
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
}

// Create global instance
window.simpleAI = new SimpleFloatingAI(); 