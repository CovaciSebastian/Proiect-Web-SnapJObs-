function showModala() {
    const modala = document.querySelector(".side-nav");
    const backk = document.querySelector(".tot");

    if (!modala) {
        console.error("Sidebar element (.side-nav) not found!");
        return;
    }

    // Verificăm dacă meniul este deja deschis
    const isOpen = modala.classList.contains("seVede");

    if (isOpen) {
        // Dacă e deschis, îl închidem
        modala.classList.remove("seVede");
        if (backk) {
            backk.classList.remove("blurata");
        }
    } else {
        // Dacă e închis, îl deschidem
        modala.classList.add("seVede");
        
        if (backk) {
            backk.classList.add("blurata");
            // Adăugăm event listener pentru a închide când dăm click pe fundal
            backk.addEventListener("click", () => {
                modala.classList.remove("seVede");
                backk.classList.remove("blurata");
            }, { once: true });
        }
    }
}

// Logic for Logout confirmation
document.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.querySelector('.side-nav a[href="login.html"]');

    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default navigation

            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // Simulate login state

            if (isLoggedIn) {
                const confirmLogout = window.confirm("Ești sigur că vrei să te deconectezi de la cont?");
                if (confirmLogout) {
                    localStorage.setItem('isLoggedIn', 'false'); // Simulate logout
                    window.alert("Te-ai deconectat cu succes!");
                    window.location.href = 'login.html'; // Redirect to login page after confirmation
                }
            } else {
                window.alert("Nu ești conectat la un cont.");
                // Optionally redirect to login page here, or do nothing
                // window.location.href = 'login.html';
            }
        });
    }
});