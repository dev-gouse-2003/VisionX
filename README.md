# 🏛️ VisionX — CivicPulse AI

> AI-Powered Public Service Delivery & Governance Intelligence Platform

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![Django](https://img.shields.io/badge/Django-4.2-green?logo=django)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss)

---

## ✨ Features

- 🤖 **AI Engine** — Auto-classify complaints, sentiment analysis, spam detection, delay prediction
- 🗺️ **Interactive Maps** — Pin complaint locations with Leaflet.js
- 👥 **Role-Based Access** — Admin, Officer, Citizen dashboards
- 📊 **Real-time Analytics** — KPIs, charts, department performance
- 🔔 **Notifications** — WebSocket real-time alerts
- 🌙 **Dark / Light Mode** — Persistent theme switching
- 🏢 **Department Management** — SLA tracking, performance rankings
- 👮 **Officer Assignment** — Assign complaints to officers from admin panel

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/VisionX.git
cd VisionX
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Load sample departments
python manage.py loaddata fixtures/sample_data.json

# Create demo users
python manage.py shell -c "
from apps.users.models import User, OfficerProfile, CitizenProfile
from apps.departments.models import Department

# Admin
User.objects.create_superuser(username='admin', email='admin@civicpulse.gov', password='Admin@123', first_name='Admin', last_name='User', role='admin')

# Citizen
c = User.objects.create_user(username='citizen', email='citizen@civicpulse.gov', password='Citizen@123', first_name='Jane', last_name='Citizen', role='citizen', is_verified=True)
CitizenProfile.objects.create(user=c, district='Central District', state='State')

# Officer
o = User.objects.create_user(username='officer', email='officer@civicpulse.gov', password='Officer@123', first_name='John', last_name='Smith', role='officer', is_verified=True)
dept = Department.objects.first()
OfficerProfile.objects.create(user=o, employee_id='OFF001', department=dept, designation='Senior Officer', is_available=True)
print('Demo users created!')
"

# Start backend
python manage.py runserver 0.0.0.0:8000
```

### 3. Frontend Setup
```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

### 4. Open in browser
- **App**: http://localhost:3000
- **API Docs**: http://localhost:8000/api/docs/

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@civicpulse.gov | Admin@123 |
| Officer | officer@civicpulse.gov | Officer@123 |
| Citizen | citizen@civicpulse.gov | Citizen@123 |

---

## 🏗️ Project Structure

```
VisionX/
├── backend/                  # Django REST API
│   ├── apps/
│   │   ├── users/            # Auth, profiles, RBAC
│   │   ├── complaints/       # Complaint CRUD & workflow
│   │   ├── departments/      # Department management
│   │   ├── analytics/        # Dashboard & reporting
│   │   ├── ai_engine/        # ML classification & assistant
│   │   └── notifications/    # Real-time notifications
│   ├── civicpulse/           # Django settings & URLs
│   ├── fixtures/             # Sample data
│   └── requirements.txt
│
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── layout/       # Sidebar, Topbar
│   │   │   ├── ui/           # KPICard, StatusBadge, Map
│   │   │   └── ai/           # AI Assistant panel
│   │   ├── pages/
│   │   │   ├── admin/        # Admin dashboard & management
│   │   │   ├── officer/      # Officer dashboard
│   │   │   ├── citizen/      # Citizen portal
│   │   │   └── auth/         # Login & Register
│   │   ├── store/            # Redux state management
│   │   ├── services/         # Axios API client
│   │   └── layouts/          # Auth & Dashboard layouts
│   └── package.json
│
├── docs/                     # API & DB documentation
├── .vscode/tasks.json        # VS Code run tasks
└── docker-compose.yml        # Docker setup
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Django | 4.2.9 | Web framework |
| Django REST Framework | 3.14 | REST API |
| SimpleJWT | 5.3 | JWT authentication |
| NLTK + Scikit-learn | latest | AI/ML features |
| SQLite | — | Development database |
| PostgreSQL | 15 | Production database |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2 | UI framework |
| Vite | 5.0 | Build tool |
| Redux Toolkit | 2.1 | State management |
| Tailwind CSS | 3.4 | Styling |
| Framer Motion | 11 | Animations |
| Leaflet.js | 1.9 | Interactive maps |
| Recharts | 2.10 | Data visualization |

---

## 📡 API Endpoints

```
POST   /api/auth/login/              Login
POST   /api/auth/register/           Register citizen
GET    /api/auth/profile/            Get current user

GET    /api/complaints/              List complaints (role-filtered)
POST   /api/complaints/              Submit complaint
PATCH  /api/complaints/{id}/         Update complaint
GET    /api/complaints/stats/        Complaint statistics

GET    /api/departments/             List departments
GET    /api/departments/rankings/    Performance rankings

GET    /api/analytics/dashboard/     Dashboard KPIs
GET    /api/analytics/monthly-trend/ Monthly trends
GET    /api/analytics/heatmap/       Geographic heatmap

POST   /api/ai/classify/             Classify complaint text
POST   /api/ai/assistant/            Ask governance questions
POST   /api/ai/spam-detect/          Detect spam

GET    /api/notifications/           List notifications
```

---

## 🐳 Docker (Optional)

```bash
# Run everything with Docker
docker compose up --build
```

---

## 📄 License

MIT License — feel free to use and modify.
