document.addEventListener('DOMContentLoaded', async () => {
    const isConnected = await window.contractConfig.initializeWeb3();
    if (!isConnected) {
        alert('لطفاً ابتدا کیف پول خود را متصل کنید');
        window.location.href = '../index.html';
        return;
    }

    // ذخیره زمان آخرین چک در localStorage
    let lastChecked = localStorage.getItem('lastReportCheck') || 0;
    let unreadCount = localStorage.getItem('unreadReportsCount') || 0;
    
    // بارگذاری اولیه گزارشات
    await loadUserReports();
    
    // شروع چک کردن خودکار هر 60 ثانیه
    startAutoCheck();
    
    // وقتی کاربر صفحه گزارشات را باز می‌کند، شمارنده را ریست می‌کنیم
    resetUnreadCounter();
});

// متغیرهای global
let reportsCheckInterval;
let contractInstance;

async function startAutoCheck() {
    if (reportsCheckInterval) {
        clearInterval(reportsCheckInterval);
    }
    
    const provider = window.contractConfig.provider;
    contractInstance = new ethers.Contract(
        window.contractConfig.CONTRACT_ADDRESS,
        window.contractConfig.LEVELUP_ABI,
        provider
    );
    
    // چک کردن خودکار هر 60 ثانیه
    reportsCheckInterval = setInterval(async () => {
        await checkForNewReports();
    }, 60000);
    
    // چک اولیه
    await checkForNewReports();
}

async function checkForNewReports() {
    try {
        const address = await window.contractConfig.signer.getAddress();
        const lastChecked = localStorage.getItem('lastReportCheck') || 0;
        const currentTime = Math.floor(Date.now() / 1000);
        
        // فیلتر ایونت‌های مربوط به کاربر با توجه به ABI جدید
        const filters = [
            contractInstance.filters.Activated(address),
            contractInstance.filters.TokensBought(address),
            contractInstance.filters.TokensSold(address),
            contractInstance.filters.BinaryPointsUpdated(address),
            contractInstance.filters.BinaryRewardDistributed(address),
            contractInstance.filters.DirectMATICReceived(address),
            contractInstance.filters.TreeStructureUpdated(address),
            contractInstance.filters.Approval(address),
            contractInstance.filters.Transfer(address, null),
            contractInstance.filters.Transfer(null, address)
        ];
        
        let newEvents = [];
        
        // دریافت ایونت‌ها از هر فیلتر
        for (const filter of filters) {
            try {
                const events = await contractInstance.queryFilter(filter, lastChecked);
                newEvents = [...newEvents, ...events];
            } catch (filterError) {
                console.warn(`خطا در دریافت فیلتر ${filter.event}:`, filterError);
            }
        }
        
        if (newEvents.length > 0) {
            // به‌روزرسانی زمان آخرین چک
            localStorage.setItem('lastReportCheck', currentTime);
            
            // افزایش شمارنده گزارشات خوانده نشده
            const currentCount = parseInt(localStorage.getItem('unreadReportsCount') || 0);
            localStorage.setItem('unreadReportsCount', currentCount + newEvents.length);
            
            // به‌روزرسانی نشانگر در نوار منو
            updateReportsBadge();
            
            // اگر صفحه گزارشات باز است، گزارشات را رفرش کنید
            if (window.location.pathname.includes('reports.html')) {
                await loadUserReports();
                resetUnreadCounter();
            }
            
            // نمایش نوتیفیکیشن برای گزارشات جدید
            showNewReportsNotification(newEvents.length);
        }
    } catch (error) {
        console.error('خطا در بررسی گزارشات جدید:', error);
    }
}

function updateReportsBadge() {
    const count = parseInt(localStorage.getItem('unreadReportsCount') || 0);
    const badge = document.querySelector('.reports-badge');
    
    if (badge) {
        badge.textContent = count > 9 ? '9+' : count.toString();
        badge.style.display = count > 0 ? 'block' : 'none';
        
        // اضافه کردن انیمیشن برای گزارشات جدید
        if (count > 0) {
            badge.classList.add('pulse');
        } else {
            badge.classList.remove('pulse');
        }
    }
}

function resetUnreadCounter() {
    localStorage.setItem('unreadReportsCount', '0');
    updateReportsBadge();
}

function showNewReportsNotification(count) {
    // بررسی آیا مرورگر از نوتیفیکیشن پشتیبانی می‌کند
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
        return;
    }
    
    // بررسی آیا اجازه نمایش نوتیفیکیشن داده شده است
    if (Notification.permission === "granted") {
        new Notification(`شما ${count} گزارش جدید دارید`, {
            body: 'برای مشاهده گزارشات جدید، روی آیکون گزارشات کلیک کنید',
            icon: '/images/notification-icon.png'
        });
    }
}

async function loadUserReports() {
    try {
        // مقداردهی contractInstance با signer برای دسترسی به توابع
        const signer = window.contractConfig.signer;
        contractInstance = new ethers.Contract(
            window.contractConfig.CONTRACT_ADDRESS,
            window.contractConfig.LEVELUP_ABI,
            signer
        );
        
        const address = await signer.getAddress();
        const reportsList = document.getElementById('reports-list');
        
        reportsList.innerHTML = '<p class="loading-message">در حال بارگذاری گزارشات...</p>';
        
        // دریافت اطلاعات کاربر و داده‌های جدید
        const [userData, balance, allowance, binaryPool, rewardPool] = await Promise.all([
            contractInstance.users(address),
            contractInstance.balanceOf(address),
            contractInstance.allowance(address, window.contractConfig.CONTRACT_ADDRESS),
            contractInstance.binaryPool(),
            contractInstance.rewardPool()
        ]);
        
        // دریافت تمام ایونت‌های مربوط به کاربر با ABI جدید
// در تابع checkForNewReports و loadUserReports
        const filters = [
            contractInstance.filters.Activated(address),
            contractInstance.filters.Approval(address, null),
            contractInstance.filters.BinaryPointsUpdated(address),
            contractInstance.filters.BinaryPoolUpdated(),
            contractInstance.filters.BinaryRewardDistributed(address),
            contractInstance.filters.DirectMATICReceived(address),
            contractInstance.filters.TokensBought(address),
            contractInstance.filters.TokensSold(address),
            contractInstance.filters.Transfer(address, null),
            contractInstance.filters.Transfer(null, address),
            contractInstance.filters.TreeStructureUpdated(address),
            contractInstance.filters.purchaseKind(address)
        ];
                
        let allEvents = [];
        
        for (const filter of filters) {
            try {
                const events = await contractInstance.queryFilter(filter);
                allEvents = [...allEvents, ...events];
            } catch (filterError) {
                console.warn(`خطا در دریافت فیلتر ${filter.event}:`, filterError);
            }
        }
        
        // مرتب کردن ایونت‌ها بر اساس زمان (جدیدترین اول)
        allEvents.sort((a, b) => {
            const timeA = a.args.timestamp || a.blockNumber;
            const timeB = b.args.timestamp || b.blockNumber;
            return timeB - timeA;
        });
        
        let reportsHTML = `
            <div class="report-category">
                <h3>اطلاعات حساب</h3>
                <div class="report-item">
                    <p>موجودی LVL: ${ethers.formatEther(balance)}</p>
                    <p>مجوزهای داده شده: ${ethers.formatEther(allowance)}</p>
                    <p>امتیاز باینری: ${userData.binaryPoints}</p>
                    <p>سقف امتیاز: ${userData.binaryPointCap}</p>
                    <p>امتیازهای دریافت شده: ${userData.binaryPointsClaimed}</p>
                    <p>مجموع خرید با MATIC: ${ethers.formatEther(userData.totalPurchasedMATIC || 0)}</p>
                    <p>حجم استخر باینری: ${ethers.formatEther(binaryPool)} LVL</p>
                    <p>حجم استخر پاداش: ${ethers.formatEther(rewardPool)} LVL</p>
                </div>
            </div>
            
            <div class="report-category">
                <h3>تاریخچه فعالیت‌ها</h3>
        `;
        
        if (allEvents.length > 0) {
            allEvents.forEach(event => {
                const eventTime = event.args.timestamp 
                    ? new Date(event.args.timestamp * 1000).toLocaleString('fa-IR')
                    : new Date().toLocaleString('fa-IR');
                let eventDescription = '';
                
                switch (event.event) {
                    case 'Activated':
                        eventDescription = `عضویت در سیستم با ${ethers.formatEther(event.args.amountlvl || 0)} LVL`;
                        break;
                    case 'Approval':
                        eventDescription = `مجوز جدید برای ${event.args.spender}: ${ethers.formatEther(event.args.value)} LVL`;
                        break;
                    case 'BinaryPointsUpdated':
                        eventDescription = `به‌روزرسانی امتیاز به ${event.args.newPoints || 0} (سقف: ${event.args.newCap || 0})`;
                        break;
                    case 'BinaryPoolUpdated':
                        eventDescription = `به‌روزرسانی استخر باینری (حجم جدید: ${ethers.formatEther(event.args.newPoolSize || 0)}، مقدار اضافه شده: ${ethers.formatEther(event.args.addedAmount || 0)})`;
                        break;
                    case 'BinaryRewardDistributed':
                        eventDescription = `توزیع پاداش باینری (مجموع: ${ethers.formatEther(event.args.totalDistributed || 0)}، پاداش شما: ${ethers.formatEther(event.args.claimerReward || 0)})`;
                        break;
                    case 'DirectMATICReceived':
                        eventDescription = `دریافت ${ethers.formatEther(event.args.amount || 0)} MATIC (قیمت جدید توکن: ${ethers.formatEther(event.args.newTokenPrice || 0)})`;
                        break;
                    case 'TokensBought':
                        eventDescription = `خرید ${ethers.formatEther(event.args.tokenAmount || 0)} LVL با ${ethers.formatEther(event.args.maticAmount || 0)} MATIC`;
                        break;
                    case 'TokensSold':
                        eventDescription = `فروش ${ethers.formatEther(event.args.tokenAmount || 0)} LVL برای ${ethers.formatEther(event.args.maticAmount || 0)} MATIC`;
                        break;
                    case 'Transfer':
                        eventDescription = `انتقال ${ethers.formatEther(event.args.value)} LVL از ${event.args.from || 'سیستم'} به ${event.args.to || 'سیستم'}`;
                        break;
                    case 'TreeStructureUpdated':
                        eventDescription = `به‌روزرسانی ساختار درخت (ارجاع دهنده: ${event.args.referrer}, موقعیت: ${event.args.position === 0 ? 'چپ' : 'راست'})`;
                        break;
                    case 'purchaseKind':
                        eventDescription = `خرید ویژه با ${ethers.formatEther(event.args.amountlvl || 0)} LVL`;
                        break;
                    default:
                        eventDescription = event.event;
                }
                
                reportsHTML += `
                    <div class="report-item">
                        <div class="report-header">
                            <span class="report-type">${event.event}</span>
                            <span class="report-time">${eventTime}</span>
                        </div>
                        <p>${eventDescription}</p>
                    </div>
                `;
            });
        } else {
            reportsHTML += '<p class="no-reports">هیچ فعالیتی ثبت نشده است</p>';
        }
        
        reportsHTML += '</div>';
        reportsList.innerHTML = reportsHTML;
        
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