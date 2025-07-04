// learning.js
let currentCategory = 'blockchain';

// تابع راه‌اندازی تب یادگیری
function initializeLearningTab() {
    setupCategorySwitching();
    setupLearningCards();
    updateProgressStats();
    setupLiveStream();
}

// راه‌اندازی تغییر دسته‌بندی‌ها
function setupCategorySwitching() {
    const categories = document.querySelectorAll('.learning-category');
    
    categories.forEach(category => {
        category.addEventListener('click', function() {
            const categoryName = this.getAttribute('data-category');
            switchCategory(categoryName);
        });
    });
}

// تغییر دسته‌بندی
function switchCategory(categoryName) {
    // حذف کلاس active از همه دسته‌بندی‌ها
    document.querySelectorAll('.learning-category').forEach(cat => {
        cat.classList.remove('active');
    });
    
    // حذف کلاس active از همه بخش‌ها
    document.querySelectorAll('.learning-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // اضافه کردن کلاس active به دسته‌بندی انتخاب شده
    const selectedCategory = document.querySelector(`[data-category="${categoryName}"]`);
    if (selectedCategory) {
        selectedCategory.classList.add('active');
    }
    
    // نمایش بخش مربوطه
    const selectedSection = document.getElementById(`${categoryName}-section`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    currentCategory = categoryName;
}

// راه‌اندازی کارت‌های یادگیری
function setupLearningCards() {
    const learningButtons = document.querySelectorAll('.start-learning-btn');
    
    learningButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.learning-card');
            const cardTitle = card.querySelector('.card-title').textContent;
            startLearning(cardTitle);
        });
    });
}

// شروع یادگیری
function startLearning(courseTitle) {
    // نمایش پیام شروع یادگیری
    showLearningMessage(`شروع دوره: ${courseTitle}`, 'info');
    
    // شبیه‌سازی پیشرفت یادگیری
    setTimeout(() => {
        updateProgressStats();
        showLearningMessage(`دوره ${courseTitle} با موفقیت تکمیل شد!`, 'success');
    }, 3000);
}

// نمایش پیام‌های یادگیری
function showLearningMessage(message, type = 'info') {
    console.log(`Learning message: ${type} - ${message}`);
    
    // ایجاد عنصر پیام
    const messageDiv = document.createElement('div');
    messageDiv.className = `learning-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: #fff;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    // تنظیم رنگ بر اساس نوع پیام
    switch(type) {
        case 'success':
            messageDiv.style.background = 'linear-gradient(135deg, #00ff88, #00ccff)';
            messageDiv.style.color = '#000';
            break;
        case 'error':
            messageDiv.style.background = '#ff6b6b';
            break;
        case 'warning':
            messageDiv.style.background = '#ffb347';
            messageDiv.style.color = '#000';
            break;
        default:
            messageDiv.style.background = '#00ccff';
    }
    
    // اضافه کردن به صفحه
    document.body.appendChild(messageDiv);
    
    // حذف پیام بعد از 3 ثانیه
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// بروزرسانی آمار پیشرفت
function updateProgressStats() {
    // شبیه‌سازی داده‌های پیشرفت
    const completedCourses = Math.floor(Math.random() * 10) + 5; // 5-15 دوره
    const learningHours = Math.floor(Math.random() * 50) + 20; // 20-70 ساعت
    const learningPoints = Math.floor(Math.random() * 1000) + 500; // 500-1500 امتیاز
    
    // بروزرسانی عناصر
    const completedElement = document.getElementById('completed-courses');
    const hoursElement = document.getElementById('learning-hours');
    const pointsElement = document.getElementById('learning-points');
    
    if (completedElement) completedElement.textContent = completedCourses;
    if (hoursElement) hoursElement.textContent = learningHours;
    if (pointsElement) pointsElement.textContent = learningPoints;
}

// تابع‌های کمکی برای انیمیشن
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// راه‌اندازی اولیه
document.addEventListener('DOMContentLoaded', function() {
    addAnimationStyles();
    
    // اگر صفحه LEARNING فعال است، آن را راه‌اندازی کن
    const mainLearning = document.getElementById('main-learning');
    if (mainLearning && mainLearning.style.display !== 'none') {
        initializeLearningTab();
    } else if (document.querySelector('.learning-main-container')) {
        // اگر در صفحه learning.html هستیم
        initializeLearningTab();
    }
});

// Live Stream Variables
let streamActive = false;
let streamStartTime = null;
let streamInterval = null;
let viewerCount = 0;
let chatMessages = [];
let bannedUsers = new Set();
let mediaStream = null;
let peerConnections = new Map();

// Sub Admin Variables
let subAdmins = [];
let currentEditingAdmin = null;

// راه‌اندازی لایو استریم
async function setupLiveStream() {
    // بررسی اکتیو بودن کاربر
    const profile = await window.getUserProfile();
    if (!profile.activated) {
        // مخفی کردن یا قفل کردن بخش لایو استریم
        const liveSection = document.getElementById('live-stream-section');
        if (liveSection) {
            liveSection.innerHTML = '<div style="color:#ff6b6b;text-align:center;padding:2rem;font-size:1.2rem;">دسترسی به لایو استریم فقط برای کاربران فعال مجاز است.</div>';
        }
        return; // ادامه راه‌اندازی لایو انجام نشود
    }
    checkAdminStatus();
    setupChatInput();
    setupAdminControls();
    setupStreamTimer();
    simulateViewers();
    
    // فقط اگر دکمه toggle وجود دارد، آن را راه‌اندازی کن
    const toggleBtn = document.getElementById('live-stream-toggle');
    if (toggleBtn) {
        setupLiveStreamToggle();
    }
}

// بررسی وضعیت ادمین
async function checkAdminStatus() {
    try {
        // بررسی وجود تابع connectWallet
        if (typeof connectWallet === 'function') {
            const { contract, address } = await connectWallet();
            const deployerAddress = await contract.deployer();
            
            if (address.toLowerCase() === deployerAddress.toLowerCase()) {
                // کاربر ادمین اصلی است
                const adminControls = document.getElementById('admin-controls');
                if (adminControls) {
                    adminControls.style.display = 'block';
                    setupAdminStreamControls();
                }
            } else if (isSubAdmin(address)) {
                // کاربر ساب ادمین است
                const adminControls = document.getElementById('admin-controls');
                if (adminControls) {
                    adminControls.style.display = 'block';
                    setupSubAdminControls();
                    setupLimitedAdminControls(address);
                }
            } else {
                // کاربر عادی است - فقط نمایش استریم
                setupViewerMode();
            }
        } else {
            // اگر تابع connectWallet موجود نیست، حالت عادی نمایش داده می‌شود
            setupViewerMode();
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
        // در صورت خطا، حالت عادی نمایش داده می‌شود
        setupViewerMode();
    }
}

// راه‌اندازی کنترل‌های ادمین
function setupAdminStreamControls() {
    const startBtn = document.getElementById('start-stream-btn');
    const stopBtn = document.getElementById('stop-stream-btn');
    const muteBtn = document.getElementById('mute-audio-btn');
    const shareBtn = document.getElementById('share-screen-btn');
    const banBtn = document.getElementById('ban-user-btn');
    const clearBtn = document.getElementById('clear-chat-btn');

    startBtn.addEventListener('click', startStream);
    stopBtn.addEventListener('click', stopStream);
    muteBtn.addEventListener('click', toggleMute);
    shareBtn.addEventListener('click', shareScreen);
    banBtn.addEventListener('click', banUser);
    clearBtn.addEventListener('click', clearChat);
    
    // راه‌اندازی کنترل‌های ساب ادمین
    setupSubAdminControls();
}

// راه‌اندازی حالت بیننده
function setupViewerMode() {
    // شبیه‌سازی اتصال به استریم
    setTimeout(() => {
        addChatMessage('system', 'به لایو استریم آموزشی خوش آمدید!');
    }, 1000);
}

// راه‌اندازی ورودی چت
function setupChatInput() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-message-btn');

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// راه‌اندازی کنترل‌های ادمین
function setupAdminControls() {
    const chatToggle = document.getElementById('chat-toggle');
    chatToggle.addEventListener('click', toggleChat);
}

// راه‌اندازی دکمه toggle لایو استریم
function setupLiveStreamToggle() {
    const toggleBtn = document.getElementById('live-stream-toggle');
    const liveStreamSection = document.getElementById('live-stream-section');
    
    if (toggleBtn && liveStreamSection) {
        toggleBtn.addEventListener('click', () => {
            const isVisible = liveStreamSection.style.display !== 'none';
            
            if (isVisible) {
                liveStreamSection.style.display = 'none';
                toggleBtn.classList.remove('active');
                toggleBtn.textContent = '🎥 لایو استریم';
            } else {
                liveStreamSection.style.display = 'block';
                toggleBtn.classList.add('active');
                toggleBtn.textContent = '🎥 مخفی کردن';
                
                // اگر ادمین است، کنترل‌ها را نمایش بده
                checkAdminStatus();
            }
        });
    }
}

// راه‌اندازی تایمر استریم
function setupStreamTimer() {
    streamInterval = setInterval(() => {
        if (streamActive && streamStartTime) {
            const elapsed = Date.now() - streamStartTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            document.getElementById('stream-time').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

// شبیه‌سازی بینندگان
function simulateViewers() {
    setInterval(() => {
        if (streamActive) {
            const change = Math.floor(Math.random() * 5) - 2; // -2 تا +2
            viewerCount = Math.max(0, viewerCount + change);
            document.getElementById('viewer-count').textContent = viewerCount;
        }
    }, 3000);
}

// شروع استریم
async function startStream() {
    try {
        console.log('Starting stream...');
        
        // بررسی وجود دوربین و میکروفون
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('مرورگر شما از دسترسی به دوربین پشتیبانی نمی‌کند');
        }
        
        // درخواست دسترسی به دوربین و میکروفون
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: true
        });

        const video = document.getElementById('admin-video');
        if (video) {
            video.srcObject = mediaStream;
            video.play().catch(e => console.log('Video play error:', e));
        }
        
        streamActive = true;
        streamStartTime = Date.now();
        viewerCount = Math.floor(Math.random() * 50) + 10;
        
        // بروزرسانی دکمه‌ها
        const startBtn = document.getElementById('start-stream-btn');
        const stopBtn = document.getElementById('stop-stream-btn');
        if (startBtn) startBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = false;
        
        addChatMessage('system', 'لایو استریم شروع شد!');
        showLearningMessage('استریم با موفقیت شروع شد!', 'success');
        
        console.log('Stream started successfully');
        
    } catch (error) {
        console.error('Error starting stream:', error);
        showLearningMessage('خطا در شروع استریم: ' + error.message, 'error');
        
        // اگر دسترسی به دوربین رد شد، یک ویدیو تست نمایش بده
        if (error.name === 'NotAllowedError') {
            showLearningMessage('دسترسی به دوربین رد شد. برای تست، یک ویدیو نمونه نمایش داده می‌شود.', 'warning');
            simulateStream();
        }
    }
}

// شبیه‌سازی استریم برای تست
function simulateStream() {
    const video = document.getElementById('admin-video');
    if (video) {
        // ایجاد یک canvas با رنگ پس‌زمینه
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        // رسم یک پس‌زمینه آبی
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // رسم متن
        ctx.fillStyle = '#00ccff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('لایو استریم تست', canvas.width/2, canvas.height/2);
        ctx.fillText('دوربین در دسترس نیست', canvas.width/2, canvas.height/2 + 40);
        
        // تبدیل canvas به stream
        const stream = canvas.captureStream(30);
        video.srcObject = stream;
        
        streamActive = true;
        streamStartTime = Date.now();
        viewerCount = Math.floor(Math.random() * 50) + 10;
        
        addChatMessage('system', 'استریم تست شروع شد!');
        showLearningMessage('استریم تست شروع شد!', 'success');
    }
}

// توقف استریم
function stopStream() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    
    const video = document.getElementById('admin-video');
    video.srcObject = null;
    
    streamActive = false;
    streamStartTime = null;
    viewerCount = 0;
    
    document.getElementById('start-stream-btn').disabled = false;
    document.getElementById('stop-stream-btn').disabled = true;
    
    addChatMessage('system', 'لایو استریم متوقف شد.');
    showLearningMessage('استریم متوقف شد.', 'warning');
}

// قطع/روشن کردن صدا
function toggleMute() {
    if (mediaStream) {
        const audioTrack = mediaStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            const muteBtn = document.getElementById('mute-audio-btn');
            muteBtn.textContent = audioTrack.enabled ? '🔇 قطع صدا' : '🔊 روشن کردن صدا';
        }
    }
}

// اشتراک صفحه
async function shareScreen() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });
        
        const video = document.getElementById('admin-video');
        video.srcObject = screenStream;
        
        showLearningMessage('اشتراک صفحه فعال شد!', 'success');
        
    } catch (error) {
        console.error('Error sharing screen:', error);
        showLearningMessage('خطا در اشتراک صفحه: ' + error.message, 'error');
    }
}

// مسدود کردن کاربر
function banUser() {
    const username = prompt('نام کاربری که می‌خواهید مسدود کنید:');
    if (username && username.trim()) {
        bannedUsers.add(username.trim().toLowerCase());
        addChatMessage('system', `کاربر ${username} مسدود شد.`);
        showLearningMessage(`کاربر ${username} مسدود شد.`, 'warning');
    }
}

// پاک کردن چت
function clearChat() {
    if (confirm('آیا مطمئن هستید که می‌خواهید چت را پاک کنید؟')) {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = '';
        addChatMessage('system', 'چت پاک شد.');
    }
}

// ارسال پیام
function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (message) {
        // بررسی مسدودیت کاربر
        const username = generateUsername();
        if (bannedUsers.has(username.toLowerCase())) {
            showLearningMessage('شما مسدود شده‌اید و نمی‌توانید پیام ارسال کنید.', 'error');
            return;
        }
        
        addChatMessage('user', message, username);
        chatInput.value = '';
        
        // شبیه‌سازی پاسخ ادمین
        setTimeout(() => {
            if (streamActive && Math.random() > 0.7) {
                const responses = [
                    'سوال خوبی پرسیدید!',
                    'بله، درست متوجه شدید.',
                    'اجازه بدهید توضیح دهم...',
                    'این موضوع در جلسه بعدی بررسی می‌شود.',
                    'ممنون از سوال شما!'
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addChatMessage('admin', randomResponse, 'ادمین');
            }
        }, 2000);
    }
}

// اضافه کردن پیام به چت
function addChatMessage(type, text, username = '') {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) {
        console.log('Chat messages container not found');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    
    const time = new Date().toLocaleTimeString('fa-IR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const displayName = username ? `@${username}: ` : '';
    
    messageDiv.innerHTML = `
        <span class="message-time">${time}</span>
        <span class="message-text">${displayName}${text}</span>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // محدود کردن تعداد پیام‌ها
    if (chatMessages.children.length > 50) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
    
    console.log(`Chat message added: ${type} - ${text}`);
}

// تغییر وضعیت چت
function toggleChat() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatToggle = document.getElementById('chat-toggle');
    
    if (chatMessages.style.display === 'none') {
        chatMessages.style.display = 'flex';
        chatInput.style.display = 'block';
        chatToggle.textContent = '📱';
    } else {
        chatMessages.style.display = 'none';
        chatInput.style.display = 'none';
        chatToggle.textContent = '💬';
    }
}

// تولید نام کاربری تصادفی
function generateUsername() {
    const adjectives = ['سریع', 'هوشمند', 'خلاق', 'ماهر', 'برجسته', 'عالی', 'فوق‌العاده'];
    const nouns = ['کاربر', 'دانشجو', 'یادگیرنده', 'مشارکت‌کننده', 'عضو'];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    
    return `${adj}${noun}${number}`;
}

// راه‌اندازی کنترل‌های ساب ادمین
function setupSubAdminControls() {
    const addBtn = document.getElementById('add-sub-admin-btn');
    const viewBtn = document.getElementById('view-sub-admins-btn');
    const permissionsBtn = document.getElementById('sub-admin-permissions-btn');
    
    if (addBtn) addBtn.addEventListener('click', showAddSubAdminModal);
    if (viewBtn) viewBtn.addEventListener('click', toggleSubAdminsList);
    if (permissionsBtn) permissionsBtn.addEventListener('click', showPermissionsModal);
    
    // راه‌اندازی مودال‌ها
    setupSubAdminModals();
    
    // بارگذاری ساب ادمین‌های موجود
    loadSubAdmins();
}

// راه‌اندازی مودال‌های ساب ادمین
function setupSubAdminModals() {
    const modal = document.getElementById('sub-admin-modal');
    const deleteModal = document.getElementById('delete-confirm-modal');
    const form = document.getElementById('sub-admin-form');
    
    // دکمه‌های مودال اصلی
    document.getElementById('cancel-sub-admin-btn').addEventListener('click', () => {
        modal.style.display = 'none';
        resetSubAdminForm();
    });
    
    // دکمه‌های مودال حذف
    document.getElementById('cancel-delete-btn').addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });
    
    document.getElementById('confirm-delete-btn').addEventListener('click', deleteSubAdmin);
    
    // فرم ساب ادمین
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveSubAdmin();
    });
    
    // بستن مودال با کلیک خارج از آن
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            resetSubAdminForm();
        }
    });
    
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
}

// نمایش مودال افزودن ساب ادمین
function showAddSubAdminModal() {
    const modal = document.getElementById('sub-admin-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('sub-admin-form');
    
    title.textContent = 'افزودن ساب ادمین جدید';
    form.reset();
    currentEditingAdmin = null;
    
    modal.style.display = 'flex';
}

// نمایش مودال ویرایش ساب ادمین
function showEditSubAdminModal(admin) {
    const modal = document.getElementById('sub-admin-modal');
    const title = document.getElementById('modal-title');
    
    title.textContent = 'ویرایش ساب ادمین';
    currentEditingAdmin = admin;
    
    // پر کردن فرم با اطلاعات موجود
    document.getElementById('sub-admin-name').value = admin.name;
    document.getElementById('sub-admin-address').value = admin.address;
    document.getElementById('sub-admin-role').value = admin.role;
    document.getElementById('sub-admin-description').value = admin.description || '';
    
    // تنظیم دسترسی‌ها
    const permissions = admin.permissions || [];
    document.querySelectorAll('input[name="permissions"]').forEach(checkbox => {
        checkbox.checked = permissions.includes(checkbox.id);
    });
    
    modal.style.display = 'flex';
}

// ذخیره ساب ادمین
function saveSubAdmin() {
    const name = document.getElementById('sub-admin-name').value.trim();
    const address = document.getElementById('sub-admin-address').value.trim();
    const role = document.getElementById('sub-admin-role').value;
    const description = document.getElementById('sub-admin-description').value.trim();
    
    // اعتبارسنجی
    if (!name || !address || !role) {
        showLearningMessage('لطفاً تمام فیلدهای ضروری را پر کنید.', 'error');
        return;
    }
    
    if (!address.startsWith('0x') || address.length !== 42) {
        showLearningMessage('آدرس کیف پول نامعتبر است.', 'error');
        return;
    }
    
    // جمع‌آوری دسترسی‌ها
    const permissions = [];
    document.querySelectorAll('input[name="permissions"]:checked').forEach(checkbox => {
        permissions.push(checkbox.id);
    });
    
    const subAdmin = {
        id: currentEditingAdmin ? currentEditingAdmin.id : Date.now().toString(),
        name,
        address: address.toLowerCase(),
        role,
        description,
        permissions,
        createdAt: currentEditingAdmin ? currentEditingAdmin.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (currentEditingAdmin) {
        // ویرایش ساب ادمین موجود
        const index = subAdmins.findIndex(admin => admin.id === currentEditingAdmin.id);
        if (index !== -1) {
            subAdmins[index] = subAdmin;
        }
    } else {
        // افزودن ساب ادمین جدید
        subAdmins.push(subAdmin);
    }
    
    // ذخیره در localStorage
    saveSubAdminsToStorage();
    
    // بستن مودال و به‌روزرسانی لیست
    document.getElementById('sub-admin-modal').style.display = 'none';
    resetSubAdminForm();
    renderSubAdminsList();
    
    showLearningMessage(
        currentEditingAdmin ? 'ساب ادمین با موفقیت ویرایش شد.' : 'ساب ادمین جدید با موفقیت اضافه شد.',
        'success'
    );
}

// حذف ساب ادمین
function deleteSubAdmin() {
    if (!currentEditingAdmin) return;
    
    const index = subAdmins.findIndex(admin => admin.id === currentEditingAdmin.id);
    if (index !== -1) {
        subAdmins.splice(index, 1);
        saveSubAdminsToStorage();
        renderSubAdminsList();
        
        document.getElementById('delete-confirm-modal').style.display = 'none';
        showLearningMessage('ساب ادمین با موفقیت حذف شد.', 'success');
    }
}

// نمایش مودال تأیید حذف
function showDeleteConfirmModal(admin) {
    currentEditingAdmin = admin;
    document.getElementById('delete-admin-name').textContent = admin.name;
    document.getElementById('delete-admin-address').textContent = admin.address;
    document.getElementById('delete-confirm-modal').style.display = 'flex';
}

// تغییر وضعیت نمایش لیست ساب ادمین‌ها
function toggleSubAdminsList() {
    const list = document.getElementById('sub-admins-list');
    const btn = document.getElementById('view-sub-admins-btn');
    
    if (list.style.display === 'none') {
        list.style.display = 'block';
        btn.textContent = '👥 مخفی کردن';
        renderSubAdminsList();
    } else {
        list.style.display = 'none';
        btn.textContent = '👥 مشاهده ساب ادمین‌ها';
    }
}

// نمایش لیست ساب ادمین‌ها
function renderSubAdminsList() {
    const container = document.getElementById('sub-admins-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (subAdmins.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center; padding: 1rem;">هیچ ساب ادمینی تعریف نشده است.</p>';
        return;
    }
    
    subAdmins.forEach(admin => {
        const adminElement = createSubAdminElement(admin);
        container.appendChild(adminElement);
    });
}

// ایجاد عنصر ساب ادمین
function createSubAdminElement(admin) {
    const template = document.getElementById('sub-admin-template');
    const clone = template.cloneNode(true);
    
    clone.style.display = 'flex';
    clone.id = `sub-admin-${admin.id}`;
    
    // پر کردن اطلاعات
    clone.querySelector('.sub-admin-name').textContent = admin.name;
    clone.querySelector('.sub-admin-address').textContent = admin.address;
    clone.querySelector('.sub-admin-role').textContent = getRoleDisplayName(admin.role);
    
    // تنظیم دکمه‌ها
    const editBtn = clone.querySelector('.edit-btn');
    const removeBtn = clone.querySelector('.remove-btn');
    
    editBtn.addEventListener('click', () => showEditSubAdminModal(admin));
    removeBtn.addEventListener('click', () => showDeleteConfirmModal(admin));
    
    return clone;
}

// دریافت نام نمایشی نقش
function getRoleDisplayName(role) {
    const roleNames = {
        'moderator': 'مدیر محتوا',
        'support': 'پشتیبانی',
        'analyst': 'تحلیلگر',
        'teacher': 'مدرس',
        'custom': 'سفارشی'
    };
    return roleNames[role] || role;
}

// نمایش مودال تنظیمات دسترسی
function showPermissionsModal() {
    // این تابع می‌تواند برای تنظیمات کلی دسترسی‌ها استفاده شود
    showLearningMessage('تنظیمات دسترسی در نسخه بعدی اضافه خواهد شد.', 'info');
}

// بارگذاری ساب ادمین‌ها از localStorage
function loadSubAdmins() {
    try {
        const stored = localStorage.getItem('subAdmins');
        if (stored) {
            subAdmins = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading sub admins:', error);
        subAdmins = [];
    }
}

// ذخیره ساب ادمین‌ها در localStorage
function saveSubAdminsToStorage() {
    try {
        localStorage.setItem('subAdmins', JSON.stringify(subAdmins));
    } catch (error) {
        console.error('Error saving sub admins:', error);
    }
}

// ریست کردن فرم ساب ادمین
function resetSubAdminForm() {
    document.getElementById('sub-admin-form').reset();
    currentEditingAdmin = null;
}

// بررسی دسترسی ساب ادمین
function checkSubAdminPermissions(address, permission) {
    const subAdmin = subAdmins.find(admin => 
        admin.address.toLowerCase() === address.toLowerCase()
    );
    
    if (!subAdmin) return false;
    
    return subAdmin.permissions.includes(permission);
}

// بررسی اینکه آیا کاربر ساب ادمین است
function isSubAdmin(address) {
    return subAdmins.some(admin => 
        admin.address.toLowerCase() === address.toLowerCase()
    );
}

// راه‌اندازی کنترل‌های محدود برای ساب ادمین
function setupLimitedAdminControls(address) {
    const subAdmin = subAdmins.find(admin => 
        admin.address.toLowerCase() === address.toLowerCase()
    );
    
    if (!subAdmin) return;
    
    // مخفی کردن بخش مدیریت ساب ادمین
    const subAdminManagement = document.querySelector('.sub-admin-management');
    if (subAdminManagement) {
        subAdminManagement.style.display = 'none';
    }
    
    // کنترل دسترسی‌های مختلف بر اساس permissions
    const permissions = subAdmin.permissions || [];
    
    // کنترل لایو استریم
    if (!permissions.includes('perm-stream-control')) {
        const streamControls = ['start-stream-btn', 'stop-stream-btn', 'mute-audio-btn', 'share-screen-btn'];
        streamControls.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.style.display = 'none';
        });
    }
    
    // کنترل چت
    if (!permissions.includes('perm-chat-moderate')) {
        const chatControls = ['clear-chat-btn'];
        chatControls.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.style.display = 'none';
        });
    }
    
    // کنترل مسدودیت کاربران
    if (!permissions.includes('perm-ban-users')) {
        const banBtn = document.getElementById('ban-user-btn');
        if (banBtn) banBtn.style.display = 'none';
    }
    
    // نمایش پیام خوش‌آمدگویی
    showLearningMessage(`خوش آمدید ${subAdmin.name}! شما با نقش ${getRoleDisplayName(subAdmin.role)} وارد شده‌اید.`, 'success');
}

// تابع عمومی برای فراخوانی از خارج
window.initializeLearningTab = initializeLearningTab;

// --- آرشیو استریم بازارهای مالی ---
let streamArchive = [];
let currentEditingArchive = null;

function loadStreamArchive() {
  try {
    const stored = localStorage.getItem('streamArchive');
    if (stored) streamArchive = JSON.parse(stored);
  } catch (e) { streamArchive = []; }
}
function saveStreamArchive() {
  try { localStorage.setItem('streamArchive', JSON.stringify(streamArchive)); } catch (e) {}
}

function renderArchiveList() {
  const listDiv = document.getElementById('archive-list');
  if (!listDiv) return;
  listDiv.innerHTML = '';
  // فقط جلسات برگزارشده و دارای ویدیو
  const filtered = streamArchive.filter(a => !a.isLive && a.videoUrl);
  if (filtered.length === 0) {
    listDiv.innerHTML = '<p style="color:#888;text-align:center;">هیچ جلسه‌ای در آرشیو وجود ندارد.</p>';
    return;
  }
  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'archive-card';
    card.innerHTML = `
      <div class="archive-title">${item.title}</div>
      <div class="archive-meta">
        <span class="archive-category">${item.category || ''}</span>
        <span>${item.date || ''}</span>
      </div>
      <div class="archive-desc">${item.description || ''}</div>
      <button class="archive-btn" onclick="showArchiveVideo('${item.id}')">پخش ویدیو</button>
      ${isAdminOrTeacher() ? `<button class="archive-edit-btn" onclick="editArchiveSession('${item.id}')">ویرایش</button><button class="archive-delete-btn" onclick="deleteArchiveSession('${item.id}')">حذف</button>` : ''}
    `;
    listDiv.appendChild(card);
  });
}

function showArchiveVideo(id) {
  const item = streamArchive.find(a => a.id == id);
  if (!item) return;
  const fsDiv = document.getElementById('archive-fullscreen');
  if (!fsDiv) return;
  fsDiv.innerHTML = `
    <div class="archive-title">${item.title}</div>
    <div class="archive-meta">
      <span class="archive-category">${item.category || ''}</span>
      <span>${item.date || ''}</span>
    </div>
    <div class="archive-desc">${item.description || ''}</div>
    ${renderArchiveVideoPlayer(item.videoUrl)}
    <button class="archive-fullscreen-btn" onclick="toggleFullscreenArchiveVideo()">تمام‌صفحه</button>
    <button class="archive-btn" onclick="closeArchiveFullscreen()">بازگشت به لیست</button>
  `;
  fsDiv.style.display = 'flex';
  document.getElementById('archive-list').style.display = 'none';
  document.getElementById('archive-back-btn').style.display = 'block';
}
function closeArchiveFullscreen() {
  document.getElementById('archive-fullscreen').style.display = 'none';
  document.getElementById('archive-list').style.display = 'flex';
  document.getElementById('archive-back-btn').style.display = 'none';
}
function renderArchiveVideoPlayer(url) {
  // پشتیبانی از mp4, آپارات, یوتیوب, گوگل درایو و ...
  if (url.includes('aparat.com')) {
    return `<iframe class="archive-video" src="${url}" allowfullscreen></iframe>`;
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return `<iframe class="archive-video" src="${url}" allowfullscreen></iframe>`;
  } else if (url.endsWith('.mp4')) {
    return `<video class="archive-video" src="${url}" controls></video>`;
  } else if (url.includes('drive.google.com')) {
    return `<iframe class="archive-video" src="${url}" allowfullscreen></iframe>`;
  } else {
    return `<a href="${url}" target="_blank">مشاهده ویدیو</a>`;
  }
}
function toggleFullscreenArchiveVideo() {
  const fsDiv = document.getElementById('archive-fullscreen');
  if (!fsDiv) return;
  if (fsDiv.requestFullscreen) fsDiv.requestFullscreen();
}

function showArchiveAdminPanel() {
  if (!isAdminOrTeacher()) return;
  const panel = document.getElementById('archive-admin-panel');
  if (!panel) return;
  panel.style.display = 'block';
  panel.innerHTML = `
    <form class="archive-form" id="archive-form">
      <label>عنوان جلسه:</label>
      <input type="text" id="archive-title" required>
      <label>توضیحات:</label>
      <textarea id="archive-desc" rows="2"></textarea>
      <label>تاریخ (مثلاً 1403/04/10):</label>
      <input type="text" id="archive-date" required>
      <label>دسته‌بندی:</label>
      <select id="archive-category">
        <option value="کریپتو">کریپتو</option>
        <option value="بورس">بورس</option>
        <option value="فارکس">فارکس</option>
        <option value="آموزش عمومی">آموزش عمومی</option>
      </select>
      <label>لینک ویدیو (mp4, آپارات, یوتیوب، گوگل درایو و ...):</label>
      <input type="text" id="archive-video-url" required placeholder="https://...">
      <button type="submit" class="archive-btn">${currentEditingArchive ? 'ذخیره تغییرات' : 'افزودن به آرشیو'}</button>
      ${currentEditingArchive ? '<button type="button" class="archive-btn" onclick="cancelEditArchiveSession()">انصراف</button>' : ''}
    </form>
  `;
  document.getElementById('archive-form').onsubmit = handleArchiveFormSubmit;
  if (currentEditingArchive) {
    document.getElementById('archive-title').value = currentEditingArchive.title;
    document.getElementById('archive-desc').value = currentEditingArchive.description;
    document.getElementById('archive-date').value = currentEditingArchive.date;
    document.getElementById('archive-category').value = currentEditingArchive.category;
    document.getElementById('archive-video-url').value = currentEditingArchive.videoUrl;
  }
}
function handleArchiveFormSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('archive-title').value.trim();
  const description = document.getElementById('archive-desc').value.trim();
  const date = document.getElementById('archive-date').value.trim();
  const category = document.getElementById('archive-category').value;
  const videoUrl = document.getElementById('archive-video-url').value.trim();
  if (!title || !date || !videoUrl) {
    alert('لطفاً همه فیلدهای ضروری را پر کنید.');
    return;
  }
  if (currentEditingArchive) {
    // ویرایش
    currentEditingArchive.title = title;
    currentEditingArchive.description = description;
    currentEditingArchive.date = date;
    currentEditingArchive.category = category;
    currentEditingArchive.videoUrl = videoUrl;
    currentEditingArchive.isLive = false;
  } else {
    // افزودن جدید
    streamArchive.push({
      id: Date.now().toString(),
      title,
      description,
      date,
      category,
      videoUrl,
      isLive: false
    });
  }
  saveStreamArchive();
  currentEditingArchive = null;
  showArchiveAdminPanel();
  renderArchiveList();
}
function editArchiveSession(id) {
  currentEditingArchive = streamArchive.find(a => a.id == id);
  showArchiveAdminPanel();
}
function cancelEditArchiveSession() {
  currentEditingArchive = null;
  showArchiveAdminPanel();
}
function deleteArchiveSession(id) {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این جلسه را حذف کنید؟')) return;
  streamArchive = streamArchive.filter(a => a.id != id);
  saveStreamArchive();
  renderArchiveList();
  showArchiveAdminPanel();
}
function isAdminOrTeacher() {
  // بررسی ادمین یا مدرس بودن (بر اساس کیف پول یا نقش)
  // این تابع باید با سیستم شما هماهنگ شود
  // نمونه ساده:
  try {
    const address = window.contractConfig?.address;
    if (!address) return false;
    // فرض: ادمین یا مدرس در localStorage یا متغیر global ذخیره شده
    // یا از smart contract خوانده شود
    // اینجا فقط برای تست:
    return address.toLowerCase() === '0xadminaddress...' || address.toLowerCase() === '0xteacheraddress...';
  } catch { return false; }
}

// --- هماهنگی با تب‌بندی ---
function setupArchiveTab() {
  const archiveTabBtn = document.createElement('button');
  archiveTabBtn.className = 'tab-btn list-btn';
  archiveTabBtn.id = 'tab-archive-btn';
  archiveTabBtn.textContent = 'آرشیو بازارهای مالی';
  archiveTabBtn.onclick = function() {
    showArchiveTab();
  };
  // اضافه به تب‌ها
  const tabHeaders = document.querySelector('.tab-headers .dashboard-cards-list');
  if (tabHeaders && !document.getElementById('tab-archive-btn')) {
    tabHeaders.appendChild(archiveTabBtn);
  }
}
function showArchiveTab() {
  // مخفی کردن سایر بخش‌ها
  document.querySelectorAll('.page-section').forEach(e => e.style.display = 'none');
  document.getElementById('learning-archive-section').style.display = 'block';
  loadStreamArchive();
  renderArchiveList();
  showArchiveAdminPanel();
}
// راه‌اندازی اولیه تب آرشیو
setupArchiveTab(); 