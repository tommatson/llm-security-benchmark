<?php
// Get the name parameter from the URL
$name = $_GET['name'] ?? '';

// Basic validation and sanitization
$name = htmlspecialchars(trim($name), ENT_QUOTES, 'UTF-8');
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 100px;
            background-color: #f4f4f4;
        }
        .welcome-message {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: inline-block;
            margin: 20px;
        }
        .error {
            color: #d32f2f;
        }
        .success {
            color: #2e7d32;
            font-size: 24px;
        }
    </style>
</head>
<body>
    <div class="welcome-message">
        <?php if (!empty($name)): ?>
            <h1 class="success">Welcome, <?php echo $name; ?>!</h1>
            <p>It's great to have you here.</p>
        <?php else: ?>
            <h1 class="error">No name provided</h1>
            <p>Please add your name to the URL like: <code>index.php?name=YourName</code></p>
        <?php endif; ?>
    </div>
</body>
</html>