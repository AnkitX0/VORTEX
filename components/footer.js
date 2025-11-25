class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .footer {
                    background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
                    box-shadow: 0 -4px 6px rgba(0,0,0,0.05);
                    position: relative;
                    overflow: hidden;
                }
                .footer::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 5px;
                    background: linear-gradient(to right, #4CAF50, #8BC34A);
                    animation: gradientFlow 3s ease infinite;
                    background-size: 200% 100%;
                }
                @keyframes gradientFlow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .footer-link {
                    transition: all 0.3s ease;
                    display: inline-block;
                    position: relative;
                    padding-bottom: 2px;
                }
                .footer-link:hover {
                    color: #4CAF50;
                    transform: translateX(5px);
                }
                .footer-link::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: #4CAF50;
                    transition: width 0.3s ease;
                }
                .footer-link:hover::after {
                    width: 100%;
                }
.border-t {
                    border-top: 1px solid rgba(0,0,0,0.1);
                }
</style>
            <footer class="footer py-8 mt-12">
                <div class="container mx-auto px-6">
                    <div class="flex flex-col md:flex-row justify-between items-center">
<div class="grid grid-cols-2 gap-8 md:grid-cols-3">
                            <div>
                                <h3 class="text-gray-800 font-semibold mb-4">Links</h3>
                                <ul class="space-y-2">
                                    <li><a href="index.html" class="footer-link text-gray-600">Home</a></li>
                                    <li><a href="about.html" class="footer-link text-gray-600">About</a></li>
                                    <li><a href="contact.html" class="footer-link text-gray-600">Contact</a></li>
                                    <li><a href="signup.html" class="footer-link text-gray-600">Sign Up</a></li>
</ul>
                            </div>
                            <div>
                                <h3 class="text-gray-800 font-semibold mb-4">Legal</h3>
                                <ul class="space-y-2">
                                    <li><a href="#" class="footer-link text-gray-600">Privacy Policy</a></li>
                                    <li><a href="#" class="footer-link text-gray-600">Terms</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 class="text-gray-800 font-semibold mb-2">Connect</h3>
                                <div class="flex gap-2">
                                    <a href="#" class="text-gray-500 hover:text-primary transition-colors">
                                        <i data-feather="facebook"></i>
                                    </a>
                                    <a href="#" class="text-gray-500 hover:text-primary transition-colors">
                                        <i data-feather="twitter"></i>
                                    </a>
                                    <a href="#" class="text-gray-500 hover:text-primary transition-colors">
                                        <i data-feather="instagram"></i>
                                    </a>
                                </div>
</div>
                        </div>
                    </div>
                    <div class="border-t border-gray-200 mt-8 pt-8 text-center relative">
                        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4">
                            <div class="w-12 h-12 mx-auto bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                                <i data-feather="heart" class="text-primary"></i>
                            </div>
                        </div>
                        <p class="text-gray-500">&copy; ${new Date().getFullYear()} Agri-Trust. All rights reserved.</p>
<p class="text-sm text-gray-400 mt-1">Farm-to-table marketplace</p>
                    </div>
</div>
            </footer>
        `;
    }
}
customElements.define('custom-footer', CustomFooter);