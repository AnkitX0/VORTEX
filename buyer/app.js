// app.js

const DEMO_USER_NAME = "DemoBuyer";
const STORAGE_KEY = "agritrust_buyer_v1";

let state = {
    user: { name: DEMO_USER_NAME, balance: 50000 },
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
    initUI();
    renderAll();
});

// --- Data Persistence ---

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderAll(); // Re-render whenever state changes
}

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
}

function seedDemoData() {
    state.listings = [
        { id: 'L101', crop: 'Wheat', seller: 'SellerA', market: 'Kurnool', qty: 1200, price: 22, img: '🌾' },
        { id: 'L102', crop: 'Onion', seller: 'SellerB', market: 'Nashik', qty: 500, price: 14, img: '🧅' },
        { id: 'L103', crop: 'Rice', seller: 'SellerC', market: 'Raipur', qty: 800, price: 35, img: '🍚' }
    ];
    state.orders = [
        { 
            id: 'ORD-1001', 
            listingId: 'L101', 
            seller: 'SellerA', 
            item: 'Wheat', 
            qty: 100, 
            amount: 2200, 
            status: 'Released', 
            date: new Date().toLocaleDateString() 
        }
    ];
    state.notifications = [
        { msg: 'Welcome to Agri-Trust! Your wallet is ready.', time: new Date().toLocaleTimeString() }
    ];
    state.hasSeeded = true;
    saveState();
}

// --- UI Logic ---

function initUI() {
    // Sidebar Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // Update Active State
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            // Show Section
            const viewId = item.getAttribute('data-view');
            sections.forEach(s => s.style.display = 'none');
            const target = document.getElementById(`view-${viewId}`);
            if(target) target.style.display = 'block';
            
            // Update Title
            pageTitle.textContent = item.innerText.trim();
            
            // Mobile: Close sidebar on selection
            document.getElementById('sidebar').classList.remove('active');
        });
    });

    // Mobile Sidebar Toggle
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('active');
    });
    document.querySelector('.close-sidebar-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('active');
    });

    // Modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('modal-checkout').classList.remove('open');
        });
    });

    // Checkout Form
    document.getElementById('form-checkout').addEventListener('submit', handleCheckoutSubmit);

    // Filters
    document.getElementById('filter-crop').addEventListener('change', renderListings);
    document.getElementById('global-search').addEventListener('input', renderListings);

    // Assistant
    const assist = document.getElementById('assistant');
    document.getElementById('assistant-toggle').addEventListener('click', () => assist.classList.toggle('closed'));
    document.querySelectorAll('.assist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleAssistant(e.target.dataset.query));
    });

    // User Name
    document.getElementById('user-name-display').textContent = state.user.name;
}

function renderAll() {
    renderKPIs();
    renderListings();
    renderOrders();
    renderNotifications();
}

function renderKPIs() {
    document.getElementById('kpi-balance').textContent = '₹' + state.user.balance.toLocaleString();
    document.getElementById('wallet-balance-big').textContent = '₹' + state.user.balance.toLocaleString();
    
    // Calculate Active Orders
    const activeCount = state.orders.filter(o => o.status === 'Locked' || o.status === 'Delivered').length;
    document.getElementById('kpi-active-orders').textContent = activeCount;

    // Calculate Locked Escrow
    const lockedAmount = state.orders
        .filter(o => o.status === 'Locked' || o.status === 'Delivered')
        .reduce((sum, o) => sum + o.amount, 0);
    document.getElementById('wallet-escrow').textContent = '₹' + lockedAmount.toLocaleString();
    
    document.getElementById('notif-badge').textContent = state.notifications.length;
}

function renderListings() {
    const container = document.getElementById('listings-container');
    container.innerHTML = '';
    
    const cropFilter = document.getElementById('filter-crop').value;
    const search = document.getElementById('global-search').value.toLowerCase();

    const filtered = state.listings.filter(l => {
        const matchesCrop = cropFilter === 'all' || l.crop === cropFilter;
        const matchesSearch = l.crop.toLowerCase().includes(search) || 
                              l.seller.toLowerCase().includes(search) || 
                              l.market.toLowerCase().includes(search);
        return matchesCrop && matchesSearch && l.qty > 0;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:20px; color:#888;">No listings found matching your criteria.</p>';
        return;
    }

    filtered.forEach(l => {
        const card = document.createElement('div');
        card.className = 'listing-card';
        card.innerHTML = `
            <div class="card-img-top">${l.img}</div>
            <div class="card-body">
                <div class="listing-title">
                    <span class="crop-name">${l.crop}</span>
                    <span class="price-tag">₹${l.price}/kg</span>
                </div>
                <div class="meta-row">
                    <span>📍 ${l.market}</span>
                    <span class="qty-badge">Avail: ${l.qty} kg</span>
                </div>
                <div class="seller-info">Sold by: <strong>${l.seller}</strong></div>
                <div class="card-actions">
                    <button class="btn-buy" onclick="openCheckout('${l.id}')">Buy Now</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderOrders() {
    const tbody = document.getElementById('orders-body');
    tbody.innerHTML = '';

    // Sort new first
    const sortedOrders = [...state.orders].reverse();

    sortedOrders.forEach(o => {
        let statusClass = o.status.toLowerCase();
        if(o.status === 'Dispute') statusClass = 'dispute';
        
        let actions = '';
        if (o.status === 'Locked') {
            actions = `<button class="action-link" onclick="simulateDelivery('${o.id}')" title="Demo Only: Simulate Seller Delivery">🤖 Sim. Delivery</button>`;
        } else if (o.status === 'Delivered') {
            actions = `
                <button class="action-link success" onclick="markReceived('${o.id}')">✔ Mark Received</button>
                <button class="action-link danger" onclick="raiseDispute('${o.id}')">🏳 Raise Dispute</button>
            `;
        } else if (o.status === 'Released') {
            actions = '<span style="color:green; font-size:12px;">Completed</span>';
        } else if (o.status === 'Dispute') {
            actions = '<span style="color:red; font-size:12px;">Under Review</span>';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${o.id}</strong></td>
            <td>${o.seller}</td>
            <td>${o.item} (${o.qty}kg)</td>
            <td>₹${o.amount.toLocaleString()}</td>
            <td><span class="pill ${statusClass}">${o.status}</span></td>
            <td>${actions}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderNotifications() {
    const list = document.getElementById('notif-list-full');
    list.innerHTML = '';
    state.notifications.slice(0, 8).forEach(n => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${n.time}:</strong> ${n.msg}`;
        list.appendChild(li);
    });
}

// --- Logic Functions ---

window.openCheckout = function(listingId) {
    const listing = state.listings.find(l => l.id === listingId);
    if (!listing) return;

    // Populate Modal
    document.getElementById('checkout-listing-id').value = listingId;
    document.getElementById('checkout-summary').innerHTML = `
        <p><strong>Item:</strong> ${listing.crop} from ${listing.seller}</p>
        <p><strong>Price:</strong> ₹${listing.price} / kg</p>
    `;
    
    const qtyInput = document.getElementById('checkout-qty');
    const helper = document.getElementById('checkout-available-helper');
    const totalDisplay = document.getElementById('checkout-total');
    
    qtyInput.value = '';
    qtyInput.max = listing.qty;
    helper.textContent = `Max available: ${listing.qty} kg`;
    totalDisplay.textContent = '₹0';

    // Live Total Calculation
    qtyInput.oninput = () => {
        let val = parseInt(qtyInput.value) || 0;
        if (val > listing.qty) { val = listing.qty; qtyInput.value = val; }
        totalDisplay.textContent = '₹' + (val * listing.price).toLocaleString();
    };

    document.getElementById('modal-checkout').classList.add('open');
};

function handleCheckoutSubmit(e) {
    e.preventDefault();
    const listingId = document.getElementById('checkout-listing-id').value;
    const qty = parseInt(document.getElementById('checkout-qty').value);
    
    const listing = state.listings.find(l => l.id === listingId);
    if (!listing || qty <= 0) return;

    const totalCost = qty * listing.price;

    if (state.user.balance < totalCost) {
        alert("Insufficient wallet balance!");
        return;
    }

    // 1. Deduct Balance (Simulated move to Escrow)
    state.user.balance -= totalCost;

    // 2. Reduce Stock
    listing.qty -= qty;

    // 3. Create Order
    const newOrder = {
        id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        listingId: listing.id,
        seller: listing.seller,
        item: listing.crop,
        qty: qty,
        amount: totalCost,
        status: 'Locked',
        date: new Date().toLocaleDateString()
    };
    state.orders.push(newOrder);

    // 4. Notify
    addNotification(`Escrow LOCKED for ${newOrder.id} (₹${totalCost}). Order placed.`);

    document.getElementById('modal-checkout').classList.remove('open');
    saveState();
    
    // Switch to Orders view
    document.querySelector('[data-view="orders"]').click();
}

window.simulateDelivery = function(orderId) {
    // Helper to move order from Locked -> Delivered without a separate Seller App
    const order = state.orders.find(o => o.id === orderId);
    if (order && order.status === 'Locked') {
        order.status = 'Delivered';
        addNotification(`Seller has marked ${orderId} as DELIVERED.`);
        saveState();
    }
};

window.markReceived = function(orderId) {
    if(!confirm("Confirm you have received the goods? This will release funds to the seller.")) return;

    const order = state.orders.find(o => o.id === orderId);
    if (order && order.status === 'Delivered') {
        order.status = 'Released';
        addNotification(`Escrow RELEASED for ${orderId}. Transaction complete.`);
        saveState();
    }
};

window.raiseDispute = function(orderId) {
    const reason = prompt("Please enter reason for dispute:");
    if (reason) {
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'Dispute';
            addNotification(`Dispute raised for ${orderId}: "${reason}"`);
            saveState();
        }
    }
};

window.exportCSV = function() {
    let csv = "OrderID,Seller,Item,Qty,Amount,Status,Date\n";
    state.orders.forEach(o => {
        csv += `${o.id},${o.seller},${o.item},${o.qty},${o.amount},${o.status},${o.date}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = 'my_orders.csv';
    a.click();
};

function addNotification(msg) {
    state.notifications.unshift({ msg, time: new Date().toLocaleTimeString() });
}
function handleAssistant(query) {
    const box = document.getElementById('assist-response');
    let text = "";
    switch(query) {
        case 'buy': text = "Browse listings, click 'Buy Now', enter quantity, and pay. Funds are held safely in escrow."; break;
        case 'escrow': text = "Escrow protects your money. The seller only gets paid after YOU confirm the delivery is received."; break;
        case 'track': text = "Go to 'My Orders'. Status 'Locked' means pending delivery. 'Delivered' means seller sent it."; break;
        case 'dispute': text = "If goods are damaged, click 'Raise Dispute' on a Delivered order. Admin will intervene."; break;
    }
    box.style.display = 'block';
    box.textContent = text;
    
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(u);
    }
}

// Wallet Functions
window.showAddFundsModal = function() {
    document.getElementById('modal-wallet').classList.add('open');
    document.getElementById('wallet-action-type').value = 'add';
    document.getElementById('wallet-modal-title').textContent = 'Add Funds';
    document.getElementById('wallet-submit-btn').textContent = 'Add Funds';
};

window.showWithdrawModal = function() {
    document.getElementById('modal-wallet').classList.add('open');
    document.getElementById('wallet-action-type').value = 'withdraw';
    document.getElementById('wallet-modal-title').textContent = 'Withdraw Funds';
    document.getElementById('wallet-submit-btn').textContent = 'Withdraw';
};

function handleWalletSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const amount = parseFloat(form.amount.value);
    const action = form.actionType.value;

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    if (action === 'withdraw' && amount > state.user.balance) {
        alert('Insufficient balance for withdrawal');
        return;
    }

    if (action === 'add') {
        state.user.balance += amount;
        addNotification(`Added ₹${amount.toLocaleString()} to wallet`);
    } else {
        state.user.balance -= amount;
        addNotification(`Withdrew ₹${amount.toLocaleString()} from wallet`);
    }

    saveState();
    document.getElementById('modal-wallet').classList.remove('open');
    form.reset();
}

// Initialize wallet modal form
document.addEventListener('DOMContentLoaded', () => {
    const walletForm = document.getElementById('form-wallet');
    if (walletForm) {
        walletForm.addEventListener('submit', handleWalletSubmit);
    }

    document.querySelectorAll('.close-wallet-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('modal-wallet').classList.remove('open');
        });
    });
});
