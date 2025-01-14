<?php
session_start();
include 'database_connection.php';

header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json);

// Controlla l'azione specificata
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($data->action)) {
    // Carica il menu giornaliero
    if ($data->action === 'loadDaily') {
        if (!isset($data->giorno)) {
            echo json_encode(['success' => false, 'message' => 'Giorno non specificato']);
            exit;
        }

        $giorno = $data->giorno;

        // Recupera il menu giornaliero dal database
        $query = $db->prepare("SELECT * FROM menu_settimanale WHERE giorno = ?");
        $query->execute([$giorno]);
        $menu = $query->fetch(PDO::FETCH_ASSOC);

        if ($menu) {
            echo json_encode([
                'success' => true,
                'menu' => [
                    'primi' => explode(', ', $menu['primi']),
                    'secondi' => explode(', ', $menu['secondi']),
                    'contorni' => explode(', ', $menu['contorni']),
                    'dolce' => $menu['dolce'],
                    'frutta' => $menu['frutta']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Menu non trovato per il giorno selezionato']);
        }
        exit;
    }

    // Inserisce un nuovo ordine
    if ($data->action === 'submit') {
        if (!isset($_SESSION['user'])) {
            echo json_encode(['success' => false, 'message' => 'Devi essere loggato per effettuare un ordine']);
            exit;
        }

        $utente_id = $_SESSION['user']['id'];
        $giorno = $data->giorno ?? null;
        $primo = $data->primo ?? null;
        $secondo = $data->secondo ?? null;
        $contorno = $data->contorno ?? null;
        $frutta = $data->frutta ?? null;
        $dolce = $data->dolce ?? null;
        $contenuto = implode(', ', array_filter([$primo, $secondo, $contorno, $frutta, $dolce]));

        if (!$primo || !$secondo || !$contorno) {
            echo json_encode(['success' => false, 'message' => 'Una selezione per i piatti principali è obbligatoria']);
            exit;
        }

        $query = $db->prepare("INSERT INTO ordini (utente_id, contenuto) VALUES (?, ?)");
        if ($query->execute([$utente_id, $contenuto])) {
            echo json_encode(['success' => true, 'message' => 'Ordine registrato con successo']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Errore durante la registrazione dell\'ordine']);
        }
        exit;
    }

    // Visualizza gli ordini dell'utente
    if ($data->action === 'viewUserOrders') {
        if (!isset($_SESSION['user'])) {
            echo json_encode(['success' => false, 'message' => 'Devi essere loggato per visualizzare i tuoi ordini']);
            exit;
        }

        $utente_id = $_SESSION['user']['id'];
        $query = $db->prepare("SELECT ordini.*, nome, cognome FROM ordini JOIN utenti ON utenti.id = utente_id WHERE utente_id = ? ORDER BY data DESC");
        $query->execute([$utente_id]);
        $ordini = $query->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'ordini' => $ordini]);
        exit;
    }

    // Visualizza tutti gli ordini (solo admin)
    if ($data->action === 'viewAllOrders') {
        if (!isset($_SESSION['user']) || $_SESSION['user']['ruolo'] !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Accesso negato']);
            exit;
        }

        $query = $db->prepare("SELECT o.*, u.nome , u.cognome FROM ordini o JOIN utenti u ON o.utente_id = u.id ORDER BY o.data DESC");
        $query->execute();
        $ordini = $query->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'ordini' => $ordini]);
        exit;
    }
}

// Risposta di default in caso di richiesta non valida
echo json_encode(['success' => false, 'message' => 'Richiesta non valida']);
exit;
?>
