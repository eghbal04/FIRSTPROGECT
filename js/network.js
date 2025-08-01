// نمایش درخت باینری با lazy load: هر گره با کلیک expand می‌شود و فقط فرزندان همان گره نمایش داده می‌شوند

function shortAddress(addr) {
    if (!addr) return '-';
    return addr.slice(0, 3) + '...' + addr.slice(-2);
}

function showUserPopup(address, user) {
    // تابع کوتاه‌کننده آدرس
    function shortAddress(addr) {
        if (!addr) return '-';
        return addr.slice(0, 6) + '...' + addr.slice(-4);
    }
    // حذف popup قبلی
    let existingPopup = document.getElementById('user-popup');
    if (existingPopup) existingPopup.remove();
    // اطلاعات مورد نیاز
    const cpaId = user && user.index !== undefined && user.index !== null ? (window.generateCPAId ? window.generateCPAId(user.index) : user.index) : '-';
    const walletAddress = address || '-';
    const isActive = user && user.activated ? true : false;
    // لیست struct
    const infoList = [
      {icon:'🎯', label:'امتیاز باینری', val:user.binaryPoints},
      {icon:'🏆', label:'سقف باینری', val:user.binaryPointCap},
      {icon:'💎', label:'پاداش کل باینری', val:user.totalMonthlyRewarded},
      {icon:'✅', label:'امتیاز دریافت‌شده', val:user.binaryPointsClaimed},
      {icon:'🤝', label:'درآمد رفرال', val:user.refclimed ? Math.floor(Number(user.refclimed) / 1e18) : 0},
      {icon:'💰', label:'سپرده کل', val:user.depositedAmount ? Math.floor(Number(user.depositedAmount) / 1e18) : 0},
      {icon:'🟢', label:'CPA', val:'در حال بارگذاری...'},
      {icon:'🟣', label:'MATIC', val:'در حال بارگذاری...'},
      {icon:'💵', label:'DAI', val:'در حال بارگذاری...'},
      {icon:'⬅️', label:'امتیاز چپ', val:user.leftPoints},
      {icon:'➡️', label:'امتیاز راست', val:user.rightPoints}
    ];
    const popup = document.createElement('div');
    popup.id = 'user-popup';
    popup.style = `
      position: fixed;z-index: 9999;top: 64px;left: 0;right: 0;width: 100vw;min-width: 100vw;max-width: 100vw;background: rgba(24,28,42,0.97);display: flex;align-items: flex-start;justify-content: center;padding: 0.5rem 0.5vw 0.5rem 0.5vw;box-sizing: border-box;font-family: 'Montserrat', 'Noto Sans Arabic', monospace;font-size: 0.93rem;`;
    popup.innerHTML = `
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
        <div id="copy-msg" style="display:none;text-align:center;color:#00ff88;font-size:1em;margin-top:0.7em;">کپی شد!</div>
      </div>
    `;
    document.body.appendChild(popup);
    document.getElementById('close-user-popup').onclick = () => popup.remove();
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
                    dai = (typeof ethers !== 'undefined') ? Number(ethers.formatUnits(daiRaw, 6)).toFixed(2) : (Number(daiRaw)/1e6).toFixed(2);
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
}

// تابع جدید: رندر عمودی ساده با حفظ رفتارها
async function renderVerticalNodeLazy(index, container, level = 0, autoExpand = false) {
    try {
        const { contract } = await window.connectWallet();
        if (!contract) throw new Error('No contract connection available');
        let address = await contract.indexToAddress(index);
        if (!address || address === '0x0000000000000000000000000000000000000000') {
            renderEmptyNodeVertical(index, container, level);
            return;
        }
        let user = await contract.users(address);
        if (!user) {
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
        nodeDiv.style.display = 'flex';
        nodeDiv.style.alignItems = 'center';
        nodeDiv.style.justifyContent = 'flex-start';
        nodeDiv.style.flexWrap = 'nowrap';
        nodeDiv.style.marginRight = (level * 2) + 'em';
        nodeDiv.style.marginBottom = '0.7em';
        nodeDiv.style.position = 'relative';
        nodeDiv.style.background = 'rgba(35,41,70,0.98)';
        nodeDiv.style.borderRadius = '12px';
        nodeDiv.style.padding = '0.7em 1.5em';
        nodeDiv.style.minWidth = '320px';
        nodeDiv.style.maxWidth = '320px';
        nodeDiv.style.height = '64px';
        nodeDiv.style.color = '#00ff88';
        nodeDiv.style.fontFamily = 'monospace';
        nodeDiv.style.fontSize = '1.08em';
        nodeDiv.style.boxShadow = '0 4px 16px rgba(0,255,136,0.10)';
        nodeDiv.style.cursor = 'pointer';
        nodeDiv.style.transition = 'background 0.2s, box-shadow 0.2s';
        nodeDiv.onmouseover = function() { this.style.background = '#232946'; this.style.boxShadow = '0 6px 24px #00ff8840'; };
        nodeDiv.onmouseout = function() { this.style.background = 'rgba(35,41,70,0.98)'; this.style.boxShadow = '0 4px 16px rgba(0,255,136,0.10)'; };
        const cpaId = window.generateCPAId ? window.generateCPAId(user.index) : user.index;
        // دکمه expand/collapse اگر دایرکت دارد یا جای خالی دارد
        let expandBtn = null;
        let childrenDiv = null;
        if (hasDirects || !leftActive || !rightActive) {
            expandBtn = document.createElement('button');
            expandBtn.textContent = autoExpand ? '▼' : '▶';
            expandBtn.style.marginLeft = '0.7em';
            expandBtn.style.background = 'transparent';
            expandBtn.style.border = 'none';
            expandBtn.style.color = '#a786ff';
            expandBtn.style.fontSize = '1em';
            expandBtn.style.cursor = 'pointer';
            expandBtn.style.verticalAlign = 'middle';
            expandBtn.setAttribute('aria-label', 'Expand/Collapse');
        }
        // حذف ساخت علامت سوال کنار گره
        nodeDiv.innerHTML = `
            <span style="color:#a786ff;font-size:0.85em;margin-left:1em;">Level ${level}</span>
            <span style="font-size:1.2em;">👤</span>
            <span style="margin-right:0.7em;">${cpaId}</span>
        `;
        if (expandBtn) nodeDiv.prepend(expandBtn);
        nodeDiv.addEventListener('click', function(e) {
            if (e.target.classList.contains('register-question-mark')) return;
            if (expandBtn && e.target === expandBtn) {
                if (childrenDiv.style.display === 'none') {
                    childrenDiv.style.display = 'block';
                    expandBtn.textContent = '▼';
                } else {
                    childrenDiv.style.display = 'none';
                    expandBtn.textContent = '▶';
                }
                e.stopPropagation();
                return;
            }
            showUserPopup(address, user);
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
        
        // div فرزندان (در ابتدا بسته یا باز بر اساس autoExpand)
        if (expandBtn) {
            childrenDiv = document.createElement('div');
            childrenDiv.style.display = autoExpand ? 'block' : 'none';
            childrenDiv.style.transition = 'all 0.3s';
            childrenDiv.style.flexDirection = 'column'; // عمودی
            childrenDiv.style.gap = '0.2em';
            container.appendChild(childrenDiv);
            // چپ
            if (leftActive) {
                let leftChildDiv = document.createElement('div');
                leftChildDiv.style.display = 'block';
                leftChildDiv.style.marginRight = ((level + 1) * 2) + 'em';
                await renderVerticalNodeLazy(BigInt(leftUser.index), leftChildDiv, level + 1, false);
                childrenDiv.appendChild(leftChildDiv);
            }
            // راست
            if (rightActive) {
                let rightChildDiv = document.createElement('div');
                rightChildDiv.style.display = 'block';
                rightChildDiv.style.marginRight = ((level + 1) * 2) + 'em';
                await renderVerticalNodeLazy(BigInt(rightUser.index), rightChildDiv, level + 1, false);
                childrenDiv.appendChild(rightChildDiv);
            }
        }
        // اگر جایگاه خالی وجود دارد، فقط یک دکمه کوچک "نیو" نمایش بده
        if (!leftActive || !rightActive) {
            let newBtn = document.createElement('button');
            newBtn.textContent = 'ثبت جدید';
            newBtn.title = 'ثبت‌نام زیرمجموعه جدید';
            newBtn.style.background = 'linear-gradient(90deg,#a786ff,#00ff88)';
            newBtn.style.color = '#181c2a';
            newBtn.style.fontWeight = 'bold';
            newBtn.style.border = 'none';
            newBtn.style.borderRadius = '6px';
            newBtn.style.padding = '0.2em 0.9em';
            newBtn.style.cursor = 'pointer';
            newBtn.style.fontSize = '0.95em';
            newBtn.style.marginRight = '0.7em';
            newBtn.style.marginLeft = '0.7em';
            newBtn.style.whiteSpace = 'nowrap';
            newBtn.style.fontSize = '0.8em';
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
                      registerCost = cost ? (typeof ethers !== 'undefined' ? ethers.formatEther(cost) : (Number(cost)/1e18).toFixed(2)) : '...';
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
    const emptyNode = document.createElement('div');
    emptyNode.className = 'empty-node';
    emptyNode.setAttribute('data-index', index);
    emptyNode.style.display = 'block';
    emptyNode.style.marginRight = (level * 2) + 'em';
    emptyNode.style.marginBottom = '0.5em';
    emptyNode.style.background = 'rgba(255,255,255,0.04)';
    emptyNode.style.borderRadius = '8px';
    emptyNode.style.padding = '0.4em 1em';
    emptyNode.style.color = '#888';
    emptyNode.style.fontFamily = 'monospace';
    emptyNode.style.fontSize = '1em';
    emptyNode.style.cursor = 'pointer';
    emptyNode.style.opacity = '0.7';
    emptyNode.innerHTML = `
        <span style="color:#a786ff;font-size:0.85em;margin-left:1em;">Level ${level}</span>
        <span style="font-size:1.2em;opacity:0.5;">❓</span>
        <span style="margin-right:0.7em;">${index}</span>
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
    const container = document.getElementById('network-tree');
    if (!container) {
        console.error('❌ Network tree container not found');
        return;
    }
    container.innerHTML = '';
    container.style.overflow = 'auto';
    container.style.whiteSpace = 'normal';
    container.style.padding = '2rem 0';
    container.style.display = 'block';
    try {
        const { contract, address } = await window.connectWallet();
        if (!contract || !address) {
            throw new Error('اتصال کیف پول در دسترس نیست');
        }
        const user = await contract.users(address);
        if (!user || !user.index) {
            throw new Error('کاربر پیدا نشد یا ثبت‌نام نشده است');
        }
        // در window.renderSimpleBinaryTree مقدار autoExpand فقط برای ریشه true باشد:
        await renderVerticalNodeLazy(BigInt(user.index), container, 0, true);
        
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
    // بررسی اینکه آیا در تب network هستیم
    const networkTab = document.getElementById('tab-network-btn');
    if (networkTab) {
        networkTab.addEventListener('click', function() {
            console.log('🔄 Network tab clicked, initializing...');
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
        console.log('🔄 Network section visible on load, initializing...');
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
                    console.log('🔄 Network section became visible, initializing...');
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
    window.clearBinaryTree();
    
    // بررسی وجود container
    const container = document.getElementById('network-tree');
    if (!container) {
        console.error('❌ Network tree container not found');
        return;
    }
    
    console.log('✅ Network tree container found');
    
    // نمایش وضعیت بارگذاری
    container.innerHTML = '<div style="color:#00ccff;text-align:center;padding:2rem;">🔄 در حال بارگذاری درخت شبکه...</div>';
    
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