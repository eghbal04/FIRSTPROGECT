// فایل js/navbar-connect-auto.js
window.addEventListener('load', () => {
  const checkNavbarLoaded = setInterval(() => {
    const btn = document.getElementById('connectWalletBtn');
    if (btn && typeof connectWallet === 'function') {
   
      clearInterval(checkNavbarLoaded);
    }
  }, 200);
});
