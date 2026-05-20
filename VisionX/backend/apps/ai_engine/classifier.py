"""
CivicPulse AI - Complaint Classification & NLP Engine
Lightweight implementation using keyword matching + basic NLP.
No heavy ML dependencies required.
"""
import re
import math
from typing import Dict, List, Tuple
from collections import Counter


# ─── Category Keywords ────────────────────────────────────────────────────────
CATEGORY_KEYWORDS = {
    'water': [
        'water', 'pipe', 'leak', 'supply', 'tap', 'drainage', 'flood', 'sewage',
        'contamination', 'drinking', 'shortage', 'borewell', 'pump', 'pipeline'
    ],
    'roads': [
        'road', 'pothole', 'street', 'highway', 'bridge', 'footpath', 'pavement',
        'traffic', 'signal', 'divider', 'construction', 'repair', 'broken', 'crack'
    ],
    'electricity': [
        'electricity', 'power', 'light', 'streetlight', 'transformer', 'wire',
        'voltage', 'outage', 'blackout', 'electric', 'meter', 'bill', 'connection', 'current'
    ],
    'healthcare': [
        'hospital', 'doctor', 'medicine', 'health', 'ambulance', 'clinic',
        'nurse', 'treatment', 'medical', 'pharmacy', 'vaccination', 'disease', 'patient'
    ],
    'sanitation': [
        'garbage', 'waste', 'trash', 'dustbin', 'cleaning', 'sweeping', 'drain',
        'sewage', 'toilet', 'smell', 'dirty', 'hygiene', 'litter', 'dump'
    ],
    'transport': [
        'bus', 'auto', 'taxi', 'metro', 'train', 'transport', 'vehicle',
        'route', 'fare', 'driver', 'conductor', 'stop', 'rickshaw'
    ],
    'emergency': [
        'emergency', 'urgent', 'fire', 'accident', 'death', 'injury', 'critical',
        'immediate', 'danger', 'threat', 'violence', 'attack', 'help', 'sos'
    ],
    'public_safety': [
        'crime', 'theft', 'robbery', 'police', 'security', 'harassment',
        'assault', 'unsafe', 'illegal', 'drug', 'gambling', 'eve teasing'
    ],
    'education': [
        'school', 'college', 'teacher', 'student', 'education', 'classroom',
        'textbook', 'scholarship', 'admission', 'exam', 'university', 'fees'
    ],
    'housing': [
        'house', 'building', 'construction', 'rent', 'eviction', 'shelter',
        'slum', 'encroachment', 'property', 'flat', 'apartment', 'demolition'
    ],
    'environment': [
        'pollution', 'noise', 'air', 'tree', 'park', 'garden',
        'deforestation', 'smoke', 'chemical', 'factory', 'industrial', 'dust'
    ],
}

PRIORITY_KEYWORDS = {
    'critical': [
        'emergency', 'urgent', 'fire', 'death', 'dying', 'critical', 'immediate',
        'life threatening', 'accident', 'explosion', 'flood', 'collapse', 'attack', 'sos'
    ],
    'high': [
        'serious', 'dangerous', 'unsafe', 'broken', 'no water', 'no electricity',
        'days', 'weeks', 'long time', 'children', 'elderly', 'hospital', 'sick', 'injured'
    ],
    'medium': [
        'problem', 'issue', 'complaint', 'not working', 'repair', 'fix',
        'inconvenience', 'delay', 'pending', 'request', 'need'
    ],
    'low': [
        'minor', 'small', 'suggestion', 'feedback', 'improvement', 'request',
        'when possible', 'not urgent', 'sometime'
    ],
}

SENTIMENT_KEYWORDS = {
    'angry': ['angry', 'furious', 'outraged', 'disgusting', 'terrible', 'worst', 'pathetic', 'useless', 'horrible', 'awful'],
    'frustrated': ['frustrated', 'tired', 'fed up', 'again', 'still', 'months', 'years', 'ignored', 'no response', 'repeated'],
    'urgent': ['urgent', 'immediately', 'asap', 'right now', 'emergency', 'critical', 'help', 'please', 'dying'],
    'satisfied': ['thank', 'good', 'great', 'excellent', 'resolved', 'happy', 'appreciate', 'satisfied', 'well done'],
}

POSITIVE_WORDS = {'good', 'great', 'excellent', 'resolved', 'happy', 'thank', 'appreciate', 'satisfied', 'well', 'nice'}
NEGATIVE_WORDS = {'bad', 'terrible', 'worst', 'horrible', 'awful', 'disgusting', 'pathetic', 'useless', 'broken', 'failed', 'angry', 'frustrated', 'urgent', 'emergency', 'danger', 'unsafe'}


class ComplaintClassifier:
    """Lightweight AI complaint classification engine."""

    def classify_category(self, text: str) -> Tuple[str, float]:
        text_lower = text.lower()
        scores = {}
        for category, keywords in CATEGORY_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            scores[category] = score

        if max(scores.values()) == 0:
            return 'other', 0.5

        best_category = max(scores, key=scores.get)
        total = sum(scores.values())
        confidence = scores[best_category] / total if total > 0 else 0.5
        return best_category, round(min(confidence, 1.0), 2)

    def detect_priority(self, text: str, category: str = '') -> str:
        text_lower = text.lower()
        if category == 'emergency':
            return 'critical'
        for priority in ['critical', 'high', 'medium', 'low']:
            if any(kw in text_lower for kw in PRIORITY_KEYWORDS[priority]):
                return priority
        return 'medium'

    def analyze_sentiment(self, text: str) -> str:
        text_lower = text.lower()
        for sentiment, keywords in SENTIMENT_KEYWORDS.items():
            if any(kw in text_lower for kw in keywords):
                return sentiment
        # Simple polarity
        words = set(text_lower.split())
        pos = len(words & POSITIVE_WORDS)
        neg = len(words & NEGATIVE_WORDS)
        if neg > pos + 1:
            return 'frustrated'
        elif pos > neg:
            return 'satisfied'
        return 'neutral'

    def generate_summary(self, text: str) -> str:
        sentences = re.split(r'[.!?]+', text.strip())
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        if not sentences:
            return text[:200]
        summary = '. '.join(sentences[:2])
        return summary[:300] + ('...' if len(summary) > 300 else '')

    def detect_spam(self, text: str, existing_complaints: List[str]) -> Tuple[bool, float]:
        text_lower = text.lower()
        # Repeated characters
        if re.search(r'(.)\1{4,}', text_lower):
            return True, 0.9
        # Too short
        if len(text.split()) < 3:
            return True, 0.8
        # Simple similarity check
        if existing_complaints:
            text_words = set(text_lower.split())
            for existing in existing_complaints[:10]:
                existing_words = set(existing.lower().split())
                if not text_words or not existing_words:
                    continue
                intersection = text_words & existing_words
                union = text_words | existing_words
                similarity = len(intersection) / len(union) if union else 0
                if similarity > 0.85:
                    return True, round(similarity, 2)
        return False, 0.0

    def predict_delay(self, complaint_data: Dict) -> Tuple[bool, float]:
        delay_score = 0.0
        high_delay_categories = ['roads', 'housing', 'environment']
        if complaint_data.get('category') in high_delay_categories:
            delay_score += 0.3
        priority_scores = {'low': 0.4, 'medium': 0.2, 'high': 0.1, 'critical': 0.0}
        delay_score += priority_scores.get(complaint_data.get('priority', 'medium'), 0.2)
        dept_pending = complaint_data.get('dept_pending_count', 0)
        if dept_pending > 50:
            delay_score += 0.3
        elif dept_pending > 20:
            delay_score += 0.15
        delay_score = min(delay_score, 1.0)
        return delay_score > 0.5, round(delay_score, 2)

    def process_complaint(self, complaint_id: str) -> Dict:
        from apps.complaints.models import Complaint
        try:
            complaint = Complaint.objects.get(id=complaint_id)
            text = f"{complaint.title} {complaint.description}"

            category, confidence = self.classify_category(text)
            if not complaint.category or complaint.category == 'other':
                complaint.category = category
            complaint.ai_category_confidence = confidence

            complaint.priority = self.detect_priority(text, complaint.category)
            complaint.sentiment = self.analyze_sentiment(text)
            complaint.ai_summary = self.generate_summary(text)

            recent = list(
                Complaint.objects.exclude(id=complaint_id)
                .filter(citizen=complaint.citizen)
                .values_list('description', flat=True)[:20]
            )
            is_spam, spam_score = self.detect_spam(text, recent)
            complaint.is_spam = is_spam
            complaint.spam_score = spam_score

            dept_pending = 0
            if complaint.department:
                dept_pending = Complaint.objects.filter(
                    department=complaint.department,
                    status__in=['submitted', 'under_review', 'in_progress']
                ).count()

            delay_predicted, delay_prob = self.predict_delay({
                'category': complaint.category,
                'priority': complaint.priority,
                'dept_pending_count': dept_pending,
            })
            complaint.delay_predicted = delay_predicted
            complaint.delay_probability = delay_prob

            if not complaint.department:
                from apps.departments.models import Department
                dept_map = {
                    'water': 'WATER', 'roads': 'ROADS', 'electricity': 'ELEC',
                    'healthcare': 'HEALTH', 'sanitation': 'SANIT', 'transport': 'TRANS',
                    'emergency': 'EMERG', 'public_safety': 'SAFETY',
                }
                dept_code = dept_map.get(complaint.category)
                if dept_code:
                    dept = Department.objects.filter(code=dept_code).first()
                    if dept:
                        complaint.department = dept

            complaint.save()
            return {'success': True, 'complaint_id': complaint_id}
        except Exception as e:
            return {'success': False, 'error': str(e)}


classifier = ComplaintClassifier()
