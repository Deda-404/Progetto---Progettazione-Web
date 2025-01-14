<?php
session_start();
include 'database_connection.php';  // Connessione al database

header('Content-Type: application/json'); // Imposta la risposta come JSON per tutte le risposte

    $json = file_get_contents('php://input'); // funzione che recupera il body (parametri) dalla richiesta php
    $data = json_decode($json); // conversione del body della richiesta in json


// Funzione per ottenere il menù settimanale completo
function getMenuSettimanale() {
    global $db;
    $stmt = $db->query("SELECT * FROM menu_settimanale");
    $menu = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $menu[$row['giorno']] = [
            'primi' => explode(', ', $row['primi']),
            'secondi' => explode(', ', $row['secondi']),
            'contorni' => explode(', ', $row['contorni']),
            'dolce' => $row['dolce'],
            'frutta' => $row['frutta']
        ];
    }
    return $menu;
}

// Funzione per ottenere il menu di un singolo giorno
function getMenuDelGiorno($giorno) {
    global $db;
    $stmt = $db->prepare("SELECT * FROM menu_settimanale WHERE giorno = ?");
    $stmt->execute([$giorno]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($row) {
        return [
            'success' => true,
            'menu' => [
                'primi' => explode(', ', $row['primi']),
                'secondi' => explode(', ', $row['secondi']),
                'contorni' => explode(', ', $row['contorni']),
                'dolce' => $row['dolce'],
                'frutta' => $row['frutta']
            ]
        ];
    } else {
        return ['success' => false, 'message' => 'Menu non trovato per il giorno selezionato.'];
    }
}

// Funzioni per modifica menù (Solo Admin) ---------------------------------------------------------------------------------------------------------------------------------------

// Funzione per aggiornare il menù di un giorno specifico
function updateMenu($giorno, $primi, $secondi, $contorni, $dolce, $frutta) {
    global $db;
    $stmt = $db->prepare("UPDATE menu_settimanale SET primi = ?, secondi = ?, contorni = ?, dolce = ?, frutta = ? WHERE giorno = ?");
    return $stmt->execute([$primi, $secondi, $contorni, $dolce, $frutta, $giorno]);
}

// Logica per gestire le richieste
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($data->action)) {
    $action = $data->action;

    // Caricamento dell'intero menu settimanale
    if ($action === 'load') {
        echo json_encode(getMenuSettimanale());
    }
    // Caricamento del menu di un singolo giorno
    elseif ($action === 'loadDaily' && !empty($data->giorno)) {
        $giorno = $data->giorno;
        echo json_encode(getMenuDelGiorno($giorno));
    }
    // Modifica del menù da parte dell'admin
    elseif ($action === 'update' && isset($_SESSION['user']) && $_SESSION['user']['ruolo'] === 'admin') {
        $giorno = $data->giorno;
        $primi = $data->primi;
        $secondi = $data->secondi;
        $contorni = $data->contorni;
        $dolce = $data->dolce;
        $frutta = $data->frutta;

        if (updateMenu($giorno, $primi, $secondi, $contorni, $dolce, $frutta)) {
            echo json_encode(['success' => true, 'message' => 'Menù aggiornato con successo']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Errore nell\'aggiornamento del menù']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Azione non valida o giorno non specificato']);
    }
}
?>
