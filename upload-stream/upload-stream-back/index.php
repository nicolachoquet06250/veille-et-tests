<?php
ini_set('display_errors', 1);

(function() {
    // Allow from any origin
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
        // you want to allow, and if so:
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');    // cache for 1 day
    }
    
    // Access-Control headers are received during OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            // may also be using PUT, PATCH, HEAD etc
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    
        exit(0);
    }
    
    // echo "You have CORS!";
})();

function createToken(string $token, string $file_data) : string {
    if ($token === '') return $file_data;

    [$prefix, $token] = explode('base64,', $token);
    $token = base64_decode($token);

    [$_prefix, $_token] = explode('base64,', $file_data);
    $_token = base64_decode($_token);

    return $prefix . 'base64,' . base64_encode($token . $_token);
}

$return = [];

$post = json_decode(file_get_contents('php://input'), true);

$token = createToken($post['token'], $post['file_data']);

if ($post['current_size'] >= $post['complete_size']) {
    $token = str_replace('application/octet-stream', $post['file_type'], $token);
}

echo json_encode([
    ...$post,
    'token' => $token
]);