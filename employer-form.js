document.getElementById("jobForm").addEventListener("submit", function(e) {
    e.preventDefault();

    // Colectare date
    const title = document.getElementById("title").value;
    const company = document.getElementById("company").value;
    const type = document.getElementById("type").value;
    const salary = document.getElementById("salary").value;
    const location = document.getElementById("location").value;
    const description = document.getElementById("description").value;
    const date = document.getElementById("date").value;

    // Generare coordonate random în București (aprox) pentru demo
    // Center: 44.4268, 26.1025. Spread: ~0.05
    let lat = null;
    let lng = null;

    if (type !== 'online') {
        lat = 44.4268 + (Math.random() - 0.5) * 0.1;
        lng = 26.1025 + (Math.random() - 0.5) * 0.1;
    }

    // Creare obiect job
    const newJob = {
        id: Date.now(), 
        title: title,
        company: company,
        type: type,
        salary: salary,
        location: location,
        description: description,
        date: date,
        lat: lat,
        lng: lng,
        image: `img/job-${type}.png`
    };

    // Salvare în LocalStorage
    let storedJobs = JSON.parse(localStorage.getItem("newJobs")) || [];
    storedJobs.push(newJob);
    localStorage.setItem("newJobs", JSON.stringify(storedJobs));

    alert("Jobul a fost publicat cu succes!");
    window.location.href = "employer-dashboard.html";
});
