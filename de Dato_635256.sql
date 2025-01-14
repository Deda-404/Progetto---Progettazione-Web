-- Creazione del database se non esiste
CREATE DATABASE IF NOT EXISTS dedato_635256;

-- Selezione del database da utilizzare
USE dedato_635256;

-- Creazione della tabella 'utenti' per gestire le informazioni degli utenti
CREATE TABLE IF NOT EXISTS utenti (
    id INT AUTO_INCREMENT PRIMARY KEY,       -- Identificatore unico per ciascun utente
    email VARCHAR(255) UNIQUE NOT NULL,      -- Email dell'utente, unica e non nulla
    password VARCHAR(255) NOT NULL,          -- Password dell'utente, non nulla
    nome VARCHAR(100) NOT NULL,              -- Nome dell'utente, non nullo
    cognome VARCHAR(100) NOT NULL,           -- Cognome dell'utente, non nullo
    dataDiNascita DATE,                    -- Data di nascita dell'utente
    ruolo ENUM('user', 'admin') DEFAULT 'user', -- Ruolo dell'utente, 'user' per default
    saldo DECIMAL(10, 2) DEFAULT 0.00        -- Saldo dell'utente, di default 0.00
);


-- Inserimento dell'utente admin di default nella tabella 'utenti'
INSERT INTO utenti (email, password, nome, cognome, ruolo, saldo)
VALUES ('admin@mensa.com', '$2b$12$70mL9gRml94j4ruOKLBFauo.EmdJDKoXo1ujRaZs1UIqqOytnYHnW', 'Admin', 'Admin', 'admin', 1000.00);


-- Creazione della tabella 'ordini' per gestire gli ordini degli utenti
CREATE TABLE IF NOT EXISTS ordini (
    id INT AUTO_INCREMENT PRIMARY KEY,       -- Identificatore unico per ciascun ordine
    utente_id INT NOT NULL,                  -- ID dell'utente che ha effettuato l'ordine
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data e ora dell'ordine
    contenuto TEXT NOT NULL,                 -- Contenuto dell'ordine
    FOREIGN KEY (utente_id) REFERENCES utenti(id) ON DELETE CASCADE -- Relazione con la tabella 'utenti'
);

-- Creazione della tabella 'messaggi' per gestire i messaggi inviati dagli utenti
CREATE TABLE IF NOT EXISTS messaggi (
    id INT AUTO_INCREMENT PRIMARY KEY,       -- Identificatore unico per ciascun messaggio
    utente_id INT NOT NULL,                  -- ID dell'utente che ha inviato il messaggio
    messaggio TEXT NOT NULL,                 -- Testo del messaggio
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data e ora del messaggio
    FOREIGN KEY (utente_id) REFERENCES utenti(id) ON DELETE CASCADE -- Relazione con la tabella 'utenti'
);

-- Creazione della tabella 'menu_settimanale' per gestire il menù settimanale
CREATE TABLE IF NOT EXISTS menu_settimanale (
    id INT AUTO_INCREMENT PRIMARY KEY,       -- Identificatore unico per ciascun giorno del menù
    giorno VARCHAR(20) NOT NULL UNIQUE,      -- Giorno della settimana, deve essere unico
    primi TEXT NOT NULL,                     -- Portate di primi piatti
    secondi TEXT NOT NULL,                   -- Portate di secondi piatti
    contorni TEXT NOT NULL,                  -- Contorni disponibili
    dolce VARCHAR(50),                       -- Dolce del giorno
    frutta VARCHAR(50)                       -- Frutta del giorno
);


-- Inserimento del menù settimanale pre-impostato
INSERT INTO menu_settimanale (giorno, primi, secondi, contorni, dolce, frutta)
VALUES
    ('lunedì', 'Pasta al Pomodoro, Risotto ai Funghi', 'Pollo alla Griglia, Filetto di Maiale', 'Insalata Mista, Patate al Forno', 'Torta al Cioccolato', 'Mela'),

    ('martedì', 'Lasagne, Penne al Arrabbiata', 'Bistecca di Manzo, Pesce al Forno', 'Verdure Grigliate, Purea di Patate', 'Crostata', 'Banana'),

    ('mercoledì', 'Gnocchi al Pesto, Spaghetti alla Carbonara', 'Braciola di Maiale, Salmone al Vapore', 'Zucchine Fritte, Spinaci Saltati', 'Mousse al Cioccolato', 'Arancia'),
    
    ('giovedì', 'Pasta alla Norma, Ravioli al Burro e Salvia', 'Petto di Tacchino, Tonno alla Griglia', 'Fagiolini Lessi, Patate Arrosto', 'Tiramisù', 'Pera'),
    
    ('venerdì', 'Risotto allo Zafferano, Tagliatelle ai Funghi', 'Polpette al Sugo, Orata al Forno', 'Carote al Vapore, Cavolfiore Gratinato', 'Panna Cotta', 'Ananas'),
    
    ('sabato', 'Orecchiette al Ragù, Riso al Curry', 'Spezzatino di Vitello, Branzino al Limone', 'Broccoli Saltati, Melanzane alla Parmigiana', 'Gelato', 'Fragole'),
    
    ('domenica', 'Spaghetti al Ragù, Farfalle al Pesto', 'Arrosto di Maiale, Merluzzo Impanato', 'Patate Fritte, Peperoni Arrostiti', 'Zuppa Inglese', 'Pesca');