// حذف دکمه آرشیو بازارهای مالی
document.addEventListener('DOMContentLoaded', function() {
  var archiveBtn = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent.includes('آرشیو بازارهای مالی'));
  if (archiveBtn) archiveBtn.remove();
}); 