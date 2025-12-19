### **Plan Complet: Integrare Google Sign-On (SSO)**

Acest document descrie, pas cu pas, strategia end-to-end pentru adăugarea autentificării cu Google în aplicația SnapJobs, păstrând în același timp sistemul existent de email/parolă.

---

### **Decizii Cheie & Rezumat Arhitectural**

1.  **OAuth Flow**: Vom folosi **Authorization Code Flow**. Motivul: este cel mai sigur flux pentru aplicații cu un backend capabil să stocheze secrete. Backend-ul va orchestra procesul, schimbând codul de autorizare pentru token-uri direct cu Google. Acest lucru înseamnă că `client_secret`-ul și token-urile Google nu ajung niciodată pe frontend, minimizând riscurile de securitate.
2.  **Stocare Useri**: Vom modifica tabelul `User` existent în Prisma. Este cea mai simplă abordare pentru acest proiect. Vom adăuga câmpuri pentru `provider` și `googleId` și vom face câmpul `password` opțional.
3.  **Livrare Token**: După login/register via Google, backend-ul va genera JWT-ul aplicației și va redirecționa utilizatorul către o pagină de succes pe frontend, transmițând token-ul printr-un **cookie `httpOnly` și `secure`**. Aceasta este metoda superioară `localStorage` din punct de vedere al securității, prevenind atacurile XSS.
4.  **Roluri**: Utilizatorii noi care se înregistrează cu Google vor primi implicit rolul `STUDENT`. Mecanismul de upgrade la `EMPLOYER` (cu cod secret) va rămâne un pas separat, post-autentificare.

---

### **1. Arhitectură OAuth 2.0**

1.  **Flux ales**: **Authorization Code Flow** (Server-side).
    *   **De ce?**: Este ideal pentru arhitectura ta. Backend-ul (client confidențial) poate stoca în siguranță `GOOGLE_CLIENT_SECRET`. Frontend-ul (client public) nu are nevoie să gestioneze informații sensibile.
2.  **Cum funcționează**:
    *   **Pas 1 (Frontend)**: Utilizatorul apasă "Login with Google". Frontend-ul face un redirect la un endpoint din backend-ul nostru (ex: `GET /api/auth/google`).
    *   **Pas 2 (Backend)**: Backend-ul construiește URL-ul de autorizare Google (cu `client_id`, `redirect_uri`, `scope`, `response_type=code` și un parametru `state` pentru protecție CSRF) și redirecționează browser-ul utilizatorului către acest URL.
    *   **Pas 3 (Google)**: Utilizatorul se autentifică la Google și acordă permisiunile cerute. Google redirecționează înapoi la `redirect_uri`-ul specificat de noi (ex: `GET /api/auth/google/callback`), incluzând un `code` și parametrul `state` în URL.
    *   **Pas 4 (Backend)**: Endpoint-ul de callback:
        a. Verifică dacă `state`-ul primit corespunde cu cel salvat în sesiune.
        b. Trimite o cerere `POST` server-ului Google (server-to-server) cu `code`, `client_id`, `client_secret` și `redirect_uri` pentru a obține un `access_token` și un `id_token`.
        c. Decodează și validează `id_token`-ul (care este un JWT) pentru a obține datele utilizatorului (ID-ul unic Google (`sub`), email, nume, avatar).
        d. Caută sau creează utilizatorul în baza de date.
        e. Generează JWT-ul specific aplicației SnapJobs.
        f. Setează JWT-ul într-un cookie `httpOnly` și redirecționează utilizatorul la dashboard.

| Cine face ce?   | Eu (Dezvoltator)                                    | AI-ul (Asistent)                                          |
| :-------------- | :-------------------------------------------------- | :-------------------------------------------------------- |
| **Arhitectură** | Înțelegerea și aprobarea fluxului propus de către AI. | Propunerea fluxului optim (Authorization Code) și explicarea lui. |

---

### **2. Configurare Google Cloud Console**

1.  **Creează Proiect**: Dacă nu ai deja unul, creează un proiect nou în [Google Cloud Console](https://console.cloud.google.com/).
2.  **Configurează OAuth Consent Screen**:
    *   Navighează la "APIs & Services" -> "OAuth consent screen".
    *   **User Type**: Selectează **External**.
    *   Completează informațiile: App name (ex: SnapJobs), User support email, logo (opțional).
    *   **Scopes**: Adaugă `.../auth/userinfo.email`, `.../auth/userinfo.profile`, și `openid`. Acestea sunt suficiente.
3.  **Creează Credentials**:
    *   Navighează la "APIs & Services" -> "Credentials" -> "Create Credentials" -> **OAuth client ID**.
    *   **Application type**: Selectează **Web application**.
    *   **Authorized redirect URIs**: Aici este un pas critic. Adaugă URI-urile de callback pentru ambele medii:
        *   **Dezvoltare (DEV)**: `http://localhost:3000/api/auth/google/callback` (presupunând că serverul tău rulează pe portul 3000).
        *   **Producție (PROD)**: `https://api.snapjobs.com/api/auth/google/callback` (înlocuiește cu URL-ul tău real de producție).
4.  **Variabile de Mediu**: După creare, vei primi un **Client ID** și un **Client Secret**. Acestea trebuie adăugate în fișierul `.env` al serverului:
    ```bash
    GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_FROM_GOOGLE"
    GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET_FROM_GOOGLE"
    # Adaugă și adresa principală a backend-ului pentru a construi dinamic redirect_uri
    BACKEND_URL="http://localhost:3000" # Pentru DEV
    # BACKEND_URL="https://api.snapjobs.com" # Pentru PROD
    ```

| Cine face ce?         | Eu (Dezvoltator)                                 | AI-ul (Asistent)                                     |
| :-------------------- | :----------------------------------------------- | :--------------------------------------------------- |
| **Google Console**    | Execuția pașilor în interfața Google. Copierea ID-ului și a Secret-ului. | Listarea exactă a pașilor, scope-urilor și a URI-urilor necesare. |

---

### **3. Modificări în Baza de Date (Prisma)**

1.  **Recomandare**: Modificarea modelului `User` existent este suficientă și mai simplă decât un tabel separat `OAuthAccount` pentru scopul proiectului. Un tabel separat ar fi util dacă ai adăuga 3+ provideri OAuth.
2.  **Modificări `schema.prisma`**: Vom actualiza modelul `User`.
    ```prisma
    // server/prisma/schema.prisma

    model User {
      id          String    @id @default(cuid())
      email       String    @unique
      name        String?
      password    String?   // A devenit opțional
      role        String    @default("STUDENT") // STUDENT sau EMPLOYER
      createdAt   DateTime  @default(now())
      updatedAt   DateTime  @updatedAt

      // Câmpuri noi pentru OAuth
      provider    String    @default("email") // 'email' sau 'google'
      googleId    String?   @unique // ID-ul unic de la Google (câmpul 'sub')

      // Relații existente
      jobs        Job[]
      applications Application[]
    }
    ```
3.  **Reguli de gestiune a utilizatorilor**:
    *   **Caz 1: User Google nou**: Dacă nu există niciun user cu acel `email` sau `googleId`, se creează un user nou cu `provider: 'google'`, `googleId` completat, `role: 'STUDENT'`, iar `password` rămâne `null`.
    *   **Caz 2: User Google existent**: Dacă se găsește un user cu `googleId` corespunzător, se face login direct.
    *   **Caz 3: Email existent (creat cu parolă)**: Dacă există un user cu acel `email` dar `googleId` este `null`, îi vom asocia contul Google. Actualizăm user-ul existent setându-i `googleId` și `provider`. Astfel, conturile se leagă și user-ul poate folosi ambele metode de login.
4.  **Aplică Migrarea**:
    ```bash
    npx prisma migrate dev --name add_google_sso_to_user
    ```

| Cine face ce? | Eu (Dezvoltator)                                | AI-ul (Asistent)                                     |
| :------------ | :---------------------------------------------- | :--------------------------------------------------- |
| **Prisma**    | Rularea comenzii de migrare. Verificarea schemei. | Generarea codului pentru `schema.prisma` și a comenzii de migrare. |

---

### **4. Endpoint-uri Backend (Node.js/Express)**

Vom folosi `passport` și `passport-google-oauth20` pentru a simplifica fluxul.

1.  **Instalare dependențe**:
    ```bash
    npm install passport passport-google-oauth20 express-session
    ```
2.  **Lista endpoint-uri noi** (în `server/routes/authRoutes.js`):
    *   `GET /api/auth/google`: Inițiază procesul de autentificare.
    *   `GET /api/auth/google/callback`: Callback-ul unde Google redirecționează după autentificare.
3.  **Logica de implementare** (în `server/controllers/authController.js` și configurarea `passport` în `server/index.js`):
    *   **Configurare Passport**: Se definește strategia Google, specificând `clientID`, `clientSecret`, `callbackURL` și funcția de verificare care conține logica de find/create user.
    *   **`GET /api/auth/google`**:
        *   **Ce face**: Doar apelează `passport.authenticate('google', { scope: ['profile', 'email'] })`.
        *   **Returnează**: Un redirect 302 către pagina de login Google.
    *   **`GET /api/auth/google/callback`**:
        *   **Ce face**: Este gestionat de `passport.authenticate('google', ...)`. După succes, funcția de callback din strategie este executată. Aici:
            1.  Se primește profilul Google.
            2.  Se aplică logica de find/create/link user din pasul 3.3.
            3.  Se creează JWT-ul aplicației. Payload-ul trebuie să conțină `id`, `email`, `role`.
            4.  Se setează cookie-ul `httpOnly`.
        *   **Returnează**: Un redirect 302 către pagina de dashboard a studentului (ex: `/pages/student/dashboard.html`).
4.  **Protecție CSRF**: Biblioteca `passport` gestionează parametrul `state` automat atunci când este folosită cu sesiuni (`express-session`).

| Cine face ce? | Eu (Dezvoltator)                                         | AI-ul (Asistent)                                              |
| :------------ | :------------------------------------------------------- | :------------------------------------------------------------ |
| **Backend**   | Integrarea codului în structura existentă a proiectului. Debugging. | Generarea completă a codului pentru controllere, rute și configurarea Passport. |

---

### **5. Frontend (Vanilla JS)**

1.  **Buton de Login**: Adaugă în `login.html` și `register.html` un buton.
    ```html
    <a href="/api/auth/google" class="google-login-button">
      <img src="path/to/google_icon.png" alt="Google icon" />
      <span>Sign in with Google</span>
    </a>
    ```
2.  **Flux Frontend**:
    *   Utilizatorul apasă pe link. Browser-ul navighează la `GET /api/auth/google`.
    *   Backend-ul și Google gestionează redirect-urile.
    *   La final, backend-ul redirecționează utilizatorul direct la pagina de dashboard, cu un cookie de autentificare deja setat. Nu mai este necesară nicio logică specială pe frontend pentru a prelua token-ul.
3.  **Securitate `localStorage` vs. `cookie`**:
    *   **Recomandare finală**: **Cookie `httpOnly`**. Deși `localStorage` este mai simplu pentru un proiect de facultate, este vulnerabil la XSS. Implementarea cu cookie-uri este o practică profesională standard și demonstrează o înțelegere superioară a securității web. Backend-ul se va ocupa de setarea lui, deci complexitatea pe frontend este zero.

| Cine face ce? | Eu (Dezvoltator)                                      | AI-ul (Asistent)                |
| :------------ | :---------------------------------------------------- | :------------------------------ |
| **Frontend**  | Crearea stilurilor CSS pentru buton și plasarea lui în pagini. | Generarea snippet-ului HTML pentru buton. |

---

### **6. Integrare Roluri Student/Employer**

1.  **Rol Default**: Orice utilizator nou creat prin Google SSO va avea `role: 'STUDENT'`.
2.  **Upgrade la Employer**: Fluxul existent rămâne neschimbat. Un utilizator autentificat (indiferent de metodă) va putea naviga la o pagină specială unde poate introduce codul secret de angajator. Un endpoint dedicat va valida codul și va actualiza rolul utilizatorului în baza de date.

| Cine face ce? | Eu (Dezvoltator)               | AI-ul (Asistent)                                  |
| :------------ | :----------------------------- | :------------------------------------------------ |
| **Roluri**    | Verificarea fluxului de upgrade. | Confirmarea logicii și a strategiei de implementare. |

---

### **7. Checklist de Testare**

1.  **Happy Path**:
    *   Înregistrarea unui user complet nou cu Google. Verifică crearea în DB și redirect la dashboard.
    *   Login cu un cont Google deja înregistrat.
2.  **Cazuri de Legare Conturi**:
    *   Un user cu cont email+parolă se loghează pentru prima dată cu Google (folosind același email). Verifică dacă `googleId` este adăugat la user-ul existent și login-ul reușește.
3.  **Cazuri de Eroare**:
    *   Utilizatorul anulează fereastra de consimțământ Google. Ar trebui să fie redirecționat la pagina de login cu un mesaj de eroare (opțional).
    *   Testarea eșecului validării `state` (simulare CSRF, mai avansat).
4.  **Autentificare și Autorizare**:
    *   După login cu Google, verifică dacă token-ul (din cookie) este trimis corect la cererile către API-urile protejate.
    *   Verifică dacă payload-ul JWT-ului conține `id`, `role`, `email`.
    *   Testează funcționalitatea de logout.

| Cine face ce? | Eu (Dezvoltator)                           | AI-ul (Asistent)                            |
| :------------ | :----------------------------------------- | :------------------------------------------ |
| **Testare**   | Executarea manuală a scenariilor de test. | Generarea listei complete de cazuri de test. |

---

### **8. Livrabile și Ordine de Implementare**

1.  **Fișiere de modificat/creat**:
    *   `server/prisma/schema.prisma`
    *   `.env` (sau `.env.local`)
    *   `server/index.js` (pentru a inițializa passport și sesiunile)
    *   `server/routes/authRoutes.js`
    *   `server/controllers/authController.js`
    *   `login.html`
    *   `register.html`
2.  **Ordine recomandată**:
    1.  **Pas 1: Configurare Google Cloud**: Obține credentialele.
    2.  **Pas 2: Baza de Date**: Modifică `schema.prisma` și rulează migrarea.
    3.  **Pas 3: Backend**: Instalează dependențele și implementează logica de autentificare (Passport, rute, controllere).
    4.  **Pas 4: Frontend**: Adaugă butonul de login.
    5.  **Pas 5: Testare**: Execută checklist-ul de testare.

---

### **9. Estimare Complexitate și Capcane Comune**

*   **Complexitate Estimată**: **Medie**. Deși pare complex, folosirea unei biblioteci ca `passport` abstractizează multă logică. Principala dificultate stă în configurarea corectă a tuturor părților mobile.
*   **Capcane Comune**:
    1.  **Redirect URI Mismatch**: Cea mai frecventă eroare. URL-ul din Google Console trebuie să fie *identic* cu cel configurat în backend. Atenție la `http` vs `https`, `localhost` vs `127.0.0.1`, și slash-ul de la final (`/`).
    2.  **Variabile de Mediu**: Nu se încarcă corect `GOOGLE_CLIENT_ID` / `SECRET`. Folosește `dotenv` și verifică.
    3.  **Sesiuni și Cookie-uri**: `express-session` trebuie configurat corect, cu un `secret` puternic. În producție, cookie-urile trebuie marcate ca `secure: true`.
    4.  **CORS**: Dacă frontend-ul este servit de pe un alt port/domeniu decât backend-ul, asigură-te că setările CORS de pe server permit trimiterea de `credentials` (cookie-uri).