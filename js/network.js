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

        // نمایش ساختار درختی
        await renderNetworkTree();

    } catch (error) {
        console.error("Error in network stats:", error);
        showError("خطا در بارگذاری اطلاعات شبکه");
    }
});

// تابع اتصال به کیف پول با انتظار
async function connectWallet() {
    if (!window.contractConfig) {
        throw new Error("Contract config not initialized");
    }
    
    // بررسی اینکه آیا قبلاً متصل هستیم
    if (window.contractConfig.signer && window.contractConfig.contract) {
        try {
            const address = await window.contractConfig.signer.getAddress();
            if (address) {
                return {
                    provider: window.contractConfig.provider,
                    contract: window.contractConfig.contract,
                    signer: window.contractConfig.signer,
                    address: address
                };
            }
        } catch (error) {
            console.log("Existing connection invalid, reconnecting...");
        }
    }
    
    // اگر در حال اتصال هستیم، منتظر بمان
    if (window.contractConfig.isConnecting) {
        console.log("Wallet connection in progress, waiting...");
        let waitCount = 0;
        const maxWaitTime = 50; // حداکثر 5 ثانیه
        
        while (window.contractConfig.isConnecting && waitCount < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, 100));
            waitCount++;
            
            // اگر اتصال موفق شد، از حلقه خارج شو
            if (window.contractConfig.signer && window.contractConfig.contract) {
                try {
                    const address = await window.contractConfig.signer.getAddress();
                    if (address) {
                        console.log("Connection completed while waiting");
                        return {
                            provider: window.contractConfig.provider,
                            contract: window.contractConfig.contract,
                            signer: window.contractConfig.signer,
                            address: address
                        };
                    }
                } catch (error) {
                    // ادامه انتظار
                }
            }
        }
        
        // اگر زمان انتظار تمام شد، isConnecting را ریست کن
        if (window.contractConfig.isConnecting) {
            console.log("Connection timeout, resetting isConnecting flag");
            window.contractConfig.isConnecting = false;
        }
    }
    
    // تلاش برای اتصال
    const success = await window.contractConfig.initializeWeb3();
    if (!success) {
        throw new Error("Failed to connect to wallet");
    }
    
    return {
        provider: window.contractConfig.provider,
        contract: window.contractConfig.contract,
        signer: window.contractConfig.signer,
        address: await window.contractConfig.signer.getAddress()
    };
}

// تابع به‌روزرسانی آمار شبکه
async function updateNetworkStats() {
    if (isNetworkLoading) {
        console.log("Network stats already loading, skipping...");
        return;
    }
    
    isNetworkLoading = true;
    
    try {
        console.log("Connecting to wallet for network stats...");
        const { contract } = await connectWallet();
        console.log("Wallet connected, fetching network stats...");
        
        // دریافت آمار شبکه
        const [totalUsers, totalClaimableBinaryPoints, totalPoints] = await Promise.all([
            contract.totalUsers(),
            contract.totalClaimableBinaryPoints(),
            contract.totalPoints()
        ]);
        
        // به‌روزرسانی UI
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value.toString();
            }
        };
        
        updateElement('network-members', totalUsers.toString());
        updateElement('network-points', ethers.formatUnits(totalPoints, 18));
        updateElement('network-rewards', ethers.formatUnits(totalClaimableBinaryPoints, 18));
        
        console.log("Network stats updated successfully");
        
        // پاک کردن پیام خطا در صورت موفقیت
        clearNetworkError();
        
    } catch (error) {
        console.error("Error updating network stats:", error);
        showError("خطا در بارگذاری آمار شبکه: " + error.message);
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
                        <div style="text-align: center; padding: 2rem; color: #00ccff;">
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
                    <div style="text-align: center; padding: 2rem; color: #00ccff;">
                        <p>شما هنوز در شبکه ثبت‌نام نکرده‌اید.</p>
                        <p>برای مشاهده ساختار شبکه، ابتدا ثبت‌نام کنید.</p>
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
                    <div style="text-align: center; padding: 2rem; color: #ff6b6b;">
                        <p>خطا در بارگذاری درخت شبکه:</p>
                        <p>${error.message}</p>
                    </div>
                </div>
            `;
        }
        showError("خطا در بارگذاری درخت شبکه: " + error.message);
    }
}

// تابع رندر کردن یک نود درخت
async function renderTreeNode(userAddress, containerId, level = 0) {
    try {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const treeData = await getUserTree(userAddress);
        const isCurrentUser = userAddress === (await connectWallet()).address;
        
        // ایجاد کلاس‌های CSS بر اساس سطح
        const levelClass = `level-${level}`;
        const userClass = isCurrentUser ? 'current-user' : 'other-user';
        
        const nodeHTML = `
            <div class="tree-node ${levelClass} ${userClass}" data-address="${userAddress}" data-level="${level}">
                <div class="node-header" onclick="toggleNodeExpansion('${userAddress}', ${level})">
                    <div class="node-info">
                        <span class="node-title">${isCurrentUser ? 'شما' : `کاربر ${level + 1}`}</span>
                        <span class="node-status ${treeData.activated ? 'active' : 'inactive'}">
                            ${treeData.activated ? 'فعال' : 'غیرفعال'}
                        </span>
                    </div>
                    <div class="expand-icon" id="expand-icon-${userAddress}">
                        ${(treeData.left !== ethers.ZeroAddress || treeData.right !== ethers.ZeroAddress) ? '▼' : ''}
                    </div>
                </div>
                
                <div class="node-details">
                    <div class="node-stat">
                        <span class="stat-label">آدرس:</span>
                        <span class="stat-value">${shortenAddress(userAddress)}</span>
                    </div>
                    <div class="node-stat">
                        <span class="stat-label">امتیاز:</span>
                        <span class="stat-value">${parseFloat(treeData.binaryPoints).toFixed(2)}/${parseFloat(treeData.binaryPointCap).toFixed(2)}</span>
                    </div>
                </div>
                
                <!-- کانتینر برای فرزندان (در ابتدا مخفی) -->
                <div class="children-container" id="children-${userAddress}" style="display: none;">
                    <div class="children-wrapper" id="children-wrapper-${userAddress}">
                        <!-- فرزندان اینجا لود می‌شوند -->
                    </div>
                </div>
            </div>
        `;
        
        // اضافه کردن نود به کانتینر
        if (level === 0) {
            container.innerHTML = nodeHTML;
        } else {
            container.innerHTML += nodeHTML;
        }
        
    } catch (error) {
        console.error(`Error rendering tree node for ${userAddress}:`, error);
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
        const treeData = await getUserTree(parentAddress);
        
        // بررسی فرزند چپ
        if (treeData.left !== ethers.ZeroAddress) {
            await renderChildNode(treeData.left, container, 'left', level);
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
        if (treeData.right !== ethers.ZeroAddress) {
            await renderChildNode(treeData.right, container, 'right', level);
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
        const treeData = await getUserTree(childAddress);
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
                        ${(treeData.left !== ethers.ZeroAddress || treeData.right !== ethers.ZeroAddress) ? '▼' : ''}
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