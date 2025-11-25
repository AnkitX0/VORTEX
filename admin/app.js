
        // Sidebar Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);

                // Update active link
                document.querySelectorAll('.nav-link').forEach(l => {
                    l.classList.remove('bg-emerald-600', 'text-white');
                    l.classList.add('hover:bg-slate-800', 'hover:text-white');
                });
                this.classList.add('bg-emerald-600', 'text-white');
                this.classList.remove('hover:bg-slate-800');

                // Show section
                document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');

                // Update breadcrumb
                const name = this.querySelector('span').textContent.trim();
                document.getElementById('breadcrumb').textContent = `/ ${name}`;
            });
        });

        // Your original Chart + Manual Release
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

        function releaseOrder(button) {
            if (confirm("Are you sure you want to manually release funds from Escrow? This action cannot be undone.")) {
                const row = button.closest('tr');
                const statusCell = row.cells[3];
                const actionCell = row.cells[4];

                statusCell.innerHTML = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 animate-pulse"><i class="fa-solid fa-check mr-1.5 text-[10px]"></i> Released</span>`;
                setTimeout(() => statusCell.querySelector('span').classList.remove('animate-pulse'), 1000);
                actionCell.innerHTML = `<button class="text-gray-400 hover:text-emerald-600"><i class="fa-solid fa-file-invoice"></i></button>`;
            }
        }
