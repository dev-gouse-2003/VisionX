from rest_framework import serializers
from .models import Complaint, ComplaintAttachment, ComplaintHistory, Feedback
from apps.users.serializers import UserSerializer
from apps.departments.serializers import DepartmentSerializer


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintAttachment
        fields = ['id', 'file', 'file_type', 'file_name', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class ComplaintHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True)

    class Meta:
        model = ComplaintHistory
        fields = '__all__'


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ['id', 'citizen', 'created_at']


class ComplaintListSerializer(serializers.ModelSerializer):
    citizen_name = serializers.CharField(source='citizen.user.full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    officer_name = serializers.CharField(source='assigned_officer.full_name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    attachment_count = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = [
            'id', 'ticket_number', 'title', 'category', 'status', 'priority',
            'sentiment', 'district', 'state', 'created_at', 'updated_at',
            'sla_deadline', 'is_emergency', 'is_spam', 'delay_predicted',
            'citizen_name', 'department_name', 'officer_name',
            'is_overdue', 'attachment_count', 'ai_summary'
        ]

    def get_attachment_count(self, obj):
        return obj.attachments.count()


class ComplaintDetailSerializer(serializers.ModelSerializer):
    citizen_name = serializers.CharField(source='citizen.user.full_name', read_only=True)
    citizen_phone = serializers.CharField(source='citizen.user.phone', read_only=True)
    department_detail = DepartmentSerializer(source='department', read_only=True)
    officer_detail = UserSerializer(source='assigned_officer', read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    history = ComplaintHistorySerializer(many=True, read_only=True)
    feedback = FeedbackSerializer(read_only=True)
    is_overdue = serializers.ReadOnlyField()
    resolution_time_hours = serializers.ReadOnlyField()

    class Meta:
        model = Complaint
        fields = '__all__'


class ComplaintCreateSerializer(serializers.ModelSerializer):
    attachments = serializers.ListField(
        child=serializers.FileField(), write_only=True, required=False
    )

    class Meta:
        model = Complaint
        fields = [
            'title', 'description', 'category', 'district', 'state',
            'address', 'latitude', 'longitude', 'is_emergency',
            'is_voice_complaint', 'language', 'attachments'
        ]

    def create(self, validated_data):
        attachments = validated_data.pop('attachments', [])
        complaint = Complaint.objects.create(**validated_data)
        for file in attachments:
            ComplaintAttachment.objects.create(
                complaint=complaint,
                file=file,
                file_type=file.content_type,
                file_name=file.name,
            )
        return complaint


class ComplaintUpdateSerializer(serializers.ModelSerializer):
    comment = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Complaint
        fields = ['status', 'priority', 'assigned_officer', 'department', 'comment']

    def update(self, instance, validated_data):
        comment = validated_data.pop('comment', '')
        old_status = instance.status
        old_officer = instance.assigned_officer
        instance = super().update(instance, validated_data)

        # Log status change
        if old_status != instance.status:
            ComplaintHistory.objects.create(
                complaint=instance,
                changed_by=self.context['request'].user,
                old_status=old_status,
                new_status=instance.status,
                comment=comment,
            )
            if instance.status == 'resolved':
                from django.utils import timezone
                instance.resolved_at = timezone.now()
                instance.save(update_fields=['resolved_at'])

        # Log officer assignment
        if old_officer != instance.assigned_officer and instance.assigned_officer:
            ComplaintHistory.objects.create(
                complaint=instance,
                changed_by=self.context['request'].user,
                old_status=instance.status,
                new_status=instance.status,
                comment=f"Assigned to {instance.assigned_officer.get_full_name()}",
            )
            # Update officer stats
            try:
                profile = instance.assigned_officer.officer_profile
                profile.total_assigned += 1
                profile.save(update_fields=['total_assigned'])
            except Exception:
                pass

        return instance
