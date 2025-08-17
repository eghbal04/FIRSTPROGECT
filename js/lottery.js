// lottery.js - تعامل با قرارداد هوشمند لاتاری و توکن IAM

class LotteryManager {
  constructor() {
    this.contract = null;
    this.lvlToken = null;
    this.currentAccount = null;
    this.lotteries = [];
    this.groupDraws = [];
    this.isInitialized = false;
    this.isLoadingLotteries = false;
    
    // راه‌اندازی خودکار پس از بارگذاری صفحه
    this.autoInitialize();
  }
  
  // راه‌اندازی خودکار
  async autoInitialize() {
    // منتظر بارگذاری کامل صفحه
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initialize();
      });
    } else {
      // اگر صفحه قبلاً بارگذاری شده، مستقیماً راه‌اندازی کن
      setTimeout(() => {
        this.initialize();
      }, 1000); // کمی تاخیر برای اطمینان از بارگذاری سایر اسکریپت‌ها
    }
  }

  // راه‌اندازی اولیه
  async initialize() {
    try {
      console.log('شروع راه‌اندازی LotteryManager...');
      
      // بررسی وجود window.contractConfig
      if (!window.contractConfig) {
        console.warn('window.contractConfig موجود نیست - منتظر اتصال کیف پول...');
        this.showError('لطفاً ابتدا کیف پول خود را متصل کنید');
        return false;
      }

      if (!window.contractConfig.contract) {
        console.warn('قرارداد هوشمند متصل نشده است');
        this.showError('قرارداد هوشمند متصل نشده است');
        return false;
      }

      // استفاده از قرارداد اصلی برای موجودی IAM
      this.contract = window.contractConfig.contract;
      this.currentAccount = window.contractConfig.address;
      this.IAMToken = this.contract; // قرارداد اصلی شامل تابع balanceOf است
      
      console.log('قرارداد اصلی متصل شد:', this.contract);
      console.log('آدرس کاربر:', this.currentAccount);
      
      // راه‌اندازی قرارداد لاتاری
      if (typeof CONTRACT_LOTARY !== 'undefined' && typeof LOTARI_ABI !== 'undefined') {
        try {
          // بررسی اعتبار آدرس قرارداد
          if (!ethers.isAddress(CONTRACT_LOTARY)) {
            console.error('آدرس قرارداد لاتاری نامعتبر است:', CONTRACT_LOTARY);
            this.lotteryContract = null;
            return;
          }
          
          this.lotteryContract = new ethers.Contract(CONTRACT_LOTARY, LOTARI_ABI, window.contractConfig.signer);
          console.log('قرارداد لاتاری راه‌اندازی شد:', CONTRACT_LOTARY);
          
          // تست اتصال به قرارداد لاتاری با مدیریت خطا بهتر
          try {
            const testCall = await this.lotteryContract.nextLotteryId();
            console.log('تست قرارداد لاتاری موفق - تعداد لاتاری‌ها:', testCall.toString());
          } catch (testError) {
            console.warn('خطا در تست قرارداد لاتاری:', testError.message);
            
            // اگر خطا مربوط به ENS باشد، قرارداد را نگه داریم
            if (testError.code === 'UNSUPPORTED_OPERATION' && testError.message.includes('ENS')) {
              console.log('خطای ENS - قرارداد احتمالاً درست است');
            } else {
              console.warn('قرارداد لاتاری پاسخ نمی‌دهد - ممکن است آدرس اشتباه باشد');
              this.lotteryContract = null;
            }
          }
        } catch (contractError) {
          console.error('خطا در راه‌اندازی قرارداد لاتاری:', contractError);
          this.lotteryContract = null;
        }
      } else {
        console.warn('قرارداد لاتاری در config.js تعریف نشده است');
        this.lotteryContract = null;
      }
      
      this.isInitialized = true;
      console.log('LotteryManager initialized successfully');
      
      // بررسی وضعیت اتصال و نمایش موجودی
      const isConnected = await this.checkConnectionStatus();
      
      if (isConnected) {
        // بارگذاری داده‌های اولیه
        await this.loadLotteryData();
        return true;
      } else {
        console.log('کیف پول متصل نیست - منتظر اتصال...');
        this.showError('لطفاً ابتدا کیف پول خود را متصل کنید');
        return false;
      }
      
    } catch (error) {
      console.error('Error initializing LotteryManager:', error);
      this.showError('خطا در اتصال به قرارداد هوشمند: ' + error.message);
      return false;
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
      if (!this.lotteryContract) {
        console.warn('قرارداد لاتاری موجود نیست');
        this.showDefaultStats();
        return;
      }

      // تلاش برای دریافت آمار از قرارداد
      try {
        // بررسی وجود توابع آمار
        const hasActiveLotteriesCount = typeof this.lotteryContract.getActiveLotteriesCount === 'function';
        const hasTotalRewardPool = typeof this.lotteryContract.getTotalRewardPool === 'function';
        const hasTotalParticipants = typeof this.lotteryContract.getTotalParticipants === 'function';
        const hasTotalWinners = typeof this.lotteryContract.getTotalWinners === 'function';

        if (hasActiveLotteriesCount && hasTotalRewardPool && hasTotalParticipants && hasTotalWinners) {
          // اگر توابع موجود باشند، از آنها استفاده کن
          const activeLotteries = await this.lotteryContract.getActiveLotteriesCount();
          const totalReward = await this.lotteryContract.getTotalRewardPool();
          const totalParticipants = await this.lotteryContract.getTotalParticipants();
          const totalWinners = await this.lotteryContract.getTotalWinners();

          // به‌روزرسانی UI
          document.getElementById('stat-active-lotteries').textContent = activeLotteries.toString();
          document.getElementById('stat-total-reward').textContent = ethers.formatEther(totalReward);
          document.getElementById('stat-participants').textContent = totalParticipants.toString();
          document.getElementById('stat-winners').textContent = totalWinners.toString();
        } else {
          // اگر توابع موجود نباشند، آمار ساده محاسبه کن
          await this.calculateSimpleStats();
        }
      } catch (contractError) {
        console.warn('خطا در دریافت آمار از قرارداد:', contractError);
        // محاسبه آمار ساده
        await this.calculateSimpleStats();
      }

    } catch (error) {
      console.error('Error loading statistics:', error);
      this.showDefaultStats();
    }
  }

  // محاسبه آمار ساده
  async calculateSimpleStats() {
    try {
      if (!this.lotteryContract) {
        this.showDefaultStats();
        return;
      }

      // دریافت تعداد کل لاتاری‌ها
      const totalLotteries = await this.lotteryContract.nextLotteryId();
      let activeCount = 0;
      let totalParticipants = 0;

      // بررسی لاتاری‌های فعال
      for (let i = 0; i < totalLotteries; i++) {
        try {
          const lottery = await this.lotteryContract.lotteries(i);
          if (lottery.isActive) {
            activeCount++;
            totalParticipants += lottery.participants.length;
          }
        } catch (e) {
          console.warn(`خطا در بررسی لاتاری ${i}:`, e);
        }
      }

      // به‌روزرسانی UI
      document.getElementById('stat-active-lotteries').textContent = activeCount.toString();
      document.getElementById('stat-total-reward').textContent = '0'; // محاسبه پیچیده است
      document.getElementById('stat-participants').textContent = totalParticipants.toString();
      document.getElementById('stat-winners').textContent = '0'; // محاسبه پیچیده است

    } catch (error) {
      console.error('Error calculating simple stats:', error);
      this.showDefaultStats();
    }
  }

  // نمایش آمار پیش‌فرض
  showDefaultStats() {
    document.getElementById('stat-active-lotteries').textContent = '0';
    document.getElementById('stat-total-reward').textContent = '0';
    document.getElementById('stat-participants').textContent = '0';
    document.getElementById('stat-winners').textContent = '0';
  }

  // بارگذاری لاتاری‌های فعال
  async loadActiveLotteries() {
    if (this.isLoadingLotteries) return;
    this.isLoadingLotteries = true;
    try {
      const lotteryList = document.getElementById('lottery-list');
      if (!lotteryList) return;
      if (!this.lotteryContract) {
        console.warn('قرارداد لاتاری موجود نیست');
        this.showEmptyState('lottery');
        return;
      }
      // گرفتن تعداد کل لاتاری‌ها
      const count = await this.lotteryContract.nextLotteryId();
      let activeLotteries = [];
      for (let i = 0; i < count; i++) {
        const lottery = await this.lotteryContract.lotteries(i);
        // فقط لاتاری‌های فعال را نمایش بده
        if (lottery.isActive) {
          activeLotteries.push(lottery);
        }
      }
      lotteryList.innerHTML = '';
      if (activeLotteries.length === 0) {
        this.showEmptyState('lottery');
        return;
      }
      for (let i = 0; i < activeLotteries.length; i++) {
        const lotteryCard = await this.createLotteryCard(activeLotteries[i], i);
        lotteryList.appendChild(lotteryCard);
      }
    } catch (error) {
      console.error('Error loading active lotteries:', error);
      this.showError('خطا در بارگذاری لاتاری‌های فعال: ' + error.message);
    } finally {
      this.isLoadingLotteries = false;
    }
  }

  // بارگذاری قرعه‌کشی‌های گروهی
  async loadGroupDraws() {
    try {
      const groupList = document.getElementById('groupdraw-list');
      if (!groupList) return;
      if (!this.lotteryContract) {
        console.warn('قرارداد لاتاری موجود نیست');
        this.showEmptyState('group');
        return;
      }
      // گرفتن تعداد کل گروه‌ها
      const count = await this.lotteryContract.nextGroupDrawId();
      let activeGroups = [];
      for (let i = 0; i < count; i++) {
        const group = await this.lotteryContract.groupDraws(i);
        // فقط گروه‌های فعال را نمایش بده
        if (group.isActive) {
          activeGroups.push(group);
        }
      }
      groupList.innerHTML = '';
      if (activeGroups.length === 0) {
        this.showEmptyState('group');
        return;
      }
      for (let i = 0; i < activeGroups.length; i++) {
        const groupCard = await this.createGroupCard(activeGroups[i], i);
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
          <div class="detail-label">جایزه (IAM)</div>
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
          <div class="detail-label">IAM/نفر</div>
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
          <div class="detail-label">جایزه (IAM)</div>
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
          <div class="detail-label">IAM/نفر</div>
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
      
      // بررسی موجودی توکن IAM
      const balance = await this.IAMToken.balanceOf(this.currentAccount);
      const balanceFormatted = ethers.formatEther(balance);
      const ticketPriceFormatted = ethers.formatEther(lottery.ticketPrice);
      
      console.log(`موجودی شما: ${balanceFormatted} IAM`);
      console.log(`قیمت بلیت: ${ticketPriceFormatted} IAM`);
      
      if (balance < lottery.ticketPrice) {
        throw new Error(`موجودی IAM شما کافی نیست. موجودی: ${balanceFormatted} IAM، قیمت بلیت: ${ticketPriceFormatted} IAM`);
      }

      // بررسی مجوز
      const allowance = await this.IAMToken.allowance(this.currentAccount, this.contract.address);
      if (allowance < lottery.ticketPrice) {
        console.log('درخواست مجوز برای قرارداد...');
        // درخواست مجوز
        const approveTx = await this.IAMToken.approve(this.contract.address, lottery.ticketPrice);
        await approveTx.wait();
        console.log('مجوز تایید شد');
      }

      console.log('شرکت در لاتاری...');
      // شرکت در لاتاری
      const tx = await this.lotteryContract.joinLottery(lotteryIndex);
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
          موجودی توکن IAM شما برای این تراکنش کافی نیست.
          
          راه‌حل‌ها:
          1. به صفحه Shop بروید و توکن IAM خریداری کنید
          2. از صفحه Swap برای تبدیل ارزهای دیگر استفاده کنید
          3. منتظر بمانید تا توکن‌های رایگان دریافت کنید
          
          موجودی فعلی شما: ${balanceFormatted} IAM
          قیمت بلیت: ${ticketPriceFormatted} IAM
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
      
      // بررسی موجودی توکن IAM
      const balance = await this.IAMToken.balanceOf(this.currentAccount);
      if (balance < group.contributionAmount) {
        throw new Error('موجودی IAM شما کافی نیست');
      }

      // بررسی مجوز
      const allowance = await this.IAMToken.allowance(this.currentAccount, this.contract.address);
      if (allowance < group.contributionAmount) {
        // درخواست مجوز
        const approveTx = await this.IAMToken.approve(this.contract.address, group.contributionAmount);
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
  async createLottery(maxParticipants, ticketPrice, winnersCount) {
    try {
      if (!this.currentAccount) {
        throw new Error('لطفاً ابتدا کیف پول خود را متصل کنید');
      }

      // تبدیل همه پارامترها به BigInt
      const _maxParticipants = BigInt(maxParticipants);
      const _ticketPrice = BigInt(ticketPrice);
      const _winnersCount = BigInt(winnersCount);
      
      // محاسبه کل جایزه
      const totalReward = _ticketPrice * _maxParticipants;
      
      // بررسی موجودی توکن IAM
      const balance = await this.IAMToken.balanceOf(this.currentAccount);
      if (balance < totalReward) {
        throw new Error('موجودی IAM شما برای ایجاد این لاتاری کافی نیست');
      }

      // بررسی مجوز
      const allowance = await this.IAMToken.allowance(this.currentAccount, this.contract.address);
      if (allowance < totalReward) {
        // درخواست مجوز
        const approveTx = await this.IAMToken.approve(this.contract.address, totalReward);
        await approveTx.wait();
      }

      // ایجاد لاتاری
      const tx = await this.lotteryContract.createLottery(_maxParticipants, _ticketPrice, _winnersCount);
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
  async createGroupDraw(memberCount, amountPerUser) {
    try {
      if (!this.currentAccount) {
        throw new Error('لطفاً ابتدا کیف پول خود را متصل کنید');
      }

      // تبدیل همه پارامترها به BigInt
      const _memberCount = BigInt(memberCount);
      const _amountPerUser = BigInt(amountPerUser);
      const tx = await this.contract.createGroupDraw(_memberCount, _amountPerUser);
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
        جایزه کل: ${ethers.formatEther(lottery.totalReward)} IAM
        قیمت بلیت: ${ethers.formatEther(lottery.ticketPrice)} IAM
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
        جایزه کل: ${ethers.formatEther(group.totalReward)} IAM
        سهم هر نفر: ${ethers.formatEther(group.contributionAmount)} IAM
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
        return null;
      }

      if (!this.IAMToken) {
        console.log('قرارداد متصل نیست');
        return null;
      }

      console.log('دریافت موجودی IAM...');
      console.log('آدرس کیف پول:', this.currentAccount);
      console.log('قرارداد:', this.IAMToken.address);

      const balance = await this.IAMToken.balanceOf(this.currentAccount);
      const balanceFormatted = ethers.formatEther(balance);
      
      console.log(`موجودی IAM شما: ${balanceFormatted} IAM`);
      
      // نمایش در UI
      const balanceElement = document.getElementById('user-balance');
      if (balanceElement) {
        // فقط عدد صحیح نمایش داده شود
        balanceElement.textContent = `${Math.floor(Number(balanceFormatted))} IAM`;
        console.log('موجودی در UI به‌روزرسانی شد');
      } else {
        console.log('عنصر user-balance یافت نشد');
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

      console.log('بررسی اتصال کیف پول...');
      console.log('آدرس کیف پول:', this.currentAccount);

      // بررسی موجودی
      const balance = await this.showTokenBalance();
      
      if (balance === null) {
        console.log('خطا در دریافت موجودی');
        return false;
      }
      
      console.log('اتصال کیف پول موفق');
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
document.addEventListener('DOMContentLoaded', async function() {
  if (!window.contractConfig || !window.contractConfig.contract || !window.contractConfig.address) {
    if (window.connectWallet) {
      try {
        const cfg = await window.connectWallet();
        window.contractConfig = cfg;
        console.log('کیف پول متصل شد:', cfg.address);
        // اگر LotteryManager قبلاً ساخته شده، initialize را صدا بزن
        if (window.lotteryManager) window.lotteryManager.initialize();
      } catch (e) {
        alert('اتصال کیف پول الزامی است.');
      }
    } else {
      alert('اسکریپت اتصال کیف پول لود نشده است.');
    }
  }
});

// تابع برای بررسی مجدد اتصال
window.checkLotteryConnection = async function() {
  console.log('بررسی اتصال لاتاری...');
  
  if (lotteryManager.isInitialized) {
    console.log('LotteryManager قبلاً راه‌اندازی شده');
    const isConnected = await lotteryManager.checkConnectionStatus();
    if (isConnected) {
      console.log('اتصال موفق - بارگذاری داده‌ها');
      await lotteryManager.loadLotteryData();
    } else {
      console.log('اتصال ناموفق');
    }
  } else {
    console.log('راه‌اندازی مجدد LotteryManager');
    lotteryManager.initialize();
  }
};

// تابع ساده برای نمایش موجودی
window.showLotteryBalance = async function() {
  console.log('نمایش موجودی لاتاری...');
  if (lotteryManager.isInitialized) {
    await lotteryManager.showTokenBalance();
  } else {
    console.log('LotteryManager راه‌اندازی نشده');
  }
};

// تابع تست قرارداد لاتاری
window.testLotteryContract = async function() {
  console.log('تست قرارداد لاتاری...');
  if (lotteryManager.isInitialized && lotteryManager.lotteryContract) {
    try {
      console.log('آدرس قرارداد لاتاری:', lotteryManager.lotteryContract.address);
      console.log('قرارداد لاتاری آماده است');
      return true;
    } catch (error) {
      console.error('خطا در تست قرارداد لاتاری:', error);
      return false;
    }
  } else {
    console.log('قرارداد لاتاری راه‌اندازی نشده');
    return false;
  }
};

// Export برای استفاده در HTML
window.lotteryManager = lotteryManager; 