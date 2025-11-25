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
    addNotification(`Escrow LOCKED for ${newOrder.id} (₹${orderVal})`);
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
    
    addNotification(`Escrow RELEASED for ${order.id}. ₹${order.val} added to balance.`);
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
        li.innerHTML = `${n.msg} <span class="notif-time">${n.time}</span>`;
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
        div.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        div.style.opacity = 0.6 + (Math.random() * 0.4);
        grid.appendChild(div);
    }
}

// --- Event Handling ---

function setupEventListeners() {
    // Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    document.querySelector('.hamburger').addEventListener('click', () => sidebar.classList.add('active'));
    document.querySelector('.close-sidebar-btn').addEventListener('click', () => sidebar.classList.remove('active'));

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
        csv += `${o.id},${o.crop},${o.val},${o.escrowStatus}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agri_orders.csv';
    a.click();
}
