document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const isEmployerCheckbox = document.getElementById('isEmployer');
    const codeContainer = document.getElementById('codeContainer');
    const logoutLink = document.querySelector('.side-nav a[href="login.html"]'); // Assuming logout link has this href

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }

    // Toggle Employer Code Input
    if (isEmployerCheckbox && codeContainer) {
        isEmployerCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                codeContainer.style.display = 'block';
            } else {
                codeContainer.style.display = 'none';
                document.getElementById('accessCode').value = ''; // Clear code if unchecked
            }
        });
    }

    // Check auth status on page load (if not login/register page)
    // This will be called by script.js or directly if needed
    checkAuthStatus();
});

async function checkAuthStatus() {
    try {
        const res = await fetch('http://localhost:3000/api/auth/status');
        const data = await res.json();

        if (data.isAuthenticated) {
            // User is authenticated, update UI if necessary
            // For example, hide login/register links, show profile
            console.log('User authenticated:', data.user);
            // Example: Update the logout link to display "Logout" properly
            const logoutLink = document.querySelector('.side-nav a[href="login.html"]');
            if (logoutLink) {
                logoutLink.textContent = 'Logout';
                logoutLink.removeEventListener('click', handleSidebarLinkClick); // Remove old handler
                logoutLink.addEventListener('click', handleLogout); // Add new handler
            }

            // Store user role in session storage for current browser session
            sessionStorage.setItem('userRole', data.user.role);
            sessionStorage.setItem('currentUserId', data.user.id);
            sessionStorage.setItem('isAuthenticated', 'true');
        } else {
            // User not authenticated, ensure UI reflects this
            console.log('User not authenticated.');
            sessionStorage.clear(); // Clear any old session storage data
        }
    } catch (error) {
        console.error('Failed to check authentication status:', error);
        sessionStorage.clear();
    }
}


async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();
    
    let accessCode = null;
    const accessCodeInput = document.getElementById('accessCode');
    if (accessCodeInput && accessCodeInput.value.trim() !== "") {
        accessCode = accessCodeInput.value.trim();
    }

    try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, accessCode })
        });
        const data = await res.json();

        if (data.success) {
            alert('Cont creat cu succes! Te rugăm să te loghezi.');
            window.location.href = 'login.html';
        } else {
            alert(data.message || 'Eroare la înregistrare');
        }
    } catch (error) {
        console.error(error);
        alert('Eroare de server');
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('loginError');

    try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        // With httpOnly cookies, the token is handled by the browser
        // Backend's googleCallback function handles redirect based on Passport session
        // For email/password login, we need to manually redirect after backend sets cookie
        if (res.ok) { // Check for successful HTTP status (2xx)
            // Backend should have set the session cookie already
            // Now, we need to determine where to redirect the user
            const authStatusRes = await fetch('http://localhost:3000/api/auth/status');
            const authStatusData = await authStatusRes.json();

            if (authStatusData.isAuthenticated) {
                const userRole = authStatusData.user.role;
                if (userRole === 'EMPLOYER') {
                    window.location.href = 'pages/employer/dashboard.html';
                } else {
                    window.location.href = 'pages/student/dashboard.html'; // Or index.html
                }
            } else {
                if (errorMsg) {
                    errorMsg.style.display = 'block';
                    errorMsg.textContent = 'Login reușit, dar nu s-a putut determina rolul. Încearcă din nou.';
                }
            }
        } else {
            if (errorMsg) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = data.message || 'Login failed';
            } else {
                alert(data.message || 'Login failed');
            }
        }
    } catch (error) {
        console.error(error);
        alert('Eroare de server');
    }
}

async function handleLogout(e) {
    e.preventDefault();
    try {
        const res = await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();

        if (data.message === 'Logout successful') {
            sessionStorage.clear(); // Clear any user-related data
            window.location.href = 'index.html'; // Redirect to home or login page
        } else {
            alert(data.message || 'Eroare la delogare.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Eroare de server la delogare.');
    }
}

// Make checkAuthStatus, handleLogin, handleRegister, handleLogout available globally if needed by other scripts
// Or simply ensure they are called where necessary
// For now, they are hooked up to DOM events.