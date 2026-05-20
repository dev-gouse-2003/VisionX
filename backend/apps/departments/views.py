from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count
from .models import Department
from .serializers import DepartmentSerializer, DepartmentRankingSerializer
from apps.users.permissions import IsAdmin, IsAdminOrOfficer


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdmin()]

    @action(detail=False, methods=['get'])
    def rankings(self, request):
        departments = Department.objects.filter(is_active=True).order_by('-performance_score')
        data = []
        for rank, dept in enumerate(departments, 1):
            serializer = DepartmentRankingSerializer(dept, context={'rank': rank})
            data.append(serializer.data)
        return Response(data)

    @action(detail=True, methods=['get'])
    def performance(self, request, pk=None):
        dept = self.get_object()
        from apps.complaints.models import Complaint
        complaints = Complaint.objects.filter(department=dept)
        monthly_data = []
        from django.utils import timezone
        from datetime import timedelta
        now = timezone.now()
        for i in range(6):
            month_start = (now - timedelta(days=30 * i)).replace(day=1)
            month_end = (month_start + timedelta(days=32)).replace(day=1)
            month_complaints = complaints.filter(
                created_at__gte=month_start,
                created_at__lt=month_end
            )
            monthly_data.append({
                'month': month_start.strftime('%b %Y'),
                'total': month_complaints.count(),
                'resolved': month_complaints.filter(status='resolved').count(),
            })
        return Response({
            'department': DepartmentSerializer(dept).data,
            'monthly_trend': list(reversed(monthly_data)),
        })
