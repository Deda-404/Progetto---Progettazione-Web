<?php
session_start();
include 'database_connection.php';  // Connessione al database

    $json = file_get_contents('php://input'); // funzione che recupera il body (parametri) dalla richiesta php
    $data = json_decode($json); // conversione del body della richiesta in json

    // Funzione per registrare un nuovo utente
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($data->action)) {
        $action = $data->action;

        if ($action === 'register') {
            $email = $data->email;
            $password = password_hash($data->password, PASSWORD_DEFAULT);
            $nome = $data->nome;
            $cognome = $data->cognome;
            $dataDiNascita = $data->dataDiNascita;

            // Validazione lato server

            // Controllo nome
            if (!preg_match("/^[A-Z][a-z]+$/", $nome)) {
                echo json_encode(['success' => false, 'message' => 'Nome non valido.']);
                exit;
            }

            // Controllo cognome
            if (!preg_match("/^[a-z A-Z\s]+$/", $cognome)) {
                echo json_encode(['success' => false, 'message' => 'Cognome non valido.']);
                exit;
            }

            // Controllo email
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['success' => false, 'message' => 'Email non valida.']);
                exit;
            }

            // Controllo età maggiore di 18 anni
            $oggi = new DateTime();
            $dataNascita = new DateTime($dataDiNascita);
            $eta = $oggi->diff($dataNascita)->y;

            if ($eta < 18) {
                echo json_encode(['success' => false, 'message' => 'Devi avere almeno 18 anni.']);
                exit;
            }

            // Verifica se l'email è già registrata
            $stmt = $db->prepare("SELECT * FROM utenti WHERE email = ?");
            $stmt->execute([$email]);

            if ($stmt->rowCount() === 0) {
                // Inserimento dati
                $stmt = $db->prepare("INSERT INTO utenti (email, password, nome, cognome, dataDiNascita) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$email, $password, $nome, $cognome, $dataDiNascita]);
                echo json_encode(['success' => true, 'message' => 'Registrazione completata con successo']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Email già registrata']);
            }
        }

    // Funzione per il login
    elseif ($action === 'login') {
        $email = $data->email;
        $password = $data->password;

        $stmt = $db->prepare("SELECT * FROM utenti WHERE email = ?");
        $stmt->execute([$email]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            unset($user['password']); // Rimuovi la password per sicurezza
            $_SESSION['user'] = $user;
            echo json_encode(['success' => true, 'utente' => $user, 'message' => 'Login effettuato con successo']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Credenziali non valide']);
        }
    }

    // Funzione per il logout
    elseif ($action === 'logout') {
        session_unset();
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logout effettuato con successo']);
    }
}
?>
