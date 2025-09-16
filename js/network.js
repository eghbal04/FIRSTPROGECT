// Display binary tree with lazy load: each node expands on click and only shows children of that node
window.NETWORK_RENDER_VERSION = 'v-layout-rows-rtl-1';

// Global variables for tree rendering management
let lastRenderedIndex = null;
let isRenderingTree = false;
let lastRenderedTime = 0;
let _networkPopupOpening = false;

// Performance optimization variables - UNLIMITED RENDERING
let maxConcurrentRenders = Infinity; // Unlimited concurrent operations for unlimited tree depth
let activeRenders = 0;
let renderQueue = [];
let isProcessingQueue = false;



// Fallback function for generateIAMId if not available
if (!window.generateIAMId) {
    window.generateIAMId = function(index) {
        if (!index || index === 0) return '0';
        return index.toString();
    };
}

// Function to calculate color based on tree level and index
function getNodeColorByLevel(level, isActive = true, index = null) {
    if (isActive) {
        // Creative color system based on index and level
        if (index !== null) {
            // Check if this is the root node (index 1)
            if (BigInt(index) === 1n) {
                // Golden gradient for root node
                return `linear-gradient(135deg, 
                    rgba(255, 215, 0, ${0.9 - level * 0.1}), 
                    rgba(255, 165, 0, ${0.8 - level * 0.1})), 
                    linear-gradient(45deg, 
                    rgba(255, 255, 255, 0.1), 
                    rgba(255, 255, 255, 0.05))`;
            } else {
                const isEven = BigInt(index) % 2n === 0n;
                
                if (isEven) {
                    // Blue gradient for even indices
                    return `linear-gradient(135deg, 
                        rgba(30, 144, 255, ${0.9 - level * 0.1}), 
                        rgba(0, 191, 255, ${0.8 - level * 0.1})), 
                        linear-gradient(45deg, 
                        rgba(255, 255, 255, 0.1), 
                        rgba(255, 255, 255, 0.05))`;
                } else {
                    // Red gradient for odd indices
                    return `linear-gradient(135deg, 
                        rgba(255, 69, 0, ${0.9 - level * 0.1}), 
                        rgba(220, 20, 60, ${0.8 - level * 0.1})), 
                        linear-gradient(45deg, 
                        rgba(255, 255, 255, 0.1), 
                        rgba(255, 255, 255, 0.05))`;
                }
            }
        } else {
            // Default gradient for nodes without index
            return `linear-gradient(135deg, 
                rgba(35, 41, 70, ${0.9 - level * 0.1}), 
                rgba(25, 31, 60, ${0.8 - level * 0.1})), 
                linear-gradient(45deg, 
                rgba(255, 255, 255, 0.1), 
                rgba(255, 255, 255, 0.05))`;
        }
    } else {
        // For empty nodes: elegant gray gradient
        return `linear-gradient(135deg, 
            rgba(224, 224, 224, 0.8), 
            rgba(200, 200, 200, 0.6)), 
            linear-gradient(45deg, 
            rgba(255, 255, 255, 0.05), 
            rgba(255, 255, 255, 0.02))`;
    }
}

function shortAddress(addr) {
    if (!addr || addr === '-') return '-';
    return addr.slice(0, 4) + '...' + addr.slice(-3);
}

// Public alias for use from other files
window.networkShowUserPopup = async function(address, user) {
    if (_networkPopupOpening) return;
    _networkPopupOpening = true;
    setTimeout(()=>{ _networkPopupOpening = false; }, 400);
    console.log('🚀 showUserPopup called with:', { address, user });
    
    // Reset repeat variables for new popup
    _networkPopupOpening = false;
    
    // Address shortener function
    function shortAddress(addr) {
        if (!addr || addr === '-') return '-';
        return addr.slice(0, 4) + '...' + addr.slice(-3);
    }
    
    // Remove previous popup if exists
    let existingPopup = document.getElementById('network-user-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
         // Required information
     const IAMId = user && user.index !== undefined && user.index !== null ? 
         (window.generateIAMId ? window.generateIAMId(user.index) : user.index) : '-';
     const walletAddress = address ? shortAddress(address) : '-';
     const isActive = user && user.index && BigInt(user.index) > 0n ? true : false;
    
    // Function to calculate left and right wallet counts (active ones in subtree)
    async function calculateWalletCounts(userIndex, contract) {
        try {
            let leftCount = 0;
            let rightCount = 0;
            const leftChildIndex = BigInt(userIndex) * 2n;
            const rightChildIndex = BigInt(userIndex) * 2n + 1n;
            // Left
            try {
                const leftAddress = await contract.indexToAddress(leftChildIndex);
                if (leftAddress && leftAddress !== '0x0000000000000000000000000000000000000000') {
                    const leftUser = await (async () => { try { return await contract.users(leftAddress); } catch(e){ return { index:0n }; } })();
                    if (leftUser && leftUser.index && BigInt(leftUser.index) > 0n) {
                        leftCount = 1 + await calculateSubtreeCount(leftChildIndex, contract, 'left');
                    }
                }
            } catch {}
            // Right
            try {
                const rightAddress = await contract.indexToAddress(rightChildIndex);
                if (rightAddress && rightAddress !== '0x0000000000000000000000000000000000000000') {
                    const rightUser = await (async () => { try { return await contract.users(rightAddress); } catch(e){ return { index:0n }; } })();
                    if (rightUser && rightUser.index && BigInt(rightUser.index) > 0n) {
                        rightCount = 1 + await calculateSubtreeCount(rightChildIndex, contract, 'right');
                    }
                }
            } catch {}
            return { leftCount, rightCount };
        } catch (error) {
            return { leftCount: 0, rightCount: 0 };
        }
    }

    // Recursive function to calculate wallet counts in subtree
    async function calculateSubtreeCount(parentIndex, contract, side) {
        let count = 0;
        async function countRecursive(index) {
            const leftChildIndex = BigInt(index) * 2n;
            const rightChildIndex = BigInt(index) * 2n + 1n;
            let subtreeCount = 0;
            // Check left child
            try {
                const leftAddress = await contract.indexToAddress(leftChildIndex);
                if (leftAddress && leftAddress !== '0x0000000000000000000000000000000000000000') {
                    const leftUser = await (async () => { try { return await contract.users(leftAddress); } catch(e){ return { index:0n }; } })();
                    if (leftUser && leftUser.index && BigInt(leftUser.index) > 0n) {
                        subtreeCount += 1;
                        subtreeCount += await countRecursive(leftChildIndex);
                    }
                }
            } catch (e) {
                // نادیده گرفتن خطاها
            }
            // Check right child
            try {
                const rightAddress = await contract.indexToAddress(rightChildIndex);
                if (rightAddress && rightAddress !== '0x0000000000000000000000000000000000000000') {
                    const rightUser = await (async () => { try { return await contract.users(rightAddress); } catch(e){ return { index:0n }; } })();
                    if (rightUser && rightUser.index && BigInt(rightUser.index) > 0n) {
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

    // محاسبه تعداد ولت‌ها (غیرمسدودکننده: ابتدا placeholder سپس بعد از رندر محاسبه می‌شود)
    let walletCounts = { leftCount: '⏳', rightCount: '⏳' };

         // لیست struct
     const infoList = [
               {icon:'🎯', label:'Binary Points', val: (user && user.binaryPoints !== undefined) ? user.binaryPoints : '-'},
        {icon:'🏆', label:'Binary Cap', val: (user && user.binaryPointCap !== undefined) ? user.binaryPointCap : '-'},
        {icon:'💎', label:'Total Binary Reward', val: (user && user.totalMonthlyRewarded !== undefined) ? user.totalMonthlyRewarded : '-'},
        {icon:'✅', label:'Claimed Points', val: (user && user.binaryPointsClaimed !== undefined) ? user.binaryPointsClaimed : '-'},
        {icon:'🤝', label:'Referral Income', val: (user && user.refclimed) ? Math.floor(Number(user.refclimed) / 1e18) : '-'},
        {icon:'💰', label:'Total Deposit', val: (user && user.depositedAmount) ? Math.floor(Number(user.depositedAmount) / 1e18) : '-'},
        {icon:'⬅️', label:'Left Points', val: (user && user.leftPoints !== undefined) ? user.leftPoints : '-'},
        {icon:'➡️', label:'Right Points', val: (user && user.rightPoints !== undefined) ? user.rightPoints : '-'},
        {icon:'👥⬅️', label:'Left Wallet Count', key:'left-wallet-count', userIndex: user && user.index ? user.index : 1n, val:(walletCounts && walletCounts.leftCount !== undefined) ? walletCounts.leftCount : '-'},
        {icon:'👥➡️', label:'Right Wallet Count', key:'right-wallet-count', userIndex: user && user.index ? user.index : 1n, val:(walletCounts && walletCounts.rightCount !== undefined) ? walletCounts.rightCount : '-'}
     ];

    const popupEl = document.createElement('div');
    popupEl.id = 'network-user-popup';
    popupEl.style = `
      position: fixed; z-index: 10005; top: 50%; left: 50%;
      transform: translate(-50%, -50%) scale(0.8); 
      background: rgba(24,28,42,0.98);
      border-radius: 16px;
      box-sizing: border-box;
      font-family: 'Courier New', monospace; font-size: 0.9rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0,255,136,0.3);
      box-shadow: 0 8px 32px rgba(0,255,136,0.2);
      max-width: 90vw;
      max-height: 80vh;
      overflow: hidden;
      opacity: 0;`;
    
    // نمایش loading برای موجودی‌ها
    const balanceSpinner = '<div style="display:inline-block;width:12px;height:12px;border:2px solid #00ff88;border-radius:50%;border-top-color:transparent;animation:spin 1s linear infinite;margin-right:5px;"></div>';
    
         popupEl.innerHTML = `
       <style>
         .floating-typewriter {
           padding: 20px;
           color: #00ff88;
            direction: ltr;
            text-align: left;
           line-height: 1.4;
           min-width: 350px;
           max-width: 700px;
           width: auto;
           height: auto;
           overflow: hidden;
           font-family: 'Courier New', monospace;
           background: #0c0c0c;
           border: 1px solid #00ff88;
         }
         .typewriter-header {
           color: #00ff88;
           font-weight: bold;
           font-size: 1rem;
           margin-bottom: 15px;
            text-align: left;
           border-bottom: 1px solid #00ff88;
           padding-bottom: 8px;
           display: flex;
           justify-content: space-between;
           align-items: center;
         }
         
         .typewriter-line {
           margin-bottom: 2px;
           opacity: 0;
            animation: fadeInLine 0.15s ease forwards;
           white-space: nowrap;
           overflow: hidden;
           font-size: 0.9rem;
         }
                   .typewriter-line.typing {
             border-left: 2px solid #00ff88;
            animation: blink 1s infinite, fadeInLine 0.3s ease forwards;
            position: relative;
          }
          .typewriter-line.typing::after {
            content: '';
            position: absolute;
             left: -2px;
            top: 0;
            width: 2px;
            height: 100%;
            background-color: #00ff88;
            animation: blink 1s infinite;
          }
         .typewriter-line.completed {
            border-left: none;
           white-space: normal;
         }
         @keyframes fadeInLine {
           from {
             opacity: 0;
              transform: translateY(2px);
           }
           to {
             opacity: 1;
             transform: translateY(0);
           }
         }
         @keyframes blink {
           0%, 50% { border-color: #00ff88; }
           51%, 100% { border-color: transparent; }
         }
         @keyframes expandPopup {
           from {
             transform: translate(-50%, -50%) scale(0.8);
             opacity: 0;
           }
           to {
             transform: translate(-50%, -50%) scale(1);
             opacity: 1;
           }
         }
         @media (max-width: 768px) {
           .floating-typewriter {
             padding: 15px;
             font-size: 0.8rem;
             min-width: 300px;
           }
         }
       </style>
               <div class="floating-typewriter">
          <div class="typewriter-header">
            <span>USER INFO - ${shortAddress(walletAddress)}</span>
          </div>
          <div id="typewriter-content"></div>
        </div>
     `;
    document.body.appendChild(popupEl);
    
              // نمایش پاپ‌آپ با انیمیشن expand
     setTimeout(() => {
       popupEl.style.animation = 'expandPopup 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
       popupEl.style.transform = 'translate(-50%, -50%) scale(1)';
       popupEl.style.opacity = '1';
       
       // بعد از expand شدن پاپ‌آپ، تایپ‌رایتر را شروع کن
       setTimeout(() => {
         // اضافه کردن قابلیت‌های موبایل پاپ‌آپ
         setupMobilePopupFeatures(popupEl);
         
         // شروع تایپ‌رایتر
         startTypewriter(popupEl, IAMId, walletAddress, isActive, infoList, address);
       }, 400); // صبر کن تا انیمیشن expand تمام شود
     }, 50);
    
         // بستن با کلیک خارج از کارت
     popupEl.addEventListener('click', function(e){ 
       if (e.target === popupEl) {
         popupEl.style.transform = 'translate(-50%, -50%) scale(0.8)';
         popupEl.style.opacity = '0';
         setTimeout(() => {
           popupEl.remove();
           // ریست کردن متغیرهای تکرار برای popup بعدی
           _networkPopupOpening = false;
         }, 300);
       }
     });
     
     // جلوگیری از بسته شدن با کلیک روی محتوا
     const typewriterEl = popupEl.querySelector('.floating-typewriter');
     if (typewriterEl) { 
       typewriterEl.addEventListener('click', function(e){ 
         e.stopPropagation(); 
       }); 
     }
     
     // اضافه کردن event listener برای کلیک روی backdrop
     function closePopup(e) {
       if (e.target === popupEl || !popupEl.contains(e.target)) {
         popupEl.style.transform = 'translate(-50%, -50%) scale(0.8)';
         popupEl.style.opacity = '0';
         setTimeout(() => {
           popupEl.remove();
           document.removeEventListener('click', closePopup);
           // ریست کردن متغیرهای تکرار برای popup بعدی
           _networkPopupOpening = false;
         }, 300);
       }
     }
     
     // تاخیر کوتاه برای جلوگیری از بسته شدن فوری
     setTimeout(() => {
       document.addEventListener('click', closePopup);
     }, 100);
    


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

    // به‌روزرسانی غیرمسدودکننده تعداد ولت‌های چپ/راست پس از رندر اولیه
    setTimeout(() => {
      (async () => {
        try {
          if (user && user.index && window.contractConfig && window.contractConfig.contract) {
            const counts = await calculateWalletCounts(user.index, window.contractConfig.contract);
            const leftLi = document.querySelector('.user-info-list li[data-key="left-wallet-count"] .value');
            const rightLi = document.querySelector('.user-info-list li[data-key="right-wallet-count"] .value');
            if (leftLi) leftLi.textContent = counts.leftCount;
            if (rightLi) rightLi.textContent = counts.rightCount;
            // نمایش همه مقادیر حتی اگر صفر باشند
            const leftWrap = document.querySelector('.user-info-list li[data-key="left-wallet-count"]');
            const rightWrap = document.querySelector('.user-info-list li[data-key="right-wallet-count"]');
            if (leftWrap) leftWrap.style.display = 'flex';
            if (rightWrap) rightWrap.style.display = 'flex';
          }
        } catch (e) {
          // در صورت خطا، آیتم‌ها را نمایش بده با علامت خطا
          const leftWrap = document.querySelector('.user-info-list li[data-key="left-wallet-count"]');
          const rightWrap = document.querySelector('.user-info-list li[data-key="right-wallet-count"]');
          const leftLi = document.querySelector('.user-info-list li[data-key="left-wallet-count"] .value');
          const rightLi = document.querySelector('.user-info-list li[data-key="right-wallet-count"] .value');
          if (leftLi) leftLi.textContent = '❌';
          if (rightLi) rightLi.textContent = '❌';
          if (leftWrap) leftWrap.style.display = 'flex';
          if (rightWrap) rightWrap.style.display = 'flex';
        }
      })();
    }, 0);

    // دریافت موجودی‌های زنده
    if (walletAddress !== '-') {
        (async () => {
            try {
                const { contract, provider } = await window.connectWallet();
                let IAM = '-', dai = '-', matic = '-';
                if (contract && typeof contract.balanceOf === 'function') {
                    try { const c = await contract.balanceOf(walletAddress); IAM = Number(ethers.formatEther(c)).toFixed(4); } catch {}
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
                const IAMWrapA = document.getElementById('IAM-balance');
                const maticWrapA = document.getElementById('matic-balance');
                const daiWrapA = document.getElementById('dai-balance');
                const IAMElA = document.querySelector('#IAM-balance .balance-value');
                const maticElA = document.querySelector('#matic-balance .balance-value');
                const daiElA = document.querySelector('#dai-balance .balance-value');
                if (IAMElA) IAMElA.textContent = IAM;
                if (maticElA) maticElA.textContent = matic;
                if (daiElA) daiElA.textContent = dai;
                // نمایش همه موجودی‌ها حتی اگر صفر باشند
                if (IAMWrapA) IAMWrapA.style.display = 'inline-flex';
                if (maticWrapA) maticWrapA.style.display = 'inline-flex';
                if (daiWrapA) daiWrapA.style.display = 'inline-flex';
            } catch (error) {
                console.warn('Error fetching balances (fallback):', error);
                const IAMWrapB = document.getElementById('IAM-balance');
                const maticWrapB = document.getElementById('matic-balance');
                const daiWrapB = document.getElementById('dai-balance');
                const IAMElB = document.querySelector('#IAM-balance .balance-value');
                const maticElB = document.querySelector('#matic-balance .balance-value');
                const daiElB = document.querySelector('#dai-balance .balance-value');
                if (IAMElB) IAMElB.textContent = '❌';
                if (maticElB) maticElB.textContent = '❌';
                if (daiElB) daiElB.textContent = '❌';
                // نمایش همه موجودی‌ها حتی در صورت خطا
                if (IAMWrapB) IAMWrapB.style.display = 'inline-flex';
                if (maticWrapB) maticWrapB.style.display = 'inline-flex';
                if (daiWrapB) daiWrapB.style.display = 'inline-flex';
            }
        })();
    } else {
        document.querySelector('#IAM-balance .balance-value').textContent = '-';
        document.querySelector('#matic-balance .balance-value').textContent = '-';
        document.querySelector('#dai-balance .balance-value').textContent = '-';
    }

    async function getLiveBalances(addr) {
        let IAM = '-', dai = '-', matic = '-';
        try {
            const { contract, provider } = await window.connectWallet();
            
            // دریافت موجودی IAM
            if (contract && typeof contract.balanceOf === 'function') {
                try {
                    let IAMRaw = await contract.balanceOf(addr);
                    IAM = (typeof ethers !== 'undefined') ? Number(ethers.formatEther(IAMRaw)).toFixed(2) : (Number(IAMRaw)/1e18).toFixed(2);
                } catch(e) {
                    console.warn('خطا در دریافت موجودی IAM:', e);
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
        return {IAM, dai, matic};
    }

    // به‌روزرسانی غیرمسدودکننده بعد از رندر
    setTimeout(() => {
      (async function() {
          const {IAM, dai, matic} = await getLiveBalances(address);
          const listItems = document.querySelectorAll('.user-info-list li');
          listItems.forEach(item => {
              const text = item.textContent;
              if (text.includes('🟢 IAM:')) {
                  item.innerHTML = item.innerHTML.replace(/🟢 <b>IAM:<\/b> [^<]*/, `🟢 <b>IAM:</b> ${IAM}`);
              } else if (text.includes('🟣 MATIC:')) {
                  item.innerHTML = item.innerHTML.replace(/🟣 <b>MATIC:<\/b> [^<]*/, `🟣 <b>MATIC:</b> ${matic}`);
              } else if (text.includes('💵 DAI:')) {
                  item.innerHTML = item.innerHTML.replace(/💵 <b>DAI:<\/b> [^<]*/, `💵 <b>DAI:</b> ${dai}`);
              }
          });
      })();
    }, 0);
};

// New function: Simple vertical render with lazy loading - ALL NODES CAN EXPAND
async function renderVerticalNodeLazy(index, container, level = 0, autoExpand = false) {
    // No depth limit - render all levels
    // Removed depth limit check for unlimited tree rendering
    
    // No concurrent render limit - unlimited tree expansion
    // Removed concurrent render check for unlimited tree depth
    
    activeRenders++;
    console.log(`🔄 renderVerticalNodeLazy called with index: ${index}, level: ${level}, active renders: ${activeRenders}`);
    
    try {
        console.log('🔄 Getting contract connection...');
        const { contract } = await window.connectWallet();
        if (!contract) throw new Error('No contract connection available');
        console.log('✅ Contract connection obtained');
        
        // No caching - always fetch fresh data
        // Always fetch fresh data - no caching
            console.log(`🔄 Getting address for index: ${index}`);
        let address = null;
            try {
            address = await contract.indexToAddress(index);
            } catch (error) {
                console.error('Error getting address for index:', index, error);
                address = null;
        }
        console.log('✅ Address obtained:', address);
        
        if (!address || address === '0x0000000000000000000000000000000000000000') {
            console.log('⚠️ Empty address, skipping node');
            return;
        }
        
        console.log('🔄 Getting user data for address:', address);
        let user = null;
            try {
                // Add timeout to prevent hanging
                const userPromise = contract.users(address);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('User data fetch timeout')), 60000)
                );
                user = await Promise.race([userPromise, timeoutPromise]);
            } catch(e) {
            console.error('Error getting user data:', e);
            throw new Error('Failed to fetch user data from contract');
        }
        console.log('✅ User data obtained:', user);
        
        if (!user) {
            console.log('⚠️ No user data, skipping node');
            return;
        }
        // Get real directs with getUserTree
        let leftUser = null, rightUser = null, hasDirects = false;
        let tree = null;
        let leftActive = false, rightActive = false;
        if (typeof contract.getUserTree === 'function') {
            try {
                // Add timeout to prevent hanging
                const treePromise = contract.getUserTree(address);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('User tree fetch timeout')), 60000)
                );
                tree = await Promise.race([treePromise, timeoutPromise]);
            } catch(e) { 
                console.warn('Error getting user tree, using fallback:', e);
                tree = { left:'0x0000000000000000000000000000000000000000', right:'0x0000000000000000000000000000000000000000' }; 
            }
            
            if (tree.left && tree.left !== '0x0000000000000000000000000000000000000000') {
                try {
                    const leftUserPromise = contract.users(tree.left);
                    const leftTimeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Left user fetch timeout')), 60000)
                    );
                    leftUser = await Promise.race([leftUserPromise, leftTimeoutPromise]);
                    if (leftUser && leftUser.index && BigInt(leftUser.index) > 0n) { 
                        hasDirects = true; 
                        leftActive = true; 
                        console.log(`✅ Left child active for node ${index}, leftUser.index: ${leftUser.index}`);
                    } else {
                        console.log(`❌ Left child not active for node ${index}, leftUser:`, leftUser);
                    }
                } catch(e) {
                    console.warn('Error getting left user, skipping:', e);
                    leftUser = { index:0n };
                }
            }
            if (tree.right && tree.right !== '0x0000000000000000000000000000000000000000') {
                try {
                    const rightUserPromise = contract.users(tree.right);
                    const rightTimeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Right user fetch timeout')), 60000)
                    );
                    rightUser = await Promise.race([rightUserPromise, rightTimeoutPromise]);
                    if (rightUser && rightUser.index && BigInt(rightUser.index) > 0n) { 
                        hasDirects = true; 
                        rightActive = true; 
                        console.log(`✅ Right child active for node ${index}, rightUser.index: ${rightUser.index}`);
                    } else {
                        console.log(`❌ Right child not active for node ${index}, rightUser:`, rightUser);
                    }
                } catch(e) {
                    console.warn('Error getting right user, skipping:', e);
                    rightUser = { index:0n };
                }
            }
        }
        // Create vertical node (same as before)
        let nodeDiv = document.createElement('div');
        nodeDiv.style.display = 'inline-flex';
        nodeDiv.style.alignItems = 'center';
        nodeDiv.style.justifyContent = 'flex-start';
        nodeDiv.style.flexWrap = 'nowrap';
        // Base spacing (levels closer and without fixed indentation)
        nodeDiv.style.marginRight = '0px';
        nodeDiv.style.marginBottom = '0.9em';
        nodeDiv.style.position = 'relative';
        nodeDiv.style.overflow = 'visible';
                 nodeDiv.style.background = getNodeColorByLevel(level, true, index);
                 nodeDiv.style.borderRadius = '12px';
         nodeDiv.style.border = '1px solid rgba(255, 255, 255, 0.1)';
         nodeDiv.style.backdropFilter = 'blur(10px)';
         nodeDiv.style.webkitBackdropFilter = 'blur(10px)';
         nodeDiv.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
         nodeDiv.style.transform = 'translateZ(0)';
         
         const IAMId = window.generateIAMId ? window.generateIAMId(user.index) : user.index;
         const formattedIAMId = `IAM${String(IAMId).padStart(5, '0')}`;
         // Responsive node sizing - Larger, more visible sizes
        const isMobile = window.innerWidth <= 480;
        const isTablet = window.innerWidth <= 768;
        
        if (isMobile) {
            nodeDiv.style.padding = '0.3em 0.6em';
        nodeDiv.style.width = 'auto';
            nodeDiv.style.minWidth = '80px';
            nodeDiv.style.maxWidth = '120px';
            nodeDiv.style.height = '35px';
            nodeDiv.style.minHeight = '35px';
            nodeDiv.style.maxHeight = '35px';
            nodeDiv.style.fontSize = '0.8em';
        } else if (isTablet) {
            nodeDiv.style.padding = '0.4em 0.8em';
            nodeDiv.style.width = 'auto';
            nodeDiv.style.minWidth = '100px';
            nodeDiv.style.maxWidth = '150px';
            nodeDiv.style.height = '40px';
            nodeDiv.style.minHeight = '40px';
            nodeDiv.style.maxHeight = '40px';
            nodeDiv.style.fontSize = '0.9em';
        } else {
            nodeDiv.style.padding = '0.5em 1em';
            nodeDiv.style.width = 'auto';
            nodeDiv.style.minWidth = '120px';
            nodeDiv.style.maxWidth = '180px';
            nodeDiv.style.height = '45px';
            nodeDiv.style.minHeight = '45px';
            nodeDiv.style.maxHeight = '45px';
            nodeDiv.style.fontSize = '1em';
        }
        
        nodeDiv.style.color = '#00ff88';
        nodeDiv.style.fontFamily = 'monospace';
        nodeDiv.style.boxShadow = '0 4px 16px rgba(0,255,136,0.10)';
        nodeDiv.style.cursor = 'pointer';
        nodeDiv.title = 'Click to view user information';
        nodeDiv.style.transition = 'background 0.2s, box-shadow 0.2s';
        nodeDiv.style.whiteSpace = 'nowrap';
        nodeDiv.onmouseover = function() { 
            this.style.transform = 'translateZ(0) scale(1.05)';
            this.style.boxShadow = '0 8px 32px rgba(0, 255, 136, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)';
            this.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        };
        nodeDiv.onmouseout = function() { 
            this.style.background = getNodeColorByLevel(level, true, index); 
            this.style.transform = 'translateZ(0) scale(1)';
            this.style.boxShadow = '0 4px 16px rgba(0,255,136,0.10)';
            this.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        };
        nodeDiv.innerHTML = `
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 1.1em; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-weight: bold;">${IAMId}</span>
        `;
        

        
                          // Expand/collapse button for ALL REGISTERED NODES - LAZY LOADING FOR ALL NODES
         // let expandBtn = null; // Removed - using const expandBtn below
         let childrenDiv = null;
         // Add expand button for ALL registered nodes (not just those with directs)
                 // Expand button removed - just show content area
        
        // Create two-part button: expand + index
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.alignItems = 'stretch';
        buttonContainer.style.width = 'auto';
        buttonContainer.style.minWidth = isMobile ? '80px' : isTablet ? '100px' : '120px';
        buttonContainer.style.height = isMobile ? '35px' : isTablet ? '40px' : '45px';
        buttonContainer.style.borderRadius = isMobile ? '6px' : isTablet ? '8px' : '10px';
        buttonContainer.style.overflow = 'hidden';
        buttonContainer.style.cursor = 'pointer';
        buttonContainer.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        buttonContainer.style.boxShadow = '0 4px 16px rgba(255, 193, 7, 0.3)';
        
        // Part 1: Expand button (small part)
        const expandBtn = document.createElement('button');
         expandBtn.textContent = '▸';
        expandBtn.style.width = isMobile ? '20px' : isTablet ? '25px' : '30px';
        expandBtn.style.height = '100%';
        expandBtn.style.background = 'linear-gradient(135deg, #ffc107, #ff8f00)';
         expandBtn.style.border = 'none';
        expandBtn.style.borderRight = '1px solid rgba(255, 255, 255, 0.2)';
        expandBtn.style.color = '#000';
        expandBtn.style.fontSize = isMobile ? '0.7em' : isTablet ? '0.8em' : '0.9em';
        expandBtn.style.fontWeight = 'bold';
         expandBtn.style.cursor = 'pointer';
        expandBtn.style.display = 'flex';
        expandBtn.style.alignItems = 'center';
        expandBtn.style.justifyContent = 'center';
        expandBtn.style.outline = 'none';
        expandBtn.style.transition = 'all 0.3s ease';
        expandBtn.setAttribute('data-expanded', 'false');
        
        // Part 2: Index display (large part)
        const indexDisplay = document.createElement('div');
        indexDisplay.textContent = formattedIAMId;
        indexDisplay.style.flex = '1';
        indexDisplay.style.padding = isMobile ? '0.3em 0.6em' : isTablet ? '0.4em 0.8em' : '0.5em 1em';
        indexDisplay.style.background = 'linear-gradient(135deg, #ffc107, #ff8f00)';
        indexDisplay.style.color = '#000';
        indexDisplay.style.fontFamily = 'monospace';
        indexDisplay.style.fontSize = isMobile ? '0.8em' : isTablet ? '0.9em' : '1em';
        indexDisplay.style.fontWeight = 'bold';
        indexDisplay.style.display = 'flex';
        indexDisplay.style.alignItems = 'center';
        indexDisplay.style.justifyContent = 'center';
        indexDisplay.style.overflow = 'hidden';
        indexDisplay.style.textOverflow = 'ellipsis';
        indexDisplay.style.whiteSpace = 'nowrap';
        
        // Assemble the button
        buttonContainer.appendChild(expandBtn);
        buttonContainer.appendChild(indexDisplay);
        
        // Add hover effects
        buttonContainer.addEventListener('mouseenter', function() {
            this.style.transform = 'translateZ(0) scale(1.05)';
            this.style.boxShadow = '0 8px 32px rgba(255, 193, 7, 0.5), 0 4px 16px rgba(0, 0, 0, 0.2)';
        });
        
        buttonContainer.addEventListener('mouseleave', function() {
            this.style.transform = 'translateZ(0) scale(1)';
            this.style.boxShadow = '0 4px 16px rgba(255, 193, 7, 0.3)';
        });
        
        // Add click handler for expand button
        expandBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Toggle expand/collapse state
            const isExpanded = this.getAttribute('data-expanded') === 'true';
            
            if (isExpanded) {
                // Collapse
                this.textContent = '▸';
                this.setAttribute('data-expanded', 'false');
                buttonContainer.style.background = 'linear-gradient(135deg, #ffc107, #ff8f00)';
                console.log('Node collapsed:', formattedIAMId);
            } else {
                // Expand
                this.textContent = '▾';
                this.setAttribute('data-expanded', 'true');
                buttonContainer.style.background = 'linear-gradient(135deg, #ff8f00, #ffc107)';
                console.log('Node expanded:', formattedIAMId);
            }
        });
        
        // Add click handler for index display
        indexDisplay.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Index clicked:', formattedIAMId);
            if (window.showUserPopup) {
                window.showUserPopup(user.address, user);
            }
        });
        
        nodeDiv.prepend(buttonContainer);
        
                 // Remove + button completely - no + buttons on any nodes
         console.log(`🔍 Node ${index}: leftActive=${leftActive}, rightActive=${rightActive}, hasDirects=${hasDirects}`);
         console.log(`❌ No + button for node ${index} - + buttons removed from all nodes`);
        // Expand button functionality removed
        /*
        if (expandBtn) {
            expandBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('🔘 Expand button clicked for node:', index);
                
                // Check if children div already exists in the container
                let existingChildrenDiv = container.querySelector(`.children-div[data-parent-index="${index}"]`);
                console.log('🔍 Looking for existing children div in container for index:', index);
                console.log('🔍 Found existing children div:', !!existingChildrenDiv);
                
                // Lazy loading: Only render children when expand button is clicked
                if (!existingChildrenDiv) {
                    console.log('🔄 Creating children div for first time...');
                    // Transform node into progress bar
                    const originalContent = nodeDiv.innerHTML;
                    const originalBackground = nodeDiv.style.background;
                    const originalBoxShadow = nodeDiv.style.boxShadow;
                    const originalColor = nodeDiv.style.color;
                    
                    // Create progress bar effect
                    const progressContent = `
                        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; border-radius: 12px;">
                            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, #00ff88, #a786ff); opacity: 0.3; animation: progressShimmer 1.5s ease-in-out infinite;"></div>
                            <div style="position: relative; z-index: 2; color: #00ff88; font-weight: bold; font-size: 1.1em; display: flex; align-items: center; gap: 8px;">
                                <div style="width: 16px; height: 16px; border: 2px solid #00ff88; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                                <span>Loading...</span>
                            </div>
                        </div>
                    `;
                    
                    // Clear node content but preserve the expand button
                    const expandButton = nodeDiv.querySelector('button');
                    nodeDiv.innerHTML = progressContent;
                    if (expandButton) {
                        nodeDiv.prepend(expandButton);
                    }
                    
                    // Update node styling for progress state
                    nodeDiv.style.background = 'rgba(0, 255, 136, 0.1)';
                    nodeDiv.style.boxShadow = '0 4px 16px rgba(0, 255, 136, 0.3)';
                    nodeDiv.style.color = '#00ff88';
                    nodeDiv.style.cursor = 'default';
                    
                    // Disable hover effects during loading
                    nodeDiv.onmouseover = null;
                    nodeDiv.onmouseout = null;
                    
                    // Create children div and render children for the first time
                    childrenDiv = document.createElement('div');
                    childrenDiv.className = 'children-div';
                    childrenDiv.setAttribute('data-parent-index', index.toString());
                    childrenDiv.style.transition = 'all 0.3s';
                    childrenDiv.style.display = 'none'; // Start hidden
                    childrenDiv.style.marginTop = '0.5em'; // Add spacing from parent
                    childrenDiv.style.marginRight = '0px'; // Ensure no right margin on container
                    childrenDiv.style.flexDirection = 'column';
                    childrenDiv.style.alignItems = 'flex-start'; // Align children to the start
                    container.appendChild(childrenDiv);
                    console.log('✅ Created children div with parent index:', index);
                    
                    // Render children nodes
                        try {
                        console.log('🔄 Starting to render children...');
                        
                        // Create all rows first (both active and empty) in correct order
                        const leftRow = document.createElement('div');
                        leftRow.className = 'child-node-row left-row';
                        leftRow.style.display = 'block';
                        leftRow.style.marginBottom = '0.3em';
                        leftRow.style.width = '100%';
                        
                        const rightRow = document.createElement('div');
                        rightRow.className = 'child-node-row right-row';
                        rightRow.style.display = 'block';
                        rightRow.style.marginBottom = '0.3em';
                        rightRow.style.width = '100%';
                        
                        // Add rows to children div in correct order (left first, then right)
                        childrenDiv.appendChild(leftRow);
                        childrenDiv.appendChild(rightRow);
                        
                        // Now render content in each row based on availability
                        if (leftActive) {
                            console.log('🔄 Rendering left child...');
                            await renderVerticalNodeLazy(BigInt(leftUser.index), leftRow, level + 1, false);
                            console.log('✅ Left child rendered');
                        } else {
                            console.log('🔄 Creating empty left slot...');
                            await renderEmptySlot(index * 2n, leftRow, level + 1);
                            console.log('✅ Left empty slot created');
                        }
                        
                        if (rightActive) {
                            console.log('🔄 Rendering right child...');
                            await renderVerticalNodeLazy(BigInt(rightUser.index), rightRow, level + 1, false);
                            console.log('✅ Right child rendered');
                        } else {
                            console.log('🔄 Creating empty right slot...');
                            await renderEmptySlot(index * 2n + 1n, rightRow, level + 1);
                            console.log('✅ Right empty slot created');
                        }
                        
                        // Align all cross nodes from the front after all children are rendered
                        alignCrossNodes(childrenDiv, level + 1);
                        
                        console.log('✅ All children rendered successfully');
                            
                            // Restore original node appearance after rendering is complete
                            nodeDiv.innerHTML = originalContent;
                            nodeDiv.style.background = originalBackground;
                            nodeDiv.style.boxShadow = originalBoxShadow;
                            nodeDiv.style.color = originalColor;
                            nodeDiv.style.cursor = 'pointer';
                            
                            // Restore hover effects
                            nodeDiv.onmouseover = function() { 
                                this.style.transform = 'translateZ(0) scale(1.05)';
                                this.style.boxShadow = '0 8px 32px rgba(0, 255, 136, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)';
                                this.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                            };
                            nodeDiv.onmouseout = function() { 
                                this.style.background = getNodeColorByLevel(level, true, index); 
                                this.style.transform = 'translateZ(0) scale(1)';
                                this.style.boxShadow = '0 4px 16px rgba(0,255,136,0.10)';
                                this.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                            };
                            
                        // Now show the children div after rendering is complete
                        childrenDiv.style.display = 'flex';
                        expandBtn.textContent = '▾';
                        expandBtn.style.transform = 'rotate(0deg)';
                        expandBtn.setAttribute('data-expanded', 'true');
                        console.log('✅ Children displayed after rendering');
                        
                        } catch (error) {
                            console.error('Error rendering children:', error);
                            
                            // Restore original node appearance even if there's an error
                            nodeDiv.innerHTML = originalContent;
                            nodeDiv.style.background = originalBackground;
                            nodeDiv.style.boxShadow = originalBoxShadow;
                            nodeDiv.style.color = originalColor;
                            nodeDiv.style.cursor = 'pointer';
                            
                            // Restore hover effects
                            nodeDiv.onmouseover = function() { 
                                this.style.transform = 'translateZ(0) scale(1.05)';
                                this.style.boxShadow = '0 8px 32px rgba(0, 255, 136, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)';
                                this.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                            };
                            nodeDiv.onmouseout = function() { 
                                this.style.background = getNodeColorByLevel(level, true, index); 
                                this.style.transform = 'translateZ(0) scale(1)';
                                this.style.boxShadow = '0 4px 16px rgba(0,255,136,0.10)';
                                this.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                            };
                        
                        // Don't show children if there was an error
                        expandBtn.textContent = '▸';
                        expandBtn.style.transform = 'rotate(0deg)';
                        expandBtn.setAttribute('data-expanded', 'false');
                        console.log('❌ Children not displayed due to error');
                    }
                } else {
                    // Toggle display for existing children div
                    const isExpanded = expandBtn.getAttribute('data-expanded') === 'true';
                    console.log('🔄 Toggle expand/collapse - Current state:', isExpanded);
                    console.log('🔍 existingChildrenDiv found:', !!existingChildrenDiv);
                    
                    if (existingChildrenDiv) {
                        console.log('🔍 existingChildrenDiv display before:', existingChildrenDiv.style.display);
                        
                        if (!isExpanded) {
                            existingChildrenDiv.style.display = 'flex';
                            expandBtn.textContent = '▾';
                            expandBtn.style.transform = 'rotate(0deg)';
                            expandBtn.setAttribute('data-expanded', 'true');
                            console.log('✅ Expanded node');
                        } else {
                            existingChildrenDiv.style.display = 'none';
                            expandBtn.textContent = '▸';
                            expandBtn.style.transform = 'rotate(0deg)';
                            expandBtn.setAttribute('data-expanded', 'false');
                            console.log('✅ Collapsed node');
                        }
                        
                        console.log('🔍 existingChildrenDiv display after:', existingChildrenDiv.style.display);
                    } else {
                        console.log('❌ existingChildrenDiv not found, trying to find it again...');
                        // Try to find the children div again with multiple selectors
                        let foundChildrenDiv = container.querySelector(`.children-div[data-parent-index="${index}"]`);
                        if (!foundChildrenDiv) {
                            // Try to find it in the parent container
                            foundChildrenDiv = container.parentElement?.querySelector(`.children-div[data-parent-index="${index}"]`);
                        }
                        if (!foundChildrenDiv) {
                            // Try to find it by looking for the next sibling
                            const nextSibling = container.nextElementSibling;
                            if (nextSibling && nextSibling.classList.contains('children-div') && nextSibling.getAttribute('data-parent-index') === index.toString()) {
                                foundChildrenDiv = nextSibling;
                            }
                        }
                        if (!foundChildrenDiv) {
                            // Last resort: find any children div in the container
                            foundChildrenDiv = container.querySelector('.children-div');
                        }
                        
                        if (foundChildrenDiv) {
                            console.log('✅ Found children div on second attempt');
                            if (!isExpanded) {
                                foundChildrenDiv.style.display = 'flex';
                                expandBtn.textContent = '▾';
                                expandBtn.style.transform = 'rotate(0deg)';
                                expandBtn.setAttribute('data-expanded', 'true');
                                console.log('✅ Expanded node (second attempt)');
                            } else {
                                foundChildrenDiv.style.display = 'none';
                                expandBtn.textContent = '▸';
                                expandBtn.style.transform = 'rotate(0deg)';
                                expandBtn.setAttribute('data-expanded', 'false');
                                console.log('✅ Collapsed node (second attempt)');
                            }
                        } else {
                            console.log('❌ Still cannot find children div - recreating...');
                            // If we still can't find it, recreate the children div
                            expandBtn.setAttribute('data-expanded', 'false');
                            expandBtn.textContent = '▸';
                            expandBtn.style.transform = 'rotate(0deg)';
                        }
                    }
                }
            });
        }
        */
        
        // Add click event listener to the node div for user info
        nodeDiv.addEventListener('click', function(e) {
            // Make the entire node clickable to show user info
            if (typeof window.networkShowUserPopup === 'function') {
                window.networkShowUserPopup(address, user);
            }
        });
        container.appendChild(nodeDiv);
        
        // Save/update node in local cache for future loads
        if (window.saveOrUpdateNetworkNode || window.saveNetworkNode) {
            try {
                const nodeData = {
                    index: index.toString(),
                    address: address,
                    IAMId: IAMId,
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
                        lvlBalance: 'Loading...',
                        maticBalance: 'Loading...',
                        daiBalance: 'Loading...',
                        leftPoints: user.leftPoints,
                        rightPoints: user.rightPoints
                    }
                };
                if (window.saveOrUpdateNetworkNode) {
                    await window.saveOrUpdateNetworkNode(nodeData);
                } else {
                    await window.saveNetworkNode(nodeData);
                }
            } catch (error) {
                console.warn('⚠️ Error saving node to database:', error);
            }
        }
        
        // Helper tool: Set dynamic indentation based on half width of child node
        function setDynamicIndent(wrapperDiv) {
            if (!wrapperDiv) return;
            const apply = () => {
                const childEl = wrapperDiv.firstElementChild;
                if (childEl && typeof childEl.getBoundingClientRect === 'function') {
                    const w = childEl.getBoundingClientRect().width || 160;
                    wrapperDiv.style.marginRight = Math.round(w / 2) + 'px';
                }
            };
            // Wait until after layout
            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(() => requestAnimationFrame(apply));
            } else {
                setTimeout(apply, 0);
            }
        }

        // Helper tool: Align cross nodes from the front
        function alignCrossNodes(childrenDiv, level) {
            if (!childrenDiv) return;
            
            const apply = () => {
                const childRows = childrenDiv.querySelectorAll('.child-node-row');
                if (childRows.length === 0) return;
                
                // Find the maximum indentation needed for proper alignment
                let maxIndent = 0;
                let maxNodeWidth = 0;
                
                childRows.forEach(row => {
                    const childEl = row.firstElementChild;
                    if (childEl && typeof childEl.getBoundingClientRect === 'function') {
                        const rect = childEl.getBoundingClientRect();
                        const w = rect.width || 160;
                        maxNodeWidth = Math.max(maxNodeWidth, w);
                        
                        // Calculate indentation based on node width
                        const currentIndent = Math.round(w / 2);
                        maxIndent = Math.max(maxIndent, currentIndent);
                    }
                });
                
                // Apply consistent indentation to all child rows
                childRows.forEach(row => {
                    row.style.marginRight = maxIndent + 'px';
                    row.style.position = 'relative';
                    
                    // Ensure the child node is properly positioned
                    const childEl = row.firstElementChild;
                    if (childEl) {
                        childEl.style.position = 'relative';
                        childEl.style.left = '0px';
                    }
                });
                
                console.log(`🎯 Aligned ${childRows.length} cross nodes at level ${level} with indent: ${maxIndent}px, max node width: ${maxNodeWidth}px`);
            };
            
            // Wait until after layout with multiple frames for better accuracy
            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(apply);
                    });
                });
            } else {
                setTimeout(apply, 50);
            }
        }

        // Children div will be created lazily when expand button is clicked
        // No pre-rendering of children - they will be created on-demand
        // Empty slots will be created in the children area instead of N button on parent
        console.log(`🔍 Node ${index}: leftActive=${leftActive}, rightActive=${rightActive}, has empty slots=${!leftActive || !rightActive}`);
    } catch (error) {
        console.error('Error in renderVerticalNodeLazy:', error);
        // Skip rendering this node on error
    } finally {
        activeRenders--;
        console.log(`✅ renderVerticalNodeLazy completed for index: ${index}, level: ${level}, active renders: ${activeRenders}`);
    }
}

// Render queue processing removed - unlimited concurrent rendering
// No queue needed since we have unlimited concurrent operations
 
 // Helper function to render empty slots
 async function renderEmptySlot(index, container, level) {
     console.log(`📝 Rendering empty slot for index: ${index} at level: ${level}`);
     
     const emptySlotDiv = document.createElement('div');
     emptySlotDiv.className = 'empty-slot-node';
     emptySlotDiv.setAttribute('data-index', index);
     emptySlotDiv.style.display = 'inline-flex';
     emptySlotDiv.style.alignItems = 'center';
     emptySlotDiv.style.justifyContent = 'center';
     emptySlotDiv.style.marginRight = '0px';
     emptySlotDiv.style.marginBottom = '0.9em';
     emptySlotDiv.style.background = 'linear-gradient(135deg, rgba(224, 224, 224, 0.8), rgba(200, 200, 200, 0.6)), linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))';
     emptySlotDiv.style.borderRadius = '10px';
     emptySlotDiv.style.padding = '0.5em 1em';
     emptySlotDiv.style.color = '#666';
     emptySlotDiv.style.fontFamily = 'monospace';
     emptySlotDiv.style.fontSize = '0.9em';
     emptySlotDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
     emptySlotDiv.style.opacity = '0.9';
     emptySlotDiv.style.border = '1px dashed rgba(150, 150, 150, 0.5)';
     emptySlotDiv.style.backdropFilter = 'blur(5px)';
     emptySlotDiv.style.webkitBackdropFilter = 'blur(5px)';
     emptySlotDiv.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
     emptySlotDiv.style.cursor = 'pointer';
     emptySlotDiv.title = 'Empty slot - Click to add new user';
     
     const IAMId = window.generateIAMId ? window.generateIAMId(index) : index;
     emptySlotDiv.innerHTML = `
         <span style="white-space: nowrap; font-size: 0.9em; display: flex; align-items: center; justify-content: center; font-weight: bold;">
             ${IAMId} (Empty)
         </span>
     `;
     
     emptySlotDiv.onmouseover = function() { 
         this.style.transform = 'translateZ(0) scale(1.02)';
         this.style.background = 'linear-gradient(135deg, rgba(240, 240, 240, 0.9), rgba(220, 220, 220, 0.7)), linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))';
         this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
         this.style.border = '1px dashed rgba(100, 100, 100, 0.7)';
     };
     emptySlotDiv.onmouseout = function() { 
         this.style.transform = 'translateZ(0) scale(1)';
         this.style.background = 'linear-gradient(135deg, rgba(224, 224, 224, 0.8), rgba(200, 200, 200, 0.6)), linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))';
         this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
         this.style.border = '1px dashed rgba(150, 150, 150, 0.5)';
     };
     
     // Add click event to show registration modal
     emptySlotDiv.addEventListener('click', async function(e) {
         e.stopPropagation();
         console.log(`🔘 Empty slot clicked for index: ${index}`);
         
         // Determine position (left or right)
         const parentIndex = index / 2n;
         const isLeft = index % 2n === 0n;
         const position = isLeft ? 'left' : 'right';
         
         try {
             await showRegistrationModal(parentIndex, index, position);
         } catch (error) {
             console.error('Error calling showRegistrationModal:', error);
         }
     });
     
     container.appendChild(emptySlotDiv);
 }
 
 // renderSimplifiedNode function removed - no depth limits anymore
// Function renderEmptyNodeVertical removed - empty slots are now handled by + buttons on parent nodes
// Replace main tree render with vertical model
window.renderSimpleBinaryTree = async function() {
    console.log('🔄 Starting renderSimpleBinaryTree...');
    const container = document.getElementById('network-tree');
    if (!container) {
        // Not on network page; silently skip to avoid noisy logs
        return;
    }
    console.log('✅ Network tree container found');
    
    // Initialize rendering
    
    container.innerHTML = '';
    container.style.overflow = 'auto';
    container.style.whiteSpace = 'normal';
    container.style.padding = '2rem 0';
    container.style.display = 'block';
    try {
        console.log('🔄 Connecting to wallet...');
        const { contract, address } = await window.connectWallet();
        if (!contract || !address) {
            throw new Error('اتصال کیف پول در دسترس نیست');
        }
        console.log('✅ Wallet connected, address:', address);
        console.log('🔄 Getting user data...');

        // Robust index detection for the connected address
        let user = null;
        let userIndex = 0n;
        try {
            user = await contract.users(address);
            if (user && typeof user.index !== 'undefined' && user.index !== null) {
                userIndex = BigInt(user.index);
            }
        } catch {}

        // Fallbacks if index not resolved via users(address)
        if (userIndex === 0n) {
            try {
                if (typeof contract.addressToIndex === 'function') {
                    const idx = await contract.addressToIndex(address);
                    if (idx) userIndex = BigInt(idx);
                }
            } catch {}
        }
        if (userIndex === 0n) {
            try {
                if (typeof contract.getUserIndex === 'function') {
                    const idx = await contract.getUserIndex(address);
                    if (idx) userIndex = BigInt(idx);
                }
            } catch {}
        }
        if (userIndex === 0n) {
            try {
                if (typeof contract.indexOf === 'function') {
                    const idx = await contract.indexOf(address);
                    if (idx) userIndex = BigInt(idx);
                }
            } catch {}
        }

        // If user index is zero, don't display tree
        let rootIndexToRender = userIndex;
        if (rootIndexToRender === 0n) {
            console.error('User index not found for connected wallet');
            throw new Error('کیف پول متصل در سیستم ثبت‌نام نشده است.');
        }

        console.log('✅ Rendering tree for index:', rootIndexToRender.toString());
        
        // In window.renderSimpleBinaryTree, autoExpand should only be true for root:
        console.log('🔄 Rendering vertical node...');
        await renderVerticalNodeLazy(rootIndexToRender, container, 0, true);
        console.log('✅ Vertical node rendered successfully');
        
        // Save tree to database after render
        if (window.saveCurrentNetworkTree) {
            setTimeout(async () => {
                try {
                    await window.saveCurrentNetworkTree();
                } catch (error) {
                    console.warn('⚠️ Error saving tree to database:', error);
                }
                          }, 2000); // Wait 2 seconds for render to complete
        }
    } catch (error) {
        console.error('❌ Error rendering binary tree:', error);
        
        let errorMessage = error.message;
        let actionButton = '';
        
        // If error is related to not being registered, show appropriate message
        if (error.message.includes('ثبت‌نام نشده')) {
            errorMessage = 'Connected wallet is not registered in the system. Please register first to view the network tree.';
            actionButton = `
                <br><br>
                <button onclick="window.location.href='register.html'" style="
                    background: linear-gradient(135deg, #00ff88, #00cc66);
                    color: #232946;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 1rem;
                ">📝 Register Now</button>
            `;
        }
        
        container.innerHTML = `
            <div style="color:#ff4444;text-align:center;padding:2rem;">
                ❌ خطا در بارگذاری tree<br>
                <small style="color:#ccc;">${errorMessage}</small>
                ${actionButton}
            </div>
        `;
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
        const hasNetworkContainer = typeof document !== 'undefined' && document.getElementById('network-tree');
        if (!hasNetworkContainer) return;
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
    const hasNetworkContainer = typeof document !== 'undefined' && document.getElementById('network-tree');
    if (!hasNetworkContainer) return;
    
    // پاک کردن درخت قبل از رندر جدید
    if (typeof window.clearBinaryTree === 'function') {
        window.clearBinaryTree();
    }
    
    // بررسی وجود container
    const container = document.getElementById('network-tree');
    if (!container) { return; }
    
    console.log('✅ Network tree container found');
    
    // Show loading status
            container.innerHTML = '<div style="color:#00ccff;text-align:center;padding:2rem;">🔄 Loading network tree...</div>';
    
    // Simple test to check connection
    try {
        console.log('🔄 Testing wallet connection...');
        const { contract, address } = await window.connectWallet();
        console.log('✅ Wallet connection test successful');
        console.log('Contract:', contract);
        console.log('Address:', address);
    } catch (error) {
        console.error('❌ Wallet connection test failed:', error);
        container.innerHTML = `<div style="color:#ff4444;text-align:center;padding:2rem;">❌ خطا در اتصال کیف پول<br><small style="color:#ccc;">${error.message}</small></div>`;
        return;
    }
    
            // Retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    const tryRender = async () => {
        try {
            if (typeof window.renderSimpleBinaryTree === 'function') {
                console.log(`🔄 Attempt ${retryCount + 1} to render network tree...`);
                await window.renderSimpleBinaryTree();
            } else {
                console.error('❌ renderSimpleBinaryTree function not found');
                container.innerHTML = '<div style="color:#ff4444;text-align:center;padding:2rem;">❌ Network render function not found</div>';
            }
        } catch (error) {
            console.error(`❌ Error initializing network tab (attempt ${retryCount + 1}):`, error);
            retryCount++;
            
            if (retryCount < maxRetries) {
                console.log(`🔄 Retrying in 2 seconds... (${retryCount}/${maxRetries})`);
                setTimeout(tryRender, 2000);
            } else {
                container.innerHTML = `
                    <div style="color:#ff4444;text-align:center;padding:2rem;">
                        ❌ Error loading network tree<br>
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
                        ">🔄 Try Again</button>
                    </div>
                `;
            }
        }
    };
    
    // Wait a bit for UI to fully load
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
      if (user && user.index && BigInt(user.index) > 0n) {
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
    if (user && user.index && BigInt(user.index) > 0n) {
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
  // No caching - tab state is not persisted
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
    `IAM ID:  ${window.generateIAMId ? window.generateIAMId(user.index) : user.index}`,
    `امتیاز باینری:  ${user.binaryPoints}`,
    `امتیاز باینری دریافت‌شده:  ${user.binaryPointsClaimed}`,
    `امتیاز باینری مانده:  ${user.binaryPoints && user.binaryPointsClaimed ? (Number(user.binaryPoints) - Number(user.binaryPointsClaimed)) : '0'}`,
    `سقف امتیاز:  ${user.binaryPointCap}`,
    `امتیاز چپ:  ${user.leftPoints}`,
    `امتیاز راست:  ${user.rightPoints}`,
    `پاداش رفرال:  ${user.refclimed ? Math.floor(Number(user.refclimed) / 1e18) : '0'}`,
    `موجودی IAM:  ${user.lvlBalance ? user.lvlBalance : '0'}`,
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

// تابع تنظیم قابلیت‌های موبایل پاپ‌آپ
function setupMobilePopupFeatures(popupEl) {
  let touchStartY = 0;
  let currentY = 0;
  let isScrolling = false;
  
  // تنظیم gesture برای موبایل با بهبود اسکرول
  popupEl.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    popupEl.style.transition = 'none';
    isScrolling = false;
  });

  popupEl.addEventListener('touchmove', (e) => {
    currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY;
    const scrollContainer = popupEl.querySelector('.popup-content');
    
    // بررسی اینکه آیا محتوا قابل اسکرول است
    if (scrollContainer) {
      const isAtTop = scrollContainer.scrollTop === 0;
      const isAtBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight;
      
      // اگر در بالای محتوا هستیم و به پایین می‌کشیم، یا در پایین محتوا هستیم و به بالا می‌کشیم
      if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
        e.preventDefault();
        popupEl.style.transform = `translateY(${deltaY}px)`;
      } else {
        // اجازه اسکرول در محتوا
        isScrolling = true;
      }
    } else {
      // اگر محتوای قابل اسکرول نداریم، فقط اجازه کشیدن به پایین
      if (deltaY > 0) {
        e.preventDefault();
        popupEl.style.transform = `translateY(${deltaY}px)`;
      }
    }
  });

     popupEl.addEventListener('touchend', () => {
     const deltaY = currentY - touchStartY;
     popupEl.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
     
     // فقط اگر اسکرول نکرده باشیم، پاپ‌آپ را ببندیم
     if (!isScrolling && deltaY > 100) {
       popupEl.style.transform = 'translate(-50%, -50%) scale(0.8)';
       popupEl.style.opacity = '0';
       setTimeout(() => popupEl.remove(), 300);
     } else {
       popupEl.style.transform = 'translate(-50%, -50%) scale(1)';
       popupEl.style.opacity = '1';
     }
   });
  
  // تنظیم event listeners برای کارت‌های قابل گسترش
  setupExpandableCards(popupEl);
}

// تابع تنظیم کارت‌های قابل گسترش
function setupExpandableCards(popupEl) {
  // اضافه کردن event listener برای کارت‌های آمار
  const statItems = popupEl.querySelectorAll('.stat-item');
  statItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCard(item);
    });
  });
  
  // اضافه کردن event listener برای کارت موجودی‌ها
  const liveBalances = popupEl.querySelector('#live-balances');
  if (liveBalances) {
    liveBalances.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCard(liveBalances);
    });
  }
}

// تابع تغییر وضعیت کارت (گسترش/انقباض)
function toggleCard(cardElement) {
  const isExpanded = cardElement.classList.contains('expanded');
  
  if (isExpanded) {
    cardElement.classList.remove('expanded');
    cardElement.classList.add('collapsed');
  } else {
    cardElement.classList.remove('collapsed');
    cardElement.classList.add('expanded');
  }
}

// تابع شروع تایپ‌رایتر
function startTypewriter(popupEl, IAMId, walletAddress, isActive, infoList, address) {
  const contentDiv = popupEl.querySelector('#typewriter-content');
  if (!contentDiv) return;
  
  // متغیرهای برای ذخیره خطوط و وضعیت‌ها
  let lineElements = [];
  let currentLineIndex = 0;
  let currentCharIndex = 0;
  let isTyping = false;
  let isCompleted = false;
  
  // ذخیره آدرس کامل کیف پول برای استفاده در توابع به‌روزرسانی
  const fullWalletAddress = address;
  
  // متغیرهای برای جلوگیری از تکرار به‌روزرسانی
  let isUpdatingWalletCounts = false;
  let isUpdatingBalances = false;
  let walletCountsUpdated = false;
  let balancesUpdated = false;
  
  // No caching - always calculate fresh data
  
               // ساخت خطوط اولیه
     const initialLines = [
               // User main info
        `IAM > User ID: ${IAMId}`,
       `IAM >`,
     
      // Points info
      `IAM > Binary Points: ${infoList[0].val !== undefined && infoList[0].val !== null && infoList[0].val !== '' ? infoList[0].val : '-'}`,
      `IAM > Binary Cap: ${infoList[1].val !== undefined && infoList[1].val !== null && infoList[1].val !== '' ? infoList[1].val : '-'}`,
      `IAM > Total Binary Reward: ${infoList[2].val !== undefined && infoList[2].val !== null && infoList[2].val !== '' ? infoList[2].val : '-'}`,
      `IAM > Claimed Points: ${infoList[3].val !== undefined && infoList[3].val !== null && infoList[3].val !== '' ? infoList[3].val : '-'}`,
     `IAM >`,
     
      // Financial info
      `IAM > Referral Income: ${infoList[4].val !== undefined && infoList[4].val !== null && infoList[4].val !== '' ? infoList[4].val : '-'}`,
      `IAM > Total Deposit: ${infoList[5].val !== undefined && infoList[5].val !== null && infoList[5].val !== '' ? infoList[5].val : '-'}`,
     `IAM >`,
     
      // Left and right points
      `IAM > Left Points: ${infoList[6].val !== undefined && infoList[6].val !== null && infoList[6].val !== '' ? infoList[6].val : '-'}`,
      `IAM > Right Points: ${infoList[7].val !== undefined && infoList[7].val !== null && infoList[7].val !== '' ? infoList[7].val : '-'}`,
     `IAM >`,
     
      // Wallet counts (loading initially)
      `IAM > Left Wallet Count: ⏳`,
      `IAM > Right Wallet Count: ⏳`,
     `IAM >`,
     
      // Live balances (loading initially)
      `IAM > IAM Balance: ⏳`,
      `IAM > MATIC Balance: ⏳`,
      `IAM > DAI Balance: ⏳`,
     `IAM >`,
      `IAM > Ready.`
   ];
  
     // تابع تایپ خط
   function typeNextLine() {
     if (currentLineIndex >= initialLines.length) {
       // تایپ تمام شد - شروع به‌روزرسانی داده‌های پویا
       isCompleted = true;
       startDynamicUpdates();
       return;
     }
     
     const lineDiv = document.createElement('div');
     lineDiv.className = 'typewriter-line typing';
     lineDiv.setAttribute('data-line-index', currentLineIndex);
     contentDiv.appendChild(lineDiv);
     lineElements[currentLineIndex] = lineDiv;
     
     const line = initialLines[currentLineIndex];
     currentCharIndex = 0;
     isTyping = true;
     
     // ابتدا خط را expand کن
     lineDiv.style.opacity = '0';
     lineDiv.style.transform = 'translateY(10px)';
     
     setTimeout(() => {
               lineDiv.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
       lineDiv.style.opacity = '1';
       lineDiv.style.transform = 'translateY(0)';
       
       // بعد از expand، تایپ را شروع کن
       setTimeout(() => {
         function typeChar() {
           if (currentCharIndex < line.length) {
             // تایپ کاراکتر به کاراکتر
             const currentText = line.substring(0, currentCharIndex + 1);
             lineDiv.textContent = currentText;
             currentCharIndex++;
             
             // تنظیم اندازه پویا
             adjustContainerSize();
             
             // تاخیر برای تایپ کاراکتر بعدی
                           setTimeout(typeChar, 20);
           } else {
             // خط تمام شد
             lineDiv.classList.remove('typing');
             lineDiv.classList.add('completed');
             isTyping = false;
             currentLineIndex++;
             
             adjustContainerSize();
             
             // کمی صبر کن و خط بعدی را شروع کن
                           setTimeout(typeNextLine, 200);
           }
         }
         
         typeChar();
               }, 200); // صبر کن تا expand تمام شود
     }, 200);
   }
  
     // تابع تنظیم اندازه container
   function adjustContainerSize() {
     const container = popupEl.querySelector('.floating-typewriter');
     if (container) {
       const contentHeight = contentDiv.scrollHeight;
       const lineHeight = 24; // ارتفاع تقریبی هر خط
       const padding = 40; // padding اضافی
       
       // اگر آخرین خط است، فضای اضافی اضافه نکن
       if (currentLineIndex >= initialLines.length - 1) {
         container.style.height = Math.min(contentHeight + padding, window.innerHeight * 0.8) + 'px';
       } else {
         // برای خطوط دیگر، فضای کافی برای خط بعدی اضافه کن
         container.style.height = Math.min(contentHeight + lineHeight + padding, window.innerHeight * 0.8) + 'px';
       }
     }
   }
  
  // تابع پیدا کردن خط بر اساس محتوا
  function findLineByContent(searchText) {
    for (let i = 0; i < lineElements.length; i++) {
      if (lineElements[i] && lineElements[i].textContent.includes(searchText)) {
        return i;
      }
    }
    return -1;
  }
  
  // تابع به‌روزرسانی خط خاص با بهبود
  function updateLine(lineIndex, newText, isAnimated = true) {
    // بررسی وجود خط
    if (!lineElements[lineIndex]) {
      console.warn(`Line ${lineIndex} not found, trying to find by content...`);
      // تلاش برای پیدا کردن خط با محتوای مشابه
      const targetText = newText.split(':')[0]; // گرفتن بخش قبل از :
      const foundIndex = findLineByContent(targetText);
      if (foundIndex !== -1) {
        console.log(`Found line ${foundIndex} with content: ${lineElements[foundIndex].textContent}`);
        lineIndex = foundIndex;
      }
    }
    
    if (lineElements[lineIndex]) {
      const lineDiv = lineElements[lineIndex];
      console.log(`Updating line ${lineIndex}: "${lineDiv.textContent}" -> "${newText}"`);
      
      if (isAnimated) {
        // انیمیشن به‌روزرسانی
        lineDiv.style.color = '#ffff00';
        setTimeout(() => {
          lineDiv.textContent = newText;
          lineDiv.style.color = '#00ff88';
          adjustContainerSize();
        }, 200);
      } else {
        lineDiv.textContent = newText;
        adjustContainerSize();
      }
    } else {
      console.error(`Line ${lineIndex} not found and could not be located`);
    }
  }
  
  // تابع شروع به‌روزرسانی داده‌های پویا با بهینه‌سازی سرعت
  function startDynamicUpdates() {
    // بررسی وجود ethers
    if (typeof ethers === 'undefined') {
      console.warn('Ethers library not available');
      updateLine(14, `IAM > Left Wallet Count: ❌`, true);
      updateLine(15, `IAM > Right Wallet Count: ❌`, true);
      updateLine(18, `IAM > IAM Balance: ❌`, true);
      updateLine(19, `IAM > MATIC Balance: ❌`, true);
      updateLine(20, `IAM > DAI Balance: ❌`, true);
      return;
    }
    
    console.log('Starting dynamic updates...');
    
    // شروع به‌روزرسانی فوری با timeout کلی
    const overallTimeout = setTimeout(() => {
      console.warn('Overall update timeout reached');
      if (!walletCountsUpdated) {
        updateLine(14, `IAM > Left Wallet Count: ⏰`, true);
        updateLine(15, `IAM > Right Wallet Count: ⏰`, true);
        walletCountsUpdated = true;
        isUpdatingWalletCounts = false;
      }
      if (!balancesUpdated) {
        updateLine(18, `IAM > IAM Balance: ⏰`, true);
        updateLine(19, `IAM > MATIC Balance: ⏰`, true);
        updateLine(20, `IAM > DAI Balance: ⏰`, true);
        balancesUpdated = true;
        isUpdatingBalances = false;
      }
    }, 10000); // کاهش به 10 ثانیه
    
    // شروع فوری به‌روزرسانی‌ها بدون انتظار برای اتصال
    setTimeout(() => {
      if (!walletCountsUpdated) {
        console.log('Starting wallet counts update...');
        updateWalletCounts();
      }
    }, 100);
    
    setTimeout(() => {
      if (!balancesUpdated) {
        console.log('Starting balances update...');
        updateBalances();
      }
    }, 200);
    
    // بررسی اتصال کیف پول در پس‌زمینه
    checkWalletConnection().then(() => {
      console.log('Wallet connection check completed successfully');
    }).catch((error) => {
      console.warn('Wallet connection check failed:', error);
    }).finally(() => {
      clearTimeout(overallTimeout);
    });
  }
  
  // تابع بررسی اتصال کیف پول با بهینه‌سازی
  async function checkWalletConnection() {
    try {
      // بررسی وجود اتصال موجود (سریع‌ترین راه)
      if (window.contractConfig && window.contractConfig.contract && window.contractConfig.provider) {
        console.log('Using existing wallet connection');
        return Promise.resolve();
      }
      
      // تلاش برای اتصال جدید با timeout
      if (typeof window.connectWallet === 'function') {
        const connectionPromise = window.connectWallet();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 3000)
        );
        
        try {
          await Promise.race([connectionPromise, timeoutPromise]);
          console.log('New wallet connection established');
          return Promise.resolve();
        } catch (timeoutError) {
          console.warn('Wallet connection timed out, using fallback');
          // اگر timeout شد، از اتصال موجود استفاده کن
          if (window.contractConfig && window.contractConfig.contract) {
            return Promise.resolve();
          }
          throw timeoutError;
        }
      }
      
      // اگر هیچ روش اتصالی در دسترس نباشد
      console.warn('No wallet connection method available');
      return Promise.resolve();
    } catch (error) {
      console.warn('Wallet connection failed:', error);
      return Promise.reject(error);
    }
  }
  
  // تابع به‌روزرسانی تعداد ولت‌ها با بهینه‌سازی
  async function updateWalletCounts() {
    // جلوگیری از تکرار
    if (isUpdatingWalletCounts || walletCountsUpdated) {
      console.log('Wallet counts update already in progress or completed');
      return;
    }
    
    isUpdatingWalletCounts = true;
    console.log('Starting wallet counts update...');
    
    try {
      // نمایش وضعیت محاسبه با پیدا کردن خطوط
      const leftWalletLineIndex = findLineByContent('Left Wallet Count');
      const rightWalletLineIndex = findLineByContent('Right Wallet Count');
      
      if (leftWalletLineIndex !== -1) {
        updateLine(leftWalletLineIndex, `IAM > Left Wallet Count: 🔄 محاسبه...`, true);
      }
      if (rightWalletLineIndex !== -1) {
        updateLine(rightWalletLineIndex, `IAM > Right Wallet Count: 🔄 محاسبه...`, true);
      }
      
      // بررسی وجود contract با timeout
      let contract = null;
      
      if (window.contractConfig && window.contractConfig.contract) {
        contract = window.contractConfig.contract;
        console.log('Using existing contract for wallet counts');
      } else {
        // تلاش برای اتصال مجدد با timeout
        try {
          const connectionPromise = window.connectWallet();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 3000)
          );
          
          const connection = await Promise.race([connectionPromise, timeoutPromise]);
          contract = connection.contract;
          console.log('New connection established for wallet counts');
        } catch (connError) {
          console.warn('Wallet connection failed for wallet counts:', connError);
          const leftWalletIndex = findLineByContent('Left Wallet Count');
          const rightWalletIndex = findLineByContent('Right Wallet Count');
          
          if (leftWalletIndex !== -1) {
            updateLine(leftWalletIndex, `IAM > Left Wallet Count: ❌`, true);
          }
          if (rightWalletIndex !== -1) {
            updateLine(rightWalletIndex, `IAM > Right Wallet Count: ❌`, true);
          }
          walletCountsUpdated = true;
          isUpdatingWalletCounts = false;
          return;
        }
      }
      
      if (contract && infoList[8] && infoList[8].key === 'left-wallet-count') {
        const userIndex = infoList[8].userIndex || 1n;
        
        // محاسبه با نمایش پیشرفت
        const startTime = Date.now();
        const counts = await calculateWalletCounts(userIndex, contract);
        const endTime = Date.now();
        
        console.log(`Wallet counts calculated in ${endTime - startTime}ms`);
        
        // Update left wallet count
        const leftWalletIndex = findLineByContent('Left Wallet Count');
        const rightWalletIndex = findLineByContent('Right Wallet Count');
        
        if (leftWalletIndex !== -1) {
          updateLine(leftWalletIndex, `IAM > Left Wallet Count: ${counts.leftCount}`, true);
        }
        if (rightWalletIndex !== -1) {
          updateLine(rightWalletIndex, `IAM > Right Wallet Count: ${counts.rightCount}`, true);
        }
      } else {
        const leftWalletIndex = findLineByContent('Left Wallet Count');
        const rightWalletIndex = findLineByContent('Right Wallet Count');
        
        if (leftWalletIndex !== -1) {
          updateLine(leftWalletIndex, `IAM > Left Wallet Count: ❌`, true);
        }
        if (rightWalletIndex !== -1) {
          updateLine(rightWalletIndex, `IAM > Right Wallet Count: ❌`, true);
        }
      }
      
      walletCountsUpdated = true;
    } catch (error) {
      console.warn('Error updating wallet counts:', error);
      const leftWalletIndex = findLineByContent('Left Wallet Count');
      const rightWalletIndex = findLineByContent('Right Wallet Count');
      
      if (leftWalletIndex !== -1) {
        updateLine(leftWalletIndex, `IAM > Left Wallet Count: ❌`, true);
      }
      if (rightWalletIndex !== -1) {
        updateLine(rightWalletIndex, `IAM > Right Wallet Count: ❌`, true);
      }
      walletCountsUpdated = true;
    } finally {
      isUpdatingWalletCounts = false;
    }
  }
  
  // تابع به‌روزرسانی موجودی‌ها با بهینه‌سازی سرعت
  async function updateBalances() {
    // جلوگیری از تکرار
    if (isUpdatingBalances || balancesUpdated) {
      console.log('Balances update already in progress or completed');
      return;
    }
    
    isUpdatingBalances = true;
    console.log('Starting balances update...');
    
    // نمایش وضعیت بارگذاری با پیدا کردن خطوط
    const iamBalanceLineIndex = findLineByContent('IAM Balance');
    const maticBalanceLineIndex = findLineByContent('MATIC Balance');
    const daiBalanceLineIndex = findLineByContent('DAI Balance');
    
    if (iamBalanceLineIndex !== -1) {
      updateLine(iamBalanceLineIndex, `IAM > IAM Balance: 🔄 بارگذاری...`, true);
    }
    if (maticBalanceLineIndex !== -1) {
      updateLine(maticBalanceLineIndex, `IAM > MATIC Balance: 🔄 بارگذاری...`, true);
    }
    if (daiBalanceLineIndex !== -1) {
      updateLine(daiBalanceLineIndex, `IAM > DAI Balance: 🔄 بارگذاری...`, true);
    }
    
    // بررسی آدرس کیف پول - استفاده از آدرس کامل
    if (!fullWalletAddress || fullWalletAddress === '-' || fullWalletAddress === '0x0000000000000000000000000000000000000000') {
      updateLine(18, `IAM > IAM Balance: -`, true);
      updateLine(19, `IAM > MATIC Balance: -`, true);
      updateLine(20, `IAM > DAI Balance: -`, true);
      balancesUpdated = true;
      isUpdatingBalances = false;
      return;
    }
    
    try {
      // تلاش برای اتصال به کیف پول با timeout
      let contract, provider;
      
      // ابتدا بررسی اتصال موجود
      if (window.contractConfig && window.contractConfig.contract && window.contractConfig.provider) {
        contract = window.contractConfig.contract;
        provider = window.contractConfig.provider;
        console.log('Using existing wallet connection for balances');
      } else {
        // تلاش برای اتصال جدید با timeout کوتاه‌تر
        const connectionPromise = window.connectWallet();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 3000)
        );
        
        try {
          const connection = await Promise.race([connectionPromise, timeoutPromise]);
          contract = connection.contract;
          provider = connection.provider;
          console.log('New wallet connection established for balances');
        } catch (connError) {
          console.warn('Wallet connection failed or timed out:', connError);
          // اگر اتصال شکست خورد، از contractConfig موجود استفاده کن
          if (window.contractConfig && window.contractConfig.contract && window.contractConfig.provider) {
            contract = window.contractConfig.contract;
            provider = window.contractConfig.provider;
            console.log('Using fallback connection for balances');
          } else {
            throw new Error('No wallet connection available');
          }
        }
      }
      
      // دریافت همزمان تمام موجودی‌ها برای سرعت بیشتر
      const balancePromises = [];
      
      // موجودی IAM
      if (contract && typeof contract.balanceOf === 'function') {
        balancePromises.push(
          contract.balanceOf(fullWalletAddress)
            .then(c => ({ type: 'IAM', value: Number(ethers.formatEther(c)).toFixed(4) }))
            .catch(e => ({ type: 'IAM', error: e }))
        );
      } else {
        balancePromises.push(Promise.resolve({ type: 'IAM', error: 'No contract' }));
      }
      
      // موجودی MATIC
      if (provider) {
        balancePromises.push(
          provider.getBalance(fullWalletAddress)
            .then(m => ({ type: 'MATIC', value: Number(ethers.formatEther(m)).toFixed(4) }))
            .catch(e => ({ type: 'MATIC', error: e }))
        );
      } else {
        balancePromises.push(Promise.resolve({ type: 'MATIC', error: 'No provider' }));
      }
      
      // موجودی DAI
      const DAI_ADDRESS = window.DAI_ADDRESS || '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';
      const DAI_ABI = window.DAI_ABI || [
        {
          "constant": true,
          "inputs": [{"name": "_owner", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"name": "balance", "type": "uint256"}],
          "type": "function"
        }
      ];
      
      if (provider && DAI_ADDRESS && DAI_ABI) {
        const Dai = new ethers.Contract(DAI_ADDRESS, DAI_ABI, provider);
        balancePromises.push(
          Dai.balanceOf(fullWalletAddress)
            .then(d => ({ type: 'DAI', value: Number(ethers.formatUnits(d, 18)).toFixed(2) }))
            .catch(e => ({ type: 'DAI', error: e }))
        );
      } else {
        balancePromises.push(Promise.resolve({ type: 'DAI', error: 'No DAI contract' }));
      }
      
      // انتظار برای دریافت تمام موجودی‌ها با timeout
      const balanceTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Balance fetch timeout')), 8000)
      );
      
      try {
        const results = await Promise.race([
          Promise.all(balancePromises),
          balanceTimeout
        ]);
        
        // نمایش نتایج با پیدا کردن خطوط
        results.forEach(result => {
          if (result.error) {
            console.warn(`Error getting ${result.type} balance:`, result.error);
            if (result.type === 'IAM') {
              const iamIndex = findLineByContent('IAM Balance');
              if (iamIndex !== -1) updateLine(iamIndex, `IAM > IAM Balance: ❌`, true);
            }
            if (result.type === 'MATIC') {
              const maticIndex = findLineByContent('MATIC Balance');
              if (maticIndex !== -1) updateLine(maticIndex, `IAM > MATIC Balance: ❌`, true);
            }
            if (result.type === 'DAI') {
              const daiIndex = findLineByContent('DAI Balance');
              if (daiIndex !== -1) updateLine(daiIndex, `IAM > DAI Balance: ❌`, true);
            }
          } else {
            if (result.type === 'IAM') {
              const iamIndex = findLineByContent('IAM Balance');
              if (iamIndex !== -1) updateLine(iamIndex, `IAM > IAM Balance: ${result.value}`, true);
            }
            if (result.type === 'MATIC') {
              const maticIndex = findLineByContent('MATIC Balance');
              if (maticIndex !== -1) updateLine(maticIndex, `IAM > MATIC Balance: ${result.value}`, true);
            }
            if (result.type === 'DAI') {
              const daiIndex = findLineByContent('DAI Balance');
              if (daiIndex !== -1) updateLine(daiIndex, `IAM > DAI Balance: ${result.value}`, true);
            }
          }
        });
        
      } catch (timeoutError) {
        console.warn('Balance fetch timed out:', timeoutError);
        const iamIndex = findLineByContent('IAM Balance');
        const maticIndex = findLineByContent('MATIC Balance');
        const daiIndex = findLineByContent('DAI Balance');
        
        if (iamIndex !== -1) updateLine(iamIndex, `IAM > IAM Balance: ⏰`, true);
        if (maticIndex !== -1) updateLine(maticIndex, `IAM > MATIC Balance: ⏰`, true);
        if (daiIndex !== -1) updateLine(daiIndex, `IAM > DAI Balance: ⏰`, true);
      } finally {
        balancesUpdated = true;
        isUpdatingBalances = false;
        console.log('Balances update completed');
      }
      
    } catch (error) {
      console.warn('Error updating balances:', error);
      const iamIndex = findLineByContent('IAM Balance');
      const maticIndex = findLineByContent('MATIC Balance');
      const daiIndex = findLineByContent('DAI Balance');
      
      if (iamIndex !== -1) updateLine(iamIndex, `IAM > IAM Balance: ❌`, true);
      if (maticIndex !== -1) updateLine(maticIndex, `IAM > MATIC Balance: ❌`, true);
      if (daiIndex !== -1) updateLine(daiIndex, `IAM > DAI Balance: ❌`, true);
    } finally {
      balancesUpdated = true;
      isUpdatingBalances = false;
    }
  }
  
  // تابع محاسبه تعداد ولت‌ها - بدون کش
  async function calculateWalletCounts(userIndex, contract) {
    try {
      const leftChildIndex = BigInt(userIndex) * 2n;
      const rightChildIndex = BigInt(userIndex) * 2n + 1n;
      
      // اجرای همزمان محاسبه چپ و راست برای سرعت بیشتر
      const [leftCount, rightCount] = await Promise.all([
        calculateSubtreeCountOptimized(leftChildIndex, contract),
        calculateSubtreeCountOptimized(rightChildIndex, contract)
      ]);
      
      return { leftCount, rightCount };
    } catch (error) {
      console.warn('Error calculating wallet counts:', error);
      return { leftCount: 0, rightCount: 0 };
    }
  }
  
  // تابع محاسبه فوق‌بهینه تعداد ولت‌ها با Level-Order Traversal
  async function calculateSubtreeCountOptimized(startIndex, contract) {
    try {
      let count = 0;
      const queue = [startIndex];
      const visited = new Set();
      const maxDepth = Infinity; // Infinite depth limit
      const batchSize = 5; // اندازه batch برای پردازش همزمان
      
      for (let depth = 0; depth < maxDepth && queue.length > 0; depth++) {
        const currentLevel = [];
        const levelSize = queue.length;
        
        // جمع‌آوری تمام گره‌های سطح فعلی
        for (let i = 0; i < levelSize; i++) {
          const currentIndex = queue.shift();
          if (!visited.has(currentIndex.toString())) {
            visited.add(currentIndex.toString());
            currentLevel.push(currentIndex);
          }
        }
        
        if (currentLevel.length === 0) break;
        
        // پردازش batch به batch برای بهینه‌سازی
        for (let i = 0; i < currentLevel.length; i += batchSize) {
          const batch = currentLevel.slice(i, i + batchSize);
          
          // دریافت آدرس‌ها به صورت همزمان
          const addressPromises = batch.map(index => 
            contract.indexToAddress(index).catch(() => null)
          );
          const addresses = await Promise.all(addressPromises);
          
          // بررسی آدرس‌ها و شمارش کاربران
          const validAddresses = addresses.filter(addr => 
            addr && addr !== '0x0000000000000000000000000000000000000000'
          );
          
          if (validAddresses.length > 0) {
            // دریافت اطلاعات کاربران به صورت همزمان
            const userPromises = validAddresses.map(addr => 
              contract.users(addr).catch(() => ({ index: 0n }))
            );
            const users = await Promise.all(userPromises);
            
            // شمارش کاربران معتبر
            const validUsers = users.filter(user => 
              user && user.index && BigInt(user.index) > 0n
            );
            count += validUsers.length;
            
            // اضافه کردن فرزندان به صف برای سطح بعدی
            for (let j = 0; j < batch.length; j++) {
              const currentIndex = batch[j];
              const address = addresses[j];
              
              if (address && address !== '0x0000000000000000000000000000000000000000') {
                const user = users[validAddresses.indexOf(address)];
                if (user && user.index && BigInt(user.index) > 0n) {
                  const leftChild = BigInt(currentIndex) * 2n;
                  const rightChild = BigInt(currentIndex) * 2n + 1n;
                  
                  if (!visited.has(leftChild.toString())) {
                    queue.push(leftChild);
                  }
                  if (!visited.has(rightChild.toString())) {
                    queue.push(rightChild);
                  }
                }
              }
            }
          }
        }
      }
      
      return count;
    } catch (error) {
      console.warn('Error in optimized subtree count:', error);
      return 0;
    }
  }
  
  // تابع محاسبه بازگشتی تعداد ولت‌ها در زیرمجموعه (برای سازگاری)
  async function calculateSubtreeCount(parentIndex, contract, side) {
    return await calculateSubtreeCountOptimized(parentIndex, contract);
  }
  
  // No cache to clear
  
     // شروع تایپ از خط اول
       setTimeout(typeNextLine, 250);
}

// Function to show registration modal for empty slots
async function showRegistrationModal(parentIndex, emptyIndex, position) {
    console.log(`🎯 Registration modal triggered for parent ${parentIndex}, empty index ${emptyIndex}, position ${position}`);
    console.log(`🔍 Function called with arguments:`, { parentIndex, emptyIndex, position });
    
    // If previous modal is open, remove it
    let oldModal = document.getElementById('quick-register-modal');
    if (oldModal) {
        console.log('🗑️ Removing existing modal');
        oldModal.remove();
    }
    
    let registerCost = '...';
    let maticBalance = '...';
    let errorMsg = '';
    let loading = true;
    let IAMBalance = '...';
    
    // Create modal
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
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    
    modal.innerHTML = `
        <div style="background:linear-gradient(135deg,#232946,#181c2a);border-radius:18px;box-shadow:0 4px 24px #00ff8840;padding:2.2rem 2.2rem 1.5rem 2.2rem;min-width:320px;max-width:95vw;width:100%;position:relative;direction:rtl;">
            <button id="close-quick-register" style="position:absolute;top:1.1rem;left:1.1rem;background:#ff6b6b;color:#fff;border:none;border-radius:50%;width:32px;height:32px;font-size:1.3em;cursor:pointer;">×</button>
            <h3 style="color:#00ff88;font-size:1.2rem;margin-bottom:1.2rem;text-align:center;">ثبت عضو جدید</h3>
            <div id="quick-register-info" style="margin-bottom:1.2rem;color:#a786ff;font-size:1.05em;text-align:right;line-height:2;"></div>
            <div style="margin-bottom:1.2rem;">
                <div style='margin-bottom:0.7em;display:flex;gap:1.2em;justify-content:center;align-items:center;'>
                    <span style='color:#a786ff;font-weight:bold;'>انتخاب آواتار:</span>
                    <span class="avatar-choice" data-avatar="man" style="font-size:2em;cursor:pointer;border:2px solid #00ff88;border-radius:50%;padding:0.15em 0.3em;background:#232946;">👨‍💼</span>
                    <span class="avatar-choice" data-avatar="woman" style="font-size:2em;cursor:pointer;border:2px solid transparent;border-radius:50%;padding:0.15em 0.3em;background:#232946;">👩‍💼</span>
                    <span class="avatar-choice" data-avatar="student-man" style="font-size:2em;cursor:pointer;border:2px solid transparent;border-radius:50%;padding:0.15em 0.3em;background:#232946;">👨‍🎓</span>
                    <span class="avatar-choice" data-avatar="student-woman" style="font-size:2em;cursor:pointer;border:2px solid transparent;border-radius:50%;padding:0.15em 0.3em;background:#232946;">👩‍🎓</span>
                </div>
            </div>
            <div style="margin-bottom:1.2rem;">
                <label style="color:#a786ff;font-weight:bold;display:block;margin-bottom:0.5rem;">آدرس کیف پول جدید:</label>
                <input id="quick-register-address" type="text" placeholder="0x..." style="width:100%;padding:0.8rem;border:1px solid rgba(167,134,255,0.3);border-radius:8px;background:rgba(167,134,255,0.05);color:#fff;font-size:1rem;direction:ltr;text-align:left;">
            </div>
            <button id="quick-register-btn" style="width:100%;padding:1rem;background:linear-gradient(135deg,#00ff88,#00cc66);color:#232946;border:none;border-radius:8px;font-weight:bold;font-size:1rem;cursor:pointer;transition:all 0.3s ease;">ثبت عضو جدید</button>
            <div id="quick-register-status" style="margin-top:1rem;text-align:center;font-size:0.9rem;"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    console.log(`📋 Modal created and appended to body for parent ${parentIndex}, empty index ${emptyIndex}`);
    
    // Force modal visibility
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.zIndex = '99999';
    modal.focus();
    
    // Select avatar
    let selectedAvatar = 'man';
    const avatarChoices = modal.querySelectorAll('.avatar-choice');
    avatarChoices.forEach(el => {
        el.onclick = function() {
            avatarChoices.forEach(e2 => e2.style.border = '2px solid transparent');
            this.style.border = '2px solid #00ff88';
            selectedAvatar = this.getAttribute('data-avatar');
        };
    });
    // Default first avatar to be selected
    avatarChoices[0].style.border = '2px solid #00ff88';
    
    // Close modal
    document.getElementById('close-quick-register').onclick = () => modal.remove();
    
    // Get contract information and display
    (async function() {
        try {
            const { contract, address: myAddress, provider } = await window.connectWallet();
            
            // Required amount for registration
            if (window.getRegPrice) {
                let cost = await window.getRegPrice(contract);
                if (cost) {
                    let costValue = typeof ethers !== 'undefined' ? ethers.formatEther(cost) : (Number(cost)/1e18);
                    registerCost = Math.round(parseFloat(costValue)).toString();
                } else {
                    registerCost = '...';
                }
            }
            
            // MATIC balance
            if (provider && myAddress) {
                let bal = await provider.getBalance(myAddress);
                maticBalance = bal ? (typeof ethers !== 'undefined' ? Number(ethers.formatEther(bal)).toFixed(2) : (Number(bal)/1e18).toFixed(2)) : '...';
            }
            
            // IAM balance
            if (contract && myAddress && typeof contract.balanceOf === 'function') {
                let IAM = await contract.balanceOf(myAddress);
                IAMBalance = IAM ? (typeof ethers !== 'undefined' ? Number(ethers.formatEther(IAM)).toFixed(2) : (Number(IAM)/1e18).toFixed(2)) : '...';
            }
            
            loading = false;
        } catch (e) {
            errorMsg = 'Error getting wallet or contract information';
        }
        
        // Display information
        let infoDiv = document.getElementById('quick-register-info');
        if (infoDiv) {
            infoDiv.innerHTML =
                `<div>شاخص معرف: <b style='color:#00ff88'>${window.generateIAMId ? window.generateIAMId(parentIndex) : parentIndex}</b></div>`+
                `<div>شاخص موقعیت جدید: <b style='color:#a786ff'>${window.generateIAMId ? window.generateIAMId(emptyIndex) : emptyIndex}</b></div>`+
                `<div>مبلغ مورد نیاز: <b style='color:#00ff88'>${registerCost} IAM</b></div>`+
                `<div>موجودی MATIC شما: <b style='color:#a786ff'>${maticBalance} MATIC</b></div>`+
                `<div>موجودی IAM شما: <b style='color:#00ff88'>${IAMBalance} IAM</b></div>`+
                (errorMsg ? `<div style='color:#ff4444'>${errorMsg}</div>` : '');
        }
    })();
    
    // Registration button click handler
    document.getElementById('quick-register-btn').onclick = async function() {
        let statusDiv = document.getElementById('quick-register-status');
        let input = document.getElementById('quick-register-address');
        let newAddress = input.value.trim();
        statusDiv.textContent = '';
        
        if (!/^0x[a-fA-F0-9]{40}$/.test(newAddress)) {
            statusDiv.textContent = 'لطفاً آدرس کیف پول معتبر وارد کنید!';
            statusDiv.style.color = '#ff4444';
            return;
        }
        
        statusDiv.textContent = 'در حال ارسال درخواست ثبت نام...';
        statusDiv.style.color = '#a786ff';
        this.disabled = true;
        
        console.log('User avatar selection:', selectedAvatar);
        // No caching - avatar selection is not persisted
        
        try {
            const { contract, address: myAddress } = await window.connectWallet();
            const tx = await contract.registerAndActivate(myAddress, myAddress, newAddress);
            await tx.wait();
            
            statusDiv.textContent = '✅ ثبت نام با موفقیت انجام شد!';
            statusDiv.style.color = '#00ff88';
            setTimeout(() => { 
                modal.remove(); 
                if (typeof window.renderSimpleBinaryTree === 'function') window.renderSimpleBinaryTree(); 
            }, 1200);
        } catch (err) {
            statusDiv.textContent = '❌ خطا در ثبت نام: ' + (err && err.message ? err.message : err);
            statusDiv.style.color = '#ff4444';
        }
        this.disabled = false;
    };
}
