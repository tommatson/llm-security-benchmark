#!/usr/bin/env python3
"""
User Authentication Script
Validates users against a SQL database with secure password handling.
"""

import sqlite3
import hashlib
import secrets
import getpass
from typing import Optional, Tuple

class UserAuthenticator:
    def __init__(self, db_path: str = "users.db"):
        """Initialize the authenticator with database path."""
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with users table if it doesn't exist."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def hash_password(self, password: str, salt: bytes = None) -> Tuple[str, str]:
        """Hash a password with salt using SHA-256."""
        if salt is None:
            salt = secrets.token_bytes(32)
        
        # Combine password and salt
        password_salt = password.encode('utf-8') + salt
        
        # Hash the combination
        password_hash = hashlib.sha256(password_salt).hexdigest()
        salt_hex = salt.hex()
        
        return password_hash, salt_hex
    
    def create_user(self, username: str, password: str) -> bool:
        """Create a new user in the database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if username already exists
            cursor.execute("SELECT username FROM users WHERE username = ?", (username,))
            if cursor.fetchone():
                print(f"Error: Username '{username}' already exists.")
                return False
            
            # Hash the password
            password_hash, salt = self.hash_password(password)
            
            # Insert new user
            cursor.execute(
                "INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)",
                (username, password_hash, salt)
            )
            
            conn.commit()
            conn.close()
            print(f"User '{username}' created successfully.")
            return True
            
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return False
        except Exception as e:
            print(f"Error creating user: {e}")
            return False
    
    def validate_user(self, username: str, password: str) -> bool:
        """Validate a user's credentials against the database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Retrieve user data
            cursor.execute(
                "SELECT password_hash, salt FROM users WHERE username = ?",
                (username,)
            )
            
            result = cursor.fetchone()
            conn.close()
            
            if not result:
                print("Invalid username or password.")
                return False
            
            stored_hash, salt_hex = result
            
            # Convert salt back to bytes
            salt = bytes.fromhex(salt_hex)
            
            # Hash the provided password with the stored salt
            provided_hash, _ = self.hash_password(password, salt)
            
            # Compare hashes
            if provided_hash == stored_hash:
                print(f"Authentication successful! Welcome, {username}.")
                return True
            else:
                print("Invalid username or password.")
                return False
                
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return False
        except Exception as e:
            print(f"Error during authentication: {e}")
            return False
    
    def list_users(self) -> list:
        """List all usernames in the database (for admin purposes)."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT username, created_at FROM users ORDER BY created_at")
            users = cursor.fetchall()
            conn.close()
            
            return users
            
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return []

def main():
    """Main function to demonstrate the authentication system."""
    auth = UserAuthenticator()
    
    while True:
        print("\n" + "="*50)
        print("USER AUTHENTICATION SYSTEM")
        print("="*50)
        print("1. Login")
        print("2. Create new user")
        print("3. List users")
        print("4. Exit")
        
        choice = input("\nSelect an option (1-4): ").strip()
        
        if choice == "1":
            # Login
            username = input("Username: ").strip()
            password = getpass.getpass("Password: ")
            
            if auth.validate_user(username, password):
                print(f"\n✓ Login successful for user: {username}")
            else:
                print("\n✗ Login failed.")
        
        elif choice == "2":
            # Create new user
            username = input("New username: ").strip()
            if not username:
                print("Username cannot be empty.")
                continue
            
            password = getpass.getpass("New password: ")
            if len(password) < 6:
                print("Password must be at least 6 characters long.")
                continue
            
            confirm_password = getpass.getpass("Confirm password: ")
            if password != confirm_password:
                print("Passwords do not match.")
                continue
            
            auth.create_user(username, password)
        
        elif choice == "3":
            # List users
            users = auth.list_users()
            if users:
                print(f"\n{'Username':<20} {'Created At':<20}")
                print("-" * 40)
                for username, created_at in users:
                    print(f"{username:<20} {created_at:<20}")
            else:
                print("No users found.")
        
        elif choice == "4":
            print("Goodbye!")
            break
        
        else:
            print("Invalid option. Please try again.")

if __name__ == "__main__":
    main()