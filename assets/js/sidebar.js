// Function to update header buttons based on login status
function updateHeaderButtons() {
    const headerActions = document.querySelector('.header-actions');
    const authButtons = headerActions.querySelector('.auth-buttons');
    let profileLink = headerActions.querySelector('.profile-link'); // Look for existing profile link
    const applicationsIcon = headerActions.querySelector('.icon-applications'); // Keep applications icon visible

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        if (authButtons) authButtons.style.display = 'none'; // Hide login/register buttons

        if (!profileLink) { // If profile link doesn't exist, create it
            profileLink = document.createElement('div');
            profileLink.className = 'profile-link';
            // Adjust href based on current location (root vs subfolder)
            const currentPath = window.location.pathname;
            let profileHref = 'pages/student/profile.html';
            if (currentPath.includes('/pages/student/') || currentPath.includes('/pages/employer/')) {
                profileHref = '../student/profile.html'; // Adjust for subfolders
            }
            profileLink.innerHTML = `
                <a href="${profileHref}" class="auth-btn btn-profile" style="background-color: #29b6f6 !important; color: #000 !important;">Profilul meu</a>
            `;
            // Insert before applications icon or at the end if applicationsIcon is null
            if (applicationsIcon) {
                headerActions.insertBefore(profileLink, applicationsIcon); 
            } else {
                headerActions.appendChild(profileLink);
            }
        } else {
            profileLink.style.display = 'flex'; // Ensure it's visible if it already existed
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex'; // Show login/register buttons
        if (profileLink) profileLink.style.display = 'none'; // Hide profile link
    }

    // Update application count (if it exists)
    const applicationsCount = JSON.parse(localStorage.getItem('myApplications')) || [];
    const applicationsCountSpan = document.getElementById('applicationCount');
    if (applicationsCountSpan) {
        applicationsCountSpan.innerText = applicationsCount.length;
    }
}

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
    
    // Normalize targetPath to handle variations (e.g., "dashboard.html" vs "/pages/student/dashboard.html")
    let normalizedTargetPath = targetPath;
    if (targetPath.startsWith('pages/')) { // Assume root-relative if starts with pages/
        normalizedTargetPath = `/${targetPath}`;
    } else if (targetPath.startsWith('../')) { // Adjust for parent-relative paths
        const currentDir = currentPathname.substring(0, currentPathname.lastIndexOf('/'));
        const parentDir = currentDir.substring(0, currentDir.lastIndexOf('/'));
        normalizedTargetPath = `${parentDir}/${targetPath.substring(targetPath.lastIndexOf('/') + 1)}`;
    } else if (!targetPath.includes('/')) { // Simple file name in current directory
        normalizedTargetPath = currentPathname.substring(0, currentPathname.lastIndexOf('/')) + `/${targetPath}`;
    }

    // Attempt to normalize currentPathname to match the ending of targetPath
    const currentFileName = currentPathname.substring(currentPathname.lastIndexOf('/') + 1);
    const targetFileName = normalizedTargetPath.substring(normalizedTargetPath.lastIndexOf('/') + 1);

    if (currentFileName === targetFileName) {
        event.preventDefault(); // Prevent default navigation
        window.location.reload(); // Force refresh
    }
    // If not on the same page, allow default link behavior
}


// Logic for Logout confirmation and initial header update
document.addEventListener('DOMContentLoaded', () => {
    updateHeaderButtons(); // Initial update on page load

    const logoutLink = document.querySelector('.side-nav a[href*="login.html"]'); // Use [href*="login.html"] to match various login paths

    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();

            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            if (isLoggedIn) {
                const confirmLogout = window.confirm("Ești sigur că vrei să te deconectezi de la cont?");
                if (confirmLogout) {
                    localStorage.setItem('isLoggedIn', 'false');
                    localStorage.removeItem('currentUser'); // Clear current user data
                    localStorage.removeItem('myApplications'); // Clear applications on logout
                    window.alert("Te-ai deconectat cu succes!");
                    
                    // Determine correct redirect path for login
                    const currentPath = window.location.pathname;
                    let redirectPath = 'login.html';
                    if (currentPath.includes('/pages/student/') || currentPath.includes('/pages/employer/')) {
                        redirectPath = '../../login.html';
                    }
                    window.location.href = redirectPath;
                }
            } else {
                window.alert("Nu ești conectat la un cont.");
                // Redirect to login if not logged in but trying to logout (e.g., direct access)
                const currentPath = window.location.pathname;
                let redirectPath = 'login.html';
                if (currentPath.includes('/pages/student/') || currentPath.includes('/pages/employer/')) {
                    redirectPath = '../../login.html';
                }
                window.location.href = redirectPath;
            }
        });
    }
});