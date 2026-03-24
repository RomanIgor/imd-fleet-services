<?php
// submit.php — IMD Fleet Services form handler

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Sanitize helper
function clean(string $val): string {
    return htmlspecialchars(trim($val), ENT_QUOTES, 'UTF-8');
}

$firma     = clean($_POST['firma']     ?? '');
$name      = clean($_POST['name']      ?? '');
$email     = clean($_POST['email']     ?? '');
$telefon   = clean($_POST['telefon']   ?? '');
$marke     = clean($_POST['marke']     ?? '');
$modell    = clean($_POST['modell']    ?? '');
$baujahr   = clean($_POST['baujahr']   ?? '');
$km        = clean($_POST['km']        ?? '');
$fahrzeuge = clean($_POST['fahrzeuge'] ?? '');
$anmerkung = clean($_POST['anmerkung'] ?? '');
$consent   = clean($_POST['consent']   ?? '');

// Basic validation
if (empty($firma) || empty($name) || empty($telefon)) {
    echo json_encode(['success' => false, 'error' => 'Pflichtfelder fehlen (Firma, Name, Telefon)']);
    exit;
}

if (!empty($email) && !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Ungültige E-Mail-Adresse']);
    exit;
}

$to      = 'info@imd-fleet-services.de';
$subject = '=?UTF-8?B?' . base64_encode('Neue Fahrzeuganmeldung — IMD Fleet Services') . '?=';

$timestamp = date('d.m.Y H:i');
$ip        = $_SERVER['REMOTE_ADDR'] ?? 'unbekannt';

$body = <<<HTML
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 20px; }
  .card { background: #fff; border-radius: 8px; padding: 32px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
  h2 { color: #0052A3; margin: 0 0 24px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 10px 12px; background: #E8F1FB; color: #0052A3; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; border-radius: 4px; }
  td { padding: 10px 12px; border-bottom: 1px solid #ECF1F8; font-size: 14px; color: #09152A; vertical-align: top; }
  td.label { width: 38%; font-weight: 600; color: #2E4666; }
  .section-head { background: #0052A3; color: #fff; padding: 8px 12px; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; margin-top: 16px; border-radius: 4px 4px 0 0; }
  .footer { margin-top: 24px; font-size: 12px; color: #8899B4; border-top: 1px solid #DDE6F0; padding-top: 12px; }
</style>
</head>
<body>
<div class="card">
  <h2>Neue Fahrzeuganmeldung</h2>
  <p style="color:#536E94;font-size:13px;margin-bottom:20px">Eingegangen am {$timestamp} &bull; IP: {$ip}</p>

  <div class="section-head">Unternehmen &amp; Kontakt</div>
  <table>
    <tr><td class="label">Firma</td><td>{$firma}</td></tr>
    <tr><td class="label">Ansprechpartner</td><td>{$name}</td></tr>
    <tr><td class="label">Telefon</td><td>{$telefon}</td></tr>
    <tr><td class="label">E-Mail</td><td>{$email}</td></tr>
  </table>

  <div class="section-head">Fahrzeugdaten</div>
  <table>
    <tr><td class="label">Marke</td><td>{$marke}</td></tr>
    <tr><td class="label">Modell</td><td>{$modell}</td></tr>
    <tr><td class="label">Baujahr</td><td>{$baujahr}</td></tr>
    <tr><td class="label">Kilometerstand</td><td>{$km} km</td></tr>
    <tr><td class="label">Anzahl Fahrzeuge</td><td>{$fahrzeuge}</td></tr>
  </table>

  <div class="section-head">Hinweise</div>
  <table>
    <tr><td class="label">Anmerkung</td><td>{$anmerkung}</td></tr>
    <tr><td class="label">Zustimmung</td><td>Ja</td></tr>
  </table>

  <div class="footer">Diese E-Mail wurde automatisch durch das Kontaktformular auf der IMD-Fleet-Services-Website generiert.</div>
</div>
</body>
</html>
HTML;

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: =?UTF-8?B?" . base64_encode('IMD Fleet Services Website') . "?= <noreply@imd-fleet-services.de>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true]);
} else {
    error_log('IMD submit.php: mail() returned false for submission from ' . $ip);
    echo json_encode(['success' => false, 'error' => 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.']);
}
