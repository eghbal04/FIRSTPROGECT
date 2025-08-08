// کلاس اصلی برای مدیریت دیتابیس شبکه
class NetworkTreeDatabase {
    constructor() {
        this.initFirebase();
        this.initContract();
    }

    // راه‌اندازی اتصال به فایربیس
    async initFirebase() {
        if (typeof firebase !== 'undefined' && firebase.apps.length) {
            this.db = firebase.firestore();
        }
    }

    // راه‌اندازی اتصال به قرارداد هوشمند
    async initContract() {
        try {
            const { contract } = await connectWallet();
            this.contract = contract;
        } catch (error) {
            console.error('Error initializing contract:', error);
        }
    }

    // دریافت اطلاعات کاربر از شبکه
    async getUserInfo(nodeId) {
        try {
            // اطمینان از اتصال به قرارداد
            if (!this.contract) {
                const { contract } = await connectWallet();
                this.contract = contract;
            }

            // دریافت آدرس کاربر از ایندکس
            const userAddress = await this.contract.indexToAddress(nodeId);
            
            // اگر آدرس معتبر نیست
            if (!userAddress || userAddress === '0x0000000000000000000000000000000000000000') {
                throw new Error('Invalid user address');
            }

            // دریافت اطلاعات از قرارداد
            const balance = await this.contract.balanceOf(userAddress);
            const type = await this.getUserType(userAddress);
            const referrals = await this.getReferralsCount(nodeId);
            const networkInfo = await this.getNetworkInfo(nodeId);

            // دریافت اطلاعات اضافی از فایربیس
            let additionalInfo = {};
            if (this.db) {
                try {
                    const doc = await this.db.collection('users').doc(userAddress.toLowerCase()).get();
                    if (doc.exists) {
                        additionalInfo = doc.data();
                    }
                } catch (error) {
                    console.warn('Error fetching Firebase data:', error);
                }
            }

            return {
                id: nodeId,
                wallet: userAddress,
                balance: balance.toString(),
                type: type,
                referrals: referrals,
                networkVolume: networkInfo.volume,
                networkSize: networkInfo.size,
                lastActive: networkInfo.lastActive,
                ...additionalInfo
            };
        } catch (error) {
            console.error('Error getting user info:', error);
            throw error;
        }
    }

    // دریافت نوع کاربر
    async getUserType(address) {
        try {
            // این تابع باید بر اساس منطق قرارداد هوشمند شما پیاده‌سازی شود
            // مثال: بررسی موجودی یا سطح دسترسی
            const balance = await this.contract.balanceOf(address);
            if (balance.gt(ethers.parseEther('1000'))) return 3; // Admin
            if (balance.gt(ethers.parseEther('100'))) return 2; // VIP
            return 1; // Regular
        } catch {
            return 1;
        }
    }

    // دریافت تعداد زیرمجموعه‌ها
    async getReferralsCount(nodeId) {
        try {
            // دریافت تعداد مستقیم از قرارداد
            const direct = await this.contract.getDirectReferrals(nodeId);
            return direct.toString();
        } catch {
            return '0';
        }
    }

    // دریافت اطلاعات شبکه
    async getNetworkInfo(nodeId) {
        try {
            // این اطلاعات باید از قرارداد هوشمند یا دیتابیس شما خوانده شود
            const volume = await this.calculateNetworkVolume(nodeId);
            const size = await this.calculateNetworkSize(nodeId);
            const lastActive = Date.now(); // باید از قرارداد خوانده شود

            return {
                volume: volume.toString(),
                size: size.toString(),
                lastActive
            };
        } catch {
            return {
                volume: '0',
                size: '0',
                lastActive: Date.now()
            };
        }
    }

    // محاسبه حجم شبکه
    async calculateNetworkVolume(nodeId) {
        try {
            // محاسبه مجموع تراکنش‌ها یا حجم معاملات شبکه
            return ethers.parseEther('0');
        } catch {
            return ethers.parseEther('0');
        }
    }

    // محاسبه اندازه شبکه
    async calculateNetworkSize(nodeId) {
        try {
            // محاسبه تعداد کل اعضای زیرمجموعه
            return 0;
        } catch {
            return 0;
        }
    }
}

// ایجاد نمونه از کلاس و اکسپورت آن
window.networkDB = new NetworkTreeDatabase();

// تابع دریافت اطلاعات کاربر برای استفاده در سایر فایل‌ها
window.getUserInfo = async function(nodeId) {
    try {
        return await window.networkDB.getUserInfo(nodeId);
    } catch (error) {
        console.error('Error in getUserInfo:', error);
        return {
            id: nodeId,
            wallet: null,
            balance: '0',
            type: 1,
            referrals: '0',
            networkVolume: '0',
            networkSize: '0',
            lastActive: Date.now()
        };
    }
};
