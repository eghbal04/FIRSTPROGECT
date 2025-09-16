(function(){
  try {
    var lacks = [];
    if (typeof Promise === 'undefined') lacks.push('Promise');
    if (typeof fetch === 'undefined') lacks.push('fetch');
    if (typeof URLSearchParams === 'undefined') lacks.push('URLSearchParams');
    if (typeof BigInt === 'undefined') lacks.push('BigInt');
    if (!Array.prototype.flat) lacks.push('Array.flat');
    if (typeof Object.assign !== 'function') lacks.push('Object.assign');

    // Very safe optional chaining probe (avoid syntax error by not using ?.)
    var optionalChainingSupported = true;
    try { new Function('var o={a:{b:1}}; return o && o.a ? o.a.b : null;')(); } catch(e){ optionalChainingSupported = false; }

    if (lacks.length > 0 || !optionalChainingSupported) {
      window.__INCOMPATIBLE_BROWSER__ = true;

      try {
        // Remove subsequent scripts to prevent runtime errors
        var scripts = document.getElementsByTagName('script');
        for (var i = scripts.length - 1; i >= 0; i--) {
          var s = scripts[i];
          // keep this compat script only
          if (s && s.src && s.src.indexOf('js/compat.js') === -1) {
            if (s.parentNode) s.parentNode.removeChild(s);
          }
        }
      } catch(_e) {}

      // Build minimal blocking UI
      var style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode('\n.compat-block{position:fixed;inset:0;background:#0f0f17;color:#fff;display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;text-align:center;font-family:Arial,Helvetica,sans-serif} .compat-card{max-width:680px;background:#1b2033;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,0.35)} .compat-title{font-size:18px;margin-bottom:10px;color:#00ff88} .compat-body{font-size:14px;line-height:1.6;color:#cbd5e1} .compat-list{margin-top:10px;font-size:12px;color:#94a3b8} .compat-btn{margin-top:16px;display:inline-block;padding:10px 16px;border-radius:8px;background:linear-gradient(90deg,#a786ff,#00ff88);color:#0f0f17;text-decoration:none;font-weight:700}\n'));
      try { document.head.appendChild(style); } catch(_e2) {}

      var overlay = document.createElement('div');
      overlay.className = 'compat-block';
      var card = document.createElement('div');
      card.className = 'compat-card';
      var title = document.createElement('div');
      title.className = 'compat-title';
      title.appendChild(document.createTextNode('Your browser is not supported'));
      var body = document.createElement('div');
      body.className = 'compat-body';
      var msg = 'For security and performance, please update your browser to the latest version.\nRecommended: Chrome 90+, Edge 90+, Firefox 90+, Safari iOS 14+.';
      body.appendChild(document.createTextNode(msg));
      var list = document.createElement('div');
      list.className = 'compat-list';
      var details = 'Missing features: ' + (lacks.length ? lacks.join(', ') : 'core syntax');
      list.appendChild(document.createTextNode(details));
      var btn = document.createElement('a');
      btn.className = 'compat-btn';
      btn.href = 'https://browsehappy.com/';
      btn.target = '_blank';
      btn.rel = 'noopener';
      btn.appendChild(document.createTextNode('How to update my browser'));

      card.appendChild(title);
      card.appendChild(body);
      card.appendChild(list);
      card.appendChild(btn);
      overlay.appendChild(card);

      // Clear body and mount overlay
      try { document.documentElement.scrollTop = 0; } catch(_e3) {}
      try { document.body.innerHTML = ''; } catch(_e4) {}
      try { document.body.appendChild(overlay); } catch(_e5) {
        // Fallback if body not yet available
        document.addEventListener('DOMContentLoaded', function(){
          try { document.body.innerHTML = ''; document.body.appendChild(overlay); } catch(_e6) {}
        });
      }
    }
  } catch (err) {
    // If compat script itself fails, do nothing to avoid blocking modern browsers
  }
})();


