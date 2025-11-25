
(() => {
  const DEBUG = true;

  document.addEventListener('DOMContentLoaded', () => {
    const farmerTab = document.getElementById('farmer-tab');
    if (!farmerTab) {
      if (DEBUG) console.log('[login] farmer-tab not found — not a login page.');
      return;
    }

    const buyerTab = document.getElementById('buyer-tab');

    const farmerForm = document.getElementById('farmer-form');
    const buyerForm  = document.getElementById('buyer-form');

    // create a login message area (if not present)
    let loginMsg = document.getElementById('login-msg');
    if (!loginMsg) {
      loginMsg = document.createElement('div');
      loginMsg.id = 'login-msg';
      loginMsg.className = 'mt-4 text-center text-sm text-red-600 hidden';
      const attachPoint = document.querySelector('#farmer-form')?.parentElement || document.body;
      attachPoint.appendChild(loginMsg);
    }
    function showLoginMsg(text) { loginMsg.textContent = text; loginMsg.classList.remove('hidden'); }
    function hideLoginMsg() { loginMsg.textContent = ''; loginMsg.classList.add('hidden'); }

    // set active tab visuals and show/hide forms
    function setActiveTab(tabName) {
      const tabs = [
        { el: farmerTab, name: 'farmer' },
        { el: buyerTab,  name: 'buyer'  }
      ];
      tabs.forEach(t => {
        if (!t.el) return;
        if (t.name === tabName) {
          t.el.classList.remove('bg-gray-200', 'text-black');
          t.el.classList.add('bg-primary', 'text-white');
        } else {
          t.el.classList.remove('bg-primary', 'text-white');
          t.el.classList.add('bg-gray-200', 'text-black');
        }
      });

      if (tabName === 'farmer') {
        farmerForm.classList.remove('hidden');
        buyerForm.classList.add('hidden');
      } else {
        buyerForm.classList.remove('hidden');
        farmerForm.classList.add('hidden');
      }
      hideLoginMsg();
    }

    // tab clicks
    if (farmerTab) farmerTab.addEventListener('click', () => setActiveTab('farmer'));
    if (buyerTab)  buyerTab.addEventListener('click', () => setActiveTab('buyer'));

    // default
    setActiveTab('farmer');

    // find login buttons inside each form (defensive)
    function findLoginBtn(formEl) {
      if (!formEl) return null;
      return formEl.querySelector('button[type="button"], button[type="submit"], button') || null;
    }
    const farmerBtn = findLoginBtn(farmerForm);
    const buyerBtn  = findLoginBtn(buyerForm);

    if (DEBUG) console.log('[login] buttons found:', { farmer: !!farmerBtn, buyer: !!buyerBtn });

    if (farmerBtn) farmerBtn.addEventListener('click', handleFarmerLogin);
    if (buyerBtn)  buyerBtn.addEventListener('click', handleBuyerLogin);

    // allow Enter to submit visible form
    [farmerForm, buyerForm].forEach(form => {
      if (!form) return;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!farmerForm.classList.contains('hidden')) handleFarmerLogin();
        else handleBuyerLogin();
      });
    });

    // tryRedirect: robust redirect that works in file:// and http(s)
    async function tryRedirect(paths) {
      if (!paths || paths.length === 0) return;
      // if running from file:// just do direct navigation to primary path
      if (location.protocol === 'file:') {
        if (DEBUG) console.warn('[redirect] running from file:// — navigating to', paths[0]);
        location.href = paths[0];
        return;
      }

      // otherwise try HEAD for each path, fallback to GET if HEAD blocked
      for (const p of paths) {
        try {
          // prefer HEAD
          let ok = false;
          try {
            const h = await fetch(p, { method: 'HEAD' });
            ok = h.ok;
            if (DEBUG) console.log('[redirect] HEAD', p, h.status);
          } catch (headErr) {
            // HEAD might be blocked on some hosts, try GET small range
            try {
              const g = await fetch(p, { method: 'GET' });
              ok = g.ok;
              if (DEBUG) console.log('[redirect] GET fallback', p, g.status);
            } catch (getErr) {
              if (DEBUG) console.warn('[redirect] GET failed for', p, getErr.message);
            }
          }
          if (ok) {
            if (DEBUG) console.log('[redirect] navigating to', p);
            location.href = p;
            return;
          }
        } catch (err) {
          if (DEBUG) console.warn('[redirect] error checking', p, err.message);
        }
      }

      // no path verified — just go to first
      if (DEBUG) console.warn('[redirect] no accessible path found, navigating to primary', paths[0]);
      location.href = paths[0];
    }

    // handlers - hardcoded demo credentials
    function handleFarmerLogin() {
      hideLoginMsg();
      const email = (document.getElementById('farmer-email')?.value || '').trim().toLowerCase();
      const pass  = (document.getElementById('farmer-password')?.value || '').trim();
      if (DEBUG) console.log('[login] farmer attempt', email);
      if (email === 'farmer@gmail.com' && pass === '1234') {
        tryRedirect([
          'farmer/index.html',
          'farmer/dashboard.html',
          'farmer/index.htm'
        ]);
      } else {
        showLoginMsg('Invalid farmer credentials.');
      }
    }

    function handleBuyerLogin() {
      hideLoginMsg();
      const email = (document.getElementById('buyer-email')?.value || '').trim().toLowerCase();
      const pass  = (document.getElementById('buyer-password')?.value || '').trim();
      if (DEBUG) console.log('[login] buyer attempt', email);
      if (email === 'buyer@gmail.com' && pass === '1234') {
        tryRedirect([
          'buyer/index.html',
          'buyer/dashboard.html',
          'buyer/index.htm'
        ]);
      } else {
        showLoginMsg('Invalid buyer credentials.');
      }
    }

    if (DEBUG) console.log('[login] ready.');
  });
})();
