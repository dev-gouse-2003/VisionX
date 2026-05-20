from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta, date
from apps.complaints.models import Complaint, Feedback
from apps.departments.models import Department
from apps.users.models import User
from apps.users.permissions import IsAdminOrOfficer


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        today = now.date()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        total = Complaint.objects.count()
        resolved = Complaint.objects.filter(status='resolved').count()
        pending = Complaint.objects.filter(status__in=['submitted', 'under_review', 'in_progress']).count()
        today_new = Complaint.objects.filter(created_at__date=today).count()
        today_resolved = Complaint.objects.filter(resolved_at__date=today).count()
        critical = Complaint.objects.filter(priority='critical', status__in=['submitted', 'under_review', 'in_progress']).count()
        emergency = Complaint.objects.filter(is_emergency=True, status__in=['submitted', 'under_review', 'in_progress']).count()
        overdue = Complaint.objects.filter(
            sla_deadline__lt=now,
            status__in=['submitted', 'under_review', 'in_progress']
        ).count()

        resolution_rate = round((resolved / total * 100), 1) if total > 0 else 0

        # Weekly trend
        weekly_trend = []
        for i in range(7):
            day = today - timedelta(days=i)
            weekly_trend.append({
                'date': day.strftime('%a'),
                'new': Complaint.objects.filter(created_at__date=day).count(),
                'resolved': Complaint.objects.filter(resolved_at__date=day).count(),
            })
        weekly_trend.reverse()

        # Category breakdown
        categories = list(
            Complaint.objects.values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Sentiment breakdown
        sentiments = list(
            Complaint.objects.values('sentiment')
            .annotate(count=Count('id'))
        )

        # Priority breakdown
        priorities = list(
            Complaint.objects.values('priority')
            .annotate(count=Count('id'))
        )

        # Department performance
        top_departments = []
        for d in Department.objects.filter(is_active=True).order_by('-performance_score')[:5]:
            top_departments.append({
                'name': d.name,
                'performance_score': d.performance_score,
                'resolution_rate': d.resolution_rate,
                'total_complaints': d.total_complaints,
            })

        # District heatmap data
        districts = list(
            Complaint.objects.filter(district__isnull=False)
            .exclude(district='')
            .values('district')
            .annotate(count=Count('id'))
            .order_by('-count')[:15]
        )

        # Governance score
        avg_satisfaction = Feedback.objects.aggregate(avg=Avg('rating'))['avg'] or 0
        governance_score = round(
            resolution_rate * 0.4 +
            (100 - (overdue / max(total, 1) * 100)) * 0.3 +
            avg_satisfaction * 20 * 0.3,
            1
        )

        return Response({
            'kpis': {
                'total_complaints': total,
                'resolved': resolved,
                'pending': pending,
                'today_new': today_new,
                'today_resolved': today_resolved,
                'critical': critical,
                'emergency': emergency,
                'overdue': overdue,
                'resolution_rate': resolution_rate,
                'governance_score': governance_score,
                'avg_satisfaction': round(avg_satisfaction, 2),
                'total_officers': User.objects.filter(role='officer').count(),
                'total_citizens': User.objects.filter(role='citizen').count(),
                'total_departments': Department.objects.filter(is_active=True).count(),
            },
            'weekly_trend': weekly_trend,
            'category_breakdown': categories,
            'sentiment_breakdown': sentiments,
            'priority_breakdown': priorities,
            'top_departments': top_departments,
            'district_heatmap': districts,
        })


class MonthlyTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        months = int(request.query_params.get('months', 6))
        data = []
        for i in range(months):
            month_start = (now - timedelta(days=30 * i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_end = (month_start + timedelta(days=32)).replace(day=1)
            complaints = Complaint.objects.filter(created_at__gte=month_start, created_at__lt=month_end)
            data.append({
                'month': month_start.strftime('%b %Y'),
                'total': complaints.count(),
                'resolved': complaints.filter(status='resolved').count(),
                'pending': complaints.filter(status__in=['submitted', 'under_review', 'in_progress']).count(),
                'emergency': complaints.filter(is_emergency=True).count(),
            })
        data.reverse()
        return Response(data)


class DepartmentAnalyticsView(APIView):
    permission_classes = [IsAdminOrOfficer]

    def get(self, request):
        departments = Department.objects.filter(is_active=True).order_by('-performance_score')
        data = []
        for dept in departments:
            data.append({
                'id': str(dept.id),
                'name': dept.name,
                'code': dept.code,
                'color': dept.color,
                'total_complaints': dept.total_complaints,
                'resolved_complaints': dept.resolved_complaints,
                'pending_complaints': dept.pending_complaints,
                'avg_resolution_time': round(dept.avg_resolution_time, 1),
                'performance_score': dept.performance_score,
                'citizen_satisfaction': round(dept.citizen_satisfaction, 2),
                'resolution_rate': dept.resolution_rate,
            })
        return Response(data)


class HeatmapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        districts = (
            Complaint.objects
            .filter(district__isnull=False)
            .exclude(district='')
            .values('district', 'state')
            .annotate(
                total=Count('id'),
                resolved=Count('id', filter=Q(status='resolved')),
                pending=Count('id', filter=Q(status__in=['submitted', 'under_review', 'in_progress'])),
                critical=Count('id', filter=Q(priority='critical')),
            )
            .order_by('-total')
        )
        return Response(list(districts))


class OfficerPerformanceView(APIView):
    permission_classes = [IsAdminOrOfficer]

    def get(self, request):
        from apps.users.models import OfficerProfile
        officers = (
            User.objects.filter(role='officer')
            .annotate(
                active=Count('assigned_complaints', filter=Q(
                    assigned_complaints__status__in=['submitted', 'under_review', 'in_progress']
                )),
                total_assigned=Count('assigned_complaints'),
                resolved_count=Count('assigned_complaints', filter=Q(
                    assigned_complaints__status='resolved'
                )),
            )
            .select_related('officer_profile')
        )
        data = []
        for o in officers:
            resolution_rate = round((o.resolved_count / max(o.total_assigned, 1)) * 100, 1)
            data.append({
                'id': str(o.id),
                'name': o.full_name,
                'email': o.email,
                'active_complaints': o.active,
                'total_assigned': o.total_assigned,
                'resolved': o.resolved_count,
                'resolution_rate': resolution_rate,
                'performance_score': getattr(getattr(o, 'officer_profile', None), 'performance_score', 0),
                'department': getattr(getattr(getattr(o, 'officer_profile', None), 'department', None), 'name', 'N/A'),
            })
        data.sort(key=lambda x: x['performance_score'], reverse=True)
        return Response(data)


class GovernanceTransparencyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total = Complaint.objects.count()
        resolved = Complaint.objects.filter(status='resolved').count()
        now = timezone.now()
        overdue = Complaint.objects.filter(
            sla_deadline__lt=now,
            status__in=['submitted', 'under_review', 'in_progress']
        ).count()
        avg_satisfaction = Feedback.objects.aggregate(avg=Avg('rating'))['avg'] or 0
        resolution_rate = (resolved / total * 100) if total > 0 else 0
        sla_compliance = 100 - (overdue / max(total, 1) * 100)
        transparency_index = round(
            resolution_rate * 0.35 +
            sla_compliance * 0.35 +
            avg_satisfaction * 20 * 0.30,
            1
        )
        return Response({
            'transparency_index': transparency_index,
            'resolution_rate': round(resolution_rate, 1),
            'sla_compliance': round(sla_compliance, 1),
            'citizen_satisfaction': round(avg_satisfaction, 2),
            'total_complaints': total,
            'resolved_complaints': resolved,
            'overdue_complaints': overdue,
        })


class ExportReportView(APIView):
    permission_classes = [IsAdminOrOfficer]

    def get(self, request):
        from django.http import HttpResponse
        import csv
        import io

        complaints = Complaint.objects.select_related(
            'citizen__user', 'department', 'assigned_officer'
        ).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            'Ticket', 'Title', 'Category', 'Status', 'Priority',
            'District', 'Department', 'Officer', 'Created', 'Resolved'
        ])
        for c in complaints:
            writer.writerow([
                c.ticket_number, c.title, c.category, c.status, c.priority,
                c.district,
                c.department.name if c.department else '',
                c.assigned_officer.full_name if c.assigned_officer else '',
                c.created_at.strftime('%Y-%m-%d'),
                c.resolved_at.strftime('%Y-%m-%d') if c.resolved_at else '',
            ])

        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="civicpulse_report.csv"'
        return response
