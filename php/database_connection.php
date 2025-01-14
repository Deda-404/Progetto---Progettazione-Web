<?php
// Configurazione della connessione al database
$host = 'localhost';
$dbname = 'dedato_635256';
$username = 'root';
$password = '';

try {
    // Creazione dell'oggetto PDO per la connessione
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    // Gestione dell'errore di connessione
    echo 'Errore di connessione: ' . $e->getMessage();
    exit;
}

?>
