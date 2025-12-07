# Specificație de Restructurare Proiect SnapJobs

Acest document detaliază planul de reorganizare a fișierelor proiectului pentru a îmbunătăți structura și mentenabilitatea, fără a afecta funcționalitatea.

**Principiu:** Vom muta fișierele pe categorii (faze), actualizând imediat referințele din cod pentru a menține site-ul funcțional după fiecare pas.

## Structura Actuală vs. Structura Țintă

**Actual:**
- Toate fișierele HTML, CSS, JS și JSON sunt în rădăcină (`/`).
- Imaginile sunt în `assets/img/` (dar unele referințe pot fi greșite).

**Țintă:**
```
/ (Rădăcina)
├── index.html, login.html, ... (HTML-urile rămân aici)
├── data/
│   └── jobs.json
└── assets/
    ├── css/
    │   ├── styles.css
    │   └── header-styles.css
    ├── js/
    │   ├── sidebar.js
    │   ├── auth.js
    │   ├── student-dashboard.js
    │   └── ... (celelalte scripturi)
    └── img/
        └── ... (imaginile existente)
```

---

## Plan de Implementare pe Faze

### Faza 1: Organizarea CSS
**Obiectiv:** Mutarea fișierelor de stil în `assets/css/`.
1.  Crearea directorului `assets/css`.
2.  Mutarea `styles.css` și `header-styles.css` în `assets/css/`.
3.  **CRITIC:** Actualizarea tuturor tag-urilor `<link rel="stylesheet">` în toate fișierele HTML.
    *   `href="styles.css"` -> `href="assets/css/styles.css"`
    *   `href="header-styles.css"` -> `href="assets/css/header-styles.css"`
4.  **Testare:** Verificarea vizuală a paginilor (dacă arată "sparte", înseamnă că CSS-ul nu s-a încărcat).

### Faza 2: Organizarea JavaScript
**Obiectiv:** Mutarea fișierelor script în `assets/js/`.
1.  Crearea directorului `assets/js`.
2.  Mutarea tuturor fișierelor `.js` (ex: `sidebar.js`, `auth.js`, `student-dashboard.js`, etc.) în `assets/js/`.
3.  **CRITIC:** Actualizarea tuturor tag-urilor `<script src="...">` în toate fișierele HTML.
    *   Ex: `src="sidebar.js"` -> `src="assets/js/sidebar.js"`
4.  **Testare:** Verificarea funcționalității (meniu, butoane, login).

### Faza 3: Organizarea Datelor (JSON)
**Obiectiv:** Mutarea `jobs.json` într-un folder dedicat.
1.  Crearea directorului `data`.
2.  Mutarea `jobs.json` în `data/`.
3.  **CRITIC:** Actualizarea apelurilor `fetch()` în fișierele JS (`student-dashboard.js`, `student-applications.js`, `employer-dashboard.html` script).
    *   `fetch('jobs.json')` -> `fetch('data/jobs.json')`
4.  **Testare:** Verificarea încărcării joburilor în dashboard.

### Faza 4: Verificarea Imaginilor
**Obiectiv:** Asigurarea că toate imaginile sunt încărcate corect din `assets/img/`.
1.  Verificarea căii imaginilor în `jobs.json` (ex: `"image": "img/..."` vs `"image": "assets/img/..."`).
2.  Dacă `jobs.json` referă `img/`, trebuie actualizat la `assets/img/` SAU asigurat că path-ul este relativ corect.
3.  Verificarea logo-ului în HTML.

---

**NOTĂ:** HTML-urile nu vor fi mutate din rădăcină în această etapă. Mutarea lor ar implica rescrierea tuturor link-urilor de navigare (`<a href="...">`), ceea ce prezintă un risc major de erori "404 Not Found".
