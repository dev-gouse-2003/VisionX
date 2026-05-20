from .models import AuditLog


class AuditLogMiddleware:
    TRACKED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
    SKIP_PATHS = ['/api/auth/login/', '/api/auth/refresh/', '/api/schema/']

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if (
            request.method in self.TRACKED_METHODS
            and request.path not in self.SKIP_PATHS
            and hasattr(request, 'user')
            and request.user.is_authenticated
            and response.status_code < 400
        ):
            try:
                action_map = {
                    'POST': 'create',
                    'PUT': 'update',
                    'PATCH': 'update',
                    'DELETE': 'delete',
                }
                AuditLog.objects.create(
                    user=request.user,
                    action=action_map.get(request.method, 'view'),
                    resource=request.path,
                    ip_address=self.get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                )
            except Exception:
                pass
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')
