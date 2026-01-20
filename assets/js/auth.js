const API_BASE_URL = '';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const isEmployerCheckbox = document.getElementById('isEmployer');
    const codeContainer = document.getElementById('codeContainer');
    const logoutLink = document.querySelector('.side-nav a[href*="login.html"]'); 

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
                document.getElementById('accessCode').value = ''; 
            }
        });
    }

    checkAuthStatus();
});

async function checkAuthStatus() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/status`, { credentials: 'include' });
        const data = await res.json();

        if (data.isAuthenticated) {
            console.log('User authenticated:', data.user);
            
            // Hide header login/register buttons
            const authButtons = document.querySelector('.auth-buttons');
            if (authButtons) {
                authButtons.style.display = 'none';
            }

            // Inject Profile Link if not present
            const headerActions = document.querySelector('.header-actions');
            if (headerActions && !document.querySelector('.profile-link-header')) {
                const profileBtn = document.createElement('a');
                
                // Determine correct path
                let profileHref = 'pages/student/profile.html';
                const path = window.location.pathname;
                if (path.includes('/pages/student/')) {
                    profileHref = 'profile.html';
                } else if (path.includes('/pages/employer/')) {
                    profileHref = '../student/profile.html';
                }
                
                profileBtn.href = profileHref;
                profileBtn.className = 'auth-btn btn-login profile-link-header';
                profileBtn.style.backgroundColor = '#29b6f6';
                profileBtn.style.color = '#000';
                profileBtn.style.marginLeft = '10px';
                profileBtn.style.fontWeight = 'bold';
                profileBtn.textContent = 'Profilul meu';
                
                // Insert before applications icon
                const appIcon = headerActions.querySelector('.icon-applications');
                if (appIcon) {
                    headerActions.insertBefore(profileBtn, appIcon);
                } else {
                    headerActions.appendChild(profileBtn);
                }
            }

            // Update Sidebar Logout Link
            // Fix: Use substring match here too
            const logoutLink = document.querySelector('.side-nav a[href*="login.html"]');
            if (logoutLink) {
                logoutLink.textContent = 'Logout';
                // Remove href to prevent navigation before logout logic
                logoutLink.setAttribute('href', '#');
                logoutLink.removeEventListener('click', handleSidebarLinkClick); 
                logoutLink.addEventListener('click', handleLogout); 
            }

            // Update Application Count (Bag Icon)
            if (data.user.role === 'STUDENT' || data.user.role === 'student') {
                try {
                    const appRes = await fetch(`${API_BASE_URL}/api/applications/my`, { credentials: 'include' });
                    if (appRes.ok) {
                        const myApps = await appRes.json();
                        const count = myApps.length;
                        
                        // Update UI
                        const countSpan = document.getElementById('applicationCount');
                        if (countSpan) {
                            countSpan.innerText = count;
                            countSpan.style.display = count > 0 ? 'flex' : 'none'; // Optional: hide if 0? usually we show 0.
                            // Revert display logic: keep it visible as block/inline-block
                            countSpan.style.display = ''; 
                        }

                        // Sync localStorage for other scripts (dashboard/search)
                        const jobIds = myApps.map(app => app.job_id);
                        localStorage.setItem('myApplications', JSON.stringify(jobIds));
                    }
                } catch (err) {
                    console.error("Failed to fetch application count", err);
                }
            }

            sessionStorage.setItem('userRole', data.user.role);
            sessionStorage.setItem('currentUserId', data.user.id);
            sessionStorage.setItem('isAuthenticated', 'true');
        } else {
            console.log('User not authenticated.');
            const authButtons = document.querySelector('.auth-buttons');
            if (authButtons) {
                authButtons.style.display = 'block'; // Ensure visible if not logged in
            }
            sessionStorage.clear();
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
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
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
        // Send login request with credentials to establish session
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Important!
        });
        const data = await res.json();

        if (res.ok && data.success) {
            const userRole = data.user.role;
            
            if (userRole === 'PENDING') {
                window.location.href = 'pages/select-role.html';
            } else if (userRole === 'EMPLOYER') {
                window.location.href = 'pages/employer/dashboard.html';
            } else {
                window.location.href = 'index.html'; 
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
        const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        const data = await res.json();

        if (data.message === 'Logout successful') {
            sessionStorage.clear(); 
            window.location.href = 'index.html'; 
        } else {
            alert(data.message || 'Eroare la delogare.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Eroare de server la delogare.');
    }
}