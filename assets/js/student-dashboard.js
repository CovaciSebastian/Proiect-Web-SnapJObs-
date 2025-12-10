// Student Dashboard Logic

// Default User Location (Bucharest Center)
const userLat = 44.4268;
const userLng = 26.1025;

let map;
let markers = [];
let allJobs = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadMyApplications(); // Load applications first
    loadJobs();
    setupFilters();
});

async function loadMyApplications() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch('http://localhost:3000/api/applications/my-applications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            const jobIds = data.map(app => app.job_id);
            localStorage.setItem('myApplications', JSON.stringify(jobIds));
            updateApplicationCount();
        }
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

// ... (initMap, loadJobs, renderJobs remain) ...

// Apply Logic
async function applyToJob(jobId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Trebuie să te loghezi pentru a aplica!');
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/api/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ jobId })
        });
        const data = await res.json();

        if (data.success) {
            alert('Ai aplicat cu succes!');
            
            // Update local storage for UI consistency
            let applications = JSON.parse(localStorage.getItem('myApplications')) || [];
            if (!applications.includes(jobId)) {
                applications.push(jobId);
                localStorage.setItem('myApplications', JSON.stringify(applications));
            }
            updateApplicationCount();

            // Update UI immediately
            const btns = document.querySelectorAll(`button[onclick="applyToJob(${jobId})"], #applyBtn_${jobId}`);
            btns.forEach(btn => {
                btn.innerText = "Ai aplicat";
                btn.classList.add('applied');
                btn.disabled = true;
            });

        } else {
            alert(data.message || 'Eroare la aplicare');
        }
    } catch (error) {
        console.error(error);
        alert('Eroare de server');
    }
}

// Helper: Haversine Distance (km)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}