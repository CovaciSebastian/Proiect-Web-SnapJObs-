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

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();

    // Get existing users
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if user exists
    const userExists = users.find(u => u.email.toLowerCase() === email);
    if (userExists) {
        alert('Acest email este deja folosit!');
        return;
    }

    // Add new user
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Simulate auto-login or redirect
    alert('Cont creat cu succes! Te rugăm să te loghezi.');
    window.location.href = 'login.html';
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('loginError');

    // Get users
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Find user
    const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

    if (user) {
        // Login Success
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user)); // Save current user data
        
        // Optional: Update profile data if needed based on login
        // const profile = JSON.parse(localStorage.getItem('userProfile')) || {};
        // profile.name = user.name;
        // profile.email = user.email;
        // localStorage.setItem('userProfile', JSON.stringify(profile));

        window.location.href = 'pages/student/dashboard.html';
    } else {
        // Login Failed
        if (errorMsg) {
            errorMsg.style.display = 'block';
        } else {
            alert('Email sau parolă incorectă.');
        }
    }
}
