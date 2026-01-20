document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').toLowerCase().trim();
    
    document.getElementById('searchQuery').textContent = query || "Toate";

    const grid = document.getElementById('resultsGrid');
    const countLabel = document.getElementById('resultsCount');

    if (!query) {
        grid.innerHTML = '<p style="color: #ccc; grid-column: 1/-1; text-align: center;">Te rugăm să introduci un termen de căutare.</p>';
        return;
    }

    try {
        // Fetch jobs from API
        const res = await fetch('/api/jobs');
        const jobs = await res.json();

        // Filter jobs
        const filteredJobs = jobs.filter(job => 
            job.title.toLowerCase().includes(query) || 
            job.company.toLowerCase().includes(query) ||
            job.description.toLowerCase().includes(query) ||
            job.location.toLowerCase().includes(query)
        );

        countLabel.textContent = `${filteredJobs.length} joburi găsite`;

        if (filteredJobs.length === 0) {
            grid.innerHTML = '<p style="color: #ccc; grid-column: 1/-1; text-align: center;">Nu am găsit niciun job care să se potrivească căutării tale.</p>';
            return;
        }

        // Get user role for button logic
        const userRole = sessionStorage.getItem('userRole');
        const isEmployer = userRole === 'EMPLOYER' || userRole === 'employer';
        const myApplications = JSON.parse(localStorage.getItem('myApplications')) || [];

        // Render jobs
        filteredJobs.forEach(job => {
            const hasApplied = myApplications.includes(job.id) || myApplications.includes(String(job.id));
            
            let btnText = hasApplied ? "Ai aplicat" : "Aplică acum";
            let btnClass = hasApplied ? "btn-apply disabled" : "btn-apply";
            let btnDisabled = hasApplied ? "disabled" : "";

            if (isEmployer) {
                btnText = "Nu poți aplica";
                btnClass = "btn-apply disabled";
                btnDisabled = "disabled";
            }

            // Image path handling
            let imgPath = job.image_url || job.image;
            if (imgPath && !imgPath.startsWith('http') && !imgPath.startsWith('assets/')) {
                 imgPath = '../../assets/' + imgPath;
            } else if (imgPath && imgPath.startsWith('assets/')) {
                 imgPath = '../../' + imgPath;
            }

            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = `
                <a href="job-detail.html?id=${job.id}" style="width: 100%; text-decoration: none;">
                    <img src="${imgPath}" alt="${job.title}" onerror="this.src='https://placehold.co/300x200?text=Job'">
                    <h3>${job.title}</h3>
                </a>
                <p>${job.company}</p>
                <p class="salary">${job.salary}</p>
                <p>📍 ${job.location}</p>
                
                <button class="${btnClass}" onclick="applyToJob(${job.id})" ${btnDisabled}>
                    ${btnText}
                </button>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        grid.innerHTML = '<p style="color: red; grid-column: 1/-1; text-align: center;">Eroare la încărcarea joburilor.</p>';
    }
});

// Re-use apply logic (simplified version of dashboard logic)
async function applyToJob(jobId) {
    if (sessionStorage.getItem('isAuthenticated') !== 'true') {
        alert('Trebuie să te loghezi pentru a aplica!');
        window.location.href = '../../login.html';
        return;
    }

    const userRole = sessionStorage.getItem('userRole');
    if (userRole === 'EMPLOYER' || userRole === 'employer') {
        alert("Angajatorii nu pot aplica.");
        return;
    }

    try {
        const res = await fetch('/api/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ jobId })
        });
        const data = await res.json();

        if (data.success) {
            alert('Ai aplicat cu succes!');
            // Update local storage
            let myApps = JSON.parse(localStorage.getItem('myApplications')) || [];
            myApps.push(jobId);
            localStorage.setItem('myApplications', JSON.stringify(myApps));
            
            window.location.reload(); // Refresh to update buttons
        } else {
            alert(data.message || 'Eroare la aplicare');
        }
    } catch (error) {
        console.error(error);
        alert('Eroare de server');
    }
}