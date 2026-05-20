from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .classifier import classifier
from .assistant import assistant


class ClassifyComplaintView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        text = request.data.get('text', '')
        if not text:
            return Response({'error': 'Text is required'}, status=400)
        category, confidence = classifier.classify_category(text)
        priority = classifier.detect_priority(text, category)
        sentiment = classifier.analyze_sentiment(text)
        summary = classifier.generate_summary(text)
        return Response({
            'category': category,
            'confidence': confidence,
            'priority': priority,
            'sentiment': sentiment,
            'summary': summary,
        })


class DetectSpamView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        text = request.data.get('text', '')
        if not text:
            return Response({'error': 'Text is required'}, status=400)
        from apps.complaints.models import Complaint
        recent = []
        if hasattr(request.user, 'citizen_profile'):
            recent = list(
                Complaint.objects.filter(citizen__user=request.user)
                .values_list('description', flat=True)[:20]
            )
        is_spam, score = classifier.detect_spam(text, recent)
        return Response({'is_spam': is_spam, 'spam_score': score})


class PredictDelayView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        delay_predicted, probability = classifier.predict_delay(data)
        return Response({'delay_predicted': delay_predicted, 'delay_probability': probability})


class GovernanceAssistantView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        query = request.data.get('query', '').strip()
        if not query:
            return Response({'error': 'Query is required'}, status=400)
        if len(query) > 500:
            return Response({'error': 'Query too long'}, status=400)
        result = assistant.answer(query)
        return Response(result)

    def get(self, request):
        return Response({
            'suggestions': [
                'Which department has highest delays?',
                'Which district has most unresolved complaints?',
                'Predict next month complaint trends',
                'Which officers are overloaded?',
                'Suggest governance improvements',
                'Which services have low citizen satisfaction?',
                'Show department performance rankings',
                'What is the overall resolution rate?',
                'Show category-wise complaint analysis',
                'How many emergency complaints are active?',
            ]
        })


class SentimentAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        text = request.data.get('text', '')
        if not text:
            return Response({'error': 'Text is required'}, status=400)
        sentiment = classifier.analyze_sentiment(text)
        return Response({'sentiment': sentiment})


class ProcessComplaintAIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, complaint_id):
        from .tasks import process_complaint_ai
        result = process_complaint_ai(complaint_id)
        return Response(result)
