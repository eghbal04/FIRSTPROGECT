class UserProfileManager {
    constructor() {
        this.currentUser = null;
        this.userProfiles = this.loadUserProfiles();
        this.init();
    }

    async init() {
        await this.checkUserAccess();
        this.setupEventListeners();
    }

    async checkUserAccess() {
        try {
            if (typeof window.connectWallet === 'function') {
                const { contract, signer } = await window.connectWallet();
                const address = await signer.getAddress();
                const userIndex = await contract.getUserIndex(address);
                this.currentUser = { address, index: userIndex.toNumber() };
            }
        } catch (error) {
            console.log('کاربر متصل نیست:', error);
        }
    }

    loadUserProfiles() {
        const profiles = localStorage.getItem('IAM_user_profiles');
        return profiles ? JSON.parse(profiles) : {};
    }

    saveUserProfiles() {
        localStorage.setItem('IAM_user_profiles', JSON.stringify(this.userProfiles));
    }

    createUserProfile(address, data = {}) {
        const profile = {
            address: address,
            name: data.name || '',
            bio: data.bio || '',
            avatar: data.avatar || '',
            joinDate: data.joinDate || '',
            socialLinks: data.socialLinks || {},
            stats: data.stats || {
                totalPurchases: 0,
                totalSpent: 0,
                favoriteProducts: [],
                reviews: []
            },
            ...data
        };
        
        this.userProfiles[address] = profile;
        this.saveUserProfiles();
        return profile;
    }

    getUserProfile(address) {
        return this.userProfiles[address] || this.createUserProfile(address);
    }

    updateUserProfile(address, updates) {
        const profile = this.getUserProfile(address);
        const updatedProfile = { ...profile, ...updates };
        this.userProfiles[address] = updatedProfile;
        this.saveUserProfiles();
        return updatedProfile;
    }

    createProfilePage(address) {
        const profile = this.getUserProfile(address);
        const pageContent = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>پروفایل ${profile.name} - imphoenix</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/hamburger-menu.css">
    <!-- <link rel="stylesheet" href="css/floating-ai-assistant.css"> -->
    <style>
        .profile-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .profile-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 30px;
            position: relative;
        }
        
        .profile-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3em;
            margin: 0 auto 20px;
            border: 4px solid rgba(255,255,255,0.3);
        }
        
        .profile-name {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .profile-bio {
            font-size: 1.2em;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        
        .profile-address {
            font-family: monospace;
            background: rgba(255,255,255,0.1);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        
        .profile-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #1976d2;
        }
        
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        
        .profile-sections {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        
        .profile-section {
            background: #fff;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .section-title {
            font-size: 1.3em;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
        }
        
        .social-links {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .social-link {
            display: flex;
            align-items: center;
            padding: 8px 15px;
            background: #f8f9fa;
            border-radius: 20px;
            text-decoration: none;
            color: #333;
            transition: background 0.3s ease;
        }
        
        .social-link:hover {
            background: #e9ecef;
        }
        
        .purchase-history {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .purchase-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .purchase-item:last-child {
            border-bottom: none;
        }
        
        .purchase-info {
            flex: 1;
        }
        
        .purchase-title {
            font-weight: bold;
            color: #333;
        }
        
        .purchase-date {
            font-size: 0.9em;
            color: #666;
        }
        
        .purchase-amount {
            font-weight: bold;
            color: #1976d2;
        }
        
        .edit-profile-btn {
            position: absolute;
            top: 20px;
            left: 20px;
            padding: 10px 20px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .edit-profile-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        @media (max-width: 768px) {
            .profile-sections {
                grid-template-columns: 1fr;
            }
            
            .profile-stats {
                grid-template-columns: 1fr;
            }
            
            .profile-name {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="profile-container">
        <div class="profile-header">
            <button class="edit-profile-btn" onclick="editProfile()">✏️ ویرایش پروفایل</button>
            <div class="profile-avatar">${profile.avatar}</div>
            <div class="profile-name">${profile.name}</div>
            <div class="profile-bio">${profile.bio}</div>
            <div class="profile-address">${profile.address}</div>
        </div>
        
        <div class="profile-stats">
            <div class="stat-card">
                <div class="stat-number">${profile.stats.totalPurchases}</div>
                <div class="stat-label">تعداد خرید</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${profile.stats.totalSpent}</div>
                <div class="stat-label">مجموع هزینه (IAM)</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${profile.stats.reviews.length}</div>
                <div class="stat-label">تعداد نظرات</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.getDaysSinceJoin(profile.joinDate)}</div>
                <div class="stat-label">روز عضویت</div>
            </div>
        </div>
        
        <div class="profile-sections">
            <div class="profile-section">
                <div class="section-title">لینک‌های اجتماعی</div>
                <div class="social-links">
                    ${this.renderSocialLinks(profile.socialLinks)}
                </div>
            </div>
            
            <div class="profile-section">
                <div class="section-title">تاریخچه خرید</div>
                <div class="purchase-history">
                    ${this.renderPurchaseHistory(profile.stats.purchases || [])}
                </div>
            </div>
        </div>
    </div>

    <script src="js/config.js"></script>
    <script src="js/navbar.js"></script>
    <script src="js/hamburger-menu.js"></script>
    <!-- <script src="js/floating-ai-assistant.js"></script> -->
    <script src="js/user-profile-manager.js"></script>
    <script>
        const userProfileManager = new UserProfileManager();
        
        function editProfile() {
            // در اینجا می‌توانید فرم ویرایش پروفایل را نمایش دهید
            alert('قابلیت ویرایش پروفایل به زودی اضافه خواهد شد');
        }
    </script>
</body>
</html>`;
        
        return pageContent;
    }

    getDaysSinceJoin(joinDate) {
        const join = new Date(joinDate);
        const now = new Date();
        const diffTime = Math.abs(now - join);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    renderSocialLinks(socialLinks) {
        const links = [];
        for (const [platform, url] of Object.entries(socialLinks)) {
            if (url) {
                const icons = {
                    telegram: '📱',
                    twitter: '🐦',
                    instagram: '📷',
                    linkedin: '💼',
                    website: '🌐',
                    email: '📧'
                };
                links.push(`
                    <a href="${url}" class="social-link" target="_blank">
                        ${icons[platform] || '🔗'} ${platform}
                    </a>
                `);
            }
        }
        return links.length > 0 ? links.join('') : '<p>لینک اجتماعی ثبت نشده</p>';
    }

    renderPurchaseHistory(purchases) {
        if (purchases.length === 0) {
            return '<p>هنوز خریدی انجام نداده‌اید</p>';
        }
        
        return purchases.map(purchase => `
            <div class="purchase-item">
                <div class="purchase-info">
                    <div class="purchase-title">${purchase.productName}</div>
                    <div class="purchase-date">${new Date(purchase.date).toLocaleDateString('en-US')}</div>
                </div>
                <div class="purchase-amount">${purchase.amount} IAM</div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // اضافه کردن event listeners برای تعامل با پروفایل
        document.addEventListener('click', (e) => {
            if (e.target.matches('.profile-link')) {
                e.preventDefault();
                const address = e.target.dataset.address;
                this.openUserProfile(address);
            }
        });
    }

    openUserProfile(address) {
        // ایجاد URL برای پروفایل کاربر
        const profileUrl = `user-profile-${address}.html`;
        
        // اگر فایل وجود ندارد، آن را ایجاد کن
        if (!this.userProfiles[address]) {
            this.createUserProfile(address);
        }
        
        // باز کردن پروفایل در تب جدید
        window.open(profileUrl, '_blank');
    }

    // تابع برای ایجاد فایل‌های پروفایل کاربران
    generateProfileFiles() {
        for (const [address, profile] of Object.entries(this.userProfiles)) {
            const pageContent = this.createProfilePage(address);
            const fileName = `user-profile-${address}.html`;
            
            // در یک محیط واقعی، این فایل باید در سرور ذخیره شود
            // فعلاً فقط در localStorage ذخیره می‌کنیم
            localStorage.setItem(`profile_page_${address}`, pageContent);
        }
    }
}

// ایجاد instance جهانی
let userProfileManager;

// راه‌اندازی پس از بارگذاری صفحه
document.addEventListener('DOMContentLoaded', function() {
    userProfileManager = new UserProfileManager();
});

// توابع عمومی برای استفاده در HTML
window.openUserProfile = function(address) {
    userProfileManager?.openUserProfile(address);
};

window.createUserProfile = function(address, data) {
    return userProfileManager?.createUserProfile(address, data);
};

window.updateUserProfile = function(address, updates) {
    return userProfileManager?.updateUserProfile(address, updates);
}; 