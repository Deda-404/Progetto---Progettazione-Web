<?php
session_start();
include 'database_connection.php';

header('Content-Type: application/json'); // Imposta il tipo di contenuto come JSON

    $json = file_get_contents('php://input'); // funzione che recupera il body (parametri) dalla richiesta php
    $data = json_decode($json); // conversione del body della richiesta in json


// Verifica la sessione dell'utente
if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Devi essere loggato per accedere ai messaggi']);
    exit;
}

$action = $data->action ?? $_GET['action'] ?? null;
$user = $_SESSION['user'];

if ($action === 'submit') {

    // Invio del messaggio
    $messaggio = urldecode($data->messaggio ?? '');

    if (empty($messaggio)) {
        echo json_encode(['success' => false, 'message' => 'Messaggio vuoto']);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO messaggi (utente_id, messaggio) VALUES (?, ?)");
    $stmt->execute([$user['id'], $messaggio]);

    echo json_encode(['success' => true, 'message' => 'Messaggio inviato con successo']);
    exit;
}

if ($action === 'view') {
    // Visualizzazione dei messaggi
    try {
        if ($user['ruolo'] === 'admin') {
            $stmt = $db->query("SELECT utenti.id AS utente_id, utenti.nome, utenti.ruolo, utenti.email, messaggi.messaggio, messaggi.data
                                FROM messaggi
                                JOIN utenti ON messaggi.utente_id = utenti.id
                                ORDER BY messaggi.data DESC");
        } else {
            $stmt = $db->prepare("SELECT utenti.id AS utente_id, utenti.nome, utenti.ruolo, messaggi.messaggio, messaggi.data 
                                  FROM messaggi 
                                  JOIN utenti ON messaggi.utente_id = utenti.id
                                  WHERE messaggi.utente_id = ? 
                                  ORDER BY messaggi.data DESC");
            $stmt->execute([$user['id']]);
        }

        $messaggi = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Log temporaneo per debug
        if (empty($messaggi)) {
            echo json_encode(['success' => true, 'messaggi' => [], 'message' => 'Nessun messaggio trovato']);
        } else {
            echo json_encode(['success' => true, 'messaggi' => $messaggi]);
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Errore nel recupero dei messaggi: ' . $e->getMessage()]);
    }
    exit;
}

// Richiesta non valida
echo json_encode(['success' => false, 'message' => 'Azione non valida']);
exit;
