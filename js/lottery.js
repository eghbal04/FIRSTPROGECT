// lottery.js

// توجه: برای شرکت در لاتاری باید با قرارداد توکن تعامل شود (approve, transferFrom)
// فرض: آدرس و ABI توکن و قرارداد لاتاری باید در config.js تعریف شود

// نمونه تابع برای تعامل با توکن هنگام شرکت در لاتاری:
async function joinLotteryWithToken(lotteryId, amount) {
  // window.contractConfig باید شامل provider و signer باشد
  const { signer } = window.contractConfig;
  const tokenAddress = LOTTERY_CONFIG.tokenAddress; // باید در config.js ست شود
  const lotteryAddress = LOTTERY_CONFIG.lotteryAddress; // باید در config.js ست شود
  const tokenAbi = LOTTERY_CONFIG.tokenAbi; // باید در config.js ست شود
  const token = new ethers.Contract(tokenAddress, tokenAbi, signer);
  // ابتدا approve
  const tx1 = await token.approve(lotteryAddress, amount);
  await tx1.wait();
  // سپس فراخوانی تابع joinLottery در قرارداد لاتاری
  // ...
}

document.addEventListener('DOMContentLoaded', function() {
  const lotteryInfo = document.getElementById('lottery-info');
  const lotteryJoinBtn = document.getElementById('lottery-join-btn');
  const lotteryStatus = document.getElementById('lottery-status');

  if (lotteryInfo && lotteryJoinBtn && lotteryStatus) {
    // نمایش اطلاعات لاتاری
    lotteryInfo.innerHTML = `قیمت هر بلیت: <b>${LOTTERY_CONFIG.ticketPrice} POL</b><br>حداکثر بلیت برای هر کاربر: <b>${LOTTERY_CONFIG.maxTicketsPerUser}</b>`;

    // هندل کلیک دکمه شرکت در لاتاری
    lotteryJoinBtn.addEventListener('click', function() {
      // اینجا باید منطق شرکت در لاتاری اضافه شود (مثلاً فراخوانی قرارداد هوشمند)
      lotteryStatus.innerHTML = 'درخواست شما برای شرکت در لاتاری ثبت شد! (نمونه)';
      setTimeout(() => { lotteryStatus.innerHTML = ''; }, 3000);
    });
  }
});

// Exportable functions for future contract interaction
window.lotteryActions = {
  join: function(lotteryId) {
    // فراخوانی قرارداد برای شرکت در لاتاری
  },
  create: function(memberCount, amountPerUser, winnersCount) {
    // فراخوانی قرارداد برای ایجاد لاتاری جدید
  }
}; 