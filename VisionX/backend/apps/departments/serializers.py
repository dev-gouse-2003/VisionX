from rest_framework import serializers
from .models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    resolution_rate = serializers.ReadOnlyField()
    head_officer_name = serializers.CharField(source='head_officer.full_name', read_only=True)
    officer_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = '__all__'

    def get_officer_count(self, obj):
        return obj.officers.count()


class DepartmentRankingSerializer(serializers.ModelSerializer):
    resolution_rate = serializers.ReadOnlyField()
    rank = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            'id', 'name', 'code', 'icon', 'color',
            'total_complaints', 'resolved_complaints', 'pending_complaints',
            'avg_resolution_time', 'performance_score', 'citizen_satisfaction',
            'resolution_rate', 'rank'
        ]

    def get_rank(self, obj):
        return self.context.get('rank', 0)
