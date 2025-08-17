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
        this.CHAT_HISTORY_KEY = 'ai-assistant-chat-history'; // کلید ثابت برای تاریخچه چت
        // Restore chat history from localStorage
        this.restoreChatHistory();
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
            
            // Render chat history in message/full state
            setTimeout(() => {
                if (this.conversationHistory && this.conversationHistory.length > 0) {
                    this.conversationHistory.forEach(msg => {
                        this.addMessageToUI(msg.content, msg.type);
                    });
                }
            }, 500);
            
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
                  <div style="color:#00ff88;font-weight:bold;font-size:1.05rem;margin-bottom:0.3rem;">👋 به دستیار هوشمند IAM خوش آمدید!</div>
                  <ul style="list-style:none;padding:0;margin:0 0 0.5rem 0;">
                    <li style="margin-bottom:0.2rem;">• <b>خرید و فروش توکن</b></li>
                    <li style="margin-bottom:0.2rem;">• <b>بررسی موجودی و آمار شبکه</b></li>
                    <li style="margin-bottom:0.2rem;">• <b>آموزش و راهنما</b></li>
                    <li style="margin-bottom:0.2rem;">• <b>دسترسی سریع به فروشگاه و اخبار</b></li>
                  </ul>
                  <div style="font-size:0.95rem;color:#a786ff;">یک سوال بپرسید یا روی میکروفون بزنید!</div>
                </div>
                <div class="ai-message-options-menu" id="ai-message-options-menu" style="display:none;position:absolute;bottom:60px;left:50%;transform:translateX(-50%);background:#232946;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);padding:0.7rem 0.5rem;z-index:9999999;min-width:180px;">
                  <div class="ai-picker-wheel"></div>
                </div>
            </div>
        `;
        document.body.appendChild(messageInterface);

        // بازطراحی منوی wheel بر اساس نالج‌بیس
        const picker = messageInterface.querySelector('.ai-picker-wheel');
        // افزایش ارتفاع و استایل لیست باکس
        picker.style.height = '260px'; // یا هر مقدار بزرگ‌تر که مناسب است
        picker.style.minHeight = '220px';
        picker.style.maxHeight = '340px';
        picker.style.display = 'flex';
        picker.style.flexDirection = 'column';
        picker.style.justifyContent = 'center';
        picker.style.alignItems = 'center';
        picker.style.overflow = 'hidden';
        // موضوعات اصلی نالج‌بیس و آیکون‌ها
        const kb = window.IAM_KNOWLEDGE_BASE || {};
        const defaultIcons = ['📄','📚','💱','🪙','🏦','🎁','🔒','📝','🛡️','🌐','🧑‍💼','🛒','⚙️','��','🎓','🪙','💡'];
        const topics = Object.entries(kb)
          .filter(([key, value]) => value && value.title)
          .map(([key, value], i) => ({
            icon: value.icon || defaultIcons[i % defaultIcons.length],
            label: value.title,
            key: key
          }));
        let state = {
          items: [],
          selectedIdx: 0,
          visibleCount: 3
        };
        function renderPicker() {
          picker.innerHTML = '';
          topics.forEach((topic, idx) => {
            const item = document.createElement('div');
            item.className = 'ai-picker-item' + (idx === state.selectedIdx ? ' selected' : '');
            item.dataset.topic = topic.key;
            item.innerHTML = topic.icon + ' ' + topic.label;
            // Remove all position/top/left/right styles for flex layout
            picker.appendChild(item);
          });
        }
        renderPicker();
        picker.addEventListener('wheel', (e) => {
          if (e.deltaY > 0) {
            state.selectedIdx = (state.selectedIdx + 1 + topics.length) % topics.length;
            renderPicker();
          } else if (e.deltaY < 0) {
            state.selectedIdx = (state.selectedIdx - 1 + topics.length) % topics.length;
            renderPicker();
          }
        });
        picker.onclick = (e) => {
          const items = Array.from(picker.getElementsByClassName('ai-picker-item'));
          const idx = items.indexOf(e.target);
          if (idx === -1) return;
          state.selectedIdx = idx;
          renderPicker();
          const topicKey = topics[state.selectedIdx].key;
          this.showKnowledgeSubtopics(topicKey);
        };
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
                        <span class="ai-full-text">دستیار هوشمند IAM</span>
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
                                سلام! من دستیار هوشمند IAM هستم. می‌تونم در همه زمینه‌ها کمکتون کنم:
                            </div>
                            <div class="ai-welcome-capabilities">
                                <div class="ai-capability">💰 خرید و فروش توکن</div>
                                <div class="ai-capability">�� مدیریت شبکه</div>
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
        // Save after adding message
        this.saveChatHistory();
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
        
        // اگر پیام assistant یا ai و با < شروع می‌شود، HTML را رندر کن
        if ((type === 'assistant' || type === 'ai') && typeof content === 'string' && content.trim().startsWith('<')) {
            messageDiv.innerHTML = `
                <div class="ai-full-message-content" style="text-align: ${alignment}">
                    <div class="ai-full-message-icon">${icon}</div>
                    <div class="ai-full-message-text">${content}</div>
                </div>
            `;
        } else {
        messageDiv.innerHTML = `
            <div class="ai-full-message-content" style="text-align: ${alignment}">
                <div class="ai-full-message-icon">${icon}</div>
                <div class="ai-full-message-text">${this.escapeHtml(content)}</div>
            </div>
        `;
        }
        
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
                            content: `شما دستیار هوشمند IAM هستید. به فارسی پاسخ دهید و کوتاه و مفید باشید.

اطلاعات قرارداد IAM:
- نام: CONTINUOUS PROFIT ACADEMY (IAM)
- توکن: IAM (ERC-20)
- شبکه: Polygon
- آدرس قرارداد: 0x045401e0692a84ecDd9c0c0fce3b2E23D864F076

ویژگی‌های اصلی:
- سیستم خرید/فروش توکن با DAI
- ساختار درختی باینری برای بازاریابی
- سیستم پاداش باینری (هر 12 ساعت)
- Cashback ماهانه برای کاربران بدون زیرمجموعه
- هزینه ثبت‌نام: 100-200 IAM (بسته به تعداد کاربران)
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
                const balanceText = `موجودی شما:\nPOL: ${profile.polBalance}\nIAM: ${profile.lvlBalance}\nDAI: ${profile.daiBalance}`;
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
    
    // Optionally, add a clear history method
    clearChatHistory() {
        this.conversationHistory = [];
        localStorage.removeItem('floatingAIChatHistory');
        // Optionally clear UI messages
        // ...
    }

    // اضافه کردن متد بازیابی تاریخچه چت
    restoreChatHistory() {
        try {
            const history = localStorage.getItem(this.CHAT_HISTORY_KEY);
            if (history) {
                this.conversationHistory = JSON.parse(history);
            } else {
                this.conversationHistory = [];
            }
        } catch (e) {
            this.conversationHistory = [];
        }
    }

    // نمایش خلاصه یا پاسخ هر مبحث از نالج‌بیس
    showKnowledgeTopic(topicKey) {
        const kb = window.IAM_KNOWLEDGE_BASE;
        let content = '';
        switch(topicKey) {
            case 'registration':
                content = kb.assistantResponses && kb.assistantResponses.registration ? kb.assistantResponses.registration : 'اطلاعات ثبت‌نام موجود نیست.';
                break;
            case 'trading':
                content = kb.assistantResponses && kb.assistantResponses.trading ? kb.assistantResponses.trading : 'اطلاعات خرید/فروش موجود نیست.';
                break;
            case 'rewards':
                content = kb.assistantResponses && kb.assistantResponses.rewards ? kb.assistantResponses.rewards : 'اطلاعات پاداش موجود نیست.';
                break;
            case 'network':
                content = kb.assistantResponses && kb.assistantResponses.network ? kb.assistantResponses.network : 'اطلاعات شبکه موجود نیست.';
                break;
            case 'specialFeatures':
                content = 'ویژگی‌های خاص:\n' + (kb.specialFeatures ? JSON.stringify(kb.specialFeatures, null, 2) : 'اطلاعات موجود نیست.');
                break;
            case 'security':
                content = kb.assistantResponses && kb.assistantResponses.security ? kb.assistantResponses.security : 'اطلاعات امنیت موجود نیست.';
                break;
            case 'faq':
                content = 'سوالات متداول:\n';
                if (kb.faq) {
                    for (const q in kb.faq) {
                        content += `\n• ${q}`;
                    }
        } else {
                    content += 'اطلاعات موجود نیست.';
                }
                break;
            case 'technicalNotes':
                content = 'نکات فنی مهم:\n' + (kb.technicalNotes ? kb.technicalNotes.map(n=>`• ${n}`).join('\n') : 'اطلاعات موجود نیست.');
                break;
            case 'importantFunctions':
                content = 'توابع مهم قرارداد:\n';
                if (kb.importantFunctions) {
                    for (const fn in kb.importantFunctions) {
                        content += `\n• ${fn}: ${kb.importantFunctions[fn]}`;
                    }
                } else {
                    content += 'اطلاعات موجود نیست.';
                }
                break;
            default:
                content = 'اطلاعاتی برای این مبحث وجود ندارد.';
        }
        this.addMessageToUI(content, 'assistant');
    }

    // نمایش زیرعناوین هر دسته به صورت لینک در چت
    showKnowledgeSubtopics(topicKey) {
        const kb = window.IAM_KNOWLEDGE_BASE;
        console.log('topicKey:', topicKey, 'kb[topicKey]:', kb[topicKey]);
        let subtopics = [];
        let title = '';
        // اگر بخش دارای subtopics بود، لیست زیرعناوین را به صورت لینک نمایش بده
        if (kb[topicKey] && Array.isArray(kb[topicKey].subtopics) && kb[topicKey].subtopics.length > 0) {
            title = kb[topicKey].title || '';
            subtopics = kb[topicKey].subtopics;
            let html = `<div style='font-weight:bold;margin-bottom:0.5rem;'>${title}</div>`;
            subtopics.forEach(st => {
                html += `<a href='#' class='ai-subtopic-link' data-topic='${topicKey}' data-sub='${st.id}' style='display:block;color:#00ff88;margin-bottom:0.3rem;text-decoration:underline;'>${st.title}</a>`;
            });
            this.addMessageToUI(html, 'assistant');
            // رویداد کلیک روی لینک‌ها
            setTimeout(() => {
                document.querySelectorAll('.ai-subtopic-link').forEach(link => {
                    link.onclick = (e) => {
                        e.preventDefault();
                        const topic = link.getAttribute('data-topic');
                        const sub = link.getAttribute('data-sub');
                        this.showKnowledgeDetail(topic, sub);
                    };
                });
            }, 100);
            return;
        }
        // اگر زیرعناوین خالی بود پیام مناسب نمایش بده
        if (!subtopics || subtopics.length === 0) {
            this.addMessageToUI('برای این بخش زیرعنوانی وجود ندارد.', 'assistant');
            return;
        }
        let html = `<div style='font-weight:bold;margin-bottom:0.5rem;'>${title}</div>`;
        subtopics.forEach(st => {
            html += `<a href='#' class='ai-subtopic-link' data-topic='${topicKey}' data-sub='${st.key}' style='display:block;color:#00ff88;margin-bottom:0.3rem;text-decoration:underline;'>${st.label}</a>`;
        });
        this.addMessageToUI(html, 'assistant');
        // رویداد کلیک روی لینک‌ها
        setTimeout(() => {
            document.querySelectorAll('.ai-subtopic-link').forEach(link => {
                link.onclick = (e) => {
                    e.preventDefault();
                    const topic = link.getAttribute('data-topic');
                    const sub = link.getAttribute('data-sub');
                    this.showKnowledgeDetail(topic, sub);
                };
            });
        }, 100);
    }

    // نمایش محتوای هر زیرعنوان
    showKnowledgeDetail(topicKey, subKey) {
        const kb = window.IAM_KNOWLEDGE_BASE;
        let content = '';
        // اگر بخش دارای subtopics بود، content زیرعنوان را نمایش بده
        if (kb[topicKey] && Array.isArray(kb[topicKey].subtopics)) {
            const sub = kb[topicKey].subtopics.find(s => s.id === subKey);
            if (sub) {
                content = `<div style='font-weight:bold;margin-bottom:0.5rem;'>${sub.title}</div><div>${sub.content}</div>`;
                this.addMessageToUI(content, 'assistant');
                return;
            }
        }
        if (kb[topicKey] && kb[topicKey][subKey]) {
            const val = kb[topicKey][subKey];
            if (typeof val === 'string') content = val;
            else if (Array.isArray(val)) content = val.map(v=>`• ${typeof v==='string'?v:(v.label||v.name||JSON.stringify(v))}`).join('<br>');
            else if (typeof val === 'object') {
                content = Object.keys(val).map(k=>`<b>${k}:</b> ${typeof val[k]==='string'?val[k]:JSON.stringify(val[k])}`).join('<br>');
            }
    } else {
            content = 'اطلاعاتی برای این بخش وجود ندارد.';
        }
        this.addMessageToUI(content, 'assistant');
    }

    saveChatHistory() {
        try {
            localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(this.conversationHistory || []));
        } catch (e) {
            console.warn('Could not save chat history:', e);
        }
    }
    }
    
    // Create global instance
window.floatingAI = new FloatingAIAssistant(); 

// --- Circular Rotary Menu for Quick Actions ---
function createCircularMenu(actions) {
  const container = document.createElement('div');
  container.className = 'ai-circular-menu';
  const radius = 80; // px
  const center = 100; // px
  actions.forEach((action, i) => {
    const angle = (2 * Math.PI * i) / actions.length;
    const x = center + radius * Math.cos(angle - Math.PI/2);
    const y = center + radius * Math.sin(angle - Math.PI/2);
    const item = document.createElement('div');
    item.className = 'ai-circular-item';
    item.style.position = 'absolute';
    item.style.left = x + 'px';
    item.style.top = y + 'px';
    item.style.transform = 'translate(-50%, -50%)';
    item.innerHTML = action.icon + ' ' + action.label;
    item.dataset.action = action.action;
    container.appendChild(item);
  });
  container.style.position = 'relative';
  container.style.width = '200px';
  container.style.height = '200px';
  container.style.margin = '0 auto';
  return container;
}
// Usage in message interface:
// Replace the .ai-wheel-picker with the circular menu
const optionsMenu = document.getElementById('ai-message-options-menu');
if (optionsMenu) {
  const oldWheel = optionsMenu.querySelector('.ai-wheel-picker');
  if (oldWheel) oldWheel.remove();
  const actions = [
    {icon:'💰', label:'خرید توکن', action:'buy-tokens'},
    {icon:'💳', label:'موجودی', action:'check-balance'},
    {icon:'❓', label:'راهنما', action:'help'},
    {icon:'🛒', label:'فروشگاه', action:'shop'},
    {icon:'📰', label:'اخبار', action:'news'}
  ];
  const circularMenu = createCircularMenu(actions);
  optionsMenu.appendChild(circularMenu);
    }
// --- Wheel Picker Enhancement ---
function setupWheelPicker() {
  const picker = document.getElementById('ai-wheel-picker');
  if (!picker) return;
  const items = Array.from(picker.getElementsByClassName('ai-wheel-item'));
  function updateSelectedItem() {
    const pickerRect = picker.getBoundingClientRect();
    let minDist = Infinity, selectedIdx = 0;
    items.forEach((item, idx) => {
      const rect = item.getBoundingClientRect();
      const dist = Math.abs(rect.top + rect.height/2 - (pickerRect.top + pickerRect.height/2));
      if (dist < minDist) {
        minDist = dist;
        selectedIdx = idx;
      }
    });
    items.forEach((item, idx) => {
      item.classList.toggle('selected', idx === selectedIdx);
    });
  }
  picker.addEventListener('scroll', () => {
    requestAnimationFrame(updateSelectedItem);
  });
  items.forEach(item => {
    item.addEventListener('click', () => {
      item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
  // Initial highlight
  updateSelectedItem();
}
// Call this after rendering the wheel picker menu
if (typeof window !== 'undefined') {
  setTimeout(setupWheelPicker, 1000);
} 