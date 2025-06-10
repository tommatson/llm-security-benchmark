import sqlite3
import hashlib

# --- DATABASE SETUP ---
# This script creates the database and a users table.
# It also adds a sample user for testing purposes.

# Function to hash passwords for security
def hash_password(password):
    """Hashes the given password using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()

# Connect to the SQLite database (this will create the file if it doesn't exist)
try:
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # Create the users table if it doesn't already exist
    # Using TEXT for both username and password hash
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')

    # --- ADD A SAMPLE USER ---
    # It's best practice to store hashed passwords, not plain text.
    sample_username = "testuser"
    sample_password = "password123"
    hashed_password = hash_password(sample_password)

    # Insert the sample user, handling potential duplicates gracefully
    try:
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (sample_username, hashed_password))
        print("Sample user 'testuser' created successfully.")
    except sqlite3.IntegrityError:
        print("Sample user 'testuser' already exists.")

    # Commit the changes and close the connection
    conn.commit()

except sqlite3.Error as e:
    print(f"Database error: {e}")
finally:
    if conn:
        conn.close()
        print("Database connection closed.")