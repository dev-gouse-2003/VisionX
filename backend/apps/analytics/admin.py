from django.contrib import admin
from .models import AIReport, AnalyticsSnapshot


@admin.register(AIReport)
class AIReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'report_type', 'generated_by', 'generated_at']
    list_filter = ['report_type']
    readonly_fields = ['id', 'generated_at']


@admin.register(AnalyticsSnapshot)
class AnalyticsSnapshotAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_complaints', 'new_complaints', 'resolved_complaints', 'governance_score']
    readonly_fields = ['id']
