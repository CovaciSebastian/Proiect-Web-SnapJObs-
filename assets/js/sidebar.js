// Global function for Logo Click
function goToHomePage() {
    const currentPath = window.location.pathname;

    if (currentPath.endsWith('/index.html') || currentPath === '/' || currentPath.endsWith('/Proiect-Web-SnapJObs-/') || currentPath.endsWith('/Proiect-Web-SnapJObs-/index.html')) {
        window.location.reload();
    } else {
        let pathPrefix = '';
        if (currentPath.includes('/pages/student/') || currentPath.includes('/pages/employer/')) {
            pathPrefix = '../../';
        }
        window.location.href = pathPrefix + 'index.html';
    }
}

// Existing showModala function (original)
function showModala() {
    const modala = document.querySelector(".side-nav");
    const backk = document.querySelector(".tot");

    if (!modala) {
        console.error("Sidebar element (.side-nav) not found!");
        return;
    }

    const isOpen = modala.classList.contains("seVede");

    if (isOpen) {
        modala.classList.remove("seVede");
        if (backk) {
            backk.classList.remove("blurata");
        }
    } else {
        modala.classList.add("seVede");
        
        if (backk) {
            backk.classList.add("blurata");
            backk.addEventListener("click", () => {
                modala.classList.remove("seVede");
                backk.classList.remove("blurata");
            }, { once: true });
        }
    }
}

// Function to handle sidebar link clicks and prevent 404 on same-page re-click
function handleSidebarLinkClick(event, targetPath) {
    const currentPathname = window.location.pathname;
    
    // Check if we are going to the EXACT same page to just refresh
    // We can check if the current URL ends with the target path (relative)
    if (currentPathname.endsWith(targetPath.replace('../', '/').replace('./', '/'))) {
        event.preventDefault();
        window.location.reload();
    }
}
