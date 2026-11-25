from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from pymongo import MongoClient
import os
import subprocess
import random
import string

app = Flask(__name__, static_folder='.', template_folder='.')
CORS(app)

# ==========================================
# 1. MONGODB DATABASE CONNECTION
# ==========================================
MONGO_URI = "mongodb+srv://altafnpl786_db_user:altaf8454520@cluster0.strjahf.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client.h4x_database
users_collection = db.users
codes_collection = db.redeem_codes
files_collection = db.hosted_files

# Uploads folder banao agar nahi hai
os.makedirs("uploads", exist_ok=True)

# ==========================================
# 2. WEBSITE PAGES (HTML FILES) ROUTES
# ==========================================
# Jab koi website kholega, toh index.html khulega
@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

# Baaki saare HTML pages ko serve karne ke liye
@app.route('/<page>.html')
def serve_html(page):
    return send_from_directory('.', f'{page}.html')

# CSS, JS aur images ke liye
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# ==========================================
# 3. AUTHENTICATION APIs (Login/Signup)
# ==========================================
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if users_collection.find_one({"email": data['email']}):
        return jsonify({"error": "User already exists"}), 400
    
    new_user = {
        "name": data['name'], "email": data['email'], "password": data['password'], 
        "coins": 0, "role": "user"
    }
    users_collection.insert_one(new_user)
    return jsonify({"message": "Account created successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = users_collection.find_one({"email": data['email'], "password": data['password']})
    if user:
        return jsonify({
            "message": "Login successful", 
            "user": {"name": user["name"], "email": user["email"], "coins": user["coins"], "role": user.get("role")}
        }), 200
    return jsonify({"error": "Invalid email or password"}), 401

# ==========================================
# 4. USER DASHBOARD & HOSTING APIs
# ==========================================
@app.route('/api/user-data', methods=['GET'])
def get_user_data():
    email = request.args.get('email')
    user = users_collection.find_one({"email": email}, {"_id": 0, "password": 0})
    if user: return jsonify(user), 200
    return jsonify({"error": "User not found"}), 404

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    email = request.form.get('email') # Kis user ne upload kiya
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # File save karo server par
    filepath = os.path.join("uploads", file.filename)
    file.save(filepath)

    # Database me save karo ki kisne upload kiya
    files_collection.insert_one({
        "filename": file.filename, "owner": email, "status": "running", "path": filepath
    })
    
    # Yaha asli Python bot run karne ka logic aayega (subprocess.Popen)
    # subprocess.Popen(["python", filepath]) 

    return jsonify({"message": f"{file.filename} hosted successfully!"}), 200

@app.route('/api/my-files', methods=['GET'])
def get_my_files():
    email = request.args.get('email')
    files = list(files_collection.find({"owner": email}, {"_id": 0}))
    return jsonify(files), 200

@app.route('/api/toggle-file', methods=['POST'])
def toggle_file():
    data = request.json
    filename = data['filename']
    current_status = data['status']
    new_status = "stopped" if current_status == "running" else "running"
    
    files_collection.update_one({"filename": filename}, {"$set": {"status": new_status}})
    # Yaha process kill/start karne ka logic aayega
    return jsonify({"message": f"File {new_status}"}), 200

# ==========================================
# 5. COINS & REDEEM APIs
# ==========================================
@app.route('/api/redeem', methods=['POST'])
def redeem_code():
    data = request.json
    code = data['code']
    email = data['email']

    code_data = codes_collection.find_one({"code": code, "used": False})
    if not code_data:
        return jsonify({"error": "Invalid or already used code"}), 400

    # Mark code as used
    codes_collection.update_one({"code": code}, {"$set": {"used": True}})
    # Add coins to user
    users_collection.update_one({"email": email}, {"$inc": {"coins": code_data["amount"]}})
    
    updated_user = users_collection.find_one({"email": email})
    return jsonify({"message": "Code redeemed!", "coins": updated_user["coins"]}), 200

# ==========================================
# 6. ADMIN APIs
# ==========================================
@app.route('/api/admin/all-users', methods=['GET'])
def admin_get_users():
    users = list(users_collection.find({}, {"_id": 0, "password": 0}))
    return jsonify(users), 200

@app.route('/api/admin/generate-code', methods=['POST'])
def admin_generate_code():
    data = request.json
    # Random code generate karo (e.g., H4X-8A9B)
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    code = f"H4X-{random_str}"
    
    codes_collection.insert_one({"code": code, "amount": int(data['amount']), "used": False})
    return jsonify({"message": f"Code Generated: {code}", "code": code}), 201

@app.route('/api/admin/all-codes', methods=['GET'])
def admin_get_codes():
    codes = list(codes_collection.find({}, {"_id": 0}))
    return jsonify(codes), 200

@app.route('/api/admin/settings', methods=['POST'])
def admin_settings():
    # Website settings update logic (Pricing/Contact)
    return jsonify({"message": "Settings updated"}), 200


# ==========================================
# START SERVER
# ==========================================
if __name__ == '__main__':
    print("H4X ALTAF Server Started on Port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)