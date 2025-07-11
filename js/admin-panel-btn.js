// افزودن دکمه پنل ادمین برای Owner
window.addAdminPanelButtonIfOwner = async function() {
  try {
    const existingBtn = document.getElementById('admin-panel-btn');
    if (existingBtn) existingBtn.remove();
    const existingDivider = document.getElementById('admin-panel-divider');
    if (existingDivider) existingDivider.remove();
    if (!window.contractConfig || !window.contractConfig.contract || !window.contractConfig.address) return;
    let ownerAddress;
    try {
      ownerAddress = await window.contractConfig.contract.owner();
    } catch (e) { return; }
    const userAddress = window.contractConfig.address;
    if (!ownerAddress || !userAddress) return;
    if (ownerAddress.toLowerCase() !== userAddress.toLowerCase()) return;
    const divider = document.createElement('div');
    divider.className = 'menu-divider';
    divider.id = 'admin-panel-divider';
    const btn = document.createElement('button');
    btn.id = 'admin-panel-btn';
    btn.innerHTML = '<span class="menu-icon">🛡️</span>پنل ادمین';
    btn.onclick = function() { window.location.href = 'admin-owner-panel.html'; };
    btn.style.background = '#232946';
    btn.style.color = '#a786ff';
    btn.style.fontWeight = 'bold';
    btn.style.display = 'block';
    btn.style.border = '1px solid #a786ff';
    btn.style.marginTop = '10px';
    btn.style.padding = '10px';
    btn.style.borderRadius = '8px';
    btn.style.cursor = 'pointer';
    document.body.appendChild(divider);
    document.body.appendChild(btn);
  } catch (e) {}
};
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(window.addAdminPanelButtonIfOwner, 1000);
}); 