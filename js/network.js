// network.js - نمایش درخت باینری ستونی با ایندکس عددی و آدرس ولت کوتاه به صورت لینک

function shortWallet(address) {
    if (!address) return '-';
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
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
    console.log('renderTreeNode called with index:', index.toString(), 'level:', level);
    if (typeof index === 'number') index = BigInt(index);
    let address;
    let userData;
    try {
        address = await contract.indexToAddress(index);
        userData = await contract.users(address);
        console.log('Node data retrieved:', { address, userData: !!userData });
    } catch (e) {
        console.error('Error getting node data:', e);
        address = null;
        userData = null;
    }
    if (!address || address === '0x0000000000000000000000000000000000000000') {
        console.log('Empty node at index:', index.toString());
        // گره خالی: نمایش ادمک علامت سوال
        let referrerAddress = null;
        try {
            referrerAddress = await contract.getReferrer(index);
        } catch (e) {
            referrerAddress = null;
        }
        // اگر معرف خالی یا صفر بود، مقدار را برابر با آدرس دیپلویِر قرار بده
        if (!referrerAddress || referrerAddress === '0x0000000000000000000000000000000000000000') {
            try {
                referrerAddress = await contract.deployer();
            } catch (e) {
                // اگر باز هم نشد، خالی بگذار
                referrerAddress = null;
            }
        }
        
        // ساختار گره خالی با ادمک علامت سوال
        const emptyNodeDiv = document.createElement('div');
        emptyNodeDiv.className = 'empty-tree-node';
        emptyNodeDiv.style.display = 'flex';
        emptyNodeDiv.style.alignItems = 'center';
        emptyNodeDiv.style.justifyContent = 'center';
        emptyNodeDiv.style.margin = '0.5rem 0';
        emptyNodeDiv.style.position = 'relative';
        emptyNodeDiv.style.cursor = 'pointer';
        emptyNodeDiv.style.transition = 'transform 0.2s';
        emptyNodeDiv.style.userSelect = 'none';
        
        // ادمک علامت سوال
        const questionEmoji = document.createElement('div');
        questionEmoji.textContent = '❓';
        questionEmoji.style.fontSize = '2em';
        questionEmoji.style.transition = 'transform 0.2s';
        questionEmoji.style.opacity = '0.7';
        
        // انیمیشن hover
        emptyNodeDiv.onmouseenter = () => {
            questionEmoji.style.transform = 'scale(1.2)';
            questionEmoji.style.opacity = '1';
        };
        emptyNodeDiv.onmouseleave = () => {
            questionEmoji.style.transform = 'scale(1)';
            questionEmoji.style.opacity = '0.7';
        };
        
        // کلیک روی ادمک برای باز کردن فرم
        emptyNodeDiv.onclick = function(e) {
            e.stopPropagation();
            
            // حذف فرم قبلی
            let oldForm = document.getElementById('registration-form-popup');
            if (oldForm) oldForm.remove();
            
            // ایجاد فرم جدید
            const formPopup = document.createElement('div');
            formPopup.id = 'registration-form-popup';
            formPopup.style.position = 'fixed';
            formPopup.style.top = '50%';
            formPopup.style.left = '50%';
            formPopup.style.transform = 'translate(-50%, -50%)';
            formPopup.style.background = '#181c2a';
            formPopup.style.color = '#fff';
            formPopup.style.padding = '2rem';
            formPopup.style.borderRadius = '16px';
            formPopup.style.boxShadow = '0 8px 32px #000a';
            formPopup.style.zIndex = '9999';
            formPopup.style.minWidth = '400px';
            formPopup.style.border = '2px solid #00ff88';
            
            // محتوای فرم
            formPopup.innerHTML = `
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="font-size: 2em; margin-bottom: 0.5rem;">👔</div>
                    <h3 style="color: #00ff88; margin: 0;">ثبت کاربر جدید</h3>
                    <div style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
                        <span style="font-size: 1.2em; cursor: pointer; opacity: 1; transition: opacity 0.2s;" onclick="changeRegistrationEmoji('👔', this)">👔</span>
                        <span style="font-size: 1.2em; cursor: pointer; opacity: 0.7; transition: opacity 0.2s;" onclick="changeRegistrationEmoji('👨‍💼', this)">👨‍💼</span>
                        <span style="font-size: 1.2em; cursor: pointer; opacity: 0.7; transition: opacity 0.2s;" onclick="changeRegistrationEmoji('👩‍💼', this)">👩‍💼</span>
                        <span style="font-size: 1.2em; cursor: pointer; opacity: 0.7; transition: opacity 0.2s;" onclick="changeRegistrationEmoji('👨‍💻', this)">👨‍💻</span>
                        <span style="font-size: 1.2em; cursor: pointer; opacity: 0.7; transition: opacity 0.2s;" onclick="changeRegistrationEmoji('👩‍💻', this)">👩‍💻</span>
                        <span style="font-size: 1.2em; cursor: pointer; opacity: 0.7; transition: opacity 0.2s;" onclick="changeRegistrationEmoji('👨‍🎓', this)">👨‍🎓</span>
                        <span style="font-size: 1.2em; cursor: pointer; opacity: 0.7; transition: opacity 0.2s;" onclick="changeRegistrationEmoji('👩‍🎓', this)">👩‍🎓</span>
                        <span style="font-size: 1.2em; cursor: pointer; opacity: 0.7; transition: opacity 0.2s;" onclick="changeRegistrationEmoji('👨‍⚕️', this)">👨‍⚕️</span>
                        <span style="font-size: 1.2em; cursor: pointer; opacity: 0.7; transition: opacity 0.2s;" onclick="changeRegistrationEmoji('👩‍⚕️', this)">👩‍⚕️</span>
                        <span style="font-size: 1.2em; cursor: pointer; opacity: 0.7; transition: opacity 0.2s;" onclick="changeRegistrationEmoji('👨‍🏫', this)">👨‍🏫</span>
                        <span style="font-size: 1.2em; cursor: pointer; opacity: 0.7; transition: opacity 0.2s;" onclick="changeRegistrationEmoji('👩‍🏫', this)">👩‍🏫</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <div style="color: #a786ff; font-size: 0.9rem; margin-bottom: 0.5rem;">معرف:</div>
                    <div style="background: #232946; padding: 0.5rem; border-radius: 8px; font-family: monospace; font-size: 0.9rem; color: #b8c1ec;">
                        ${referrerAddress ? shortWallet(referrerAddress) : '-'}
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <div style="color: #a786ff; font-size: 0.9rem; margin-bottom: 0.5rem;">آدرس ولت کاربر جدید:</div>
                    <input type="text" id="new-user-address" placeholder="0x..." 
                           style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #a786ff55; background: #232946; color: #fff; font-size: 0.95em; direction: ltr; box-sizing: border-box;">
                </div>
                
                <div id="registration-status" style="margin-bottom: 1rem; font-size: 0.9rem;"></div>
                
                <div style="display: flex; gap: 1rem;">
                    <button id="register-new-user" style="flex: 1; padding: 0.8rem; border-radius: 8px; background: #00ff88; color: #000; border: none; cursor: pointer; font-weight: bold; font-size: 0.95em;">
                        ثبت کاربر
                    </button>
                    <button id="close-registration-form" style="flex: 1; padding: 0.8rem; border-radius: 8px; background: #ff4444; color: #fff; border: none; cursor: pointer; font-weight: bold; font-size: 0.95em;">
                        انصراف
                    </button>
                </div>
            `;
            
            document.body.appendChild(formPopup);
            
            // راه‌اندازی دکمه‌ها
            document.getElementById('register-new-user').onclick = function() {
                const newAddress = document.getElementById('new-user-address').value.trim();
                const statusDiv = document.getElementById('registration-status');
                
                if (newAddress && referrerAddress) {
                    if (typeof window.registerNewUserWithReferrer === 'function') {
                        window.registerNewUserWithReferrer(referrerAddress, newAddress, statusDiv);
                    } else {
                        statusDiv.textContent = 'برای ثبت‌نام باید کیف پول متصل و مقدار کافی توکن CPA داشته باشید.';
                        statusDiv.style.color = '#ff4444';
                    }
                } else {
                    statusDiv.textContent = 'آدرس رفرر یافت نشد یا آدرس وارد نشد.';
                    statusDiv.style.color = '#ff4444';
                }
            };
            
                    document.getElementById('close-registration-form').onclick = function() {
            formPopup.remove();
        };
        
        // راه‌اندازی تابع تغییر ادمک
        window.changeRegistrationEmoji = function(emoji, element) {
            // تغییر ادمک اصلی
            const mainEmoji = formPopup.querySelector('div[style*="font-size: 2em"]');
            if (mainEmoji) {
                mainEmoji.textContent = emoji;
            }
            
            // تغییر opacity همه ادمک‌ها
            const allEmojis = formPopup.querySelectorAll('span[onclick*="changeRegistrationEmoji"]');
            allEmojis.forEach(span => {
                span.style.opacity = '0.7';
            });
            
            // فعال کردن ادمک انتخاب شده
            element.style.opacity = '1';
        };
        };
        
        // مونتاژ گره خالی
        emptyNodeDiv.appendChild(questionEmoji);
        container.appendChild(emptyNodeDiv);
        return;
    }
    console.log('Creating node for address:', address);
    // ساختار گره به صورت ادمک ساده
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'modern-tree-node';
    nodeDiv.style.display = 'flex';
    nodeDiv.style.alignItems = 'center';
    nodeDiv.style.justifyContent = 'center';
    nodeDiv.style.margin = '0.5rem 0';
    nodeDiv.style.position = 'relative';
    nodeDiv.style.cursor = 'pointer';
    nodeDiv.style.transition = 'transform 0.2s';
    nodeDiv.style.userSelect = 'none';
    
    // ادمک با سر
    const emojiDiv = document.createElement('div');
    emojiDiv.textContent = '👨‍💼';
    emojiDiv.style.fontSize = '2.5em';
    emojiDiv.style.transition = 'transform 0.2s';
    emojiDiv.style.position = 'relative';
    emojiDiv.style.zIndex = '2';
    
    // انیمیشن hover
    nodeDiv.onmouseenter = () => {
        emojiDiv.style.transform = 'scale(1.2)';
    };
    nodeDiv.onmouseleave = () => {
        emojiDiv.style.transform = 'scale(1)';
    };
    
    // کلیک روی ادمک
    nodeDiv.onclick = function(e) {
        e.stopPropagation();
        console.log('Emoji clicked!');
        console.log('Node clicked:', address, userData);
        
        // نمایش اطلاعات در باکس موجودی شما
        if (window.updateUserBalanceBoxWithNode) {
            console.log('Calling updateUserBalanceBoxWithNode');
            window.updateUserBalanceBoxWithNode(address, userData);
        } else {
            console.log('updateUserBalanceBoxWithNode function not found');
        }
        
        // باز/بسته کردن سطح بعدی
        if (childrenDiv.style.display === 'none') {
            childrenDiv.style.display = 'flex';
            if (!childrenDiv.hasChildNodes()) {
                // ایجاد container برای فرزندان
                const childrenContainer = document.createElement('div');
                childrenContainer.style.display = 'flex';
                childrenContainer.style.justifyContent = 'space-between';
                childrenContainer.style.width = '100%';
                childrenContainer.style.position = 'relative';
                childrenContainer.style.marginTop = '1rem';
                
                // خط عمودی از والد به فرزندان
                const verticalLine = document.createElement('div');
                verticalLine.style.position = 'absolute';
                verticalLine.style.top = '-1rem';
                verticalLine.style.left = '50%';
                verticalLine.style.transform = 'translateX(-50%)';
                verticalLine.style.width = '2px';
                verticalLine.style.height = '1rem';
                verticalLine.style.background = '#00ff88';
                verticalLine.style.zIndex = '1';
                childrenContainer.appendChild(verticalLine);
                
                // container برای فرزند راست
                const rightChildContainer = document.createElement('div');
                rightChildContainer.style.display = 'flex';
                rightChildContainer.style.flexDirection = 'column';
                rightChildContainer.style.alignItems = 'center';
                rightChildContainer.style.position = 'relative';
                rightChildContainer.style.width = '50%';
                
                // container برای فرزند چپ
                const leftChildContainer = document.createElement('div');
                leftChildContainer.style.display = 'flex';
                leftChildContainer.style.flexDirection = 'column';
                leftChildContainer.style.alignItems = 'center';
                leftChildContainer.style.position = 'relative';
                leftChildContainer.style.width = '50%';
                
                // خط افقی بین فرزندان
                const horizontalLine = document.createElement('div');
                horizontalLine.style.position = 'absolute';
                horizontalLine.style.top = '0';
                horizontalLine.style.left = '0';
                horizontalLine.style.right = '0';
                horizontalLine.style.height = '2px';
                horizontalLine.style.background = '#00ff88';
                horizontalLine.style.zIndex = '1';
                childrenContainer.appendChild(horizontalLine);
                
                // خطوط عمودی به فرزندان
                const leftVerticalLine = document.createElement('div');
                leftVerticalLine.style.position = 'absolute';
                leftVerticalLine.style.top = '0';
                leftVerticalLine.style.left = '25%';
                leftVerticalLine.style.width = '2px';
                leftVerticalLine.style.height = '1rem';
                leftVerticalLine.style.background = '#00ff88';
                leftVerticalLine.style.zIndex = '1';
                childrenContainer.appendChild(leftVerticalLine);
                
                const rightVerticalLine = document.createElement('div');
                rightVerticalLine.style.position = 'absolute';
                rightVerticalLine.style.top = '0';
                rightVerticalLine.style.right = '25%';
                rightVerticalLine.style.width = '2px';
                rightVerticalLine.style.height = '1rem';
                rightVerticalLine.style.background = '#00ff88';
                rightVerticalLine.style.zIndex = '1';
                childrenContainer.appendChild(rightVerticalLine);
                
                // اول فرزند راست، بعد چپ
                renderTreeNode(contract, index * 2n + 1n, rightChildContainer, level + 1);
                renderTreeNode(contract, index * 2n, leftChildContainer, level + 1);
                
                childrenContainer.appendChild(rightChildContainer);
                childrenContainer.appendChild(leftChildContainer);
                childrenDiv.appendChild(childrenContainer);
            }
        } else {
            childrenDiv.style.display = 'none';
        }
    };
    
    // خطوط عمودی بین والد و فرزند (در صورت وجود فرزند)
    const childrenDiv = document.createElement('div');
    childrenDiv.style.display = 'none';
    childrenDiv.style.position = 'relative';
    childrenDiv.style.width = '100%';
    
    // مونتاژ گره
    nodeDiv.appendChild(emojiDiv);
    container.appendChild(nodeDiv);
    container.appendChild(childrenDiv);
    console.log('Node added to container:', address);
}

window.renderNetworkTree = async function(rootAddress) {
    console.log('renderNetworkTree called with rootAddress:', rootAddress);
    const container = document.getElementById('network-tree');
    if (!container) {
        console.log('network-tree container not found');
        return;
    }
    console.log('Found network-tree container, clearing content');
    container.innerHTML = '';
    try {
        const { contract } = window.contractConfig;
        console.log('Contract config found:', !!contract);
        let index = await contract.users(rootAddress).then(u => typeof u.index === 'number' ? BigInt(u.index) : u.index);
        console.log('User index:', index.toString());
        await renderTreeNode(contract, index, container, 0);
        console.log('Network tree rendered successfully');
    } catch (e) {
        console.error('Error rendering network tree:', e);
        container.innerHTML = '<div style="color:#ff4444;text-align:center;padding:2rem;">خطا در بارگذاری درخت شبکه</div>';
    }
};

window.networkRendered = false;

window.initializeNetworkTab = async function() {
    if (window.networkRendered) return;
    window.networkRendered = true;
    console.log('initializeNetworkTab called');
    // حذف فرم وسط صفحه (کارت اطلاعات کاربر شبکه)
    var userCard = document.getElementById('network-user-card');
    if (userCard) userCard.remove();
    if (!window.contractConfig || !window.contractConfig.address) {
        console.log('No contract config or address found');
        return;
    }
    console.log('Contract config and address found, calling renderNetworkTree');
    await window.renderNetworkTree(window.contractConfig.address);
    // راه‌اندازی بخش ثبت‌نام و ارتقا
    if (typeof window.setRegisterTabSelected === 'function') {
        window.setRegisterTabSelected(true);
    }
    // راه‌اندازی دکمه‌های ثبت‌نام و ارتقا
    if (typeof setupRegistrationButton === 'function') {
        setupRegistrationButton();
    }
    if (typeof setupUpgradeForm === 'function') {
        setupUpgradeForm();
    }
};

// بارگذاری خودکار درخت شبکه در زمان رفرش صفحه
document.addEventListener('DOMContentLoaded', async function() {
    // کمی صبر کن تا همه اسکریپت‌ها لود شوند
    setTimeout(async () => {
        try {
            // اگر تب network فعال است، درخت را بارگذاری کن
            const networkSection = document.getElementById('main-network');
            if (networkSection && networkSection.style.display !== 'none') {
                if (typeof window.initializeNetworkTab === 'function') {
                    await window.initializeNetworkTab();
                }
            }
        } catch (error) {
            console.log('Auto-load network tree error:', error);
        }
    }, 3000); // 3 ثانیه صبر کن تا همه چیز لود شود
});

// بارگذاری خودکار درخت شبکه بعد از اتصال کیف پول
window.addEventListener('load', async function() {
    // کمی صبر کن تا همه چیز لود شود
    setTimeout(async () => {
        try {
            // اگر تب network فعال است، درخت را بارگذاری کن
            const networkSection = document.getElementById('main-network');
            if (networkSection && networkSection.style.display !== 'none') {
                if (typeof window.initializeNetworkTab === 'function') {
                    await window.initializeNetworkTab();
                }
            }
        } catch (error) {
            console.log('Window load network tree error:', error);
        }
    }, 5000); // 5 ثانیه صبر کن تا همه چیز لود شود
});

// بارگذاری درخت شبکه وقتی کیف پول متصل می‌شود
const originalConnectWallet = window.connectWallet;
if (originalConnectWallet) {
    window.connectWallet = async function() {
        const result = await originalConnectWallet();
        
        // بعد از اتصال موفق، درخت شبکه را بارگذاری کن
        setTimeout(async () => {
            try {
                const networkSection = document.getElementById('main-network');
                if (networkSection && networkSection.style.display !== 'none') {
                    if (typeof window.initializeNetworkTab === 'function') {
                        await window.initializeNetworkTab();
                    }
                }
            } catch (error) {
                console.log('Network tree load after wallet connect error:', error);
            }
        }, 1500);
        
        return result;
    };
} 