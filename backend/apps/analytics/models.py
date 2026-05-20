from django.db import models
import uuid


class AIReport(models.Model):
    REPORT_TYPES = [
        ('daily', 'Daily Report'),
        ('weekly', 'Weekly Report'),
        ('monthly', 'Monthly Report'),
        ('custom', 'Custom Report'),
        ('department', 'Department Report'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    data = models.JSONField(default=dict)
    generated_by = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True, blank=True
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    pdf_file = models.FileField(upload_to='reports/', blank=True, null=True)

    class Meta:
        db_table = 'ai_reports'
        ordering = ['-generated_at']

    def __str__(self):
        return self.title


class AnalyticsSnapshot(models.Model):
    """Daily analytics snapshots for trend analysis."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(unique=True)
    total_complaints = models.IntegerField(default=0)
    new_complaints = models.IntegerField(default=0)
    resolved_complaints = models.IntegerField(default=0)
    pending_complaints = models.IntegerField(default=0)
    emergency_complaints = models.IntegerField(default=0)
    avg_resolution_time = models.FloatField(default=0.0)
    citizen_satisfaction = models.FloatField(default=0.0)
    governance_score = models.FloatField(default=0.0)
    category_breakdown = models.JSONField(default=dict)
    district_breakdown = models.JSONField(default=dict)
    department_breakdown = models.JSONField(default=dict)

    class Meta:
        db_table = 'analytics_snapshots'
        ordering = ['-date']

    def __str__(self):
        return f"Analytics: {self.date}"
