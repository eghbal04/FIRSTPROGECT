// reports.js - گزارشات کامل و دسته‌بندی شده بر اساس ABI قرارداد CPA

// ابزارهای کمکی
function shortenAddress(address) {
    if (!address) return '-';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
function ultraShortAddress(address) {
    if (!address) return '-';
    return `${address.slice(0, 4)}...${address.slice(-3)}`;
}
// ابزار جدید: گرفتن ایندکس کاربر از آدرس (در شبکه)
async function getIndexByAddress(address, contract) {
    try {
        if (!address || !contract) return null;
        // جستجو در mapping indexToAddress (بدون محدودیت)
        let i = 1;
        while (true) {
            let addr = await contract.indexToAddress(i);
            if (!addr || addr === '0x0000000000000000000000000000000000000000') break;
            if (addr.toLowerCase() === address.toLowerCase()) return i;
            i++;
        }
        return null;
    } catch { return null; }
}
// ابزار جدید: نمایش آدرس یا ایندکس یا قرارداد
async function displayAddress(addr, contract, contractAddress) {
    if (!addr) return '-';
    if (addr.toLowerCase() === contractAddress.toLowerCase()) return 'قرارداد';
    const idx = await getIndexByAddress(addr, contract);
    if (idx) return `CPA${idx.toString().padStart(5, '0')}`;
    return shortenAddress(addr);
}
function formatDate(timestamp) {
    if (!timestamp || isNaN(timestamp)) return 'Invalid date';
    let ts = Number(timestamp);
    if (ts > 1e9 && ts < 1e12) ts = ts * 1000;
    const date = new Date(ts);
    // تاریخ میلادی محلی با فرمت YYYY/MM/DD HH:mm
    return date.getFullYear() + '/' + String(date.getMonth()+1).padStart(2,'0') + '/' + String(date.getDate()).padStart(2,'0') + ' ' + String(date.getHours()).padStart(2,'0') + ':' + String(date.getMinutes()).padStart(2,'0');
}
function formatNumber(value, decimals = 18) {
    try {
        if (!value || value.toString() === '0') return '0';
        const formatted = ethers.formatUnits(value, decimals);
        const num = parseFloat(formatted);
        if (num < 0.000001) return num.toExponential(2);
        return num.toLocaleString('en-US', { maximumFractionDigits: 6 });
    } catch { return '0'; }
}

// جمع‌آوری همه ایونت‌ها
window.fetchReports = async function(address) {
    const { contract, address: userAddress } = await connectWallet();
    const provider = (contract.runner && contract.runner.provider) || contract.provider;
    const contractWithProvider = contract.connect ? contract.connect(provider) : contract;
    contractWithProvider.provider = provider; // تضمین provider معتبر برای safeQueryEvents
    const reports = [];
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = 0; // بدون محدودیت، از بلاک صفر
    // Helper: اضافه کردن ایونت به reports
    async function pushReport(type, title, amount, event, addr, provider) {
        let ts = null;
        if (event.args && event.args.timestamp) {
            ts = Number(event.args.timestamp) * 1000;
        } else if (event.blockNumber && provider) {
            const block = await provider.getBlock(event.blockNumber);
            ts = block.timestamp * 1000;
        }
        // مقدار پیش‌فرض برای title و amount اگر خالی یا undefined بود
        const safeTitle = (typeof title !== 'undefined' && title !== null && title !== '') ? title : '---';
        const safeAmount = (typeof amount !== 'undefined' && amount !== null && amount !== '') ? amount : '---';
        reports.push({
            type,
            title: safeTitle,
            amount: safeAmount,
            timestamp: ts,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            address: addr,
            logIndex: event.logIndex
        });
    }
    // Activated
    const eventsActivated = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.Activated(), fromBlock, currentBlock);
    for (const e of eventsActivated) {
        if (e.args.user && e.args.user.toLowerCase() === userAddress.toLowerCase())
            await pushReport('activated', 'فعال‌سازی', formatNumber(e.args.amountCPA, 18) + ' CPA', e, e.args.user, provider);
    }
    // PurchaseKind
    const eventsPurchaseKind = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.PurchaseKind(), fromBlock, currentBlock);
    for (const e of eventsPurchaseKind) {
        if (e.args.user && e.args.user.toLowerCase() === userAddress.toLowerCase())
            await pushReport('purchase', 'خرید', formatNumber(e.args.amountCPA, 18) + ' CPA', e, e.args.user, provider);
    }
    // TokensBought
    const eventsTokensBought = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.TokensBought(), fromBlock, currentBlock);
    for (const e of eventsTokensBought) {
        if (e.args.buyer && e.args.buyer.toLowerCase() === userAddress.toLowerCase())
            await pushReport('tokensbought', 'خرید توکن', `${formatNumber(e.args.daiAmount, 18)} DAI → ${formatNumber(e.args.tokenAmount, 18)} CPA`, e, e.args.buyer, provider);
    }
    // TokensSold
    const eventsTokensSold = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.TokensSold(), fromBlock, currentBlock);
    for (const e of eventsTokensSold) {
        if (e.args.seller && e.args.seller.toLowerCase() === userAddress.toLowerCase())
            await pushReport('tokenssold', 'فروش توکن', `${formatNumber(e.args.tokenAmount, 18)} CPA → ${formatNumber(e.args.daiAmount, 18)} DAI`, e, e.args.seller, provider);
    }
    // BinaryPointsUpdated
    const eventsBinaryPoints = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.BinaryPointsUpdated(), fromBlock, currentBlock);
    for (const e of eventsBinaryPoints) {
        await pushReport('binarypoints', 'به‌روزرسانی امتیاز باینری', `${formatNumber(e.args.newPoints, 18)} امتیاز (سقف: ${formatNumber(e.args.newCap, 18)})`, e, e.args.user, provider);
    }
    // BinaryRewardDistributed
    const eventsBinaryReward = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.BinaryRewardDistributed(), fromBlock, currentBlock);
    for (const e of eventsBinaryReward) {
        await pushReport('binaryreward', 'دریافت پاداش باینری', `${formatNumber(e.args.claimerReward, 18)} CPA`, e, e.args.claimer, provider);
    }
    // BinaryPoolUpdated
    const eventsBinaryPool = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.BinaryPoolUpdated(), fromBlock, currentBlock);
    for (const e of eventsBinaryPool) {
        await pushReport('binarypool', 'به‌روزرسانی استخر باینری', `${formatNumber(e.args.addedAmount, 18)} CPA (سایز جدید: ${formatNumber(e.args.newPoolSize, 18)})`, e, null, provider);
    }
    // TreeStructureUpdated
    const eventsTree = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.TreeStructureUpdated(), fromBlock, currentBlock);
    for (const e of eventsTree) {
        let posLabel = e.args.position == 0 ? 'فرزند چپ' : e.args.position == 1 ? 'فرزند راست' : `موقعیت: ${e.args.position}`;
        await pushReport('tree', 'تغییر ساختار شبکه', posLabel, e, e.args.user, provider);
    }
    // Transfer
    const eventsTransfer = await contractWithProvider.queryFilter(contractWithProvider.filters.Transfer(), fromBlock, currentBlock);
    for (const e of eventsTransfer) {
        if ((e.args[0] && e.args[0].toLowerCase() === userAddress.toLowerCase()) ||
            (e.args[1] && e.args[1].toLowerCase() === userAddress.toLowerCase())) {
            await pushReport(
                'transfer',
                'انتقال توکن',
                `${formatNumber(e.args[2], 18)} CPA`,
                e,
                {from: e.args[0], to: e.args[1]},
                provider
            );
        }
    }
    // Approval
    const eventsApproval = await contractWithProvider.queryFilter(contractWithProvider.filters.Approval(), fromBlock, currentBlock);
    for (const e of eventsApproval) {
        await pushReport('approval', 'تأییدیه انتقال', `${formatNumber(e.args.value, 18)} CPA`, e, e.args.owner === userAddress ? e.args.spender : e.args.owner, provider);
    }
    // IndexTransferred
    const eventsIndexTransfer = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.IndexTransferred(), fromBlock, currentBlock);
    for (const e of eventsIndexTransfer) {
        if ((e.args.previousOwner && e.args.previousOwner.toLowerCase() === userAddress.toLowerCase()) ||
            (e.args.newOwner && e.args.newOwner.toLowerCase() === userAddress.toLowerCase())) {
            await pushReport('indextransfer', 'انتقال ایندکس', `از ${shortenAddress(e.args.previousOwner)} به ${shortenAddress(e.args.newOwner)} (ایندکس: ${e.args.index})`, e, e.args.previousOwner === userAddress ? e.args.newOwner : e.args.previousOwner, provider);
        }
    }
    // MonthlyRewardClaimed
    const eventsMonthlyReward = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.MonthlyRewardClaimed(), fromBlock, currentBlock);
    for (const e of eventsMonthlyReward) {
        await pushReport('monthlyreward', 'دریافت پاداش ماهانه', `${formatNumber(e.args.reward, 18)} CPA (${e.args.monthsPassed} ماه)`, e, e.args.user, provider);
    }
    // MonthlyRewardFailed
    const eventsMonthlyFail = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.MonthlyRewardFailed(), fromBlock, currentBlock);
    for (const e of eventsMonthlyFail) {
        await pushReport('monthlyfail', 'عدم موفقیت پاداش ماهانه', e.args.reason, e, e.args.user, provider);
    }
    // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
    reports.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return reports;
};

// نمایش گزارشات دسته‌بندی شده
window.loadReports = async function(address) {
    const reportsContainer = document.getElementById('reports-list');
    reportsContainer.innerHTML = '<div class="loading">در حال بارگذاری گزارشات...</div>';
    const reports = await window.fetchReports(address);
    if (!reports || reports.length === 0) {
        reportsContainer.innerHTML = '<div class="no-reports">هیچ گزارشی برای شما یافت نشد.</div>';
        return;
    }
    // دسته‌بندی
    const grouped = {};
    reports.forEach(r => { if (!grouped[r.type]) grouped[r.type] = []; grouped[r.type].push(r); });
    const typeOrder = [
        'activated','purchase','tokensbought','tokenssold','binarypoints','binaryreward','binarypool','tree','transfer','approval','indextransfer','monthlyreward','monthlyfail'
    ];
    const typeTitles = {
        activated: 'فعال‌سازی', purchase: 'خرید', tokensbought: 'خرید توکن', tokenssold: 'فروش توکن',
        binarypoints: 'امتیاز باینری', binaryreward: 'پاداش باینری', binarypool: 'استخر باینری',
        tree: 'ساختار شبکه', transfer: 'انتقال توکن', approval: 'تأییدیه انتقال',
        indextransfer: 'انتقال ایندکس', monthlyreward: 'پاداش ماهانه', monthlyfail: 'خطاهای پاداش ماهانه'
    };
    // تابع نمایش بر اساس دسته انتخابی
    async function renderReportsByType(selectedType) {
        reportsContainer.innerHTML = '';
        let typesToShow = typeOrder;
        if (selectedType && selectedType !== 'all') typesToShow = [selectedType];
        for (const type of typesToShow) {
            if (grouped[type] && grouped[type].length > 0) {
                const h = document.createElement('h3');
                h.textContent = typeTitles[type] || type;
                h.style.marginTop = '32px';
                h.style.color = '#1976d2';
                h.style.fontWeight = 'bold';
                h.style.fontSize = '1.15em';
                reportsContainer.appendChild(h);
                const groupDiv = document.createElement('div');
                groupDiv.className = 'event-group';
                groupDiv.dataset.type = type;
                reportsContainer.appendChild(groupDiv);
                for (const report of grouped[type]) {
                    const div = document.createElement('div');
                    div.className = 'report-sentence';
                    // جمله را به صورت async بساز
                    const sentence = await getReportSentence(report);
                    div.innerHTML = sentence;
                    groupDiv.appendChild(div);
                }
            }
        }
    }
    // مقدار اولیه (همه دسته‌ها)
    await renderReportsByType('all');
    // لیسنر برای select
    const select = document.getElementById('event-type-select');
    if (select) {
        select.onchange = function() {
            renderReportsByType(this.value);
        };
    }
};

// جمله فارسی برای هر ایونت
async function getReportSentence(report) {
    const time = report.timestamp ? `<span class='report-time'>${formatDate(report.timestamp)}</span>` : '';
    const amount = (typeof report.amount !== 'undefined' && report.amount !== null) ? report.amount : '';
    const title = (typeof report.title !== 'undefined' && report.title !== null) ? report.title : '';
    if (report.type === 'transfer') {
        let fromPromise = '';
        let toPromise = '';
        if (report.address && typeof report.address === 'object') {
            if (window.contractConfig && window.contractConfig.contract) {
                fromPromise = displayAddress(report.address.from, window.contractConfig.contract, window.contractConfig.CONTRACT_ADDRESS).then(addr => {
                    if (addr.startsWith('CPA')) return addr;
                    if (addr === 'قرارداد') return addr;
                    return ultraShortAddress(report.address.from);
                });
                toPromise = displayAddress(report.address.to, window.contractConfig.contract, window.contractConfig.CONTRACT_ADDRESS).then(addr => {
                    if (addr.startsWith('CPA')) return addr;
                    if (addr === 'قرارداد') return addr;
                    return ultraShortAddress(report.address.to);
                });
            } else {
                fromPromise = Promise.resolve(ultraShortAddress(report.address.from));
                toPromise = Promise.resolve(ultraShortAddress(report.address.to));
            }
        } else {
            fromPromise = Promise.resolve('-');
            toPromise = Promise.resolve('-');
        }
        return Promise.all([fromPromise, toPromise]).then(([fromAddr, toAddr]) => {
            let fromText = fromAddr;
            let toText = toAddr;
            return `${time} انتقال توکن از <span class='wallet-address'>${fromText}</span> به <span class='wallet-address'>${toText}</span> مقدار: ${amount}`;
        });
    }
    switch (report.type) {
        case 'activated':
            return `${time} شما با پرداخت ${amount} فعال شدید.`;
        case 'purchase':
            return `${time} شما ثبت‌نام کردید. ۵٪ توکن سوزانده شد و معادل آن به کشبک اضافه شد، ۱۰٪ به دیپلویِر، ۱۰٪ به رفرر و ۷۵٪ به قرارداد واریز شد.`;
        case 'tokensbought':
            return `${time} شما ${amount} خریدید.`;
        case 'tokenssold':
            return `${time} شما ${amount} فروختید.`;
        case 'binarypoints':
            return `${time} امتیاز باینری شما به ${amount} تغییر یافت.`;
        case 'binaryreward':
            return `${time} شما پاداش باینری به مقدار ${amount} دریافت کردید.`;
        case 'binarypool':
            return `${time} ${amount}`;
        case 'tree':
            return `${time} یک کاربر جدید در سمت ${amount} شما ثبت شد.`;
        case 'approval':
            return displayAddress(report.address, window.contractConfig.contract, window.contractConfig.CONTRACT_ADDRESS).then(addr => `${time} شما مجوز انتقال ${amount} را صادر کردید. آدرس مقابل: <span class='wallet-address'>${addr}</span>`);
        case 'indextransfer':
            return `${time} انتقال ایندکس ${amount}`;
        case 'monthlyreward':
            return `${time} شما پاداش ماهانه به مقدار ${amount} دریافت کردید.`;
        case 'monthlyfail':
            return `${time} تلاش برای دریافت پاداش ماهانه ناموفق بود: ${amount}`;
        default:
            if (title && amount) return `${time} ${title}: ${amount}`;
            if (amount) return `${time} ${amount}`;
            if (title) return `${time} ${title}`;
            return `${time} گزارش بدون عنوان`;
    }
} // پایان تابع getReportSentence