// lottery.js - تعامل با قرارداد هوشمند لاتاری و توکن CPA

class LotteryManager {
  constructor() {
    this.contract = null;
    this.lvlToken = null;
    this.currentAccount = null;
    this.lotteries = [];
    this.groupDraws = [];
    this.isInitialized = false;
  }

  // راه‌اندازی اولیه
  async initialize() {
    try {
      if (!window.contractConfig || !window.contractConfig.contract) {
        throw new Error('قرارداد هوشمند متصل نشده است');
      }

      this.contract = window.contractConfig.contract;
      this.currentAccount = window.contractConfig.address;
      
      // آدرس توکن CPA - باید در config.js تعریف شود
      const cpaTokenAddress = window.CPA_TOKEN_ADDRESS || '0x...'; // آدرس واقعی توکن CPA
      const lvlTokenAbi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function approve(address spender, uint256 amount) returns (bool)',
        'function allowance(address owner, address spender) view returns (uint256)',
        'function transfer(address to, uint256 amount) returns (bool)',
        'function transferFrom(address from, address to, uint256 amount) returns (bool)'
      ];

      this.cpaToken = new ethers.Contract(cpaTokenAddress, lvlTokenAbi, window.contractConfig.signer);
      
      this.isInitialized = true;
      console.log('LotteryManager initialized successfully');
      
      // بررسی وضعیت اتصال و نمایش موجودی
      await this.checkConnectionStatus();
      
      // بارگذاری داده‌های اولیه
      await this.loadLotteryData();
      
    } catch (error) {
      console.error('Error initializing LotteryManager:', error);
      this.showError('خطا در اتصال به قرارداد هوشمند: ' + error.message);
    }
  }

  // بارگذاری داده‌های لاتاری
  async loadLotteryData() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // بارگذاری آمار کلی
      await this.loadStatistics();
      
      // بارگذاری لاتاری‌های فعال
      await this.loadActiveLotteries();
      
      // بارگذاری قرعه‌کشی‌های گروهی
      await this.loadGroupDraws();
      
    } catch (error) {
      console.error('Error loading lottery data:', error);
      this.showError('خطا در بارگذاری داده‌های لاتاری: ' + error.message);
    }
  }

  // بارگذاری آمار کلی
  async loadStatistics() {
    try {
      // فراخوانی توابع قرارداد برای دریافت آمار
      const activeLotteries = await this.contract.getActiveLotteriesCount();
      const totalReward = await this.contract.getTotalRewardPool();
      const totalParticipants = await this.contract.getTotalParticipants();
      const totalWinners = await this.contract.getTotalWinners();

      // به‌روزرسانی UI
      document.getElementById('stat-active-lotteries').textContent = activeLotteries.toString();
      document.getElementById('stat-total-reward').textContent = ethers.formatEther(totalReward);
      document.getElementById('stat-participants').textContent = totalParticipants.toString();
      document.getElementById('stat-winners').textContent = totalWinners.toString();

    } catch (error) {
      console.error('Error loading statistics:', error);
      // در صورت خطا، مقادیر صفر نمایش دهید
      document.getElementById('stat-active-lotteries').textContent = '0';
      document.getElementById('stat-total-reward').textContent = '0';
      document.getElementById('stat-participants').textContent = '0';
      document.getElementById('stat-winners').textContent = '0';
    }
  }

  // بارگذاری لاتاری‌های فعال
  async loadActiveLotteries() {
    try {
      const lotteryList = document.getElementById('lottery-list');
      if (!lotteryList) return;

      // دریافت لیست لاتاری‌های فعال از قرارداد
      const activeLotteries = await this.contract.getActiveLotteries();
      
      lotteryList.innerHTML = '';
      
      if (activeLotteries.length === 0) {
        this.showEmptyState('lottery');
        return;
      }

      for (let i = 0; i < activeLotteries.length; i++) {
        const lottery = activeLotteries[i];
        const lotteryCard = await this.createLotteryCard(lottery, i);
        lotteryList.appendChild(lotteryCard);
      }

    } catch (error) {
      console.error('Error loading active lotteries:', error);
      this.showError('خطا در بارگذاری لاتاری‌های فعال: ' + error.message);
    }
  }

  // بارگذاری قرعه‌کشی‌های گروهی
  async loadGroupDraws() {
    try {
      const groupList = document.getElementById('groupdraw-list');
      if (!groupList) return;

      // دریافت لیست گروه‌ها از قرارداد
      const groupDraws = await this.contract.getGroupDraws();
      
      groupList.innerHTML = '';
      
      if (groupDraws.length === 0) {
        this.showEmptyState('group');
        return;
      }

      for (let i = 0; i < groupDraws.length; i++) {
        const group = groupDraws[i];
        const groupCard = await this.createGroupCard(group, i);
        groupList.appendChild(groupCard);
      }

    } catch (error) {
      console.error('Error loading group draws:', error);
      this.showError('خطا در بارگذاری قرعه‌کشی‌های گروهی: ' + error.message);
    }
  }

  // ایجاد کارت لاتاری
  async createLotteryCard(lottery, index) {
    const card = document.createElement('div');
    card.className = 'lottery-card';
    
    // محاسبه درصد پیشرفت
    const progressPercent = (lottery.currentParticipants / lottery.maxParticipants) * 100;
    
    // محاسبه زمان باقی‌مانده
    const endTime = new Date(lottery.endTime * 1000);
    const now = new Date();
    const timeLeft = endTime - now;
    const timeLeftText = this.formatTimeLeft(timeLeft);

    // بررسی وضعیت
    const isActive = lottery.status === 1; // 1 = فعال
    const isPending = lottery.status === 0; // 0 = در انتظار
    const isCompleted = lottery.status === 2; // 2 = تکمیل شده

    let statusClass = 'status-pending';
    let statusText = 'در انتظار';
    let statusIcon = '🟡';

    if (isActive) {
      statusClass = 'status-active';
      statusText = 'فعال';
      statusIcon = '🟢';
    } else if (isCompleted) {
      statusClass = 'status-completed';
      statusText = 'تکمیل شده';
      statusIcon = '🟣';
    }

    card.innerHTML = `
      ${lottery.isSpecial ? '<div class="winner-badge">🏆 ویژه</div>' : ''}
      <div class="lottery-header-section">
        <div class="lottery-icon">🎰</div>
        <div class="lottery-info">
          <h3>${lottery.name}</h3>
          <span class="lottery-id">#LOT-${index.toString().padStart(3, '0')}</span>
        </div>
      </div>
      ${isActive ? `<div class="lottery-timer">⏰ زمان باقی‌مانده: ${timeLeftText}</div>` : ''}
      <div class="lottery-progress">
        <div class="progress-fill" style="width: ${progressPercent}%;"></div>
      </div>
      <div class="lottery-details">
        <div class="detail-item">
          <div class="detail-value">${ethers.formatEther(lottery.totalReward)}</div>
          <div class="detail-label">جایزه (LVL)</div>
        </div>
        <div class="detail-item">
          <div class="detail-value">${lottery.currentParticipants}/${lottery.maxParticipants}</div>
          <div class="detail-label">شرکت‌کننده</div>
        </div>
        <div class="detail-item">
          <div class="detail-value">${lottery.winnersCount}</div>
          <div class="detail-label">برنده</div>
        </div>
        <div class="detail-item">
          <div class="detail-value">${ethers.formatEther(lottery.ticketPrice)}</div>
          <div class="detail-label">LVL/نفر</div>
        </div>
      </div>
      <div class="lottery-status ${statusClass}">
        <span>${statusIcon}</span>
        <span>${statusText}</span>
      </div>
      <div class="lottery-actions">
        ${isActive ? `<button class="action-btn btn-primary" onclick="lotteryManager.joinLottery(${index})">شرکت در لاتاری</button>` : ''}
        <button class="action-btn btn-secondary" onclick="lotteryManager.showLotteryDetails(${index})">جزئیات</button>
      </div>
    `;

    return card;
  }

  // ایجاد کارت گروه
  async createGroupCard(group, index) {
    const card = document.createElement('div');
    card.className = 'lottery-card';
    
    const isCompleted = group.status === 2;
    const isActive = group.status === 1;
    
    let statusClass = 'status-pending';
    let statusText = 'در انتظار';
    let statusIcon = '🟡';

    if (isActive) {
      statusClass = 'status-active';
      statusText = 'فعال';
      statusIcon = '🟢';
    } else if (isCompleted) {
      statusClass = 'status-completed';
      statusText = 'تکمیل شده';
      statusIcon = '🟣';
    }

    card.innerHTML = `
      <div class="lottery-header-section">
        <div class="lottery-icon">👥</div>
        <div class="lottery-info">
          <h3>${group.name}</h3>
          <span class="lottery-id">#GRP-${index.toString().padStart(3, '0')}</span>
        </div>
      </div>
      <div class="lottery-details">
        <div class="detail-item">
          <div class="detail-value">${ethers.formatEther(group.totalReward)}</div>
          <div class="detail-label">جایزه (LVL)</div>
        </div>
        <div class="detail-item">
          <div class="detail-value">${group.currentMembers}/${group.maxMembers}</div>
          <div class="detail-label">اعضا</div>
        </div>
        <div class="detail-item">
          <div class="detail-value">${group.winnersCount}</div>
          <div class="detail-label">برنده</div>
        </div>
        <div class="detail-item">
          <div class="detail-value">${ethers.formatEther(group.contributionAmount)}</div>
          <div class="detail-label">LVL/نفر</div>
        </div>
      </div>
      <div class="lottery-status ${statusClass}">
        <span>${statusIcon}</span>
        <span>${statusText}</span>
      </div>
      <div class="lottery-actions">
        ${isActive ? `<button class="action-btn btn-primary" onclick="lotteryManager.joinGroup(${index})">پیوستن به گروه</button>` : ''}
        ${isCompleted ? `<button class="action-btn btn-secondary" onclick="lotteryManager.showGroupResults(${index})">مشاهده نتایج</button>` : ''}
        <button class="action-btn btn-secondary" onclick="lotteryManager.showGroupDetails(${index})">جزئیات</button>
      </div>
    `;

    return card;
  }

  // شرکت در لاتاری
  async joinLottery(lotteryIndex) {
    try {
      if (!this.currentAccount) {
        throw new Error('لطفاً ابتدا کیف پول خود را متصل کنید');
      }

      // دریافت اطلاعات لاتاری
      const lottery = await this.contract.getLottery(lotteryIndex);
      
      // بررسی موجودی توکن CPA
      const balance = await this.cpaToken.balanceOf(this.currentAccount);
      const balanceFormatted = ethers.formatEther(balance);
      const ticketPriceFormatted = ethers.formatEther(lottery.ticketPrice);
      
      console.log(`موجودی شما: ${balanceFormatted} CPA`);
      console.log(`قیمت بلیت: ${ticketPriceFormatted} CPA`);
      
      if (balance < lottery.ticketPrice) {
        throw new Error(`موجودی CPA شما کافی نیست. موجودی: ${balanceFormatted} CPA، قیمت بلیت: ${ticketPriceFormatted} CPA`);
      }

      // بررسی مجوز
      const allowance = await this.cpaToken.allowance(this.currentAccount, this.contract.address);
      if (allowance < lottery.ticketPrice) {
        console.log('درخواست مجوز برای قرارداد...');
        // درخواست مجوز
        const approveTx = await this.cpaToken.approve(this.contract.address, lottery.ticketPrice);
        await approveTx.wait();
        console.log('مجوز تایید شد');
      }

      console.log('شرکت در لاتاری...');
      // شرکت در لاتاری
      const tx = await this.contract.joinLottery(lotteryIndex);
      await tx.wait();

      this.showSuccess('با موفقیت در لاتاری شرکت کردید!');
      
      // بارگذاری مجدد داده‌ها
      await this.loadLotteryData();

    } catch (error) {
      const errorInfo = window.handleMetaMaskError ? window.handleMetaMaskError(error) : null;
      
      if (errorInfo && errorInfo.type === 'user_rejected') {
        console.log('کاربر تراکنش را رد کرد');
        return;
      }
      
      console.error('Error joining lottery:', error);
      
      // بررسی خطای موجودی ناکافی
      if (error.message.includes('Insufficient token balance') || error.reason === 'Insufficient token balance') {
        const errorMessage = `
          موجودی توکن CPA شما برای این تراکنش کافی نیست.
          
          راه‌حل‌ها:
          1. به صفحه Shop بروید و توکن CPA خریداری کنید
          2. از صفحه Swap برای تبدیل ارزهای دیگر استفاده کنید
          3. منتظر بمانید تا توکن‌های رایگان دریافت کنید
          
          موجودی فعلی شما: ${balanceFormatted} CPA
          قیمت بلیت: ${ticketPriceFormatted} CPA
        `;
        this.showError(errorMessage);
      } else {
        this.showError('خطا در شرکت در لاتاری: ' + (errorInfo ? errorInfo.message : error.message));
      }
    }
  }

  // پیوستن به گروه
  async joinGroup(groupIndex) {
    try {
      if (!this.currentAccount) {
        throw new Error('لطفاً ابتدا کیف پول خود را متصل کنید');
      }

      // دریافت اطلاعات گروه
      const group = await this.contract.getGroupDraw(groupIndex);
      
      // بررسی موجودی توکن CPA
      const balance = await this.cpaToken.balanceOf(this.currentAccount);
      if (balance < group.contributionAmount) {
        throw new Error('موجودی CPA شما کافی نیست');
      }

      // بررسی مجوز
      const allowance = await this.cpaToken.allowance(this.currentAccount, this.contract.address);
      if (allowance < group.contributionAmount) {
        // درخواست مجوز
        const approveTx = await this.cpaToken.approve(this.contract.address, group.contributionAmount);
        await approveTx.wait();
      }

      // پیوستن به گروه
      const tx = await this.contract.joinGroupDraw(groupIndex);
      await tx.wait();

      this.showSuccess('با موفقیت به گروه پیوستید!');
      
      // بارگذاری مجدد داده‌ها
      await this.loadLotteryData();

    } catch (error) {
      const errorInfo = window.handleMetaMaskError ? window.handleMetaMaskError(error) : null;
      
      if (errorInfo && errorInfo.type === 'user_rejected') {
        console.log('کاربر تراکنش را رد کرد');
        return;
      }
      
      console.error('Error joining group:', error);
      this.showError('خطا در پیوستن به گروه: ' + (errorInfo ? errorInfo.message : error.message));
    }
  }

  // ایجاد لاتاری جدید
  async createLottery(name, maxParticipants, ticketPrice, winnersCount) {
    try {
      if (!this.currentAccount) {
        throw new Error('لطفاً ابتدا کیف پول خود را متصل کنید');
      }

      // محاسبه کل جایزه
      const totalReward = ticketPrice * maxParticipants;
      
      // بررسی موجودی توکن CPA
      const balance = await this.cpaToken.balanceOf(this.currentAccount);
      if (balance < totalReward) {
        throw new Error('موجودی CPA شما برای ایجاد این لاتاری کافی نیست');
      }

      // بررسی مجوز
      const allowance = await this.cpaToken.allowance(this.currentAccount, this.contract.address);
      if (allowance < totalReward) {
        // درخواست مجوز
        const approveTx = await this.cpaToken.approve(this.contract.address, totalReward);
        await approveTx.wait();
      }

      // ایجاد لاتاری
      const tx = await this.contract.createLottery(name, maxParticipants, ticketPrice, winnersCount);
      await tx.wait();

      this.showSuccess('لاتاری با موفقیت ایجاد شد!');
      
      // بارگذاری مجدد داده‌ها
      await this.loadLotteryData();

    } catch (error) {
      console.error('Error creating lottery:', error);
      this.showError('خطا در ایجاد لاتاری: ' + error.message);
    }
  }

  // ایجاد قرعه‌کشی گروهی
  async createGroupDraw(name, maxMembers, contributionAmount, winnersCount) {
    try {
      if (!this.currentAccount) {
        throw new Error('لطفاً ابتدا کیف پول خود را متصل کنید');
      }

      // ایجاد قرعه‌کشی گروهی
      const tx = await this.contract.createGroupDraw(name, maxMembers, contributionAmount, winnersCount);
      await tx.wait();

      this.showSuccess('قرعه‌کشی گروهی با موفقیت ایجاد شد!');
      
      // بارگذاری مجدد داده‌ها
      await this.loadLotteryData();

    } catch (error) {
      console.error('Error creating group draw:', error);
      this.showError('خطا در ایجاد قرعه‌کشی گروهی: ' + error.message);
    }
  }

  // نمایش جزئیات لاتاری
  async showLotteryDetails(lotteryIndex) {
    try {
      const lottery = await this.contract.getLottery(lotteryIndex);
      const participants = await this.contract.getLotteryParticipants(lotteryIndex);
      
      const details = `
        نام: ${lottery.name}
        جایزه کل: ${ethers.formatEther(lottery.totalReward)} CPA
        قیمت بلیت: ${ethers.formatEther(lottery.ticketPrice)} CPA
        شرکت‌کنندگان: ${lottery.currentParticipants}/${lottery.maxParticipants}
        برندگان: ${lottery.winnersCount}
        وضعیت: ${this.getStatusText(lottery.status)}
        تاریخ پایان: ${new Date(lottery.endTime * 1000).toLocaleString('fa-IR')}
      `;
      
      alert(details);
      
    } catch (error) {
      console.error('Error showing lottery details:', error);
      this.showError('خطا در نمایش جزئیات: ' + error.message);
    }
  }

  // نمایش جزئیات گروه
  async showGroupDetails(groupIndex) {
    try {
      const group = await this.contract.getGroupDraw(groupIndex);
      const members = await this.contract.getGroupMembers(groupIndex);
      
      const details = `
        نام: ${group.name}
        جایزه کل: ${ethers.formatEther(group.totalReward)} CPA
        سهم هر نفر: ${ethers.formatEther(group.contributionAmount)} CPA
        اعضا: ${group.currentMembers}/${group.maxMembers}
        برندگان: ${group.winnersCount}
        وضعیت: ${this.getStatusText(group.status)}
      `;
      
      alert(details);
      
    } catch (error) {
      console.error('Error showing group details:', error);
      this.showError('خطا در نمایش جزئیات: ' + error.message);
    }
  }

  // نمایش نتایج گروه
  async showGroupResults(groupIndex) {
    try {
      const winners = await this.contract.getGroupWinners(groupIndex);
      
      let results = 'برندگان:\n';
      for (let i = 0; i < winners.length; i++) {
        results += `${i + 1}. ${winners[i]}\n`;
      }
      
      alert(results);
      
    } catch (error) {
      console.error('Error showing group results:', error);
      this.showError('خطا در نمایش نتایج: ' + error.message);
    }
  }

  // فرمت کردن زمان باقی‌مانده
  formatTimeLeft(milliseconds) {
    if (milliseconds <= 0) return 'پایان یافته';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} ساعت ${minutes} دقیقه`;
    } else {
      return `${minutes} دقیقه`;
    }
  }

  // دریافت متن وضعیت
  getStatusText(status) {
    switch (status) {
      case 0: return 'در انتظار';
      case 1: return 'فعال';
      case 2: return 'تکمیل شده';
      default: return 'نامشخص';
    }
  }

  // نمایش حالت خالی
  showEmptyState(type) {
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
      emptyState.style.display = 'block';
      if (type === 'lottery') {
        emptyState.querySelector('.empty-state-text').textContent = 'هیچ لاتاری فعالی یافت نشد';
      } else {
        emptyState.querySelector('.empty-state-text').textContent = 'هیچ قرعه‌کشی گروهی یافت نشد';
      }
    }
  }

  // نمایش پیام موفقیت
  showSuccess(message) {
    // ایجاد modal برای نمایش موفقیت
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: rgba(35, 41, 70, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 255, 136, 0.5);
      border-radius: 15px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      color: #fff;
      font-family: 'Noto Sans Arabic', sans-serif;
      text-align: center;
    `;
    
    modalContent.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
      <h3 style="color: #00ff88; margin-bottom: 1rem;">موفقیت</h3>
      <div style="line-height: 1.6; color: #b8c5d6;">${message}</div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: linear-gradient(135deg, #00ff88, #4ecdc4);
        border: none;
        color: white;
        padding: 0.8rem 2rem;
        border-radius: 10px;
        margin-top: 1.5rem;
        cursor: pointer;
        font-weight: bold;
      ">باشه</button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // بستن modal با کلیک خارج از آن
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    // بستن خودکار بعد از 3 ثانیه
    setTimeout(() => {
      if (modal.parentElement) {
        modal.remove();
      }
    }, 3000);
  }

  // نمایش پیام خطا
  showError(message) {
    // ایجاد modal برای نمایش خطا
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: rgba(35, 41, 70, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 107, 157, 0.5);
      border-radius: 15px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      color: #fff;
      font-family: 'Noto Sans Arabic', sans-serif;
      text-align: center;
    `;
    
    modalContent.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
      <h3 style="color: #ff6b9d; margin-bottom: 1rem;">خطا</h3>
      <div style="white-space: pre-line; line-height: 1.6; color: #b8c5d6;">${message}</div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: linear-gradient(135deg, #ff6b9d, #a786ff);
        border: none;
        color: white;
        padding: 0.8rem 2rem;
        border-radius: 10px;
        margin-top: 1.5rem;
        cursor: pointer;
        font-weight: bold;
      ">متوجه شدم</button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // بستن modal با کلیک خارج از آن
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // نمایش موجودی توکن
  async showTokenBalance() {
    try {
      if (!this.currentAccount) {
        console.log('کیف پول متصل نیست');
        return;
      }

      const balance = await this.cpaToken.balanceOf(this.currentAccount);
      const balanceFormatted = ethers.formatEther(balance);
      
      console.log(`موجودی CPA شما: ${balanceFormatted} CPA`);
      
      // نمایش در UI
      const balanceElement = document.getElementById('user-balance');
      if (balanceElement) {
        balanceElement.textContent = `${balanceFormatted} CPA`;
      }
      
      return balance;
    } catch (error) {
      console.error('خطا در دریافت موجودی:', error);
      return null;
    }
  }

  // بررسی و نمایش وضعیت اتصال
  async checkConnectionStatus() {
    try {
      if (!this.currentAccount) {
        console.log('کیف پول متصل نیست');
        return false;
      }

      // بررسی موجودی
      const balance = await this.showTokenBalance();
      
      // بررسی مجوز قرارداد
      const allowance = await this.cpaToken.allowance(this.currentAccount, this.contract.address);
      const allowanceFormatted = ethers.formatEther(allowance);
      
      console.log(`مجوز قرارداد: ${allowanceFormatted} CPA`);
      
      return true;
    } catch (error) {
      console.error('خطا در بررسی وضعیت اتصال:', error);
      return false;
    }
  }
}

// ایجاد نمونه از کلاس
const lotteryManager = new LotteryManager();

// راه‌اندازی پس از بارگذاری صفحه
document.addEventListener('DOMContentLoaded', function() {
  // راه‌اندازی پس از اتصال کیف پول
  if (window.contractConfig && window.contractConfig.contract) {
    lotteryManager.initialize();
  } else {
    // منتظر اتصال کیف پول
    const checkConnection = setInterval(() => {
      if (window.contractConfig && window.contractConfig.contract) {
        clearInterval(checkConnection);
        lotteryManager.initialize();
      }
    }, 2000); // افزایش فاصله زمانی
    
    // توقف interval بعد از 30 ثانیه
    setTimeout(() => {
      clearInterval(checkConnection);
    }, 30000);
  }
});

// Export برای استفاده در HTML
window.lotteryManager = lotteryManager; 