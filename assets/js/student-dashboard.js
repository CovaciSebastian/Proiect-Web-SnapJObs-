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
    updateApplicationCount(); // Initial update
});

function initMap() {
    // Initialize Leaflet Map
    map = L.map('map').setView([userLat, userLng], 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Add User Location Marker (Blue)
    const userIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
        .bindPopup("<b>Tu ești aici</b>").openPopup();
}

async function loadJobs() {
    try {
        const response = await fetch('http://localhost:3000/api/jobs');
        allJobs = await response.json();
        
        // Check for URL params (e.g. ?type=eveniment)
        const urlParams = new URLSearchParams(window.location.search);
        const typeParam = urlParams.get('type');
        
        if (typeParam) {
            document.getElementById('typeFilter').value = typeParam;
            filterJobs();
        } else {
            renderJobs(allJobs);
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('jobsList').innerHTML = '<p style="color:white; text-align:center;">Nu s-au putut încărca joburile.</p>';
    }
}

function renderJobs(jobsToRender) {
    const listContainer = document.getElementById('jobsList');
    listContainer.innerHTML = ''; // Clear list

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Get applied jobs for button state
    const appliedJobs = JSON.parse(localStorage.getItem('myApplications')) || [];

    if (jobsToRender.length === 0) {
        listContainer.innerHTML = '<p style="color:#aaa; text-align:center;">Nu există joburi conform filtrelor.</p>';
        return;
    }

    // Custom Icon for Jobs (Gold)
    const jobIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // Get current user to check role
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isEmployer = currentUser && currentUser.role === 'employer';

    jobsToRender.forEach(job => {
        // 1. Render in List
        const hasApplied = appliedJobs.includes(job.id) || appliedJobs.includes(String(job.id));
        
        let btnText = hasApplied ? "Ai aplicat" : "Aplică";
        let btnClass = hasApplied ? "applied" : "";
        let btnDisabled = hasApplied ? "disabled" : "";

        if (isEmployer) {
            btnText = "Nu poți aplica";
            btnClass = "disabled"; // Reuse disabled style or add specific one
            btnDisabled = "disabled"; 
        }

        const card = document.createElement('div');
        card.className = 'job-card-list';
        card.innerHTML = `
            <div class="job-card-content">
                <h3 style="color: #29b6f6; margin: 0 0 5px 0;">
                    <a href="job-detail.html?id=${job.id}" style="text-decoration: none; color: inherit;">${job.title}</a>
                </h3>
                <p style="margin: 0; color: #ccc; font-size: 0.9rem;">
                    <strong>${job.company}</strong> • ${job.location}
                </p>
                <p style="margin: 5px 0 0 0; color: #29b6f6;">${job.salary}</p>
                <span style="font-size: 0.8rem; background: #333; padding: 2px 6px; border-radius: 4px; color: #fff;">${job.type.toUpperCase()}</span>
            </div>
            <div class="job-card-actions">
                <button 
                    id="applyBtn_${job.id}"
                    onclick="applyToJob(${job.id})" 
                    class="auth-btn btn-signup ${btnClass}" 
                    style="padding: 5px 10px; font-size: 0.8rem;" 
                    ${btnDisabled}
                >
                    ${btnText}
                </button>
            </div>
        `;
        listContainer.appendChild(card);

        // 2. Render on Map (if coordinates exist)
        // Use real coords if available, otherwise randomize
        let jLat = job.lat ? parseFloat(job.lat) : null;
        let jLng = job.lng ? parseFloat(job.lng) : null;

        // Fallback if no coords (simulate random spread for demo)
        if (!jLat || !jLng) {
            jLat = userLat + (Math.random() - 0.5) * 0.1;
            jLng = userLng + (Math.random() - 0.5) * 0.1;
        }

        const marker = L.marker([jLat, jLng], { icon: jobIcon })
            .bindPopup(`
                <div class="map-popup-content">
                    <h3 class="map-popup-title">${job.title}</h3>
                    <p class="map-popup-info"><strong>${job.company}</strong></p>
                    <p class="map-popup-info">${job.salary}</p>
                    <a href="job-detail.html?id=${job.id}" style="color: #29b6f6; font-size: 0.9em;">Vezi detalii</a>
                    <button class="map-apply-btn ${btnClass}" onclick="applyToJob(${job.id})" ${btnDisabled}>${btnText}</button>
                </div>
            `);
        
        marker.addTo(map);
        markers.push(marker);
    });
}

function setupFilters() {
    const typeSelect = document.getElementById('typeFilter');
    const dateInput = document.getElementById('dateFilter');
    const radiusInput = document.getElementById('radiusFilter');
    const radiusValue = document.getElementById('radiusValue');
    const resetBtn = document.querySelector('.filter-sidebar button[onclick="resetFilters()"]');

    // Remove onclick attribute from HTML to avoid "resetFilters is not defined" if using module scope
    // But here we are in global scope mostly. 
    // Let's attach event listener to reset button if it doesn't work via onclick
    if (resetBtn) {
        resetBtn.onclick = resetFilters;
    }

    typeSelect.addEventListener('change', filterJobs);
    dateInput.addEventListener('change', filterJobs);
    
    radiusInput.addEventListener('input', (e) => {
        radiusValue.innerText = `${e.target.value} km`;
        filterJobs();
    });
}

function filterJobs() {
    const type = document.getElementById('typeFilter').value;
    const date = document.getElementById('dateFilter').value;
    const radius = parseInt(document.getElementById('radiusFilter').value);

    const filtered = allJobs.filter(job => {
        // Type Filter
        if (type !== 'all' && job.type !== type) return false;

        // Date Filter (Simple string match or date object comparison needed in real app)
        // Assuming job.date is "YYYY-MM-DD" or similar
        if (date && job.date && !job.date.startsWith(date)) return false;

        // Radius Filter (Mock coords logic)
        // In real app use job.lat/lng
        // For now, pass all if radius is max, or filter if we had real coords
        // Let's rely on the mock coords assigned in renderJobs? No, filtering happens before render.
        // We'll skip radius filter for now unless job has coords.
        
        return true;
    });

    renderJobs(filtered);
}

function resetFilters() {
    document.getElementById('typeFilter').value = 'all';
    document.getElementById('dateFilter').value = '';
    document.getElementById('radiusFilter').value = 50;
    document.getElementById('radiusValue').innerText = '50 km';
    filterJobs();
}

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

function updateApplicationCount() {
    const apps = JSON.parse(localStorage.getItem('myApplications')) || [];
    const span = document.getElementById('applicationCount');
    if (span) {
        span.innerText = apps.length;
    }
}

// Apply Logic
async function applyToJob(jobId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Trebuie să te loghezi pentru a aplica!');
        window.location.href = '../../login.html'; // Adjusted path
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

            // Update UI immediately (Buttons in List and Map Popups)
            const btns = document.querySelectorAll(`button[onclick="applyToJob(${jobId})"], #applyBtn_${jobId}, .map-apply-btn[onclick="applyToJob(${jobId})"]`);
            btns.forEach(btn => {
                btn.innerText = "Ai aplicat";
                btn.classList.add('applied');
                btn.disabled = true;
                // For map button specifically which might need style adjustments
                if(btn.classList.contains('map-apply-btn')) {
                     btn.style.backgroundColor = '#0e7490';
                     btn.style.cursor = 'default';
                }
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
