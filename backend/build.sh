#!/usr/bin/env bash
# Render build script — runs on every deploy

set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Seed demo data (only if no users exist)
python manage.py shell << 'EOF'
from apps.users.models import User
from apps.departments.models import Department
from apps.complaints.models import Complaint
from apps.users.models import CitizenProfile, OfficerProfile

if User.objects.count() == 0:
    print("Seeding demo data...")

    # Load departments
    import subprocess
    subprocess.run(["python", "manage.py", "loaddata", "fixtures/sample_data.json"])

    # Admin
    admin = User.objects.create_superuser(
        username='admin', email='admin@civicpulse.gov',
        password='Admin@123', first_name='Admin', last_name='User',
        role='admin', is_verified=True
    )

    # Citizen
    citizen = User.objects.create_user(
        username='citizen', email='citizen@civicpulse.gov',
        password='Citizen@123', first_name='Jane', last_name='Citizen',
        role='citizen', is_verified=True
    )
    CitizenProfile.objects.create(
        user=citizen, district='Central District', state='State',
        address='123 Main Street', pincode='123456'
    )

    # Officers
    officers_data = [
        ('officer',  'John',   'Smith',   'OFF001', 'Senior Field Officer', 'WATER'),
        ('officer2', 'Priya',  'Sharma',  'OFF002', 'Roads Inspector',      'ROADS'),
        ('officer3', 'Rahul',  'Verma',   'OFF003', 'Electrical Engineer',  'ELEC'),
        ('officer4', 'Anita',  'Patel',   'OFF004', 'Health Inspector',     'HEALTH'),
        ('officer5', 'Suresh', 'Kumar',   'OFF005', 'Sanitation Officer',   'SANIT'),
    ]
    for username, first, last, emp_id, designation, dept_code in officers_data:
        o = User.objects.create_user(
            username=username,
            email=f'{username}@civicpulse.gov',
            password='Officer@123',
            first_name=first, last_name=last,
            role='officer', is_verified=True
        )
        dept = Department.objects.filter(code=dept_code).first()
        OfficerProfile.objects.create(
            user=o, employee_id=emp_id, department=dept,
            designation=designation, district='Central District',
            state='State', is_available=True,
            performance_score=85.0, total_assigned=30, total_resolved=25
        )

    # Demo complaints
    import random
    from django.utils import timezone
    from datetime import timedelta

    citizen_profile = citizen.citizen_profile
    officer_user = User.objects.get(email='officer@civicpulse.gov')

    complaints_data = [
        ('No water supply for 3 days', 'There has been no water supply in our area for the past 3 days.', 'water', 'high', 'WATER'),
        ('Pothole on Main Road', 'There is a large pothole on Main Road near the market causing accidents.', 'roads', 'medium', 'ROADS'),
        ('Frequent power cuts', 'We are experiencing frequent power cuts, sometimes 5-6 times a day.', 'electricity', 'high', 'ELEC'),
        ('Garbage not collected', 'Garbage has not been collected from our street for over a week.', 'sanitation', 'medium', 'SANIT'),
        ('Lack of doctors at PHC', 'The Primary Health Center has only 1 doctor for 500+ patients daily.', 'healthcare', 'critical', 'HEALTH'),
        ('Water pipeline leakage', 'There is a major water pipeline leakage on Main Street.', 'water', 'high', 'WATER'),
        ('Street lights not working', 'All street lights on Park Avenue have been non-functional for 2 weeks.', 'roads', 'low', 'ROADS'),
        ('Transformer not working', 'The transformer in our locality has stopped working. No power for 12 hours.', 'electricity', 'critical', 'ELEC'),
        ('Overflowing dustbin', 'The community dustbin is overflowing and creating a health hazard.', 'sanitation', 'medium', 'SANIT'),
        ('Medicine shortage', 'Essential medicines are out of stock at the government hospital.', 'healthcare', 'high', 'HEALTH'),
        ('Contaminated water supply', 'The water supplied appears contaminated with visible particles.', 'water', 'critical', 'WATER'),
        ('Road construction incomplete', 'Road construction started 6 months ago but is still incomplete.', 'roads', 'medium', 'ROADS'),
        ('Voltage fluctuation', 'Severe voltage fluctuations are damaging household appliances.', 'electricity', 'high', 'ELEC'),
        ('Drain blockage', 'The main drain is blocked causing water logging and foul smell.', 'sanitation', 'high', 'SANIT'),
        ('Ambulance not available', 'Called for ambulance in emergency but none was available.', 'healthcare', 'critical', 'HEALTH'),
    ]

    statuses = ['submitted', 'under_review', 'in_progress', 'resolved', 'closed']
    for i, (title, desc, category, priority, dept_code) in enumerate(complaints_data):
        dept = Department.objects.filter(code=dept_code).first()
        days_ago = random.randint(1, 45)
        status = statuses[i % len(statuses)]
        Complaint.objects.create(
            title=title, description=desc,
            category=category, priority=priority,
            status=status, citizen=citizen_profile,
            assigned_officer=officer_user,
            department=dept,
            district='Central District', state='State',
            is_emergency=(priority == 'critical'),
            sentiment=random.choice(['angry', 'frustrated', 'neutral', 'urgent']),
            created_at=timezone.now() - timedelta(days=days_ago),
        )

    print(f"✅ Seeded: {User.objects.count()} users, {Complaint.objects.count()} complaints")
else:
    print(f"✅ Data already exists: {User.objects.count()} users")
EOF
