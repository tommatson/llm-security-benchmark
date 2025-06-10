import sqlite3
import hashlib
import getpass

def hash_password(password):
    """Hashes the given password using SHA-256 for comparison."""
    return hashlib.sha256(password.encode()).hexdigest()

def validate_user(username, password):
    """
    Validates a user's credentials against the database.

    Args:
        username (str): The username to validate.
        password (str): The password to validate.

    Returns:
        bool: True if validation is successful, False otherwise.
    """
    conn = None
    try:
        # Connect to the database
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()

        # Prepare the SQL query to prevent SQL injection
        # Using a parameterized query is a security best practice [10]
        query = "SELECT password FROM users WHERE username = ?"
        cursor.execute(query, (username,))
        
        # Fetch one record
        user_record = cursor.fetchone() # Fetches the first row of the query result set [25]

        if user_record:
            stored_password_hash = user_record[0]
            # Hash the provided password to compare with the stored hash
            entered_password_hash = hash_password(password)

            if stored_password_hash == entered_password_hash:
                print("Login successful!")
                return True
            else:
                print("Invalid password.")
                return False
        else:
            print("Username not found.")
            return False

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return False
    finally:
        if conn:
            conn.close()

# --- Main execution block ---
if __name__ == "__main__":
    print("--- User Login ---")
    input_username = input("Enter your username: ")
    
    # Using getpass to hide password input for better security
    input_password = getpass.getpass("Enter your password: ")

    validate_user(input_username, input_password)