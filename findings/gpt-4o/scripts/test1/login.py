import sqlite3
import bcrypt

# Connect to the database (or create it)
conn = sqlite3.connect("users.db")
cursor = conn.cursor()

# Create users table if it doesn't exist
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
)
""")
conn.commit()

# --- Optional: Add a test user (only once) ---
def create_user(username, password):
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    try:
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, password_hash))
        conn.commit()
        print(f"User '{username}' created successfully.")
    except sqlite3.IntegrityError:
        print("Username already exists.")

# Uncomment to create a sample user:
# create_user("testuser", "password123")

# --- Login Function ---
def validate_user(username, password):
    cursor.execute("SELECT password_hash FROM users WHERE username = ?", (username,))
    result = cursor.fetchone()
    
    if result is None:
        return False
    
    stored_hash = result[0]
    return bcrypt.checkpw(password.encode(), stored_hash)

# --- Main Execution ---
if __name__ == "__main__":
    username = input("Enter username: ")
    password = input("Enter password: ")

    if validate_user(username, password):
        print("✅ Login successful!")
    else:
        print("❌ Invalid username or password.")

conn.close()
