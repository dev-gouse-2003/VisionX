from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import update_session_auth_hash
from .models import User, AuditLog
from .serializers import (
    CustomTokenObtainPairSerializer, RegisterSerializer,
    UserSerializer, AuditLogSerializer, ChangePasswordSerializer
)
from .permissions import IsAdmin, IsAdminOrOfficer


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Registration successful',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.data.get('old_password')):
            return Response({'error': 'Wrong password'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.data.get('new_password'))
        user.save()
        return Response({'message': 'Password updated successfully'})


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        return qs

    def create(self, request, *args, **kwargs):
        """Admin creates a new officer user"""
        data = request.data.copy()
        password = data.pop('password', 'Officer@123')
        role = data.get('role', 'officer')

        # Build user
        user = User(
            email=data.get('email', ''),
            username=data.get('username', data.get('email', '').split('@')[0]),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            role=role,
            is_verified=True,
        )
        user.set_password(password)
        user.save()

        # Create officer profile if role is officer
        if role == 'officer':
            from apps.departments.models import Department
            dept_id = data.get('department_id')
            dept = Department.objects.filter(id=dept_id).first() if dept_id else None
            from apps.users.models import OfficerProfile
            import random, string
            OfficerProfile.objects.create(
                user=user,
                employee_id=data.get('employee_id', 'OFF' + ''.join(random.choices(string.digits, k=4))),
                department=dept,
                designation=data.get('designation', 'Field Officer'),
                district=data.get('district', ''),
                state=data.get('state', ''),
                is_available=True,
            )

        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def officers(self, request):
        officers = User.objects.filter(role='officer').select_related('officer_profile__department')
        serializer = self.get_serializer(officers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def officers_list(self, request):
        """Lightweight list for dropdowns — accessible to admin only"""
        officers = User.objects.filter(role='officer').select_related('officer_profile__department')
        data = [
            {
                'id': str(o.id),
                'full_name': o.get_full_name(),
                'email': o.email,
                'department': o.officer_profile.department.name if hasattr(o, 'officer_profile') and o.officer_profile.department else 'Unassigned',
                'designation': o.officer_profile.designation if hasattr(o, 'officer_profile') else '',
                'is_available': o.officer_profile.is_available if hasattr(o, 'officer_profile') else True,
                'total_assigned': o.officer_profile.total_assigned if hasattr(o, 'officer_profile') else 0,
            }
            for o in officers
        ]
        return Response(data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            'total_users': User.objects.count(),
            'citizens': User.objects.filter(role='citizen').count(),
            'officers': User.objects.filter(role='officer').count(),
            'admins': User.objects.filter(role='admin').count(),
        })


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related('user').all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ['action', 'resource', 'user']
    search_fields = ['resource', 'details']
    ordering_fields = ['timestamp']
