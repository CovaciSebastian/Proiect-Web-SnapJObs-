const API_BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();

    const form = document.getElementById('profileForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfile();
    });

    const modalOverlay = document.getElementById('editModal');
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeEditModal();
        }
    });
});

async function loadProfile() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/status`, { credentials: 'include' });
        const data = await res.json();

        if (data.isAuthenticated) {
            const user = data.user;
            
            // Store user data for modal population
            window.currentUserProfile = user;

            document.getElementById('p-name').textContent = user.name || '-';
            document.getElementById('p-role').textContent = user.role || 'Student'; // System role
            document.getElementById('p-email').textContent = user.email || '-';
            document.getElementById('p-phone').textContent = user.phone || '-';
            document.getElementById('p-location').textContent = user.city || '-';
            document.getElementById('p-university').textContent = user.university || '-';
            document.getElementById('p-bio').textContent = user.about || 'Adaugă o scurtă descriere...';
            
        } else {
             window.location.href = '../../login.html';
        }
    } catch (e) {
        console.error("Profile load error", e);
    }
}

function openEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.add('active');

    const user = window.currentUserProfile || {};
    
    document.getElementById('in-name').value = user.name || '';
    document.getElementById('in-role').value = user.title || ''; // Map "Titlu" input to title field
    document.getElementById('in-email').value = user.email || '';
    document.getElementById('in-phone').value = user.phone || '';
    document.getElementById('in-location').value = user.city || '';
    document.getElementById('in-university').value = user.university || '';
    document.getElementById('in-bio').value = user.about || '';
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('active');
}

async function saveProfile() {
    const updatedData = {
        name: document.getElementById('in-name').value,
        title: document.getElementById('in-role').value,
        // email: document.getElementById('in-email').value, // Email updates might be restricted? sending anyway
        phone: document.getElementById('in-phone').value,
        city: document.getElementById('in-location').value,
        university: document.getElementById('in-university').value,
        about: document.getElementById('in-bio').value
    };

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(updatedData)
        });
        
        const result = await res.json();

        if (result.success) {
            alert("Profil actualizat!");
            closeEditModal();
            loadProfile(); // Reload to show changes
        } else {
            alert(result.message || "Eroare la actualizare");
        }
    } catch (e) {
        console.error(e);
        alert("Eroare server");
    }
}