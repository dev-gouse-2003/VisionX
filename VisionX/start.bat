@echo off
echo Starting CivicPulse AI...

if not exist .env (
    copy .env.example .env
    echo Created .env from .env.example
)

echo Building containers...
docker-compose up --build -d

echo Waiting for services...
timeout /t 15

echo Running migrations and seeding data...
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py seed_data

echo.
echo CivicPulse AI is running!
echo.
echo Frontend:    http://localhost:3000
echo Backend API: http://localhost:8000/api
echo API Docs:    http://localhost:8000/api/docs
echo Admin:       http://localhost:8000/admin
echo.
echo Demo Accounts:
echo   Admin:   admin@civicpulse.gov / Admin@123
echo   Officer: officer@civicpulse.gov / Officer@123
echo   Citizen: citizen@civicpulse.gov / Citizen@123
pause
