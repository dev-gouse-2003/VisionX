"""
CivicPulse AI Governance Assistant
A ChatGPT-like assistant for governance analytics queries.
Uses semantic matching + real-time database analytics.
"""
import re
from typing import Dict, List, Tuple
from django.db.models import Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta


class GovernanceAssistant:
    """AI Governance Assistant for answering analytics questions."""

    INTENT_PATTERNS = {
        'highest_delays': [
            r'highest delay', r'most delay', r'slowest department',
            r'worst performing', r'most pending', r'overdue'
        ],
        'unresolved_district': [
            r'unresolved.*district', r'district.*unresolved',
            r'most complaints.*district', r'district.*complaints'
        ],
        'complaint_trends': [
            r'trend', r'predict', r'next month', r'forecast',
            r'increase', r'surge', r'pattern'
        ],
        'overloaded_officers': [
            r'overloaded officer', r'busy officer', r'officer.*workload',
            r'most assigned', r'officer.*complaints'
        ],
        'governance_improvements': [
            r'improve', r'suggestion', r'recommend', r'better',
            r'how to', r'what should', r'governance'
        ],
        'low_satisfaction': [
            r'low satisfaction', r'unhappy', r'dissatisfied',
            r'poor rating', r'bad service', r'citizen.*complaint'
        ],
        'department_performance': [
            r'department.*performance', r'best department', r'top department',
            r'department.*rank', r'performance.*department'
        ],
        'resolution_rate': [
            r'resolution rate', r'resolved', r'completion rate',
            r'how many resolved', r'resolved complaints'
        ],
        'category_analysis': [
            r'category', r'type of complaint', r'water.*complaint',
            r'road.*complaint', r'electricity.*complaint'
        ],
        'emergency_status': [
            r'emergency', r'critical', r'urgent complaint', r'high priority'
        ],
        'general_stats': [
            r'total complaint', r'how many complaint', r'statistics',
            r'overview', r'summary', r'dashboard'
        ],
    }

    def detect_intent(self, query: str) -> str:
        """Detect the intent of the governance query."""
        query_lower = query.lower()
        for intent, patterns in self.INTENT_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, query_lower):
                    return intent
        return 'general_stats'

    def answer(self, query: str) -> Dict:
        """Generate an intelligent answer to a governance query."""
        intent = self.detect_intent(query)
        handler = getattr(self, f'_handle_{intent}', self._handle_general_stats)
        try:
            result = handler(query)
            result['intent'] = intent
            result['query'] = query
            return result
        except Exception as e:
            return {
                'intent': intent,
                'query': query,
                'answer': f"I encountered an error processing your query: {str(e)}",
                'data': {},
                'suggestions': self._get_suggestions(),
            }

    def _handle_highest_delays(self, query: str) -> Dict:
        from apps.departments.models import Department
        from apps.complaints.models import Complaint
        from django.utils import timezone

        now = timezone.now()
        departments = Department.objects.annotate(
            overdue_count=Count(
                'complaints',
                filter=Q(
                    complaints__sla_deadline__lt=now,
                    complaints__status__in=['submitted', 'under_review', 'in_progress']
                )
            )
        ).order_by('-overdue_count')[:5]

        dept_data = [
            {
                'name': d.name,
                'overdue': d.overdue_count,
                'avg_resolution': round(d.avg_resolution_time, 1),
                'performance_score': d.performance_score,
            }
            for d in departments
        ]

        top = dept_data[0] if dept_data else {}
        answer = (
            f"🚨 **{top.get('name', 'N/A')}** has the highest delays with "
            f"**{top.get('overdue', 0)} overdue complaints** and an average resolution time of "
            f"**{top.get('avg_resolution', 0)} hours**.\n\n"
            f"Top 5 departments with delays are shown below. "
            f"Consider reallocating resources or escalating pending complaints."
        ) if top else "No delay data available currently."

        return {
            'answer': answer,
            'data': {'departments': dept_data},
            'chart_type': 'bar',
            'suggestions': [
                'Which officers are overloaded?',
                'Suggest governance improvements',
                'Show department performance rankings',
            ]
        }

    def _handle_unresolved_district(self, query: str) -> Dict:
        from apps.complaints.models import Complaint
        districts = (
            Complaint.objects
            .filter(status__in=['submitted', 'under_review', 'in_progress'])
            .values('district')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        district_data = list(districts)
        top = district_data[0] if district_data else {}
        answer = (
            f"📍 **{top.get('district', 'N/A')}** has the most unresolved complaints "
            f"with **{top.get('count', 0)} pending issues**.\n\n"
            f"Focus resources on this district to improve resolution rates."
        ) if top else "No district data available."

        return {
            'answer': answer,
            'data': {'districts': district_data},
            'chart_type': 'bar',
            'suggestions': [
                'Which department has highest delays?',
                'Show complaint trends',
                'Which services have low satisfaction?',
            ]
        }

    def _handle_complaint_trends(self, query: str) -> Dict:
        from apps.complaints.models import Complaint
        now = timezone.now()
        monthly_data = []
        for i in range(6):
            month_start = (now - timedelta(days=30 * i)).replace(day=1, hour=0, minute=0, second=0)
            month_end = (month_start + timedelta(days=32)).replace(day=1)
            count = Complaint.objects.filter(
                created_at__gte=month_start,
                created_at__lt=month_end
            ).count()
            monthly_data.append({
                'month': month_start.strftime('%b %Y'),
                'count': count,
            })
        monthly_data.reverse()

        # Simple trend analysis
        if len(monthly_data) >= 2:
            recent = monthly_data[-1]['count']
            previous = monthly_data[-2]['count']
            trend = 'increasing' if recent > previous else 'decreasing' if recent < previous else 'stable'
            change_pct = abs(recent - previous) / max(previous, 1) * 100
        else:
            trend = 'stable'
            change_pct = 0

        answer = (
            f"📈 Complaint trends show a **{trend}** pattern. "
            f"Last month had **{monthly_data[-1]['count'] if monthly_data else 0} complaints**, "
            f"a **{change_pct:.1f}% {'increase' if trend == 'increasing' else 'decrease'}** "
            f"from the previous month.\n\n"
            f"Based on current trends, next month is predicted to have approximately "
            f"**{int(monthly_data[-1]['count'] * (1.05 if trend == 'increasing' else 0.95)) if monthly_data else 0} complaints**."
        )

        return {
            'answer': answer,
            'data': {'monthly_trend': monthly_data},
            'chart_type': 'line',
            'suggestions': [
                'Which district has most unresolved complaints?',
                'Which department has highest delays?',
                'Show category-wise analysis',
            ]
        }

    def _handle_overloaded_officers(self, query: str) -> Dict:
        from apps.users.models import User
        officers = (
            User.objects
            .filter(role='officer')
            .annotate(
                active_complaints=Count(
                    'assigned_complaints',
                    filter=Q(assigned_complaints__status__in=['submitted', 'under_review', 'in_progress'])
                )
            )
            .order_by('-active_complaints')[:10]
        )
        officer_data = [
            {
                'name': o.full_name,
                'active_complaints': o.active_complaints,
                'performance_score': getattr(getattr(o, 'officer_profile', None), 'performance_score', 0),
            }
            for o in officers
        ]
        top = officer_data[0] if officer_data else {}
        answer = (
            f"👤 **{top.get('name', 'N/A')}** is the most overloaded officer with "
            f"**{top.get('active_complaints', 0)} active complaints**.\n\n"
            f"Consider redistributing complaints to officers with lower workloads to improve resolution times."
        ) if top else "No officer data available."

        return {
            'answer': answer,
            'data': {'officers': officer_data},
            'chart_type': 'bar',
            'suggestions': [
                'Which department has highest delays?',
                'Suggest governance improvements',
                'Show department performance',
            ]
        }

    def _handle_governance_improvements(self, query: str) -> Dict:
        from apps.complaints.models import Complaint
        from apps.departments.models import Department
        from django.utils import timezone

        now = timezone.now()
        total = Complaint.objects.count()
        resolved = Complaint.objects.filter(status='resolved').count()
        resolution_rate = (resolved / total * 100) if total > 0 else 0
        overdue = Complaint.objects.filter(
            sla_deadline__lt=now,
            status__in=['submitted', 'under_review', 'in_progress']
        ).count()
        avg_time = Complaint.objects.filter(
            resolved_at__isnull=False
        ).aggregate(
            avg=Avg(F('resolved_at') - F('created_at'))
        )['avg']

        suggestions = []
        if resolution_rate < 70:
            suggestions.append("📌 Resolution rate is below 70%. Increase officer capacity and set stricter SLA enforcement.")
        if overdue > 10:
            suggestions.append(f"⚠️ {overdue} complaints are overdue. Implement automated escalation for SLA breaches.")
        suggestions.extend([
            "🤖 Enable AI-based auto-assignment to distribute complaints evenly across officers.",
            "📊 Conduct weekly performance reviews for departments with scores below 60.",
            "📱 Promote mobile app usage for faster complaint submission and tracking.",
            "🔔 Set up automated SMS/email alerts for complaint status updates.",
            "📈 Publish monthly transparency reports to build citizen trust.",
        ])

        answer = (
            f"💡 **Governance Improvement Recommendations:**\n\n"
            f"Current resolution rate: **{resolution_rate:.1f}%** | "
            f"Overdue complaints: **{overdue}**\n\n"
            + '\n'.join(suggestions[:5])
        )

        return {
            'answer': answer,
            'data': {
                'resolution_rate': resolution_rate,
                'overdue_count': overdue,
                'suggestions': suggestions,
            },
            'chart_type': 'none',
            'suggestions': [
                'Which department has highest delays?',
                'Show complaint trends',
                'Which officers are overloaded?',
            ]
        }

    def _handle_low_satisfaction(self, query: str) -> Dict:
        from apps.departments.models import Department
        departments = Department.objects.filter(
            citizen_satisfaction__gt=0
        ).order_by('citizen_satisfaction')[:5]

        dept_data = [
            {
                'name': d.name,
                'satisfaction': round(d.citizen_satisfaction, 2),
                'total_complaints': d.total_complaints,
            }
            for d in departments
        ]
        top = dept_data[0] if dept_data else {}
        answer = (
            f"😞 **{top.get('name', 'N/A')}** has the lowest citizen satisfaction score of "
            f"**{top.get('satisfaction', 0)}/5**.\n\n"
            f"Focus on improving service quality, response times, and communication in these departments."
        ) if top else "No satisfaction data available yet."

        return {
            'answer': answer,
            'data': {'departments': dept_data},
            'chart_type': 'bar',
            'suggestions': [
                'Suggest governance improvements',
                'Which department has highest delays?',
                'Show department rankings',
            ]
        }

    def _handle_department_performance(self, query: str) -> Dict:
        from apps.departments.models import Department
        departments = Department.objects.filter(is_active=True).order_by('-performance_score')
        dept_data = [
            {
                'name': d.name,
                'performance_score': d.performance_score,
                'resolution_rate': d.resolution_rate,
                'avg_resolution_time': round(d.avg_resolution_time, 1),
                'citizen_satisfaction': round(d.citizen_satisfaction, 2),
            }
            for d in departments
        ]
        top = dept_data[0] if dept_data else {}
        answer = (
            f"🏆 **{top.get('name', 'N/A')}** is the top performing department with a score of "
            f"**{top.get('performance_score', 0):.1f}/100** and a resolution rate of "
            f"**{top.get('resolution_rate', 0)}%**.\n\n"
            f"Department performance is calculated based on resolution rate, average resolution time, and citizen satisfaction."
        ) if top else "No performance data available."

        return {
            'answer': answer,
            'data': {'departments': dept_data},
            'chart_type': 'bar',
            'suggestions': [
                'Which department has highest delays?',
                'Which services have low satisfaction?',
                'Show complaint trends',
            ]
        }

    def _handle_resolution_rate(self, query: str) -> Dict:
        from apps.complaints.models import Complaint
        total = Complaint.objects.count()
        resolved = Complaint.objects.filter(status='resolved').count()
        pending = Complaint.objects.filter(status__in=['submitted', 'under_review', 'in_progress']).count()
        rate = (resolved / total * 100) if total > 0 else 0

        answer = (
            f"✅ Overall complaint resolution rate is **{rate:.1f}%**.\n\n"
            f"- Total complaints: **{total}**\n"
            f"- Resolved: **{resolved}**\n"
            f"- Pending: **{pending}**\n\n"
            f"{'Excellent performance! Keep it up.' if rate > 80 else 'There is room for improvement. Focus on clearing the pending backlog.'}"
        )

        return {
            'answer': answer,
            'data': {'total': total, 'resolved': resolved, 'pending': pending, 'rate': rate},
            'chart_type': 'donut',
            'suggestions': [
                'Which department has highest delays?',
                'Suggest governance improvements',
                'Show complaint trends',
            ]
        }

    def _handle_category_analysis(self, query: str) -> Dict:
        from apps.complaints.models import Complaint
        categories = (
            Complaint.objects
            .values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        cat_data = list(categories)
        top = cat_data[0] if cat_data else {}
        answer = (
            f"📋 **{top.get('category', 'N/A').replace('_', ' ').title()}** is the most common complaint category "
            f"with **{top.get('count', 0)} complaints**.\n\n"
            f"Category breakdown is shown below. Focus resources on high-volume categories."
        ) if top else "No category data available."

        return {
            'answer': answer,
            'data': {'categories': cat_data},
            'chart_type': 'pie',
            'suggestions': [
                'Which district has most unresolved complaints?',
                'Show complaint trends',
                'Which department has highest delays?',
            ]
        }

    def _handle_emergency_status(self, query: str) -> Dict:
        from apps.complaints.models import Complaint
        emergency = Complaint.objects.filter(
            is_emergency=True,
            status__in=['submitted', 'under_review', 'in_progress']
        )
        critical = Complaint.objects.filter(
            priority='critical',
            status__in=['submitted', 'under_review', 'in_progress']
        )
        answer = (
            f"🚨 There are currently **{emergency.count()} active emergency complaints** "
            f"and **{critical.count()} critical priority complaints** requiring immediate attention.\n\n"
            f"Emergency complaints should be resolved within 4 hours. Assign your best officers immediately."
        )

        return {
            'answer': answer,
            'data': {
                'emergency_count': emergency.count(),
                'critical_count': critical.count(),
            },
            'chart_type': 'none',
            'suggestions': [
                'Which officers are overloaded?',
                'Which department has highest delays?',
                'Suggest governance improvements',
            ]
        }

    def _handle_general_stats(self, query: str) -> Dict:
        from apps.complaints.models import Complaint
        from apps.users.models import User
        from apps.departments.models import Department
        from django.utils import timezone

        now = timezone.now()
        today = now.date()
        total = Complaint.objects.count()
        resolved = Complaint.objects.filter(status='resolved').count()
        pending = Complaint.objects.filter(status__in=['submitted', 'under_review', 'in_progress']).count()
        today_count = Complaint.objects.filter(created_at__date=today).count()
        rate = (resolved / total * 100) if total > 0 else 0

        answer = (
            f"📊 **CivicPulse AI Governance Overview:**\n\n"
            f"- Total Complaints: **{total}**\n"
            f"- Resolved Today: **{today_count}**\n"
            f"- Pending: **{pending}**\n"
            f"- Resolution Rate: **{rate:.1f}%**\n"
            f"- Active Officers: **{User.objects.filter(role='officer').count()}**\n"
            f"- Departments: **{Department.objects.filter(is_active=True).count()}**\n\n"
            f"Ask me specific questions like 'Which department has highest delays?' for detailed insights."
        )

        return {
            'answer': answer,
            'data': {
                'total': total, 'resolved': resolved,
                'pending': pending, 'rate': rate, 'today': today_count,
            },
            'chart_type': 'summary',
            'suggestions': self._get_suggestions(),
        }

    def _get_suggestions(self) -> List[str]:
        return [
            'Which department has highest delays?',
            'Which district has most unresolved complaints?',
            'Predict next month complaint trends',
            'Which officers are overloaded?',
            'Suggest governance improvements',
            'Which services have low citizen satisfaction?',
        ]


# Singleton
assistant = GovernanceAssistant()
