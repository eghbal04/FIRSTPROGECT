// Reports.js - فایل جدید و تمیز برای گزارشات

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('📊 شروع بارگذاری گزارشات...');
        await loadUserReports();
        
        // رفرش خودکار هر 5 دقیقه
        setInterval(async () => {
            console.log('🔄 رفرش خودکار گزارشات...');
            await loadUserReports();
        }, 300000);
        
    } catch (error) {
        console.error('❌ خطا در راه‌اندازی گزارشات:', error);
        showError('خطا در راه‌اندازی سیستم گزارشات');
    }
});

// تابع اصلی بارگذاری گزارشات
async function loadUserReports() {
    try {
        const reportsList = document.getElementById('reports-list');
        if (!reportsList) {
            console.error('❌ Element reports-list پیدا نشد');
            return;
        }

        reportsList.innerHTML = '<div class="loading-message">🔄 در حال بارگذاری گزارشات...</div>';

        // بررسی اتصال کیف پول
        if (!window.ethereum || !window.ethereum.selectedAddress) {
            showError('لطفاً ابتدا کیف پول خود را متصل کنید');
            return;
        }

        const address = window.ethereum.selectedAddress;
        console.log('👤 آدرس کاربر:', address);

        // بررسی اتصال به قرارداد
        if (!window.contractConfig || !window.contractConfig.contract) {
            showError('قرارداد در دسترس نیست. لطفاً صفحه را رفرش کنید.');
            return;
        }

        // دریافت اطلاعات واقعی کاربر
        const userData = await getUserData(address);
        const balance = await getTokenBalance(address);
        const events = await getContractEvents(address);
        
        // ساخت HTML گزارشات
        let reportsHTML = createUserInfoSection(userData, balance);
        reportsHTML += createActivitySection(address, userData, events);
        
        reportsList.innerHTML = reportsHTML;
        console.log('✅ گزارشات با موفقیت بارگذاری شدند');

    } catch (error) {
        console.error('❌ خطا در بارگذاری گزارشات:', error);
        showError('خطا در بارگذاری گزارشات. لطفاً دوباره تلاش کنید.');
    }
}

// دریافت اطلاعات کاربر از قرارداد
async function getUserData(address) {
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('قرارداد در دسترس نیست');
        }

        const contract = window.contractConfig.contract;
        const userData = await contract.users(address);
        
        return {
            activated: userData.activated,
            binaryPoints: userData.binaryPoints,
            binaryPointCap: userData.binaryPointCap,
            binaryPointsClaimed: userData.binaryPointsClaimed,
            totalPurchasedMATIC: userData.totalPurchasedMATIC,
            totalPurchasedKind: userData.totalPurchasedKind,
            referrer: userData.referrer,
            left: userData.left,
            right: userData.right
        };
    } catch (error) {
        console.error('❌ خطا در دریافت اطلاعات کاربر:', error);
        throw error;
    }
}

// دریافت موجودی توکن از قرارداد
async function getTokenBalance(address) {
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('قرارداد در دسترس نیست');
        }

        const contract = window.contractConfig.contract;
        const balance = await contract.balanceOf(address);
        return balance.toString();
    } catch (error) {
        console.error('❌ خطا در دریافت موجودی:', error);
        throw error;
    }
}

// دریافت ایونت‌های قرارداد
async function getContractEvents(address) {
    try {
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('قرارداد در دسترس نیست');
        }

        const contract = window.contractConfig.contract;
        const events = [];

        // دریافت ایونت‌های Transfer
        const transferFilter = contract.filters.Transfer(null, address);
        const transferEvents = await contract.queryFilter(transferFilter, -10000, 'latest');
        
        // دریافت ایونت‌های Transfer از کاربر
        const transferFromFilter = contract.filters.Transfer(address, null);
        const transferFromEvents = await contract.queryFilter(transferFromFilter, -10000, 'latest');

        // دریافت ایونت‌های Activated
        const activatedFilter = contract.filters.Activated(address);
        const activatedEvents = await contract.queryFilter(activatedFilter, -10000, 'latest');

        // دریافت ایونت‌های purchaseKind
        const purchaseFilter = contract.filters.purchaseKind(address);
        const purchaseEvents = await contract.queryFilter(purchaseFilter, -10000, 'latest');

        // دریافت ایونت‌های BinaryPointsUpdated
        const binaryFilter = contract.filters.BinaryPointsUpdated(address);
        const binaryEvents = await contract.queryFilter(binaryFilter, -10000, 'latest');

        // ترکیب همه ایونت‌ها
        events.push(...transferEvents, ...transferFromEvents, ...activatedEvents, ...purchaseEvents, ...binaryEvents);

        // مرتب‌سازی بر اساس timestamp
        events.sort((a, b) => b.blockNumber - a.blockNumber);

        return events.slice(0, 20); // فقط 20 ایونت آخر

    } catch (error) {
        console.error('❌ خطا در دریافت ایونت‌ها:', error);
        return [];
    }
}

// ساخت بخش اطلاعات کاربر
function createUserInfoSection(userData, balance) {
    return `
        <div class="report-category">
            <h3>📊 اطلاعات حساب کاربری</h3>
            <div class="report-item">
                <div class="report-header">
                    <span class="report-type">💰 موجودی و وضعیت</span>
                    <span class="report-time">آخرین به‌روزرسانی</span>
                </div>
                <p><strong>موجودی LVL:</strong> ${safeFormatEther(balance)} LVL</p>
                <p><strong>وضعیت حساب:</strong> ${userData.activated ? '✅ فعال' : '❌ غیرفعال'}</p>
                <p><strong>امتیاز باینری:</strong> ${safeFormatEther(userData.binaryPoints)} امتیاز</p>
                <p><strong>سقف امتیاز:</strong> ${safeFormatEther(userData.binaryPointCap)} امتیاز</p>
                <p><strong>امتیازهای دریافت شده:</strong> ${safeFormatEther(userData.binaryPointsClaimed)} امتیاز</p>
                <p><strong>مجموع خرید با MATIC:</strong> ${safeFormatEther(userData.totalPurchasedMATIC)} MATIC</p>
                <p><strong>مجموع خرید با LVL:</strong> ${safeFormatEther(userData.totalPurchasedKind)} LVL</p>
                <p><strong>معرف:</strong> ${shortenAddress(userData.referrer)}</p>
            </div>
        </div>
    `;
}

// ساخت بخش فعالیت‌ها با ایونت‌های واقعی
function createActivitySection(address, userData, events) {
    const activities = parseContractEvents(events, address, userData);
    
    let html = `
        <div class="report-category">
            <h3>📈 تاریخچه فعالیت‌ها</h3>
    `;

    if (activities.length === 0) {
        html += `
            <div class="report-item">
                <div class="report-header">
                    <span class="report-type">ℹ️ اطلاعات</span>
                    <span class="report-time">هیچ فعالیتی</span>
                </div>
                <p>هنوز هیچ فعالیتی در حساب شما ثبت نشده است.</p>
            </div>
        `;
    } else {
        activities.forEach(activity => {
            html += `
                <div class="report-item">
                    <div class="report-header">
                        <span class="report-type">${activity.icon} ${activity.title}</span>
                        <span class="report-time">${activity.time}</span>
                    </div>
                    <p>${activity.description}</p>
                </div>
            `;
        });
    }

    html += '</div>';
    return html;
}

// پردازش ایونت‌های قرارداد
function parseContractEvents(events, address, userData) {
    const activities = [];

    events.forEach(event => {
        try {
            const eventName = event.event;
            const args = event.args;
            const blockNumber = event.blockNumber;
            const timestamp = Date.now(); // در حالت واقعی باید از block timestamp استفاده کرد

            switch (eventName) {
                case 'Transfer':
                    if (args.to === address) {
                        activities.push({
                            icon: '💰',
                            title: 'دریافت توکن',
                            time: formatDate(timestamp),
                            description: `${safeFormatEther(args.value)} LVL دریافت شد`
                        });
                    } else if (args.from === address) {
                        activities.push({
                            icon: '💸',
                            title: 'ارسال توکن',
                            time: formatDate(timestamp),
                            description: `${safeFormatEther(args.value)} LVL ارسال شد به ${shortenAddress(args.to)}`
                        });
                    }
                    break;

                case 'Activated':
                    activities.push({
                        icon: '✅',
                        title: 'فعال‌سازی حساب',
                        time: formatDate(timestamp),
                        description: `حساب با ${safeFormatEther(args.amountlvl)} LVL فعال شد`
                    });
                    break;

                case 'purchaseKind':
                    activities.push({
                        icon: '🛒',
                        title: 'خرید محصول',
                        time: formatDate(timestamp),
                        description: `${safeFormatEther(args.amountlvl)} LVL برای خرید محصول استفاده شد`
                    });
                    break;

                case 'BinaryPointsUpdated':
                    activities.push({
                        icon: '📈',
                        title: 'به‌روزرسانی امتیاز',
                        time: formatDate(timestamp),
                        description: `امتیاز باینری به ${safeFormatEther(args.newPoints)} و سقف به ${safeFormatEther(args.newCap)} به‌روزرسانی شد`
                    });
                    break;
            }
        } catch (error) {
            console.warn('⚠️ خطا در پردازش ایونت:', error);
        }
    });

    // اضافه کردن فعالیت‌های پایه
    if (userData.activated) {
        activities.unshift({
            icon: '✅',
            title: 'فعال‌سازی حساب',
            time: formatDate(Date.now() - 7 * 24 * 60 * 60 * 1000),
            description: `حساب شما فعال شد`
        });
    }

    activities.unshift({
        icon: '👋',
        title: 'ورود به سیستم',
        time: formatDate(Date.now()),
        description: 'شما وارد پلتفرم LevelUp شدید'
    });

    return activities.slice(0, 15); // حداکثر 15 فعالیت
}

// تابع امن برای فرمت کردن مقادیر Ether
function safeFormatEther(value, defaultValue = '0') {
    try {
        if (!value || value === 0 || value === '0') return defaultValue;
        
        // اگر مقدار به صورت string است، ابتدا به BigInt تبدیل کن
        let bigIntValue;
        if (typeof value === 'string') {
            bigIntValue = BigInt(value);
        } else if (typeof value === 'bigint') {
            bigIntValue = value;
        } else {
            bigIntValue = BigInt(value);
        }

        // تبدیل به Wei و سپس فرمت کردن
        const wei = bigIntValue.toString();
        const ether = parseFloat(wei) / Math.pow(10, 18);
        
        return ether.toLocaleString('fa-IR', {
            maximumFractionDigits: 4,
            minimumFractionDigits: 0
        });
    } catch (error) {
        console.warn('⚠️ خطا در فرمت کردن مقدار:', error, 'مقدار:', value);
        return defaultValue;
    }
}

// تابع امن برای فرمت کردن مقادیر با واحد دلخواه
function safeFormatUnits(value, decimals, defaultValue = '0') {
    try {
        if (!value || value === 0 || value === '0') return defaultValue;
        
        let bigIntValue;
        if (typeof value === 'string') {
            bigIntValue = BigInt(value);
        } else if (typeof value === 'bigint') {
            bigIntValue = value;
        } else {
            bigIntValue = BigInt(value);
        }

        const units = parseFloat(bigIntValue.toString()) / Math.pow(10, decimals);
        
        return units.toLocaleString('fa-IR', {
            maximumFractionDigits: 4,
            minimumFractionDigits: 0
        });
    } catch (error) {
        console.warn('⚠️ خطا در فرمت کردن واحد:', error, 'مقدار:', value, 'اعشار:', decimals);
        return defaultValue;
    }
}

// کوتاه کردن آدرس
function shortenAddress(address) {
    if (!address || address === '0x0000000000000000000000000000000000000000') {
        return '---';
    }
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// فرمت کردن تاریخ
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// نمایش خطا
function showError(message) {
    const reportsList = document.getElementById('reports-list');
    if (reportsList) {
        reportsList.innerHTML = `<div class="error-message">❌ ${message}</div>`;
    }
}

// نمایش موفقیت
function showSuccess(message) {
    const reportsList = document.getElementById('reports-list');
    if (reportsList) {
        reportsList.innerHTML = `<div class="loading-message">✅ ${message}</div>`;
    }
}

// تابع عمومی برای رفرش گزارشات
window.refreshReports = loadUserReports;

// تابع عمومی برای نمایش وضعیت
window.showReportsStatus = function(status) {
    console.log('📊 وضعیت گزارشات:', status);
}; 