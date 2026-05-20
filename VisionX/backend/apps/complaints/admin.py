from django.contrib import admin
from .models import Complaint, ComplaintAttachment, ComplaintHistory, Feedback


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ['ticket_number', 'title', 'category', 'status', 'priority', 'district', 'created_at']
    list_filter = ['status', 'priority', 'category', 'is_emergency', 'is_spam']
    search_fields = ['ticket_number', 'title', 'citizen__user__email']
    readonly_fields = ['id', 'ticket_number', 'created_at', 'updated_at']


@admin.register(ComplaintHistory)
class ComplaintHistoryAdmin(admin.ModelAdmin):
    list_display = ['complaint', 'old_status', 'new_status', 'changed_by', 'timestamp']
    readonly_fields = ['id', 'timestamp']


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['complaint', 'rating', 'is_satisfied', 'created_at']
    list_filter = ['rating', 'is_satisfied']
