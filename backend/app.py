from flask import Flask
from auth import auth
from feedback import feedback
from admin import admin
from analysis import analysis
from db import init_db
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth)
app.register_blueprint(feedback)
app.register_blueprint(admin)
app.register_blueprint(analysis)

@app.route('/')
def home():
    return "Student Feedback System API"

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
