document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('jobDetailContainer');
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('id');

    if (!jobId) {
        container.innerHTML = '<p style="color: red;">Job invalid.</p>';
        return;
    }

    try {
        // 1. Fetch all jobs
        const res = await fetch('data/jobs.json'); // Adjusted path
        const staticJobs = await res.json();
        const newJobs = JSON.parse(localStorage.getItem('newJobs')) || [];
        const allJobs = [...staticJobs, ...newJobs];

        // 2. Find job
        const job = allJobs.find(j => j.id == jobId);

        if (!job) {
            container.innerHTML = '<p style="color: red;">Jobul nu a fost găsit.</p>';
            return;
        }

        // 3. Check application status
        const myApps = JSON.parse(localStorage.getItem('myApplications')) || [];
        const hasApplied = myApps.includes(parseInt(jobId)) || myApps.includes(jobId.toString());

        // 4. Render
        // Handle image path: if it starts with 'assets', prepend '../'
        let imgPath = job.image;
        if (imgPath && !imgPath.startsWith('assets/') && !imgPath.startsWith('http')) {
             // If it's a relative path from root, it should already be correct for root assets/img
             // But if `job.image` is still `img/job-type.png`, we need to change it to `assets/img/job-type.png`
             imgPath = 'assets/' + imgPath; // Assuming job.image is "img/..."
        }


        container.innerHTML = `
            <div class="job-image">
                <img src="${imgPath}" alt="${job.title}" onerror="this.src='https://placehold.co/400x400?text=No+Image'">
            </div>
            <div class="job-info-section">
                <h1 class="job-title-detail">${job.title}</h1>
                <div class="job-company-detail">🏢 ${job.company}</div>
                
                <div class="detail-row">📍 <strong>Locație:</strong> ${job.location}</div>
                <div class="detail-row">📅 <strong>Dată:</strong> ${job.date || 'Flexibil'}</div>
                <div class="detail-row">💰 <strong>Salariu:</strong> ${job.salary}</div>
                <div class="detail-row">📂 <strong>Tip:</strong> ${job.type.toUpperCase()}</div>
                
                <hr style="border-color: #333; margin: 20px 0;">
                
                <h3 style="color: #29b6f6; margin-bottom: 10px;">Descriere</h3>
                <p style="color: #ccc; line-height: 1.6;">${job.description}</p>

                <button id="applyBtn" class="btn-apply-detail" ${hasApplied ? 'disabled' : ''}>
                    ${hasApplied ? 'Ai Aplicat Deja' : 'Aplică Acum'}
                </button>
            </div>
        `;

        // 5. Bind Event
        const btn = document.getElementById('applyBtn');
        if (btn && !hasApplied) {
            btn.addEventListener('click', () => {
                myApps.push(job.id);
                localStorage.setItem('myApplications', JSON.stringify(myApps));
                alert('Ai aplicat cu succes!');
                window.location.reload();
            });
        }

    } catch (e) {
        console.error(e);
        container.innerHTML = '<p style="color: red;">Eroare la încărcarea jobului.</p>';
    }
});