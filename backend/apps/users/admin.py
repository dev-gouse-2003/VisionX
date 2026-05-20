from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, CitizenProfile, OfficerProfile, AuditLog


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'full_name', 'role', 'is_verified', 'created_at']
    list_filter = ['role', 'is_verified', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']
    fieldsets = UserAdmin.fieldsets + (
        ('CivicPulse', {'fields': ('role', 'phone', 'avatar', 'is_verified', 'preferred_language')}),
    )


@admin.register(CitizenProfile)
class CitizenProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'district', 'state', 'total_complaints', 'resolved_complaints']
    search_fields = ['user__email', 'district', 'state']


@admin.register(OfficerProfile)
class OfficerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'employee_id', 'department', 'performance_score', 'is_available']
    list_filter = ['department', 'is_available']
    search_fields = ['user__email', 'employee_id']


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'resource', 'ip_address', 'timestamp']
    list_filter = ['action']
    readonly_fields = ['id', 'timestamp']
