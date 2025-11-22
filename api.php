<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

$file = 'data.json';

// Default Data Structure
$defaultData = [
    "shopName" => "Mero Digital Pasal", 
    "customers" => [], 
    "expenses" => [],
    "version" => 3.0
];

// GET REQUEST
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $data = json_decode($content, true);
        
        // If file is empty or JSON is invalid, return default
        if ($data === null) {
            echo json_encode($defaultData);
        } else {
            echo $content;
        }
    } else {
        // Create file if it doesn't exist
        file_put_contents($file, json_encode($defaultData));
        echo json_encode($defaultData);
    }
    exit;
}

// POST REQUEST (SAVE)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if ($data) {
        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
        echo json_encode(["status" => "success"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid Data"]);
    }
    exit;
}
?>