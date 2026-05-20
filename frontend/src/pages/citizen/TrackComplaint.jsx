import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react'
import api from '@/services/api'
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/StatusBadge'
import { formatDistanceToNow, format } from 'date-fns'

const STATUS_STEPS = ['submitted', 'under_review', 'in_progress', 'resolved']

export default function TrackComplaint() {
  const [ticketNumber, setTicketNumber] = useState('')
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!ticketNumber.trim()) return
    setLoading(true)
    setError('')
    setComplaint(null)
    try {
      const response = await api.get('/complaints/', { params: { search: ticketNumber } })
      const results = response.data.results || response.data
      if (results.length > 0) {
        setComplaint(results[0])
      } else {
        setError('No complaint found with this ticket number')
      }
    } catch (e) {
      setError('Failed to search. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = complaint ? STATUS_STEPS.indexOf(complaint.status) : -1

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Track Complaint</h1>
        <p className="text-gray-400 text-sm mt-1">Enter your ticket number to track status</p>
      </div>

      {/* Search */}
      <div className="glass-card-dark p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={ticketNumber}
              onChange={e => setTicketNumber(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Enter ticket number (e.g. CP12345678)"
              className="input-dark w-full pl-10 font-mono"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Track
          </motion.button>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm mt-3"
          >
            {error}
          </motion.p>
        )}
      </div>

      {/* Result */}
      <AnimatePresence>
        {complaint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Complaint info */}
            <div className="glass-card-dark p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-blue-400 text-sm">{complaint.ticket_number}</span>
                    {complaint.is_emergency && (
                      <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">Emergency</span>
                    )}
                  </div>
                  <h2 className="text-white font-semibold text-lg">{complaint.title}</h2>
                </div>
                <StatusBadge status={complaint.status} size="md" />
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <CategoryBadge category={complaint.category} />
                <PriorityBadge priority={complaint.priority} />
              </div>

              {complaint.ai_summary && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4">
                  <p className="text-xs text-blue-400 mb-1">AI Summary</p>
                  <p className="text-gray-300 text-sm">{complaint.ai_summary}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Department</span>
                  <div className="text-white mt-0.5">{complaint.department_name || 'Pending Assignment'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Submitted</span>
                  <div className="text-white mt-0.5">{format(new Date(complaint.created_at), 'dd MMM yyyy')}</div>
                </div>
                {complaint.sla_deadline && (
                  <div>
                    <span className="text-gray-500">SLA Deadline</span>
                    <div className={`mt-0.5 ${complaint.is_overdue ? 'text-red-400' : 'text-white'}`}>
                      {format(new Date(complaint.sla_deadline), 'dd MMM yyyy HH:mm')}
                      {complaint.is_overdue && ' (Overdue)'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress tracker */}
            <div className="glass-card-dark p-6">
              <h3 className="text-white font-semibold mb-6">Complaint Progress</h3>
              <div className="relative">
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-[#1e2d4a]" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-blue-500 to-green-500"
                />
                <div className="relative flex justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const isCompleted = i <= currentStep
                    const isCurrent = i === currentStep
                    return (
                      <div key={step} className="flex flex-col items-center gap-2">
                        <motion.div
                          animate={{
                            scale: isCurrent ? [1, 1.2, 1] : 1,
                          }}
                          transition={{ duration: 1, repeat: isCurrent ? Infinity : 0 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 ${
                            isCompleted
                              ? 'bg-green-500 border-green-500'
                              : 'bg-[#0a0f1e] border-[#1e2d4a]'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-600" />
                          )}
                        </motion.div>
                        <span className={`text-xs text-center capitalize ${isCompleted ? 'text-white' : 'text-gray-600'}`}>
                          {step.replace('_', ' ')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* History */}
            {complaint.history && complaint.history.length > 0 && (
              <div className="glass-card-dark p-6">
                <h3 className="text-white font-semibold mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                  {complaint.history.map((h, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-white">
                          Status changed: <span className="text-gray-400">{h.old_status}</span> → <span className="text-blue-400">{h.new_status}</span>
                        </div>
                        {h.comment && <div className="text-xs text-gray-500 mt-0.5">{h.comment}</div>}
                        <div className="text-xs text-gray-600 mt-0.5">
                          {formatDistanceToNow(new Date(h.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
