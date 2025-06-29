// reports.js - بخش گزارشات و فعالیت‌ها
let isReportsLoading = false;

document.addEventListener('DOMContentLoaded', function() {
    // Reports section loaded, waiting for wallet connection...
    waitForWalletConnection();
});

async function waitForWalletConnection() {
    try {
        // Reports section loaded, waiting for wallet connection...
        // بررسی اتصال کیف پول
        const connection = await checkConnection();
        if (!connection.connected) {
            showReportsError("لطفا ابتدا کیف پول خود را متصل کنید");
        return;
    }
    
        // بارگذاری گزارشات
        await loadReports();

        // راه‌اندازی فیلترها
        setupFilters();

        // به‌روزرسانی خودکار هر 5 دقیقه
        setInterval(loadReports, 300000);

    } catch (error) {
        console.error("Error in reports section:", error);
        showReportsError("خطا در بارگذاری گزارشات");
    }
}

// تابع اتصال به کیف پول با انتظار
async function connectWallet() {
    try {
        console.log('Reports: Attempting to connect wallet...');
        
        // بررسی اتصال موجود
        if (window.contractConfig && window.contractConfig.contract) {
            console.log('Reports: Wallet already connected');
            return window.contractConfig;
        }
        
        // بررسی اتصال MetaMask موجود
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                console.log('Reports: MetaMask already connected, initializing Web3...');
                try {
                    await initializeWeb3();
                    return window.contractConfig;
                } catch (error) {
                    console.log('Reports: Failed to initialize Web3:', error);
                    throw new Error('خطا در راه‌اندازی Web3');
                }
            }
        }
        
        console.log('Reports: No existing connection, user needs to connect manually');
        throw new Error('لطفاً ابتدا کیف پول خود را متصل کنید');
        
    } catch (error) {
        console.error('Reports: Error connecting wallet:', error);
        showReportsError('خطا در اتصال به کیف پول');
        throw error;
    }
}

// تابع فرمت کردن آدرس
function shortenAddress(address) {
    if (!address) return '-';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// تابع فرمت کردن هش تراکنش
function shortenTransactionHash(hash) {
    if (!hash) return '-';
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

// تابع فرمت تاریخ بهبود یافته
    function formatDate(timestamp) {
    try {
        // بررسی اعتبار timestamp
        if (!timestamp || isNaN(timestamp)) {
            console.warn("Invalid timestamp:", timestamp);
            return "تاریخ نامعتبر";
        }
        
        console.log("Formatting timestamp:", timestamp, "Type:", typeof timestamp);
        
        // تبدیل timestamp به تاریخ
        let date;
        if (timestamp < 1000000000000) {
            // اگر timestamp در ثانیه است، به میلی‌ثانیه تبدیل کن
            date = new Date(timestamp * 1000);
            console.log("Timestamp in seconds, converted to:", date.toISOString());
        } else {
            // اگر timestamp در میلی‌ثانیه است
            date = new Date(timestamp);
            console.log("Timestamp in milliseconds, converted to:", date.toISOString());
        }
        
        // بررسی اعتبار تاریخ
        if (isNaN(date.getTime())) {
            console.warn("Invalid date from timestamp:", timestamp);
            return "تاریخ نامعتبر";
        }
        
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        // اگر کمتر از 1 دقیقه
        if (diffInSeconds < 60) {
            return `${diffInSeconds} ثانیه پیش`;
        }
        
        // اگر کمتر از 1 ساعت
        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} دقیقه پیش`;
        }
        
        // اگر کمتر از 1 روز
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ساعت پیش`;
        }
        
        // اگر کمتر از 7 روز
        if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} روز پیش`;
        }
        
        // برای تاریخ‌های قدیمی، نمایش تاریخ کامل
        const persianMonths = [
            'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
            'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ];
        
        const persianDays = [
            'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'
        ];
        
        // تبدیل به تاریخ شمسی (تقریبی)
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        // تبدیل تقریبی به شمسی (سال شمسی = سال میلادی - 621)
        const persianYear = year - 621;
        const persianMonth = persianMonths[month];
        
        return `${day} ${persianMonth} ${persianYear} - ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
    } catch (error) {
        console.error("Error formatting date:", error, "timestamp:", timestamp);
        return "خطا در نمایش تاریخ";
    }
    }
    
    // تابع فرمت کردن اعداد
    function formatNumber(value, decimals = 18) {
        try {
            if (!value || value.toString() === '0') return '0';
            const formatted = ethers.formatUnits(value, decimals);
            const num = parseFloat(formatted);
            if (num < 0.000001) {
                return num.toExponential(2);
            }
            return num.toLocaleString('en-US', { maximumFractionDigits: 6 });
        } catch (error) {
            console.error('Error formatting number:', error);
            return '0';
        }
    }
    
    // تابع دریافت گزارشات از قرارداد
    async function fetchReports() {
        try {
            const { contract, address } = await connectWallet();
            
            const reports = [];
            const currentBlock = await contract.runner.provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 50000); // افزایش به 50000 بلاک
        
        console.log(`Searching for events from block ${fromBlock} to ${currentBlock}`);
            
            // دریافت رویدادهای خرید
        let purchaseEvents = [];
            try {
            purchaseEvents = await contract.queryFilter(
                    contract.filters.purchaseKind(address),
                    fromBlock,
                    currentBlock
                );
            console.log(`Found ${purchaseEvents.length} purchase events`);
        } catch (error) {
            console.error('Error fetching purchase events:', error);
        }

        // دریافت رویدادهای فعال‌سازی
        let activationEvents = [];
        try {
            activationEvents = await contract.queryFilter(
                contract.filters.Activated(address),
                fromBlock,
                currentBlock
            );
            console.log(`Found ${activationEvents.length} activation events`);
        } catch (error) {
            console.error('Error fetching activation events:', error);
        }
        
        // دریافت رویدادهای معاملات
        let buyEvents = [], sellEvents = [];
        try {
            buyEvents = await contract.queryFilter(
                contract.filters.TokensBought(address),
                fromBlock,
                currentBlock
            );
            console.log(`Found ${buyEvents.length} buy events`);
            sellEvents = await contract.queryFilter(
                contract.filters.TokensSold(address),
                fromBlock,
                currentBlock
            );
            console.log(`Found ${sellEvents.length} sell events`);
        } catch (error) {
            console.error('Error fetching trading events:', error);
        }
        
        // دریافت رویدادهای پاداش باینری
        let binaryEvents = [];
        try {
            binaryEvents = await contract.queryFilter(
                contract.filters.BinaryPointsUpdated(address),
                fromBlock,
                currentBlock
            );
            console.log(`Found ${binaryEvents.length} binary events`);
        } catch (error) {
            console.error('Error fetching binary events:', error);
        }
        
        // جمع‌آوری همه رویدادها برای گرفتن timestamp بلاک
        const allEvents = [
            ...purchaseEvents.map(e => ({...e, _type: 'purchase'})),
            ...activationEvents.map(e => ({...e, _type: 'activation'})),
            ...buyEvents.map(e => ({...e, _type: 'buy'})),
            ...sellEvents.map(e => ({...e, _type: 'sell'})),
            ...binaryEvents.map(e => ({...e, _type: 'binary'})),
        ];
        
        // گرفتن timestamp بلاک‌ها فقط یک بار برای هر بلاک
        const blockTimestamps = {};
        await Promise.all(
            allEvents.map(async (event) => {
                if (!blockTimestamps[event.blockNumber]) {
                    try {
                        const block = await contract.runner.provider.getBlock(event.blockNumber);
                        if (block && block.timestamp) {
                            blockTimestamps[event.blockNumber] = block.timestamp;
                            console.log(`Block ${event.blockNumber} timestamp: ${block.timestamp} (${new Date(block.timestamp * 1000).toISOString()})`);
                        }
                    } catch (blockError) {
                        console.warn(`Failed to get block ${event.blockNumber}:`, blockError);
                        // استفاده از timestamp فعلی به عنوان fallback
                        blockTimestamps[event.blockNumber] = Math.floor(Date.now() / 1000);
                    }
                }
            })
        );
        
        // ساخت گزارشات با timestamp صحیح
                purchaseEvents.forEach(event => {
            const ts = blockTimestamps[event.blockNumber] || Math.floor(Date.now() / 1000);
            console.log('purchaseEvent timestamp:', ts, 'blockNumber:', event.blockNumber, 'event:', event);
                    reports.push({
                        type: 'purchase',
                        title: 'خرید توکن',
                        amount: formatNumber(event.args.amountlvl, 18) + ' LVL',
                timestamp: ts,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber
                    });
                });
                
                activationEvents.forEach(event => {
            const ts = blockTimestamps[event.blockNumber] || Math.floor(Date.now() / 1000);
            console.log('activationEvent timestamp:', ts, 'blockNumber:', event.blockNumber, 'event:', event);
                    reports.push({
                        type: 'activation',
            title: 'فعال‌سازی حساب',
                        amount: formatNumber(event.args.amountlvl, 18) + ' LVL',
                timestamp: ts,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber
                    });
                });
                
                buyEvents.forEach(event => {
            const ts = blockTimestamps[event.blockNumber] || Math.floor(Date.now() / 1000);
            console.log('buyEvent timestamp:', ts, 'blockNumber:', event.blockNumber, 'event:', event);
                    reports.push({
                        type: 'trading',
                        title: 'خرید توکن با POL',
                        amount: `${formatNumber(event.args.maticAmount, 18)} POL → ${formatNumber(event.args.tokenAmount, 18)} LVL`,
                timestamp: ts,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber
                    });
                });
                
                sellEvents.forEach(event => {
            const ts = blockTimestamps[event.blockNumber] || Math.floor(Date.now() / 1000);
            console.log('sellEvent timestamp:', ts, 'blockNumber:', event.blockNumber, 'event:', event);
                    reports.push({
                        type: 'trading',
                        title: 'فروش توکن',
                        amount: `${formatNumber(event.args.tokenAmount, 18)} LVL → ${formatNumber(event.args.maticAmount, 18)} POL`,
                timestamp: ts,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber
                    });
                });
                
                binaryEvents.forEach(event => {
            const ts = blockTimestamps[event.blockNumber] || Math.floor(Date.now() / 1000);
            console.log('binaryEvent timestamp:', ts, 'blockNumber:', event.blockNumber, 'event:', event);
                    reports.push({
                        type: 'binary',
                        title: 'به‌روزرسانی امتیاز باینری',
                        amount: `${formatNumber(event.args.newPoints, 18)} امتیاز (سقف: ${formatNumber(event.args.newCap, 18)})`,
                timestamp: ts,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber
                    });
                });
        
        console.log(`Total reports found: ${reports.length}`);
            
            // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
            reports.sort((a, b) => b.timestamp - a.timestamp);
            
            return reports;
            
        } catch (error) {
            console.error('Error fetching reports:', error);
            throw error;
        }
    }
    
    // تابع نمایش گزارشات
    function displayReports(reports, filterType = 'all') {
    const reportsContainer = document.getElementById('reports-container');
        if (!reportsContainer) return;
        
        const filteredReports = filterType === 'all' 
            ? reports 
            : reports.filter(report => report.type === filterType);
        
        if (filteredReports.length === 0) {
            reportsContainer.innerHTML = `
            <div class="no-reports">
                    <p>هیچ گزارشی یافت نشد.</p>
                    <p>برای مشاهده گزارشات، ابتدا فعالیتی در پلتفرم انجام دهید.</p>
        </div>
    `;
            return;
        }
    
        const reportsHTML = filteredReports.map(report => {
            const { type, title, amount, timestamp, transactionHash, blockNumber } = report;
            const reportHTML = `
                <div class="report-item">
                    <div class="report-header">
                        <div class="report-type">${getReportIcon(type)} ${title}</div>
                        <div class="report-time">${formatDate(timestamp)}</div>
                    </div>
                    <div class="report-details">
                        <div class="report-details-row">
                            <span class="report-details-label">آدرس:</span>
                            <span class="report-details-value">${shortenAddress(report.address || '')}</span>
                        </div>
                        <div class="report-details-row">
                            <span class="report-details-label">مقدار:</span>
                            <span class="report-details-value">${amount}</span>
                        </div>
                        <div class="report-details-row">
                            <span class="report-details-label">تراکنش:</span>
                            <span class="report-details-value">${shortenTransactionHash(transactionHash)}</span>
                        </div>
                    </div>
                </div>
            `;
            return reportHTML;
        }).join('');
        
        reportsContainer.innerHTML = reportsHTML;
    }

    // تابع دریافت آیکون برای نوع گزارش
    function getReportIcon(type) {
        const icons = {
        'purchase': '🛒',
        'activation': '✅',
        'trading': '💱',
        'binary': '📊'
        };
    return icons[type] || '📄';
    }
    
    // تابع بارگذاری گزارشات
    async function loadReports() {
    if (isReportsLoading) {
        console.log("Reports already loading, skipping...");
        return;
    }
    
    isReportsLoading = true;
    
    try {
        console.log("Connecting to wallet for reports data...");
        const { contract, address } = await connectWallet();
        console.log("Wallet connected, fetching reports data...");
        
        // دریافت گزارشات
            const reports = await fetchReports();
        
        // نمایش گزارشات
        displayReports(reports);
        
        // تنظیم فیلترها
        setupFilters();
        
        console.log("Reports loaded successfully");
            
        } catch (error) {
        console.error("Error loading reports:", error);
        showReportsError("خطا در بارگذاری گزارشات");
    } finally {
        isReportsLoading = false;
    }
}

// تابع بررسی اتصال کیف پول
async function checkConnection() {
    try {
        const { provider, address } = await connectWallet();
        const network = await provider.getNetwork();
        
        return {
            connected: true,
            address,
            network: network.name,
            chainId: network.chainId
        };
    } catch (error) {
        return {
            connected: false,
            error: error.message
        };
    }
}

// تابع نمایش پیغام خطا در صفحه گزارشات
function showReportsError(message) {
    const reportsContainer = document.getElementById('reports-container');
    if (reportsContainer) {
            reportsContainer.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                </div>
            `;
            }
        }
    
// تابع راه‌اندازی فیلترها
function setupFilters() {
    const refreshButton = document.getElementById('refresh-reports');
    const reportTypeFilter = document.getElementById('report-type-filter');
    
    if (refreshButton) {
        refreshButton.addEventListener('click', loadReports);
    }
    
    if (reportTypeFilter) {
        reportTypeFilter.addEventListener('change', () => {
            loadReports();
        });
    }
} 