from flask import Blueprint, request, jsonify
import jwt
import datetime
import bcrypt
from config import JWT_SECRET
from models import get_user, add_user

auth = Blueprint('auth', __name__)

@auth.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('name')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Missing username or password"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    if add_user(username, hashed_password):
        return jsonify({"message": "User created successfully"}), 201
    else:
        return jsonify({"message": "Username already exists"}), 400

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = get_user(username)
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        token = jwt.encode({'username': username, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, JWT_SECRET, algorithm="HS256")
        return jsonify({"message":'Login Successful',"token": token}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401
