import os
import sqlite3
from config import USER_DB_PATH, FEEDBACK_DB_PATH

# Ensure the db/ directory exists before creating the databases
os.makedirs(os.path.dirname(USER_DB_PATH), exist_ok=True)

def init_users_db():
    conn = sqlite3.connect(USER_DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL)''')
    conn.commit()
    conn.close()

def init_feedback_db():
    conn = sqlite3.connect(FEEDBACK_DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS colleges (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        college_name TEXT UNIQUE NOT NULL)''')
    conn.commit()
    conn.close()

def init_db():
    init_users_db()
    init_feedback_db()

if __name__ == "__main__":
    init_db()
    print("Databases initialized successfully in the db/ folder!")
