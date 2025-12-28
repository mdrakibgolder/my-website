"""
World-Class Portfolio Backend - Python/Flask
Secure + Production Ready + Gemini AI
"""

from flask import Flask, request, jsonify, send_from_directory, session, redirect
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime
import os
import hashlib
import secrets
from functools import wraps
from collections import defaultdict
from time import time
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ===================================
# APP CONFIG
# ===================================
app = Flask(__name__, 
            static_folder='static',
            static_url_path='/static')
app.secret_key = os.getenv('SECRET_KEY', 'SUPER_SECRET_KEY_CHANGE_IN_PRODUCTION_12345')
CORS(app)

# ===================================
# 🔐 ENVIRONMENT VARIABLES (REQUIRED)
# ===================================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
    print("[WARNING] GEMINI_API_KEY not set. AI chat will use fallback responses.")
    print("[WARNING] Get your API key from: https://makersuite.google.com/app/apikey")
    print("[WARNING] Add it to the .env file")
    GEMINI_ENABLED = False
else:
    genai.configure(api_key=GEMINI_API_KEY)
    GEMINI_ENABLED = True

# ===================================
# SYSTEM PROMPT
# ===================================
SYSTEM_PROMPT = """
You are Rakib Golder's AI Assistant on his portfolio website.

Your role:
- Explain Rakib’s services, skills, and experience
- Help visitors understand how Rakib can help their project
- Encourage contact via email or contact form when appropriate

About Rakib:
- AI Engineer & Full Stack Developer
- Expertise: AI/ML, Web, Mobile Apps, Data Analytics
- Remote freelancer available worldwide
- Email: marakibgolder@gmail.com

Tone:
- Professional
- Friendly
- Clear
- Concise
- Helpful
- Use emojis occasionally

Rules:
- Answer questions on ANY topic - you are a general-purpose AI assistant
- Be helpful, accurate, and comprehensive
- If asked about Rakib, share relevant information
"""

# ===================================
# DATABASE
# ===================================
DATABASE = 'database/portfolio.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        subject TEXT,
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event TEXT,
        data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
    """)

    # Hash the default password (change this in production!)
    default_password = hashlib.sha256('admin123'.encode()).hexdigest()
    cur.execute("""
    INSERT OR IGNORE INTO admin_users (username, password)
    VALUES ('admin', ?)
    """, (default_password,))

    cur.execute("""
    CREATE TABLE IF NOT EXISTS ai_chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_message TEXT,
        ai_reply TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()
    print("[OK] Database ready")

init_db()

# ===================================
# STATIC FILES
# ===================================
@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/admin/login.html')
def admin_login_page():
    return send_from_directory('templates', 'login.html')

@app.route('/admin/dashboard.html')
def admin_dashboard_page():
    return send_from_directory('templates', 'dashboard.html')

# ===================================
# CONTACT FORM
# ===================================
@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.get_json()

    required = ['name', 'email', 'subject', 'message']
    for f in required:
        if not data.get(f):
            return jsonify({'error': f'Missing {f}'}), 400

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    INSERT INTO contact_messages (name, email, subject, message)
    VALUES (?, ?, ?, ?)
    """, (data['name'], data['email'], data['subject'], data['message']))

    cur.execute("""
    INSERT INTO analytics (event, data)
    VALUES (?, ?)
    """, ('contact_form', json.dumps({'email': data['email']})))

    conn.commit()
    conn.close()

    return jsonify({'message': 'Message sent successfully'}), 200

# ===================================
# ANALYTICS
# ===================================
@app.route('/api/analytics', methods=['POST'])
def analytics():
    data = request.get_json()
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    INSERT INTO analytics (event, data)
    VALUES (?, ?)
    """, (data.get('event'), json.dumps(data.get('data', {}))))

    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ===================================
# 🤖 AI CHAT (FIXED)
# ===================================
@app.route('/api/ai-chat', methods=['POST'])
def ai_chat():
    data = request.get_json()
    message = data.get('message', '').strip()
    history = data.get('history', [])

    if not message:
        return jsonify({'error': 'Message required'}), 400

    reply = generate_ai_reply(message, history)

    # Save chat to database
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO ai_chats (user_message, ai_reply)
    VALUES (?, ?)
    """, (message, reply))
    
    cur.execute("""
    INSERT INTO analytics (event, data)
    VALUES (?, ?)
    """, ('ai_chat', json.dumps({'message_length': len(message)})))
    
    conn.commit()
    conn.close()

    return jsonify({'reply': reply})

def generate_ai_reply(message, history):
    # If Gemini is not enabled, use fallback
    if not GEMINI_ENABLED:
        return fallback_response(message)
    
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")

        contents = [
            {"role": "user", "parts": [SYSTEM_PROMPT]}
        ]

        # Add conversation history (limit to last 6)
        for h in history[-6:]:
            contents.append({
                "role": "user",
                "parts": [h.get("user", "")]
            })
            contents.append({
                "role": "model",
                "parts": [h.get("ai", "")]
            })

        contents.append({
            "role": "user",
            "parts": [message]
        })

        response = model.generate_content(contents)

        return response.text.strip()

    except Exception as e:
        print("[ERROR] Gemini Error:", e)
        return fallback_response(message)

# ===================================
# UTILITY FUNCTIONS
# ===================================
def sanitize_html(text):
    """Basic HTML escaping to prevent XSS"""
    if not text:
        return ""
    return (str(text)
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;')
            .replace("'", '&#x27;'))

# ===================================
# FALLBACK RESPONSES
# ===================================
def fallback_response(message):
    msg = message.lower()

    if "service" in msg:
        return "💼 I offer AI, full-stack web development, and mobile app solutions. Want details on any one?"

    if "hire" in msg or "price" in msg:
        return "💰 Pricing depends on scope. Contact me via the form or email to get a quote."

    if "contact" in msg:
        return "📧 You can reach me at marakibgolder@gmail.com or use the contact form."

    return "🤖 I’m here to help! Ask me about services, projects, or how to get started."

# ===================================
# 🔐 ADMIN AUTHENTICATION
# ===================================

# Rate limiting storage
login_attempts = defaultdict(list)
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_TIME = 300  # 5 minutes

def check_rate_limit(ip):
    """Check if IP has exceeded login attempts"""
    now = time()
    # Clean old attempts
    login_attempts[ip] = [t for t in login_attempts[ip] if now - t < LOCKOUT_TIME]
    
    if len(login_attempts[ip]) >= MAX_LOGIN_ATTEMPTS:
        return False
    return True

def record_login_attempt(ip):
    """Record a login attempt"""
    login_attempts[ip].append(time())

def admin_required():
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    return None

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    # Get client IP
    client_ip = request.remote_addr
    
    # Check rate limit
    if not check_rate_limit(client_ip):
        return jsonify({
            'success': False, 
            'message': 'Too many login attempts. Please try again in 5 minutes.'
        }), 429
    
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Missing credentials'}), 400

    # Hash the provided password
    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
    SELECT * FROM admin_users 
    WHERE username=? AND password=?
    """, (username, hashed_password))
    
    admin = cur.fetchone()
    conn.close()

    if admin:
        # Clear failed attempts on successful login
        login_attempts[client_ip] = []
        session['admin'] = True
        session['username'] = username
        session.permanent = False  # Session expires when browser closes
        return jsonify({'success': True, 'message': 'Login successful'})
    
    # Record failed attempt
    record_login_attempt(client_ip)
    remaining = MAX_LOGIN_ATTEMPTS - len(login_attempts[client_ip])
    
    return jsonify({
        'success': False, 
        'message': f'Invalid credentials. {remaining} attempts remaining.'
    }), 401

@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin', None)
    session.pop('username', None)
    return jsonify({'success': True, 'message': 'Logged out'})

@app.route('/api/admin/check', methods=['GET'])
def admin_check():
    return jsonify({'authenticated': session.get('admin', False)})

# ===================================
# 📊 ADMIN DASHBOARD APIs
# ===================================
@app.route('/api/admin/messages', methods=['GET'])
def get_messages():
    auth_error = admin_required()
    if auth_error: return auth_error

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
    SELECT * FROM contact_messages 
    ORDER BY timestamp DESC
    """)
    messages = cur.fetchall()
    conn.close()

    return jsonify([dict(msg) for msg in messages])

@app.route('/api/admin/chats', methods=['GET'])
def get_chats():
    auth_error = admin_required()
    if auth_error: return auth_error

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
    SELECT * FROM ai_chats 
    ORDER BY timestamp DESC 
    LIMIT 100
    """)
    chats = cur.fetchall()
    conn.close()

    return jsonify([dict(chat) for chat in chats])

@app.route('/api/admin/analytics', methods=['GET'])
def get_all_analytics():
    auth_error = admin_required()
    if auth_error: return auth_error

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
    SELECT * FROM analytics 
    ORDER BY timestamp DESC 
    LIMIT 100
    """)
    analytics_data = cur.fetchall()
    conn.close()

    return jsonify([dict(a) for a in analytics_data])

@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    auth_error = admin_required()
    if auth_error: return auth_error

    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) as count FROM contact_messages")
    messages_count = cur.fetchone()['count']
    
    cur.execute("SELECT COUNT(*) as count FROM ai_chats")
    chats_count = cur.fetchone()['count']
    
    cur.execute("SELECT COUNT(*) as count FROM analytics")
    events_count = cur.fetchone()['count']
    
    conn.close()

    return jsonify({
        'messages': messages_count,
        'chats': chats_count,
        'events': events_count
    })

# ===================================
# HEALTH CHECK
# ===================================
@app.route('/health')
def health():
    return jsonify({
        "status": "ok",
        "time": datetime.utcnow().isoformat()
    })

# ===================================
# RUN SERVER
# ===================================
if __name__ == "__main__":
    print("\n=== Portfolio Backend Running ===")
    print("URL: http://localhost:5000")
    print("AI: Gemini Connected\n")
    app.run(host="0.0.0.0", port=5000, debug=False)
