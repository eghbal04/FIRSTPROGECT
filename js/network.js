// network.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // بررسی وجود ethers و contractConfig
        if (typeof ethers === 'undefined' || !window.contractConfig) {
            throw new Error("Ethers.js or contract config not loaded");
        }

        // بررسی اتصال کیف پول
        const connection = await checkConnection();
        if (!connection.connected) {
            showError("لطفا ابتدا کیف پول خود را متصل کنید");
            return;
        }

        // دریافت آمار شبکه
        await updateNetworkStats();

        // راه‌اندازی دکمه کپی لینک دعوت
        setupReferralCopy();

        // نمایش ساختار درختی
        await renderNetworkTree();

    } catch (error) {
        console.error("Error in network stats:", error);
        showError("خطا در بارگذاری اطلاعات شبکه");
    }
});

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

// تابع به‌روزرسانی آمار شبکه
async function updateNetworkStats() {
    try {
        const { contract, address } = await connectWallet();
        
        // دریافت آمار کلی
        const [totalUsers, binaryPool, rewardPool] = await Promise.all([
            contract.totalUsers(),
            contract.binaryPool(),
            contract.rewardPool()
        ]);

        // دریافت اطلاعات کاربر
        const userData = await contract.users(address);
        
        // به‌روزرسانی UI
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        updateElement('network-members', parseInt(totalUsers).toLocaleString());
        updateElement('network-points', parseFloat(ethers.formatUnits(userData.binaryPoints, 18)).toLocaleString('en-US', {maximumFractionDigits: 4}));
        // نمایش پاداش به دلار
        const lvlPrice = await contract.getTokenPriceInUSD();
        const rewardPoolUSD = parseFloat(ethers.formatEther(rewardPool)) * parseFloat(ethers.formatUnits(lvlPrice, 18));
        updateElement('network-rewards', `$${rewardPoolUSD.toLocaleString('en-US', {maximumFractionDigits: 2})} USD`);

        // ایجاد لینک دعوت
        const referralLink = `${window.location.origin}/?ref=${address}`;
        const shortReferral = referralLink.length > 32 ? referralLink.substring(0, 20) + '...' + referralLink.slice(-8) : referralLink;
        updateElement('referral-link', shortReferral);

        // به‌روزرسانی آمار باینری
        await updateBinaryStats();

    } catch (error) {
        console.error("Network stats error:", error);
        showError("خطا در دریافت اطلاعات شبکه");
    }
}

// تابع به‌روزرسانی آمار باینری
async function updateBinaryStats() {
    try {
        const { contract, address } = await connectWallet();
        
        // دریافت داده‌های کاربر
        const userData = await contract.users(address);
        
        // محاسبه مقادیر
        const formatValue = (value) => ethers.formatUnits(value, 18);
        const leftPoints = formatValue(userData.leftPoints || 0);
        const rightPoints = formatValue(userData.rightPoints || 0);
        const totalPoints = formatValue(userData.binaryPoints);
        const pointsCap = formatValue(userData.binaryPointCap);
        
        // محاسبه تعادل و پاداش قابل پرداخت
        const balancedPoints = Math.min(parseFloat(leftPoints), parseFloat(rightPoints));
        const remainingCap = Math.max(0, parseFloat(pointsCap) - parseFloat(formatValue(userData.binaryPointsClaimed)));
        
        // به‌روزرسانی UI
        const updateUI = (id, value, unit = '') => {
            const el = document.getElementById(id);
            if (el) {
                if (typeof value === 'number' || !isNaN(value)) {
                    value = parseFloat(value).toLocaleString('en-US', {maximumFractionDigits: 4});
                }
                el.textContent = `${value} ${unit}`.trim();
            }
        };
        
        updateUI('left-points', leftPoints);
        updateUI('right-points', rightPoints);
        updateUI('total-points', totalPoints);
        updateUI('points-cap', pointsCap);
        updateUI('balanced-points', balancedPoints);
        updateUI('remaining-cap', remainingCap);
        updateUI('claimable-rewards', calculateRewards(balancedPoints));
        
        // نمایش گرافیکی تعادل
        renderBalanceChart(leftPoints, rightPoints);
        
    } catch (error) {
        console.error("Binary stats error:", error);
    }
}

// محاسبه پاداش‌ها
function calculateRewards(balancedPoints) {
    const rewardRate = 0.1; // 10% از پوینت‌های متعادل
    return (balancedPoints * rewardRate).toFixed(4);
}

// رندر نمودار تعادل
function renderBalanceChart(left, right) {
    const leftBar = document.getElementById('left-bar');
    const rightBar = document.getElementById('right-bar');
    const balanceDiff = document.getElementById('balance-diff');
    
    if (!leftBar || !rightBar) return;
    
    const max = Math.max(left, right) || 1;
    const leftPercent = (left / max) * 100;
    const rightPercent = (right / max) * 100;
    
    leftBar.style.height = `${leftPercent}%`;
    rightBar.style.height = `${rightPercent}%`;
    
    const diff = Math.abs(left - right);
    if (balanceDiff) balanceDiff.textContent = `تعادل: ${diff.toFixed(2)}`;
}

// راه‌اندازی دکمه کپی لینک دعوت
function setupReferralCopy() {
    const copyBtn = document.getElementById('copyReferral');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            try {
                const { address } = await connectWallet();
                const referralLink = `${window.location.origin}/?ref=${address}`;
                
                await navigator.clipboard.writeText(referralLink);
                copyBtn.textContent = 'کپی شد!';
                setTimeout(() => copyBtn.textContent = 'کپی', 1500);
            } catch (error) {
                console.error("Error copying referral link:", error);
            }
        });
    }
}

// تابع نمایش درخت شبکه
async function renderNetworkTree() {
    try {
        const { address } = await connectWallet();
        const treeData = await getUserTree(address);
        const treeContainer = document.getElementById('network-tree');
        
        if (!treeContainer) return;
        
        treeContainer.innerHTML = `
            <div class="tree-node user-node">
                <span>شما</span>
                <div class="user-stats">
                    <div>امتیاز: ${treeData.binaryPoints}/${treeData.binaryPointCap}</div>
                    <div>وضعیت: ${treeData.activated ? "فعال" : "غیرفعال"}</div>
                </div>
            </div>
            
            <div class="tree-connectors">
                ${treeData.left !== ethers.ZeroAddress ? `
                <div class="connector-line left-line"></div>
                ` : ''}
                
                ${treeData.right !== ethers.ZeroAddress ? `
                <div class="connector-line right-line"></div>
                ` : ''}
            </div>
            
            <div class="tree-children">
                ${treeData.left !== ethers.ZeroAddress ? `
                <div class="tree-node left-node">
                    <span>${shortenAddress(treeData.left)}</span>
                </div>
                ` : '<div class="tree-node empty">(خالی)</div>'}
                
                ${treeData.right !== ethers.ZeroAddress ? `
                <div class="tree-node right-node">
                    <span>${shortenAddress(treeData.right)}</span>
                </div>
                ` : '<div class="tree-node empty">(خالی)</div>'}
            </div>
        `;
    } catch (error) {
        console.error("Error rendering network tree:", error);
    }
}

// تابع کمکی برای کوتاه کردن آدرس
function shortenAddress(address) {
    if (!address || address === ethers.ZeroAddress) return '---';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// تابع نمایش خطا
function showError(message) {
    const statusElement = document.getElementById('network-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = '#ff6b6b';
    }
}

// تابع دریافت امتیازات باینری
async function getBinaryPoints() {
    try {
        const { contract, address } = await connectWallet();
        
        // دریافت داده‌های کاربر از قرارداد
        const userData = await contract.users(address);
        
        return {
            leftPoints: ethers.formatUnits(userData.leftPoints, 18),
            rightPoints: ethers.formatUnits(userData.rightPoints, 18),
            totalPoints: ethers.formatUnits(userData.binaryPoints, 18),
            pointsCap: ethers.formatUnits(userData.binaryPointCap, 18)
        };
    } catch (error) {
        console.error("Error fetching binary points:", error);
        return {
            leftPoints: "0",
            rightPoints: "0",
            totalPoints: "0",
            pointsCap: "0"
        };
    }
}

// دریافت تعداد زیرمجموعه‌ها
async function getTeamCounts(contract, address) {
    try {
        const [leftCount, rightCount] = await Promise.all([
            contract.getTeamCount(address, 0), // 0 برای سمت چپ
            contract.getTeamCount(address, 1)  // 1 برای سمت راست
        ]);
        
        return {
            left: leftCount.toString(),
            right: rightCount.toString()
        };
    } catch (error) {
        console.error("Team count error:", error);
        return { left: "0", right: "0" };
    }
}

// تابع دریافت اطلاعات درخت کاربر
async function fetchUserTree() {
    try {
        const { contract, address } = await connectWallet();
        
        // دریافت داده‌های درخت از قرارداد
        const [leftChild, rightChild, activated, binaryPoints, binaryPointCap] = 
            await contract.getUserTree(address);
        
        // دریافت اطلاعات تکمیلی
        const [leftPoints, rightPoints] = await Promise.all([
            leftChild !== ethers.ZeroAddress ? contract.balanceOf(leftChild) : Promise.resolve(0),
            rightChild !== ethers.ZeroAddress ? contract.balanceOf(rightChild) : Promise.resolve(0)
        ]);
        
        return {
            leftChild,
            rightChild,
            activated,
            binaryPoints: binaryPoints.toString(),
            binaryPointCap: binaryPointCap.toString(),
            leftPoints: ethers.formatUnits(leftPoints, 18),
            rightPoints: ethers.formatUnits(rightPoints, 18)
        };
    } catch (error) {
        console.error("Error fetching user tree:", error);
        return {
            leftChild: null,
            rightChild: null,
            activated: false,
            binaryPoints: "0",
            binaryPointCap: "0",
            leftPoints: "0",
            rightPoints: "0"
        };
    }
}