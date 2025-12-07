# Specificație Restructurare pe Roluri

**Obiectiv:** Organizarea paginilor HTML în directoare specifice rolurilor (`student`, `employer`).

## Structura Nouă
*   `pages/student/dashboard.html` (<- `student-dashboard.html`)
*   `pages/student/applications.html` (<- `student-applications.html`)
*   `pages/student/profile.html` (<- `student-profile.html`)
*   `pages/student/job-detail.html` (<- `job-detail.html`)
*   `pages/employer/dashboard.html` (<- `employer-dashboard.html`)
*   `pages/employer/post-job.html` (<- `employer-post.html`)

## Plan de Execuție

### Faza 1: Creare Directoare și Mutare
1.  Creare `pages/student` și `pages/employer`.
2.  Mutare și redenumire fișiere HTML.

### Faza 2: Actualizare Resurse (CSS/JS/Imagini) în paginile mutate
*   Toate paginile din `pages/*/*` sunt la nivelul 2.
*   Prefixul pentru resurse (`assets/`) trebuie să devină `../../assets/`.
*   Ex: `href="assets/css/styles.css"` -> `href="../../assets/css/styles.css"`
*   Ex: `src="assets/js/script.js"` -> `src="../../assets/js/script.js"`
*   Ex: `img src="assets/img/..."` -> `img src="../../assets/img/..."`

### Faza 3: Actualizare Navigare (Link-uri)
1.  **În paginile din rădăcină (`index.html`, etc.):**
    *   `student-dashboard.html` -> `pages/student/dashboard.html`
    *   `employer-dashboard.html` -> `pages/employer/dashboard.html`
    *   etc.
2.  **În paginile mutate (`pages/student/dashboard.html`):**
    *   Link-uri către rădăcină: `index.html` -> `../../index.html`
    *   Link-uri către alte pagini student: `student-profile.html` -> `profile.html` (sunt în același folder acum!)
    *   Link-uri către angajator: `employer-dashboard.html` -> `../employer/dashboard.html`

### Faza 4: Actualizare Scripturi JS (Fetch & Paths)
*   Scripturile JS care rulează în paginile mutate ar putea avea nevoie de ajustări dacă folosesc căi relative (ex: `fetch('data/jobs.json')`).
*   Dacă scriptul e în `assets/js/`, calea relativă depinde de **pagina HTML** care îl rulează.
*   `fetch('data/jobs.json')` apelat din `pages/student/dashboard.html` va căuta `pages/student/data/jobs.json` (greșit).
*   Trebuie schimbat în `../../data/jobs.json`.
*   **Soluție:** Vom prefixa fetch-urile în JS sau vom folosi un path absolut/configurabil. Cel mai simplu: ajustăm JS-urile să detecteze locația sau modificăm manual fetch-urile în funcție de pagină (dacă sunt inline). Dacă sunt externe, e mai complicat.

---
**NOTĂ CRITICĂ DESPRE JS:**
Scripturile din `assets/js/` (ex: `student-dashboard.js`) sunt încărcate de pagină. Când scriptul execută `fetch('data/jobs.json')`, request-ul este relativ la URL-ul paginii.
Deci, dacă mutăm pagina, `fetch` va eșua.
**Soluție:** Vom modifica toate `fetch`-urile să folosească o cale detectată dinamic sau vom modifica fișierele JS să aibă căile corecte (`../../data/jobs.json`).
