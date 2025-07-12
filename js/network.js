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

// نمایش modal ثبت‌نام برای گره خالی
function showRegisterModal(parentIndex, parentAddress) {
    // ابتدا modal قبلی را حذف کن
    let old = document.getElementById('register-modal');
    if (old) old.remove();
    // ساخت modal
    const modal = document.createElement('div');
    modal.id = 'register-modal';
    modal.style = 'position:fixed;z-index:3000;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:#232946;padding:2rem 2.5rem;border-radius:18px;box-shadow:0 8px 32px #000a;min-width:320px;max-width:95vw;direction:ltr;position:relative;">
        <button id="register-modal-close" style="position:absolute;top:10px;right:10px;font-size:1.3rem;background:none;border:none;color:#fff;cursor:pointer;">×</button>
        <div style="margin-bottom:1.2rem;padding:0.7rem 1rem;background:#181c2a;border-radius:10px;border:1px solid #a786ff;">
          <span style='color:#a786ff;font-size:1.1rem;font-weight:bold;'>معرف (Referrer):</span><br>
          <span style='color:#fff;font-size:1rem;'><b>Index:</b> ${parentIndex}</span><br>
          <span style='color:#00ff88;font-family:monospace;font-size:1rem;'><b>Address:</b> ${parentAddress}</span>
        </div>
        <h3 style="color:#00ff88;margin-bottom:1.2rem;">ثبت‌نام زیرمجموعه جدید</h3>
        <div style="margin-bottom:0.7rem;">
          <label style="color:#fff;">آدرس ولت جدید:</label><br>
          <input id="register-new-address" type="text" placeholder="0x..." style="width:100%;padding:0.5rem;border-radius:8px;border:1px solid #a786ff;margin-top:0.3rem;direction:ltr;" />
        </div>
        <div id="register-fee-info" style="color:#fff;margin-bottom:0.7rem;font-size:0.95rem;">Loading fee info...</div>
        <div id="register-matic-info" style="color:#fff;margin-bottom:1.2rem;font-size:0.95rem;">Loading MATIC balance...</div>
        <button id="register-submit-btn" style="background:#00ff88;color:#232946;font-weight:bold;padding:0.7rem 2.2rem;border:none;border-radius:10px;font-size:1.1rem;cursor:pointer;">ثبت‌نام</button>
        <div id="register-modal-status" style="margin-top:1rem;color:#ff6b6b;"></div>
      </div>
    `;
    document.body.appendChild(modal);
    // بستن modal
    document.getElementById('register-modal-close').onclick = () => modal.remove();
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