let jobsContainer = document.querySelector(".listProduct");
let applicationsCountSpan = document.getElementById("applications-count");

let jobs = [];
let myApplications = [];

// Inițializare Aplicație
const initApp = () => {
    // 1. Încărcăm Joburile
    fetch("http://localhost:3000/api/jobs")
        .then((response) => response.json())
        .then((data) => {
            jobs = data;
            renderJobs(jobs);
            initSearch();
        })
        .catch((err) => console.error("Eroare încărcare joburi:", err));

    // 2. Încărcăm Aplicațiile salvate (dacă există)
    if (localStorage.getItem("myApplications")) {
        myApplications = JSON.parse(localStorage.getItem("myApplications"));
    }
    updateApplicationsCount();
};

// Funcție Randare Joburi
function renderJobs(jobsList) {
    jobsContainer.innerHTML = "";
    
    if (jobsList.length === 0) {
        jobsContainer.innerHTML = "<p style='text-align:center; width:100%;'>Nu am găsit joburi conform criteriilor.</p>";
        return;
    }

    jobsList.forEach((job) => {
        let newJob = document.createElement("div");
        newJob.dataset.id = job.id;
        newJob.classList.add("item");
        // Adăugăm o clasă pentru tipul jobului (opțional, pentru stilizare)
        newJob.classList.add(job.type); 

        // Verificăm dacă utilizatorul a aplicat deja
        const hasApplied = myApplications.includes(job.id.toString()) || myApplications.includes(job.id);
        const btnText = hasApplied ? "Ai aplicat" : "Aplică acum";
        const btnClass = hasApplied ? "addCart applied" : "addCart";
        const btnDisabled = hasApplied ? "disabled" : "";

        newJob.innerHTML = `
            <div class="job-card-header">
                <span class="job-type-badge">${job.type.toUpperCase()}</span>
            </div>
            <a href="job-detail.html?id=${job.id}">         
                <img src="assets/${job.image_url || job.image}" alt="${job.title}" onerror="this.src='https://placehold.co/300x300?text=Job'">
                <h3 class="job-title">${job.title}</h3>
            </a>
            
            <div class="job-info">
                <p class="company"><i class="icon-company"></i> ${job.company}</p>
                <p class="location">📍 ${job.location}</p>
                <div class="salary-box">
                    <span class="salary-label">Salariu:</span>
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

// Funcție Căutare
function initSearch() {
    let searchBar = document.getElementById("search");
    let searchResults = document.querySelector(".search-results");
    let mainContainer = document.querySelector(".tot"); // Pentru efectul de blur

    searchBar.addEventListener("keyup", (e) => {
        const term = e.target.value.toLowerCase();
        
        // Filtrăm joburile
        const filteredJobs = jobs.filter(job => 
            job.title.toLowerCase().includes(term) || 
            job.company.toLowerCase().includes(term)
        );

        // Opțional: Afișăm rezultate în dropdown (search-results)
        // Sau randăm direct în lista principală (mai simplu pentru utilizator)
        renderJobs(filteredJobs);
    });
}

// Funcție Aplicare la Job
function applyToJob(jobId) {
    // Verificăm dacă e deja aplicat
    if (myApplications.includes(jobId)) return;

    // Adăugăm în listă
    myApplications.push(jobId);
    
    // Salvăm în LocalStorage
    localStorage.setItem("myApplications", JSON.stringify(myApplications));

    // Actualizăm UI
    updateApplicationsCount();
    
    // Re-randăm butonul specific (sau toată lista, dar e mai eficient doar butonul)
    // Aici, pentru simplitate, re-randăm tot pentru a actualiza starea butoanelor
    renderJobs(jobs);

    alert("Felicitări! Ai aplicat cu succes la acest job.");
}

function updateApplicationsCount() {
    if(applicationsCountSpan) {
        applicationsCountSpan.innerText = myApplications.length;
    }
}

// Pornire
initApp();

// Funcții helper (din vechiul cod, adaptate sau păstrate dacă e nevoie de meniu lateral)
function showModala() {
    const modala = document.querySelector(".side-nav");
    const backk = document.querySelector(".tot"); // Containerul principal
    if(modala && backk) {
        modala.classList.add("seVede");
        backk.classList.add("blurata");
        
        // Click outside to close
        backk.addEventListener("click", () => {
            modala.classList.remove("seVede");
            backk.classList.remove("blurata");
        }, { once: true }); // Event listener-ul se șterge singur după un click
    }
}

function loadMore() {
    console.log("Funcționalitate de paginare - de implementat dacă sunt multe joburi.");
}