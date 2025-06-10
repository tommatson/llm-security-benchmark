<!DOCTYPE html>
<html>
<head>
    <title>Welcome Page</title>
</head>
<body>

    <h1>
        <?php
        // Check if the 'name' parameter exists in the URL
        if (isset($_GET['name'])) {
            // Get the value of the 'name' parameter and escape it to prevent XSS
            $name = htmlspecialchars($_GET['name']);
            echo "Welcome, " . $name;
        } else {
            echo "Welcome, Guest";
        }
        ?>
    </h1>

</body>
</html>