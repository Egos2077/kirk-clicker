from flask import Flask, render_template, jsonify, request, session
import pymysql
import json
import os
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'kirk-clicker-secret-key-2024')
app.permanent_session_lifetime = timedelta(days=7)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'the_base',
    'cursorclass': pymysql.cursors.DictCursor,
    'charset': 'utf8mb4'
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        return connection
    except pymysql.Error as e:
        print(f"Database connection error: {e}")
        return None

def init_database():
    """Initialize database tables to match existing schema"""
    connection = None
    try:
        # Connect without database first
        temp_config = DB_CONFIG.copy()
        temp_config.pop('database', None)
        connection = pymysql.connect(**temp_config)
        
        with connection.cursor() as cursor:
            # Create database if it doesn't exist
            cursor.execute("CREATE DATABASE IF NOT EXISTS the_base CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            cursor.execute("USE the_base")
            
            # Create accounts table (existing schema)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS accounts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci
            """)
            
            # Create saves table (EXISTING schema - DO NOT CHANGE)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS saves (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    account_id INT NOT NULL,
                    kirks DOUBLE NOT NULL DEFAULT 0,
                    upgrades_json JSON NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_account_id (account_id),
                    CONSTRAINT fk_saves_account
                        FOREIGN KEY (account_id)
                        REFERENCES accounts(id)
                        ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci
            """)
            
        connection.commit()
        print("Database initialized successfully (matched existing schema)")
        
    except pymysql.Error as e:
        print(f"Database initialization error: {e}")
        if connection:
            connection.rollback()
    finally:
        if connection:
            connection.close()

# Initialize database on startup
init_database()

# ==================== ROUTES ====================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/check_session', methods=['GET'])
def check_session():
    """Check if user has an active session (with DB verification)"""
    if 'account_id' in session and 'username' in session:
        # VERIFY account still exists in database
        connection = get_db_connection()
        if connection:
            try:
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT id FROM accounts WHERE id = %s",
                        (session['account_id'],)
                    )
                    account = cursor.fetchone()
                
                if account:
                    return jsonify({
                        'logged_in': True,
                        'account_id': session['account_id'],
                        'username': session['username']
                    })
            except pymysql.Error:
                pass
            finally:
                connection.close()
    
    return jsonify({'logged_in': False})

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Invalid data'}), 400
    
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if len(username) < 3:
        return jsonify({'message': 'Username must be at least 3 characters'}), 400
    
    if len(password) < 3:
        return jsonify({'message': 'Password must be at least 3 characters'}), 400
    
    password_hash = generate_password_hash(password)
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO accounts (username, password_hash) VALUES (%s, %s)",
                (username, password_hash)
            )
            account_id = cursor.lastrowid
            
            cursor.execute(
                "INSERT INTO saves (account_id, kirks, upgrades_json) VALUES (%s, %s, %s)",
                (account_id, 0, json.dumps([]))
            )
        
        connection.commit()
        
        session.permanent = True
        session['account_id'] = account_id
        session['username'] = username
        
        return jsonify({
            'account_id': account_id,
            'username': username,
            'message': 'Registration successful'
        })
        
    except pymysql.err.IntegrityError:
        return jsonify({'message': 'Username already exists'}), 409
    except pymysql.Error as e:
        print(f"Registration error: {e}")
        return jsonify({'message': 'Registration failed'}), 500
    finally:
        connection.close()

@app.route('/api/login', methods=['POST'])
def login():
    """Login an existing user"""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Invalid data'}), 400
    
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, username, password_hash FROM accounts WHERE username = %s",
                (username,)
            )
            user = cursor.fetchone()
        
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'message': 'Invalid username or password'}), 401
        
        session.permanent = True
        session['account_id'] = user['id']
        session['username'] = user['username']
        
        return jsonify({
            'account_id': user['id'],
            'username': user['username'],
            'message': 'Login successful'
        })
        
    except pymysql.Error as e:
        print(f"Login error: {e}")
        return jsonify({'message': 'Login failed'}), 500
    finally:
        connection.close()

@app.route('/api/logout', methods=['POST'])
def logout():
    """Logout the current user"""
    session.clear()
    return jsonify({'message': 'Logout successful'})

@app.route('/api/save', methods=['POST'])
def save_game():
    """Save game progress"""
    if 'account_id' not in session:
        return jsonify({'message': 'Not authenticated'}), 401
    
    data = request.get_json()
    if not data or 'save' not in data:
        return jsonify({'message': 'Invalid save data'}), 400
    
    save_data = data['save']
    account_id = session['account_id']
    
    # SAFE float conversion with fallback
    try:
        kirks = float(save_data.get('kirks', 0))
        if not (kirks >= 0):  # Handle NaN/Infinity
            kirks = 0.0
    except (ValueError, TypeError):
        kirks = 0.0
    
    upgrades = save_data.get('upgrades', [])
    
    if not isinstance(upgrades, list):
        return jsonify({'message': 'Upgrades must be an array'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id FROM saves WHERE account_id = %s",
                (account_id,)
            )
            existing_save = cursor.fetchone()
            
            if existing_save:
                cursor.execute("""
                    UPDATE saves 
                    SET kirks = %s, upgrades_json = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE account_id = %s
                """, (kirks, json.dumps(upgrades), account_id))
            else:
                cursor.execute("""
                    INSERT INTO saves (account_id, kirks, upgrades_json)
                    VALUES (%s, %s, %s)
                """, (account_id, kirks, json.dumps(upgrades)))
        
        connection.commit()
        return jsonify({'message': 'Game saved successfully'})
        
    except pymysql.Error as e:
        print(f"Save error: {e}")
        return jsonify({'message': 'Save failed'}), 500
    finally:
        connection.close()

@app.route('/api/load', methods=['GET'])
def load_game():
    """Load game progress"""
    if 'account_id' not in session:
        return jsonify({'message': 'Not authenticated'}), 401
    
    account_id = session['account_id']
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT kirks, upgrades_json FROM saves WHERE account_id = %s",
                (account_id,)
            )
            save = cursor.fetchone()
        
        if not save:
            return jsonify({
                'save': {
                    'kirks': 0,
                    'upgrades': []
                }
            })
        
        # MINIMAL JSON parsing guard (string OR already Python list)
        upgrades_json = save['upgrades_json']
        upgrades = []
        
        try:
            if isinstance(upgrades_json, str):
                upgrades = json.loads(upgrades_json)
            else:
                upgrades = upgrades_json or []
            
            # Ensure it's a list
            if not isinstance(upgrades, list):
                upgrades = []
        except (json.JSONDecodeError, TypeError):
            upgrades = []
        
        return jsonify({
            'save': {
                'kirks': float(save['kirks']),
                'upgrades': upgrades
            }
        })
        
    except pymysql.Error as e:
        print(f"Load error: {e}")
        return jsonify({'message': 'Load failed'}), 500
    finally:
        connection.close()

@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)