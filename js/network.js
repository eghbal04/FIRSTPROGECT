// network.js
let isNetworkLoading = false;

// تابع راه‌اندازی تب شبکه (برای استفاده در tab switching)
window.initializeNetworkTab = async function() {
    try {
        console.log('Network: Initializing network tab...');
        
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

        // راه‌اندازی دکمه دریافت پاداش باینری
        setupClaimButton();

        // نمایش ساختار درختی
        await renderNetworkTree();

        // به‌روزرسانی اطلاعات claim
        await updateClaimInfo();

        console.log('Network: Network tab initialized successfully');

    } catch (error) {
        console.error("Error initializing network tab:", error);
        showError("خطا در بارگذاری اطلاعات شبکه");
    }
};

// تابع بررسی اتصال (برای استفاده در initializeNetworkTab)
async function checkConnection() {
    try {
        const walletConfig = await window.connectWallet();
        return {
            connected: !!(walletConfig && walletConfig.contract && walletConfig.address),
            config: walletConfig
        };
    } catch (error) {
        return {
            connected: false,
            error: error.message
        };
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Network tab will be initialized when user clicks on it
    console.log('Network module loaded successfully');
});

// تابع اتصال به کیف پول با انتظار
async function connectWallet() {
    try {
        console.log('Network: Attempting to connect wallet...');
        
        // بررسی اتصال موجود
        if (window.contractConfig && window.contractConfig.contract && window.contractConfig.address && window.contractConfig.signer) {
            console.log('Network: Wallet already connected');
            return {
                contract: window.contractConfig.contract,
                address: window.contractConfig.address,
                signer: window.contractConfig.signer
            };
        }
        
        // بررسی اتصال MetaMask موجود
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                console.log('Network: MetaMask already connected, initializing Web3...');
                try {
                    // بررسی اینکه آیا window.contractConfig.initializeWeb3 وجود دارد
                    if (window.contractConfig && typeof window.contractConfig.initializeWeb3 === 'function') {
                        const config = await window.contractConfig.initializeWeb3();
                        if (config && config.contract && config.address && config.signer) {
                            return {
                                contract: config.contract,
                                address: config.address,
                                signer: config.signer
                            };
                        } else {
                            throw new Error('خطا در راه‌اندازی Web3 - اطلاعات ناقص');
                        }
                    } else {
                        throw new Error('تابع initializeWeb3 در دسترس نیست');
                    }
                } catch (error) {
                    console.log('Network: Failed to initialize Web3:', error);
                    throw new Error('خطا در راه‌اندازی Web3: ' + error.message);
                }
            }
        }
        
        console.log('Network: No existing connection, user needs to connect manually');
        throw new Error('لطفاً ابتدا کیف پول خود را متصل کنید');
        
    } catch (error) {
        console.error('Network: Error connecting wallet:', error);
        showNetworkStatus('خطا در اتصال به کیف پول: ' + error.message, 'error');
        throw error;
    }
}

// تابع به‌روزرسانی آمار شبکه
async function updateNetworkStats() {
    if (isNetworkLoading) {
        return;
    }
    
    isNetworkLoading = true;
    
    try {
        const { contract, address } = await connectWallet();
        
        // بررسی اینکه آیا کاربر ثبت‌نام کرده است
        try {
            const isRegistered = await contract.registered(address);
            
            if (!isRegistered) {
                document.getElementById('network-members').textContent = 'کاربر ثبت‌نام نکرده';
                document.getElementById('network-points').textContent = 'کاربر ثبت‌نام نکرده';
                document.getElementById('network-rewards').textContent = 'کاربر ثبت‌نام نکرده';
                document.getElementById('referral-link').textContent = 'کاربر ثبت‌نام نکرده';
                document.getElementById('copyReferral').disabled = true;
                document.getElementById('claimable-points').textContent = 'کاربر ثبت‌نام نکرده';
                document.getElementById('point-value-display').textContent = 'کاربر ثبت‌نام نکرده';
                document.getElementById('total-claimable-reward').textContent = 'کاربر ثبت‌نام نکرده';
                document.getElementById('claimRewardsBtn').disabled = true;
                document.getElementById('network-tree').innerHTML = '<p class="network-tree-empty">کاربر ثبت‌نام نکرده</p>';
                isNetworkLoading = false;
                return;
            }
        } catch (error) {
            console.error('Error checking registration status:', error);
            // اگر خطا در بررسی ثبت‌نام رخ داد، فرض می‌کنیم کاربر ثبت‌نام نکرده
            document.getElementById('network-members').textContent = 'کاربر ثبت‌نام نکرده';
            document.getElementById('network-points').textContent = 'کاربر ثبت‌نام نکرده';
            document.getElementById('network-rewards').textContent = 'کاربر ثبت‌نام نکرده';
            document.getElementById('referral-link').textContent = 'کاربر ثبت‌نام نکرده';
            document.getElementById('copyReferral').disabled = true;
            document.getElementById('claimable-points').textContent = 'کاربر ثبت‌نام نکرده';
            document.getElementById('point-value-display').textContent = 'کاربر ثبت‌نام نکرده';
            document.getElementById('total-claimable-reward').textContent = 'کاربر ثبت‌نام نکرده';
            document.getElementById('claimRewardsBtn').disabled = true;
            document.getElementById('network-tree').innerHTML = '<p class="network-tree-empty">کاربر ثبت‌نام نکرده</p>';
            isNetworkLoading = false;
            return;
        }
        
        // دریافت آمار شبکه
        const [totalUsers, totalPoints, totalClaimableBinaryPoints] = await Promise.all([
            contract.totalUsers(),
            contract.totalPoints(),
            contract.totalClaimableBinaryPoints()
        ]);
        
        // به‌روزرسانی آمار شبکه
        document.getElementById('network-members').textContent = safeFormat(totalUsers.toString());
        document.getElementById('network-points').textContent = safeFormat(ethers.formatUnits(totalPoints, 18));
        document.getElementById('network-rewards').textContent = safeFormat(ethers.formatUnits(totalClaimableBinaryPoints, 18));

        // به‌روزرسانی لینک دعوت
        const referralLink = `${window.location.origin}/?ref=${address}`;
        document.getElementById('referral-link').textContent = window.location.origin + '/?ref=' + shortenAddress(address);
        document.getElementById('copyReferral').disabled = false;

        // به‌روزرسانی اطلاعات claim
        await updateClaimInfo();

        showNetworkStatus('آمار شبکه به‌روزرسانی شد', 'success');
        
    } catch (error) {
        console.error('Error updating network stats:', error);
        document.getElementById('network-status').textContent = 'خطا در به‌روزرسانی آمار شبکه';
        document.getElementById('network-status').className = 'network-status error';
    } finally {
        isNetworkLoading = false;
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
        const pointsCap = Math.floor(formatValue(userData.binaryPointCap));
        
        // محاسبه تعادل و پاداش قابل پرداخت
        const balancedPoints = Math.min(leftPoints, rightPoints);
        const rewards = calculateRewards(balancedPoints);
        
        // به‌روزرسانی UI
        const updateUI = (id, value, unit = '') => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value + unit;
            }
        };
        
        updateUI('left-points', leftPoints);
        updateUI('right-points', rightPoints);
        updateUI('total-binary-points', totalPoints);
        updateUI('points-cap', pointsCap);
        updateUI('balanced-points', balancedPoints);
        updateUI('binary-rewards', rewards);
        
        // رندر کردن چارت تعادل
        renderBalanceChart(leftPoints, rightPoints);
        
    } catch (error) {
        console.error('Error updating binary stats:', error);
        showNetworkStatus('خطا در به‌روزرسانی آمار باینری', 'error');
    }
}

// تابع محاسبه پاداش‌ها
function calculateRewards(balancedPoints) {
    // این تابع می‌تواند بر اساس منطق کسب‌وکار شما تغییر کند
    const rewardRate = 0.1; // 10% پاداش
    return (balancedPoints * rewardRate).toFixed(2);
}

// تابع رندر چارت تعادل
function renderBalanceChart(left, right) {
    const chartContainer = document.getElementById('balance-chart');
    if (!chartContainer) return;
    
    const total = parseFloat(left) + parseFloat(right);
    const leftPercentage = total > 0 ? (parseFloat(left) / total) * 100 : 50;
    const rightPercentage = 100 - leftPercentage;
    
    chartContainer.innerHTML = `
        <div class="balance-chart">
            <div class="chart-bar">
                <div class="left-bar" style="width: ${leftPercentage}%"></div>
                <div class="right-bar" style="width: ${rightPercentage}%"></div>
            </div>
            <div class="chart-labels">
                <span>چپ: ${left}</span>
                <span>راست: ${right}</span>
            </div>
        </div>
    `;
}

// تابع راه‌اندازی کپی لینک دعوت
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

// تابع رندر درخت شبکه
async function renderNetworkTree() {
    try {
        const { contract, address } = await connectWallet();
        
        const treeContainer = document.getElementById('network-tree');
        if (!treeContainer) return;
        
        // بررسی اینکه آیا کاربر ثبت‌نام کرده است
        const isRegistered = await contract.registered(address);
        if (!isRegistered) {
            treeContainer.innerHTML = `
                <div class="network-tree-empty">
                    <h3>شما هنوز ثبت‌نام نکرده‌اید</h3>
                    <p>برای مشاهده درخت شبکه، ابتدا ثبت‌نام کنید.</p>
                </div>
            `;
            return;
        }
        
        // رندر کردن گره اصلی (کاربر فعلی)
        await renderTreeNode(address, 'network-tree', 0);
        
        showNetworkStatus('درخت شبکه رندر شد', 'success');
        
    } catch (error) {
        console.error('Error rendering network tree:', error);
        showNetworkStatus('خطا در رندر درخت شبکه', 'error');
    }
}

// تابع نمایش گره درخت شبکه
async function renderTreeNode(userAddress, containerId, level = 0) {
    try {
        const { contract, address } = await connectWallet();
        
        // دریافت اطلاعات کاربر
        const userData = await contract.users(userAddress);
        const isCurrentUser = userAddress.toLowerCase() === address.toLowerCase();
        const isRegistered = userData.index > 0;
        
        if (!isRegistered) {
            return createEmptyNode(containerId, level);
        }
        
        // دریافت اطلاعات درخت کاربر
        const [left, right, activated, binaryPoints, binaryPointCap] = await contract.getUserTree(userAddress);
        
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const nodeHeader = `
            <div class="node-header">
                <div class="node-info">
                    <div class="node-title">${isCurrentUser ? 'شما' : shortenAddress(userAddress)}</div>
                    <div class="node-status ${userData.activated ? 'active' : 'inactive'}">
                        ${userData.activated ? 'فعال' : 'غیرفعال'}
                    </div>
                </div>
                <div class="expand-icon" onclick="toggleNodeExpansion('${userAddress}', ${level})">▼</div>
            </div>
        `;
        
        const nodeDetails = `
            <div class="node-details">
                <div class="node-stat">
                    <span class="stat-label">امتیاز باینری:</span>
                    <span class="stat-value">${ethers.formatUnits(binaryPoints, 18)}</span>
                </div>
                <div class="node-stat">
                    <span class="stat-label">سقف امتیاز:</span>
                    <span class="stat-value">${parseInt(ethers.formatUnits(binaryPointCap, 18))}</span>
                </div>
            </div>
        `;
        
        const childrenContainer = `
            <div class="children-container" id="children-${userAddress}">
                <div class="children-wrapper">
                    ${left !== ethers.ZeroAddress ? `<div class="tree-node child-node left-child level-${level + 1}" data-address="${left}"></div>` : ''}
                    ${right !== ethers.ZeroAddress ? `<div class="tree-node child-node right-child level-${level + 1}" data-address="${right}"></div>` : ''}
                </div>
            </div>
        `;
        
        const nodeHTML = `
            <div class="tree-node ${isCurrentUser ? 'current-user' : ''} level-${level}">
                ${nodeHeader}
                ${nodeDetails}
                ${childrenContainer}
            </div>
        `;
        
        container.innerHTML = nodeHTML;
        
        // رندر کردن فرزندان
        if (left !== ethers.ZeroAddress) {
            await renderChildNode(left, container.querySelector('.left-child'), 'left', level + 1);
        }
        if (right !== ethers.ZeroAddress) {
            await renderChildNode(right, container.querySelector('.right-child'), 'right', level + 1);
        }
        
    } catch (error) {
        console.error('Error rendering tree node:', error);
        showNetworkStatus('خطا در رندر گره درخت', 'error');
    }
}

// تابع تغییر وضعیت گسترش گره
async function toggleNodeExpansion(userAddress, level) {
    try {
        const childrenContainer = document.getElementById(`children-${userAddress}`);
        if (!childrenContainer) return;
        
        const isExpanded = childrenContainer.style.display !== 'none';
        childrenContainer.style.display = isExpanded ? 'none' : 'block';
        
        const expandIcon = childrenContainer.parentElement.querySelector('.expand-icon');
        if (expandIcon) {
            expandIcon.textContent = isExpanded ? '▼' : '▲';
        }
        
    } catch (error) {
        console.error('Error toggling node expansion:', error);
    }
}

// تابع بارگذاری فرزندان
async function loadChildren(parentAddress, container, level) {
    try {
        const { contract } = await connectWallet();
        
        const [left, right] = await contract.getUserTree(parentAddress);
        
        if (left !== ethers.ZeroAddress) {
            await renderChildNode(left, container, 'left', level);
        }
        if (right !== ethers.ZeroAddress) {
            await renderChildNode(right, container, 'right', level);
        }
        
    } catch (error) {
        console.error('Error loading children:', error);
    }
}

// تابع رندر گره فرزند
async function renderChildNode(childAddress, container, position, level) {
    try {
        const { contract, address } = await connectWallet();
        
        const treeData = await contract.getUserTree(childAddress);
        const isCurrentUser = childAddress.toLowerCase() === address.toLowerCase();
        
        const childHTML = `
            <div class="tree-node child-node ${position}-child level-${level + 1}" data-address="${childAddress}" data-level="${level + 1}">
                <div class="node-header">
                    <div class="node-info">
                        <span class="node-title">${shortenAddress(childAddress)}</span>
                        <span class="node-status ${treeData.activated ? 'active' : 'inactive'}">
                            ${treeData.activated ? 'فعال' : 'غیرفعال'}
                        </span>
                    </div>
                    <span class="expand-icon" onclick="toggleNodeExpansion('${childAddress}', ${level + 1})">▼</span>
                </div>
                <div class="node-details">
                    <div class="node-stat">
                        <span class="stat-label">امتیاز:</span>
                        <span class="stat-value">${treeData.binaryPoints}</span>
                    </div>
                    <div class="node-stat">
                        <span class="stat-label">سقف:</span>
                        <span class="stat-value">${treeData.binaryPointCap}</span>
                    </div>
                </div>
                <div class="children-container" id="children-${childAddress}"></div>
            </div>
        `;
        
        container.innerHTML = childHTML;
        
    } catch (error) {
        console.error('Error rendering child node:', error);
    }
}

// تابع به‌روزرسانی خلاصه شبکه
async function updateNetworkSummary() {
    try {
        const { address } = await connectWallet();
        const summaryContainer = document.getElementById('summary-stats');
        
        if (!summaryContainer) return;
        
        // در اینجا می‌توانید آمار کلی شبکه را محاسبه کنید
        // برای مثال: تعداد کل اعضا، اعضای فعال، امتیاز کل و غیره
        
        summaryContainer.innerHTML = `
            <div class="summary-stat">
                <span class="summary-label">سطح فعلی:</span>
                <span class="summary-value">0</span>
            </div>
            <div class="summary-stat">
                <span class="summary-label">اعضای کل:</span>
                <span class="summary-value">0</span>
            </div>
            <div class="summary-stat">
                <span class="summary-label">امتیاز کل:</span>
                <span class="summary-value">0</span>
            </div>
        `;
        
    } catch (error) {
        console.error('Error updating network summary:', error);
    }
}

// تابع کوتاه کردن آدرس
function shortenAddress(address) {
    if (!address) return '---';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// تابع نمایش خطا
function showError(message) {
    const statusElement = document.getElementById('network-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'network-status error';
        
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'network-status';
        }, 5000);
    }
}

// تابع پاک کردن خطا
function clearNetworkError() {
    const statusElement = document.getElementById('network-status');
    if (statusElement) {
        statusElement.textContent = '';
        statusElement.className = 'network-status';
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

// تابع دریافت تعداد تیم
async function getTeamCounts(contract, address) {
    try {
        const userData = await contract.users(address);
        const leftCount = userData.leftChild > 0 ? await contract.countSubtreeUsers(userData.leftChild) : 0;
        const rightCount = userData.rightChild > 0 ? await contract.countSubtreeUsers(userData.rightChild) : 0;
        
        return {
            leftTeam: leftCount.toString(),
            rightTeam: rightCount.toString(),
            totalTeam: (leftCount + rightCount).toString()
        };
    } catch (error) {
        console.error("Error fetching team counts:", error);
        return {
            leftTeam: "0",
            rightTeam: "0",
            totalTeam: "0"
        };
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
            binaryPoints: ethers.formatUnits(binaryPoints, 18),
            binaryPointCap: ethers.formatUnits(binaryPointCap, 18),
            leftPoints: ethers.formatUnits(leftPoints, 18),
            rightPoints: ethers.formatUnits(rightPoints, 18)
        };
    } catch (error) {
        console.error("Error fetching user tree:", error);
        return {
            leftChild: ethers.ZeroAddress,
            rightChild: ethers.ZeroAddress,
            activated: false,
            binaryPoints: "0",
            binaryPointCap: "0",
            leftPoints: "0",
            rightPoints: "0"
        };
    }
}

// تابع ایجاد گره خالی
function createEmptyNode(containerId, level) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="tree-node empty-node level-${level}">
            <div class="node-header">
                <div class="node-info">
                    <span class="node-title">جای خالی</span>
                    <span class="node-status empty">خالی</span>
                </div>
            </div>
        </div>
    `;
}

// Claim Binary Rewards Functions
async function setupClaimButton() {
    const claimBtn = document.getElementById('claimRewardsBtn');
    if (!claimBtn) return;
    
    claimBtn.addEventListener('click', async () => {
        try {
            await claimBinaryRewards();
        } catch (error) {
            console.error('Error claiming rewards:', error);
            showError('خطا در دریافت پاداش: ' + error.message);
        }
    });
    
    // به‌روزرسانی اطلاعات claim
    await updateClaimInfo();
}

// تابع به‌روزرسانی اطلاعات claim
async function updateClaimInfo() {
    try {
        const { contract, address } = await connectWallet();
        
        // بررسی اینکه آیا کاربر ثبت‌نام کرده است
        const userData = await contract.users(address);
        if (userData.index === 0) {
            // کاربر ثبت‌نام نکرده
            updateClaimUI({
                claimablePoints: "0",
                pointValue: "0",
                totalReward: "0",
                canClaim: false
            });
            return;
        }
        
        // دریافت اطلاعات claim
        const [points, pointValue, isClaimable] = await Promise.all([
            contract.points(address),
            contract.getPointValue(),
            contract.isClaimable(address)
        ]);
        
        const claimablePoints = ethers.formatUnits(points, 18);
        const pointValueFormatted = ethers.formatEther(pointValue);
        const totalReward = (parseFloat(claimablePoints) * parseFloat(pointValueFormatted)).toFixed(4);
        
        updateClaimUI({
            claimablePoints,
            pointValue: pointValueFormatted,
            totalReward,
            canClaim: isClaimable && parseFloat(claimablePoints) > 0
        });
        
    } catch (error) {
        console.error('Error updating claim info:', error);
        updateClaimUI({
            claimablePoints: "0",
            pointValue: "0",
            totalReward: "0",
            canClaim: false
        });
    }
}

// تابع به‌روزرسانی UI claim
function updateClaimUI(data) {
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = safeFormat(value);
        }
    };
    
    updateElement('claimable-points', data.claimablePoints);
    updateElement('point-value-display', data.pointValue);
    updateElement('total-claimable-reward', data.totalReward);
    
    const claimBtn = document.getElementById('claimRewardsBtn');
    if (claimBtn) {
        claimBtn.disabled = !data.canClaim;
        claimBtn.textContent = data.canClaim ? 'دریافت پاداش باینری' : 'پاداشی برای دریافت وجود ندارد';
    }
}

// تابع دریافت پاداش باینری
async function claimBinaryRewards() {
    try {
        const { contract, address } = await connectWallet();
        
        // بررسی اینکه آیا کاربر می‌تواند claim کند
        const [points, isClaimable] = await Promise.all([
            contract.points(address),
            contract.isClaimable(address)
        ]);
        
        if (points === 0n) {
            throw new Error('هیچ پاداشی برای دریافت وجود ندارد');
        }
        
        if (!isClaimable) {
            throw new Error('شما در حال حاضر نمی‌توانید پاداش دریافت کنید');
        }
        
        // نمایش وضعیت loading
        const claimBtn = document.getElementById('claimRewardsBtn');
        if (claimBtn) {
            claimBtn.disabled = true;
            claimBtn.textContent = 'در حال پردازش...';
        }
        
        // فراخوانی تابع claim
        const tx = await contract.claim();
        await tx.wait();
        
        showNetworkStatus('پاداش باینری با موفقیت دریافت شد!', 'success');
        
        // به‌روزرسانی اطلاعات
        await updateClaimInfo();
        await updateNetworkStats();
        
    } catch (error) {
        console.error('Error claiming binary rewards:', error);
        showNetworkStatus('خطا در دریافت پاداش: ' + error.message, 'error');
        
        // بازگرداندن دکمه
        const claimBtn = document.getElementById('claimRewardsBtn');
        if (claimBtn) {
            claimBtn.disabled = false;
            claimBtn.textContent = 'دریافت پاداش باینری';
        }
    }
}

// تابع نمایش وضعیت شبکه
function showNetworkStatus(message, type = 'success') {
    const statusElement = document.getElementById('network-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `network-status ${type}`;
        
        // پاک کردن پیام بعد از 5 ثانیه
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'network-status';
        }, 5000);
    }
}

// تابع کمکی برای فرمت امن
function safeFormat(val, suffix = '') {
    if (val === undefined || val === null || val === 'undefined' || val === '' || isNaN(val)) return '-';
    if (typeof val === 'string' && val.trim() === '') return '-';
    return val + suffix;
}

console.log('Network module loaded successfully');