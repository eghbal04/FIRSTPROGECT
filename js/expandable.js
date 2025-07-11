// مدیریت بخش‌های Expandable
function toggleExpandable(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.classList.toggle('collapsed');
    const isCollapsed = container.classList.contains('collapsed');
    localStorage.setItem(`expandable_${containerId}`, isCollapsed ? 'collapsed' : 'expanded');
  }
}
function restoreExpandableStates() {
  const expandableContainers = document.querySelectorAll('.expandable-container');
  expandableContainers.forEach(container => {
    const containerId = container.id;
    const savedState = localStorage.getItem(`expandable_${containerId}`);
    if (savedState === 'collapsed') {
      container.classList.add('collapsed');
    }
  });
}
document.addEventListener('DOMContentLoaded', function() {
  restoreExpandableStates();
}); 