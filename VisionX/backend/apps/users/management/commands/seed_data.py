"""
Management command to seed CivicPulse AI with sample data.
Run: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
import uuid


class Command(BaseCommand):
    help = 'Seed database with sample data for CivicPulse AI'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('🌱 Seeding CivicPulse AI database...'))
        self.create_departments()
        self.create_users()
        self.create_complaints()
        self.stdout.write(self.style.SUCCESS('✅ Database seeded successfully!'))
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('Demo Accounts:'))
        self.stdout.write('  Admin:   admin@civicpulse.gov / Admin@123')
        self.stdout.write('  Officer: officer@civicpulse.gov / Officer@123')
        self.stdout.write('  Citizen: citizen@civicpulse.gov / Citizen@123')

    def create_departments(self):
        from apps.departments.models import Department
        departments = [
            {'name': 'Water Supply Department', 'code': 'WATER', 'icon': 'droplets', 'color': '#3b82f6', 'sla_hours': 48},
            {'name': 'Roads & Infrastructure', 'code': 'ROADS', 'icon': 'road', 'color': '#f59e0b', 'sla_hours': 72},
            {'name': 'Electricity Department', 'code': 'ELEC', 'icon': 'zap', 'color': '#eab308', 'sla_hours': 24},
            {'name': 'Healthcare Department', 'code': 'HEALTH', 'icon': 'heart-pulse', 'color': '#ef4444', 'sla_hours': 12},
            {'name': 'Sanitation & Waste', 'code': 'SANIT', 'icon': 'trash-2', 'color': '#10b981', 'sla_hours': 48},
            {'name': 'Public Transport', 'code': 'TRANS', 'icon': 'bus', 'color': '#8b5cf6', 'sla_hours': 72},
            {'name': 'Emergency Services', 'code': 'EMERG', 'icon': 'siren', 'color': '#dc2626', 'sla_hours': 4},
            {'name': 'Public Safety', 'code': 'SAFETY', 'icon': 'shield', 'color': '#6366f1', 'sla_hours': 24},
        ]
        for d in departments:
            obj, created = Department.objects.get_or_create(code=d['code'], defaults={
                **d,
                'total_complaints': random.randint(50, 200),
                'resolved_complaints': random.randint(30, 150),
                'pending_complaints': random.randint(5, 50),
                'avg_resolution_time': round(random.uniform(10, 80), 1),
                'performance_score': round(random.uniform(60, 95), 1),
                'citizen_satisfaction': round(random.uniform(3.0, 4.8), 1),
            })
            if created:
                self.stdout.write(f'  + Department: {d["name"]}')
        self.stdout.write(self.style.SUCCESS('  ✓ Departments ready'))

    def create_users(self):
        from apps.users.models import User, CitizenProfile, OfficerProfile
        from apps.departments.models import Department

        # Admin
        admin, created = User.objects.get_or_create(
            email='admin@civicpulse.gov',
            defaults={
                'username': 'admin_civicpulse',
                'first_name': 'Admin',
                'last_name': 'CivicPulse',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
            }
        )
        if created:
            admin.set_password('Admin@123')
            admin.save()
            self.stdout.write('  + Admin user created')

        departments = list(Department.objects.all())

        # Officers
        officer_data = [
            ('officer@civicpulse.gov', 'Rajesh', 'Kumar', 'EMP001'),
            ('officer2@civicpulse.gov', 'Priya', 'Sharma', 'EMP002'),
            ('officer3@civicpulse.gov', 'Amit', 'Singh', 'EMP003'),
        ]
        for email, first, last, emp_id in officer_data:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0].replace('.', '_'),
                    'first_name': first,
                    'last_name': last,
                    'role': 'officer',
                    'is_verified': True,
                }
            )
            if created:
                user.set_password('Officer@123')
                user.save()
                dept = random.choice(departments) if departments else None
                OfficerProfile.objects.create(
                    user=user,
                    employee_id=emp_id,
                    department=dept,
                    designation='Field Officer',
                    district='Central District',
                    state='Maharashtra',
                    performance_score=round(random.uniform(60, 95), 1),
                    total_assigned=random.randint(20, 100),
                    total_resolved=random.randint(15, 80),
                )
                self.stdout.write(f'  + Officer: {first} {last}')

        # Citizens
        citizen_data = [
            ('citizen@civicpulse.gov', 'Rahul', 'Verma'),
            ('citizen2@civicpulse.gov', 'Anita', 'Patel'),
            ('citizen3@civicpulse.gov', 'Mohan', 'Das'),
        ]
        districts = ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane']
        for email, first, last in citizen_data:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0].replace('.', '_'),
                    'first_name': first,
                    'last_name': last,
                    'role': 'citizen',
                    'is_verified': True,
                }
            )
            if created:
                user.set_password('Citizen@123')
                user.save()
                CitizenProfile.objects.create(
                    user=user,
                    district=random.choice(districts),
                    state='Maharashtra',
                    total_complaints=random.randint(1, 10),
                    resolved_complaints=random.randint(0, 8),
                    satisfaction_score=round(random.uniform(3.0, 5.0), 1),
                )
                self.stdout.write(f'  + Citizen: {first} {last}')

        self.stdout.write(self.style.SUCCESS('  ✓ Users ready'))

    def create_complaints(self):
        from apps.complaints.models import Complaint, ComplaintHistory
        from apps.users.models import User, CitizenProfile
        from apps.departments.models import Department

        if Complaint.objects.count() > 10:
            self.stdout.write('  ✓ Complaints already exist, skipping')
            return

        citizens = list(CitizenProfile.objects.all())
        departments = list(Department.objects.all())
        officers = list(User.objects.filter(role='officer'))

        if not citizens:
            self.stdout.write(self.style.WARNING('  ⚠ No citizens found, skipping complaints'))
            return

        categories = ['water', 'roads', 'electricity', 'healthcare', 'sanitation', 'transport', 'emergency', 'public_safety']
        statuses = ['submitted', 'under_review', 'in_progress', 'resolved', 'closed', 'submitted', 'in_progress']
        priorities = ['low', 'medium', 'medium', 'high', 'critical']
        sentiments = ['angry', 'frustrated', 'urgent', 'neutral', 'satisfied']
        districts = ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Kolhapur', 'Solapur']

        sample_complaints = [
            ('Water supply disruption in residential area', 'water', 'The water supply has been disrupted for the past 3 days in our residential area. Residents are facing severe hardship especially elderly and children.'),
            ('Large pothole causing accidents on main road', 'roads', 'There is a large pothole on the main road near the market area. Two accidents have already occurred due to this. Immediate repair is needed.'),
            ('Streetlight not working for 2 weeks', 'electricity', 'The streetlight near our colony has not been working for the past 2 weeks. This is causing safety issues at night especially for women.'),
            ('Garbage not collected for 5 days', 'sanitation', 'Garbage has not been collected from our area for the past 5 days. The smell is unbearable and it is a health hazard for residents.'),
            ('Hospital staff rude behavior complaint', 'healthcare', 'The staff at the government hospital were extremely rude to patients. They refused to attend to emergency cases and demanded bribes.'),
            ('Bus route cancelled without notice', 'transport', 'The bus route 42 has been cancelled without any prior notice. Hundreds of daily commuters are affected and have no alternative transport.'),
            ('Sewage overflow near school', 'sanitation', 'Sewage is overflowing near the primary school. Children are being exposed to unhygienic conditions. This is an urgent health emergency.'),
            ('Power outage affecting entire colony', 'electricity', 'There has been a complete power outage in our colony for the past 6 hours. No response from the electricity department despite multiple calls.'),
            ('Contaminated water supply complaint', 'water', 'The water supplied to our area is contaminated and has a foul smell. Several residents have fallen sick after consuming this water.'),
            ('Road repair needed urgently near hospital', 'roads', 'The road leading to the district hospital is in very poor condition with multiple potholes. Ambulances are having difficulty reaching the hospital.'),
            ('Illegal construction blocking road', 'housing', 'An illegal construction is blocking the main road in our area. The contractor is not listening to residents and the road is now impassable.'),
            ('Noise pollution from factory at night', 'environment', 'A factory near our residential area is operating at night causing extreme noise pollution. Residents cannot sleep and children are affected.'),
            ('Emergency: Fire in slum area', 'emergency', 'There is a fire in the slum area near the railway station. Multiple houses are burning. Emergency services needed immediately.'),
            ('Public toilet in very poor condition', 'sanitation', 'The public toilet near the bus stand is in extremely poor condition. It has not been cleaned for weeks and is unusable.'),
            ('Tree fallen blocking road after storm', 'environment', 'A large tree has fallen on the main road after last night storm. The road is completely blocked and traffic is severely affected.'),
            ('Water meter not working for 3 months', 'water', 'Our water meter has not been working for the past 3 months. Despite multiple complaints to the water department, no action has been taken.'),
            ('Broken traffic signal causing accidents', 'roads', 'The traffic signal at the main intersection has been broken for a week. This is causing traffic chaos and accidents during peak hours.'),
            ('Medicine shortage at government hospital', 'healthcare', 'Essential medicines are not available at the government hospital. Patients are being asked to buy expensive medicines from private pharmacies.'),
            ('Stray dogs menace in locality', 'public_safety', 'There are a large number of stray dogs in our locality that are attacking residents. Three people have been bitten in the past week.'),
            ('School building in dangerous condition', 'education', 'The government school building has developed cracks and is in a dangerous condition. Parents are afraid to send their children to school.'),
        ]

        now = timezone.now()
        for i in range(40):
            citizen = random.choice(citizens)
            dept = random.choice(departments)
            status = random.choice(statuses)
            created_days_ago = random.randint(0, 90)
            created_at = now - timedelta(days=created_days_ago)

            title, cat, desc = random.choice(sample_complaints)

            complaint = Complaint(
                citizen=citizen,
                department=dept,
                title=title,
                description=desc,
                category=cat,
                status=status,
                priority=random.choice(priorities),
                sentiment=random.choice(sentiments),
                district=random.choice(districts),
                state='Maharashtra',
                ai_summary=desc[:150] + '...',
                ai_category_confidence=round(random.uniform(0.7, 0.99), 2),
                is_spam=random.random() < 0.05,
                delay_predicted=random.random() < 0.2,
                delay_probability=round(random.uniform(0.1, 0.8), 2),
                is_emergency=(cat == 'emergency'),
                sla_deadline=created_at + timedelta(hours=dept.sla_hours),
            )
            if officers:
                complaint.assigned_officer = random.choice(officers)
            if status in ['resolved', 'closed']:
                complaint.resolved_at = created_at + timedelta(hours=random.randint(2, dept.sla_hours))

            complaint.save()

            # Manually set created_at
            Complaint.objects.filter(pk=complaint.pk).update(created_at=created_at)

            # Add history for non-submitted
            if status != 'submitted':
                ComplaintHistory.objects.create(
                    complaint=complaint,
                    changed_by=random.choice(officers) if officers else None,
                    old_status='submitted',
                    new_status=status,
                    comment='Status updated by officer',
                )

        self.stdout.write(self.style.SUCCESS('  ✓ 40 sample complaints created'))
