// نمایش درخت باینری با lazy load: هر گره با کلیک expand می‌شود و فقط فرزندان همان گره نمایش داده می‌شوند

function shortAddress(addr) {
    if (!addr) return '-';
    return addr.slice(0, 5) + '...' + addr.slice(-4);
}

function showUserPopup(address, user) {
    // Prepare struct info as English strings
    const infoLines = [
        `Address:   ${address}`,
        `Index:     ${user.index}`,
        `Activated: ${user.activated ? 'Yes' : 'No'}`,
        `BinaryPoints: ${user.binaryPoints}`,
        `Cap:      ${user.binaryPointCap}`,
        `Left:     ${user.leftPoints}`,
        `Right:    ${user.rightPoints}`,
        `Refclimed:${user.refclimed}`,
        '',
        '--- Financial Info ---',
        `Binary Claimed: ${user.binaryPointsClaimed}`,
        `Monthly Withdrawn: ${user.totalMonthlyRewarded}`,
        `Total Deposited: ${user.depositedAmount}`,
        `Total Purchased: ${user.totalPurchasedKind}`
    ];
    let html = `
      <div style="direction:ltr;font-family:monospace;background:#111;color:#00ff88;padding:1.5rem 2.5rem;border-radius:16px;box-shadow:0 2px 12px #00ff8840;min-width:320px;max-width:95vw;position:relative;">
        <pre id="user-popup-terminal" style="background:#111;border:1.5px solid #333;padding:1.2rem 1.5rem;border-radius:12px;color:#00ff88;font-size:1.05rem;line-height:2;font-family:monospace;overflow-x:auto;margin-bottom:1.2rem;box-shadow:0 2px 12px #00ff8840;min-width:280px;"></pre>
        <button id="close-user-popup" style="position:absolute;top:10px;right:10px;font-size:1.3rem;background:none;border:none;color:#fff;cursor:pointer;">×</button>
      </div>
    `;
    let popup = document.createElement('div');
    popup.id = 'user-popup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%,-50%)';
    popup.style.zIndex = 9999;
    popup.innerHTML = html;
    document.body.appendChild(popup);
    document.getElementById('close-user-popup').onclick = () => popup.remove();
}

async function renderNodeLazy(index, container) {
    const { contract } = await window.connectWallet();
    let address = await contract.indexToAddress(index);
    if (!address || address === '0x0000000000000000000000000000000000000000') {
        renderEmptyNode(index, container);
        return;
    }
    let user = await contract.users(address);
    // ساخت ادمک
    let nodeDiv = document.createElement('div');
    nodeDiv.style.display = 'flex';
    nodeDiv.style.flexDirection = 'column';
    nodeDiv.style.alignItems = 'center';
    nodeDiv.style.margin = '0.5em';
    nodeDiv.style.cursor = 'pointer';
    nodeDiv.style.position = 'relative';
    nodeDiv.innerHTML = `<div style='font-size:2.2em;'>👤</div><div style='font-size:0.9em;color:#00ff88;'>${user.index}</div><div style='font-size:0.8em;'>${shortAddress(address)}</div>`;
    // دکمه expand/collapse
    let expandBtn = document.createElement('button');
    expandBtn.textContent = '+';
    expandBtn.style.marginTop = '0.3em';
    expandBtn.style.fontSize = '1em';
    expandBtn.style.background = '#232946';
    expandBtn.style.color = '#00ff88';
    expandBtn.style.border = 'none';
    expandBtn.style.borderRadius = '6px';
    expandBtn.style.cursor = 'pointer';
    nodeDiv.appendChild(expandBtn);
    // container برای فرزندان
    let childrenDiv = document.createElement('div');
    childrenDiv.style.display = 'none';
    childrenDiv.style.justifyContent = 'center';
    childrenDiv.style.gap = '2em';
    nodeDiv.appendChild(childrenDiv);
    // مدیریت expand/collapse
    let expanded = false;
    expandBtn.onclick = async function(e) {
        e.stopPropagation();
        if (!expanded) {
            expandBtn.textContent = '-';
            childrenDiv.style.display = 'flex';
            if (!childrenDiv.hasChildNodes()) {
                await renderNodeLazy(index * 2n, childrenDiv);
                await renderNodeLazy(index * 2n + 1n, childrenDiv);
            }
            expanded = true;
        } else {
            expandBtn.textContent = '+';
            childrenDiv.style.display = 'none';
            expanded = false;
        }
    };
    // نمایش popup struct با کلیک روی ادمک (نه دکمه)
    nodeDiv.querySelector('div').onclick = (e) => {
        e.stopPropagation();
        showUserPopup(address, user);
    };
    container.appendChild(nodeDiv);
}

// تابع رندر گره خالی (علامت سؤال)
function renderEmptyNode(index, container) {
    const emptyNode = document.createElement('span');
    emptyNode.className = 'empty-node';
    emptyNode.setAttribute('data-index', index);
    emptyNode.textContent = '❓';
    emptyNode.style.cursor = 'pointer';
    emptyNode.title = 'ثبت‌نام زیرمجموعه جدید';
    container.appendChild(emptyNode);
}

window.renderSimpleBinaryTree = async function() {
    const container = document.getElementById('network-tree');
    if (!container) return;
    container.innerHTML = '';
    try {
        const { contract, address } = await window.connectWallet();
        const user = await contract.users(address);
        const index = user.index;
        await renderNodeLazy(BigInt(index), container);
    } catch (e) {
        container.innerHTML = '<div style="color:#ff4444">خطا در بارگذاری درخت</div>';
    }
};

if (typeof window.showTab === 'function') {
    const origShowTab = window.showTab;
    window.showTab = async function(tab) {
        await origShowTab.apply(this, arguments);
        if (tab === 'network') {
            setTimeout(() => window.renderSimpleBinaryTree(), 500);
        }
    };
}

// اطمینان از اتصال توابع به window برای نمایش شبکه
if (typeof renderSimpleBinaryTree === 'function') {
    window.renderSimpleBinaryTree = renderSimpleBinaryTree;
}
window.initializeNetworkTab = async function() {
    if (typeof window.renderSimpleBinaryTree === 'function') {
        await window.renderSimpleBinaryTree();
    }
};

function getReferrerFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref') || urlParams.get('referrer');
}

// تابع گرفتن معرف نهایی (کد رفرال یا دیپلویر)
async function getFinalReferrer(contract) {
  let ref = getReferrerFromURL();
  if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) return ref;
  // اگر کد رفرال نبود، دیپلویر را بگیر
  try {
    return await contract.deployer();
  } catch (e) {
    return null;
  }
}

// نمایش modal ثبت‌نام برای گره خالی - بهینه‌سازی شده برای موبایل
function showRegisterModal(parentIndex, parentAddress) {
    // ابتدا modal قبلی را حذف کن
    let old = document.getElementById('register-modal');
    if (old) old.remove();
    
    // ساخت modal
    const modal = document.createElement('div');
    modal.id = 'register-modal';
    modal.style = `
      position: fixed;
      z-index: 3000;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      box-sizing: border-box;
    `;
    
    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #232946, #181c2a);
        padding: 1.5rem;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        direction: rtl;
        position: relative;
        border: 2px solid #a786ff;
      ">
        <!-- Header -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #a786ff;
        ">
          <h3 style="
            color: #00ff88;
            margin: 0;
            font-size: 1.3rem;
            font-weight: bold;
            text-align: center;
            flex: 1;
          ">🌳 ثبت‌نام زیرمجموعه</h3>
          <button id="register-modal-close" style="
            background: none;
            border: none;
            color: #fff;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s;
          " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">×</button>
        </div>

        <!-- Referrer Info -->
        <div style="
          background: rgba(167, 134, 255, 0.1);
          border: 1px solid #a786ff;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        ">
          <div style="color: #a786ff; font-weight: bold; margin-bottom: 0.8rem;">👤 اطلاعات معرف:</div>
          <div style="display: grid; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #fff;">📊 Index:</span>
              <span style="color: #00ff88; font-weight: bold;">${parentIndex}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #fff;">🔗 Address:</span>
              <span style="
                color: #00ff88;
                font-family: monospace;
                font-size: 0.9rem;
                word-break: break-all;
                max-width: 60%;
                text-align: left;
              ">${parentAddress}</span>
            </div>
          </div>
        </div>

        <!-- New Address Input -->
        <div style="margin-bottom: 1.5rem;">
          <label for="register-new-address" style="
            display: block;
            color: #fff;
            font-weight: bold;
            margin-bottom: 0.5rem;
          ">🔑 آدرس ولت جدید:</label>
          <input id="register-new-address" 
            type="text" 
            placeholder="0x..." 
            style="
              width: 100%;
              padding: 1rem;
              border-radius: 12px;
              border: 2px solid #a786ff;
              background: rgba(0,0,0,0.3);
              color: #fff;
              font-family: monospace;
              font-size: 1rem;
              direction: ltr;
              text-align: left;
              box-sizing: border-box;
              transition: border-color 0.3s;
            "
            onfocus="this.style.borderColor='#00ff88'"
            onblur="this.style.borderColor='#a786ff'"
          />
        </div>

        <!-- Fee Info -->
        <div id="register-fee-info" style="
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid #ff6b6b;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
          color: #ff6b6b;
          font-weight: bold;
          text-align: center;
        ">در حال بارگذاری اطلاعات هزینه...</div>

        <!-- MATIC Info -->
        <div id="register-matic-info" style="
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid #00ff88;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #00ff88;
          font-weight: bold;
          text-align: center;
        ">در حال بارگذاری موجودی MATIC...</div>

        <!-- Action Button -->
        <button id="register-submit-btn" style="
          background: linear-gradient(135deg, #00ff88, #00cc66);
          color: #232946;
          font-weight: bold;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
          width: 100%;
        " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,255,136,0.4)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(0,255,136,0.3)'">
          ✅ ثبت‌نام زیرمجموعه
        </button>

        <!-- Status Message -->
        <div id="register-modal-status" style="
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          font-weight: bold;
          min-height: 20px;
        "></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // بستن modal
    document.getElementById('register-modal-close').onclick = () => modal.remove();
    
    // Close on background click
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
    // گرفتن اطلاعات هزینه ثبت‌نام و موجودی متیک
    (async function() {
      try {
        const { contract, address, provider } = await window.connectWallet();
        // مقدار توکن مورد نیاز (فرض: contract.registrationFee())
        let fee = '-';
        try {
          if (contract.registrationFee) {
            const feeVal = await contract.registrationFee();
            fee = window.ethers ? window.ethers.formatUnits(feeVal, 18) : feeVal.toString();
          } else {
            fee = '---';
          }
        } catch (e) { fee = '---'; }
        document.getElementById('register-fee-info').textContent = `Registration Fee: ${fee} CPA`;
        // موجودی متیک
        let matic = '-';
        try {
          if (provider && address) {
            const bal = await provider.getBalance(address);
            matic = window.ethers ? window.ethers.formatUnits(bal, 18) : bal.toString();
          }
        } catch (e) { matic = '---'; }
        document.getElementById('register-matic-info').textContent = `Your MATIC Balance: ${matic}`;
      } catch (e) {
        document.getElementById('register-fee-info').textContent = 'Error loading fee info';
        document.getElementById('register-matic-info').textContent = 'Error loading MATIC balance';
      }
    })();
    // ثبت‌نام
    document.getElementById('register-submit-btn').onclick = async function() {
      const status = document.getElementById('register-modal-status');
      status.textContent = '';
      const newAddr = document.getElementById('register-new-address').value.trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(newAddr)) {
        status.textContent = 'آدرس ولت جدید معتبر نیست!';
        return;
      }
      // استفاده از منطق ثبت‌نام اصلی پروژه
      if (window.registerNewUserWithReferrer) {
        const referrerAddress = await getFinalReferrer(contract);
        if (!referrerAddress) {
          status.textContent = 'معرف معتبری پیدا نشد. لطفاً به صفحه قبلی بروید یا یک کد رفرال در URL ارسال کنید.';
          return;
        }
        await window.registerNewUserWithReferrer(referrerAddress, newAddr, status);
        // بعد از موفقیت، درخت شبکه را رفرش کن
        setTimeout(() => { modal.remove(); window.renderSimpleBinaryTree && window.renderSimpleBinaryTree(); }, 1500);
      } else {
        status.textContent = 'تابع ثبت‌نام اصلی پیدا نشد!';
      }
    };
}

// هندل کلیک روی علامت سؤال (گره خالی)
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('empty-node')) {
    const parentIndex = e.target.getAttribute('data-index');
    (async function() {
      try {
        const { contract } = await window.connectWallet();
        // اگر parentIndex صفر است، معرف وجود ندارد (ریشه)
        if (parentIndex === 0) {
          alert('ثبت‌نام زیر ریشه مجاز نیست!');
          return;
        }
        const referrerAddress = await contract.indexToAddress(BigInt(parentIndex));
        if (!referrerAddress || referrerAddress === '0x0000000000000000000000000000000000000000') {
          // فقط اگر آدرس صفر بود، ثبت‌نام مجاز نیست
          return;
        }
        showRegisterModal(parentIndex, referrerAddress); // معرف = آدرس گره والد واقعی
      } catch (e) {
        alert('خطا در دریافت آدرس معرف: ' + (e && e.message ? e.message : e));
      }
    })();
  }
}); 