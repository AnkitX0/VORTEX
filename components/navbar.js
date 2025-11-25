class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .navbar {
                    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    backdrop-filter: blur(8px);
                    border-bottom: 1px solid rgba(255,255,255,0.2);
                    transition: all 0.3s ease;
                }
                .navbar:hover {
                    box-shadow: 0 8px 15px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                }
                .nav-link {
                    transition: all 0.3s ease;
                    text-decoration: none !important;
                    position: relative;
                    overflow: hidden;
                }
                .nav-link::before {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(to right, #4CAF50, #8BC34A);
                    transform: scaleX(0);
                    transform-origin: right;
                    transition: transform 0.3s ease;
                }
                .nav-link:hover::before {
                    transform: scaleX(1);
                    transform-origin: left;
                }
.logo-text {
                    font-weight: 800;
                    font-size: 1.75rem;
                    letter-spacing: 1.5px;
                    background: linear-gradient(to right, #4CAF50, #8BC34A);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    position: relative;
                }
                .logo-text::after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 0;
                    width: 0;
                    height: 3px;
                    background: linear-gradient(to right, #4CAF50, #8BC34A);
                    transition: width 0.3s ease;
                }
                .logo-text:hover::after {
                    width: 100%;
                }
.logo-text:hover {
                    transform: scale(1.05);
                }
                #mobile-menu-button {
                    transition: all 0.3s ease;
                }
                #mobile-menu-button:hover {
                    transform: rotate(90deg);
                    color: #4CAF50;
                }
</style>
            <nav class="navbar px-6 py-4">
                <div class="container mx-auto flex justify-between items-center">
                    <a href="index.html" class="flex items-center space-x-2">
                    <span class="logo-text text-2xl font-bold">Agri-Trust</span>
</a>
<div class="hidden md:flex space-x-4">
                        <a href="index.html" class="nav-link px-4 py-2 rounded-lg bg-primary bg-opacity-10 text-primary font-medium hover:bg-opacity-20 transition-all">Home</a>
                        <a href="about.html" class="nav-link px-4 py-2 rounded-lg bg-primary bg-opacity-10 text-primary font-medium hover:bg-opacity-20 transition-all">About</a>
                        <a href="contact.html" class="nav-link px-4 py-2 rounded-lg bg-primary bg-opacity-10 text-primary font-medium hover:bg-opacity-20 transition-all">Contact</a>
                        <a href="signup.html" class="nav-link px-4 py-2 rounded-lg bg-primary bg-opacity-10 text-primary font-medium hover:bg-opacity-20 transition-all">Sign Up</a>
</div>
<div class="md:hidden">
                        <button id="mobile-menu-button">
                            <i data-feather="menu"></i>
                        </button>
                    </div>
                </div>
            </nav>
        `;
    }
}
customElements.define('custom-navbar', CustomNavbar);