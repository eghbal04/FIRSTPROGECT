// مدیریت بخش‌های Expandable - بدون کش
function toggleExpandable(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.classList.toggle('collapsed');
    // No caching - state is not persisted
  }
}
function restoreExpandableStates() {
  // No caching - all containers start in default state
}
document.addEventListener('DOMContentLoaded', function() {
  restoreExpandableStates();
}); 