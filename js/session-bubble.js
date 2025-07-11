// مدیریت حباب جلسه آنلاین و شمارش معکوس
function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  let s = Math.floor(ms / 1000);
  let h = Math.floor(s / 3600);
  s = s % 3600;
  let m = Math.floor(s / 60);
  s = s % 60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}
function showSessionBubble() {
  const info = window.sessionInfo;
  if (!info || !info.active) return;
  const bubble = document.getElementById('online-session-bubble');
  const mini = document.getElementById('bubble-mini');
  const timer = document.getElementById('bubble-timer');
  const link = bubble.querySelector('.bubble-link');
  link.href = info.link || 'learning.html';
  bubble.style.display = 'flex';
  mini.style.display = 'none';
  function updateTimer() {
    const now = Date.now();
    if (now < info.startTime) {
      timer.textContent = 'شروع تا جلسه: ' + formatCountdown(info.startTime - now);
    } else if (now < info.endTime) {
      timer.textContent = 'زمان باقی‌مانده: ' + formatCountdown(info.endTime - now);
    } else {
      timer.textContent = 'جلسه به پایان رسید';
    }
  }
  updateTimer();
  window._bubbleTimerInterval = setInterval(updateTimer, 1000);
}
function hideSessionBubble() {
  document.getElementById('online-session-bubble').style.display = 'none';
  document.getElementById('bubble-mini').style.display = 'flex';
  if (window._bubbleTimerInterval) clearInterval(window._bubbleTimerInterval);
}
function showMiniBubble() {
  document.getElementById('bubble-mini').style.display = 'flex';
  document.getElementById('online-session-bubble').style.display = 'none';
}
function expandMiniBubble() {
  showSessionBubble();
}
document.addEventListener('DOMContentLoaded', function() {
  if (window.sessionInfo && window.sessionInfo.active) {
    showSessionBubble();
  }
  document.getElementById('bubble-close').onclick = hideSessionBubble;
  document.getElementById('bubble-mini').onclick = expandMiniBubble;
}); 