// Initialize Map
let map;
let marker;

document.addEventListener('DOMContentLoaded', () => {
    // Check if map container exists
    if (!document.getElementById('mapPicker')) {
        console.warn('Map container #mapPicker not found on this page.');
        return;
    }

    // Default: Bucharest Center
    const defaultLat = 44.4268;
    const defaultLng = 26.1025;

    map = L.map('mapPicker').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Fix: Force map refresh to ensure tiles load correctly if container was hidden/resized
    setTimeout(() => {
        map.invalidateSize();
    }, 500);

    // --- MAP CLICK HANDLER (Updates Input) ---
    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        // Update marker and hidden inputs
        updateMapLocation(lat, lng, true); // true = update address input
    });

    // --- INPUT TYPING HANDLER (Updates Map) ---
    const locationInput = document.getElementById('location');
    let timeout = null;

    if (locationInput) {
        locationInput.addEventListener('input', function (e) {
            const query = e.target.value;
            
            // Clear previous timeout (debounce)
            clearTimeout(timeout);

            if (query.length < 3) return; // Don't search for very short strings

            // Wait 1s after typing stops to avoid spamming the API
            timeout = setTimeout(async () => {
                try {
                    console.log("Searching for:", query);
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                    const data = await response.json();

                    if (data && data.length > 0) {
                        const lat = parseFloat(data[0].lat);
                        const lon = parseFloat(data[0].lon);
                        
                        console.log("Found:", lat, lon);
                        // Update Map & Marker, BUT skip updating the address input (false) to avoid overwriting user's typing
                        updateMapLocation(lat, lon, false);
                        map.setView([lat, lon], 15); // Zoom in on found location
                    } else {
                        console.log("No results found for:", query);
                    }
                } catch (error) {
                    console.error("Geocoding error:", error);
                }
            }, 1000);
        });
    }
});

// Helper function to update marker and inputs
function updateMapLocation(lat, lng, shouldUpdateInput) {
    // Remove existing marker
    if (marker) {
        map.removeLayer(marker);
    }
    
    // Add new marker
    marker = L.marker([lat, lng]).addTo(map);
    
    // Update hidden inputs for form submission
    const latInput = document.getElementById('lat');
    const lngInput = document.getElementById('lng');
    if (latInput) latInput.value = lat;
    if (lngInput) lngInput.value = lng;

    // If triggered by map click, reverse geocode to get address string
    if (shouldUpdateInput) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
                if (data && data.display_name) {
                    const addressString = data.display_name;
                    const locationInput = document.getElementById('location');
                    
                    if (locationInput) {
                         locationInput.value = addressString;
                         // Optional: Flash input to indicate update
                         locationInput.style.backgroundColor = '#1a2733';
                         setTimeout(() => locationInput.style.backgroundColor = '', 300);
                    }
                }
            })
            .catch(error => console.error("Reverse geocoding error:", error));
    }
}

// Form Submission Handler
const jobForm = document.getElementById("jobForm");
if (jobForm) {
    jobForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        if (sessionStorage.getItem('isAuthenticated') !== 'true') {
            alert("Trebuie să fii logat ca angajator.");
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
        
        // Get coords from hidden inputs
        let lat = document.getElementById('lat').value;
        let lng = document.getElementById('lng').value;

        // Convert to float or null
        lat = lat ? parseFloat(lat) : null;
        lng = lng ? parseFloat(lng) : null;

        // Generate dynamic image based on type
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

        // Create job object
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
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
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
            alert("Eroare server. Verifică conexiunea.");
        }
    });
}