let selectedRole = null;
const API_BASE_URL = ''; // Adjust if needed

function selectRole(role) {
    selectedRole = role;
    
    // Update UI
    document.querySelectorAll('.role-option').forEach(el => el.classList.remove('selected'));
    
    if (role === 'STUDENT') {
        document.querySelectorAll('.role-option')[0].classList.add('selected');
        document.getElementById('employerCodeInput').classList.add('hidden');
    } else if (role === 'EMPLOYER') {
        document.querySelectorAll('.role-option')[1].classList.add('selected');
        document.getElementById('employerCodeInput').classList.remove('hidden');
    }

    document.getElementById('confirmBtn').disabled = false;
    document.getElementById('errorMsg').style.display = 'none';
}

async function submitRole() {
    if (!selectedRole) return;

    const accessCode = document.getElementById('accessCode').value.trim();
    if (selectedRole === 'EMPLOYER' && !accessCode) {
        showError('Te rugăm să introduci codul de acces pentru angajatori.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/set-role`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Assuming cookie is automatically sent for session
            },
            credentials: 'include', // Important for sending session cookie
            body: JSON.stringify({ role: selectedRole, accessCode })
        });
        
        const data = await res.json();

        if (data.success) {
            if (selectedRole === 'EMPLOYER') {
                window.location.href = 'employer/dashboard.html';
            } else {
                window.location.href = 'student/dashboard.html';
            }
        } else {
            showError(data.message || 'Eroare la actualizarea rolului.');
        }
    } catch (error) {
        console.error(error);
        showError('Eroare de server. Încearcă din nou.');
    }
}

function showError(msg) {
    const el = document.getElementById('errorMsg');
    el.textContent = msg;
    el.style.display = 'block';
}