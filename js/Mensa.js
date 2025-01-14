// Oggetto per memorizzare i dati dell'utente loggato
let profiloUtente = {};
let menuSettimana = {};

// Funzione che gestisce richieste -------------------------------------------------------------------------------------------------------------------

// Funzione generica per inviare richieste al server 
async function inviaRichiesta(url, params) {
    // restituisce la PROMISE di una fetch
    // (bisogna quindi fare il .then per prendere il risultato effettivo)

    return fetch(url, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: params
    })
    .then((response) => response.json()) // converte la risposta da testo a json
}

// Funzione che gestisce visibiltà -------------------------------------------------------------------------------------------------------------------

// Funzione per nascondere tutte le sezioni
function nascondiTutteSezioni() {
    document.querySelectorAll(".section").forEach(sezione => {
        sezione.classList.add("hidden");
        sezione.style.display = "none"; // Nasconde tutte le sezioni
    });
}

// Funzione per mostrare solo la sezione richiesta
function mostraSezione(idSezione) {
    nascondiTutteSezioni();

    const sezione = document.getElementById(idSezione);
    if (sezione) {
        sezione.classList.remove("hidden");
        sezione.style.display = "block"; // Mostra la sezione richiesta
    } else {
        console.error(`Sezione con ID '${idSezione}' non trovata.`);
    }

    // Contolla se lutente è user e siamo sulla funzione ordineGiornoSection
    if (profiloUtente.ruolo === "user" || "admin" && idSezione === "ordineGiornoSection") {
        const storicoOrdiniSection = document.getElementById("storicoOrdiniSection");
        storicoOrdiniSection.classList.remove("hidden");
        storicoOrdiniSection.style.display = "block"; // Mostra impostando block
    }

    // Contolla se lutente è user e siamo sulla funzione ordineGiornoSection
    if (profiloUtente.ruolo === "admin" && idSezione === "ordineGiornoSection") {
        const ordiniAdminSection = document.getElementById("ordiniAdminSection");
        ordiniAdminSection.classList.remove("hidden");
        ordiniAdminSection.style.display = "block"; // Mostra impostand block
    }

    // Controlla se l'utente è admin e se è la sezione "profileSection"
    if (profiloUtente.ruolo === "admin" && idSezione === "profileSection") {
        const messaggiSection = document.getElementById("messaggiSection");
        messaggiSection.classList.remove("hidden");
        messaggiSection.style.display = "block"; // Mostra sempre messaggiSection per l'admin
    }

    // Controlla se l'utente è admin e se è la sezione "menuSettimanaSection"
    if (profiloUtente.ruolo === "admin" && idSezione === "menuSettimanaSection") {
        const menuEditSection = document.getElementById("menuEditSection");
        menuEditSection.classList.remove("hidden");
        menuEditSection.style.display = "block"; // Mostra sempre  menuEditSection per l'admin
    }

}

// Funzione che gestisce visibilità -------------------------------------------------------------------------------------------------------------------


// Funzione per registrazione con validazione
function registrati() {
    const nome = document.getElementById("registerNome").value;
    const cognome = document.getElementById("registerCognome").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const dataDiNascita = document.getElementById("registerDataDiNascita").value || ""; 

    // Validazione dei campi
    if (!validateForm(nome, cognome, email, dataDiNascita)) {
        return; // Blocca la registrazione se la validazione fallisce
    }

    const params = {
        'action': 'register',
        'nome': nome,
        'cognome': cognome,
        'email': email,
        'password': password,
        'dataDiNascita': dataDiNascita
    }

    // Invio della richiesta di registrazione
    inviaRichiesta("../php/auth.php", JSON.stringify(params)).then(risposta => {
        if (risposta.success) {
            alert("Registrazione completata. Ora puoi accedere.");
            mostraSezione("loginSection");
        } else {
            alert("Errore nella registrazione: " + risposta.message);
        }
    });
}

// Funzione per la validazione del form
function validateForm(nome, cognome, email, dataDiNascita) {

    // Controllo del nome
    const nomeRegex = /^[A-Z][a-z]+$/;
    if (!nomeRegex.test(nome)) {
        alert("Il nome deve iniziare con una lettera maiuscola e può contenere solo lettere.");
        return false;
    }

    // Controllo del cognome
    const cognomeRegex = /^[a-zA-Z\s]+$/;
    if (!cognomeRegex.test(cognome)) {
        alert("Il cognome può contenere solo lettere e spazzi se necessari.");
        return false;
    }

    // Controllo email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("L'email non è valida, utilizza un formato: email@esempio.it .");
        return false;
    }

    // Controllo data di nascita
    const oggi = new Date();
    const dataNascita = new Date(dataDiNascita);
    const maggioreEta = new Date(oggi.getFullYear() - 18, oggi.getMonth(), oggi.getDate());
    if (dataNascita > maggioreEta) {
        alert("Devi avere almeno 18 anni per creare un profilo.");
        return false;
    }

    return true;
}



// LogIn & LogOut ----------------------------------------------------------------------------------------------------------------------------

// Funzione per gestire Login e Logout
function gestisciLoginLogout() {
    if (profiloUtente && profiloUtente.email) {
        esci();
    } else {
        mostraSezione("loginSection");
    }
}

// Funzione per il login
function accedi() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const params = {
        'action': 'login',
        'email': email,
        'password': password
    }

    // richiesta POST con credenziali
    inviaRichiesta("../php/auth.php", JSON.stringify(params)).then(risposta => {
        if (risposta.success) {  // Usare "success" come chiave
            profiloUtente = risposta.utente;  // Assicura che venga assegnato a "profiloUtente"
            aggiornaBottoneLoginLogout();
            popolaProfiloUtente(); // Carica i dati del profilo
            caricaMessaggiUtente(); // Carica i messaggi all'accesso
            caricaOrdini();
            mostraSezione("homeSection");
        } else {
            alert("Errore nel login: " + risposta.message);
        }
    })
}

// Aggiorna il pulsante di login/logout in base allo stato dell'utente
function aggiornaBottoneLoginLogout() {
    const bottoneLoginLogout = document.getElementById("loginLogoutButton");
    bottoneLoginLogout.textContent = profiloUtente && profiloUtente.email ? "Logout" : "Login";
}

function esci() {

    const params = {
        'action' : 'logout',
    }

    inviaRichiesta("../php/auth.php", JSON.stringify(params)).then(risposta => {
        if (risposta.success) {
            profiloUtente = {};
            svuotaProfiloUtente(); // Pulisce i dati del profilo e i messaggi
            clearForms(); // Pulisce i campi di input di login e registrazione
            aggiornaBottoneLoginLogout();
            mostraSezione("loginSection"); // Mostra sezione di login al logout
            alert("Logout effettuato.");
        } else {
            alert("Errore nel logout.");
        }
    });
}

// Funzione per pulire i campi di input di login e registrazione
function clearForms() {
    // Pulisce i campi di input nella sezione di login
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';

    // Pulisce i campi di input nella sezione di registrazione
    document.getElementById('registerNome').value = '';
    document.getElementById('registerCognome').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerDataDiNascita').value = '';
}

// Aggiorna il pulsante di login/logout in base allo stato dell'utente
function aggiornaBottoneLoginLogout() {
    const bottoneLoginLogout = document.getElementById("loginLogoutButton");
    bottoneLoginLogout.textContent = profiloUtente.email ? "Logout" : "Login";
}


// ----------------------------------------------------------------------------------------------------------------------------



// Popola i dati del profilo
function popolaProfiloUtente() {
    document.getElementById("nome").textContent = profiloUtente.nome || "";
    document.getElementById("cognome").textContent = profiloUtente.cognome || "";
    document.getElementById("dataDiNascita").textContent = profiloUtente.dataDiNascita || "";
    document.getElementById("email").textContent = profiloUtente.email || "";
    document.getElementById("saldo").textContent = profiloUtente.saldo || "";
}


function svuotaProfiloUtente() {
    ["nome", "cognome", "dataDiNascita", "email", "saldo"].forEach(id => {
        document.getElementById(id).textContent = "";
    });

    // Pulisci i contenitori dei messaggi
    document.getElementById("storicoMessaggi").innerHTML = ""; 
    document.getElementById("messaggiList").innerHTML = "";
}

// Funzioni di gestione del Menu -----------------------------------------------------------------------------------------------------------------

// Carica il menù settimanale dal server
function caricaMenuSettimana() {

    const params = {
        'action' : 'load',
    }

    inviaRichiesta("../php/menu.php", JSON.stringify(params)).then(risposta => {
        menuSettimana = risposta;
        renderizzaMenuSettimana();
    });
}


// Visualizza il menù settimanale
function renderizzaMenuSettimana() {
    const contenutoMenu = document.getElementById("menuSettimanaContent");
    contenutoMenu.innerHTML = "";

    Object.keys(menuSettimana).forEach(giorno => {
        const giornoDiv = document.createElement("div");
        giornoDiv.classList.add("menu-giorno");

        giornoDiv.innerHTML = `
            <h3>${giorno.charAt(0).toUpperCase() + giorno.slice(1)}</h3>
            <ul>
                <li><strong>Primi:</strong> ${menuSettimana[giorno].primi.join(", ")}</li>
                <li><strong>Secondi:</strong> ${menuSettimana[giorno].secondi.join(", ")}</li>
                <li><strong>Contorni:</strong> ${menuSettimana[giorno].contorni.join(", ")}</li>
            </ul>
            <p><strong>Dolce:</strong> ${menuSettimana[giorno].dolce}, <strong>Frutta:</strong> ${menuSettimana[giorno].frutta}</p>
        `;
        contenutoMenu.appendChild(giornoDiv);
    });
}


function salvaModificheMenu() {
    const giorno = document.getElementById("giorno").value;
    const primi = document.getElementById("primi").value;
    const secondi = document.getElementById("secondi").value;
    const contorni = document.getElementById("contorni").value;
    const dolce = document.getElementById("dolce").value;
    const frutta = document.getElementById("frutta").value;

    // Dati da inviare
    const params = {
        'action': 'update',
        'giorno': giorno,
        'primi': primi,
        'secondi': secondi ,
        'contorni': contorni,
        'dolce': dolce,
        'frutta': frutta
    }

    inviaRichiesta("../php/menu.php", JSON.stringify(params)).then(risposta => {
        if (risposta.success) {
            alert("Menù aggiornato con successo.");
            caricaMenuSettimana(); // Ricarica il menù aggiornato

            // Ripulisce i campi di input dopo l'aggiornamento
            document.getElementById("giorno").value = "lunedi"; // Reimposta al primo giorno
            document.getElementById("primi").value = "";
            document.getElementById("secondi").value = "";
            document.getElementById("contorni").value = "";
            document.getElementById("dolce").value = "";
            document.getElementById("frutta").value = "";
        } else {
            alert("Errore nell'aggiornamento del menù.");
        }
    });
}



// Funzioni di gestione del Menu -----------------------------------------------------------------------------------------------------------------



// Funzione per Gestione caricamento Ordini e Menu per ordini--------------------------------------------------------------------------------------------

function caricaMenuGiorno(giornoSelezionato) {
    if (!giornoSelezionato) {
        return;
    }

    const params ={
        'action':'loadDaily',
        'giorno' : giornoSelezionato
    }

    inviaRichiesta('../php/menu.php', JSON.stringify(params)).then(data => {
        if (data.success && data.menu) {
            const menuGiornaliero = data.menu;

            const ordineContent = document.getElementById("ordineContent");
            let ordineHTML = `
                <h3>Menu del giorno: ${giornoSelezionato}</h3>
                <label>Primo:</label>
                <select id="primoChoice">
                    <option value="">Seleziona un primo</option>
                    ${menuGiornaliero.primi.map(primo => `<option value="${primo}">${primo}</option>`).join('')}
                    <option value="Primo:Nulla">Nessun Piatto</option>
                </select>

                <label>Secondo:</label>
                <select id="secondoChoice">
                    <option value="">Seleziona un secondo</option>
                    ${menuGiornaliero.secondi.map(secondo => `<option value="${secondo}">${secondo}</option>`).join('')}
                    <option value="Secondo:Nulla">Nessun Piatto</option>
                </select>

                <label>Contorno:</label>
                <select id="contornoChoice">
                    <option value="">Seleziona un contorno</option>
                    ${menuGiornaliero.contorni.map(contorno => `<option value="${contorno}">${contorno}</option>`).join('')}
                    <option value="Contorno:Nulla">Nessun Piatto</option>
                </select>
                <br><br>

                <label>Frutta:</label>
                <input type="checkbox" id="fruttaChoice" value="${menuGiornaliero.frutta}"> ${menuGiornaliero.frutta}
                <br><br>

                <label>Dolce:</label>
                <input type="checkbox" id="dolceChoice" value="${menuGiornaliero.dolce}"> ${menuGiornaliero.dolce}
                <br><br>

                <button onclick="inviaOrdine()">Invia Ordine</button>
            `;

            ordineContent.innerHTML = ordineHTML;
            ordineContent.classList.remove("hidden");
        } else {
            alert(data.message || "Menu non trovato per il giorno selezionato.");
        }
    })

}

function inviaOrdine() {
    const primoScelto = document.getElementById("primoChoice").value;
    const secondoScelto = document.getElementById("secondoChoice").value;
    const contornoScelto = document.getElementById("contornoChoice").value;
    const fruttaScelta = document.getElementById("fruttaChoice").checked ? document.getElementById("fruttaChoice").value : "";
    const dolceScelto = document.getElementById("dolceChoice").checked ? document.getElementById("dolceChoice").value : "";

    if (!primoScelto || !secondoScelto || !contornoScelto) {
        alert("Per favore, seleziona un'opzione per primo, secondo e contorno.");
        return;
    }

    const params = {
        'action' : 'submit',
        'primo': primoScelto,
        'secondo': secondoScelto,
        'contorno': contornoScelto,
        'frutta': fruttaScelta,
        'dolce': dolceScelto
    };

    inviaRichiesta('../php/ordini.php', JSON.stringify(params)).then(data => {
        if (data.success) {
            alert(data.message);
            document.getElementById("ordineContent").innerHTML = "";
            caricaOrdini();
        } else {
            alert(data.message);
        }
    })

}

// Carica gli ordini dell'utente o di tutti gli utenti (per admin)
function caricaOrdini() {

    const params = {
        action: profiloUtente.ruolo === 'admin' ? 'viewAllOrders' : 'viewUserOrders'
    };

    inviaRichiesta('../php/ordini.php', JSON.stringify(params)).then(data => {

        const storicoOrdini = document.getElementById("storicoOrdini");
        const ordiniAdmin = document.getElementById("ordiniAdmin");

        storicoOrdini.innerHTML = "";
        ordiniAdmin.innerHTML = "";

        if (data.success) {
            let htmlOrdiniUtente = "";
            let htmlOrdiniAdmin = "";

            data.ordini.forEach(ordine => {
                const ordineHtml = `
                    <div class="ordine">
                        <p><strong>Nome:</strong> ${ordine.nome + ' ' + ordine.cognome}</p>
                        <p><strong>Data Ordinazione:</strong> ${new Date(ordine.data).toLocaleString()}</p>
                        <p><strong>Piatti:</strong> ${ordine.contenuto}</p>
                    </div><hr>
                `;

                if (profiloUtente.ruolo === 'admin') {
                    if (ordine.utente_id === profiloUtente.id) {
                        htmlOrdiniUtente += ordineHtml;
                    } else {
                        htmlOrdiniAdmin += ordineHtml;
                    }
                } else {
                    htmlOrdiniUtente += ordineHtml;
                }
            });

            storicoOrdini.innerHTML = htmlOrdiniUtente || "<p>Nessun ordine trovato</p>";

            if (profiloUtente.ruolo === 'admin') {
                ordiniAdmin.innerHTML = htmlOrdiniAdmin || "<p>Nessun ordine per altri utenti</p>";
            }
        } else {
            storicoOrdini.innerHTML = `<p>${data.message}</p>`;
        }
    });
}

// Funzione per Gestione caricamento Ordini e Menu per ordini--------------------------------------------------------------------------------------------



// Invio messaggi e Visualizzazione --------------------------------------------------------------------------------------------------------------------

function caricaMessaggiUtente() {
  
    const storicoMessaggi = document.getElementById("storicoMessaggi");
    const messaggiUtenti = document.getElementById("messaggiList");

    const params={
        'action':'view'
    }

    // Richiesta per ottenere i messaggi
    inviaRichiesta("../php/messaggi.php", JSON.stringify(params)).then(risposta => {
        console.log(risposta);  // Debug: verifica la risposta del server

        storicoMessaggi.innerHTML = ""; // Pulisce lo storico messaggi per tutti
        messaggiUtenti.innerHTML = ""; // Pulisce anche il contenitore messaggi utenti

        if (risposta.success) {
            let htmlStorico = "";
            let htmlAdmin = "";

            if (risposta.messaggi.length > 0) {
                risposta.messaggi.forEach(messaggio => {
                    const messaggioHtml = `<div class="messaggio">
                        <p><strong>Nome Utente: </strong> ${messaggio.nome}</p>
                        <p><strong>Ordine effetuato: </strong> ${messaggio.messaggio}</p>
                        <p><strong>Data invio ordine: </strong> ${new Date(messaggio.data).toLocaleString()}</p>
                    </div><hr>`;

                    // Distingue i messaggi per ruolo
                    if (profiloUtente.ruolo === "admin" && messaggio.ruolo === "user") {
                        htmlAdmin += messaggioHtml; // Aggiungi ai messaggi utenti
                    } else if (profiloUtente.ruolo === "admin" && messaggio.ruolo === "admin") {
                        htmlStorico += messaggioHtml; // Aggiungi ai messaggi admin
                    } else if (profiloUtente.ruolo === "user" && messaggio.utente_id === profiloUtente.id) {
                        htmlStorico += messaggioHtml; // Aggiungi ai messaggi dell'utente
                    }
                });
            } else {
                htmlStorico = "<p>Nessun messaggio disponibile</p>";
                if (profiloUtente.ruolo === "admin") {
                    htmlAdmin = "<p>Nessun messaggio disponibile</p>";
                }
            }

            // Aggiorna contenitori
            storicoMessaggi.innerHTML = htmlStorico;
            if (profiloUtente.ruolo === "admin") {
                messaggiUtenti.innerHTML = htmlAdmin;
            }
        } else {
            // Gestione errore
            storicoMessaggi.innerHTML = `<p>${risposta.message}</p>`;
            if (profiloUtente.ruolo === "admin") {
                messaggiUtenti.innerHTML = `<p>${risposta.message}</p>`;
            }
        }
    });
}

function inviaMessaggio() {
    const messaggio = document.getElementById("valutazione").value; // Cambiato ID a "valutazione"

    // Controllo che il messaggio non sia vuoto
    if (messaggio.trim() === "") {
        alert("Il messaggio non può essere vuoto!");
        return;
    }

    const params={
        'action' : 'submit',
        'messaggio' : encodeURIComponent(messaggio)
    }

    // Invia la richiesta al server per salvare il messaggio
    inviaRichiesta("../php/messaggi.php", JSON.stringify(params)).then(risposta => {
        if (risposta.success) {
            alert("Messaggio inviato con successo!");
            document.getElementById("valutazione").value = ""; // Ripulisce il campo di input
            caricaMessaggiUtente();
        } else {
            alert("Errore nell'invio del messaggio: " + risposta.message);
        }
    });
}


// Invio messaggi e Visualizzazione --------------------------------------------------------------------------------------------------------------------



// Aggiorna l'inizializzazione del contenuto
document.addEventListener("DOMContentLoaded", function () {
    aggiornaBottoneLoginLogout();
    caricaMenuSettimana();
});
