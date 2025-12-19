// Initialize Map
let map;
let marker;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get Job ID
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('id');

    if (!jobId) {
        alert("ID-ul jobului lipsește.");
        window.location.href = "dashboard.html";
        return;
    }

    // 2. Initialize Map (Default Bucharest, will update later)
    map = L.map('mapPicker').setView([44.4268, 26.1025], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Fix map rendering
    setTimeout(() => { map.invalidateSize(); }, 500);

    // Map Click Logic
    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        updateMapLocation(lat, lng);
    });

    // 3. Fetch Job Data
    try {
        const res = await fetch(`http://localhost:3000/api/jobs/${jobId}`);
        if (!res.ok) throw new Error("Job not found");
        const job = await res.json();

        // 4. Populate Form
        document.getElementById('title').value = job.title;
        document.getElementById('company').value = job.company;
        document.getElementById('type').value = job.type;
        document.getElementById('salary').value = job.salary;
        document.getElementById('location').value = job.location;
        document.getElementById('description').value = job.description;
        document.getElementById('date').value = job.date || '';
        document.getElementById('lat').value = job.lat || '';
        document.getElementById('lng').value = job.lng || '';

        // 5. Update Map with existing coords
        if (job.lat && job.lng) {
            updateMapLocation(job.lat, job.lng);
            map.setView([job.lat, job.lng], 15);
        }

    } catch (error) {
        console.error(error);
        alert("Eroare la încărcarea datelor jobului.");
        window.location.href = "dashboard.html";
    }

    // 6. Geocoding Logic (Copy from employer-form.js)
    const locationInput = document.getElementById('location');
    let timeout = null;

    locationInput.addEventListener('input', function (e) {
        const query = e.target.value;
        clearTimeout(timeout);
        if (query.length < 3) return;

        timeout = setTimeout(async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                const data = await response.json();
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    updateMapLocation(lat, lon);
                    map.setView([lat, lon], 15);
                }
            } catch (error) {
                console.error("Geocoding error:", error);
            }
        }, 1000);
    });
});

function updateMapLocation(lat, lng) {
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);
    document.getElementById('lat').value = lat;
    document.getElementById('lng').value = lng;
}

// 7. Handle Submit (PUT)
document.getElementById("jobForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('id');
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = "../../login.html";
        return;
    }

    // Collect Data
    const title = document.getElementById("title").value;
    const company = document.getElementById("company").value;
    const type = document.getElementById("type").value;
    const salary = document.getElementById("salary").value;
    const location = document.getElementById("location").value;
    const description = document.getElementById("description").value;
    const date = document.getElementById("date").value;
    
    let lat = document.getElementById('lat').value;
    let lng = document.getElementById('lng').value;
    lat = lat ? parseFloat(lat) : null;
    lng = lng ? parseFloat(lng) : null;

    const jobData = {
        title, company, type, salary, location, description, date, lat, lng
        // We do NOT update image_url here to keep the original image (or you could add logic to change it)
    };

    try {
        const res = await fetch(`http://localhost:3000/api/jobs/${jobId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(jobData)
        });
        const data = await res.json();

        if (data.success) {
            alert("Job actualizat cu succes!");
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "Eroare la actualizare");
        }
    } catch (error) {
        console.error(error);
        alert("Eroare server");
    }
});