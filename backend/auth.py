from flask import Blueprint, request, jsonify
from flask_cors import CORS
import jwt
import datetime
import bcrypt
from config import JWT_SECRET
from models import get_user, add_user

auth = Blueprint('auth', __name__)
CORS(auth)

@auth.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"message": "Missing username or email or password","Success":False}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    if add_user(username, email, hashed_password):
        token = jwt.encode({'username': username, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, JWT_SECRET, algorithm="HS256")
        return jsonify({"message": "User created successfully","token":token,"Success":True}), 201
    else:
        return jsonify({"message": "Username already exists","Success":False}), 400

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    row = get_user(email)
    if email and bcrypt.checkpw(password.encode('utf-8'), row['password'].encode('utf-8')):
        token = jwt.encode({'email': email, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, JWT_SECRET, algorithm="HS256")
        return jsonify({"message":'Login Successful',"token": token}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401
