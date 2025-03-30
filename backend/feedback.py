from flask import Blueprint, request, jsonify
from config import FEEDBACK_DB_PATH
from models import get_db_connection

feedback = Blueprint('feedback', __name__)

QUESTIONS = [
    "How satisfied are you with the faculty?",
    "How would you rate the course material?",
    "Are the facilities sufficient?",
    "Is the learning environment good?",
    "How would you rate the extracurricular activities?",
    "How accessible is student support?",
    "How satisfied are you with the online resources?",
    "How practical is the coursework?",
    "Would you recommend this college to others?",
    "Overall, how satisfied are you with the college experience?"
]

def create_college_table(college_name):
    conn = get_db_connection(FEEDBACK_DB_PATH)
    cursor = conn.cursor()
    cursor.execute(f'''CREATE TABLE IF NOT EXISTS "{college_name}" (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        {", ".join([f"q{i+1} TEXT" for i in range(10)])}
                    )''')
    conn.commit()
    conn.close()

@feedback.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.json
        username = data.get('username')
        college = data.get('college')
        feedback_text = data.get('feedback')

        if not username or not college or not feedback_text:
            return jsonify({"error": "All fields are required"}), 400

        conn = get_db_connection(FEEDBACK_DB_PATH)
        cursor = conn.cursor()

        # Check if the user has already submitted feedback for ANY college
        cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
        tables = cursor.fetchall()

        for table in tables:
            table_name = table[0]
            cursor.execute(f'SELECT * FROM "{table_name}" WHERE username = ?', (username,))
            existing_feedback = cursor.fetchone()
            if existing_feedback:
                return jsonify({"error": "You have already submitted feedback for another college"}), 403

        # Insert new feedback
        cursor.execute(f'INSERT INTO "{college}" (username, feedback) VALUES (?, ?)', (username, feedback_text))
        conn.commit()
        conn.close()

        return jsonify({"message": "Feedback submitted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@feedback.route('/check_submission/<username>', methods=['GET'])
def check_submission(username):
    try:
        conn = get_db_connection(FEEDBACK_DB_PATH)
        cursor = conn.cursor()

        # Check if the user has submitted feedback for any college
        cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
        tables = cursor.fetchall()

        for table in tables:
            table_name = table[0]
            cursor.execute(f'SELECT * FROM "{table_name}" WHERE username = ?', (username,))
            existing_feedback = cursor.fetchone()
            if existing_feedback:
                return jsonify({"submitted": True, "college": table_name}), 200

        return jsonify({"submitted": False}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

