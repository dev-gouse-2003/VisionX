from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    complaint_ticket = serializers.CharField(source='complaint.ticket_number', read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'
