// Three-State Floating AI Assistant - Like Apple Siri
class FloatingAIAssistant {
    constructor() {
        this.apiKey = 'sk-6074908ce7954bd89d494d57651392a8';
        this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        this.isListening = false;
        this.currentState = 'idle'; // 'idle', 'message', 'full'
        this.isDeployer = false;
        this.conversationHistory = [];
        this.recognition = null;
        this.synthesis = null;
        this.messageQueue = [];
        this.isProcessingMessage = false;
        this.isInitialized = false;
        

        this.init();
    }
    
    init() {
        try {
            console.log('🔧 Initializing Floating AI Assistant...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                console.log('⏳ DOM still loading, waiting...');
                document.addEventListener('DOMContentLoaded', () => {
                    this.initializeComponents();
                });
            } else {
                console.log('✅ DOM already ready');
                this.initializeComponents();
            }
        } catch (error) {
            console.error('❌ Error initializing Floating AI Assistant:', error);
        }
    }
    
    initializeComponents() {
        try {
            console.log('🔧 Creating elements...');
            this.createElements();
            
            console.log('🔧 Binding events...');
            this.bindEvents();
            
            console.log('🔧 Checking deployer status...');
            this.checkDeployerStatus();
            
            console.log('🔧 Initializing speech recognition...');
            this.initSpeechRecognition();
            
            console.log('🔧 Initializing speech synthesis...');
            this.initSpeechSynthesis();
            
            console.log('🔧 Starting idle animation...');
            this.startIdleAnimation();
            
            this.isInitialized = true;
            console.log('✅ Floating AI Assistant initialized successfully!');
            
        } catch (error) {
            console.error('❌ Error in initializeComponents:', error);
        }
    }
    
    createElements() {

        
        // Remove existing elements if they exist
        const existingElements = document.querySelectorAll('#floating-ai-idle, #floating-ai-message, #floating-ai-full');
        existingElements.forEach(el => el.remove());
        
        this.createIdleButton();
        this.createMessageInterface();
        this.createFullInterface();
        

    }
    
    // Create idle state button (like Siri)
    createIdleButton() {
        const button = document.createElement('div');
        button.id = 'floating-ai-idle';
        button.className = 'ai-state ai-idle';
        button.innerHTML = `
            <div class="ai-idle-inner">
                <div class="ai-idle-icon" style="display:flex;align-items:center;justify-content:center;">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="siri-gradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stop-color="#00ff88"/>
                          <stop offset="50%" stop-color="#a786ff"/>
                          <stop offset="100%" stop-color="#00cfff"/>
                        </linearGradient>
                      </defs>
                      <circle cx="16" cy="16" r="14" fill="url(#siri-gradient)" opacity="0.18"/>
                      <path d="M10 16 Q16 8 22 16 Q16 24 10 16" stroke="url(#siri-gradient)" stroke-width="2.5" fill="none"/>
                      <path d="M12 16 Q16 12 20 16 Q16 20 12 16" stroke="white" stroke-width="1.5" fill="none" opacity="0.7"/>
                    </svg>
                </div>
                <div class="ai-idle-pulse"></div>
                <div class="ai-idle-ripple"></div>
            </div>
        `;
        document.body.appendChild(button);

    }
    
    // Create message state interface (single-line)
    createMessageInterface() {
        const messageInterface = document.createElement('div');
        messageInterface.id = 'floating-ai-message';
        messageInterface.className = 'ai-state ai-message';
        messageInterface.innerHTML = `
            <div class="ai-message-container">
                <div class="ai-message-input-group" style="direction:rtl;">
                    <button class="ai-message-close" id="ai-message-close" title="بستن" aria-label="بستن">✕</button>
                    <button class="ai-message-options" id="ai-message-options" title="گزینه‌ها" aria-label="گزینه‌ها">⋮</button>
                    <button class="ai-message-expand" id="ai-message-expand" title="گسترش" aria-label="گسترش">⤢</button>
                    <button class="ai-message-voice" id="ai-message-voice" title="میکروفون" aria-label="میکروفون">🎤</button>
                    <button class="ai-message-send" id="ai-message-send" title="ارسال" aria-label="ارسال">📤</button>
                    <input type="text" id="ai-message-input" placeholder="پیام خود را بنویسید..." />
                </div>
                <div class="ai-message-preview" id="ai-message-preview"></div>
                <div class="ai-message-default-info" id="ai-message-default-info" style="padding:0.7rem 1rem 1.2rem 1rem;">
                  <div style="color:#00ff88;font-weight:bold;font-size:1.05rem;margin-bottom:0.3rem;">👋 به دستیار هوشمند CPA خوش آمدید!</div>
                  <ul style="list-style:none;padding:0;margin:0 0 0.5rem 0;">
                    <li style="margin-bottom:0.2rem;">• <b>خرید و فروش توکن</b></li>
                    <li style="margin-bottom:0.2rem;">• <b>بررسی موجودی و آمار شبکه</b></li>
                    <li style="margin-bottom:0.2rem;">• <b>آموزش و راهنما</b></li>
                    <li style="margin-bottom:0.2rem;">• <b>دسترسی سریع به فروشگاه و اخبار</b></li>
                  </ul>
                  <div style="font-size:0.95rem;color:#a786ff;">یک سوال بپرسید یا روی میکروفون بزنید!</div>
                </div>
                <div class="ai-message-options-menu" id="ai-message-options-menu" style="display:none;position:absolute;bottom:60px;left:50%;transform:translateX(-50%);background:#232946;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);padding:0.7rem 0.5rem;z-index:9999999;min-width:180px;">
                  <div id="ai-quick-info" style="padding:0.5rem 0.5rem 0.7rem 0.5rem;text-align:center;font-size:0.98rem;color:#00ff88;"></div>
                  <button class="ai-quick-btn" data-action="buy-tokens">💰 خرید توکن</button>
                  <button class="ai-quick-btn" data-action="check-balance">💳 موجودی</button>
                  <button class="ai-quick-btn" data-action="network-stats">🌐 آمار شبکه</button>
                  <button class="ai-quick-btn" data-action="help">❓ راهنما</button>
                  <button class="ai-quick-btn" data-action="shop">🛒 فروشگاه</button>
                  <button class="ai-quick-btn" data-action="news">📰 اخبار</button>
                </div>
            </div>
        `;
        document.body.appendChild(messageInterface);

        // Add dynamic info update for quick menu
        const optionsBtn = messageInterface.querySelector('#ai-message-options');
        const optionsMenu = messageInterface.querySelector('#ai-message-options-menu');
        const quickInfo = messageInterface.querySelector('#ai-quick-info');
        if (optionsBtn && optionsMenu && quickInfo) {
            optionsBtn.addEventListener('click', async () => {
                // Show loading
                quickInfo.innerHTML = '<span style="color:#a786ff">در حال دریافت اطلاعات...</span>';
                // Try to get balance and stats
                try {
                    let infoHtml = '';
                    if (window.getUserProfile) {
                        const profile = await window.getUserProfile();
                        infoHtml += `<div style=\"margin-bottom:0.2rem;\">💳 <b>CPA:</b> <span style=\"color:#fff\">${profile.lvlBalance}</span></div>`;
                        infoHtml += `<div style=\"margin-bottom:0.2rem;\">💵 <b>USDC:</b> <span style=\"color:#fff\">${profile.usdcBalance}</span></div>`;
                        infoHtml += `<div style=\"margin-bottom:0.2rem;\">🟣 <b>POL:</b> <span style=\"color:#fff\">${profile.polBalance}</span></div>`;
                    }
                    if (window.getContractStats) {
                        const stats = await window.getContractStats();
                        infoHtml += `<div style=\"margin-bottom:0.2rem;\">🌐 <b>شبکه:</b> <span style=\"color:#fff\">Polygon</span></div>`;
                        infoHtml += `<div style=\"margin-bottom:0.2rem;\">📊 <b>کل عرضه:</b> <span style=\"color:#fff\">${stats.totalSupply}</span></div>`;
                        infoHtml += `<div style=\"margin-bottom:0.2rem;\">🎯 <b>کل پوینت‌ها:</b> <span style=\"color:#fff\">${stats.totalPoints}</span></div>`;
                    }
                    if (!infoHtml) infoHtml = '<span style="color:#ff6b6b">اتصال برقرار نیست</span>';
                    quickInfo.innerHTML = infoHtml;
                } catch (e) {
                    quickInfo.innerHTML = '<span style="color:#ff6b6b">خطا در دریافت اطلاعات</span>';
                }
            });
        }
    }
    
    // Create full state interface
    createFullInterface() {
        const fullInterface = document.createElement('div');
        fullInterface.id = 'floating-ai-full';
        fullInterface.className = 'ai-state ai-full';
        fullInterface.innerHTML = `
            <div class="ai-full-container">
                <div class="ai-full-header">
                    <div class="ai-full-title">
                        <span class="ai-full-icon">🤖</span>
                        <span class="ai-full-text">دستیار هوشمند CPA</span>
                    </div>
                    <div class="ai-full-controls">
                        <button class="ai-full-minimize" id="ai-full-minimize">⤢</button>
                        <button class="ai-full-close" id="ai-full-close">✕</button>
                    </div>
                </div>
                
                <div class="ai-full-body">
                    <div class="ai-full-messages" id="ai-full-messages">
                        <div class="ai-full-welcome">
                            <div class="ai-welcome-icon">👋</div>
                            <div class="ai-welcome-text">
                                سلام! من دستیار هوشمند CPA هستم. می‌تونم در همه زمینه‌ها کمکتون کنم:
                            </div>
                            <div class="ai-welcome-capabilities">
                                <div class="ai-capability">💰 خرید و فروش توکن</div>
                                <div class="ai-capability">🌐 مدیریت شبکه</div>
                                <div class="ai-capability">📊 گزارشات و آمار</div>
                                <div class="ai-capability">🎓 آموزش و راهنما</div>
                                <div class="ai-capability">🛒 فروشگاه</div>
                                <div class="ai-capability">📰 اخبار و تحلیل</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ai-full-input-section">
                        <div class="ai-full-input-container">
                            <textarea id="ai-full-input" placeholder="سوال خود را بپرسید یا دستور دهید..." rows="1"></textarea>
                            <button class="ai-full-send" id="ai-full-send">📤</button>
                            <button class="ai-full-voice" id="ai-full-voice">🎤</button>
                        </div>
                        <div class="ai-full-quick-actions">
                            <button class="ai-quick-action" data-action="buy-tokens">💰 خرید توکن</button>
                            <button class="ai-quick-action" data-action="check-balance">💳 موجودی</button>
                            <button class="ai-quick-action" data-action="network-stats">🌐 آمار شبکه</button>
                            <button class="ai-quick-action" data-action="help">❓ راهنما</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(fullInterface);

    }
    
    // Initialize speech recognition
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'fa-IR';
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleVoiceInput(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopListening();
            };
        }
    }
    
    // Initialize speech synthesis
    initSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
        }
    }
    
    // Bind all events
    bindEvents() {
        try {
            // Idle button click
            const idleBtn = document.getElementById('floating-ai-idle');
            if (idleBtn) {
                idleBtn.addEventListener('click', () => {
                    console.log('🎯 Idle button clicked');
                    this.switchToMessageState();
                });
            } else {
                console.error('❌ Idle button not found');
            }
            
            // Message state events
            const messageInput = document.getElementById('ai-message-input');
            if (messageInput) {
                messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.sendMessageFromMessageState();
                    }
                });
            }
            
            const messageSendBtn = document.getElementById('ai-message-send');
            if (messageSendBtn) {
                messageSendBtn.addEventListener('click', () => {
                    console.log('📤 Message send clicked');
                    this.sendMessageFromMessageState();
                });
            }
            
            const messageVoiceBtn = document.getElementById('ai-message-voice');
            if (messageVoiceBtn) {
                messageVoiceBtn.addEventListener('click', () => {
                    console.log('🎤 Message voice clicked');
                    this.toggleVoiceInput();
                });
            }
            
            const messageExpandBtn = document.getElementById('ai-message-expand');
            if (messageExpandBtn) {
                messageExpandBtn.addEventListener('click', () => {
                    console.log('⤢ Message expand clicked');
                    this.switchToFullState();
                });
            }
            
            const messageCloseBtn = document.getElementById('ai-message-close');
            if (messageCloseBtn) {
                messageCloseBtn.addEventListener('click', () => {
                    console.log('✕ Message close clicked');
                    this.switchToIdleState();
                });
            }

            // دکمه option
            const messageOptionsBtn = document.getElementById('ai-message-options');
            if (messageOptionsBtn) {
                messageOptionsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('⋮ Message options clicked');
                    const menu = document.getElementById('ai-message-options-menu');
                    if (menu) {
                        if (menu.style.display === 'block') {
                            menu.style.display = 'none';
                        } else {
                            menu.style.display = 'block';
                        }
                    }
                });
            }
            
            // بستن منو با کلیک بیرون
            document.addEventListener('click', (e) => {
                const menu = document.getElementById('ai-message-options-menu');
                const btn = document.getElementById('ai-message-options');
                if (menu && btn && menu.style.display === 'block' && !menu.contains(e.target) && e.target !== btn) {
                    menu.style.display = 'none';
                }
            });
            
            // رویداد دکمه‌های منو
            setTimeout(() => {
                document.querySelectorAll('.ai-quick-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const action = e.target.dataset.action;
                        console.log('🔘 Quick button clicked:', action);
                        this.handleQuickAction(action);
                        // بستن منو بعد از انتخاب
                        const menu = document.getElementById('ai-message-options-menu');
                        if (menu) menu.style.display = 'none';
                    });
                });
            }, 100);
            
            // Full state events
            const fullInput = document.getElementById('ai-full-input');
            if (fullInput) {
                fullInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendMessageFromFullState();
                    }
                });
                
                fullInput.addEventListener('input', (e) => {
                    this.autoResizeTextarea(e.target);
                });
            }
            
            const fullSendBtn = document.getElementById('ai-full-send');
            if (fullSendBtn) {
                fullSendBtn.addEventListener('click', () => {
                    console.log('📤 Full send clicked');
                    this.sendMessageFromFullState();
                });
            }
            
            const fullVoiceBtn = document.getElementById('ai-full-voice');
            if (fullVoiceBtn) {
                fullVoiceBtn.addEventListener('click', () => {
                    console.log('🎤 Full voice clicked');
                    this.toggleVoiceInput();
                });
            }
            
            const fullMinimizeBtn = document.getElementById('ai-full-minimize');
            if (fullMinimizeBtn) {
                fullMinimizeBtn.addEventListener('click', () => {
                    console.log('⤢ Full minimize clicked');
                    this.switchToMessageState();
                });
            }
            
            const fullCloseBtn = document.getElementById('ai-full-close');
            if (fullCloseBtn) {
                fullCloseBtn.addEventListener('click', () => {
                    console.log('✕ Full close clicked');
                    this.switchToIdleState();
                });
            }
            
            // Quick actions
            setTimeout(() => {
                document.querySelectorAll('.ai-quick-action').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const action = e.target.dataset.action;
                        console.log('🔘 Quick action clicked:', action);
                        this.handleQuickAction(action);
                    });
                });
            }, 100);
            
            console.log('✅ All events bound successfully');
            
        } catch (error) {
            console.error('❌ Error binding events:', error);
        }
    }
    
    // State management
    switchToIdleState() {

        this.currentState = 'idle';
        this.hideAllStates();
        
        const idleElement = document.getElementById('floating-ai-idle');
        if (idleElement) {
            idleElement.style.display = 'flex';
            idleElement.style.visibility = 'visible';
            idleElement.style.opacity = '1';
    
        } else {
            console.error('❌ Idle element not found');
        }
        
        this.startIdleAnimation();
    }
    
    // هنگام نمایش حالت پیام، اطلاعات عمومی را نشان بده
    switchToMessageState() {

        this.currentState = 'message';
        this.hideAllStates();
        const messageElement = document.getElementById('floating-ai-message');
        if (messageElement) {
            messageElement.style.display = 'flex';
            messageElement.style.visibility = 'visible';
            messageElement.style.opacity = '1';
            // نمایش اطلاعات عمومی پیشفرض
            const info = document.getElementById('ai-message-default-info');
            if (info) info.style.display = 'block';
    
        } else {
            console.error('❌ Message element not found');
        }
        const input = document.getElementById('ai-message-input');
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
        this.stopIdleAnimation();
    }
    
    switchToFullState() {

        this.currentState = 'full';
        this.hideAllStates();
        
        const fullElement = document.getElementById('floating-ai-full');
        if (fullElement) {
            fullElement.style.display = 'flex';
            fullElement.style.visibility = 'visible';
            fullElement.style.opacity = '1';
    
        } else {
            console.error('❌ Full element not found');
        }
        
        const input = document.getElementById('ai-full-input');
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
        
        this.stopIdleAnimation();
    }
    
    hideAllStates() {

        document.querySelectorAll('.ai-state').forEach(state => {
            state.style.display = 'none';
            state.style.visibility = 'hidden';
            state.style.opacity = '0';
        });
    }
    
    // Animation control
    startIdleAnimation() {
        const idleButton = document.getElementById('floating-ai-idle');
        if (idleButton) {
            idleButton.classList.add('ai-idle-animating');
        }
    }
    
    stopIdleAnimation() {
        const idleButton = document.getElementById('floating-ai-idle');
        if (idleButton) {
            idleButton.classList.remove('ai-idle-animating');
        }
    }
    
    // Message handling
    async sendMessageFromMessageState() {
        const input = document.getElementById('ai-message-input');
        const message = input.value.trim();
        if (!message) return;
        input.value = '';
        // مخفی کردن اطلاعات عمومی
        const info = document.getElementById('ai-message-default-info');
        if (info) info.style.display = 'none';
        this.addMessageToQueue(message);
        await this.processMessageQueue();
    }
    
    async sendMessageFromFullState() {
        const input = document.getElementById('ai-full-input');
        const message = input.value.trim();
        if (!message) return;
        
        input.value = '';
        this.autoResizeTextarea(input);
        this.addMessageToQueue(message);
        await this.processMessageQueue();
    }
    
    addMessageToQueue(message) {
        this.messageQueue.push(message);
    }
    
    async processMessageQueue() {
        if (this.isProcessingMessage || this.messageQueue.length === 0) return;
        
        this.isProcessingMessage = true;
        
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            await this.processMessage(message);
        }
        
        this.isProcessingMessage = false;
    }
    
    async processMessage(message) {
        // Add user message to UI
        this.addMessageToUI(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator(true);
        
        try {
            // Get AI response
            const response = await this.getAIResponse(message);
            
            // Hide typing indicator
            this.showTypingIndicator(false);
            
            // Add AI response to UI
            this.addMessageToUI(response, 'ai');
            
            // Speak response if in message state
            if (this.currentState === 'message') {
                this.speak(response);
            }
            
        } catch (error) {
            this.showTypingIndicator(false);
            this.addMessageToUI('متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.', 'error');
        }
    }
    
    addMessageToUI(content, type) {
        if (this.currentState === 'message') {
            this.addMessageToMessageState(content, type);
        } else if (this.currentState === 'full') {
            this.addMessageToFullState(content, type);
        }
    }
    
    addMessageToMessageState(content, type) {
        const preview = document.getElementById('ai-message-preview');
        if (type === 'user') {
            preview.textContent = `شما: ${content}`;
        } else if (type === 'ai') {
            preview.textContent = `دستیار: ${content}`;
        } else {
            preview.textContent = content;
        }
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (this.currentState === 'message') {
                preview.textContent = '';
            }
        }, 5000);
    }
    
    addMessageToFullState(content, type) {
        const messagesContainer = document.getElementById('ai-full-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-full-message ai-full-message-${type}`;
        
        const icon = type === 'user' ? '👤' : '🤖';
        const alignment = type === 'user' ? 'right' : 'left';
        
        messageDiv.innerHTML = `
            <div class="ai-full-message-content" style="text-align: ${alignment}">
                <div class="ai-full-message-icon">${icon}</div>
                <div class="ai-full-message-text">${this.escapeHtml(content)}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Remove welcome message if it exists
        const welcome = messagesContainer.querySelector('.ai-full-welcome');
        if (welcome) {
            welcome.remove();
        }
    }
    
    showTypingIndicator(show) {
        if (this.currentState === 'message') {
            const preview = document.getElementById('ai-message-preview');
            if (show) {
                preview.textContent = 'دستیار در حال تایپ...';
            }
        } else if (this.currentState === 'full') {
            const messagesContainer = document.getElementById('ai-full-messages');
            let typingIndicator = messagesContainer.querySelector('.ai-typing-indicator');
            
            if (show && !typingIndicator) {
                typingIndicator = document.createElement('div');
                typingIndicator.className = 'ai-typing-indicator';
                typingIndicator.innerHTML = `
                    <div class="ai-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                `;
                messagesContainer.appendChild(typingIndicator);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            } else if (!show && typingIndicator) {
                typingIndicator.remove();
            }
        }
    }
    
    // Voice input handling
    handleVoiceInput(transcript) {
        if (this.currentState === 'message') {
            document.getElementById('ai-message-input').value = transcript;
        } else if (this.currentState === 'full') {
            document.getElementById('ai-full-input').value = transcript;
        }
        
        this.stopListening();
    }
    
    toggleVoiceInput() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    startListening() {
        if (this.recognition) {
            this.recognition.start();
            this.isListening = true;
            
            // Update voice button state
            const voiceBtns = document.querySelectorAll('.ai-message-voice, .ai-full-voice');
            voiceBtns.forEach(btn => btn.classList.add('listening'));
        }
    }
    
    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
            this.isListening = false;
            
            // Update voice button state
            const voiceBtns = document.querySelectorAll('.ai-message-voice, .ai-full-voice');
            voiceBtns.forEach(btn => btn.classList.remove('listening'));
        }
    }
    
    // Utility functions
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    speak(text) {
        if (this.synthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fa-IR';
            utterance.rate = 0.9;
            this.synthesis.speak(utterance);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // AI Response handling
    async getAIResponse(message) {
        try {
            // ابتدا از دانش پایه محلی جستجو کن
            if (window.getAssistantResponse) {
                const localResponse = window.getAssistantResponse(message);
                if (localResponse && !localResponse.includes('متأسفانه پاسخ دقیقی')) {
                    // Update conversation history
                    this.conversationHistory.push(
                        { role: 'user', content: message },
                        { role: 'assistant', content: localResponse }
                    );
                    
                    // Keep only last 10 messages
                    if (this.conversationHistory.length > 10) {
                        this.conversationHistory = this.conversationHistory.slice(-10);
                    }
                    
                    return localResponse;
                }
            }

            // اگر پاسخ محلی پیدا نشد، از API استفاده کن
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: `شما دستیار هوشمند CPA هستید. به فارسی پاسخ دهید و کوتاه و مفید باشید.

اطلاعات قرارداد CPA:
- نام: CONTINUOUS PROFIT ACADEMY (CPA)
- توکن: CPA (ERC-20)
- شبکه: Polygon
- آدرس قرارداد: 0x045401e0692a84ecDd9c0c0fce3b2E23D864F076

ویژگی‌های اصلی:
- سیستم خرید/فروش توکن با USDC
- ساختار درختی باینری برای بازاریابی
- سیستم پاداش باینری (هر 12 ساعت)
- Cashback ماهانه برای کاربران بدون زیرمجموعه
- هزینه ثبت‌نام: 100-200 CPA (بسته به تعداد کاربران)
- کارمزد معاملات: 2% (1% پشتیبان، 0.5% توسعه‌دهنده، 0.5% معرف)

برای سوالات تخصصی درباره قرارداد، از اطلاعات بالا استفاده کنید.`
                        },
                        ...this.conversationHistory,
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });
            
            const data = await response.json();
            
            if (data.choices && data.choices[0]) {
                const aiResponse = data.choices[0].message.content;
                
                // Update conversation history
                this.conversationHistory.push(
                    { role: 'user', content: message },
                    { role: 'assistant', content: aiResponse }
                );
                
                // Keep only last 10 messages
                if (this.conversationHistory.length > 10) {
                    this.conversationHistory = this.conversationHistory.slice(-10);
                }
                
                return aiResponse;
            } else {
                throw new Error('Invalid response from AI');
            }
        } catch (error) {
            console.error('AI Response Error:', error);
            
            // در صورت خطا در API، از دانش پایه استفاده کن
            if (window.getAssistantResponse) {
                const fallbackResponse = window.getAssistantResponse(message);
                return fallbackResponse;
            }
            
            throw error;
        }
    }
    
    // Quick actions
    async handleQuickAction(action) {
        switch (action) {
            case 'buy-tokens':
                this.addMessageToUI('برای خرید توکن، به بخش "تبدیل ارز" بروید.', 'ai');
                break;
            case 'check-balance':
                await this.checkBalance();
                break;
            case 'network-stats':
                await this.showNetworkStats();
                break;
            case 'help':
                this.addMessageToUI('برای راهنمایی کامل، به بخش "آموزش و یادگیری" بروید.', 'ai');
                break;
            case 'shop':
                this.addMessageToUI('در حال انتقال به فروشگاه...', 'ai');
                setTimeout(() => { window.location.href = 'shop.html'; }, 800);
                break;
            case 'news':
                this.addMessageToUI('در حال انتقال به بخش اخبار...', 'ai');
                setTimeout(() => { window.location.href = 'news.html'; }, 800);
                break;
        }
    }
    
    async checkBalance() {
        try {
            const connection = await window.connectWallet();
            if (connection && connection.address) {
                const profile = await window.getUserProfile();
                const balanceText = `موجودی شما:\nPOL: ${profile.polBalance}\nCPA: ${profile.lvlBalance}\nUSDC: ${profile.usdcBalance}`;
                this.addMessageToUI(balanceText, 'ai');
            } else {
                this.addMessageToUI('لطفاً ابتدا کیف پول خود را متصل کنید.', 'ai');
            }
        } catch (error) {
            this.addMessageToUI('خطا در دریافت موجودی. لطفاً دوباره تلاش کنید.', 'error');
        }
    }
    
    async showNetworkStats() {
        try {
            const stats = await window.getContractStats();
            const statsText = `آمار شبکه:\nکل عرضه: ${stats.totalSupply}\nاستخر پاداش: ${stats.binaryPool}\nارزش پوینت: ${stats.pointValue}`;
            this.addMessageToUI(statsText, 'ai');
        } catch (error) {
            this.addMessageToUI('خطا در دریافت آمار شبکه.', 'error');
        }
    }
    
    // Deployer status check
    async checkDeployerStatus() {
        try {
            const connection = await window.connectWallet();
            if (connection && connection.address) {
                // Check if user is deployer (you can customize this logic)
                this.isDeployer = connection.address.toLowerCase() === '0x...'; // Add deployer address
            }
        } catch (error) {

        }
    }
    
    /**
     * Make a floating element draggable (idle/message states)
     * @param {string} elementId
     */
    makeDraggable(elementId) {
        const el = document.getElementById(elementId);
        if (!el) return;
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        let lastTouchId = null;
        // Restore position from localStorage
        const pos = localStorage.getItem('ai_' + elementId + '_pos');
        if (pos) {
            try {
                const { left, top } = JSON.parse(pos);
                el.style.left = left + 'px';
                el.style.top = top + 'px';
                el.style.right = '';
                el.style.bottom = '';
                el.style.transform = 'none';
            } catch (e) {}
        }
        // Helper: clamp position to viewport
        function clamp(val, min, max) {
            return Math.max(min, Math.min(max, val));
        }
        // Mouse events
        el.addEventListener('mousedown', (e) => {
            // Only left click, not on input/button
            if (e.button !== 0) return;
            if (e.target.closest('input,button,textarea,.ai-message-options-menu')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = el.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            document.body.style.userSelect = 'none';
        });
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let newLeft = startLeft + (e.clientX - startX);
            let newTop = startTop + (e.clientY - startY);
            // Clamp to viewport
            const vw = window.innerWidth, vh = window.innerHeight;
            const elRect = el.getBoundingClientRect();
            newLeft = clamp(newLeft, 0, vw - elRect.width);
            newTop = clamp(newTop, 0, vh - elRect.height);
            el.style.left = newLeft + 'px';
            el.style.top = newTop + 'px';
            el.style.right = '';
            el.style.bottom = '';
            el.style.transform = 'none';
        });
        window.addEventListener('mouseup', (e) => {
            if (isDragging) {
                isDragging = false;
                document.body.style.userSelect = '';
                // Save position
                const rect = el.getBoundingClientRect();
                localStorage.setItem('ai_' + elementId + '_pos', JSON.stringify({ left: rect.left, top: rect.top }));
            }
        });
        // Touch events
        el.addEventListener('touchstart', (e) => {
            if (e.target.closest('input,button,textarea,.ai-message-options-menu')) return;
            const touch = e.touches[0];
            lastTouchId = touch.identifier;
            isDragging = true;
            startX = touch.clientX;
            startY = touch.clientY;
            const rect = el.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
        }, { passive: false });
        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            let touch = null;
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === lastTouchId) {
                    touch = e.touches[i];
                    break;
                }
            }
            if (!touch) return;
            let newLeft = startLeft + (touch.clientX - startX);
            let newTop = startTop + (touch.clientY - startY);
            // Clamp to viewport
            const vw = window.innerWidth, vh = window.innerHeight;
            const elRect = el.getBoundingClientRect();
            newLeft = clamp(newLeft, 0, vw - elRect.width);
            newTop = clamp(newTop, 0, vh - elRect.height);
            el.style.left = newLeft + 'px';
            el.style.top = newTop + 'px';
            el.style.right = '';
            el.style.bottom = '';
            el.style.transform = 'none';
            e.preventDefault();
        }, { passive: false });
        window.addEventListener('touchend', (e) => {
            if (isDragging) {
                isDragging = false;
                // Save position
                const rect = el.getBoundingClientRect();
                localStorage.setItem('ai_' + elementId + '_pos', JSON.stringify({ left: rect.left, top: rect.top }));
            }
        });
        // Reset position on double click (desktop) or double tap (mobile)
        el.addEventListener('dblclick', () => {
            el.style.left = '';
            el.style.top = '';
            el.style.right = '';
            el.style.bottom = '';
            el.style.transform = '';
            localStorage.removeItem('ai_' + elementId + '_pos');
        });
        // On state switch, if not positioned, reset to default (centered)
        const observer = new MutationObserver(() => {
            if (el.style.left === '' && el.style.top === '') {
                el.style.left = '';
                el.style.top = '';
                el.style.right = '';
                el.style.bottom = '';
                el.style.transform = '';
            }
        });
        observer.observe(el, { attributes: true, attributeFilter: ['style'] });
    }
    
}

    // Create global instance
window.floatingAI = new FloatingAIAssistant();

// تابع تست برای بررسی عملکرد دستیار
window.testFloatingAI = function() {
    console.log('🧪 Testing Floating AI Assistant...');
    
    // بررسی وجود عناصر
    const elements = [
        'floating-ai-idle',
        'floating-ai-message', 
        'floating-ai-full',
        'ai-message-input',
        'ai-message-send',
        'ai-message-voice',
        'ai-message-expand',
        'ai-message-close',
        'ai-full-input',
        'ai-full-send',
        'ai-full-voice',
        'ai-full-minimize',
        'ai-full-close'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ ${id} found`);
        } else {
            console.error(`❌ ${id} not found`);
        }
    });
    
    // بررسی دانش پایه
    if (window.CPA_KNOWLEDGE_BASE) {
        console.log('✅ Knowledge base loaded');
    } else {
        console.error('❌ Knowledge base not loaded');
    }
    
    // تست پاسخ‌دهی
    if (window.getAssistantResponse) {
        const testResponse = window.getAssistantResponse('هزینه ثبت‌نام');
        console.log('✅ Test response:', testResponse);
    } else {
        console.error('❌ getAssistantResponse not available');
    }
    
    console.log('🧪 Test completed');
};

// اجرای تست بعد از بارگذاری صفحه
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.testFloatingAI();
    }, 2000);
}); 