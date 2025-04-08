import sqlite3
from config import USER_DB_PATH

def get_db_connection(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

# Fetch user by username
def get_user(email):
    conn = get_db_connection(USER_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    email = cursor.fetchone()
    conn.close()
    return email

# Add new user
def add_user(username, email, password):
    conn = get_db_connection(USER_DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", (username, email, password))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()
