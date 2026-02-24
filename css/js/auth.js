// js/auth.js - Enhanced Authentication System

class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }

    init() {
        this.updateUI();
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.register();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Password toggle
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const input = e.target.closest('.form-group').querySelector('input');
                if (input.type === 'password') {
                    input.type = 'text';
                    e.target.classList.remove('fa-eye');
                    e.target.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    e.target.classList.remove('fa-eye-slash');
                    e.target.classList.add('fa-eye');
                }
            });
        });
    }

    login() {
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        const remember = document.getElementById('remember')?.checked;

        if (!email || !password) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        // Simulate API call
        setTimeout(() => {
            const user = this.users.find(u => u.email === email && u.password === password);
            
            if (user) {
                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                if (remember) {
                    localStorage.setItem('rememberedUser', email);
                }
                
                this.showToast('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.showToast('Invalid email or password', 'error');
            }
        }, 1000);
    }

    register() {
        const name = document.getElementById('name')?.value;
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;

        if (!name || !email || !password || !confirmPassword) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showToast('Password must be at least 6 characters', 'error');
            return;
        }

        // Check if user exists
        if (this.users.some(u => u.email === email)) {
            this.showToast('Email already registered', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            tier: 'Silver',
            miles: 0,
            bookings: [],
            preferences: {
                meal: 'regular',
                seat: 'any',
                notifications: true
            }
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));

        this.showToast('Registration successful! Please login.', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showToast('Logged out successfully', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    checkAuth() {
        const protectedPages = ['dashboard.html', 'profile.html', 'bookings.html'];
        const currentPage = window.location.pathname.split('/').pop();

        if (protectedPages.includes(currentPage) && !this.currentUser) {
            this.showToast('Please login to access this page', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }

        if (this.currentUser) {
            this.updateUserUI();
        }
    }

    updateUserUI() {
        if (this.currentUser) {
            document.querySelectorAll('.user-name').forEach(el => {
                el.textContent = this.currentUser.name;
            });

            // Update dashboard if on dashboard page
            if (window.location.pathname.includes('dashboard.html')) {
                document.getElementById('userName').textContent = this.currentUser.name;
                document.getElementById('tierStatus').textContent = this.currentUser.tier;
                document.getElementById('milesCount').textContent = this.currentUser.miles.toLocaleString();
            }
        }
    }

    updateUI() {
        const userMenu = document.querySelector('.user-menu');
        const loginBtn = document.querySelector('.login-btn');

        if (this.currentUser) {
            if (userMenu) {
                userMenu.innerHTML = `
                    <button class="user-menu-btn">
                        <i class="fas fa-user-circle"></i>
                        <span class="user-name">${this.currentUser.name}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="user-dropdown">
                        <a href="dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                        <a href="profile.html"><i class="fas fa-user"></i> Profile</a>
                        <a href="bookings.html"><i class="fas fa-ticket-alt"></i> My Bookings</a>
                        <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    </div>
                `;
                this.setupUserMenu();
            }
            if (loginBtn) loginBtn.style.display = 'none';
        } else {
            if (userMenu) userMenu.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'inline-block';
        }
    }

    setupUserMenu() {
        const userMenuBtn = document.querySelector('.user-menu-btn');
        const userDropdown = document.querySelector('.user-dropdown');

        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!userMenuBtn.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
            </div>
            <div class="toast-message">${message}</div>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;

        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);

        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize auth system
const auth = new AuthSystem();
