(function() {
  'use strict';

  // حذف دکمه قبلی اگر وجود داشته باشه
  var oldBtn = document.getElementById('sidebarToggle');
  if (oldBtn) oldBtn.remove();

  // دکمه باز کردن ساید بار
  var toggleBtn = document.createElement('button');
  toggleBtn.id = 'sidebarToggle';
  toggleBtn.className = 'sidebar-toggle-btn';
  toggleBtn.innerHTML = '☰';
  toggleBtn.onclick = function() {
    window.toggleSidebar();
  };
  
  document.body.appendChild(toggleBtn);

  // استایل دکمه
  var style = document.createElement('style');
  style.textContent = `
  .sidebar-toggle-btn {
    position: fixed;
    bottom: var(--modern-space-lg);
    left: var(--modern-space-lg);
    width: 65px;
    height: 65px;
    background: linear-gradient(135deg, var(--modern-secondary-light), var(--modern-primary-light));
    border: 2px solid var(--modern-secondary-border);
    border-radius: var(--modern-radius-full);
    color: var(--modern-secondary);
    font-size: var(--modern-font-size-2xl);
    cursor: pointer;
    z-index: calc(var(--modern-z-modal) - 1);
    transition: var(--modern-transition-normal);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: var(--modern-shadow-lg);
    font-weight: 700;
  }

  .sidebar-toggle-btn:hover {
    background: linear-gradient(135deg, var(--modern-secondary), var(--modern-primary));
    transform: scale(1.1);
    box-shadow: var(--modern-shadow-xl);
    color: var(--modern-bg-primary);
  }

  .sidebar-toggle-btn:active {
    transform: scale(0.95);
  }

  /* موبایل */
  @media (max-width: 768px) {
    .sidebar-toggle-btn {
      width: 58px;
      height: 58px;
      bottom: 15px;
      left: 15px;
      font-size: 1.5rem;
    }
  }
  `;
  document.head.appendChild(style);

})();
