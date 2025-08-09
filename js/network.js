// نمایش درخت باینری با lazy load: هر گره با کلیک expand می‌شود و فقط فرزندان همان گره نمایش داده می‌شوند
window.NETWORK_RENDER_VERSION = 'v-layout-rows-rtl-1';

// متغیرهای سراسری برای مدیریت رندر درخت
let lastRenderedIndex = null;
let isRenderingTree = false;
let lastRenderedTime = 0;

// متغیرهای پروگرس بار شبکه
let totalNodesToLoad = 0;
let nodesLoaded = 0;

// توابع مدیریت پروگرس بار شبکه
function showNetworkProgress() {
    const progressBar = document.getElementById('network-progress');
    if (progressBar) {
        progressBar.style.display = 'block';
        setNetworkProgress(0);
    }
}

function setNetworkProgress(percentage) {
    const progressInner = document.getElementById('network-progress-inner');
    if (progressInner) {
        progressInner.style.width = Math.min(100, Math.max(0, percentage)) + '%';
    }
}

function hideNetworkProgress() {
    const progressBar = document.getElementById('network-progress');
    if (progressBar) {
        setTimeout(() => {
            progressBar.style.display = 'none';
            setNetworkProgress(0);
        }, 500);
    }
}

function updateNodeProgress() {
    nodesLoaded++;
    if (totalNodesToLoad > 0) {
        const percentage = (nodesLoaded / totalNodesToLoad) * 100;
        setNetworkProgress(percentage);
        console.log(`📊 Network progress: ${nodesLoaded}/${totalNodesToLoad} nodes loaded (${percentage.toFixed(1)}%)`);
    }
}

// تابع fallback برای generateCPAId اگر موجود نباشد
if (!window.generateCPAId) {
    window.generateCPAId = function(index) {
        if (!index || index === 0) return '0';
        return index.toString();
    };
}

// تابع محاسبه رنگ بر اساس سطح درخت
function getNodeColorByLevel(level, isActive = true) {
    if (isActive) {
        // برای گره‌های فعال: از روشن به تیره
        const baseAlpha = 0.98;
        const alphaStep = 0.15;
        const alpha = Math.max(0.3, baseAlpha - (level * alphaStep));
        
        // رنگ اصلی: آبی-سبز روشن برای ریشه، تیره‌تر برای سطوح پایین‌تر
        const baseR = 35;
        const baseG = 41;
        const baseB = 70;
        const darkenStep = 15;
        
        const r = Math.max(20, baseR - (level * darkenStep));
        const g = Math.max(25, baseG - (level * darkenStep));
        const b = Math.max(45, baseB - (level * darkenStep));
        
        return `rgba(${r},${g},${b},${alpha})`;
    } else {
        // برای گره‌های خالی: از روشن به تیره
        const baseAlpha = 0.04;
        const alphaStep = 0.02;
        const alpha = Math.max(0.01, baseAlpha - (level * alphaStep));
        
        return `rgba(255,255,255,${alpha})`;
    }
}

function shortAddress(addr) {
    if (!addr || addr === '-') return '-';
    return addr.slice(0, 4) + '...' + addr.slice(-3);
}

// Alias عمومی برای استفاده از سایر فایل‌ها
window.networkShowUserPopup = async function(address, user) {
    console.log('🚀 showUserPopup called with:', { address, user });
    
    // تابع کوتاه‌کننده آدرس
    function shortAddress(addr) {
        if (!addr || addr === '-') return '-';
        return addr.slice(0, 4) + '...' + addr.slice(-3);
    }
    
    // حذف popup قبلی اگر وجود دارد
    let existingPopup = document.getElementById('user-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // اطلاعات مورد نیاز
    const cpaId = user && user.index !== undefined && user.index !== null ? 
        (window.generateCPAId ? window.generateCPAId(user.index) : user.index) : '-';
    const walletAddress = address || '-';
    const isActive = user && user.activated ? true : false;
    
    // تابع محاسبه تعداد ولت‌های سمت راست و چپ (فعال‌ها در زیرشاخه)
    async function calculateWalletCounts(userIndex, contract) {
        try {
            let leftCount = 0;
            let rightCount = 0;
            const leftChildIndex = BigInt(userIndex) * 2n;
            const rightChildIndex = BigInt(userIndex) * 2n + 1n;
            // چپ
            try {
                const leftAddress = await contract.indexToAddress(leftChildIndex);
                if (leftAddress && leftAddress !== '0x0000000000000000000000000000000000000000') {
                    const leftUser = await contract.users(leftAddress);
                    if (leftUser && leftUser.activated) {
                        leftCount = 1 + await calculateSubtreeCount(leftChildIndex, contract, 'left');
                    }
                }
            } catch {}
            // راست
            try {
                const rightAddress = await contract.indexToAddress(rightChildIndex);
                if (rightAddress && rightAddress !== '0x0000000000000000000000000000000000000000') {
                    const rightUser = await contract.users(rightAddress);
                    if (rightUser && rightUser.activated) {
                        rightCount = 1 + await calculateSubtreeCount(rightChildIndex, contract, 'right');
                    }
                }
            } catch {}
            return { leftCount, rightCount };
        } catch (error) {
            return { leftCount: 0, rightCount: 0 };
        }
    }

    // تابع محاسبه بازگشتی تعداد ولت‌ها در زیرمجموعه
    async function calculateSubtreeCount(parentIndex, contract, side) {
        let count = 0;
        async function countRecursive(index) {
            const leftChildIndex = BigInt(index) * 2n;
            const rightChildIndex = BigInt(index) * 2n + 1n;
            let subtreeCount = 0;
            // بررسی فرزند چپ
            try {
                const leftAddress = await contract.indexToAddress(leftChildIndex);
                if (leftAddress && leftAddress !== '0x0000000000000000000000000000000000000000') {
                    const leftUser = await contract.users(leftAddress);
                    if (leftUser && leftUser.activated) {
                        subtreeCount += 1;
                        subtreeCount += await countRecursive(leftChildIndex);
                    }
                }
            } catch (e) {
                // نادیده گرفتن خطاها
            }
            // بررسی فرزند راست
            try {
                const rightAddress = await contract.indexToAddress(rightChildIndex);
                if (rightAddress && rightAddress !== '0x0000000000000000000000000000000000000000') {
                    const rightUser = await contract.users(rightAddress);
                    if (rightUser && rightUser.activated) {
                        subtreeCount += 1;
                        subtreeCount += await countRecursive(rightChildIndex);
                    }
                }
            } catch (e) {
                // نادیده گرفتن خطاها
            }
            return subtreeCount;
        }
        return await countRecursive(parentIndex);
    }

    // محاسبه تعداد ولت‌ها
    let walletCounts = { leftCount: '⏳', rightCount: '⏳' };
    if (window.contractConfig && window.contractConfig.contract && user.index) {
        try {
            walletCounts = await calculateWalletCounts(user.index, window.contractConfig.contract);
        } catch (error) {
            walletCounts = { leftCount: 'خطا', rightCount: 'خطا' };
        }
    } else {
        walletCounts = { leftCount: 'نامشخص', rightCount: 'نامشخص' };
    }

    // لیست struct
    const infoList = [
      {icon:'🎯', label:'امتیاز باینری', val:user.binaryPoints},
      {icon:'🏆', label:'سقف باینری', val:user.binaryPointCap},
      {icon:'💎', label:'پاداش کل باینری', val:user.totalMonthlyRewarded},
      {icon:'✅', label:'امتیاز دریافت‌شده', val:user.binaryPointsClaimed},
      {icon:'🤝', label:'درآمد رفرال', val:user.refclimed ? Math.floor(Number(user.refclimed) / 1e18) : 0},
      {icon:'💰', label:'سپرده کل', val:user.depositedAmount ? Math.floor(Number(user.depositedAmount) / 1e18) : 0},
      {icon:'⬅️', label:'امتیاز چپ', val:user.leftPoints},
      {icon:'➡️', label:'امتیاز راست', val:user.rightPoints},
      {icon:'👥⬅️', label:'تعداد ولت چپ', val: (walletCounts && walletCounts.leftCount !== undefined) ? walletCounts.leftCount : '-'},
      {icon:'👥➡️', label:'تعداد ولت راست', val: (walletCounts && walletCounts.rightCount !== undefined) ? walletCounts.rightCount : '-'}
    ];

    const popupEl = document.createElement('div');
    popupEl.id = 'user-popup';
    popupEl.style = `
      position: fixed;z-index: 9999;top: 64px;left: 0;right: 0;width: 100vw;min-width: 100vw;max-width: 100vw;background: rgba(24,28,42,0.97);display: flex;align-items: flex-start;justify-content: center;padding: 0.5rem 0.5vw 0.5rem 0.5vw;box-sizing: border-box;font-family: 'Montserrat', 'Noto Sans Arabic', monospace;font-size: 0.93rem;`;
    
    // نمایش loading برای موجودی‌ها
    const balanceSpinner = '<div style="display:inline-block;width:12px;height:12px;border:2px solid #00ff88;border-radius:50%;border-top-color:transparent;animation:spin 1s linear infinite;margin-right:5px;"></div>';
    
    popupEl.innerHTML = `
      <div class="user-info-card">
        <button class="close-btn" id="close-user-popup">×</button>
        <div class="user-info-btn-row">
            <button class="user-info-btn cpa-id-btn" title="کپی CPA ID" id="copy-cpa-id">🆔 <span>${cpaId}</span></button>
          <button class="user-info-btn wallet-address-btn" title="کپی آدرس ولت" id="copy-wallet-address">🔗 <span>${walletAddress ? shortAddress(walletAddress) : '-'}</span></button>
          <button class="user-info-btn status-btn">${isActive ? '✅ فعال' : '❌ غیرفعال'}</button>
        </div>
        <ul class="user-info-list">
          ${infoList.map(i=>`<li><span>${i.icon}</span> <b>${i.label}:</b> ${i.val !== undefined && i.val !== null && i.val !== '' ? i.val : '-'}</li>`).join('')}
        </ul>
        
        <div class="token-balances-container">
          <h3 class="balance-title">موجودی‌های زنده</h3>
          <div class="balance-grid">
            <div class="balance-item" id="cpa-balance" title="برای کپی کلیک کنید">
              <div class="balance-icon">🟢</div>
              <div class="balance-info">
                <span class="balance-label">CPA</span>
                <span class="balance-value copy-value" data-token="CPA">⏳</span>
              </div>
            </div>
            <div class="balance-item" id="matic-balance" title="برای کپی کلیک کنید">
              <div class="balance-icon">🟣</div>
              <div class="balance-info">
                <span class="balance-label">MATIC</span>
                <span class="balance-value copy-value" data-token="MATIC">⏳</span>
              </div>
            </div>
            <div class="balance-item" id="dai-balance" title="برای کپی کلیک کنید">
              <div class="balance-icon">💵</div>
              <div class="balance-info">
                <span class="balance-label">DAI</span>
                <span class="balance-value copy-value" data-token="DAI">⏳</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="wallet-info">
          <div class="wallet-label">آدرس کیف پول:</div>
          <div class="wallet-address copy-value" data-address="${walletAddress}" title="برای کپی کلیک کنید">
            ${shortAddress(walletAddress)}
          </div>
        </div>
        
        <div id="copy-msg" style="display:none;text-align:center;color:#00ff88;font-size:1em;margin-top:0.7em;">کپی شد!</div>
      </div>
    `;
    document.body.appendChild(popupEl);
    document.getElementById('close-user-popup').onclick = () => popupEl.remove();
    
    // قابلیت کپی
    function showCopyMsg() {
      const msg = document.getElementById('copy-msg');
      if (!msg) return;
      msg.style.display = 'block';
      setTimeout(()=>{msg.style.display='none';}, 1200);
    }
    
    document.getElementById('copy-cpa-id').onclick = function() {
      navigator.clipboard.writeText(cpaId+'');
      showCopyMsg();
    };
    
    document.getElementById('copy-wallet-address').onclick = function() {
      navigator.clipboard.writeText(walletAddress+'');
      showCopyMsg();
    };

    // نمایش پیام کپی
    function showCopyTooltip(element, message = 'کپی شد!') {
        const tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = message;
        
        // موقعیت tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.top - 30}px`;
        tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
        
        document.body.appendChild(tooltip);
        
        // حذف tooltip بعد از 1.5 ثانیه
        setTimeout(() => {
            tooltip.classList.add('fade-out');
            setTimeout(() => tooltip.remove(), 300);
        }, 1500);
    }

    // اضافه کردن قابلیت کپی به همه المان‌های کپی
    document.querySelectorAll('.copy-value').forEach(element => {
        element.addEventListener('click', async function() {
            try {
                let textToCopy;
                
                if (this.dataset.token) {
                    // کپی موجودی توکن
                    const value = this.textContent.trim();
                    textToCopy = `${value} ${this.dataset.token}`;
                } else if (this.dataset.address) {
                    // کپی آدرس کیف پول
                    textToCopy = this.dataset.address;
                }
                
                if (textToCopy && textToCopy !== '-' && textToCopy !== '❌' && textToCopy !== '⏳') {
                    await navigator.clipboard.writeText(textToCopy);
                    showCopyTooltip(this);
                }
            } catch (error) {
                console.warn('Error copying to clipboard:', error);
            }
        });
    });

    // دریافت موجودی‌های زنده
    if (walletAddress !== '-') {
        (async () => {
            try {
                const { contract, provider } = await window.connectWallet();
                let cpa = '-', dai = '-', matic = '-';
                if (contract && typeof contract.balanceOf === 'function') {
                    try { const c = await contract.balanceOf(walletAddress); cpa = Number(ethers.formatEther(c)).toFixed(4); } catch {}
                }
                try {
                    const DAI_ADDRESS = window.DAI_ADDRESS || '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';
                    const Dai = new ethers.Contract(DAI_ADDRESS, window.DAI_ABI, provider);
                    const d = await Dai.balanceOf(walletAddress);
                    dai = Number(ethers.formatUnits(d, 18)).toFixed(2);
                } catch {}
                if (provider) {
                    try { const m = await provider.getBalance(walletAddress); matic = Number(ethers.formatEther(m)).toFixed(4); } catch {}
                }
                document.querySelector('#cpa-balance .balance-value').textContent = cpa;
                document.querySelector('#matic-balance .balance-value').textContent = matic;
                document.querySelector('#dai-balance .balance-value').textContent = dai;
            } catch (error) {
                console.warn('Error fetching balances (fallback):', error);
                document.querySelector('#cpa-balance .balance-value').textContent = '❌';
                document.querySelector('#matic-balance .balance-value').textContent = '❌';
                document.querySelector('#dai-balance .balance-value').textContent = '❌';
            }
        })();
    } else {
        document.querySelector('#cpa-balance .balance-value').textContent = '-';
        document.querySelector('#matic-balance .balance-value').textContent = '-';
        document.querySelector('#dai-balance .balance-value').textContent = '-';
    }

    async function getLiveBalances(addr) {
        let cpa = '-', dai = '-', matic = '-';
        try {
            const { contract, provider } = await window.connectWallet();
            
            // دریافت موجودی CPA
            if (contract && typeof contract.balanceOf === 'function') {
                try {
                    let cpaRaw = await contract.balanceOf(addr);
                    cpa = (typeof ethers !== 'undefined') ? Number(ethers.formatEther(cpaRaw)).toFixed(2) : (Number(cpaRaw)/1e18).toFixed(2);
                } catch(e) {
                    console.warn('خطا در دریافت موجودی CPA:', e);
                }
            }
            
            // دریافت موجودی DAI
            try {
                if (typeof DAI_ADDRESS !== 'undefined' && typeof DAI_ABI !== 'undefined') {
                    const daiContract = new ethers.Contract(DAI_ADDRESS, DAI_ABI, provider);
                    let daiRaw = await daiContract.balanceOf(addr);
                    dai = (typeof ethers !== 'undefined') ? Number(ethers.formatUnits(daiRaw, 18)).toFixed(2) : (Number(daiRaw)/1e18).toFixed(2);
                }
            } catch(e) {
                console.warn('خطا در دریافت موجودی DAI:', e);
            }
            
            // دریافت موجودی MATIC
            if (provider) {
                try {
                    let maticRaw = await provider.getBalance(addr);
                    matic = (typeof ethers !== 'undefined') ? Number(ethers.formatEther(maticRaw)).toFixed(3) : (Number(maticRaw)/1e18).toFixed(3);
                } catch(e) {
                    console.warn('خطا در دریافت موجودی MATIC:', e);
                }
            }
        } catch(e) {
            console.error('خطا در دریافت موجودی‌ها:', e);
        }
        return {cpa, dai, matic};
    }

    (async function() {
        const {cpa, dai, matic} = await getLiveBalances(address);
        // به‌روزرسانی موجودی‌ها در لیست
        const listItems = document.querySelectorAll('.user-info-list li');
        listItems.forEach(item => {
            const text = item.textContent;
            if (text.includes('🟢 CPA:')) {
                item.innerHTML = item.innerHTML.replace(/🟢 <b>CPA:<\/b> [^<]*/, `🟢 <b>CPA:</b> ${cpa}`);
            } else if (text.includes('🟣 MATIC:')) {
                item.innerHTML = item.innerHTML.replace(/🟣 <b>MATIC:<\/b> [^<]*/, `🟣 <b>MATIC:</b> ${matic}`);
            } else if (text.includes('💵 DAI:')) {
                item.innerHTML = item.innerHTML.replace(/💵 <b>DAI:<\/b> [^<]*/, `💵 <b>DAI:</b> ${dai}`);
            }
        });
    })();
};

// تابع جدید: رندر عمودی ساده با حفظ رفتارها
async function renderVerticalNodeLazy(index, container, level = 0, autoExpand = false) {
    // نسخه رندر برای دیباگ
    try { console.debug('renderVerticalNodeLazy', window.NETWORK_RENDER_VERSION, 'index:', String(index), 'level:', level); } catch {}
    // به روزرسانی پروگرس هر گره
    updateNodeProgress();
    console.log(`🔄 renderVerticalNodeLazy called with index: ${index}, level: ${level}`);
    try {
        console.log('🔄 Getting contract connection...');
        const { contract } = await window.connectWallet();
        if (!contract) throw new Error('No contract connection available');
        console.log('✅ Contract connection obtained');
        
        console.log(`🔄 Getting address for index: ${index}`);
        let address = await contract.indexToAddress(index);
        console.log('✅ Address obtained:', address);
        
        if (!address || address === '0x0000000000000000000000000000000000000000') {
            console.log('⚠️ Empty address, rendering empty node');
            renderEmptyNodeVertical(index, container, level);
            return;
        }
        
        console.log('🔄 Getting user data for address:', address);
        let user = await contract.users(address);
        console.log('✅ User data obtained:', user);
        
        if (!user) {
            console.log('⚠️ No user data, rendering empty node');
            renderEmptyNodeVertical(index, container, level);
            return;
        }
        // دریافت دایرکت‌های واقعی با getUserTree
        let leftUser = null, rightUser = null, hasDirects = false;
        let tree = null;
        let leftActive = false, rightActive = false;
        if (typeof contract.getUserTree === 'function') {
            tree = await contract.getUserTree(address);
            if (tree.left && tree.left !== '0x0000000000000000000000000000000000000000') {
                leftUser = await contract.users(tree.left);
                if (leftUser && leftUser.activated) { hasDirects = true; leftActive = true; }
            }
            if (tree.right && tree.right !== '0x0000000000000000000000000000000000000000') {
                rightUser = await contract.users(tree.right);
                if (rightUser && rightUser.activated) { hasDirects = true; rightActive = true; }
            }
        }
        // ساخت گره عمودی (همانند قبل)
        let nodeDiv = document.createElement('div');
        nodeDiv.style.display = 'inline-flex';
        nodeDiv.style.alignItems = 'center';
        nodeDiv.style.justifyContent = 'flex-start';
        nodeDiv.style.flexWrap = 'nowrap';
        // فاصله‌های پایه (سطح‌ها نزدیک‌تر و بدون عقب‌نشینی ثابت)
        nodeDiv.style.marginRight = '0px';
        nodeDiv.style.marginBottom = '0.9em';
        nodeDiv.style.position = 'relative';
        nodeDiv.style.background = getNodeColorByLevel(level, true);
        nodeDiv.style.borderRadius = '12px';
        const cpaId = window.generateCPAId ? window.generateCPAId(user.index) : user.index;
        nodeDiv.style.padding = '0.6em 1.2em';
        nodeDiv.style.width = 'auto';
        nodeDiv.style.minWidth = 'unset';
        nodeDiv.style.maxWidth = 'none';
        nodeDiv.style.height = 'auto';
        nodeDiv.style.minHeight = 'unset';
        nodeDiv.style.maxHeight = 'none';
        nodeDiv.style.color = '#00ff88';
        nodeDiv.style.fontFamily = 'monospace';
        nodeDiv.style.fontSize = '1.08em';
        nodeDiv.style.boxShadow = '0 4px 16px rgba(0,255,136,0.10)';
        nodeDiv.style.cursor = 'pointer';
        nodeDiv.style.transition = 'background 0.2s, box-shadow 0.2s';
        nodeDiv.style.whiteSpace = 'nowrap';
        nodeDiv.onmouseover = function() { this.style.background = '#232946'; this.style.boxShadow = '0 6px 24px #00ff8840'; };
        nodeDiv.onmouseout = function() { this.style.background = getNodeColorByLevel(level, true); this.style.boxShadow = '0 4px 16px rgba(0,255,136,0.10)'; };
        nodeDiv.innerHTML = `
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 1.1em; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-weight: bold;">${cpaId}</span>
        `;
        
        // دکمه expand/collapse اگر دایرکت دارد یا جای خالی دارد
        let expandBtn = null;
        let childrenDiv = null;
        if (hasDirects || !leftActive || !rightActive) {
            expandBtn = document.createElement('button');
            expandBtn.textContent = autoExpand ? '▾' : '▸';
            expandBtn.style.padding = '0';
            expandBtn.style.background = 'transparent';
            expandBtn.style.border = 'none';
            expandBtn.style.outline = 'none';
            expandBtn.style.color = '#a786ff';
            expandBtn.style.fontSize = '1.1em';
            expandBtn.style.lineHeight = '1';
            expandBtn.style.cursor = 'pointer';
            expandBtn.style.verticalAlign = 'middle';
            expandBtn.style.fontWeight = '700';
            expandBtn.style.marginInlineEnd = '0.4em';
            expandBtn.setAttribute('aria-label', 'Expand/Collapse');
            nodeDiv.prepend(expandBtn);
        }
        nodeDiv.addEventListener('click', function(e) {
            if (e.target.classList.contains('register-question-mark')) return;
            if (expandBtn && e.target === expandBtn) {
                if (childrenDiv.style.display === 'none') {
                    childrenDiv.style.display = 'block';
                    expandBtn.textContent = '▾';
                } else {
                    childrenDiv.style.display = 'none';
                    expandBtn.textContent = '▸';
                }
                e.stopPropagation();
                return;
            }
            if (typeof window.networkShowUserPopup === 'function') {
                window.networkShowUserPopup(address, user);
            }
        });
        container.appendChild(nodeDiv);
        
        // ذخیره گره در دیتابیس
        if (window.saveNetworkNode) {
            try {
                const nodeData = {
                    index: index.toString(),
                    address: address,
                    cpaId: cpaId,
                    level: level,
                    hasDirects: hasDirects,
                    leftActive: leftActive,
                    rightActive: rightActive,
                    userData: {
                        activated: user.activated,
                        binaryPoints: user.binaryPoints,
                        binaryPointCap: user.binaryPointCap,
                        totalMonthlyRewarded: user.totalMonthlyRewarded,
                        binaryPointsClaimed: user.binaryPointsClaimed,
                        refclimed: user.refclimed,
                        depositedAmount: user.depositedAmount,
                        lvlBalance: 'در حال بارگذاری...',
                        maticBalance: 'در حال بارگذاری...',
                        daiBalance: 'در حال بارگذاری...',
                        leftPoints: user.leftPoints,
                        rightPoints: user.rightPoints
                    }
                };
                await window.saveNetworkNode(nodeData);
            } catch (error) {
                console.warn('⚠️ خطا در ذخیره گره در دیتابیس:', error);
            }
        }
        
        // ابزار کمکی: تنظیم عقب‌نشینی پویا بر اساس نصف عرض گره فرزند
        function setDynamicIndent(wrapperDiv) {
            if (!wrapperDiv) return;
            const apply = () => {
                const childEl = wrapperDiv.firstElementChild;
                if (childEl && typeof childEl.getBoundingClientRect === 'function') {
                    const w = childEl.getBoundingClientRect().width || 160;
                    wrapperDiv.style.marginRight = Math.round(w / 2) + 'px';
                }
            };
            // تا بعد از layout صبر کن
            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(() => requestAnimationFrame(apply));
            } else {
                setTimeout(apply, 0);
            }
        }

        // div فرزندان (در ابتدا بسته یا باز بر اساس autoExpand)
        if (expandBtn) {
            childrenDiv = document.createElement('div');
            childrenDiv.style.display = autoExpand ? 'block' : 'none';
            childrenDiv.style.transition = 'all 0.3s';
            // فرزندان زیرِ هم در دو سطر مجزا
            container.appendChild(childrenDiv);
            // چپ: سطر دوم، با عقب‌نشینی نصف عرض خودش
            if (leftActive) {
                let leftRow = document.createElement('div');
                leftRow.className = 'child-node-row left-row';
                leftRow.style.display = 'block';
                childrenDiv.appendChild(leftRow);
                await renderVerticalNodeLazy(BigInt(leftUser.index), leftRow, level + 1, false);
                // عقب‌نشینی نصف عرض خودش (پس از layout)
                setDynamicIndent(leftRow);
            }
            // راست: سطر سوم، دقیقاً زیر چپ با همان عقب‌نشینی افقی
            if (rightActive) {
                let rightRow = document.createElement('div');
                rightRow.className = 'child-node-row right-row';
                rightRow.style.display = 'block';
                childrenDiv.appendChild(rightRow);
                await renderVerticalNodeLazy(BigInt(rightUser.index), rightRow, level + 1, false);
                // هم‌تراز با چپ (در صورت وجود)
                const leftRowRef = childrenDiv.querySelector('.left-row');
                if (leftRowRef) {
                    rightRow.style.marginRight = leftRowRef.style.marginRight || '0px';
                } else {
                    setDynamicIndent(rightRow);
                }
            }
            // دیگر نیازی به مرکزچین کردن ردیف مشترک نیست
        }
        // اگر جایگاه خالی وجود دارد، فقط یک دکمه کوچک "نیو" نمایش بده
        if (!leftActive || !rightActive) {
            let newBtn = document.createElement('button');
            newBtn.textContent = 'N';
            newBtn.title = 'ثبت‌نام زیرمجموعه جدید';
            newBtn.style.background = 'linear-gradient(90deg,#a786ff,#00ff88)';
            newBtn.style.color = '#181c2a';
            newBtn.style.fontWeight = 'bold';
            newBtn.style.border = 'none';
            newBtn.style.borderRadius = '6px';
            newBtn.style.padding = '0.4em 1.2em';
            newBtn.style.cursor = 'pointer';
            newBtn.style.fontSize = '0.9em';
            newBtn.style.marginRight = '0.8em';
            newBtn.style.marginLeft = '0.8em';
            newBtn.style.whiteSpace = 'nowrap';
            newBtn.style.fontWeight = 'bold';
            newBtn.onclick = async function(e) {
                e.stopPropagation();
                // اگر modal قبلی باز است، حذف کن
                let oldModal = document.getElementById('quick-register-modal');
                if (oldModal) oldModal.remove();
                // اطلاعات مورد نیاز
                let emptyIndex = !leftActive ? index * 2n : index * 2n + 1n;
                let parentIndex = index;
                let registerCost = '...';
                let maticBalance = '...';
                let userAddress = '';
                let errorMsg = '';
                let loading = true;
                let cpaBalance = '...';
                // ساخت modal
                let modal = document.createElement('div');
                modal.id = 'quick-register-modal';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100vw';
                modal.style.height = '100vh';
                modal.style.background = 'rgba(24,28,42,0.85)';
                modal.style.zIndex = '99999';
                modal.style.display = 'flex';
                modal.style.alignItems = 'center';
                modal.style.justifyContent = 'center';
                modal.innerHTML = `
                  <div style="background:linear-gradient(135deg,#232946,#181c2a);border-radius:18px;box-shadow:0 4px 24px #00ff8840;padding:2.2rem 2.2rem 1.5rem 2.2rem;min-width:320px;max-width:95vw;width:100%;position:relative;direction:rtl;">
                    <button id="close-quick-register" style="position:absolute;top:1.1rem;left:1.1rem;background:#ff6b6b;color:#fff;border:none;border-radius:50%;width:32px;height:32px;font-size:1.3em;cursor:pointer;">×</button>
                    <h3 style="color:#00ff88;font-size:1.2rem;margin-bottom:1.2rem;text-align:center;">ثبت‌نام سریع زیرمجموعه جدید</h3>
                    <div id="quick-register-info" style="margin-bottom:1.2rem;color:#a786ff;font-size:1.05em;text-align:right;line-height:2;"></div>
                    <div style="margin-bottom:1.2rem;">
                      <div style='margin-bottom:0.7em;display:flex;gap:1.2em;justify-content:center;align-items:center;'>
                        <span style='color:#a786ff;font-weight:bold;'>انتخاب آواتار:</span>
                        <span class="avatar-choice" data-avatar="man" style="font-size:2em;cursor:pointer;border:2px solid #00ff88;border-radius:50%;padding:0.15em 0.3em;background:#232946;">👨‍💼</span>
                        <span class="avatar-choice" data-avatar="woman" style="font-size:2em;cursor:pointer;border:2px solid transparent;border-radius:50%;padding:0.15em 0.3em;background:#232946;">👩‍💼</span>
                        <span class="avatar-choice" data-avatar="student-man" style="font-size:2em;cursor:pointer;border:2px solid transparent;border-radius:50%;padding:0.15em 0.3em;background:#232946;">👨‍🎓</span>
                        <span class="avatar-choice" data-avatar="student-woman" style="font-size:2em;cursor:pointer;border:2px solid transparent;border-radius:50%;padding:0.15em 0.3em;background:#232946;">👩‍🎓</span>
                      </div>
                      <label for="quick-register-address" style="color:#a786ff;font-weight:bold;margin-bottom:0.5rem;display:block;">آدرس ولت جدید:</label>
                      <input id="quick-register-address" type="text" placeholder="0x..." style="width:100%;padding:0.8rem 1.2rem;border-radius:8px;border:2px solid #a786ff;background:rgba(0,0,0,0.2);color:#fff;font-family:monospace;direction:ltr;text-align:left;box-sizing:border-box;font-size:1.05rem;">
                    </div>
                    <button id="quick-register-btn" style="width:100%;background:linear-gradient(90deg,#00ff88,#a786ff);color:#181c2a;font-weight:bold;border:none;border-radius:8px;padding:1rem;font-size:1.1rem;cursor:pointer;transition:all 0.3s;margin-bottom:1rem;">ثبت‌نام</button>
                    <div id="quick-register-status" style="text-align:center;margin-top:0.5rem;font-size:1.05em;"></div>
                  </div>
                `;
                document.body.appendChild(modal);
                // انتخاب آواتار
                let selectedAvatar = 'man';
                const avatarChoices = modal.querySelectorAll('.avatar-choice');
                avatarChoices.forEach(el => {
                  el.onclick = function() {
                    avatarChoices.forEach(e2 => e2.style.border = '2px solid transparent');
                    this.style.border = '2px solid #00ff88';
                    selectedAvatar = this.getAttribute('data-avatar');
                  };
                });
                // پیش‌فرض اولین آواتار انتخاب شود
                avatarChoices[0].style.border = '2px solid #00ff88';
                // بستن modal
                document.getElementById('close-quick-register').onclick = () => modal.remove();
                // گرفتن اطلاعات قرارداد و نمایش
                (async function() {
                  try {
                    const { contract, address: myAddress, provider } = await window.connectWallet();
                    // مقدار مورد نیاز برای ثبت‌نام
                    if (window.getRegPrice) {
                      let cost = await window.getRegPrice(contract);
                      if (cost) {
                        let costValue = typeof ethers !== 'undefined' ? ethers.formatEther(cost) : (Number(cost)/1e18);
                        registerCost = Math.round(parseFloat(costValue)).toString(); // حذف اعشار و گرد کردن
                      } else {
                        registerCost = '...';
                      }
                    }
                    // موجودی متیک
                    if (provider && myAddress) {
                      let bal = await provider.getBalance(myAddress);
                      maticBalance = bal ? (typeof ethers !== 'undefined' ? Number(ethers.formatEther(bal)).toFixed(2) : (Number(bal)/1e18).toFixed(2)) : '...';
                    }
                    // موجودی CPA
                    if (contract && myAddress && typeof contract.balanceOf === 'function') {
                      let cpa = await contract.balanceOf(myAddress);
                      cpaBalance = cpa ? (typeof ethers !== 'undefined' ? Number(ethers.formatEther(cpa)).toFixed(2) : (Number(cpa)/1e18).toFixed(2)) : '...';
                    }
                    loading = false;
                  } catch (e) {
                    errorMsg = 'خطا در دریافت اطلاعات کیف پول یا قرارداد';
                  }
                  // نمایش اطلاعات
                  let infoDiv = document.getElementById('quick-register-info');
                  if (infoDiv) {
                    infoDiv.innerHTML =
                      `<div>ایندکس رفرر: <b style='color:#00ff88'>${window.generateCPAId ? window.generateCPAId(parentIndex) : parentIndex}</b></div>`+
                      `<div>ایندکس جایگاه جدید: <b style='color:#a786ff'>${window.generateCPAId ? window.generateCPAId(emptyIndex) : emptyIndex}</b></div>`+
                      `<div>مقدار مورد نیاز برای ثبت‌نام: <b style='color:#00ff88'>${registerCost} CPA</b></div>`+
                      `<div>موجودی متیک شما: <b style='color:#a786ff'>${maticBalance} MATIC</b></div>`+
                      `<div>موجودی CPA شما: <b style='color:#00ff88'>${cpaBalance} CPA</b></div>`+
                      (errorMsg ? `<div style='color:#ff4444'>${errorMsg}</div>` : '');
                  }
                })();
                // ثبت‌نام
                document.getElementById('quick-register-btn').onclick = async function() {
                  let statusDiv = document.getElementById('quick-register-status');
                  let input = document.getElementById('quick-register-address');
                  let newAddress = input.value.trim();
                  statusDiv.textContent = '';
                  if (!/^0x[a-fA-F0-9]{40}$/.test(newAddress)) {
                    statusDiv.textContent = 'لطفاً یک آدرس ولت معتبر وارد کنید!';
                    statusDiv.style.color = '#ff4444';
                    return;
                  }
                  statusDiv.textContent = 'در حال ارسال درخواست ثبت‌نام...';
                  statusDiv.style.color = '#a786ff';
                  this.disabled = true;
                  // مقدار آواتار انتخابی را لاگ کن (در صورت نیاز بعداً به قرارداد هم می‌توان ارسال کرد)
                  console.log('انتخاب آواتار کاربر:', selectedAvatar);
                  // مقدار آواتار انتخابی را ذخیره کن
                  localStorage.setItem('avatar_' + newAddress, selectedAvatar);
                  try {
                    const { contract } = await window.connectWallet();
                    const tx = await contract.registerAndActivate(address, newAddress);
                    await tx.wait();
                    statusDiv.textContent = '✅ ثبت‌نام با موفقیت انجام شد!';
                    statusDiv.style.color = '#00ff88';
                    setTimeout(() => { modal.remove(); if (typeof window.renderSimpleBinaryTree === 'function') window.renderSimpleBinaryTree(); }, 1200);
                  } catch (err) {
                    statusDiv.textContent = '❌ خطا در ثبت‌نام: ' + (err && err.message ? err.message : err);
                    statusDiv.style.color = '#ff4444';
                  }
                  this.disabled = false;
                };
            };
            nodeDiv.appendChild(newBtn);
        }
    } catch (error) {
        renderEmptyNodeVertical(index, container, level);
    }
}
// تابع رندر گره خالی (علامت سؤال) به صورت عمودی
function renderEmptyNodeVertical(index, container, level) {
    // بازگشت به گره خالی مستطیلی ساده
    const emptyNode = document.createElement('div');
    emptyNode.className = 'empty-node';
    emptyNode.setAttribute('data-index', index);
    emptyNode.style.display = 'inline-flex';
    emptyNode.style.alignItems = 'center';
    emptyNode.style.justifyContent = 'center';
    // کاهش فاصله افقی برای سطوح عمیق‌تر
    const marginMultiplier = level <= 3 ? 3 : (level <= 5 ? 2 : 1);
    emptyNode.style.marginRight = (level * marginMultiplier) + 'em';
    emptyNode.style.marginBottom = '1.2em';
    emptyNode.style.background = getNodeColorByLevel(level, false);
    emptyNode.style.borderRadius = '8px';
    emptyNode.style.padding = '0.5em 1.0em';
    emptyNode.style.width = 'auto';
    emptyNode.style.minWidth = 'unset';
    emptyNode.style.maxWidth = 'none';
    emptyNode.style.height = 'auto';
    emptyNode.style.minHeight = 'unset';
    emptyNode.style.maxHeight = 'none';
    emptyNode.style.color = '#888';
    emptyNode.style.fontFamily = 'monospace';
    emptyNode.style.fontSize = '1em';
    emptyNode.style.opacity = '0.7';
    emptyNode.style.whiteSpace = 'nowrap';
    emptyNode.style.overflow = 'hidden';
    emptyNode.style.textOverflow = 'ellipsis';
    emptyNode.innerHTML = `
        <span style="white-space: nowrap; font-size: 1em; display: flex; align-items: center; justify-content: center; font-weight: bold;">${index}</span>
    `;
    emptyNode.title = 'ثبت‌نام زیرمجموعه جدید';
    emptyNode.onmouseover = function() { this.style.opacity = '1'; };
    emptyNode.onmouseout = function() { this.style.opacity = '0.7'; };
    emptyNode.onclick = async function() {
        // همان رفتار قبلی ثبت‌نام زیرمجموعه
        // برای جلوگیری از تکرار، می‌توانی تابع renderEmptyNode را فراخوانی کنی
        renderEmptyNode(index, container);
    };
    container.appendChild(emptyNode);
    
    // ذخیره گره خالی در دیتابیس
    if (window.saveNetworkNode) {
        try {
            const nodeData = {
                index: index.toString(),
                address: null,
                cpaId: null,
                level: level,
                hasDirects: false,
                leftActive: false,
                rightActive: false,
                isEmpty: true,
                userData: null
            };
            window.saveNetworkNode(nodeData);
        } catch (error) {
            console.warn('⚠️ خطا در ذخیره گره خالی در دیتابیس:', error);
        }
    }
}
// جایگزینی رندر اصلی درخت با مدل عمودی
window.renderSimpleBinaryTree = async function() {
    console.log('🔄 Starting renderSimpleBinaryTree...');
    const container = document.getElementById('network-tree');
    if (!container) {
        console.error('❌ Network tree container not found');
        return;
    }
    console.log('✅ Network tree container found');
    
    // آماده‌سازی پروگرس بار
    showNetworkProgress();
    totalNodesToLoad = 50; // تخمین تعداد گره‌های ممکن
    nodesLoaded = 0;
    setNetworkProgress(5);
    
    container.innerHTML = '';
    container.style.overflow = 'auto';
    container.style.whiteSpace = 'normal';
    container.style.padding = '2rem 0';
    container.style.display = 'block';
    try {
        console.log('🔄 Connecting to wallet...');
        setNetworkProgress(10);
        const { contract, address } = await window.connectWallet();
        if (!contract || !address) {
            throw new Error('اتصال کیف پول در دسترس نیست');
        }
        console.log('✅ Wallet connected, address:', address);
        setNetworkProgress(20);
        console.log('🔄 Getting user data...');
        const user = await contract.users(address);
        if (!user || !user.index) {
            throw new Error('کاربر پیدا نشد یا ثبت‌نام نشده است');
        }
        console.log('✅ User data retrieved, index:', user.index);
        setNetworkProgress(30);
        // در window.renderSimpleBinaryTree مقدار autoExpand فقط برای ریشه true باشد:
        console.log('🔄 Rendering vertical node...');
        await renderVerticalNodeLazy(BigInt(user.index), container, 0, true);
        console.log('✅ Vertical node rendered successfully');
        setNetworkProgress(100);
        
        // مخفی کردن پروگرس بار بعد از تکمیل
        setTimeout(() => {
            hideNetworkProgress();
        }, 1000);
        
        // ذخیره درخت در دیتابیس بعد از رندر
        if (window.saveCurrentNetworkTree) {
            setTimeout(async () => {
                try {
                    await window.saveCurrentNetworkTree();
                } catch (error) {
                    console.warn('⚠️ خطا در ذخیره درخت در دیتابیس:', error);
                }
            }, 2000); // 2 ثانیه صبر کن تا رندر کامل شود
        }
    } catch (error) {
        console.error('❌ Error rendering binary tree:', error);
        hideNetworkProgress();
        container.innerHTML = `<div style="color:#ff4444;text-align:center;padding:2rem;">❌ خطا در بارگذاری درخت شبکه<br><small style="color:#ccc;">${error.message}</small></div>`;
    }
};


// اطمینان از اتصال توابع به window برای نمایش شبکه
if (typeof renderSimpleBinaryTree === 'function') {
    window.renderSimpleBinaryTree = renderSimpleBinaryTree;
}

// اضافه کردن تابع initializeNetworkTab به window
// window.initializeNetworkTab = initializeNetworkTab; // این خط حذف شد چون تابع بعداً تعریف می‌شود



// اضافه کردن event listener برای تب network
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 DOMContentLoaded event fired for network.js');
    
    // بررسی اینکه آیا در تب network هستیم
    const networkTab = document.getElementById('tab-network-btn');
    if (networkTab) {
        networkTab.addEventListener('click', function() {
            setTimeout(() => {
                if (typeof window.initializeNetworkTab === 'function') {
                    window.initializeNetworkTab();
                }
            }, 500);
        });
    }
    
    // بررسی اینکه آیا در تب network هستیم و شبکه رندر نشده
    const networkSection = document.getElementById('main-network');
    if (networkSection && networkSection.style.display !== 'none') {
        setTimeout(() => {
            if (typeof window.initializeNetworkTab === 'function') {
                window.initializeNetworkTab();
            }
        }, 1000);
    }
    
    // اضافه کردن event listener برای تغییر visibility
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const visibleNetworkSection = document.getElementById('main-network');
                if (visibleNetworkSection && visibleNetworkSection.style.display !== 'none') {
                    setTimeout(() => {
                        if (typeof window.initializeNetworkTab === 'function') {
                            window.initializeNetworkTab();
                        }
                    }, 500);
                }
            }
        });
    });
    
    // observe کردن تغییرات در main-network
    if (networkSection) {
        observer.observe(networkSection, { attributes: true, attributeFilter: ['style'] });
    }
});



// تابع رفرش درخت باینری بعد از تایید متامسک
window.refreshBinaryTreeAfterMetaMask = async function() {
    try {
        // پاک کردن کامل درخت و reset متغیرها
        if (typeof window.clearBinaryTree === 'function') {
            window.clearBinaryTree();
        }
        
        // کمی صبر کن تا اتصال برقرار شود
        setTimeout(async () => {
            try {
                if (typeof window.renderSimpleBinaryTree === 'function') {
                    // force render با reset کردن متغیرها
                    lastRenderedIndex = null;
                    lastRenderedTime = 0;
                    await window.renderSimpleBinaryTree();
                }
            } catch (error) {
                console.warn('Error refreshing binary tree after MetaMask approval:', error);
            }
        }, 2000);
        
    } catch (error) {
        console.warn('Error in refreshBinaryTreeAfterMetaMask:', error);
    }
};

// تابع پاک کردن کامل درخت
window.clearBinaryTree = function() {
    const container = document.getElementById('network-tree');
    if (container) {
        container.innerHTML = '';
    }
    lastRenderedIndex = null;
    isRenderingTree = false;
    lastRenderedTime = 0;
};

window.initializeNetworkTab = async function() {
    console.log('🔄 Initializing network tab...');
    
    // پاک کردن درخت قبل از رندر جدید
    if (typeof window.clearBinaryTree === 'function') {
        window.clearBinaryTree();
    }
    
    // بررسی وجود container
    const container = document.getElementById('network-tree');
    if (!container) {
        console.error('❌ Network tree container not found');
        return;
    }
    
    console.log('✅ Network tree container found');
    
    // نمایش پروگرس بار و وضعیت بارگذاری
    showNetworkProgress();
    setNetworkProgress(5);
    container.innerHTML = '<div style="color:#00ccff;text-align:center;padding:2rem;">🔄 در حال بارگذاری درخت شبکه...</div>';
    
    // تست ساده برای بررسی اتصال
    try {
        console.log('🔄 Testing wallet connection...');
        const { contract, address } = await window.connectWallet();
        console.log('✅ Wallet connection test successful');
        console.log('Contract:', contract);
        console.log('Address:', address);
    } catch (error) {
        console.error('❌ Wallet connection test failed:', error);
        hideNetworkProgress();
        container.innerHTML = `<div style="color:#ff4444;text-align:center;padding:2rem;">❌ خطا در اتصال کیف پول<br><small style="color:#ccc;">${error.message}</small></div>`;
        return;
    }
    
    // retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    const tryRender = async () => {
        try {
            if (typeof window.renderSimpleBinaryTree === 'function') {
                console.log(`🔄 Attempt ${retryCount + 1} to render network tree...`);
                await window.renderSimpleBinaryTree();
            } else {
                console.error('❌ renderSimpleBinaryTree function not found');
                container.innerHTML = '<div style="color:#ff4444;text-align:center;padding:2rem;">❌ تابع رندر شبکه پیدا نشد</div>';
            }
        } catch (error) {
            console.error(`❌ Error initializing network tab (attempt ${retryCount + 1}):`, error);
            retryCount++;
            
            if (retryCount < maxRetries) {
                console.log(`🔄 Retrying in 2 seconds... (${retryCount}/${maxRetries})`);
                setTimeout(tryRender, 2000);
            } else {
                hideNetworkProgress();
                container.innerHTML = `
                    <div style="color:#ff4444;text-align:center;padding:2rem;">
                        ❌ خطا در بارگذاری درخت شبکه<br>
                        <small style="color:#ccc;">${error.message}</small>
                        <br><br>
                        <button onclick="window.initializeNetworkTab()" style="
                            background: linear-gradient(135deg, #00ff88, #00cc66);
                            color: #232946;
                            border: none;
                            padding: 0.8rem 1.5rem;
                            border-radius: 8px;
                            font-weight: bold;
                            cursor: pointer;
                            margin-top: 1rem;
                        ">🔄 تلاش مجدد</button>
                    </div>
                `;
            }
        }
    };
    
    // کمی صبر کن تا UI کاملاً لود شود
    setTimeout(tryRender, 1000);
};

function getReferrerFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const referrer = urlParams.get('ref') || urlParams.get('referrer') || urlParams.get('r');
  if (referrer && /^0x[a-fA-F0-9]{40}$/.test(referrer)) {
    return referrer;
  }
  return null;
}

// تابع گرفتن معرف نهایی (کد رفرال یا دیپلویر)
async function getFinalReferrer(contract) {
  // ابتدا از URL بررسی کن
  const urlReferrer = getReferrerFromURL();
  if (urlReferrer) {
    try {
      const user = await contract.users(urlReferrer);
      if (user && user.activated) {
        return urlReferrer;
      }
    } catch (e) {
      console.warn('URL referrer not valid:', e);
    }
  }
  
  // اگر URL معرف نداشت، از آدرس فعلی استفاده کن
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const currentAddress = accounts[0];
    const user = await contract.users(currentAddress);
    if (user && user.activated) {
      return currentAddress;
    }
  } catch (e) {
    console.error('Error getting current address as referrer:', e);
  }
  
  // اگر هیچ‌کدام نبود، دیپلویر را برگردان
  try {
    return await contract.deployer();
  } catch (e) {
    console.error('Error getting deployer:', e);
    return null;
  }
}



 

// فرض: بعد از ثبت‌نام موفق یا عملیات نیازمند رفرش
window.refreshNetworkTab = function() {
  localStorage.setItem('activeTab', 'network');
  // window.location.reload(); // حذف شد: دیگر رفرش انجام نمی‌شود
}; 

// حذف توابع تست و دکمه‌های تست
// (تابع testNetworkContainer، testNetworkRender، testNetworkFromConsole و فراخوانی‌های آن‌ها حذف شد) 

// تابع force render برای رندر اجباری شبکه
window.forceRenderNetwork = async function() {
    console.log('🔄 Force rendering network tree...');
    
    // reset کردن متغیرها
    isRenderingTree = false;
    lastRenderedIndex = null;
    lastRenderedTime = 0;
    
    // پاک کردن container
    const container = document.getElementById('network-tree');
    if (container) {
        container.innerHTML = '';
    }
    
    // تلاش برای رندر
    if (typeof window.renderSimpleBinaryTree === 'function') {
        await window.renderSimpleBinaryTree();
    }
}; 

// تابع نمایش اطلاعات struct کاربر به صورت تایپ‌رایت (فارسی)
window.showUserStructTypewriter = function(address, user) {
  const infoLines = [
    `CPA ID:  ${window.generateCPAId ? window.generateCPAId(user.index) : user.index}`,
    `امتیاز باینری:  ${user.binaryPoints}`,
    `امتیاز باینری دریافت‌شده:  ${user.binaryPointsClaimed}`,
    `امتیاز باینری مانده:  ${user.binaryPoints && user.binaryPointsClaimed ? (Number(user.binaryPoints) - Number(user.binaryPointsClaimed)) : '0'}`,
    `سقف امتیاز:  ${user.binaryPointCap}`,
    `امتیاز چپ:  ${user.leftPoints}`,
    `امتیاز راست:  ${user.rightPoints}`,
    `پاداش رفرال:  ${user.refclimed ? Math.floor(Number(user.refclimed) / 1e18) : '0'}`,
    `موجودی CPA:  ${user.lvlBalance ? user.lvlBalance : '0'}`,
    `موجودی POL:  ${user.maticBalance ? user.maticBalance : '0'}`,
            `موجودی DAI:  ${user.daiBalance ? user.daiBalance : '0'}`
  ];
  const popup = document.createElement('div');
  popup.id = 'user-popup';
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%,-50%)';
  popup.style.zIndex = 9999;
  popup.innerHTML = `
    <div style="background: #181c2a; padding: 0.2rem; width: 100%; max-width: 500px; overflow: hidden; direction: rtl; position: relative; font-family: 'Courier New', monospace;">
      <div class=\"popup-header\" style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem; padding-bottom: 0.1rem; border-bottom: none; cursor: pointer;\">
        <h3 style=\"color: #00ff88; margin: 0; font-size: 0.9rem; font-weight: bold; text-align: center; flex: 1; cursor: pointer; font-family: 'Courier New', monospace;\">👤 USER INFO (${shortAddress(address)})</h3>
        <button id=\"close-user-popup\" style=\"background: #ff6b6b; color: white; border: none; border-radius: 0; width: 20px; height: 20px; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; font-family: 'Courier New', monospace;\" onmouseover=\"this.style.background='#ff4444'\" onmouseout=\"this.style.background='#ff6b6b'\">×</button>
      </div>
      <pre id=\"user-popup-typewriter\" style=\"background:#181c2a;padding:0.2rem;color:#00ff88;font-size:0.9rem;line-height:1.7;font-family:'Courier New',monospace;min-width:300px;direction:rtl;text-align:right;min-height:120px;max-height:320px;overflow-y:auto;border:none;box-shadow:none;display:block;\"></pre>
    </div>
  `;
  document.body.appendChild(popup);
  document.getElementById('close-user-popup').onclick = () => popup.remove();
  function typeWriter(lines, el, lineIdx = 0, charIdx = 0) {
    if (lineIdx >= lines.length) return;
    if (charIdx === 0 && lineIdx > 0) el.textContent += '\n';
    if (charIdx < lines[lineIdx].length) {
      el.textContent += lines[lineIdx][charIdx];
      setTimeout(() => typeWriter(lines, el, lineIdx, charIdx + 1), 18);
    } else {
      setTimeout(() => typeWriter(lines, el, lineIdx + 1, 0), 120);
    }
  }
  const typewriterEl = popup.querySelector('#user-popup-typewriter');
  if (typewriterEl) {
    typewriterEl.textContent = '';
    typeWriter(infoLines, typewriterEl);
  }
}; 