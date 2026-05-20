# VisionX Project - Setup & Running Guide

## ✅ Project Status: RUNNING

### Services Running:
- **Frontend**: http://localhost:3000 (React + Vite)
- **Backend**: http://localhost:8000 (Django REST API)
- **Database**: SQLite (civicpulse.db)

---

## 🚀 Quick Start

### Prerequisites:
- Python 3.11+
- Node.js 18+
- Git

### Backend Setup:
```bash
cd VisionX/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Load sample data
python manage.py loaddata fixtures/sample_data.json

# Create superuser (if needed)
python manage.py createsuperuser

# Start development server
python manage.py runserver 0.0.0.0:8000
```

### Frontend Setup:
```bash
cd VisionX/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🔐 Test Credentials

### Admin Account:
- **Email**: admin@civicpulse.gov
- **Password**: Admin@123
- **Role**: Full system access

### Officer Account:
- **Email**: officer@civicpulse.gov
- **Password**: Officer@123
- **Role**: Complaint management & analytics

### Citizen Account:
- **Email**: citizen@civicpulse.gov
- **Password**: Citizen@123
- **Role**: Submit & track complaints

---

## 📚 API Documentation

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

---

## 🔗 Key Endpoints

### Authentication:
- `POST /api/auth/login/` - Login
- `POST /api/auth/register/` - Register
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/profile/` - Get profile

### Complaints:
- `GET /api/complaints/` - List complaints
- `POST /api/complaints/` - Submit complaint
- `GET /api/complaints/{id}/` - Get complaint details
- `PATCH /api/complaints/{id}/` - Update complaint

### Analytics:
- `GET /api/analytics/dashboard/` - Dashboard data
- `GET /api/analytics/monthly-trend/` - Trends
- `GET /api/analytics/departments/` - Department stats

### AI Services:
- `POST /api/ai/classify/` - Classify complaint
- `POST /api/ai/spam-detect/` - Detect spam
- `POST /api/ai/assistant/` - Ask governance questions

---

## 🛠️ Troubleshooting

### Backend not responding:
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <PID> /F

# Restart backend
python manage.py runserver 0.0.0.0:8000
```

### Frontend not loading:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

### Database issues:
```bash
# Reset database
rm civicpulse.db

# Rerun migrations
python manage.py migrate

# Load sample data
python manage.py loaddata fixtures/sample_data.json
```

---

## 📁 Project Structure

```
VisionX/
├── backend/
│   ├── apps/
│   │   ├── users/          # User management & auth
│   │   ├── complaints/     # Complaint system
│   │   ├── departments/    # Department management
│   │   ├── analytics/      # Analytics & reporting
│   │   ├── ai_engine/      # ML & NLP features
│   │   └── notifications/  # Real-time notifications
│   ├── civicpulse/         # Django settings
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux state
│   │   ├── services/       # API services
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── docs/
    ├── api-documentation.md
    └── database-schema.md
```

---

## 🎯 Features

### For Citizens:
- Submit complaints with file uploads
- Track complaint status in real-time
- Provide satisfaction feedback
- View personal dashboard

### For Officers:
- View assigned complaints
- Update complaint status
- Escalate critical issues
- View performance metrics

### For Admins:
- Full complaint management
- Department & officer management
- Real-time analytics dashboard
- Generate reports
- View audit logs
- AI-powered governance assistant

### AI/ML Features:
- Auto-classification of complaints
- Priority detection
- Sentiment analysis
- Spam detection
- Delay prediction
- Natural language Q&A

---

## 📊 Technology Stack

### Backend:
- Django 4.2.9
- Django REST Framework 3.14.0
- PostgreSQL/SQLite
- JWT Authentication
- NLTK & Scikit-learn (ML)

### Frontend:
- React 18.2.0
- Vite 5.0.12
- Redux Toolkit 2.1.0
- Tailwind CSS 3.4.1
- Framer Motion (animations)

---

## 🔒 Security Features

- JWT token-based authentication
- Role-based access control (RBAC)
- CORS protection
- CSRF protection
- Input validation
- SQL injection prevention
- Audit logging
- Secure file uploads

---

## 📝 Notes

- Development mode enabled (DEBUG=True)
- SQLite database for development
- Hot reload enabled for both frontend and backend
- API proxy configured in Vite for seamless development

---

## 🤝 Support

For issues or questions, check:
1. API Documentation: http://localhost:8000/api/docs/
2. Database Schema: docs/database-schema.md
3. API Guide: docs/api-documentation.md

