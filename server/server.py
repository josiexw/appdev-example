from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy  # allow flask server to write to SQLite database
from werkzeug.security import generate_password_hash, check_password_hash  # package for hashing passwords
import uuid
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Create database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# User
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # need a unique primary key per user
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    auth_token = db.Column(db.String(200), unique=True)

# Create database tables
with app.app_context():
    db.create_all()


@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data.get('username') or not data.get('password') or not data.get('name'):
        return jsonify({'error': 'Missing fields'}), 400

    hashed_pw = generate_password_hash(data['password'])
    new_user = User(
        username=data['username'],
        password_hash=hashed_pw,
        name=data['name']
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    if user and check_password_hash(user.password_hash, data.get('password')):
        user.auth_token = str(uuid.uuid4())
        db.session.commit()
        return jsonify({'token': user.auth_token}), 200
    return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/get_name', methods=['GET'])
def get_user_info():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401

    user = User.query.filter_by(auth_token=auth_header).first()
    if not user:
        return jsonify({'error': 'Invalid token'}), 403

    return jsonify({'name': user.name}), 200

if __name__ == '__main__':
    app.run(debug=True)
