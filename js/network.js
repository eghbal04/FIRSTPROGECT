// Network Module - مدیریت شبکه و درخت باینری
let isNetworkLoading = false;

// تابع راه‌اندازی تب شبکه
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
            showNetworkError("لطفا ابتدا کیف پول خود را متصل کنید");
            return;
        }

        // بارگذاری اطلاعات شبکه
        await loadNetworkData();

        console.log('Network: Network tab initialized successfully');

    } catch (error) {
        console.error("Error initializing network tab:", error);
        showNetworkError("خطا در بارگذاری اطلاعات شبکه");
    }
};

// تابع بررسی اتصال
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

// تابع بارگذاری اطلاعات شبکه
async function loadNetworkData() {
    if (isNetworkLoading) return;
    
    isNetworkLoading = true;
    
    try {
        const { contract, address } = await window.connectWallet();
        
        // بررسی ثبت‌نام کاربر
        const userData = await contract.users(address);
        if (userData.index === 0) {
            showUnregisteredUser();
            return;
        }
        
        // بارگذاری آمار شبکه
        await loadNetworkStats(contract);
        
        // بارگذاری آمار باینری
        await loadBinaryStats(contract, address);
        
        // بارگذاری درخت شبکه
        await loadNetworkTree(contract, address);
        
        // راه‌اندازی دکمه‌ها
        setupNetworkButtons(contract, address);
        
        showNetworkSuccess('اطلاعات شبکه بارگذاری شد');
        
    } catch (error) {
        console.error('Error loading network data:', error);
        showNetworkError('خطا در بارگذاری اطلاعات شبکه');
    } finally {
        isNetworkLoading = false;
    }
}

// تابع نمایش کاربر ثبت‌نام نشده
function showUnregisteredUser() {
    const elements = [
        'network-members', 'network-points', 'network-rewards',
        'referral-link', 'claimable-points', 'point-value-display',
        'total-claimable-reward', 'network-tree'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = 'کاربر ثبت‌نام نکرده';
        }
    });
    
    // غیرفعال کردن دکمه‌ها
    const copyBtn = document.getElementById('copyReferral');
    const claimBtn = document.getElementById('claimRewardsBtn');
    if (copyBtn) copyBtn.disabled = true;
    if (claimBtn) claimBtn.disabled = true;
    
    // نمایش پیام در درخت
    const treeContainer = document.getElementById('network-tree');
    if (treeContainer) {
        treeContainer.innerHTML = '<p class="network-tree-empty">کاربر ثبت‌نام نکرده</p>';
    }
}

// تابع بارگذاری آمار شبکه
async function loadNetworkStats(contract) {
    try {
        const [totalUsers, totalPoints, totalClaimableBinaryPoints] = await Promise.all([
            contract.totalUsers(),
            contract.totalPoints(),
            contract.totalClaimableBinaryPoints()
        ]);
        
        updateElement('network-members', totalUsers.toString());
        updateElement('network-points', ethers.formatUnits(totalPoints, 18));
        updateElement('network-rewards', ethers.formatUnits(totalClaimableBinaryPoints, 18));
        
    } catch (error) {
        console.error('Error loading network stats:', error);
    }
}

// تابع بارگذاری آمار باینری
async function loadBinaryStats(contract, address) {
    try {
        const userData = await contract.users(address);
        
        updateElement('left-points', ethers.formatUnits(userData.binaryPoints, 18));
        updateElement('right-points', ethers.formatUnits(userData.binaryPoints, 18));
        updateElement('total-binary-points', ethers.formatUnits(userData.binaryPoints, 18));
        updateElement('points-cap', parseInt(ethers.formatUnits(userData.binaryPointCap, 18)));
        
        // محاسبه امتیاز متعادل
        const balancedPoints = Math.min(
            parseFloat(ethers.formatUnits(userData.binaryPoints, 18)),
            parseFloat(ethers.formatUnits(userData.binaryPoints, 18))
        );
        updateElement('balanced-points', balancedPoints.toFixed(2));
        
        // محاسبه پاداش
        const rewardRate = 0.1; // 10%
        const rewards = (balancedPoints * rewardRate).toFixed(2);
        updateElement('binary-rewards', rewards);
        
    } catch (error) {
        console.error('Error loading binary stats:', error);
    }
}

// تابع بارگذاری درخت شبکه
async function loadNetworkTree(contract, address) {
    try {
        const treeContainer = document.getElementById('network-tree');
        if (!treeContainer) return;
        
        // رندر گره اصلی
        await renderTreeNode(contract, address, treeContainer, 0);
        
    } catch (error) {
        console.error('Error loading network tree:', error);
        showNetworkError('خطا در بارگذاری درخت شبکه');
    }
}

// تابع رندر گره درخت
async function renderTreeNode(contract, userAddress, container, level) {
    try {
        const userData = await contract.users(userAddress);
        const currentAddress = await window.contractConfig.signer.getAddress();
        const isCurrentUser = userAddress.toLowerCase() === currentAddress.toLowerCase();
        
        if (userData.index === 0) {
            container.innerHTML = createEmptyNodeHTML(level);
            return;
        }
        
        const nodeHTML = createNodeHTML(userData, userAddress, isCurrentUser, level);
        container.innerHTML = nodeHTML;
        
        // رندر فرزندان - بررسی معتبر بودن آدرس‌ها
        if (userData.leftChild && userData.leftChild !== ethers.ZeroAddress && userData.leftChild !== '0x0000000000000000000000000000000000000000') {
            const leftContainer = container.querySelector('.left-child');
            if (leftContainer) {
                await renderChildNode(contract, userData.leftChild, leftContainer, 'left', level + 1);
            }
        }
        
        if (userData.rightChild && userData.rightChild !== ethers.ZeroAddress && userData.rightChild !== '0x0000000000000000000000000000000000000000') {
            const rightContainer = container.querySelector('.right-child');
            if (rightContainer) {
                await renderChildNode(contract, userData.rightChild, rightContainer, 'right', level + 1);
            }
        }
        
    } catch (error) {
        console.error('Error rendering tree node:', error);
    }
}

// تابع رندر گره فرزند
async function renderChildNode(contract, childAddress, container, position, level) {
    try {
        // بررسی معتبر بودن آدرس
        if (!childAddress || childAddress === ethers.ZeroAddress || childAddress === '0x0000000000000000000000000000000000000000') {
            console.log('Invalid child address:', childAddress);
            return;
        }
        
        const userData = await contract.users(childAddress);
        const currentAddress = await window.contractConfig.signer.getAddress();
        const isCurrentUser = childAddress.toLowerCase() === currentAddress.toLowerCase();
        
        const childHTML = createChildNodeHTML(userData, childAddress, position, level, isCurrentUser);
        container.innerHTML = childHTML;
        
    } catch (error) {
        console.error('Error rendering child node:', error);
    }
}

// تابع ایجاد HTML گره
function createNodeHTML(userData, userAddress, isCurrentUser, level) {
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
                <span class="stat-value">${ethers.formatUnits(userData.binaryPoints, 18)}</span>
            </div>
            <div class="node-stat">
                <span class="stat-label">سقف امتیاز:</span>
                <span class="stat-value">${parseInt(ethers.formatUnits(userData.binaryPointCap, 18))}</span>
            </div>
        </div>
    `;
    
    const childrenContainer = `
        <div class="children-container" id="children-${userAddress}">
            <div class="children-wrapper">
                ${userData.leftChild && userData.leftChild !== ethers.ZeroAddress && userData.leftChild !== '0x0000000000000000000000000000000000000000' ? `<div class="tree-node child-node left-child level-${level + 1}" data-address="${userData.leftChild}"></div>` : ''}
                ${userData.rightChild && userData.rightChild !== ethers.ZeroAddress && userData.rightChild !== '0x0000000000000000000000000000000000000000' ? `<div class="tree-node child-node right-child level-${level + 1}" data-address="${userData.rightChild}"></div>` : ''}
            </div>
        </div>
    `;
    
    return `
        <div class="tree-node ${isCurrentUser ? 'current-user' : ''} level-${level}">
            ${nodeHeader}
            ${nodeDetails}
            ${childrenContainer}
        </div>
    `;
}

// تابع ایجاد HTML گره فرزند
function createChildNodeHTML(userData, childAddress, position, level, isCurrentUser) {
    return `
        <div class="tree-node child-node ${position}-child level-${level}" data-address="${childAddress}" data-level="${level}">
            <div class="node-header">
                <div class="node-info">
                    <span class="node-title">${shortenAddress(childAddress)}</span>
                    <span class="node-status ${userData.activated ? 'active' : 'inactive'}">
                        ${userData.activated ? 'فعال' : 'غیرفعال'}
                    </span>
                </div>
                <span class="expand-icon" onclick="toggleNodeExpansion('${childAddress}', ${level})">▼</span>
            </div>
            <div class="node-details">
                <div class="node-stat">
                    <span class="stat-label">امتیاز:</span>
                    <span class="stat-value">${ethers.formatUnits(userData.binaryPoints, 18)}</span>
                </div>
                <div class="node-stat">
                    <span class="stat-label">سقف:</span>
                    <span class="stat-value">${parseInt(ethers.formatUnits(userData.binaryPointCap, 18))}</span>
                </div>
            </div>
            <div class="children-container" id="children-${childAddress}"></div>
        </div>
    `;
}

// تابع ایجاد HTML گره خالی
function createEmptyNodeHTML(level) {
    return `
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

// تابع راه‌اندازی دکمه‌های شبکه
function setupNetworkButtons(contract, address) {
    // دکمه کپی لینک دعوت
    setupReferralCopy(address);
    
    // دکمه دریافت پاداش
    setupClaimButton(contract, address);
}

// تابع راه‌اندازی دکمه کپی لینک دعوت
function setupReferralCopy(address) {
    const copyBtn = document.getElementById('copyReferral');
    if (!copyBtn) return;
    
    // به‌روزرسانی لینک دعوت
    const referralLink = `${window.location.origin}/?ref=${address}`;
    const linkElement = document.getElementById('referral-link');
    if (linkElement) {
        linkElement.textContent = window.location.origin + '/?ref=' + shortenAddress(address);
    }
    
    copyBtn.disabled = false;
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            copyBtn.textContent = 'کپی شد!';
            setTimeout(() => copyBtn.textContent = 'کپی', 1500);
        } catch (error) {
            console.error("Error copying referral link:", error);
        }
    });
}

// تابع راه‌اندازی دکمه دریافت پاداش
function setupClaimButton(contract, address) {
    const claimBtn = document.getElementById('claimRewardsBtn');
    if (!claimBtn) return;
    
    claimBtn.addEventListener('click', async () => {
        try {
            await claimBinaryRewards(contract, address);
        } catch (error) {
            console.error('Error claiming rewards:', error);
            showNetworkError('خطا در دریافت پاداش: ' + error.message);
        }
    });
    
    // به‌روزرسانی اطلاعات claim
    updateClaimInfo(contract, address);
}

// تابع به‌روزرسانی اطلاعات claim
async function updateClaimInfo(contract, address) {
    try {
        const [points, pointValue, isClaimable] = await Promise.all([
            contract.points(address),
            contract.getPointValue(),
            contract.isClaimable(address)
        ]);
        
        const claimablePoints = ethers.formatUnits(points, 18);
        const pointValueFormatted = ethers.formatEther(pointValue);
        const totalReward = (parseFloat(claimablePoints) * parseFloat(pointValueFormatted)).toFixed(4);
        
        updateElement('claimable-points', claimablePoints);
        updateElement('point-value-display', pointValueFormatted);
        updateElement('total-claimable-reward', totalReward);
        
        const claimBtn = document.getElementById('claimRewardsBtn');
        if (claimBtn) {
            const canClaim = isClaimable && parseFloat(claimablePoints) > 0;
            claimBtn.disabled = !canClaim;
            claimBtn.textContent = canClaim ? 'دریافت پاداش باینری' : 'پاداشی برای دریافت وجود ندارد';
        }
        
    } catch (error) {
        console.error('Error updating claim info:', error);
        updateElement('claimable-points', '0');
        updateElement('point-value-display', '0');
        updateElement('total-claimable-reward', '0');
    }
}

// تابع دریافت پاداش باینری
async function claimBinaryRewards(contract, address) {
    try {
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
        
        showNetworkSuccess('پاداش باینری با موفقیت دریافت شد!');
        
        // به‌روزرسانی اطلاعات
        await loadNetworkData();
        
    } catch (error) {
        console.error('Error claiming binary rewards:', error);
        throw error;
    } finally {
        // بازگرداندن دکمه
        const claimBtn = document.getElementById('claimRewardsBtn');
        if (claimBtn) {
            claimBtn.disabled = false;
            claimBtn.textContent = 'دریافت پاداش باینری';
        }
    }
}

// تابع تغییر وضعیت گسترش گره
window.toggleNodeExpansion = async function(userAddress, level) {
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
};

// تابع به‌روزرسانی عنصر
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = safeFormat(value);
    }
}

// تابع کوتاه کردن آدرس
function shortenAddress(address) {
    if (!address) return '---';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// تابع فرمت امن
function safeFormat(val, suffix = '') {
    if (val === undefined || val === null || val === 'undefined' || val === '' || isNaN(val)) return '-';
    if (typeof val === 'string' && val.trim() === '') return '-';
    return val + suffix;
}

// تابع نمایش خطای شبکه
function showNetworkError(message) {
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

// تابع نمایش موفقیت شبکه
function showNetworkSuccess(message) {
    const statusElement = document.getElementById('network-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'network-status success';
        
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'network-status';
        }, 5000);
    }
}

// راه‌اندازی اولیه
document.addEventListener('DOMContentLoaded', () => {
    console.log('Network module loaded successfully');
});

console.log('Network module loaded successfully');