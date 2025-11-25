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
    addNotification(Listed ${qty}kg of ${crop});
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
    addNotification(Escrow LOCKED for ${newOrder.id} (₹${orderVal}));
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
    
    addNotification(Escrow RELEASED for ${order.id}. ₹${order.val} added to balance.);
    saveState();
}

function manualRelease(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (order && order.escrowStatus === 'Locked') {
        order.escrowStatus = 'Released';
        state.user.balance += order.val;
        addNotification(Admin Override: Escrow released for ${orderId});
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
    document.getElementById('notif-badge').textContent = state.notifications.length;
}

function renderKPIs() {
    document.getElementById('kpi-balance').textContent = '₹' + state.user.balance.toLocaleString();
    
    const active = state.orders.filter(o => o.deliveryStatus === 'Pending' || o.escrowStatus === 'Locked').length;
    document.getElementById('kpi-active').textContent = active;

    const locked = state.orders
        .filter(o => o.escrowStatus === 'Locked')
        .reduce((acc, curr) => acc + curr.val, 0);
    document.getElementById('kpi-escrow').textContent = '₹' + locked.toLocaleString();
}

function renderListings() {
    const container = document.getElementById('listings-container');
    container.innerHTML = '';

    state.listings.forEach(l => {
        const div = document.createElement('div');
        div.className = 'listing-card';
        div.innerHTML = `
            <div class="listing-header">
                <div class="crop-icon">🌾</div>
                <div class="crop-title">${l.crop}</div>
            </div>
            <div class="listing-details">
                <strong>${l.qty} kg</strong> @ ₹${l.price}/kg<br>
                <span style="color:#888">Listed: ${l.date}</span>
            </div>
            <div class="listing-actions">
                <button class="btn-sm">Edit</button>
                <button class="btn-sm btn-sell" onclick="handleSimulateSell('${l.id}')">Simulate Sell</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderOrders() {
    const tbody = document.getElementById('orders-body');
    tbody.innerHTML = '';

    state.orders.forEach(o => {
        let statusClass = 'locked';
        if (o.escrowStatus === 'Released') statusClass = 'released';
        if (o.dispute) statusClass = 'dispute';

        let actionHtml = '-';
        
        if (o.escrowStatus === 'Locked') {
            actionHtml = `
                <button class="action-btn btn-confirm" onclick="openProofModal('${o.id}')">Confirm Delivery</button>
                <button class="action-btn btn-admin" onclick="handleManualRelease('${o.id}')" title="Admin Simulation">Admin Release</button>
            `;
        } else if (o.escrowStatus === 'Released') {
            actionHtml = '<span style="color:green;">✔ Completed</span>';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${o.id}</td>
            <td>${o.crop}</td>
            <td>₹${o.val.toLocaleString()}</td>
            <td><span class="pill ${statusClass}">${o.escrowStatus}</span></td>
            <td>${actionHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderNotifications() {
    const list = document.getElementById('notif-list');
    list.innerHTML = '';
    state.notifications.forEach(n => {
        const li = document.createElement('li');
        li.innerHTML = ${n.msg} <span class="notif-time">${n.time}</span>;
        list.appendChild(li);
    });
}

function renderHeatmap() {
    const grid = document.getElementById('heatmap-grid');
    // Only generate if empty to avoid flickering
    if (grid.children.length > 0) return;

    for (let i = 0; i < 100; i++) {
        const div = document.createElement('div');
        div.className = 'heat-cell';
        // Random color between yellow and red
        const r = 255;
        const g = Math.floor(Math.random() * 255);
        const b = 50;
        // Adjust green to simulate heatmap (lower green = redder/hotter)
        div.style.backgroundColor = rgb(${r}, ${g}, ${b});
        div.style.opacity = 0.6 + (Math.random() * 0.4);
        grid.appendChild(div);
    }
}

// --- Event Handling ---

function setupEventListeners() {
    // Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        document.querySelector('.hamburger').addEventListener('click', () => sidebar.classList.add('active'));
        document.querySelector('.close-sidebar-btn').addEventListener('click', () => sidebar.classList.remove('active'));
    }
// Modals
    const listModal = document.getElementById('modal-listing');
    const proofModal = document.getElementById('modal-proof');
    
    document.getElementById('btn-new-listing').addEventListener('click', () => listModal.classList.add('open'));
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            listModal.classList.remove('open');
            proofModal.classList.remove('open');
        });
    });

    // Forms
    document.getElementById('form-listing').addEventListener('submit', (e) => {
        e.preventDefault();
        const crop = document.getElementById('inp-crop').value;
        const qty = document.getElementById('inp-qty').value;
        const price = document.getElementById('inp-price').value;
        createListing(crop, qty, price, null);
        listModal.classList.remove('open');
        e.target.reset();
    });

    document.getElementById('form-proof').addEventListener('submit', (e) => {
        e.preventDefault();
        const orderId = document.getElementById('proof-order-id').value;
        const fileInput = document.getElementById('inp-proof-file');
        const useGeo = document.getElementById('inp-geo').checked;

        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                const imgData = evt.target.result;
                
                if (useGeo && navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            confirmDelivery(orderId, imgData, pos.coords.latitude, pos.coords.longitude);
                            proofModal.classList.remove('open');
                        },
                        (err) => {
                            alert('Geolocation failed. Submitting without location.');
                            confirmDelivery(orderId, imgData, null, null);
                            proofModal.classList.remove('open');
                        }
                    );
                } else {
                    confirmDelivery(orderId, imgData, null, null);
                    proofModal.classList.remove('open');
                }
            };
            reader.readAsDataURL(fileInput.files[0]);
        }
    });

    // Assistant
    const assistant = document.getElementById('assistant');
    document.getElementById('assistant-toggle').addEventListener('click', () => {
        assistant.classList.toggle('closed');
    });

    document.querySelectorAll('.assist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const query = e.target.getAttribute('data-query');
            handleAssistant(query);
        });
    });

    // Export CSV
    document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
}

// --- Global Handlers (attached to window for inline onclick) ---

window.handleSimulateSell = function(id) {
    if(confirm('Simulate a buyer purchasing this listing?')) {
        simulateSell(id);
    }
};

window.openProofModal = function(id) {
    document.getElementById('proof-order-id').value = id;
    document.getElementById('modal-proof').classList.add('open');
};

window.handleManualRelease = function(id) {
    manualRelease(id);
};

// --- Utilities ---

function handleAssistant(type) {
    const respBox = document.getElementById('assist-response');
    let text = "";
    
    switch(type) {
        case 'list': text = "Click '+ New Listing', select crop, qty, and price. Add a photo for better visibility."; break;
        case 'escrow': text = "Money is locked securely when an order is placed. It is released to you instantly after you confirm delivery."; break;
        case 'confirm': text = "Click 'Confirm Delivery' on a locked order. Take a photo and allow location access for proof."; break;
        case 'mandi': text = "Showing current heatmap based on Vadodara APMC data."; break;
    }

    respBox.style.display = 'block';
    respBox.textContent = text;

    // Web Speech API
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }
}

function exportCSV() {
    let csv = "ID,Commodity,Value,Status\n";
    state.orders.forEach(o => {
        csv += ${o.id},${o.crop},${o.val},${o.escrowStatus}\n;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agri_orders.csv';
    a.click();
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
      const commodity = it.commodity || '—';
      const type = it.variety || '—';
      // Prices are in rupees per quintal (100kg)
      const minPrice = it.modal_price || '';
      const maxPrice = it.max_price || '';
      const market = it.market || it.district || '—';
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

  function escapeHtml(s) {
    if (!s && s !== 0) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
      // Skip mock data since we have real API endpoint
      // Fetch from Indian Government's agricultural API
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
      setMsg(Loaded ${items.length} items from API.);
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