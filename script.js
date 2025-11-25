// script.js - single clean copy: tab switching + defensive login + safer redirect checks
(() => {
  const DEBUG = true;

  document.addEventListener('DOMContentLoaded', () => {
    const farmerTab = document.getElementById('farmer-tab');
    if (!farmerTab) {
      if (DEBUG) console.log('[login] farmer-tab not found — exiting (not login page).');
      return;
    }

    const buyerTab = document.getElementById('buyer-tab');
    const adminTab = document.getElementById('admin-tab');

    const farmerForm = document.getElementById('farmer-form');
    const buyerForm = document.getElementById('buyer-form');
    const adminForm = document.getElementById('admin-form');

    // create/show login message
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

    // Utility to set active tab visuals (Tailwind classes)
    function setActiveTab(tabName) {
      const tabs = [
        { el: farmerTab, name: 'farmer' },
        { el: buyerTab,  name: 'buyer'  },
        { el: adminTab,  name: 'admin'  }
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
      // show corresponding form
      if (tabName === 'farmer') {
        farmerForm.classList.remove('hidden');
        buyerForm.classList.add('hidden');
        adminForm.classList.add('hidden');
      } else if (tabName === 'buyer') {
        buyerForm.classList.remove('hidden');
        farmerForm.classList.add('hidden');
        adminForm.classList.add('hidden');
      } else {
        adminForm.classList.remove('hidden');
        farmerForm.classList.add('hidden');
        buyerForm.classList.add('hidden');
      }
      hideLoginMsg();
    }

    // Hook tab clicks
    if (farmerTab) farmerTab.addEventListener('click', () => setActiveTab('farmer'));
    if (buyerTab)  buyerTab.addEventListener('click', () => setActiveTab('buyer'));
    if (adminTab)  adminTab.addEventListener('click', () => setActiveTab('admin'));

    // init to farmer
    setActiveTab('farmer');

    // Helper: find button inside form if id isn't present
    function findButton(formEl, idFallback) {
      if (!formEl) return null;
      if (idFallback) {
        const byId = document.getElementById(idFallback);
        if (byId) return byId;
      }
      return formEl.querySelector('button[type="button"], button[type="submit"], input[type="button"], input[type="submit"], button') || null;
    }

    const farmerLoginBtn = findButton(farmerForm, 'farmer-login-btn');
    const buyerLoginBtn  = findButton(buyerForm, 'buyer-login-btn');
    const adminLoginBtn  = findButton(adminForm, 'admin-login-btn');

    if (DEBUG) {
      console.log('[login] buttons:', { farmer: !!farmerLoginBtn, buyer: !!buyerLoginBtn, admin: !!adminLoginBtn });
    }

    if (farmerLoginBtn) farmerLoginBtn.addEventListener('click', handleFarmerLogin);
    if (buyerLoginBtn)  buyerLoginBtn.addEventListener('click', handleBuyerLogin);
    if (adminLoginBtn)  adminLoginBtn.addEventListener('click', handleAdminLogin);

    // handle Enter key submit on visible forms
    [farmerForm, buyerForm, adminForm].forEach(form => {
      if (!form) return;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!farmerForm.classList.contains('hidden')) handleFarmerLogin();
        else if (!buyerForm.classList.contains('hidden')) handleBuyerLogin();
        else if (!adminForm.classList.contains('hidden')) handleAdminLogin();
      });
    });

    // Safe redirect attempt:
    // Try HTTP HEAD for each candidate path; if response.ok navigate immediately.
    // If fetch fails (file:// or blocked), fallback to direct navigation to first path.
    async function tryRedirect(paths) {
      if (!paths || paths.length === 0) return;
      if (location.protocol === 'file:') {
        if (DEBUG) console.warn('[redirect] running from file:// — cannot HEAD; navigating to first path directly:', paths[0]);
        location.href = paths[0];
        return;
      }

      for (let p of paths) {
        try {
          // try HEAD first
          const resp = await fetch(p, { method: 'HEAD' });
          if (resp.ok) {
            if (DEBUG) console.log('[redirect] found path (HEAD ok):', p);
            location.href = p;
            return;
          } else {
            if (DEBUG) console.log('[redirect] HEAD not ok for', p, resp.status);
          }
        } catch (err) {
          if (DEBUG) console.warn('[redirect] error fetching', p, err.message);
        }
      }
      if (DEBUG) console.warn('[redirect] no HEAD match found — navigating to primary path:', paths[0]);
      location.href = paths[0];
    }

    // Credential handlers
    function handleFarmerLogin() {
      hideLoginMsg();
      const email = (document.getElementById('farmer-email')?.value || '').trim();
      const pass  = (document.getElementById('farmer-password')?.value || '').trim();
      if (DEBUG) console.log('[login] farmer attempt:', email);
      if (email === 'farmer@gmail.com' && pass === '1234') {
        tryRedirect([
          'farmer/farmerDashboard.html',
          'farmer/farmerDashboar.html',
          'farmer/index.html'
        ]);
      } else {
        showLoginMsg('Invalid farmer credentials.');
      }
    }

    function handleBuyerLogin() {
      hideLoginMsg();
      const email = (document.getElementById('buyer-email')?.value || '').trim();
      const pass  = (document.getElementById('buyer-password')?.value || '').trim();
      if (DEBUG) console.log('[login] buyer attempt:', email);
      if (email === 'buyer@gmail.com' && pass === '1234') {
        tryRedirect([
          'buyer/Dashbord.html',
          'buyer/dashbord.html',
          'buyer/index.html'
        ]);
      } else {
        showLoginMsg('Invalid buyer credentials.');
      }
    }

    function handleAdminLogin() {
      hideLoginMsg();
      const email = (document.getElementById('admin-email')?.value || '').trim();
      const pass  = (document.getElementById('admin-password')?.value || '').trim();
      if (DEBUG) console.log('[login] admin attempt:', email);
      if (email === 'admin@gmail.com' && pass === '1234') {
        tryRedirect([
          'admin/index.html'
        ]);
      } else {
        showLoginMsg('Invalid admin credentials.');
      }
    }

    if (DEBUG) console.log('[login] ready — test credentials and watch console for fetch/redirect logs.');
  });
})();

