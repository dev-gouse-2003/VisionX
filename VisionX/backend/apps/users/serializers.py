from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User, CitizenProfile, OfficerProfile, AuditLog


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['full_name'] = user.full_name
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'full_name': self.user.full_name,
            'role': self.user.role,
            'avatar': self.user.avatar.url if self.user.avatar else None,
        }
        return data


class CitizenProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CitizenProfile
        fields = '__all__'
        read_only_fields = ['user', 'total_complaints', 'resolved_complaints', 'satisfaction_score']


class OfficerProfileSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = OfficerProfile
        fields = '__all__'
        read_only_fields = ['user', 'performance_score', 'total_assigned', 'total_resolved']


class UserSerializer(serializers.ModelSerializer):
    citizen_profile = CitizenProfileSerializer(read_only=True)
    officer_profile = OfficerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'role', 'phone', 'avatar', 'is_verified', 'preferred_language',
            'created_at', 'citizen_profile', 'officer_profile'
        ]
        read_only_fields = ['id', 'created_at', 'is_verified']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    district = serializers.CharField(write_only=True, required=False)
    state = serializers.CharField(write_only=True, required=False)
    address = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name',
            'phone', 'password', 'password2',
            'district', 'state', 'address'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        district = validated_data.pop('district', '')
        state = validated_data.pop('state', '')
        address = validated_data.pop('address', '')
        validated_data.pop('password2')

        user = User.objects.create_user(
            **validated_data,
            role='citizen'
        )
        CitizenProfile.objects.create(
            user=user,
            district=district,
            state=state,
            address=address
        )
        return user


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
