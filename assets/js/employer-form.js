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

    // Generare coordonate random în București (aprox) pentru demo
    // Center: 44.4268, 26.1025. Spread: ~0.05
    let lat = null;
    let lng = null;

    if (type !== 'online') {
        lat = 44.4268 + (Math.random() - 0.5) * 0.1;
        lng = 26.1025 + (Math.random() - 0.5) * 0.1;
    }

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
        image_url: `img/job-${type}.png`
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
