// reports.js - بخش گزارشات و فعالیت‌ها
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📊 شروع بارگذاری گزارشات...');
    
    const reportsContainer = document.getElementById('reports-container');
    const reportTypeFilter = document.getElementById('report-type-filter');
    const refreshButton = document.getElementById('refresh-reports');
    
    if (!reportsContainer) {
        console.error('Reports container not found');
        return;
    }
    
    // تابع اتصال به کیف پول
    async function connectWallet() {
        if (!window.contractConfig) {
            throw new Error("Contract config not initialized");
        }
        await window.contractConfig.initializeWeb3();
        return {
            provider: window.contractConfig.provider,
            contract: window.contractConfig.contract,
            signer: window.contractConfig.signer,
            address: await window.contractConfig.signer.getAddress()
        };
    }
    
    // تابع فرمت کردن آدرس
    function shortenAddress(address) {
        if (!address) return '-';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    // تابع فرمت کردن تاریخ
    function formatDate(timestamp) {
        if (!timestamp) return '-';
        const date = new Date(parseInt(timestamp) * 1000);
        return date.toLocaleString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            console.log('👤 آدرس کاربر:', address);
            
            const reports = [];
            const currentBlock = await contract.runner.provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 10000); // 10000 بلاک اخیر
            
            // دریافت رویدادهای خرید
            try {
                const purchaseEvents = await contract.queryFilter(
                    contract.filters.purchaseKind(address),
                    fromBlock,
                    currentBlock
                );
                
                purchaseEvents.forEach(event => {
                    reports.push({
                        type: 'purchase',
                        title: 'خرید توکن',
                        amount: formatNumber(event.args.amountlvl, 18) + ' LVL',
                        timestamp: event.blockTimestamp,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber
                    });
                });
            } catch (error) {
                console.log('Error fetching purchase events:', error.message);
            }
            
            // دریافت رویدادهای فعال‌سازی
            try {
                const activationEvents = await contract.queryFilter(
                    contract.filters.Activated(address),
                    fromBlock,
                    currentBlock
                );
                
                activationEvents.forEach(event => {
                    reports.push({
                        type: 'activation',
                        title: 'فعال‌سازی حساب',
                        amount: formatNumber(event.args.amountlvl, 18) + ' LVL',
                        timestamp: event.blockTimestamp,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber
                    });
                });
            } catch (error) {
                console.log('Error fetching activation events:', error.message);
            }
            
            // دریافت رویدادهای معاملات
            try {
                const buyEvents = await contract.queryFilter(
                    contract.filters.TokensBought(address),
                    fromBlock,
                    currentBlock
                );
                
                buyEvents.forEach(event => {
                    reports.push({
                        type: 'trading',
                        title: 'خرید توکن با MATIC',
                        amount: `${formatNumber(event.args.maticAmount, 18)} MATIC → ${formatNumber(event.args.tokenAmount, 18)} LVL`,
                        timestamp: event.blockTimestamp,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber
                    });
                });
                
                const sellEvents = await contract.queryFilter(
                    contract.filters.TokensSold(address),
                    fromBlock,
                    currentBlock
                );
                
                sellEvents.forEach(event => {
                    reports.push({
                        type: 'trading',
                        title: 'فروش توکن',
                        amount: `${formatNumber(event.args.tokenAmount, 18)} LVL → ${formatNumber(event.args.maticAmount, 18)} MATIC`,
                        timestamp: event.blockTimestamp,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber
                    });
                });
            } catch (error) {
                console.log('Error fetching trading events:', error.message);
            }
            
            // دریافت رویدادهای پاداش باینری
            try {
                const binaryEvents = await contract.queryFilter(
                    contract.filters.BinaryPointsUpdated(address),
                    fromBlock,
                    currentBlock
                );
                
                binaryEvents.forEach(event => {
                    reports.push({
                        type: 'binary',
                        title: 'به‌روزرسانی امتیاز باینری',
                        amount: `${formatNumber(event.args.newPoints, 18)} امتیاز (سقف: ${formatNumber(event.args.newCap, 18)})`,
                        timestamp: event.blockTimestamp,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber
                    });
                });
            } catch (error) {
                console.log('Error fetching binary events:', error.message);
            }
            
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
        
        const reportsHTML = filteredReports.map(report => `
            <div class="report-item">
                <div class="report-header">
                    <div class="report-type">
                        <i class="fa-solid fa-${getReportIcon(report.type)}"></i>
                        ${report.title}
                    </div>
                    <div class="report-time">${formatDate(report.timestamp)}</div>
                </div>
                <p><strong>مقدار:</strong> ${report.amount}</p>
                <p><strong>تراکنش:</strong> <a href="https://polygonscan.com/tx/${report.transactionHash}" target="_blank">${shortenAddress(report.transactionHash)}</a></p>
                <p><strong>بلاک:</strong> ${report.blockNumber}</p>
            </div>
        `).join('');
        
        reportsContainer.innerHTML = reportsHTML;
    }
    
    // تابع دریافت آیکون برای نوع گزارش
    function getReportIcon(type) {
        const icons = {
            'purchase': 'shopping-cart',
            'activation': 'user-check',
            'trading': 'exchange-alt',
            'binary': 'chart-line'
        };
        return icons[type] || 'file-alt';
    }
    
    // تابع بارگذاری گزارشات
    async function loadReports() {
        try {
            reportsContainer.innerHTML = '<div class="loading-message">در حال بارگذاری گزارشات...</div>';
            
            const reports = await fetchReports();
            const filterType = reportTypeFilter ? reportTypeFilter.value : 'all';
            
            displayReports(reports, filterType);
            
        } catch (error) {
            console.error('Error loading reports:', error);
            reportsContainer.innerHTML = `
                <div class="error-message">
                    <p>خطا در بارگذاری گزارشات:</p>
                    <p>${error.message}</p>
                    <p>لطفاً کیف پول و اتصال اینترنت را بررسی کنید.</p>
                </div>
            `;
        }
    }
    
    // تنظیم event listeners
    if (refreshButton) {
        refreshButton.addEventListener('click', loadReports);
    }
    
    if (reportTypeFilter) {
        reportTypeFilter.addEventListener('change', () => {
            loadReports();
        });
    }
    
    // بارگذاری اولیه گزارشات
    await loadReports();
    
    // به‌روزرسانی خودکار هر 5 دقیقه
    setInterval(loadReports, 300000);
}); 