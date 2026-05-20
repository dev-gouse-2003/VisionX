from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('monthly-trend/', views.MonthlyTrendView.as_view(), name='monthly_trend'),
    path('departments/', views.DepartmentAnalyticsView.as_view(), name='dept_analytics'),
    path('heatmap/', views.HeatmapView.as_view(), name='heatmap'),
    path('officers/', views.OfficerPerformanceView.as_view(), name='officer_performance'),
    path('transparency/', views.GovernanceTransparencyView.as_view(), name='transparency'),
    path('export/', views.ExportReportView.as_view(), name='export_report'),
]
