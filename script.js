document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const farmerTab = document.getElementById('farmer-tab');
    const buyerTab = document.getElementById('buyer-tab');
    const adminTab = document.getElementById('admin-tab');
    const farmerForm = document.getElementById('farmer-form');
    const buyerForm = document.getElementById('buyer-form');
    const adminForm = document.getElementById('admin-form');

    farmerTab.addEventListener('click', () => {
        farmerForm.classList.remove('hidden');
        buyerForm.classList.add('hidden');
        adminForm.classList.add('hidden');
        farmerTab.classList.add('tab-active');
        buyerTab.classList.remove('tab-active');
        adminTab.classList.remove('tab-active');
    });

    buyerTab.addEventListener('click', () => {
        farmerForm.classList.add('hidden');
        buyerForm.classList.remove('hidden');
        adminForm.classList.add('hidden');
        farmerTab.classList.remove('tab-active');
        buyerTab.classList.add('tab-active');
        adminTab.classList.remove('tab-active');
    });

    adminTab.addEventListener('click', () => {
        farmerForm.classList.add('hidden');
        buyerForm.classList.add('hidden');
        adminForm.classList.remove('hidden');
        farmerTab.classList.remove('tab-active');
        buyerTab.classList.remove('tab-active');
        adminTab.classList.add('tab-active');
    });

    // Initialize with farmer tab active
    farmerTab.classList.add('tab-active');

    // Form validation and submission
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your form validation and submission logic here
            alert('Login functionality will be implemented soon!');
        });
    });
});