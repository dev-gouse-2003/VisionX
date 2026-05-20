from django.db import models
import uuid


class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='building')
    color = models.CharField(max_length=20, default='#3B82F6')
    head_officer = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='headed_departments'
    )
    district = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    sla_hours = models.IntegerField(default=72)  # Service Level Agreement in hours
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Performance metrics (updated by analytics engine)
    total_complaints = models.IntegerField(default=0)
    resolved_complaints = models.IntegerField(default=0)
    pending_complaints = models.IntegerField(default=0)
    avg_resolution_time = models.FloatField(default=0.0)
    performance_score = models.FloatField(default=0.0)
    citizen_satisfaction = models.FloatField(default=0.0)

    class Meta:
        db_table = 'departments'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def resolution_rate(self):
        if self.total_complaints == 0:
            return 0
        return round((self.resolved_complaints / self.total_complaints) * 100, 1)
