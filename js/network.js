// network.js
let isNetworkLoading = false;

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

        // راه‌اندازی دکمه دریافت پاداش باینری
        setupClaimButton();

        // نمایش ساختار درختی
        await renderNetworkTree();

        // به‌روزرسانی اطلاعات claim
        await updateClaimInfo();

    } catch (error) {
        console.error("Error in network stats:", error);
        showError("خطا در بارگذاری اطلاعات شبکه");
    }
});

// تابع اتصال به کیف پول با انتظار
async function connectWallet() {
    try {
        console.log('Network: Attempting to connect wallet...');
        
        // بررسی اتصال موجود
        if (window.contractConfig && window.contractConfig.contract) {
            console.log('Network: Wallet already connected');
            return window.contractConfig;
        }
        
        // بررسی اتصال MetaMask موجود
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                console.log('Network: MetaMask already connected, initializing Web3...');
                try {
                    await initializeWeb3();
                    return window.contractConfig;
                } catch (error) {
                    console.log('Network: Failed to initialize Web3:', error);
                    throw new Error('خطا در راه‌اندازی Web3');
                }
            }
        }
        
        console.log('Network: No existing connection, user needs to connect manually');
        throw new Error('لطفاً ابتدا کیف پول خود را متصل کنید');
        
    } catch (error) {
        console.error('Network: Error connecting wallet:', error);
        showNetworkStatus('خطا در اتصال به کیف پول', 'error');
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
            return;
        }
        
        // دریافت اطلاعات شبکه
        const userTree = await contract.getUserTree(address);
        const totalUsers = await contract.totalUsers();
        const totalPoints = await contract.totalPoints();
        const totalClaimableBinaryPoints = await contract.totalClaimableBinaryPoints();
        
        // به‌روزرسانی آمار شبکه
        document.getElementById('network-members').textContent = totalUsers.toString();
        document.getElementById('network-points').textContent = userTree.binaryPoints.toString();
        document.getElementById('network-rewards').textContent = userTree.binaryPointCap.toString();

        // به‌روزرسانی لینک دعوت
        const referralLink = `${window.location.origin}${window.location.pathname}?ref=${address}`;
        document.getElementById('referral-link').textContent = referralLink;
        document.getElementById('copyReferral').disabled = false;

        // به‌روزرسانی اطلاعات claim
        await updateClaimInfo();

    } catch (error) {
        console.error('Error updating network stats:', error);
        document.getElementById('network-status').textContent = 'خطا در بارگذاری آمار شبکه';
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

// تابع محاسبه پاداش‌های باینری
function calculateRewards(balancedPoints) {
    try {
        // این تابع محاسبه می‌کند که هر پوینت چقدر ارزش دارد
        // پورسانت هر پوینت = موجودی قرارداد ÷ تعداد کل پوینت‌های دریافتی
        
        // برای نمایش در UI، از مقادیر پیش‌فرض استفاده می‌کنیم
        // در عمل، این مقادیر از قرارداد دریافت می‌شوند
        
        const contractBalance = 1000; // مثال: 1000 MATIC موجودی قرارداد
        const totalPoints = 100; // مثال: 100 پوینت کل
        
        if (totalPoints > 0) {
            const rewardPerPoint = contractBalance / totalPoints;
            const userReward = rewardPerPoint * balancedPoints;
            
            return {
                rewardPerPoint: rewardPerPoint.toFixed(6),
                userReward: userReward.toFixed(6),
                maxReward: (rewardPerPoint * balancedPoints).toFixed(6)
            };
        }
        
        return {
            rewardPerPoint: "0",
            userReward: "0",
            maxReward: "0"
        };
    } catch (error) {
        console.error("Error calculating rewards:", error);
        return {
            rewardPerPoint: "0",
            userReward: "0",
            maxReward: "0"
        };
    }
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
        const { contract, address } = await connectWallet();
        const treeContainer = document.getElementById('network-tree');
        
        if (!treeContainer) return;
        
        // بررسی اینکه آیا کاربر ثبت‌نام کرده است
        try {
            const userData = await contract.users(address);
            const isRegistered = userData.index > 0;
            
            if (!isRegistered) {
                treeContainer.innerHTML = `
                    <h3>ساختار شبکه شما</h3>
                    <div class="network-tree-content">
                        <div class="network-tree-info">
                            <p>شما هنوز در شبکه ثبت‌نام نکرده‌اید.</p>
                            <p>برای مشاهده ساختار شبکه، ابتدا ثبت‌نام کنید.</p>
                        </div>
                    </div>
                `;
                // پاک کردن پیام خطا
                clearNetworkError();
                return;
            }
        } catch (error) {
            console.log("User not registered or error checking registration:", error);
            treeContainer.innerHTML = `
                <h3>ساختار شبکه شما</h3>
                <div class="network-tree-content">
                    <div class="network-tree-error">
                        <p>خطا در بارگذاری درخت شبکه:</p>
                        <p>${error.message}</p>
                    </div>
                </div>
            `;
            // پاک کردن پیام خطا
            clearNetworkError();
            return;
        }
        
        treeContainer.innerHTML = `
            <h3>ساختار شبکه شما</h3>
            <div class="network-tree-content">
                <div class="tree-structure" id="tree-structure">
                    <!-- درخت اصلی اینجا رندر می‌شود -->
                </div>
                
                <!-- آمار کلی شبکه -->
                <div class="network-summary">
                    <h4>آمار کلی شبکه</h4>
                    <div class="summary-stats" id="summary-stats">
                        <!-- آمار اینجا به‌روزرسانی می‌شود -->
                    </div>
                </div>
            </div>
        `;
        
        // رندر کردن درخت اصلی
        await renderTreeNode(address, 'tree-structure', 0);
        
        // به‌روزرسانی آمار کلی
        await updateNetworkSummary();
        
        // پاک کردن پیام خطا در صورت موفقیت
        clearNetworkError();
        
    } catch (error) {
        console.error("Error rendering network tree:", error);
        const treeContainer = document.getElementById('network-tree');
        if (treeContainer) {
            treeContainer.innerHTML = `
                <h3>ساختار شبکه شما</h3>
                <div class="network-tree-content">
                    <div class="network-tree-error">
                        <p>خطا در بارگذاری درخت شبکه:</p>
                        <p>${error.message}</p>
                    </div>
                </div>
            `;
        }
        showError("خطا در بارگذاری درخت شبکه: " + error.message);
    }
}

// تابع نمایش گره درخت شبکه
async function renderTreeNode(userAddress, containerId, level = 0) {
    try {
        const { contract, signer } = await connectWallet();
        const currentUserAddress = await signer.getAddress();
        
        // دریافت اطلاعات کاربر
        const userData = await contract.users(userAddress);
        const isCurrentUser = userAddress.toLowerCase() === currentUserAddress.toLowerCase();
        const isRegistered = userData.index > 0;
        
        if (!isRegistered) {
            return createEmptyNode(containerId, level);
        }
        
        // دریافت اطلاعات درخت کاربر
        const [left, right, activated, binaryPoints, binaryPointCap] = await contract.getUserTree(userAddress);
        
        // محاسبه پاداش‌های باینری
        const contractBalance = await contract.getContractMaticBalance();
        const totalClaimablePoints = await contract.totalClaimableBinaryPoints();
        
        let rewardPerPoint = "0";
        let maxReward = "0";
        
        if (totalClaimablePoints > 0) {
            const rewardPerPointRaw = contractBalance / totalClaimablePoints;
            rewardPerPoint = ethers.formatEther(rewardPerPointRaw);
            
            // حداکثر پاداش کاربر = پورسانت هر پوینت × سقف درآمد کاربر
            const maxRewardRaw = rewardPerPointRaw * binaryPointCap;
            maxReward = ethers.formatEther(maxRewardRaw);
        }
        
        const nodeElement = document.createElement('div');
        nodeElement.className = `tree-node level-${level} ${isCurrentUser ? 'current-user' : ''}`;
        nodeElement.innerHTML = `
            <div class="node-header">
                <div class="node-info">
                    <div class="node-title">${shortenAddress(userAddress)}</div>
                    <div class="node-status ${activated ? 'active' : 'inactive'}">
                        ${activated ? 'فعال' : 'غیرفعال'}
                    </div>
                </div>
                <div class="expand-icon" onclick="toggleNodeExpansion('${userAddress}', ${level})">▶</div>
            </div>
            <div class="node-details">
                <div class="node-stat">
                    <span class="stat-label">پوینت‌های فعلی:</span>
                    <span class="stat-value">${ethers.formatUnits(binaryPoints, 18)}</span>
                </div>
                <div class="node-stat">
                    <span class="stat-label">سقف درآمد:</span>
                    <span class="stat-value">${binaryPointCap.toString()} پوینت</span>
                </div>
                <div class="node-stat">
                    <span class="stat-label">پورسانت هر پوینت:</span>
                    <span class="stat-value">${parseFloat(rewardPerPoint).toFixed(6)} MATIC</span>
                </div>
                <div class="node-stat">
                    <span class="stat-label">حداکثر پاداش:</span>
                    <span class="stat-value">${parseFloat(maxReward).toFixed(6)} MATIC</span>
                </div>
                <div class="node-stat">
                    <span class="stat-label">چپ:</span>
                    <span class="stat-value">${left !== ethers.ZeroAddress ? shortenAddress(left) : 'خالی'}</span>
                </div>
                <div class="node-stat">
                    <span class="stat-label">راست:</span>
                    <span class="stat-value">${right !== ethers.ZeroAddress ? shortenAddress(right) : 'خالی'}</span>
                </div>
            </div>
            <div class="children-container" id="children-${userAddress}" style="display: none;">
                <div class="children-wrapper">
                    <div class="child-node left-child" id="left-${userAddress}"></div>
                    <div class="child-node right-child" id="right-${userAddress}"></div>
                </div>
            </div>
        `;
        
        const container = document.getElementById(containerId);
        if (container) {
            container.appendChild(nodeElement);
        }
        
        return nodeElement;
        
    } catch (error) {
        console.error("Error rendering tree node:", error);
        return createEmptyNode(containerId, level);
    }
}

// تابع گسترش/انقباض نود
async function toggleNodeExpansion(userAddress, level) {
    try {
        const childrenContainer = document.getElementById(`children-${userAddress}`);
        const childrenWrapper = document.getElementById(`children-wrapper-${userAddress}`);
        const expandIcon = document.getElementById(`expand-icon-${userAddress}`);
        
        if (!childrenContainer || !childrenWrapper) return;
        
        const isExpanded = childrenContainer.style.display !== 'none';
        
        if (isExpanded) {
            // انقباض نود
            childrenContainer.style.display = 'none';
            if (expandIcon) expandIcon.textContent = '▼';
        } else {
            // گسترش نود
            childrenContainer.style.display = 'block';
            if (expandIcon) expandIcon.textContent = '▲';
            
            // اگر فرزندان قبلاً لود نشده‌اند، آن‌ها را لود کن
            if (childrenWrapper.children.length === 0) {
                await loadChildren(userAddress, childrenWrapper, level + 1);
            }
        }
        
    } catch (error) {
        console.error(`Error toggling node expansion for ${userAddress}:`, error);
    }
}

// تابع لود کردن فرزندان یک نود
async function loadChildren(parentAddress, container, level) {
    try {
        const treeData = await fetchUserTree();
        
        // بررسی فرزند چپ
        if (treeData.leftChild !== ethers.ZeroAddress) {
            await renderChildNode(treeData.leftChild, container, 'left', level);
        } else {
            // نمایش جای خالی برای فرزند چپ
            container.innerHTML += `
                <div class="tree-node empty-node level-${level}">
                    <div class="node-header">
                        <div class="node-info">
                            <span class="node-title">فرزند چپ</span>
                            <span class="node-status empty">خالی</span>
                        </div>
                    </div>
                    <div class="node-details">
                        <div class="node-stat">
                            <span class="stat-label">وضعیت:</span>
                            <span class="stat-value">در انتظار عضو جدید</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // بررسی فرزند راست
        if (treeData.rightChild !== ethers.ZeroAddress) {
            await renderChildNode(treeData.rightChild, container, 'right', level);
        } else {
            // نمایش جای خالی برای فرزند راست
            container.innerHTML += `
                <div class="tree-node empty-node level-${level}">
                    <div class="node-header">
                        <div class="node-info">
                            <span class="node-title">فرزند راست</span>
                            <span class="node-status empty">خالی</span>
                        </div>
                    </div>
                    <div class="node-details">
                        <div class="node-stat">
                            <span class="stat-label">وضعیت:</span>
                            <span class="stat-value">در انتظار عضو جدید</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error(`Error loading children for ${parentAddress}:`, error);
    }
}

// تابع رندر کردن نود فرزند
async function renderChildNode(childAddress, container, position, level) {
    try {
        const treeData = await fetchUserTree();
        const isCurrentUser = childAddress === (await connectWallet()).address;
        
        const nodeHTML = `
            <div class="tree-node child-node ${position}-child level-${level} ${isCurrentUser ? 'current-user' : ''}" 
                 data-address="${childAddress}" data-level="${level}">
                <div class="node-header" onclick="toggleNodeExpansion('${childAddress}', ${level})">
                    <div class="node-info">
                        <span class="node-title">فرزند ${position === 'left' ? 'چپ' : 'راست'}</span>
                        <span class="node-status ${treeData.activated ? 'active' : 'inactive'}">
                            ${treeData.activated ? 'فعال' : 'غیرفعال'}
                        </span>
                    </div>
                    <div class="expand-icon" id="expand-icon-${childAddress}">
                        ${(treeData.leftChild !== ethers.ZeroAddress || treeData.rightChild !== ethers.ZeroAddress) ? '▼' : ''}
                    </div>
                </div>
                
                <div class="node-details">
                    <div class="node-stat">
                        <span class="stat-label">آدرس:</span>
                        <span class="stat-value">${shortenAddress(childAddress)}</span>
                    </div>
                    <div class="node-stat">
                        <span class="stat-label">امتیاز:</span>
                        <span class="stat-value">${parseFloat(treeData.binaryPoints).toFixed(2)}/${parseFloat(treeData.binaryPointCap).toFixed(2)}</span>
                    </div>
                </div>
                
                <!-- کانتینر برای فرزندان -->
                <div class="children-container" id="children-${childAddress}" style="display: none;">
                    <div class="children-wrapper" id="children-wrapper-${childAddress}">
                        <!-- فرزندان اینجا لود می‌شوند -->
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML += nodeHTML;
        
    } catch (error) {
        console.error(`Error rendering child node for ${childAddress}:`, error);
    }
}

// تابع به‌روزرسانی آمار کلی شبکه
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
                <span class="summary-label">اعضای قابل مشاهده:</span>
                <span class="summary-value">1</span>
            </div>
            <div class="summary-stat">
                <span class="summary-label">امتیاز کل:</span>
                <span class="summary-value">0</span>
            </div>
        `;
        
    } catch (error) {
        console.error("Error updating network summary:", error);
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

// تابع پاک کردن پیام خطا
function clearNetworkError() {
    const statusElement = document.getElementById('network-status');
    if (statusElement) {
        statusElement.textContent = '';
        statusElement.style.color = '';
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

// اضافه کردن توابع به window object برای فراخوانی از HTML
window.toggleNodeExpansion = toggleNodeExpansion;

// تابع ایجاد گره خالی
function createEmptyNode(containerId, level) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const emptyNode = document.createElement('div');
    emptyNode.className = `tree-node empty-node level-${level}`;
    emptyNode.innerHTML = `
        <div class="node-header">
            <div class="node-info">
                <div class="node-title">جای خالی</div>
                <div class="node-status empty">خالی</div>
            </div>
        </div>
        <div class="node-details">
            <div class="node-stat">
                <span class="stat-label">امتیاز:</span>
                <span class="stat-value">0</span>
            </div>
            <div class="node-stat">
                <span class="stat-label">سقف:</span>
                <span class="stat-value">0</span>
            </div>
        </div>
    `;
    
    container.appendChild(emptyNode);
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
        const pointValueFormatted = ethers.formatUnits(pointValue, 18);
        const totalReward = parseFloat(claimablePoints) * parseFloat(pointValueFormatted);
        
        updateClaimUI({
            claimablePoints,
            pointValue: pointValueFormatted,
            totalReward: totalReward.toFixed(6),
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

function updateClaimUI(data) {
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    };
    
    updateElement('claimable-points', data.claimablePoints);
    updateElement('point-value-display', data.pointValue + ' LVL');
    updateElement('total-claimable-reward', data.totalReward + ' LVL');
    
    const claimBtn = document.getElementById('claimRewardsBtn');
    if (claimBtn) {
        claimBtn.disabled = !data.canClaim;
        if (data.canClaim) {
            claimBtn.textContent = 'دریافت پاداش باینری';
            claimBtn.style.background = 'linear-gradient(135deg, #00ff88, #00ccff)';
            claimBtn.style.color = '#000000';
        } else {
            claimBtn.textContent = 'پاداش قابل دریافت نیست';
            claimBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            claimBtn.style.color = '#666666';
        }
    }
}

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
            claimBtn.textContent = 'در حال دریافت...';
        }
        
        showNetworkStatus('در حال دریافت پاداش...', 'loading');
        
        // فراخوانی تابع claim
        const tx = await contract.claim();
        
        showNetworkStatus('تراکنش ارسال شد. منتظر تایید...', 'loading');
        
        // انتظار برای تایید تراکنش
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            showNetworkStatus('پاداش با موفقیت دریافت شد!', 'success');
            
            // به‌روزرسانی اطلاعات claim
            await updateClaimInfo();
            
            // به‌روزرسانی آمار شبکه
            await updateNetworkStats();
            
        } else {
            throw new Error('تراکنش ناموفق بود');
        }
        
    } catch (error) {
        console.error('Error claiming rewards:', error);
        showNetworkStatus('خطا در دریافت پاداش: ' + error.message, 'error');
        
        // بازگرداندن دکمه به حالت عادی
        const claimBtn = document.getElementById('claimRewardsBtn');
        if (claimBtn) {
            claimBtn.disabled = false;
            claimBtn.textContent = 'دریافت پاداش باینری';
        }
    }
}

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