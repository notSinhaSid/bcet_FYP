from flask import Blueprint, send_file
import pandas as pd
from config import FEEDBACK_DB_PATH
from models import get_db_connection

admin = Blueprint('admin', __name__)

@admin.route('/export_feedback/<college_name>', methods=['GET'])
def export_feedback(college_name):
    conn = get_db_connection(FEEDBACK_DB_PATH)
    df = pd.read_sql_query(f'SELECT * FROM "{college_name}"', conn)
    conn.close()

    file_path = f"{college_name}_feedback.csv"
    df.to_csv(file_path, index=False)
    
    return send_file(file_path, as_attachment=True)
