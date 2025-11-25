// app.js

// --- State Management ---
const STORAGE_KEY = 'agritrust_v1';

let state = {
    user: { name: "Ankit Singh", balance: 0 },
    listings: [],
    orders: [],
    notifications: [],
    hasSeeded: false
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    if (!state.hasSeeded) {
        seedDemoData();
    }
    
    setupEventListeners();
    renderUI();
});

// --- Data Persistence ---
function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        renderUI(); // Re-render on save
    } catch (e) {
        console.error('Storage failed', e);
    }
}

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        state = JSON.parse(raw);
    }
}

function seedDemoData() {
    // Seed Listings
    state.listings = [
        { id: 'L1', crop: 'Wheat', qty: 1200, price: 22, date: new Date().toLocaleDateString() },
        { id: 'L2', crop: 'Onion', qty: 500, price: 14, date: new Date().toLocaleDateString() }
    ];
    
    // Seed Orders
    state.orders = [
        { id: 'ORD-101', crop: 'Wheat', val: 22000, escrowStatus: 'Released', deliveryStatus: 'Delivered', dispute: false },
        { id: 'ORD-102', crop: 'Potato', val: 8500, escrowStatus: 'Locked', deliveryStatus: 'Pending', dispute: false },
        { id: 'ORD-103', crop: 'Tomato', val: 4000, escrowStatus: 'Locked', deliveryStatus: 'Dispute', dispute: true }
    ];

    state.user.balance = 22000;
    state.hasSeeded = true;
    saveState();
}

// --- Core Logic ---

function createListing(crop, qty, price, photoData) {
    const newListing = {
        id: 'L' + Date.now(),
        crop,
        qty: parseInt(qty),
        price: parseInt(price),
        photo: photoData,
        date: new Date().toLocaleDateString()
    };
    state.listings.unshift(newListing);
    addNotification(`Listed ${qty}kg of ${crop}`);
    saveState();
}

function simulateSell(listingId) {
    const listing = state.listings.find(l => l.id === listingId);
    if (!listing) return;

    const orderVal = listing.qty * listing.price;
    const newOrder = {
        id: 'ORD-' + Math.floor(Math.random() * 10000),
        crop: listing.crop,
        val: orderVal,
        escrowStatus: 'Locked',
        deliveryStatus: 'Pending',
        dispute: false
    };

    state.orders.unshift(newOrder);
    addNotification(`Escrow LOCKED for ${newOrder.id} (₹${orderVal.toLocaleString('en-IN')})`);
    // Note: In a real app, we might reduce listing qty here
    saveState();
}

function confirmDelivery(orderId, proofImage, lat, lon) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    order.escrowStatus = 'Released';
    order.deliveryStatus = 'Delivered';
    order.proof = { image: proofImage, lat, lon };
    
    state.user.balance += order.val;
    
    addNotification(`Escrow RELEASED for ${order.id}. ₹${order.val.toLocaleString('en-IN')} added to balance.`);
    saveState();
}

function manualRelease(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (order && order.escrowStatus === 'Locked') {
        order.escrowStatus = 'Released';
        state.user.balance += order.val;
        addNotification(`Admin Override: Escrow released for ${orderId}`);
        saveState();
    }
}

function addNotification(msg) {
    state.notifications.unshift({ msg, time: new Date().toLocaleTimeString() });
    if (state.notifications.length > 5) state.notifications.pop();
}

// --- Rendering ---

function renderUI() {
    renderKPIs();
    renderListings();
    renderOrders();
    renderNotifications();
    renderHeatmap();
    
    // Update Notification Badge
    const badge = document.getElementById('notif-badge');
    if (badge) badge.textContent = state.notifications.length;
}

function renderKPIs() {
    const balEl = document.getElementById('kpi-balance');
    if (balEl) balEl.textContent = '₹' + state.user.balance.toLocaleString();
    
    const active = state.orders.filter(o => o.deliveryStatus === 'Pending' || o.escrowStatus === 'Locked').length;
    const activeEl = document.getElementById('kpi-active');
    if (activeEl) activeEl.textContent = active;

    const locked = state.orders
        .filter(o => o.escrowStatus === 'Locked')
        .reduce((acc, curr) => acc + curr.val, 0);
    const escrowEl = document.getElementById('kpi-escrow');
    if (escrowEl) escrowEl.textContent = '₹' + locked.toLocaleString();
}

function renderListings() {
    const container = document.getElementById('listings-container');
    if (!container) return;
    container.innerHTML = '';

    state.listings.forEach(l => {
        const div = document.createElement('div');
        div.className = 'listing-card';
        div.innerHTML = `
            <div class="listing-header">
                <div class="crop-icon">🌾</div>
                <div class="crop-title">${escapeHtml(l.crop)}</div>
            </div>
            <div class="listing-details">
                <strong>${l.qty} kg</strong> @ ₹${l.price}/kg<br>
                <span style="color:#888">Listed: ${escapeHtml(l.date)}</span>
            </div>
            <div class="listing-actions">
                <button class="btn-sm">Edit</button>
                <button class="btn-sm btn-sell" data-id="${l.id}">Simulate Sell</button>
            </div>
        `;
        container.appendChild(div);
    });

    // attach sell handlers
    document.querySelectorAll('.btn-sell').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            handleSimulateSell(id);
        });
    });
}

function renderOrders() {
    const tbody = document.getElementById('orders-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    state.orders.forEach(o => {
        let statusClass = 'locked';
        if (o.escrowStatus === 'Released') statusClass = 'released';
        if (o.dispute) statusClass = 'dispute';

        let actionHtml = '-';
        
        if (o.escrowStatus === 'Locked') {
            actionHtml = `
                <button class="action-btn btn-confirm" data-id="${o.id}">Confirm Delivery</button>
                <button class="action-btn btn-admin" data-id="${o.id}" title="Admin Simulation">Admin Release</button>
            `;
        } else if (o.escrowStatus === 'Released') {
            actionHtml = '<span style="color:green;">✔ Completed</span>';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(o.id)}</td>
            <td>${escapeHtml(o.crop)}</td>
            <td>₹${o.val.toLocaleString()}</td>
            <td><span class="pill ${statusClass}">${escapeHtml(o.escrowStatus)}</span></td>
            <td>${actionHtml}</td>
        `;
        tbody.appendChild(tr);
    });

    // wire dynamic action buttons
    document.querySelectorAll('.btn-confirm').forEach(b => {
        b.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            openProofModal(id);
        });
    });
    document.querySelectorAll('.btn-admin').forEach(b => {
        b.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            handleManualRelease(id);
        });
    });
}

function renderNotifications() {
    const list = document.getElementById('notif-list');
    if (!list) return;
    list.innerHTML = '';
    state.notifications.forEach(n => {
        const li = document.createElement('li');
        li.innerHTML = `${escapeHtml(n.msg)} <span class="notif-time">${escapeHtml(n.time)}</span>`;
        list.appendChild(li);
    });
}

function renderHeatmap() {
    const grid = document.getElementById('heatmap-grid');
    if (!grid) return;
    // Only generate if empty to avoid flickering
    if (grid.children.length > 0) return;

    for (let i = 0; i < 20; i++) {
        const div = document.createElement('div');
        div.className = 'heat-cell';
        // Random color between yellow and red
        const r = 255;
        const g = Math.floor(Math.random() * 200) + 20; // avoid pure 0
        const b = 50;
        div.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        div.style.opacity = 0.6 + (Math.random() * 0.4);
        grid.appendChild(div);
    }
}

// --- Event Handling ---

function setupEventListeners() {
    // Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        const ham = document.querySelector('.hamburger');
        const closeBtn = document.querySelector('.close-sidebar-btn');
        if (ham) ham.addEventListener('click', () => sidebar.classList.toggle('active'));
        if (closeBtn) closeBtn.addEventListener('click', () => sidebar.classList.remove('active'));
    }

    // Modals
    const listModal = document.getElementById('modal-listing');
    const proofModal = document.getElementById('modal-proof');
    
    const btnNewListing = document.getElementById('btn-new-listing');
    if (btnNewListing) btnNewListing.addEventListener('click', () => listModal && listModal.classList.add('open'));
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            listModal && listModal.classList.remove('open');
            proofModal && proofModal.classList.remove('open');
        });
    });

    // Forms
    const formListing = document.getElementById('form-listing');
    if (formListing) {
        formListing.addEventListener('submit', (e) => {
            e.preventDefault();
            const cropInput = document.getElementById('inp-crop');
            const qtyInput = document.getElementById('inp-qty');
            const priceInput = document.getElementById('inp-price');

            const crop = cropInput ? cropInput.value : '';
            const qty = qtyInput ? qtyInput.value : 0;
            const price = priceInput ? priceInput.value : 0;

            if (!crop || qty <= 0 || price <= 0) {
                alert('Please fill crop, quantity and price.');
                return;
            }

            createListing(crop, qty, price, null);
            listModal && listModal.classList.remove('open');
            e.target.reset();
        });
    }

    const formProof = document.getElementById('form-proof');
    if (formProof) {
        formProof.addEventListener('submit', (e) => {
            e.preventDefault();
            const orderId = document.getElementById('proof-order-id')?.value;
            const fileInput = document.getElementById('inp-proof-file');
            const useGeo = document.getElementById('inp-geo') ? document.getElementById('inp-geo').checked : false;

            if (fileInput && fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const imgData = evt.target.result;
                    
                    if (useGeo && navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                confirmDelivery(orderId, imgData, pos.coords.latitude, pos.coords.longitude);
                                proofModal && proofModal.classList.remove('open');
                            },
                            (err) => {
                                alert('Geolocation failed. Submitting without location.');
                                confirmDelivery(orderId, imgData, null, null);
                                proofModal && proofModal.classList.remove('open');
                            }
                        );
                    } else {
                        confirmDelivery(orderId, imgData, null, null);
                        proofModal && proofModal.classList.remove('open');
                    }
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                alert('Please attach a photo proof.');
            }
        });
    }

    // Export CSV
    const exportBtn = document.getElementById('btn-export-csv');
    if (exportBtn) exportBtn.addEventListener('click', exportCSV);

    // Food API buttons (refresh / clear cache) - these are wired in the IIFE below too, but keep safe guard here
    const btnRefresh = document.getElementById('btn-refresh-food');
    const btnClearCache = document.getElementById('btn-clear-food-cache');
    if (btnRefresh) btnRefresh.addEventListener('click', () => { loadFoodData(true); });
    if (btnClearCache) btnClearCache.addEventListener('click', () => { clearFoodCache(); loadFoodData(true); });
}

// --- Global Handlers (attached to window for inline onclick) ---

window.handleSimulateSell = function(id) {
    if(confirm('Simulate a buyer purchasing this listing?')) {
        simulateSell(id);
    }
};

window.openProofModal = function(id) {
    const proofInput = document.getElementById('proof-order-id');
    if (proofInput) proofInput.value = id;
    const modal = document.getElementById('modal-proof');
    if (modal) modal.classList.add('open');
};

window.handleManualRelease = function(id) {
    manualRelease(id);
};

// --- Utilities ---

function escapeHtml(s) {
    if (!s && s !== 0) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
}

function exportCSV() {
    let csv = "ID,Commodity,Value,Status\n";
    state.orders.forEach(o => {
        csv += `${o.id},${o.crop},${o.val},${o.escrowStatus}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agri_orders.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// === Food API helper: fetch and populate a table with caching & fallback ===
(() => {
  const FOOD_CACHE_KEY = 'agritrust_food_cache_v1';
  const API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
  const API_BASE = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
  // UI elements (safe guards)
  const foodTable = document.getElementById('food-table');
  const foodTbody = foodTable ? foodTable.querySelector('tbody') : null;
  const msgEl = document.getElementById('food-api-msg');
  const btnRefresh = document.getElementById('btn-refresh-food');
  const btnClearCache = document.getElementById('btn-clear-food-cache');

  function setMsg(text, isError = false) {
    if (!msgEl) return;
    msgEl.textContent = text || '';
    msgEl.style.color = isError ? '#d9534f' : '#666';
  }

  function renderFoodRows(items) {
    if (!foodTbody) return;
    foodTbody.innerHTML = '';
    items.forEach(it => {
      // normalize fields expected from API
      const commodity = it.commodity || it.commodity_name || '—';
      const type = it.variety || it.grade || '—';
      // Prices are in rupees per quintal (100kg)
      const minPrice = it.modal_price || it.min_price || it.min_price_qtl || '';
      const maxPrice = it.max_price || it.max_price_qtl || '';
      const market = it.market || it.district || it.state || '—';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(commodity)}</td>
        <td>${escapeHtml(type)}</td>
        <td>${minPrice ? '₹' + Number(minPrice).toLocaleString() : '-'}</td>
        <td>${maxPrice ? '₹' + Number(maxPrice).toLocaleString() : '-'}</td>
        <td>${escapeHtml(market)}</td>
      `;
      foodTbody.appendChild(tr);
    });
  }

  // fallback mock data so UI never empty
  function mockFoodData() {
    return [
      { commodity: 'Wheat', grade: 'A', min_price: 2200, max_price: 2300, market: 'Vadodara' },
      { commodity: 'Rice', grade: 'B', min_price: 2500, max_price: 2600, market: 'Ahmedabad' },
      { commodity: 'Onion', grade: 'A', min_price: 1400, max_price: 1600, market: 'Surat' },
    ];
  }

  // cache helpers
  function saveFoodCache(data) {
    try {
      localStorage.setItem(FOOD_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch (e) { /* ignore */ }
  }
  function loadFoodCache() {
    try {
      const raw = localStorage.getItem(FOOD_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // treat cache as fresh for 10 minutes
      if (Date.now() - parsed.ts > 10 * 60 * 1000) return null;
      return parsed.data;
    } catch (e) {
      return null;
    }
  }
  function clearFoodCache() {
    try { localStorage.removeItem(FOOD_CACHE_KEY); setMsg('Cache cleared.'); } catch(e) {}
  }

  // main loader: try cache → fetch API → fallback mock
  async function loadFoodData(forceRefresh = false) {
    setMsg('Loading food data...');
    try {
      if (!forceRefresh) {
        const cached = loadFoodCache();
        if (cached) {
          renderFoodRows(cached);
          setMsg('Showing cached data (refresh to update).');
          return;
        }
      }

      const resp = await fetch(`${API_BASE}?api-key=${API_KEY}&format=json&limit=20`);
      if (!resp.ok) {
        throw new Error('API request failed: ' + resp.status + ' ' + resp.statusText);
      }
      const body = await resp.json();
      // The API returns data in records array with specific field names
      const items = body.records || [];
      if (!items || items.length === 0) {
        setMsg('API returned no items — showing demo data.', true);
        const fallback = mockFoodData();
        renderFoodRows(fallback);
        saveFoodCache(fallback);
        return;
      }

      renderFoodRows(items);
      saveFoodCache(items);
      setMsg(`Loaded ${items.length} items from API.`);
    } catch (err) {
      console.error('food API error', err);
      setMsg('Failed to load API data. Showing demo data. (Check console)', true);
      const fallback = mockFoodData();
      renderFoodRows(fallback);
      saveFoodCache(fallback);
    }
  }

  // wire buttons
  if (btnRefresh) btnRefresh.addEventListener('click', () => loadFoodData(true));
  if (btnClearCache) btnClearCache.addEventListener('click', () => { clearFoodCache(); loadFoodData(true); });

  // auto load
  try { loadFoodData(false); } catch (e) { console.error(e); }

})();
