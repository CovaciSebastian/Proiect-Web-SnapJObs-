document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();

    try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
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

        if (data.success) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('token', data.token); // Store JWT
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            
            if (data.user.role === 'employer') {
                window.location.href = 'pages/employer/dashboard.html';
            } else {
                window.location.href = 'student-jobs.html';
            }
        } else {
            if (errorMsg) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = data.message;
            } else {
                alert(data.message || 'Login failed');
            }
        }
    } catch (error) {
        console.error(error);
        alert('Server error');
    }
}