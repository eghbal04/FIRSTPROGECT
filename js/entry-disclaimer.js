(function(){
  const MAX_SHOWS_PER_ACCOUNT = 10;
  let countedForThisPage = false;

  function createModal(){
    const backdrop = document.createElement('div');
    backdrop.className = 'entry-disclaimer-backdrop';

    const modal = document.createElement('div');
    modal.className = 'entry-disclaimer-modal';
    modal.innerHTML = `
      <div class="entry-disclaimer-header">
        <h3 class="entry-disclaimer-title">توضیح مهم درباره توکن CPA</h3>
        <button class="entry-disclaimer-close" aria-label="بستن">×</button>
      </div>
      <div class="entry-disclaimer-content">
        <div id="entry-disclaimer-typer" class="entry-typer" aria-live="polite" aria-atomic="true"></div>
      </div>
      <div class="entry-disclaimer-actions">
        <label class="entry-disclaimer-left">
          <input id="entry-disclaimer-dontshow" type="checkbox" class="entry-disclaimer-checkbox" />
          <span>دیگر نمایش نده</span>
        </label>
        <div class="entry-disclaimer-buttons">
          <button class="entry-disclaimer-btn ghost" id="entry-disclaimer-more">مطالعه بیشتر</button>
          <button class="entry-disclaimer-btn primary" id="entry-disclaimer-accept">متوجه شدم</button>
        </div>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Handlers
    function hide(){
      backdrop.classList.remove('active');
      setTimeout(()=>{ backdrop.style.display = 'none'; }, 220);
    }

    let hasTyped = false;
    function startTyping(){
      if (hasTyped) return; hasTyped = true;
      const target = modal.querySelector('#entry-disclaimer-typer');
      if (!target) return;
      const text = (
        'توکن CPA با تکیه بر منطق اقتصادی درون‌قراردادی به‌صورت تدریجی رشد می‌کند. ' +
        'در هر خرید و فروش، ۲٪ کارمزد به پشتوانه اضافه می‌شود؛ بنابراین با پویایی شبکه، ارزش پشتوانه تقویت شده و سرمایهٔ شما می‌تواند همسو با رشد شبکه افزایش یابد.' +
        '\n\n• در بدبینانه‌ترین حالت، اگر پس از خرید هیچ تراکنشی رخ ندهد و قصد تبدیل یا برداشت داشته باشید، ۲٪ کارمزد خرید و ۲٪ کارمزد فروش (مجموعاً ۴٪) پرداخت می‌شود. در این سناریو، بدون وابستگی به زمان، صرفاً این کارمزدها اعمال می‌گردد.' +
        '\n• در شرایط رشد شبکه، به‌ازای هر خرید و فروش، ۲٪ به پشتوانه افزوده می‌شود و این موضوع می‌تواند به نفع سرمایه‌گذاران باشد؛ البته میزان سودآوری وابسته به پویایی واقعی بازار است و تضمینی وجود ندارد.' +
        '\n• قیمت مبتنی بر نسبت موجودی DAI در قرارداد به تعداد توکن‌های در گردش است؛ بنابراین وابسته به پشتوانهٔ واقعی و شفاف محاسبه می‌شود.' +
        '\n\nلطفاً با دید منطقی و مدیریت ریسک تصمیم‌گیری کنید. این یک ابزار سرمایه‌گذاری با پشتوانهٔ فناوری بلاک‌چین پالیگان و توکن DAI است که هر دو از زیرساخت‌های معتبر به‌شمار می‌روند؛ با این حال، بازار می‌تواند نوسان داشته باشد و انتظار غیرمنطقی از بازده نداشته باشید.'
      );
      const speedMs = 22;
      let i = 0;
      const typeNext = () => {
        if (i > text.length) return;
        const ch = text.charAt(i);
        if (ch === '\n') {
          target.innerHTML += '<br>';
        } else {
          const safe = ch
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          target.innerHTML += safe;
        }
        i += 1;
        if (i <= text.length) setTimeout(typeNext, speedMs);
      };
      typeNext();
    }

    function show(){
      backdrop.style.display = 'flex';
      requestAnimationFrame(()=>{
        backdrop.classList.add('active');
      });
      setTimeout(startTyping, 160);
    }

    backdrop.addEventListener('click', (e)=>{
      if(e.target === backdrop) hide();
    });
    modal.querySelector('.entry-disclaimer-close').addEventListener('click', hide);
    modal.querySelector('#entry-disclaimer-accept').addEventListener('click', ()=>{
      const dontShow = modal.querySelector('#entry-disclaimer-dontshow').checked;
      if(dontShow){ try { localStorage.setItem(STORAGE_KEY, '1'); } catch(_){} }
      hide();
    });
    modal.querySelector('#entry-disclaimer-more').addEventListener('click', ()=>{
      // If you have a dedicated page, replace the URL below
      window.open('about.html', '_blank');
    });

    return { show };
  }

  function storageKeyForCount(address){
    const addr = (address || '').toLowerCase();
    return `cpa_disclaimer_count_${addr}`;
  }

  async function tryGetAddress(){
    try {
      // Prefer contractConfig if available
      if (window.contractConfig && window.contractConfig.address) {
        return String(window.contractConfig.address).toLowerCase();
      }
      // Try MetaMask silently
      if (window.ethereum && typeof window.ethereum.request === 'function') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) return String(accounts[0]).toLowerCase();
      }
    } catch(_){}
    return null;
  }

  function getShowCount(address){
    try {
      const v = localStorage.getItem(storageKeyForCount(address));
      const n = parseInt(v || '0', 10);
      return isNaN(n) ? 0 : n;
    } catch(_) { return 0; }
  }

  function incrementShowCount(address){
    if (!address || countedForThisPage) return;
    try {
      const current = getShowCount(address);
      localStorage.setItem(storageKeyForCount(address), String(Math.min(MAX_SHOWS_PER_ACCOUNT, current + 1)));
      countedForThisPage = true;
    } catch(_){}
  }

  function startCountWatcher(){
    // Poll for address up to ~15s
    let tries = 0;
    const maxTries = 60; // 60 * 250ms = 15s
    const interval = setInterval(async () => {
      tries++;
      const addr = await tryGetAddress();
      if (addr) {
        incrementShowCount(addr);
        clearInterval(interval);
      } else if (tries >= maxTries) {
        clearInterval(interval);
      }
    }, 250);

    // Also listen to MetaMask account changes to capture later login
    if (window.ethereum && typeof window.ethereum.on === 'function') {
      try { window.ethereum.on('accountsChanged', (accounts)=>{ if (accounts && accounts[0]) incrementShowCount(accounts[0]); }); } catch(_){}
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    (async () => {
      const { show } = createModal();
      let allowShow = true;
      try {
        const addr = await tryGetAddress();
        if (addr) {
          const count = getShowCount(addr);
          allowShow = count < MAX_SHOWS_PER_ACCOUNT;
        }
      } catch(_){}

      if (allowShow) {
        setTimeout(show, 400);
        startCountWatcher();
      }
    })();
  });
})();


