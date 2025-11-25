
        // Highlight active nav link based on current page
        document.addEventListener('DOMContentLoaded', function() {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            document.querySelectorAll('.nav-link').forEach(link => {
                const linkHref = link.getAttribute('href');
                if (linkHref === currentPage || 
                    (currentPage === 'index.html' && linkHref === '#dashboard')) {
                    link.classList.add('bg-emerald-600', 'text-white');
                    link.classList.remove('hover:bg-slate-800', 'hover:text-white');
                } else {
                    link.classList.remove('bg-emerald-600', 'text-white');
                    link.classList.add('hover:bg-slate-800', 'hover:text-white');
                }
            });

            // Initialize all buttons
            initButtons();
        });

        function initButtons() {
            // Add user button
            document.querySelectorAll('[onclick="addUser()"]').forEach(btn => {
                btn.addEventListener('click', addUser);
            });

            // View buttons in listings
            document.querySelectorAll('[onclick="viewListing()"]').forEach(btn => {
                btn.addEventListener('click', viewListing);
            });

            // Order action buttons
            document.querySelectorAll('[onclick="viewOrderDetails()"]').forEach(btn => {
                btn.addEventListener('click', viewOrderDetails);
            });

            // Dispute resolution buttons
            document.querySelectorAll('[onclick="resolveDispute()"]').forEach(btn => {
                btn.addEventListener('click', resolveDispute);
            });

            // Export buttons
            document.querySelectorAll('[onclick="exportData()"]').forEach(btn => {
                btn.addEventListener('click', exportData);
            });

            // Filter buttons
            document.querySelectorAll('[onclick="showFilters()"]').forEach(btn => {
                btn.addEventListener('click', showFilters);
            });

            // Notification bell
            document.querySelectorAll('[onclick="showNotifications()"]').forEach(btn => {
                btn.addEventListener('click', showNotifications);
            });

            // Sidebar toggle
            document.querySelectorAll('[onclick="toggleSidebar()"]').forEach(btn => {
                btn.addEventListener('click', toggleSidebar);
            });
        }

        // Button functions
        function addUser() {
            alert('Add user form will open here');
        }

        function viewListing() {
            alert('Listing details modal will open here');
        }

        function viewOrderDetails() {
            alert('Order details will be shown in a modal');
        }

        function resolveDispute() {
            alert('Dispute resolution workflow will start');
        }

        function exportData() {
            alert('Data export will begin');
        }

        function showFilters() {
            alert('Filter panel will appear');
        }

        function showNotifications() {
            alert('Notifications panel will appear');
        }

        function toggleSidebar() {
            document.querySelector('aside').classList.toggle('hidden');
        }
// Chart initialization
function initCharts() {
    const ctx = document.getElementById('volumeChart')?.getContext('2d');
    if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 150);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Orders',
                    data: [45, 52, 38, 65, 72, 48, 55],
                    borderColor: '#10b981',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9ca3af' } },
                    y: { display: false }
                }
            }
        });
    }
}

function releaseOrder(button) {
    if (confirm("Are you sure you want to manually release funds from Escrow? This action cannot be undone.")) {
        const row = button.closest('tr');
        const statusCell = row.cells[3];
        const actionCell = row.cells[4];

        statusCell.innerHTML = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 animate-pulse"><i class="fa-solid fa-check mr-1.5 text-[10px]"></i> Released</span>`;
        setTimeout(() => statusCell.querySelector('span').classList.remove('animate-pulse'), 1000);
        actionCell.innerHTML = `<button onclick="viewOrderDetails()" class="text-gray-400 hover:text-emerald-600"><i class="fa-solid fa-file-invoice"></i></button>`;
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    initCharts();
    initButtons();
});
