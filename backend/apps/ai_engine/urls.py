from django.urls import path
from . import views

urlpatterns = [
    path('classify/', views.ClassifyComplaintView.as_view(), name='ai_classify'),
    path('spam-detect/', views.DetectSpamView.as_view(), name='ai_spam'),
    path('predict-delay/', views.PredictDelayView.as_view(), name='ai_delay'),
    path('assistant/', views.GovernanceAssistantView.as_view(), name='ai_assistant'),
    path('sentiment/', views.SentimentAnalysisView.as_view(), name='ai_sentiment'),
    path('process/<str:complaint_id>/', views.ProcessComplaintAIView.as_view(), name='ai_process'),
]
