// Initialize Map
let map;
let marker;

document.addEventListener('DOMContentLoaded', () => {
    // Default: Bucharest Center
    const defaultLat = 44.4268;
    const defaultLng = 26.1025;

    map = L.map('mapPicker').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Fix: Force map refresh to ensure tiles load
    setTimeout(() => {
        map.invalidateSize();
    }, 500);

    // Click to add/move marker
    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        updateMapLocation(lat, lng);
    });

    // Geocoding Logic (Search address)
    const locationInput = document.getElementById('location');
    let timeout = null;

    locationInput.addEventListener('input', function (e) {
        const query = e.target.value;
        
        // Clear previous timeout (debounce)
        clearTimeout(timeout);

        if (query.length < 3) return; // Don't search for short strings

        // Wait 1s after typing stops
        timeout = setTimeout(async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                const data = await response.json();

                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    
                    // Update Map & Marker (pass false to prevent reverse geocoding from address update)
                    updateMapLocation(lat, lon, false);
                    map.setView([lat, lon], 15); // Zoom in on found location
                }
            } catch (error) {
                console.error("Geocoding error:", error);
            }
        }, 1000);
    });
});

function updateMapLocation(lat, lng, updateAddressInput = true) {
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker([lat, lng]).addTo(map);
    
    // Update hidden inputs
    document.getElementById('lat').value = lat;
    document.getElementById('lng').value = lng;

    if (updateAddressInput) {
        // Reverse Geocoding to update the address text input
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
                if (data && data.display_name) {
                    const addressString = data.display_name;
                    const locationInput = document.getElementById('location');
                    // Only update if current input is different to prevent infinite loop from forward geocoding
                    if (locationInput.value !== addressString) {
                         locationInput.value = addressString;
                    }
                }
            })
            .catch(error => console.error("Reverse geocoding error:", error));
    }
}

document.getElementById("jobForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        alert("Trebuie să fii logat ca angajator.");
        window.location.href = "../../login.html";
        return;
    }

    // Colectare date
    const title = document.getElementById("title").value;
    const company = document.getElementById("company").value;
    const type = document.getElementById("type").value;
    const salary = document.getElementById("salary").value;
    const location = document.getElementById("location").value;
    const description = document.getElementById("description").value;
    const date = document.getElementById("date").value;
    
    // Get coords from hidden inputs
    let lat = document.getElementById('lat').value;
    let lng = document.getElementById('lng').value;

    // Convert to float or null
    lat = lat ? parseFloat(lat) : null;
    lng = lng ? parseFloat(lng) : null;

    // If type is online, maybe force null? Or keep user selection.
    // Let's keep selection if they made one, otherwise null.
    if (type === 'online' && !lat) {
        // No coords needed for online unless specified
    } 
    // Fallback if physical/event and NO map click: Random (or default center)?
    // User requested "poti sa o pui de pe harta SAU scris". 
    // If they typed but didn't click map, we have no coords. 
    // For now, if no coords, we leave null. The student dashboard handles nulls by randomizing or ignoring.
    // BETTER: If no coords provided, let the backend/frontend logic handle it. 
    // We send whatever we have.

    // Generate dynamic image based on type (Curated Static List)
    const images = {
        eveniment: [
            'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'
        ],
        fizic: [
            'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1581094794329-cd56b50d7118?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1595814433015-e6f5ce69614e?auto=format&fit=crop&w=800&q=80'
        ],
        online: [
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1593642532400-2682810df593?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=800&q=80'
        ]
    };

    let pool = images.online;
    if (type === 'eveniment') pool = images.eveniment;
    if (type === 'fizic') pool = images.fizic;

    const randomIndex = Math.floor(Math.random() * pool.length);
    const image_url = pool[randomIndex];

    // Creare obiect job
    const jobData = {
        title,
        company,
        type,
        salary,
        location,
        description,
        date,
        lat,
        lng,
        image_url: image_url
    };

    try {
        const res = await fetch('http://localhost:3000/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(jobData)
        });
        const data = await res.json();

        if (data.success) {
            alert("Jobul a fost publicat cu succes!");
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "Eroare la postare");
        }
    } catch (error) {
        console.error(error);
        alert("Eroare server");
    }
});
