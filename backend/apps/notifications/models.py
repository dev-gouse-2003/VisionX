from django.db import models
import uuid


class Notification(models.Model):
    TYPE_CHOICES = [
        ('complaint_submitted', 'Complaint Submitted'),
        ('status_update', 'Status Update'),
        ('complaint_resolved', 'Complaint Resolved'),
        ('complaint_escalated', 'Complaint Escalated'),
        ('sla_warning', 'SLA Warning'),
        ('assignment', 'New Assignment'),
        ('emergency', 'Emergency Alert'),
        ('system', 'System Notification'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    complaint = models.ForeignKey(
        'complaints.Complaint', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='notifications'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email}: {self.title}"
