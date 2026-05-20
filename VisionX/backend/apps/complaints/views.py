from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count, Avg, Q
from datetime import timedelta
from .models import Complaint, Feedback, ComplaintHistory
from .serializers import (
    ComplaintListSerializer, ComplaintDetailSerializer,
    ComplaintCreateSerializer, ComplaintUpdateSerializer,
    FeedbackSerializer,
)
from apps.users.permissions import IsAdmin, IsAdminOrOfficer


class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.select_related(
        'citizen__user', 'department', 'assigned_officer'
    ).prefetch_related('attachments', 'history')
    filterset_fields = ['status', 'priority', 'category', 'district', 'state', 'is_emergency', 'is_spam']
    search_fields = ['title', 'description', 'ticket_number', 'citizen__user__email']
    ordering_fields = ['created_at', 'priority', 'status', 'sla_deadline']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return ComplaintCreateSerializer
        if self.action in ['update', 'partial_update']:
            return ComplaintUpdateSerializer
        if self.action == 'retrieve':
            return ComplaintDetailSerializer
        return ComplaintListSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        if self.action in ['update', 'partial_update']:
            return [IsAdminOrOfficer()]
        if self.action == 'destroy':
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'citizen':
            # Citizens only see their own complaints
            qs = qs.filter(citizen__user=user)
        elif user.role == 'officer':
            # Officers see: complaints assigned to them + all unassigned complaints
            qs = qs.filter(
                Q(assigned_officer=user) | Q(assigned_officer__isnull=True)
            )
        # Admins see everything (no filter)
        return qs

    def perform_create(self, serializer):
        from apps.users.models import User as UserModel
        user = self.request.user

        # Only citizens can submit complaints
        if user.role != 'citizen':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only citizens can submit complaints.")

        citizen_profile = user.citizen_profile
        complaint = serializer.save(citizen=citizen_profile)

        # Set SLA deadline based on department
        sla_hours = complaint.department.sla_hours if complaint.department else 72
        complaint.sla_deadline = timezone.now() + timedelta(hours=sla_hours)

        # Auto-assign to an available officer if one exists
        available_officer = UserModel.objects.filter(
            role='officer',
            officer_profile__is_available=True
        ).order_by('officer_profile__total_assigned').first()

        if available_officer:
            complaint.assigned_officer = available_officer
            # Update officer stats
            try:
                available_officer.officer_profile.total_assigned += 1
                available_officer.officer_profile.save(update_fields=['total_assigned'])
            except Exception:
                pass

        complaint.save(update_fields=['sla_deadline', 'assigned_officer'])

        # Run AI processing synchronously
        from apps.ai_engine.tasks import process_complaint_ai
        process_complaint_ai(str(complaint.id))

        # Update citizen stats
        citizen_profile.total_complaints += 1
        citizen_profile.save(update_fields=['total_complaints'])

    @action(detail=False, methods=['get'])
    def my_complaints(self, request):
        if request.user.role != 'citizen':
            return Response({'error': 'Only citizens can access this'}, status=403)
        complaints = Complaint.objects.filter(citizen__user=request.user).order_by('-created_at')
        serializer = ComplaintListSerializer(complaints, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def assigned(self, request):
        if request.user.role not in ['officer', 'admin']:
            return Response({'error': 'Access denied'}, status=403)
        complaints = Complaint.objects.filter(assigned_officer=request.user).order_by('-created_at')
        serializer = ComplaintListSerializer(complaints, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        now = timezone.now()
        complaints = Complaint.objects.filter(
            sla_deadline__lt=now,
            status__in=['submitted', 'under_review', 'in_progress']
        )
        serializer = ComplaintListSerializer(complaints, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def emergency(self, request):
        complaints = Complaint.objects.filter(
            is_emergency=True,
            status__in=['submitted', 'under_review', 'in_progress']
        )
        serializer = ComplaintListSerializer(complaints, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def escalate(self, request, pk=None):
        complaint = self.get_object()
        old_status = complaint.status
        complaint.status = 'escalated'
        complaint.priority = 'critical'
        complaint.save()
        ComplaintHistory.objects.create(
            complaint=complaint,
            changed_by=request.user,
            old_status=old_status,
            new_status='escalated',
            comment=request.data.get('reason', 'Escalated by officer'),
        )
        return Response({'message': 'Complaint escalated successfully'})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        now = timezone.now()
        today = now.date()
        qs = self.get_queryset()
        return Response({
            'total': qs.count(),
            'today': qs.filter(created_at__date=today).count(),
            'pending': qs.filter(status__in=['submitted', 'under_review', 'in_progress']).count(),
            'resolved': qs.filter(status='resolved').count(),
            'critical': qs.filter(priority='critical').count(),
            'overdue': qs.filter(
                sla_deadline__lt=now,
                status__in=['submitted', 'under_review', 'in_progress']
            ).count(),
            'emergency': qs.filter(is_emergency=True).count(),
        })


class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        complaint = serializer.validated_data['complaint']
        citizen = self.request.user.citizen_profile
        feedback = serializer.save(citizen=citizen)
        avg = Feedback.objects.filter(citizen=citizen).aggregate(avg=Avg('rating'))['avg'] or 0
        citizen.satisfaction_score = avg
        citizen.save(update_fields=['satisfaction_score'])
        if complaint.department:
            dept_avg = Feedback.objects.filter(
                complaint__department=complaint.department
            ).aggregate(avg=Avg('rating'))['avg'] or 0
            complaint.department.citizen_satisfaction = dept_avg
            complaint.department.save(update_fields=['citizen_satisfaction'])
