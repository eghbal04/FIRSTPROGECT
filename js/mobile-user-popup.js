// نمایش اطلاعات کاربر در موبایل
class MobileUserPopup {
    constructor() {
        this.popup = null;
        this.backdrop = null;
        this.touchStartY = 0;
        this.currentY = 0;
        this.setupPopup();
    }

    setupPopup() {
        // ایجاد پاپ‌آپ اصلی
        this.popup = document.createElement('div');
        this.popup.id = 'user-popup';
        
        // ایجاد backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'popup-backdrop';
        this.backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 9998;
            display: none;
        `;
        
        // اضافه کردن به DOM
        document.body.appendChild(this.backdrop);
        document.body.appendChild(this.popup);
        
        // تنظیم event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // کلیک روی backdrop
        this.backdrop.addEventListener('click', () => this.hide());

        // تنظیم gesture برای موبایل
        this.popup.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
            this.popup.style.transition = 'none';
        });

        this.popup.addEventListener('touchmove', (e) => {
            this.currentY = e.touches[0].clientY;
            const deltaY = this.currentY - this.touchStartY;

            if (deltaY > 0) { // فقط اجازه کشیدن به پایین
                e.preventDefault();
                this.popup.style.transform = `translateY(${deltaY}px)`;
                const opacity = Math.max(0.5 - (deltaY / 1000), 0);
                this.backdrop.style.opacity = opacity.toString();
            }
        });

        this.popup.addEventListener('touchend', () => {
            const deltaY = this.currentY - this.touchStartY;
            this.popup.style.transition = 'transform 0.3s ease-out';
            
            if (deltaY > 100) {
                this.hide();
            } else {
                this.popup.style.transform = 'translateY(0)';
                this.backdrop.style.opacity = '0.5';
            }
        });
    }

    show(address, user) {
        if (!user) return;

        const cpaId = user.index !== undefined ? (window.generateCPAId ? window.generateCPAId(user.index) : user.index) : '-';
        const walletAddress = address || '-';
        const isActive = user.activated || false;
        
        const infoList = [
            {icon:'🎯', label:'امتیاز باینری', val:user.binaryPoints},
            {icon:'🏆', label:'سقف باینری', val:user.binaryPointCap},
            {icon:'💎', label:'پاداش باینری', val:user.totalMonthlyRewarded},
            {icon:'✅', label:'امتیاز دریافتی', val:user.binaryPointsClaimed},
            {icon:'🤝', label:'درآمد رفرال', val:user.refclimed ? Math.floor(Number(user.refclimed) / 1e18) : 0},
            {icon:'💰', label:'سپرده کل', val:user.depositedAmount ? Math.floor(Number(user.depositedAmount) / 1e18) : 0},
            {icon:'⬅️', label:'امتیاز چپ', val:user.leftPoints},
            {icon:'➡️', label:'امتیاز راست', val:user.rightPoints}
        ];

        this.popup.innerHTML = `
            <div class="user-info-card">
                <div class="popup-handle"></div>
                <button class="close-btn" onclick="window.mobileUserPopup.hide()">×</button>
                
                <div class="user-header">
                    <div class="user-primary-info">
                        <div class="user-id">
                            <span class="label">شناسه کاربر</span>
                            <span class="value" onclick="navigator.clipboard.writeText('${cpaId}')">${cpaId}</span>
                        </div>
                        <div class="user-status ${isActive ? 'active' : 'inactive'}">
                            ${isActive ? '✅ فعال' : '❌ غیرفعال'}
                        </div>
                    </div>
                    <div class="user-wallet" onclick="navigator.clipboard.writeText('${walletAddress}')">
                        ${this.shortAddress(walletAddress)}
                    </div>
                </div>

                <div class="user-stats">
                    ${infoList.map(info => `
                        <div class="stat-item">
                            <div class="stat-icon">${info.icon}</div>
                            <div class="stat-details">
                                <div class="stat-label">${info.label}</div>
                                <div class="stat-value">${info.val !== undefined && info.val !== null ? info.val : '-'}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div id="live-balances" class="live-balances">
                    <div class="balance-title">موجودی‌های زنده</div>
                    <div class="balance-grid">
                        <div class="balance-item">
                            <span>🟢</span>
                            <span>CPA</span>
                            <span class="balance-value" id="cpa-balance">-</span>
                        </div>
                        <div class="balance-item">
                            <span>🟣</span>
                            <span>MATIC</span>
                            <span class="balance-value" id="matic-balance">-</span>
                        </div>
                        <div class="balance-item">
                            <span>💵</span>
                            <span>DAI</span>
                            <span class="balance-value" id="dai-balance">-</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // نمایش پاپ‌آپ و backdrop
        this.backdrop.style.display = 'block';
        this.popup.classList.add('active');
        setTimeout(() => {
            this.backdrop.style.opacity = '0.5';
        }, 50);

        // دریافت موجودی‌های زنده
        this.getLiveBalances(walletAddress);
    }

    hide() {
        this.popup.style.transform = 'translateY(100%)';
        this.backdrop.style.opacity = '0';
        
        setTimeout(() => {
            this.popup.classList.remove('active');
            this.backdrop.style.display = 'none';
            this.popup.style.transform = '';
        }, 300);
    }

    shortAddress(addr) {
        if (!addr || addr === '-') return '-';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }

    async getLiveBalances(address) {
        if (!address || address === '-') return;

        // نمایش وضعیت در حال بارگذاری
        document.getElementById('cpa-balance').textContent = '⏳';
        document.getElementById('matic-balance').textContent = '⏳';
        document.getElementById('dai-balance').textContent = '⏳';

        try {
            // اتصال به کیف پول
            if (!window.ethereum) {
                alert('لطفاً MetaMask یا یک کیف پول سازگار نصب کنید');
                return;
            }

            try {
                // درخواست اتصال به کیف پول
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                // ایجاد provider
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                
                // بررسی شبکه
                const network = await provider.getNetwork();
                if (network.chainId !== 137) { // Polygon Mainnet
                    try {
                        // تغییر به شبکه Polygon
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: '0x89' }], // 137 در هگزادسیمال
                        });
                    } catch (switchError) {
                        // اگر شبکه وجود نداشت، آن را اضافه می‌کنیم
                        if (switchError.code === 4902) {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [{
                                    chainId: '0x89',
                                    chainName: 'Polygon Mainnet',
                                    nativeCurrency: {
                                        name: 'MATIC',
                                        symbol: 'MATIC',
                                        decimals: 18
                                    },
                                    rpcUrls: ['https://polygon-rpc.com'],
                                    blockExplorerUrls: ['https://polygonscan.com']
                                }]
                            });
                        }
                    }
                }

                // دریافت موجودی MATIC
                try {
                    const maticBalance = await provider.getBalance(address);
                    const matic = Number(ethers.utils.formatEther(maticBalance)).toFixed(4);
                    document.getElementById('matic-balance').textContent = matic;
                } catch(e) {
                    document.getElementById('matic-balance').textContent = '❌';
                    console.warn('خطا در دریافت موجودی MATIC:', e);
                }

                // دریافت موجودی CPA
                try {
                    const cpaAddress = window.CONTRACT_ADDRESS;
                    const cpaAbi = window.CONTRACT_ABI;
                    if (cpaAddress && cpaAbi) {
                        const cpaContract = new ethers.Contract(cpaAddress, cpaAbi, provider);
                        const cpaRaw = await cpaContract.balanceOf(address);
                        const cpa = Number(ethers.utils.formatEther(cpaRaw)).toFixed(2);
                        document.getElementById('cpa-balance').textContent = cpa;
                    } else {
                        throw new Error('Contract info not found');
                    }
                } catch(e) {
                    document.getElementById('cpa-balance').textContent = '❌';
                    console.warn('خطا در دریافت موجودی CPA:', e);
                }

                // دریافت موجودی DAI
                try {
                    // استفاده از DAI برای تست ولی نمایش USDC
                    const DAI_ABI = [
                        "function balanceOf(address) view returns (uint256)",
                        "function decimals() view returns (uint8)"
                    ];
                    const daiContract = new ethers.Contract(window.DAI_ADDRESS, DAI_ABI, provider);
                    const daiRaw = await daiContract.balanceOf(address);
                    const dai = (Number(daiRaw) / 1e18).toFixed(2); // DAI has 18 decimals
                    document.getElementById('dai-balance').textContent = dai;
                } catch(e) {
                    document.getElementById('dai-balance').textContent = '❌';
                    console.warn('خطا در دریافت موجودی DAI:', e);
                }

            } catch(err) {
                console.error('خطا در اتصال به کیف پول:', err);
                document.getElementById('cpa-balance').textContent = '🔒';
                document.getElementById('matic-balance').textContent = '🔒';
                document.getElementById('dai-balance').textContent = '🔒';
            }

        } catch(e) {
            console.error('خطا در دریافت موجودی‌ها:', e);
            document.getElementById('cpa-balance').textContent = '❌';
            document.getElementById('matic-balance').textContent = '❌';
            document.getElementById('dai-balance').textContent = '❌';
        }
    }
}

// ایجاد نمونه از کلاس
window.mobileUserPopup = new MobileUserPopup();
