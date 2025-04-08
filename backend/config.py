import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_DIR = os.path.join(BASE_DIR, "../db")  # Move outside backend

# Ensure the db directory exists
os.makedirs(DB_DIR, exist_ok=True)

USER_DB_PATH = os.path.join(DB_DIR, "users.db")
FEEDBACK_DB_PATH = os.path.join(DB_DIR, "feedback.db")
FEEDBACK_TRACKING_DB_PATH = os.path.join(DB_DIR, "feedback_tracking.db")

JWT_SECRET = "your_secret_key_here"
