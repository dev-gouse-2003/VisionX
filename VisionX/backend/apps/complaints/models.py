from django.db import models
import uuid


class Complaint(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
        ('rejected', 'Rejected'),
        ('escalated', 'Escalated'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    CATEGORY_CHOICES = [
        ('water', 'Water Supply'),
        ('roads', 'Roads & Infrastructure'),
        ('electricity', 'Electricity'),
        ('healthcare', 'Healthcare'),
        ('sanitation', 'Sanitation & Waste'),
        ('transport', 'Public Transport'),
        ('emergency', 'Emergency'),
        ('public_safety', 'Public Safety'),
        ('education', 'Education'),
        ('housing', 'Housing'),
        ('environment', 'Environment'),
        ('other', 'Other'),
    ]

    SENTIMENT_CHOICES = [
        ('angry', 'Angry'),
        ('frustrated', 'Frustrated'),
        ('urgent', 'Urgent'),
        ('neutral', 'Neutral'),
        ('satisfied', 'Satisfied'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.CharField(max_length=20, unique=True, blank=True)
    citizen = models.ForeignKey(
        'users.CitizenProfile', on_delete=models.CASCADE, related_name='complaints'
    )
    department = models.ForeignKey(
        'departments.Department', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='complaints'
    )
    assigned_officer = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='assigned_complaints'
    )

    title = models.CharField(max_length=300)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    sentiment = models.CharField(max_length=20, choices=SENTIMENT_CHOICES, default='neutral')

    # Location
    district = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # AI fields
    ai_summary = models.TextField(blank=True)
    ai_category_confidence = models.FloatField(default=0.0)
    is_spam = models.BooleanField(default=False)
    spam_score = models.FloatField(default=0.0)
    is_duplicate = models.BooleanField(default=False)
    duplicate_of = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='duplicates'
    )
    image_verified = models.BooleanField(default=True)
    image_mismatch_reason = models.TextField(blank=True)
    delay_predicted = models.BooleanField(default=False)
    delay_probability = models.FloatField(default=0.0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    sla_deadline = models.DateTimeField(null=True, blank=True)
    is_emergency = models.BooleanField(default=False)
    is_voice_complaint = models.BooleanField(default=False)
    language = models.CharField(max_length=10, default='en')

    class Meta:
        db_table = 'complaints'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.ticket_number}] {self.title}"

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            import random
            import string
            self.ticket_number = 'CP' + ''.join(random.choices(string.digits, k=8))
        super().save(*args, **kwargs)

    @property
    def resolution_time_hours(self):
        if self.resolved_at and self.created_at:
            delta = self.resolved_at - self.created_at
            return round(delta.total_seconds() / 3600, 1)
        return None

    @property
    def is_overdue(self):
        from django.utils import timezone
        if self.sla_deadline and self.status not in ['resolved', 'closed']:
            return timezone.now() > self.sla_deadline
        return False


class ComplaintAttachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='complaint_attachments/')
    file_type = models.CharField(max_length=50)
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'complaint_attachments'


class ComplaintHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='history')
    changed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20, blank=True)
    comment = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'complaint_history'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.complaint.ticket_number}: {self.old_status} -> {self.new_status}"


class Feedback(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    complaint = models.OneToOneField(Complaint, on_delete=models.CASCADE, related_name='feedback')
    citizen = models.ForeignKey('users.CitizenProfile', on_delete=models.CASCADE)
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True)
    is_satisfied = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'feedback'

    def __str__(self):
        return f"Feedback for {self.complaint.ticket_number}: {self.rating}/5"
