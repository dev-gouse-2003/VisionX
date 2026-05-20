"""
AI tasks - runs synchronously (no Celery needed for local dev)
"""


def process_complaint_ai(complaint_id: str):
    """Synchronous AI processing for a complaint."""
    from .classifier import classifier
    return classifier.process_complaint(complaint_id)


def update_department_analytics():
    """Update department performance metrics."""
    from apps.departments.models import Department
    from apps.complaints.models import Complaint
    from django.utils import timezone

    now = timezone.now()
    for dept in Department.objects.filter(is_active=True):
        complaints = Complaint.objects.filter(department=dept)
        total = complaints.count()
        resolved = complaints.filter(status='resolved').count()
        pending = complaints.filter(status__in=['submitted', 'under_review', 'in_progress']).count()

        resolved_complaints = complaints.filter(resolved_at__isnull=False)
        avg_time = 0
        if resolved_complaints.exists():
            times = []
            for c in resolved_complaints:
                if c.resolved_at and c.created_at:
                    delta = (c.resolved_at - c.created_at).total_seconds() / 3600
                    times.append(delta)
            if times:
                avg_time = sum(times) / len(times)

        resolution_rate = (resolved / total * 100) if total > 0 else 0
        overdue_count = complaints.filter(
            sla_deadline__lt=now,
            status__in=['submitted', 'under_review', 'in_progress']
        ).count()
        sla_compliance = 100 - (overdue_count / max(total, 1) * 100)
        performance = (resolution_rate * 0.5 + sla_compliance * 0.3 + dept.citizen_satisfaction * 4 * 0.2)

        dept.total_complaints = total
        dept.resolved_complaints = resolved
        dept.pending_complaints = pending
        dept.avg_resolution_time = round(avg_time, 2)
        dept.performance_score = round(min(performance, 100), 1)
        dept.save()
