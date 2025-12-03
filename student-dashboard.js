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
    loadJobs();
    setupFilters();
    updateApplicationCount();
});

function initMap() {
    map = L.map('map').setView([userLat, userLng], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Add User Marker
    L.circle([userLat, userLng], {
        color: '#29b6f6',
        fillColor: '#29b6f6',
        fillOpacity: 0.2,
        radius: 5000 // Default visual radius
    }).addTo(map);
}

async function loadJobs() {
    try {
        // 1. Fetch Static Jobs
        const response = await fetch('jobs.json');
        const staticJobs = await response.json();

        // 2. Fetch Dynamic Jobs (from Employer Dashboard)
        const storedJobs = JSON.parse(localStorage.getItem('newJobs')) || [];

        // Combine
        allJobs = [...staticJobs, ...storedJobs];

        // Initial Render
        renderJobs(allJobs);

    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

function renderJobs(jobs) {
    const listContainer = document.getElementById('jobsList');
    listContainer.innerHTML = '';

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    if (jobs.length === 0) {
        listContainer.innerHTML = '<p style="color: #888;">Niciun job găsit conform filtrelor.</p>';
        return;
    }

    jobs.forEach(job => {
        // 1. Render Card
        const card = document.createElement('div');
        card.className = 'job-card-list';
        card.innerHTML = `
            <div class="job-card-content">
                <h3 style="color: #fff; margin: 0 0 5px 0;">${job.title}</h3>
                <div style="color: #29b6f6; font-size: 0.9em; margin-bottom: 5px;">${job.company}</div>
                <div style="color: #ccc; font-size: 0.9em; margin-bottom: 5px;">
                    📍 ${job.location} • 📅 ${job.date || 'Flexibil'}
                </div>
                <div style="color: #fff; font-weight: bold;">${job.salary}</div>
                <p style="color: #aaa; font-size: 0.85em; margin-top: 8px;">${job.description}</p>
            </div>
            <div class="job-card-actions">
                <span class="job-type-badge" style="background: #333; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; margin-bottom: 10px; border: 1px solid #29b6f6;">
                    ${job.type.toUpperCase()}
                </span>
                <button onclick="applyToJob(${job.id})" style="background: #29b6f6; color: #000; border: none; padding: 8px 15px; cursor: pointer; font-weight: bold; border-radius: 4px;">
                    Aplică Acum
                </button>
            </div>
        `;
        listContainer.appendChild(card);

        // 2. Render Map Marker (if coords exist)
        if (job.lat && job.lng) {
            const marker = L.marker([job.lat, job.lng])
                .bindPopup(`<b>${job.title}</b><br>${job.salary}`)
                .addTo(map);
            markers.push(marker);
        }
    });
}

// Filter Logic
function setupFilters() {
    const typeSelect = document.getElementById('typeFilter');
    const dateInput = document.getElementById('dateFilter');
    const radiusInput = document.getElementById('radiusFilter');
    const radiusValue = document.getElementById('radiusValue');

    const applyFilters = () => {
        const type = typeSelect.value;
        const date = dateInput.value;
        const radius = parseInt(radiusInput.value);

        radiusValue.textContent = `${radius} km`;

        const filtered = allJobs.filter(job => {
            // Type Filter
            if (type !== 'all' && job.type !== type) return false;

            // Date Filter (Exact match for now, could be >=)
            if (date && job.date && job.date !== date) return false;

            // Radius Filter
            if (job.lat && job.lng) {
                const dist = getDistance(userLat, userLng, job.lat, job.lng);
                if (dist > radius) return false;
            }

            return true;
        });

        renderJobs(filtered);
    };

    typeSelect.addEventListener('change', applyFilters);
    dateInput.addEventListener('change', applyFilters);
    radiusInput.addEventListener('input', applyFilters);
}

function resetFilters() {
    document.getElementById('typeFilter').value = 'all';
    document.getElementById('dateFilter').value = '';
    document.getElementById('radiusFilter').value = 50;
    renderJobs(allJobs);
}

// Apply Logic
function applyToJob(jobId) {
    let applications = JSON.parse(localStorage.getItem('myApplications')) || [];
    
    if (!applications.includes(jobId)) {
        applications.push(jobId);
        localStorage.setItem('myApplications', JSON.stringify(applications));
        alert('Ai aplicat cu succes!');
        updateApplicationCount();
    } else {
        alert('Ai aplicat deja la acest job.');
    }
}

function updateApplicationCount() {
    const applications = JSON.parse(localStorage.getItem('myApplications')) || [];
    const badge = document.getElementById('applicationCount');
    if (badge) {
        badge.innerText = applications.length;
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