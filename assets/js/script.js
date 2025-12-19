let jobsContainer = document.querySelector(".listProduct");
let applicationsCountSpan = document.getElementById("applications-count");

let jobs = [];
// This will now be populated from the backend if the user is authenticated
let myApplicationIds = new Set(); 

// --- NEW AUTHENTICATION FLOW ---

// Check authentication status on page load
async function checkAuthAndInit() {
    try {
        const res = await fetch('http://localhost:3000/api/auth/status', {credentials: 'include'}); // 'credentials: include' is crucial for cookies
        const data = await res.json();

        if (data.isAuthenticated) {
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('userRole', data.user.role);
            sessionStorage.setItem('currentUserId', data.user.id);
            await fetchUserApplications(data.user.id); // Fetch applications for the logged-in user
        } else {
            sessionStorage.clear();
        }
    } catch (error) {
        console.error('Failed to check authentication status:', error);
        sessionStorage.clear();
    }
    // After checking auth, proceed to initialize the rest of the app
    initApp();
}

async function fetchUserApplications(userId) {
    // NOTE: This assumes an endpoint /api/applications/my exists that returns all application for the logged-in user.
    // This endpoint needs to be created on the backend.
    try {
        const res = await fetch(`http://localhost:3000/api/applications/my`, {credentials: 'include'});
        if (res.ok) {
            const applications = await res.json();
            myApplicationIds = new Set(applications.map(app => app.job_id));
        }
    } catch (error) {
        console.error("Could not fetch user applications:", error);
    }
}


// --- APPLICATION INITIALIZATION ---

const initApp = () => {
    // 1. Fetch Jobs
    fetch("http://localhost:3000/api/jobs")
        .then((response) => response.json())
        .then((data) => {
            jobs = data;
            renderJobs(jobs);
            initSearch();
        })
        .catch((err) => console.error("Error loading jobs:", err));

    // 2. Update UI based on fetched applications
    updateApplicationsCount();
};

// --- UI RENDERING ---

function renderJobs(jobsList) {
    if (!jobsContainer) return;
    jobsContainer.innerHTML = "";
    
    if (jobsList.length === 0) {
        jobsContainer.innerHTML = "<p style='text-align:center; width:100%;'>No jobs found based on criteria.</p>";
        return;
    }

    const isEmployer = sessionStorage.getItem('userRole') === 'EMPLOYER';

    jobsList.forEach((job) => {
        let newJob = document.createElement("div");
        newJob.dataset.id = job.id;
        newJob.classList.add("item", job.type);

        const hasApplied = myApplicationIds.has(job.id);
        
        let btnText = hasApplied ? "Applied" : "Apply Now";
        let btnClass = hasApplied ? "addCart applied" : "addCart";
        let btnDisabled = hasApplied || isEmployer ? "disabled" : "";
        if (isEmployer) {
            btnText = "Cannot Apply";
        }


        let imgPath = job.image_url || 'assets/img/job-online.png'; // Default fallback

        newJob.innerHTML = `
            <div class="job-card-header">
                <span class="job-type-badge">${job.type.toUpperCase()}</span>
            </div>
            <a href="pages/student/job-detail.html?id=${job.id}">         
                <img src="${imgPath}" alt="${job.title}" onerror="this.src='https://placehold.co/300x300?text=Job'">
                <h3 class="job-title">${job.title}</h3>
            </a>
            <div class="job-info">
                <p class="company"><i class="icon-company"></i> ${job.company}</p>
                <p class="location">📍 ${job.location}</p>
                <div class="salary-box">
                    <span class="salary-label">Salary:</span>
                    <span class="salary-value">${job.salary}</span>
                </div>
            </div>
            <button class="${btnClass}" onclick="applyToJob(${job.id})" ${btnDisabled}>
                ${btnText}
            </button>
        `;

        jobsContainer.appendChild(newJob);
    });
}

// --- USER ACTIONS ---

function initSearch() {
    let searchBar = document.getElementById("search");
    if (!searchBar) return;
    searchBar.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const term = e.target.value.trim();
            if (term) {
                window.location.href = `pages/student/search-results.html?q=${encodeURIComponent(term)}`;
            }
        }
    });
}

async function applyToJob(jobId) {
    if (sessionStorage.getItem('isAuthenticated') !== 'true') {
        alert('You must be logged in to apply!');
        window.location.href = '/login.html';
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId }),
            credentials: 'include' // Send cookies with the request
        });
        const data = await res.json();

        if (res.ok) {
            myApplicationIds.add(jobId);
            updateApplicationsCount();
            renderJobs(jobs); // Re-render to update button state
            alert("Congratulations! You have successfully applied for this job.");
        } else {
            alert(data.message || 'Error applying');
        }
    } catch (error) {
        console.error(error);
        alert('Server error');
    }
}

function updateApplicationsCount() {
    if(applicationsCountSpan) {
        applicationsCountSpan.innerText = myApplicationIds.size;
    }
}


// --- START THE APP ---
document.addEventListener('DOMContentLoaded', checkAuthAndInit);


// --- HELPERS (SIDE MENU) ---
function showModala() {
    const modala = document.querySelector(".side-nav");
    const backk = document.querySelector(".tot");
    if(modala && backk) {
        modala.classList.add("seVede");
        backk.classList.add("blurata");
        
        backk.addEventListener("click", () => {
            modala.classList.remove("seVede");
            backk.classList.remove("blurata");
        }, { once: true });
    }
}