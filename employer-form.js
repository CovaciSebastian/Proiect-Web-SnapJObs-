document.getElementById("jobForm").addEventListener("submit", function(e) {
    e.preventDefault();

    // Colectare date
    const title = document.getElementById("title").value;
    const company = document.getElementById("company").value;
    const type = document.getElementById("type").value;
    const salary = document.getElementById("salary").value;
    const location = document.getElementById("location").value;
    const description = document.getElementById("description").value;

    // Creare obiect job
    // Generăm un ID random mare pentru a nu intra în conflict cu cele statice
    const newJob = {
        id: Date.now(), 
        title: title,
        company: company,
        type: type,
        salary: salary,
        location: location,
        description: description,
        image: `img/job-${type}.png` // Imagine default bazată pe tip
    };

    // Salvare în LocalStorage
    let storedJobs = JSON.parse(localStorage.getItem("newJobs")) || [];
    storedJobs.push(newJob);
    localStorage.setItem("newJobs", JSON.stringify(storedJobs));

    alert("Jobul a fost publicat cu succes!");
    
    // Reset form
    e.target.reset();
    
    // Opțional: Redirect către dashboard student pentru a-l vedea
    // window.location.href = "index.html";
});
