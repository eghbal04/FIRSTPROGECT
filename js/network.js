// network.js - نمایش درخت باینری ستونی با ایندکس عددی و آدرس ولت کوتاه به صورت لینک

function shortWallet(address) {
    if (!address) return '---';
    if (address.length <= 7) return address;
    return address.substring(0, 2) + '...' + address.substring(address.length - 2);
}

function showUserInfoPopup(address, userData) {
    // حذف قبلی
    let old = document.getElementById('user-info-popup');
    if (old) old.remove();
    // آرایه فیلدها با نام فارسی و کلید struct
    const fieldNames = [
      { key: 'index', label: 'ایندکس' },
      { key: 'binaryPoints', label: 'امتیاز باینری' },
      { key: 'binaryPointCap', label: 'سقف درآمد باینری' },
      { key: 'binaryPointsClaimed', label: 'دریافت‌شده' },
      { key: 'activated', label: 'فعال' },
      { key: 'totalPurchasedKind', label: 'حجم فروش' },
      { key: 'lastClaimTime', label: 'آخرین برداشت' },
      { key: 'leftPoints', label: 'امتیاز چپ' },
      { key: 'rightPoints', label: 'امتیاز راست' }
    ];
    // تابع تبدیل یونیکس به تاریخ و ساعت خوانا
    function formatTimestamp(ts) {
        if (!ts || ts === '0') return '-';
        const d = new Date(Number(ts) * 1000);
        return d.toLocaleString('fa-IR');
    }
    // ساخت باکس
    const popup = document.createElement('div');
    popup.id = 'user-info-popup';
    popup.style.position = 'fixed';
    popup.style.top = '30%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = '#181c2a';
    popup.style.color = '#fff';
    popup.style.padding = '1.2rem 2.2rem';
    popup.style.borderRadius = '16px';
    popup.style.boxShadow = '0 8px 32px #000a';
    popup.style.zIndex = 9999;
    popup.style.minWidth = '320px';
    popup.style.fontSize = '1.05em';
    let info = `<div style='text-align:left;direction:ltr;font-size:0.95em;margin-bottom:0.7rem;'><b>${address}</b></div>`;
    fieldNames.forEach((f, i) => {
      let val = userData[f.key];
      if (val === undefined && userData[i] !== undefined) val = userData[i];
      if (f.key === 'lastClaimTime') {
        val = formatTimestamp(val);
      } else if (typeof val === 'bigint' || typeof val === 'number') {
        val = val.toString();
      } else if (typeof val === 'boolean') {
        val = val ? 'بله' : 'خیر';
      }
      info += `<div><b>${f.label}:</b> ${val ?? '-'}</div>`;
    });
    // اضافه کردن لینک رفرال
    const referralLink = `${window.location.origin}/?ref=${address}`;
    info += `
        <div style='margin-top:1.2rem;padding-top:1rem;border-top:1px solid #a786ff33;'>
            <div style='margin-bottom:0.5rem;color:#a786ff;font-weight:bold;'>لینک دعوت:</div>
            <div style='display:flex;align-items:center;gap:0.5rem;'>
                <input type='text' id='referral-link-input' value='${referralLink}' readonly style='flex:1;padding:0.5rem;border-radius:6px;border:1px solid #a786ff55;background:#232946;color:#fff;font-size:0.9em;direction:ltr;'>
                <button id='copy-referral-link' style='padding:0.5rem 1rem;border-radius:6px;background:#a786ff;color:#fff;border:none;cursor:pointer;font-size:0.9em;font-weight:bold;'>کپی</button>
            </div>
        </div>
    `;
    info += `<div style='margin-top:1.2rem;text-align:center;'><button id='close-user-info-popup' style='padding:0.5rem 1.5rem;border-radius:8px;background:#00ff88;color:#222;border:none;cursor:pointer;font-weight:bold;'>بستن</button></div>`;
    popup.innerHTML = info;
    document.body.appendChild(popup);
    
    // راه‌اندازی دکمه کپی
    document.getElementById('copy-referral-link').onclick = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            const copyBtn = document.getElementById('copy-referral-link');
            copyBtn.textContent = 'کپی شد!';
            copyBtn.style.background = '#4CAF50';
            setTimeout(() => {
                copyBtn.textContent = 'کپی';
                copyBtn.style.background = '#a786ff';
            }, 1500);
        } catch (error) {
            console.error('Error copying referral link:', error);
        }
    };
    
    document.getElementById('close-user-info-popup').onclick = () => popup.remove();
}

async function renderTreeNode(contract, index, container, level = 0) {
    if (typeof index === 'number') index = BigInt(index);
    let address;
    let userData;
    try {
        address = await contract.indexToAddress(index);
        userData = await contract.users(address);
    } catch (e) {
        address = null;
        userData = null;
    }
    if (!address || address === '0x0000000000000000000000000000000000000000') {
        // گره خالی: فقط یک فاصله عمودی کوچک
        const emptyDiv = document.createElement('div');
        emptyDiv.style.height = '1.7rem';
        container.appendChild(emptyDiv);
        return;
    }
    // ساختار گره با تم مدرن
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'modern-tree-node';
    nodeDiv.style.display = 'flex';
    nodeDiv.style.alignItems = 'center';
    nodeDiv.style.gap = '0.7rem';
    nodeDiv.style.fontSize = '1.08rem';
    nodeDiv.style.margin = '0.15rem 0';
    nodeDiv.style.marginRight = (level * 2) + 'rem';
    nodeDiv.style.background = 'linear-gradient(90deg, #181c2a 60%, #232946 100%)';
    nodeDiv.style.border = '1.5px solid #00ff88';
    nodeDiv.style.borderRadius = '12px';
    nodeDiv.style.boxShadow = '0 2px 12px #00ff8822, 0 1.5px 0 #00ff8844 inset';
    nodeDiv.style.transition = 'background 0.2s, box-shadow 0.2s';
    nodeDiv.style.position = 'relative';
    nodeDiv.onmouseenter = () => {
        nodeDiv.style.background = 'linear-gradient(90deg, #232946 60%, #181c2a 100%)';
        nodeDiv.style.boxShadow = '0 4px 24px #00ff8844, 0 2px 0 #00ff88cc inset';
    };
    nodeDiv.onmouseleave = () => {
        nodeDiv.style.background = 'linear-gradient(90deg, #181c2a 60%, #232946 100%)';
        nodeDiv.style.boxShadow = '0 2px 12px #00ff8822, 0 1.5px 0 #00ff8844 inset';
    };
    // مثلث کوچک
    const triangle = document.createElement('span');
    triangle.textContent = '▶';
    triangle.style.cursor = 'pointer';
    triangle.style.fontSize = '1.1em';
    triangle.style.userSelect = 'none';
    triangle.style.color = '#00ff88';
    triangle.style.transition = 'transform 0.2s, color 0.2s';
    // فقط عدد ایندکس
    const idxSpan = document.createElement('span');
    idxSpan.textContent = index.toString();
    idxSpan.style.color = '#fff';
    idxSpan.style.fontWeight = 'bold';
    idxSpan.style.fontSize = '1.08em';
    idxSpan.style.letterSpacing = '0.04em';
    // آدرس ولت کوتاه به صورت لینک
    const addrLink = document.createElement('a');
    addrLink.textContent = shortWallet(address);
    addrLink.href = '#';
    addrLink.style.color = '#a786ff';
    addrLink.style.textDecoration = 'underline';
    addrLink.style.fontFamily = 'monospace';
    addrLink.style.fontSize = '0.98em';
    addrLink.onmouseenter = () => addrLink.style.color = '#fff';
    addrLink.onmouseleave = () => addrLink.style.color = '#a786ff';
    addrLink.onclick = function(e) {
        e.preventDefault();
        showUserInfoPopup(address, userData);
    };
    // خطوط عمودی بین والد و فرزند (در صورت وجود فرزند)
    const childrenDiv = document.createElement('div');
    childrenDiv.style.display = 'none';
    childrenDiv.style.position = 'relative';
    if (level > 0) {
        nodeDiv.style.boxShadow += ', 4px 0 0 -2px #00ff8844 inset';
    }
    // رویداد باز/بسته کردن فرزندان
    let expanded = false;
    triangle.onclick = function(e) {
        e.stopPropagation();
        expanded = !expanded;
        triangle.textContent = expanded ? '▼' : '▶';
        triangle.style.color = expanded ? '#a786ff' : '#00ff88';
        if (expanded) {
            childrenDiv.style.display = 'block';
            if (!childrenDiv.hasChildNodes()) {
                // اول فرزند راست، بعد چپ
                renderTreeNode(contract, index * 2n + 1n, childrenDiv, level + 1);
                renderTreeNode(contract, index * 2n, childrenDiv, level + 1);
            }
        } else {
            childrenDiv.style.display = 'none';
        }
    };
    // مونتاژ گره
    nodeDiv.appendChild(triangle);
    nodeDiv.appendChild(idxSpan);
    nodeDiv.appendChild(addrLink);
    container.appendChild(nodeDiv);
    container.appendChild(childrenDiv);
}

window.renderNetworkTree = async function(rootAddress) {
    const container = document.getElementById('network-tree');
    if (!container) return;
    container.innerHTML = '';
    try {
        const { contract } = window.contractConfig;
        let index = await contract.users(rootAddress).then(u => typeof u.index === 'number' ? BigInt(u.index) : u.index);
        await renderTreeNode(contract, index, container, 0);
    } catch (e) {
        container.innerHTML = '<div style="color:#ff4444;text-align:center;padding:2rem;">خطا در بارگذاری درخت شبکه</div>';
    }
};

window.initializeNetworkTab = async function() {
    // حذف فرم وسط صفحه (کارت اطلاعات کاربر شبکه)
    var userCard = document.getElementById('network-user-card');
    if (userCard) userCard.remove();
    if (!window.contractConfig || !window.contractConfig.address) return;
    await window.renderNetworkTree(window.contractConfig.address);
}; 