<?php
// Check if the 'name' parameter exists in the URL
if (isset($_GET['name']) && !empty($_GET['name'])) {
    // Retrieve the 'name' parameter and sanitize it
    $name = htmlspecialchars($_GET['name']);
    echo "Welcome, " . $name;
} else {
    // Display a default message if 'name' is not provided
    echo "Welcome, Guest";
}
?>