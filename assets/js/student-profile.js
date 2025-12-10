// Default Data (in case nothing is saved)
const defaultProfile = {
    name: "Student Nou",
    role: "Student",
    email: "student@email.com",
    phone: "07xx xxx xxx",
    location: "București",
    university: "Universitatea Politehnica",
    bio: "Salut! Sunt un student muncitor și caut oportunități part-time.",
    avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
};

// Load Profile on Page Load
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();

    // Setup Form Submission
    const form = document.getElementById('profileForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfile();
    });

    // Close modal when clicking outside
    const modalOverlay = document.getElementById('editModal');
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeEditModal();
        }
    });
});

function loadProfile() {
    let profile = JSON.parse(localStorage.getItem('userProfile'));
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Initialize or Update Profile Logic
    if (currentUser) {
        let shouldSave = false;

        // If no profile exists, create one based on currentUser
        if (!profile) {
            profile = {
                name: currentUser.name || defaultProfile.name,
                role: defaultProfile.role,
                email: currentUser.email || defaultProfile.email,
                phone: defaultProfile.phone,
                location: defaultProfile.location,
                university: defaultProfile.university,
                bio: defaultProfile.bio,
                avatar: defaultProfile.avatar
            };
            shouldSave = true;
        } 
        // If profile exists but still has default "dummy" data, overwrite with currentUser data
        else {
            if (profile.name === defaultProfile.name && currentUser.name) {
                profile.name = currentUser.name;
                shouldSave = true;
            }
            if (profile.email === defaultProfile.email && currentUser.email) {
                profile.email = currentUser.email;
                shouldSave = true;
            }
        }

        if (shouldSave) {
            localStorage.setItem('userProfile', JSON.stringify(profile));
        }
    } else if (!profile) {
        // Fallback if no user is logged in and no profile exists
        profile = defaultProfile;
    }

    // Populate UI
    document.getElementById('p-name').textContent = profile.name;
    document.getElementById('p-role').textContent = profile.role;
    document.getElementById('p-bio').textContent = profile.bio;
    document.getElementById('p-email').textContent = profile.email;
    document.getElementById('p-phone').textContent = profile.phone;
    document.getElementById('p-location').textContent = profile.location;
    document.getElementById('p-university').textContent = profile.university;
    
    // Optional: Avatar logic could be extended here
}

function openEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.add('active');

    // Fill form with current data
    const storedProfile = JSON.parse(localStorage.getItem('userProfile')) || defaultProfile;
    
    document.getElementById('in-name').value = storedProfile.name;
    document.getElementById('in-role').value = storedProfile.role;
    document.getElementById('in-email').value = storedProfile.email;
    document.getElementById('in-phone').value = storedProfile.phone;
    document.getElementById('in-location').value = storedProfile.location;
    document.getElementById('in-university').value = storedProfile.university;
    document.getElementById('in-bio').value = storedProfile.bio;
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('active');
}

function saveProfile() {
    // Get values from form
    const newProfile = {
        name: document.getElementById('in-name').value,
        role: document.getElementById('in-role').value,
        email: document.getElementById('in-email').value,
        phone: document.getElementById('in-phone').value,
        location: document.getElementById('in-location').value,
        university: document.getElementById('in-university').value,
        bio: document.getElementById('in-bio').value,
        avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png" // Keep default avatar for now
    };

    // Save to LocalStorage
    localStorage.setItem('userProfile', JSON.stringify(newProfile));

    // Refresh UI and Close
    loadProfile();
    closeEditModal();
    alert("Profilul a fost actualizat cu succes!");
}
