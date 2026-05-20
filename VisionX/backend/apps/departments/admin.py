from django.contrib import admin
from .models import Department


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'performance_score', 'total_complaints', 'resolution_rate', 'is_active']
    list_filter = ['is_active', 'state']
    search_fields = ['name', 'code']
    readonly_fields = ['total_complaints', 'resolved_complaints', 'pending_complaints', 'performance_score']
