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
// قالب‌بندی فشرده اعداد: k, m, b, t, q, e
function formatCompact(num, smallDecimals = 4, compactDecimals = 2) {
    const n = Number(num);
    if (!isFinite(n)) return '0';
    const abs = Math.abs(n);
    if (abs < 1) return n.toFixed(smallDecimals);
    const units = [
        { v: 1e18, s: 'e' },
        { v: 1e15, s: 'q' },
        { v: 1e12, s: 't' },
        { v: 1e9,  s: 'b' },
        { v: 1e6,  s: 'm' },
        { v: 1e3,  s: 'k' }
    ];
    for (const u of units) if (abs >= u.v) return (n / u.v).toFixed(compactDecimals) + u.s;
    return n.toFixed(compactDecimals);
}
function formatCompactUnits(value, decimals, unit, smallDecimals = 4, compactDecimals = 2) {
    try {
        const formatted = ethers.formatUnits(value, decimals);
        return `${formatCompact(parseFloat(formatted), smallDecimals, compactDecimals)} ${unit}`;
    } catch {
        return `0 ${unit}`;
    }
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
    const { contract, address: userAddress } = await window.connectWallet();
    console.log('fetchReports: userAddress =', userAddress, 'contract =', contract);
    
    // تست contract
    try {
        console.log('🔍 Testing contract functions...');
        const symbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        console.log('📊 Contract symbol:', symbol, 'Total supply:', totalSupply.toString());
        
        // تست کاربر
        const userInfo = await contract.users(userAddress);
        console.log('📊 User info:', userInfo);
        
        // تست تعداد کل کاربران
        const wallets = await contract.wallets();
        console.log('📊 Total wallets:', wallets.toString());
        
    } catch (error) {
        console.error('❌ Error testing contract:', error);
    }
    const provider = (contract.runner && contract.runner.provider) || contract.provider;
    const contractWithProvider = contract.connect ? contract.connect(provider) : contract;
    contractWithProvider.provider = provider; // تضمین provider معتبر برای safeQueryEvents
    const reports = [];
    const currentBlock = await provider.getBlockNumber();
    // اگر کاربر "نمایش همه" را خواست، از بلاک صفر شروع کن
    let fromBlock;
    if (window.REPORTS_SHOW_ALL) {
        fromBlock = 0;
    } else {
        const DEFAULT_WINDOW_BLOCKS = 2000000;
        fromBlock = Math.max(0, currentBlock - DEFAULT_WINDOW_BLOCKS);
    }
    console.log('📊 Searching from block:', fromBlock, 'to block:', currentBlock);
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
    // تست مستقیم برای Activated events
    console.log('🔍 Testing Activated events filter...');
    let eventsActivated = [];
    try {
        const activatedFilter = contractWithProvider.filters.Activated();
        console.log('📊 Activated filter:', activatedFilter);
        
        // تست با queryFilter مستقیم
        const directActivatedEvents = await contractWithProvider.queryFilter(activatedFilter, fromBlock, currentBlock);
        console.log('📊 Direct Activated events:', directActivatedEvents.length);
        
        // تست با safeQueryEvents
        eventsActivated = await window.safeQueryEvents(contractWithProvider, activatedFilter, fromBlock, currentBlock);
        console.log('📊 SafeQuery Activated events total:', eventsActivated.length);
        
        // اگر هیچ event پیدا نشد، از بلاک صفر شروع کن
        if (eventsActivated.length === 0 && directActivatedEvents.length === 0) {
            console.log('⚠️ No events found, trying from block 0...');
            const eventsActivatedFromZero = await window.safeQueryEvents(contractWithProvider, activatedFilter, 0, currentBlock);
            console.log('📊 Activated events from block 0:', eventsActivatedFromZero.length);
            
            if (eventsActivatedFromZero.length > 0) {
                console.log('✅ Found events from block 0!');
                eventsActivated = eventsActivatedFromZero;
            }
        }
    } catch (error) {
        console.error('❌ Error testing Activated events:', error);
        eventsActivated = [];
    }
    console.log('📊 User address:', userAddress);
    let activatedCount = 0;
    for (const e of eventsActivated) {
        console.log('📊 Activated event user:', e.args.user, 'amount:', e.args.amountCPA?.toString());
        if (e.args.user && e.args.user.toLowerCase() === userAddress.toLowerCase()) {
            activatedCount++;
            await pushReport('registration', 'ثبت‌نام و فعال‌سازی', formatCompactUnits(e.args.amountCPA, 18, 'CPA'), e, e.args.user, provider);
        }
    }
    console.log('📊 Activated events for user:', activatedCount);
    
    // معرفی‌ها - TreeStructureUpdated events که شما معرف بودید
    console.log('🔍 Testing TreeStructureUpdated events...');
    let eventsTreeAll = [];
    try {
        const treeFilter = contractWithProvider.filters.TreeStructureUpdated();
        console.log('📊 Tree filter:', treeFilter);
        
        // تست با queryFilter مستقیم
        const directTreeEvents = await contractWithProvider.queryFilter(treeFilter, fromBlock, currentBlock);
        console.log('📊 Direct Tree events:', directTreeEvents.length);
        
        // تست با safeQueryEvents
        eventsTreeAll = await window.safeQueryEvents(contractWithProvider, treeFilter, fromBlock, currentBlock);
        console.log('📊 SafeQuery TreeStructureUpdated events total:', eventsTreeAll.length);
        
        // اگر هیچ event پیدا نشد، از بلاک صفر شروع کن
        if (eventsTreeAll.length === 0 && directTreeEvents.length === 0) {
            console.log('⚠️ No tree events found, trying from block 0...');
            const eventsTreeFromZero = await window.safeQueryEvents(contractWithProvider, treeFilter, 0, currentBlock);
            console.log('📊 Tree events from block 0:', eventsTreeFromZero.length);
            
            if (eventsTreeFromZero.length > 0) {
                console.log('✅ Found tree events from block 0!');
                eventsTreeAll = eventsTreeFromZero;
            }
        }
    } catch (error) {
        console.error('❌ Error testing Tree events:', error);
        eventsTreeAll = [];
    }
    
    let referralCount = 0;
    for (const treeEvent of eventsTreeAll) {
        console.log('📊 Tree event - user:', treeEvent.args.user, 'referrer:', treeEvent.args.referrer, 'position:', treeEvent.args.position);
        
        if (treeEvent.args.referrer && treeEvent.args.referrer.toLowerCase() === userAddress.toLowerCase()) {
            console.log('✅ Found referral by user! User:', treeEvent.args.user, 'Amount will be calculated...');
            
            // پیدا کردن PurchaseKind event مربوطه برای مقدار
            const relatedPurchaseKind = eventsPurchaseKindAll.find(pkEvent => 
                pkEvent.args.user.toLowerCase() === treeEvent.args.user.toLowerCase() &&
                Math.abs(pkEvent.blockNumber - treeEvent.blockNumber) <= 2  // در همان تراکنش یا نزدیک به آن
            );
            
            if (relatedPurchaseKind) {
                referralCount++;
                console.log('✅ Found related PurchaseKind event for referral! Amount:', relatedPurchaseKind.args.amountCPA.toString());
                await pushReport(
                    'referral_registration', 
                    'معرفی و ثبت‌نام', 
                    `${formatCompactUnits(relatedPurchaseKind.args.amountCPA, 18, 'CPA')} (${shortenAddress(treeEvent.args.user)})`, 
                    relatedPurchaseKind, 
                    treeEvent.args.user, 
                    provider
                );
            } else {
                console.log('⚠️ No related PurchaseKind event found for referral. Using default amount.');
                // اگر PurchaseKind event پیدا نشد، از مقدار پیش‌فرض استفاده کن
                await pushReport(
                    'referral_registration', 
                    'معرفی و ثبت‌نام', 
                    `ثبت‌نام (${shortenAddress(treeEvent.args.user)})`, 
                    treeEvent, 
                    treeEvent.args.user, 
                    provider
                );
            }
        }
    }
    console.log('📊 Referral registrations by user:', referralCount);
    
    // روش جایگزین: بررسی مستقیم از contract برای پیدا کردن معرفی‌ها
    try {
        console.log('🔍 بررسی مستقیم از contract برای معرفی‌ها...');
        let directReferralCount = 0;
        
        // بررسی 1000 ایندکس اول برای پیدا کردن کاربرانی که شما معرفشان بودید
        for (let i = 1; i <= 1000; i++) {
            try {
                const userAddressAtIndex = await contract.indexToAddress(i);
                if (userAddressAtIndex && userAddressAtIndex !== '0x0000000000000000000000000000000000000000') {
                    const userInfo = await contract.users(userAddressAtIndex);
                    if (userInfo.activated) {
                        console.log(`📊 User at index ${i}:`, userAddressAtIndex, 'activated:', userInfo.activated);
                        
                        // بررسی اینکه آیا این کاربر در زیرمجموعه شماست
                        const userIndex = userInfo.index;
                        if (userIndex && userIndex.toString() !== '0') {
                            console.log(`📊 User ${i} has index:`, userIndex.toString());
                            
                            // بررسی اینکه آیا شما معرف این کاربر بودید
                            // این کار پیچیده است، فعلاً skip می‌کنیم
                        }
                    }
                }
            } catch (e) {
                // اگر ایندکس وجود نداشت، ادامه بده
                continue;
            }
        }
        console.log('📊 Direct referral count:', directReferralCount);
    } catch (error) {
        console.warn('خطا در بررسی مستقیم:', error);
    }
    try {
        console.log('🔍 بررسی مستقیم از contract برای معرفی‌ها...');
        let directReferralCount = 0;
        
        // بررسی 1000 ایندکس اول برای پیدا کردن کاربرانی که شما معرفشان بودید
        for (let i = 1; i <= 1000; i++) {
            try {
                const userAddressAtIndex = await contract.indexToAddress(i);
                if (userAddressAtIndex && userAddressAtIndex !== '0x0000000000000000000000000000000000000000') {
                    const userInfo = await contract.users(userAddressAtIndex);
                    if (userInfo.activated) {
                        // بررسی اینکه آیا این کاربر در زیرمجموعه شماست
                        const userIndex = userInfo.index;
                        if (userIndex && userIndex.toString() !== '0') {
                            // بررسی اینکه آیا شما معرف این کاربر بودید
                            // این کار پیچیده است، فعلاً skip می‌کنیم
                        }
                    }
                }
            } catch (e) {
                // اگر ایندکس وجود نداشت، ادامه بده
                continue;
            }
        }
        console.log('📊 Direct referral count:', directReferralCount);
    } catch (error) {
        console.warn('خطا در بررسی مستقیم:', error);
    }
    
    // PurchaseKind - خریدهای اضافی (purchase) و ثبت‌نام‌ها
    const eventsPurchaseKindAll = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.PurchaseKind(), fromBlock, currentBlock);
    console.log('PurchaseKind events total:', eventsPurchaseKindAll.length);
    
    // برای کاربر خودش
    for (const e of eventsPurchaseKindAll) {
        if (e.args.user && e.args.user.toLowerCase() === userAddress.toLowerCase())
            await pushReport('purchase', 'خرید اضافی', formatCompactUnits(e.args.amountCPA, 18, 'CPA'), e, e.args.user, provider);
    }
    // TokensBought
    const eventsTokensBought = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.TokensBought(), fromBlock, currentBlock);
    console.log('TokensBought events:', eventsTokensBought.length);
    for (const e of eventsTokensBought) {
        if (e.args.buyer && e.args.buyer.toLowerCase() === userAddress.toLowerCase())
            await pushReport('tokensbought', 'خرید توکن', `${formatCompactUnits(e.args.daiAmount, 18, 'DAI', 2, 2)} → ${formatCompactUnits(e.args.tokenAmount, 18, 'CPA')}`, e, e.args.buyer, provider);
    }
    // TokensSold
    const eventsTokensSold = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.TokensSold(), fromBlock, currentBlock);
    console.log('TokensSold events:', eventsTokensSold.length);
    for (const e of eventsTokensSold) {
        if (e.args.seller && e.args.seller.toLowerCase() === userAddress.toLowerCase())
            await pushReport('tokenssold', 'فروش توکن', `${formatCompactUnits(e.args.tokenAmount, 18, 'CPA')} → ${formatCompactUnits(e.args.daiAmount, 18, 'DAI', 2, 2)}`, e, e.args.seller, provider);
    }
    // BinaryPointsUpdated
    const eventsBinaryPoints = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.BinaryPointsUpdated(), fromBlock, currentBlock);
    console.log('BinaryPointsUpdated events:', eventsBinaryPoints.length);
    for (const e of eventsBinaryPoints) {
        if (e.args.user && e.args.user.toLowerCase() === userAddress.toLowerCase())
            await pushReport('binarypoints', 'به‌روزرسانی امتیاز باینری', `${formatNumber(e.args.newPoints, 18)} امتیاز (سقف: ${formatNumber(e.args.newCap, 18)})`, e, e.args.user, provider);
    }
    // BinaryRewardDistributed
    const eventsBinaryReward = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.BinaryRewardDistributed(), fromBlock, currentBlock);
    console.log('BinaryRewardDistributed events:', eventsBinaryReward.length);
    for (const e of eventsBinaryReward) {
        if (e.args.claimer && e.args.claimer.toLowerCase() === userAddress.toLowerCase())
            await pushReport('binaryreward', 'دریافت پاداش باینری', `${formatCompactUnits(e.args.claimerReward, 18, 'CPA')}`, e, e.args.claimer, provider);
    }
    // BinaryPoolUpdated (عمومی)
    const eventsBinaryPool = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.BinaryPoolUpdated(), fromBlock, currentBlock);
    console.log('BinaryPoolUpdated events:', eventsBinaryPool.length);
    for (const e of eventsBinaryPool) {
        await pushReport('binarypool', 'به‌روزرسانی استخر باینری', `${formatCompactUnits(e.args.addedAmount, 18, 'CPA')} (سایز جدید: ${formatCompactUnits(e.args.newPoolSize, 18, 'CPA')})`, e, null, provider);
    }
    // TreeStructureUpdated
    const eventsTree = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.TreeStructureUpdated(), fromBlock, currentBlock);
    console.log('TreeStructureUpdated events:', eventsTree.length);
    for (const e of eventsTree) {
        if (e.args.user && e.args.user.toLowerCase() === userAddress.toLowerCase()) {
            let posLabel = e.args.position == 0 ? 'فرزند چپ' : e.args.position == 1 ? 'فرزند راست' : `موقعیت: ${e.args.position}`;
            await pushReport('tree', 'تغییر ساختار شبکه', posLabel, e, e.args.user, provider);
        }
    }
    // Transfer - تشخیص دقیق نوع انتقال
    const eventsTransfer = await contractWithProvider.queryFilter(contractWithProvider.filters.Transfer(), fromBlock, currentBlock);
    for (const e of eventsTransfer) {
        if ((e.args[0] && e.args[0].toLowerCase() === userAddress.toLowerCase()) ||
            (e.args[1] && e.args[1].toLowerCase() === userAddress.toLowerCase())) {
            
            const fromAddr = e.args[0];
            const toAddr = e.args[1];
            const amount = e.args[2];
            let transferType = 'transfer';
            let transferTitle = 'انتقال توکن';
            
            // تشخیص نوع انتقال بر اساس آدرس‌ها
            if (fromAddr.toLowerCase() === contract.target.toLowerCase()) {
                // انتقال از قرارداد = خرید/فروش/پاداش
                if (toAddr.toLowerCase() === userAddress.toLowerCase()) {
                    transferType = 'reward_transfer';
                    transferTitle = 'دریافت از قرارداد';
                }
            } else if (toAddr.toLowerCase() === contract.target.toLowerCase()) {
                // انتقال به قرارداد = پرداخت/ثبت‌نام
                if (fromAddr.toLowerCase() === userAddress.toLowerCase()) {
                    transferType = 'payment_transfer';
                    transferTitle = 'پرداخت به قرارداد';
                }
            } else if (fromAddr.toLowerCase() === userAddress.toLowerCase()) {
                // شما فرستنده = انتقال خروجی
                transferType = 'outgoing_transfer';
                transferTitle = 'انتقال خروجی';
            } else if (toAddr.toLowerCase() === userAddress.toLowerCase()) {
                // شما گیرنده = انتقال ورودی
                transferType = 'incoming_transfer';
                transferTitle = 'انتقال ورودی';
            }
            
            await pushReport(
                transferType,
                transferTitle,
                `${formatCompactUnits(amount, 18, 'CPA')}`,
                e,
                {from: fromAddr, to: toAddr},
                provider
            );
        }
    }
    // Approval
    const eventsApproval = await contractWithProvider.queryFilter(contractWithProvider.filters.Approval(), fromBlock, currentBlock);
    for (const e of eventsApproval) {
        if ((e.args.owner && e.args.owner.toLowerCase() === userAddress.toLowerCase()) ||
            (e.args.spender && e.args.spender.toLowerCase() === userAddress.toLowerCase())) {
            await pushReport('approval', 'تأییدیه انتقال', `${formatCompactUnits(e.args.value, 18, 'CPA')}`, e, e.args.owner === userAddress ? e.args.spender : e.args.owner, provider);
        }
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
        if (e.args.user && e.args.user.toLowerCase() === userAddress.toLowerCase())
            await pushReport('monthlyreward', 'دریافت پاداش ماهانه', `${formatCompactUnits(e.args.reward, 18, 'CPA')} (${e.args.monthsPassed} ماه)`, e, e.args.user, provider);
    }
    // MonthlyRewardFailed
    const eventsMonthlyFail = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.MonthlyRewardFailed(), fromBlock, currentBlock);
    for (const e of eventsMonthlyFail) {
        if (e.args.user && e.args.user.toLowerCase() === userAddress.toLowerCase())
            await pushReport('monthlyfail', 'عدم موفقیت پاداش ماهانه', e.args.reason, e, e.args.user, provider);
    }
    // DAI Transfer Events - انتقالات DAI جداگانه
    try {
        const daiContract = new ethers.Contract(window.DAI_ADDRESS, [
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
                    {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
                    {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
                ],
                "name": "Transfer",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
                    {"indexed": true, "internalType": "address", "name": "spender", "type": "address"},
                    {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
                ],
                "name": "Approval",
                "type": "event"
            }
        ], provider);
        
        console.log('📊 Fetching DAI Transfer events...');
        const eventsDAITransfer = await daiContract.queryFilter(daiContract.filters.Transfer(), fromBlock, currentBlock);
        console.log('📊 DAI Transfer events total:', eventsDAITransfer.length);
        
        let daiTransferCount = 0;
        for (const e of eventsDAITransfer) {
            if ((e.args[0] && e.args[0].toLowerCase() === userAddress.toLowerCase()) ||
                (e.args[1] && e.args[1].toLowerCase() === userAddress.toLowerCase())) {
                
                const fromAddr = e.args[0];
                const toAddr = e.args[1];
                const amount = e.args[2];
                let transferType = 'dai_transfer';
                let transferTitle = 'انتقال DAI';
                
                // تشخیص نوع انتقال DAI
                if (fromAddr.toLowerCase() === userAddress.toLowerCase()) {
                    transferType = 'dai_outgoing_transfer';
                    transferTitle = 'انتقال DAI خروجی';
                } else if (toAddr.toLowerCase() === userAddress.toLowerCase()) {
                    transferType = 'dai_incoming_transfer';
                    transferTitle = 'انتقال DAI ورودی';
                }
                
                daiTransferCount++;
                await pushReport(
                    transferType,
                    transferTitle,
                    `${formatCompactUnits(amount, 18, 'DAI', 2, 2)}`,
                    e,
                    {from: fromAddr, to: toAddr},
                    provider
                );
            }
        }
        console.log('📊 DAI Transfer events for user:', daiTransferCount);
        
        // DAI Approval Events
        const eventsDAIApproval = await daiContract.queryFilter(daiContract.filters.Approval(), fromBlock, currentBlock);
        for (const e of eventsDAIApproval) {
            if ((e.args.owner && e.args.owner.toLowerCase() === userAddress.toLowerCase()) ||
                (e.args.spender && e.args.spender.toLowerCase() === userAddress.toLowerCase())) {
                await pushReport('dai_approval', 'تأییدیه DAI', `${formatCompactUnits(e.args.value, 18, 'DAI', 2, 2)}`, e, e.args.owner === userAddress ? e.args.spender : e.args.owner, provider);
            }
        }
        
    } catch (error) {
        console.warn('خطا در دریافت DAI events:', error);
    }

    // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
    reports.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return reports;
};

// نمایش گزارشات دسته‌بندی شده (دیگر استفاده نمی‌شود؛ استریم جایگزین است)
window.loadReports = async function() {
  if (typeof window.startReportsStream === 'function') {
    await window.startReportsStream();
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
                fromPromise = displayAddress(report.address.from, window.contractConfig.contract, window.contractConfig.CPA_ADDRESS).then(addr => {
                    if (addr.startsWith('CPA')) return addr;
                    if (addr === 'قرارداد') return addr;
                    return ultraShortAddress(report.address.from);
                });
                toPromise = displayAddress(report.address.to, window.contractConfig.contract, window.contractConfig.CPA_ADDRESS).then(addr => {
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
        case 'registration':
            return `${time} 🎯 شما با پرداخت ${amount} ثبت‌نام و فعال شدید. ۵٪ توکن سوزانده شد، ۱۰٪ به توسعه‌دهنده، ۱۰٪ به معرف و ۷۵٪ به پشتوانه قرارداد واریز شد.`;
        case 'referral_registration':
            return `${time} 👥 شما کاربری را معرفی و ثبت‌نام کردید. مقدار: ${amount}. شما ۱۰٪ کمیسیون معرف دریافت کردید.`;
        case 'purchase':
            return `${time} 🛒 شما خرید اضافی ${amount} انجام دادید. این مبلغ به پشتوانه قرارداد اضافه شد.`;
        case 'tokensbought':
            return `${time} 💰 شما در بازار سواپ ${amount} خریدید.`;
        case 'tokenssold':
            return `${time} 💸 شما در بازار سواپ ${amount} فروختید.`;
        case 'reward_transfer':
            return `${time} 🎁 شما ${amount} از قرارداد دریافت کردید (پاداش/بونوس).`;
        case 'payment_transfer':
            return `${time} 💳 شما ${amount} به قرارداد پرداخت کردید (ثبت‌نام/خرید).`;
        case 'incoming_transfer':
            return Promise.all([
                displayAddress(report.address.from, window.contractConfig.contract, window.contractConfig.CPA_ADDRESS)
            ]).then(([fromAddr]) => 
                `${time} 📥 شما ${amount} از <span class='wallet-address'>${fromAddr}</span> دریافت کردید.`
            );
        case 'outgoing_transfer':
            return Promise.all([
                displayAddress(report.address.to, window.contractConfig.contract, window.contractConfig.CPA_ADDRESS)
            ]).then(([toAddr]) => 
                `${time} 📤 شما ${amount} به <span class='wallet-address'>${toAddr}</span> انتقال دادید.`
            );
        case 'dai_incoming_transfer':
            return Promise.all([
                displayAddress(report.address.from, window.contractConfig.contract, window.contractConfig.CPA_ADDRESS)
            ]).then(([fromAddr]) => 
                `${time} 💵📥 شما ${amount} از <span class='wallet-address'>${fromAddr}</span> دریافت کردید.`
            );
        case 'dai_outgoing_transfer':
            return Promise.all([
                displayAddress(report.address.to, window.contractConfig.contract, window.contractConfig.CPA_ADDRESS)
            ]).then(([toAddr]) => 
                `${time} 💵📤 شما ${amount} به <span class='wallet-address'>${toAddr}</span> انتقال دادید.`
            );
        case 'dai_approval':
            return displayAddress(report.address, window.contractConfig.contract, window.contractConfig.CPA_ADDRESS).then(addr => 
                `${time} 💵✅ شما مجوز انتقال ${amount} صادر کردید برای: <span class='wallet-address'>${addr}</span>`
            );
        case 'binarypoints':
            return `${time} ⭐ امتیاز باینری شما به ${amount} تغییر یافت.`;
        case 'binaryreward':
            return `${time} 🏆 شما پاداش باینری ${amount} دریافت کردید.`;
        case 'binarypool':
            return `${time} 🏊 استخر باینری بروزرسانی شد: ${amount}`;
        case 'tree':
            return `${time} 🌳 یک کاربر جدید در سمت ${amount} شما ثبت شد.`;
        case 'approval':
            return displayAddress(report.address, window.contractConfig.contract, window.contractConfig.CPA_ADDRESS).then(addr => 
                `${time} ✅ شما مجوز انتقال ${amount} صادر کردید برای: <span class='wallet-address'>${addr}</span>`
            );
        case 'indextransfer':
            return `${time} 🔄 ${amount}`;
        case 'monthlyreward':
            return `${time} 📅 شما پاداش ماهانه ${amount} دریافت کردید.`;
        case 'monthlyfail':
            return `${time} ❌ دریافت پاداش ماهانه ناموفق: ${amount}`;
        default:
            if (title && amount) return `${time} ${title}: ${amount}`;
            if (amount) return `${time} ${amount}`;
            if (title) return `${time} ${title}`;
            return `${time} گزارش بدون عنوان`;
    }
} // پایان تابع getReportSentence

// استریم تایپ‌نویس از اول تا آخر رویدادها
(function(){
  function stripTags(html){
    try { const tmp = document.createElement('div'); tmp.innerHTML = html; return tmp.textContent || tmp.innerText || ''; } catch { return String(html||''); }
  }
  async function typeWrite(el, text, speed, token){
    el.textContent = '';
    const s = typeof speed === 'number' ? speed : 12;
    // ایجاد کرسر اولیه
    let cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    el.appendChild(cursor);
    for (let i=0;i<text.length;i++){
      if (token && window._typewriterToken !== token) return;
      // درج کاراکتر قبل از کرسر
      cursor.remove();
      el.appendChild(document.createTextNode(text[i]));
      el.appendChild(cursor);
      // micro delay
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r=>setTimeout(r, s));
    }
    // کرسر باقی می‌ماند و چشمک می‌زند
  }
  window.startReportsStream = async function(){
    try {
      const container = document.getElementById('reports-list');
      if (!container) return;
      container.innerHTML = '<div class="loading">در حال جستجو و نمایش گزارشات...</div>';
      const reports = await window.fetchReports();
      let filtered = reports || [];
      if (window.REPORT_TYPE_FILTER && window.REPORT_TYPE_FILTER !== 'all') {
        filtered = filtered.filter(r => r.type === window.REPORT_TYPE_FILTER);
      }
      // قدیمی به جدید برای روخوانی تاریخی
      filtered.sort((a,b)=> (a.timestamp||0) - (b.timestamp||0));
      container.innerHTML = '';
      // اتصال نوار پیشرفت گزارشات
      const progressBar = document.querySelector('#reports-progress .bar');
      const setProgress = (done, total) => {
        try {
          const pct = total > 0 ? Math.min(100, Math.round((done/total)*100)) : 0;
          if (progressBar) progressBar.style.width = pct + '%';
        } catch(_) {}
      };
      const token = Date.now();
      window._typewriterToken = token;
      setProgress(0, filtered.length);
      let processed = 0;
      for (const report of filtered){
        if (window._typewriterToken !== token) return; // متوقف شده
        const div = document.createElement('div');
        div.className = 'report-sentence';
        container.appendChild(div);
        const sentence = await getReportSentence(report);
        const plain = stripTags(sentence) + '\n';
        // eslint-disable-next-line no-await-in-loop
        await typeWrite(div, plain, 12, token);
        div.scrollIntoView({behavior:'smooth', block:'end'});
        processed += 1; setProgress(processed, filtered.length);
      }
    } catch (e){
      const container = document.getElementById('reports-list');
      if (container) container.innerHTML = `<div class="error-message">${e && e.message ? e.message : e}</div>`;
    }
  };
})();