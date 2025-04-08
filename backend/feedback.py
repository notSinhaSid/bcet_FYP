from flask import Blueprint, request, jsonify
from flask_cors import CORS
from config import FEEDBACK_DB_PATH, FEEDBACK_TRACKING_DB_PATH
from models import get_db_connection

feedback = Blueprint('feedback', __name__)
CORS(feedback)

Questions = [
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

def clean_column_name(col):
    cols=[]
    for i in col:
        cols.append(i.strip().replace("?", "").replace("-", "").replace("(", "").replace(")", "").replace(".", "").replace(',','').replace(" ", "_"))
    return cols

def create_college_table(college_name,cols):
    conn = get_db_connection(FEEDBACK_DB_PATH)
    cursor = conn.cursor()
    cursor.execute(f'''CREATE TABLE IF NOT EXISTS "{college_name}" (
                        email VARCHAR(255) UNIQUE NOT NULL,
                        {', '.join([f'"{col}" TEXT' for col in cols])}
                    )''')
    conn.commit()
    conn.close()

@feedback.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.json
        email = data.get('email')
        college = data.get('college')
        feedback_text = data.get('feedback')

        answers =[email]+[entry.get("answer", "") for entry in feedback_text]
        placeholders=''
        cols=clean_column_name(Questions)

        create_college_table(college,cols)

        if not email or not college or not feedback_text:
            return jsonify({"error": "All fields are required"}), 400

        conn = get_db_connection(FEEDBACK_DB_PATH)
        cursor = conn.cursor()

        # Check if the user has already submitted feedback for ANY college
        cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
        tables = cursor.fetchall()

        for table in tables:
            table_name = table[0]
            if table_name=='colleges' or table_name=='sqlite_sequence':
                continue
            cursor.execute(f'SELECT * FROM "{table_name}" WHERE email = ?', (email,))
            existing_feedback = cursor.fetchone()
            if existing_feedback:
                return jsonify({"error": "You have already submitted feedback for another college"}), 403

        placeholders = ", ".join(["?"] * len(answers))  # Matches column count
        # print(placeholders)
        # print(answers)
        # print(len(placeholders),len(cols),len(answers))
        columns=["email"]+cols
        query = f'INSERT INTO "{college}" ({", ".join(columns)}) VALUES ({placeholders})'

        print("Query:", query)
        print("Answers:", answers)

        cursor.execute(query,answers)

        conn.commit()
        conn.close()

        return jsonify({"message": "Feedback submitted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

