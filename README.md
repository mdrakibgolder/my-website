# 🚀 Portfolio Website - MD Rakib Golder

A modern, full-featured portfolio website with AI chatbot integration, admin dashboard, and database support.

## ✨ Features

- **🎨 Modern Design**: Beautiful, responsive UI with animated backgrounds and smooth transitions
- **🤖 AI Chatbot**: Google Gemini AI-powered chat assistant
- **📊 Admin Dashboard**: Complete analytics and message management
- **💾 Dual Database**: Support for both SQLite (development) and MySQL (production)
- **🔐 Secure**: Rate limiting, session management, security headers
- **📱 Responsive**: Works perfectly on all devices
- **🎥 Video Backgrounds**: Dynamic hero section with multiple video backgrounds

## 🛠️ Technologies

### Backend
- Python 3.11+
- Flask 3.0
- Google Generative AI (Gemini)
- SQLite / MySQL

### Frontend
- HTML5, CSS3, JavaScript
- Font Awesome Icons
- Google Fonts (Inter, Sora)

### Deployment
- Gunicorn (WSGI Server)
- Compatible with Render, Heroku, cPanel

## 📋 Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- MySQL Server (optional, for production)
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd my-website
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\\Scripts\\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edit `.env` file:

```env
# REQUIRED
GEMINI_API_KEY=your_actual_gemini_api_key_here
SECRET_KEY=your_random_secret_key_here

# Database (use 'sqlite' for development)
DB_TYPE=sqlite

# For production with MySQL, set these:
# DB_TYPE=mysql
# MYSQL_HOST=your-mysql-host
# MYSQL_USER=your-mysql-username
# MYSQL_PASSWORD=your-mysql-password
# MYSQL_DATABASE=your-database-name
# MYSQL_PORT=3306
```

### 5. Add Your Images

Place your images in the `static/images/` folder:
- `rakib.jpg` - Your main profile photo
- `hero.jpg` - Background decoration image
- `profile.jpg` - Additional profile image

### 6. Run the Application

```bash
# Development mode
python app.py

# Production mode (with Gunicorn)
gunicorn app:app
```

Visit: `http://localhost:5000`

## 👤 Admin Access

### Default Credentials
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change the default password in production!

### Admin Dashboard
- URL: `http://localhost:5000/admin/login.html`
- Features:
  - View contact messages
  - Monitor AI chat conversations
  - View analytics and statistics
  - Real-time dashboard metrics

## 📁 Project Structure

```
my-website/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── Procfile              # Heroku/Render deployment
├── render.yaml           # Render.com configuration
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── database/
│   └── portfolio.db      # SQLite database (auto-created)
├── static/
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   ├── js/
│   │   └── script.js     # Frontend JavaScript
│   └── images/           # Your images
├── templates/
│   ├── index.html        # Main portfolio page
│   ├── login.html        # Admin login page
│   └── dashboard.html    # Admin dashboard
```

## 🔧 Configuration

### Database Selection

**SQLite (Development - Default)**
```env
DB_TYPE=sqlite
```
- No additional setup required
- Database file created automatically in `database/` folder
- Perfect for development and testing

**MySQL (Production)**
```env
DB_TYPE=mysql
MYSQL_HOST=your-host
MYSQL_USER=your-username
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=your-database
MYSQL_PORT=3306
```
- Better for production environments
- Supports concurrent access
- More scalable

### Security Settings

1. **Change Secret Key**:
   ```env
   SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')
   ```

2. **Change Default Admin Password**:
   - Login to admin dashboard
   - Or update directly in `app.py` line ~136 (before first run)

3. **Configure CORS** (Optional):
   ```env
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

## 🚀 Deployment

### Deploy to Render.com

1. Push code to GitHub
2. Connect Render to your repository
3. Render will auto-detect `render.yaml`
4. Add environment variables in Render dashboard:
   - `GEMINI_API_KEY`
   - `SECRET_KEY` (auto-generated)
   - MySQL credentials (if using external database)

### Deploy to Heroku

```bash
heroku create your-app-name
heroku config:set GEMINI_API_KEY=your_key
heroku config:set SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')
git push heroku main
```

### Deploy to cPanel

1. Upload files via FTP or File Manager
2. Set up Python app in cPanel
3. Install dependencies: `pip install -r requirements.txt`
4. Configure environment variables in cPanel
5. Set entry point to `app:app`

## 🎨 Customization

### Update Personal Information

Edit `templates/index.html`:
- Line ~7: Update `<title>` tag
- Line ~8-9: Update meta description
- Line ~112-145: Update hero section text
- Throughout: Update your name, skills, services

### Update AI Assistant Personality

Edit `app.py` (lines ~48-73):
```python
SYSTEM_PROMPT = """
Your custom AI assistant instructions here...
"""
```

### Update Styling

Edit `static/css/style.css`:
- Lines ~11-42: CSS custom properties (colors, fonts, etc.)
- Modify gradients, colors, spacing as needed

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY not set"
**Solution**: Add your API key to `.env` file

### Issue: Database connection errors (MySQL)
**Solution**: 
- Verify MySQL credentials in `.env`
- Check MySQL server is running
- Ensure database exists
- Try switching to SQLite for testing: `DB_TYPE=sqlite`

### Issue: Images not loading
**Solution**: 
- Check images exist in `static/images/`
- Verify filenames match references in HTML
- Check file extensions (jpg/jpeg/png)

### Issue: Port already in use
**Solution**: Change port in `.env` or kill process using the port

## 📝 API Endpoints

### Public Endpoints
- `POST /api/contact` - Submit contact form
- `POST /api/analytics` - Track analytics events
- `POST /api/ai-chat` - Chat with AI assistant
- `GET /health` - Health check

### Admin Endpoints (Authentication Required)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/check` - Check authentication status
- `GET /api/admin/messages` - Get contact messages
- `GET /api/admin/chats` - Get AI chat history
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/stats` - Get dashboard statistics

## 🔐 Security Features

- ✅ Password hashing (SHA-256)
- ✅ Session management
- ✅ Rate limiting (5 attempts per 5 minutes)
- ✅ Security headers (XSS, Clickjacking protection)
- ✅ Input sanitization
- ✅ Environment variable protection
- ✅ CORS configuration
- ✅ SQL injection prevention (parameterized queries)

## 📧 Support

For issues or questions:
- Email: marakibgolder@gmail.com
- Open an issue on GitHub

## 📄 License

This project is open source and available for personal and commercial use.

## 🙏 Credits

- Icons: [Font Awesome](https://fontawesome.com/)
- Fonts: [Google Fonts](https://fonts.google.com/)
- AI: [Google Gemini](https://ai.google.dev/)
- Videos: [Pexels](https://www.pexels.com/) & [Mixkit](https://mixkit.co/)

---

**Made with ❤️ by MD Rakib Golder**
