from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('feedback', views.FeedbackViewSet)
router.register('', views.ComplaintViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
