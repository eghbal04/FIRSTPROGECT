// Simple reports.js

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const isConnected = await window.contractConfig.initializeWeb3();
        if (!isConnected) {
            alert('لطفاً ابتدا کیف پول خود را متصل کنید');
            window.location.href = '../index.html';
            return;
        }

        // بارگذاری اولیه گزارشات
        await loadUserReports();
        
        // ریست کردن شمارنده گزارشات خوانده نشده
        resetUnreadCounter();
        
        // رفرش خودکار گزارشات هر 3 دقیقه
        setInterval(async () => {
            const loadBtn = document.getElementById('load-reports');
            if (loadBtn) {
                loadBtn.disabled = true;
                const originalText = loadBtn.textContent;
                loadBtn.textContent = 'در حال بارگذاری...';
                try {
                    await loadUserReports();
                } finally {
                    loadBtn.disabled = false;
                    loadBtn.textContent = originalText;
                }
            } else {
                await loadUserReports();
            }
        }, 180000);
        
        // فعال‌سازی دکمه بارگذاری گزارشات
        const loadBtn = document.getElementById('load-reports');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                loadUserReports();
            });
        }
        
    } catch (error) {
        console.error('خطا در راه‌اندازی گزارشات:', error);
    }
});

// متغیرهای global
let reportsCheckInterval;
let contractInstance;

function updateReportsBadge(count) {
    const badge = document.querySelector('.reports-badge');
    
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
            badge.classList.add('pulse');
        } else {
            badge.style.display = 'none';
            badge.classList.remove('pulse');
        }
    }
}

function resetUnreadCounter() {
    localStorage.setItem('unreadReportsCount', '0');
    updateReportsBadge();
}

function showNewReportsNotification(count) {
    if (!("Notification" in window)) {
        return;
    }
    
    if (Notification.permission === "granted") {
        new Notification(`شما ${count} گزارش جدید دارید`, {
            body: 'برای مشاهده گزارشات جدید، روی آیکون گزارشات کلیک کنید',
            icon: '/images/notification-icon.png'
        });
    }
}

async function loadUserReports() {
    try {
        const reportsList = document.getElementById('reports-list');
        if (!reportsList) {
            console.error('Element reports-list not found');
            return;
        }
        reportsList.innerHTML = '<p class="loading-message">در حال بارگذاری گزارشات...</p>';

        // مقداردهی contractInstance قبل از بررسی
        const signer = window.contractConfig.signer;
        contractInstance = new ethers.Contract(
            window.contractConfig.CONTRACT_ADDRESS,
            window.contractConfig.LEVELUP_ABI,
            signer
        );

        if (!contractInstance) {
            console.log('Contract instance not available, using sample data');
            displaySampleReports();
            return;
        }
        
        const address = await signer.getAddress();
        // تست مستقیم دریافت ایونت برای دیباگ
        try {
            const testEvents = await contractInstance.queryFilter(contractInstance.filters.TokensBought(address), 0, 'latest');
            console.log('testEvents (TokensBought):', testEvents);
            window._testEvents = testEvents;
        } catch (e) {
            console.error('Error in testEvents queryFilter:', e);
        }
        
        // دریافت اطلاعات کاربر
        const [userData, balance, allowance, binaryPool, rewardPool] = await Promise.all([
            contractInstance.users(address),
            contractInstance.balanceOf(address),
            contractInstance.allowance(address, window.contractConfig.CONTRACT_ADDRESS),
            contractInstance.binaryPool(),
            contractInstance.rewardPool()
        ]);
        
        // فقط ایونت‌های خرید، فروش، فعال‌سازی، خرید باینری و واریز مستقیم متیک با پارامتر کامل
        const filters = [
            contractInstance.filters.TokensBought(address),
            contractInstance.filters.TokensSold(address),
            contractInstance.filters.purchaseKind(address),
            contractInstance.filters.Activated(address),
            contractInstance.filters.DirectMATICReceived(address)
        ];
        
        let allEvents = [];
        // برای دیباگ: متغیر را روی window قرار بده
        window._allEvents = allEvents;
        // جمع‌آوری همه ایونت‌ها به صورت موازی
        const eventsArrays = await Promise.all(filters.map(async (filter) => {
            try {
                if (filter) {
                    return await contractInstance.queryFilter(filter, 0, 'latest');
                }
            } catch (filterError) {
                console.warn(`خطا در دریافت فیلتر ${filter?.event || 'unknown'}:`, filterError);
            }
            return [];
        }));
        allEvents = eventsArrays.flat();
        // مرتب‌سازی بر اساس زمان (blockNumber)
        allEvents.sort((a, b) => {
            const timeA = a.args.timestamp || a.blockNumber;
            const timeB = b.args.timestamp || b.blockNumber;
            return timeB - timeA;
        });
        // برای دیباگ: متغیر را روی window قرار بده
        window._allEvents = allEvents;
        let reportsHTML = `
            <div class="report-category">
                <h3>📊 اطلاعات حساب کاربری</h3>
                <div class="report-item">
                    <div class="report-header">
                        <span class="report-type">💰 موجودی توکن</span>
                        <span class="report-time">آخرین به‌روزرسانی</span>
                    </div>
                    <p><strong>موجودی LVL:</strong> ${parseFloat(ethers.formatEther(balance)).toLocaleString('fa-IR', {maximumFractionDigits: 4})} LVL</p>
                    <p><strong>مجوزهای داده شده:</strong> ${parseFloat(ethers.formatEther(allowance)).toLocaleString('fa-IR', {maximumFractionDigits: 4})} LVL</p>
                    <p><strong>امتیاز باینری:</strong> ${parseFloat(ethers.formatUnits(userData.binaryPoints, 18)).toLocaleString('fa-IR', {maximumFractionDigits: 4})} امتیاز</p>
                    <p><strong>سقف امتیاز:</strong> ${parseFloat(ethers.formatUnits(userData.binaryPointCap, 18)).toLocaleString('fa-IR', {maximumFractionDigits: 4})} امتیاز</p>
                    <p><strong>امتیازهای دریافت شده:</strong> ${parseFloat(ethers.formatUnits(userData.binaryPointsClaimed, 18)).toLocaleString('fa-IR', {maximumFractionDigits: 4})} امتیاز</p>
                    <p><strong>مجموع خرید با MATIC:</strong> ${parseFloat(ethers.formatEther(userData.totalPurchasedMATIC || 0)).toLocaleString('fa-IR', {maximumFractionDigits: 4})} MATIC</p>
                    <p><strong>حجم استخر باینری:</strong> ${parseFloat(ethers.formatEther(binaryPool)).toLocaleString('fa-IR', {maximumFractionDigits: 4})} LVL</p>
                    <p><strong>حجم استخر پاداش:</strong> ${parseFloat(ethers.formatEther(rewardPool)).toLocaleString('fa-IR', {maximumFractionDigits: 4})} LVL</p>
                </div>
            </div>
            <div class="report-category">
                <h3>📈 تاریخچه فعالیت‌ها</h3>
        `;
        if (allEvents.length > 0) {
            allEvents.forEach(event => {
                const eventTime = event.args.timestamp 
                    ? new Date(event.args.timestamp * 1000).toLocaleString('fa-IR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                    : new Date().toLocaleString('fa-IR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                // تشخیص نوع ایونت و توضیح دقیق
                let eventInfo;
                switch (event.event) {
                    case 'TokensBought':
                        eventInfo = {
                            icon: '🟢',
                            title: 'خرید توکن',
                            description: renderEventArgs(event.args, {
                                buyer: 'آدرس خریدار',
                                maticAmount: 'مقدار پرداختی (MATIC)',
                                tokenAmount: 'مقدار دریافتی (LVL)'
                            })
                        };
                        break;
                    case 'TokensSold':
                        eventInfo = {
                            icon: '🔴',
                            title: 'فروش توکن',
                            description: renderEventArgs(event.args, {
                                seller: 'آدرس فروشنده',
                                tokenAmount: 'مقدار فروخته شده (LVL)',
                                maticAmount: 'مقدار دریافتی (MATIC)'
                            })
                        };
                        break;
                    case 'Activated':
                        eventInfo = {
                            icon: '✅',
                            title: 'فعال‌سازی حساب',
                            description: renderEventArgs(event.args, {
                                user: 'آدرس کاربر',
                                amountlvl: 'مقدار فعال‌سازی (LVL)'
                            })
                        };
                        break;
                    case 'purchaseKind':
                        eventInfo = {
                            icon: '📈',
                            title: 'خرید باینری',
                            description: renderEventArgs(event.args, {
                                user: 'آدرس کاربر',
                                amountlvl: 'مقدار خرید (LVL)'
                            })
                        };
                        break;
                    case 'DirectMATICReceived':
                        eventInfo = {
                            icon: '💸',
                            title: 'واریز مستقیم متیک',
                            description: renderEventArgs(event.args, {
                                sender: 'آدرس واریزکننده',
                                amount: 'مقدار واریز شده (MATIC)',
                                newTokenPrice: 'قیمت جدید توکن'
                            })
                        };
                        break;
                    case 'TreeStructureUpdated':
                        eventInfo = {
                            icon: '🌳',
                            title: 'ساختار شبکه',
                            description: renderEventArgs(event.args, {
                                user: 'کاربر',
                                parent: 'والد',
                                referrer: 'معرف',
                                position: 'موقعیت',
                                timestamp: 'زمان'
                            })
                        };
                        break;
                    default:
                        // تشخیص نام ایونت با fragment.name اگر event.event نبود
                        const eventName = event.event || (event.fragment && event.fragment.name) || '';
                        const keys = Object.keys(event.args || {});
                        let labels;
                        if (keys.length && keys.every(k => ['0','1','2'].includes(k))) {
                            if (eventName === 'DirectMATICReceived') {
                                labels = {
                                    0: 'آدرس واریزکننده',
                                    1: 'واریز متیک به قرارداد',
                                    2: 'قیمت جدید توکن'
                                };
                            } else if (eventName === 'TokensBought') {
                                labels = {
                                    0: 'آدرس خریدار',
                                    1: 'پرداخت متیک',
                                    2: 'مینت توکن'
                                };
                            } else if (eventName === 'TokensSold') {
                                labels = {
                                    0: 'آدرس فروشنده',
                                    1: 'سوزاندن توکن',
                                    2: 'دریافت متیک از قرارداد'
                                };
                            } else {
                                labels = {
                                    0: 'آدرس',
                                    1: 'مقدار اول',
                                    2: 'مقدار دوم'
                                };
                            }
                            eventInfo = {
                                icon: '📝',
                                title: eventName || 'ایونت دیگر',
                                description: renderEventArgs(event.args, labels)
                            };
                        } else {
                            // برای سایر ایونت‌ها، همه args را با برچسب فارسی نمایش بده
                            const keyLabels = {
                                maticAmount: 'مقدار متیک',
                                tokenAmount: 'مقدار توکن',
                                amount: 'مقدار',
                                amountlvl: 'مقدار LVL',
                                newTokenPrice: 'قیمت جدید توکن',
                                claimerReward: 'پاداش دریافتی',
                                newPoints: 'امتیاز جدید',
                                newCap: 'سقف جدید',
                                totalDistributed: 'کل توزیع شده',
                                sender: 'فرستنده',
                                buyer: 'خریدار',
                                seller: 'فروشنده',
                                user: 'کاربر',
                                referrer: 'معرف',
                                to: 'گیرنده',
                                from: 'فرستنده',
                                parent: 'والد',
                                timestamp: 'زمان',
                                value: 'مقدار',
                                position: 'موقعیت',
                                side: 'سمت',
                                index: 'ایندکس',
                            };
                            // ساخت داینامیک لیبل‌ها برای همه کلیدها
                            labels = {};
                            Object.keys(event.args || {}).forEach(k => {
                                labels[k] = keyLabels[k] || k;
                            });
                            eventInfo = {
                                icon: '📝',
                                title: eventName || 'ایونت دیگر',
                                description: renderEventArgs(event.args, labels)
                            };
                        }
                }
                if (eventInfo) {
                    reportsHTML += `
                        <div class="report-item">
                            <div class="report-header">
                                <span class="report-type">${eventInfo.icon} ${eventInfo.title}</span>
                                <span class="report-time">${eventTime}</span>
                            </div>
                            <p>${eventInfo.description}</p>
                        </div>
                    `;
                }
            });
        } else {
            // اگر هیچ ایونتی وجود ندارد، فعالیت‌های نمونه نمایش دهیم
            const sampleActivities = generateSampleActivities(address, userData);
            // پیام توضیحی
            reportsHTML += `
                <div class="report-item" style="background: rgba(167, 134, 255, 0.1); border: 1px dashed #a786ff;">
                    <div class="report-header">
                        <span class="report-type">ℹ️ اطلاعات</span>
                        <span class="report-time">نمونه فعالیت‌ها</span>
                    </div>
                    <p>فعالیت‌های زیر بر اساس اطلاعات فعلی حساب شما نمایش داده می‌شوند. پس از انجام تراکنش‌های جدید، فعالیت‌های واقعی اینجا نمایش داده خواهند شد.</p>
                </div>
            `;
            sampleActivities.forEach(activity => {
                reportsHTML += `
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
        reportsHTML += '</div>';
        // بعد از ساخت reportsHTML، برای دیباگ روی window قرار بده
        window._reportsHTML = reportsHTML;
        reportsList.innerHTML = reportsHTML;
        // پیام موفقیت
        console.log('✅ گزارشات با موفقیت بارگذاری شدند');
    } catch (error) {
        console.error('خطا در بارگذاری گزارشات:', error);
        document.getElementById('reports-list').innerHTML = 
            '<p class="error-message">خطا در بارگذاری گزارشات. لطفاً دوباره تلاش کنید.</p>';
    }
}

// درخواست اجازه نمایش نوتیفیکیشن
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        return;
    }
    
    if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notification permission granted");
            }
        });
    }
}

// فراخوانی درخواست اجازه هنگام لود صفحه
requestNotificationPermission();

// تابع کمکی برای کوتاه کردن آدرس
function shortenAddress(address) {
    if (!address || address === ethers.ZeroAddress) return '---';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// تابع تشخیص بهتر ایونت‌ها
function detectEventType(event, userAddress) {
    const eventName = event.event || 'Unknown';
    const args = event.args || {};
    
    // بررسی الگوهای مختلف ایونت‌ها
    if (eventName && eventName.includes('Transfer')) {
        return {
            icon: '🔄',
            title: 'انتقال توکن',
            description: formatTransferDescription(args, userAddress)
        };
    }
    
    if (eventName && eventName.includes('Approval')) {
        return {
            icon: '🔐',
            title: 'مجوز جدید',
            description: `مجوز ${parseFloat(ethers.formatEther(args.value || 0)).toLocaleString('fa-IR', {maximumFractionDigits: 4})} LVL برای ${shortenAddress(args.spender)}`
        };
    }
    
    if (eventName && eventName.includes('Activated')) {
        return {
            icon: '✅',
            title: 'فعال‌سازی حساب',
            description: `حساب با ${parseFloat(ethers.formatEther(args.amountlvl || 0)).toLocaleString('fa-IR', {maximumFractionDigits: 4})} LVL فعال شد`
        };
    }
    
    if (eventName && eventName.includes('Binary')) {
        return {
            icon: '📊',
            title: 'فعالیت باینری',
            description: formatBinaryDescription(args)
        };
    }
    
    if (eventName && eventName.includes('Token')) {
        return {
            icon: '🪙',
            title: 'فعالیت توکن',
            description: formatTokenDescription(args, eventName)
        };
    }
    
    // برای ایونت‌های ناشناخته
    return {
        icon: '📝',
        title: `فعالیت ${eventName}`,
        description: formatUnknownEventDescription(args)
    };
}

// تابع فرمت کردن توضیحات انتقال
function formatTransferDescription(args, userAddress) {
    const amount = parseFloat(ethers.formatEther(args.value || 0)).toLocaleString('fa-IR', {maximumFractionDigits: 4});
    const from = args.from === ethers.ZeroAddress ? 'سیستم' : shortenAddress(args.from);
    const to = args.to === ethers.ZeroAddress ? 'سیستم' : shortenAddress(args.to);
    
    if (args.from === userAddress) {
        return `${amount} LVL به ${to} ارسال شد`;
    } else if (args.to === userAddress) {
        return `${amount} LVL از ${from} دریافت شد`;
    } else {
        return `${amount} LVL بین ${from} و ${to} منتقل شد`;
    }
}

// تابع فرمت کردن توضیحات باینری
function formatBinaryDescription(args) {
    if (args.newPoints) {
        return `امتیاز باینری به ${parseFloat(ethers.formatUnits(args.newPoints, 18)).toLocaleString('fa-IR', {maximumFractionDigits: 4})} رسید`;
    }
    if (args.newPoolSize) {
        return `استخر باینری به ${parseFloat(ethers.formatEther(args.newPoolSize)).toLocaleString('fa-IR', {maximumFractionDigits: 4})} LVL رسید`;
    }
    if (args.claimerReward) {
        return `پاداش ${parseFloat(ethers.formatEther(args.claimerReward)).toLocaleString('fa-IR', {maximumFractionDigits: 4})} LVL دریافت شد`;
    }
    return 'فعالیت باینری انجام شد';
}

// تابع فرمت کردن توضیحات توکن
function formatTokenDescription(args, eventName) {
    const amount = parseFloat(ethers.formatEther(args.tokenAmount || args.amount || 0)).toLocaleString('fa-IR', {maximumFractionDigits: 4});
    
    if (eventName.includes('Bought')) {
        return `${amount} LVL خریداری شد`;
    }
    if (eventName.includes('Sold')) {
        return `${amount} LVL فروخته شد`;
    }
    return `${amount} LVL در تراکنش ${eventName}`;
}

// تابع فرمت کردن توضیحات ایونت ناشناخته
function formatUnknownEventDescription(args) {
    if (!args || Object.keys(args).length === 0) return 'فعالیت جدید در سیستم';
    // کلیدهای مهم و معادل فارسی
    const keyLabels = {
        maticAmount: 'مقدار متیک',
        tokenAmount: 'مقدار توکن',
        amount: 'مقدار',
        amountlvl: 'مقدار LVL',
        newTokenPrice: 'قیمت جدید توکن',
        claimerReward: 'پاداش دریافتی',
        newPoints: 'امتیاز جدید',
        newCap: 'سقف جدید',
        totalDistributed: 'کل توزیع شده',
        sender: 'فرستنده',
        buyer: 'خریدار',
        seller: 'فروشنده',
        user: 'کاربر',
        referrer: 'معرف',
        to: 'گیرنده',
        from: 'فرستنده',
        parent: 'والد',
        timestamp: 'زمان',
        value: 'مقدار',
        position: 'موقعیت',
        side: 'سمت',
        index: 'ایندکس',
    };
    // برچسب‌های موقعیت
    const positionLabels = {
        0: 'چپ',
        1: 'راست',
        2: 'مرکز',
        '0': 'چپ',
        '1': 'راست',
        '2': 'مرکز',
    };
    return Object.keys(args)
        .filter(key => key !== 'timestamp' && key !== 'blockNumber')
        .map(key => {
            const label = keyLabels[key] || key;
            const value = args[key];
            // آدرس ولت (همیشه 0x... و 42 کاراکتر)
            if (typeof value === 'string' && value.startsWith('0x') && value.length === 42) {
                return `${label}: <span dir="ltr">${shortenAddress(value)}</span>`;
            }
            // موقعیت (چپ/راست/مرکز) برای position یا side
            if ((key === 'position' || key === 'side') && (value === 0 || value === 1 || value === 2 || value === '0' || value === '1' || value === '2')) {
                return `${label}: <b>${positionLabels[value]}</b>`;
            }
            // تلاش برای فرمت عددی (Ether)
            if (typeof value === 'bigint' || (typeof value === 'string' && /^\d+$/.test(value))) {
                try {
                    const formatted = ethers.formatEther(value);
                    return `${label}: <b>${parseFloat(formatted).toLocaleString('fa-IR', {maximumFractionDigits: 4})}</b>`;
                } catch {
                    return `${label}: <b>${value.toString()}</b>`;
                }
            }
            // سایر موارد
            return `${label}: <b>${value}</b>`;
        })
        .join('<br>');
}

function generateSampleActivities(address, userData) {
    const now = new Date();
    const activities = [];
    
    // فعالیت ثبت‌نام (اگر کاربر فعال است)
    if (userData.activated) {
        activities.push({
            icon: '✅',
            title: 'فعال‌سازی حساب',
            time: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            description: `حساب شما با ${parseFloat(ethers.formatEther(userData.totalPurchasedMATIC || 0)).toLocaleString('fa-IR', {maximumFractionDigits: 4})} MATIC فعال شد`
        });
    }
    
    // فعالیت خرید توکن (بر اساس موجودی)
    const lvlBalance = parseFloat(ethers.formatUnits(userData.binaryPoints || 0, 18));
    if (lvlBalance > 0) {
        activities.push({
            icon: '🛒',
            title: 'خرید توکن',
            time: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toLocaleString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            description: `${lvlBalance.toLocaleString('fa-IR', {maximumFractionDigits: 4})} LVL خریداری شد`
        });
    }
    
    // فعالیت اتصال کیف پول
    activities.push({
        icon: '🔗',
        title: 'اتصال کیف پول',
        time: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        description: `کیف پول ${shortenAddress(address)} به پلتفرم متصل شد`
    });
    
    // فعالیت دریافت پاداش (اگر امتیاز باینری وجود دارد)
    const binaryPoints = parseFloat(ethers.formatUnits(userData.binaryPoints || 0, 18));
    if (binaryPoints > 0) {
        activities.push({
            icon: '🎁',
            title: 'دریافت پاداش باینری',
            time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            description: `${(binaryPoints * 0.1).toLocaleString('fa-IR', {maximumFractionDigits: 4})} LVL پاداش باینری دریافت شد`
        });
    }
    
    // فعالیت به‌روزرسانی شبکه
    activities.push({
        icon: '🌳',
        title: 'به‌روزرسانی شبکه',
        time: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        description: 'ساختار شبکه باینری شما به‌روزرسانی شد'
    });
    
    // فعالیت آخرین ورود
    activities.push({
        icon: '👋',
        title: 'ورود به سیستم',
        time: now.toLocaleString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        description: 'شما وارد پلتفرم LevelUp شدید'
    });
    
    return activities;
}

// تابع نمایش گزارشات نمونه
function displaySampleReports() {
    const reportsList = document.getElementById('reports-list');
    if (!reportsList) return;
    
    const sampleActivities = [
        {
            icon: '✅',
            title: 'فعال‌سازی حساب',
            time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            description: 'حساب شما با 57 MATIC فعال شد'
        },
        {
            icon: '🛒',
            title: 'خرید توکن',
            time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            description: '6,259,578.9474 LVL خریداری شد'
        },
        {
            icon: '🔗',
            title: 'اتصال کیف پول',
            time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            description: 'کیف پول شما به پلتفرم متصل شد'
        },
        {
            icon: '👋',
            title: 'ورود به سیستم',
            time: new Date().toLocaleString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            description: 'شما وارد پلتفرم LevelUp شدید'
        }
    ];
    
    let reportsHTML = `
        <div class="report-category">
            <h3>📊 اطلاعات حساب کاربری</h3>
            <div class="report-item">
                <div class="report-header">
                    <span class="report-type">💰 موجودی توکن</span>
                    <span class="report-time">آخرین به‌روزرسانی</span>
                </div>
                <p><strong>موجودی LVL:</strong> ۶٬۲۵۹٬۵۷۸٫۹۴۷۴ LVL</p>
                <p><strong>مجوزهای داده شده:</strong> ۰ LVL</p>
                <p><strong>امتیاز باینری:</strong> ۰ امتیاز</p>
                <p><strong>سقف امتیاز:</strong> ۰ امتیاز</p>
                <p><strong>امتیازهای دریافت شده:</strong> ۰ امتیاز</p>
                <p><strong>مجموع خرید با MATIC:</strong> ۵۷ MATIC</p>
                <p><strong>حجم استخر باینری:</strong> ۰ LVL</p>
                <p><strong>حجم استخر پاداش:</strong> ۰ LVL</p>
            </div>
        </div>
        
        <div class="report-category">
            <h3>📈 تاریخچه فعالیت‌ها</h3>
            <div class="report-item" style="background: rgba(167, 134, 255, 0.1); border: 1px dashed #a786ff;">
                <div class="report-header">
                    <span class="report-type">ℹ️ اطلاعات</span>
                    <span class="report-time">نمونه فعالیت‌ها</span>
                </div>
                <p>فعالیت‌های زیر بر اساس اطلاعات فعلی حساب شما نمایش داده می‌شوند. پس از انجام تراکنش‌های جدید، فعالیت‌های واقعی اینجا نمایش داده خواهند شد.</p>
            </div>
        </div>
    `;
    
    sampleActivities.forEach(activity => {
        reportsHTML += `
            <div class="report-item">
                <div class="report-header">
                    <span class="report-type">${activity.icon} ${activity.title}</span>
                    <span class="report-time">${activity.time}</span>
                </div>
                <p>${activity.description}</p>
            </div>
        `;
    });
    
    reportsHTML += '</div>';
    reportsList.innerHTML = reportsHTML;
}

// Helper: نمایش آرگومان‌های ایونت با برچسب فارسی و خط جداگانه
function renderEventArgs(args, labels) {
    if (!args) return '';
    return Object.entries(labels).map(([key, label]) => {
        const value = args[key];
        if (value === undefined) return '';
        
        try {
            if (typeof value === 'string' && value.startsWith('0x') && value.length === 42) {
                return `${label}: <span dir="ltr">${shortenAddress(value)}</span>`;
            }
            if (typeof value === 'bigint' || (typeof value === 'string' && /^\d+$/.test(value))) {
                try {
                    const formatted = ethers.formatEther(value);
                    return `${label}: <b>${parseFloat(formatted).toLocaleString('fa-IR', {maximumFractionDigits: 4})}</b>`;
                } catch (formatError) {
                    // اگر formatEther خطا داد، مقدار اصلی را نمایش بده
                    return `${label}: <b>${value.toString()}</b>`;
                }
            }
            // موقعیت باینری
            if ((key === 'position' || key === 'side') && (value === 0 || value === 1 || value === 2 || value === '0' || value === '1' || value === '2')) {
                const posLabels = {0: 'چپ', 1: 'راست', 2: 'مرکز', '0': 'چپ', '1': 'راست', '2': 'مرکز'};
                return `${label}: <b>${posLabels[value]}</b>`;
            }
            return `${label}: <b>${value}</b>`;
        } catch (error) {
            console.warn(`Error rendering arg ${key}:`, error);
            return `${label}: <b>خطا در نمایش</b>`;
        }
    }).filter(Boolean).join('<br>');
}
