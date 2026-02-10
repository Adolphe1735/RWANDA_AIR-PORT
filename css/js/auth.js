// Authentication functionality for Rwanda Air website

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Register link (simulated)
    const registerLink = document.getElementById('registerLink');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Registration functionality would be implemented here. For this demo, please use "demo@rwandair.com" and "password123" to login.');
        });
    }
});

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple validation
    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    // For demo purposes, accept a specific email/password
    // In a real application, this would connect to an authentication API
    if (email === 'demo@rwandair.com' && password === 'password123') {
        // Store user data in localStorage (simulating authentication)
        const userData = {
            email: email,
            name: 'Alex Johnson',
            isAuthenticated: true,
            token: 'demo_token_' + Date.now()
        };
        
        localStorage.setItem('rwandair_user', JSON.stringify(userData));
        
        // Show success message and redirect to dashboard
        showAlert('Login successful! Redirecting to dashboard...', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        // For demo purposes, accept any email with password "password123"
        if (password === 'password123') {
            // Extract name from email for demo
            const name = email.split('@')[0];
            const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
            
            // Store user data in localStorage
            const userData = {
                email: email,
                name: formattedName,
                isAuthenticated: true,
                token: 'demo_token_' + Date.now()
            };
            
            localStorage.setItem('rwandair_user', JSON.stringify(userData));
            
            // Show success message and redirect to dashboard
            showAlert('Login successful! Redirecting to dashboard...', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showAlert('Invalid email or password. For demo, use "demo@rwandair.com" and "password123"', 'error');
        }
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    // Clear user data from localStorage
    localStorage.removeItem('rwandair_user');
    
    // Redirect to home page
    showAlert('Logged out successfully', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Check authentication status
function checkAuthStatus() {
    const userData = localStorage.getItem('rwandair_user');
    
    if (userData) {
        const user = JSON.parse(userData);
        
        // Update user name in dashboard if on dashboard page
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.name;
        }
        
        // If on login page and already logged in, redirect to dashboard
        if (window.location.pathname.includes('login.html') && user.isAuthenticated) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // If on dashboard page and not logged in, redirect to login
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }
}

// Show alert message
function showAlert(message, type) {
    // Remove any existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Style the alert
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    if (type === 'success') {
        alert.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        alert.style.backgroundColor = '#dc3545';
    } else {
        alert.style.backgroundColor = '#17a2b8';
    }
    
    // Add to page
    document.body.appendChild(alert);
    
    // Remove after 3 seconds
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 3000);
    
    // Add CSS animations if not already present
    if (!document.querySelector('#alert-animations')) {
        const style = document.createElement('style');
        style.id = 'alert-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}