import React from 'react'
import clsx from 'clsx'

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  under_review: { label: 'Under Review', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  in_progress: { label: 'In Progress', class: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  resolved: { label: 'Resolved', class: 'bg-green-500/20 text-green-400 border-green-500/30' },
  closed: { label: 'Closed', class: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  rejected: { label: 'Rejected', class: 'bg-red-500/20 text-red-400 border-red-500/30' },
  escalated: { label: 'Escalated', class: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', class: 'bg-green-500/20 text-green-400 border-green-500/30' },
  medium: { label: 'Medium', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  high: { label: 'High', class: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  critical: { label: 'Critical', class: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' },
}

const SENTIMENT_CONFIG = {
  angry: { label: '😠 Angry', class: 'bg-red-500/20 text-red-400 border-red-500/30' },
  frustrated: { label: '😤 Frustrated', class: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  urgent: { label: '🚨 Urgent', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  neutral: { label: '😐 Neutral', class: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  satisfied: { label: '😊 Satisfied', class: 'bg-green-500/20 text-green-400 border-green-500/30' },
}

export function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || { label: status, class: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
  return (
    <span className={clsx(
      'inline-flex items-center border rounded-full font-medium',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      config.class
    )}>
      {config.label}
    </span>
  )
}

export function PriorityBadge({ priority, size = 'sm' }) {
  const config = PRIORITY_CONFIG[priority] || { label: priority, class: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
  return (
    <span className={clsx(
      'inline-flex items-center border rounded-full font-medium',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      config.class
    )}>
      {config.label}
    </span>
  )
}

export function SentimentBadge({ sentiment, size = 'sm' }) {
  const config = SENTIMENT_CONFIG[sentiment] || { label: sentiment, class: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
  return (
    <span className={clsx(
      'inline-flex items-center border rounded-full font-medium',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      config.class
    )}>
      {config.label}
    </span>
  )
}

export function CategoryBadge({ category, size = 'sm' }) {
  const CATEGORY_ICONS = {
    water: '💧', roads: '🛣️', electricity: '⚡', healthcare: '🏥',
    sanitation: '🗑️', transport: '🚌', emergency: '🚨', public_safety: '🛡️',
    education: '📚', housing: '🏠', environment: '🌿', other: '📋',
  }
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full font-medium text-gray-300',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
    )}>
      {CATEGORY_ICONS[category] || '📋'} {category?.replace('_', ' ')}
    </span>
  )
}
