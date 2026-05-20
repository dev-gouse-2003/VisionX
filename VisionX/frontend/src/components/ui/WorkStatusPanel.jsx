import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Loader2, CheckCircle2, ChevronDown, MessageSquare, Send } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { updateComplaint } from '@/store/slices/complaintsSlice'
import toast from 'react-hot-toast'

/* ─── Status config ─────────────────────────────────────────── */
const WORK_STATUSES = [
  {
    key: 'under_review',
    label: 'Not Yet Started',
    shortLabel: 'Not Started',
    description: 'Complaint received, work has not begun',
    icon: Clock,
    color: 'yellow',
    bg: 'bg-yellow-500/15',
    border: 'border-yellow-500/40',
    text: 'text-yellow-400',
    ring: 'ring-yellow-500/30',
    dot: 'bg-yellow-400',
    activeBg: 'bg-yellow-500/20',
    hoverBg: 'hover:bg-yellow-500/10',
    gradient: 'from-yellow-500/20 to-yellow-600/5',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    shortLabel: 'In Progress',
    description: 'Actively working on resolving this complaint',
    icon: Loader2,
    color: 'blue',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/40',
    text: 'text-blue-400',
    ring: 'ring-blue-500/30',
    dot: 'bg-blue-400',
    activeBg: 'bg-blue-500/20',
    hoverBg: 'hover:bg-blue-500/10',
    gradient: 'from-blue-500/20 to-blue-600/5',
    spin: true,
  },
  {
    key: 'resolved',
    label: 'Completed',
    shortLabel: 'Completed',
    description: 'Work is done, complaint has been resolved',
    icon: CheckCircle2,
    color: 'green',
    bg: 'bg-green-500/15',
    border: 'border-green-500/40',
    text: 'text-green-400',
    ring: 'ring-green-500/30',
    dot: 'bg-green-400',
    activeBg: 'bg-green-500/20',
    hoverBg: 'hover:bg-green-500/10',
    gradient: 'from-green-500/20 to-green-600/5',
  },
]

/* Map any backend status → work status key */
function toWorkStatus(status) {
  if (status === 'resolved' || status === 'closed') return 'resolved'
  if (status === 'in_progress') return 'in_progress'
  return 'under_review' // submitted, under_review, escalated
}

/* ─── Main Component ────────────────────────────────────────── */
export default function WorkStatusPanel({ complaint, onUpdated }) {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const [updating, setUpdating] = useState(false)
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState('')

  const canUpdate = user?.role === 'officer' || user?.role === 'admin'
  const currentWorkStatus = toWorkStatus(complaint?.status)
  const currentConfig = WORK_STATUSES.find(s => s.key === currentWorkStatus)

  const handleStatusChange = async (newStatusKey) => {
    if (!canUpdate) return
    if (newStatusKey === currentWorkStatus) return

    // If marking complete, show comment box first
    if (newStatusKey === 'resolved' && !showComment) {
      setShowComment(true)
      return
    }

    setUpdating(true)
    const result = await dispatch(updateComplaint({
      id: complaint.id,
      data: {
        status: newStatusKey,
        comment: comment || getDefaultComment(newStatusKey),
      }
    }))

    if (updateComplaint.fulfilled.match(result)) {
      const cfg = WORK_STATUSES.find(s => s.key === newStatusKey)
      toast.success(`Status updated to "${cfg.label}"`)
      setShowComment(false)
      setComment('')
      onUpdated?.()
    } else {
      toast.error('Failed to update status')
    }
    setUpdating(false)
  }

  const getDefaultComment = (key) => {
    if (key === 'in_progress') return 'Work has started on this complaint.'
    if (key === 'resolved') return 'Work completed. Complaint resolved.'
    return 'Status updated.'
  }

  if (!complaint) return null

  return (
    <div className="glass-card-dark p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">Work Status</h3>
          <p className="text-gray-500 text-xs mt-0.5">
            {canUpdate ? 'Update the current work progress' : 'Current work progress'}
          </p>
        </div>
        {/* Current status pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${currentConfig.bg} ${currentConfig.border}`}>
          <span className={`w-2 h-2 rounded-full ${currentConfig.dot} ${currentWorkStatus === 'in_progress' ? 'animate-pulse' : ''}`} />
          <span className={`text-xs font-semibold ${currentConfig.text}`}>{currentConfig.shortLabel}</span>
        </div>
      </div>

      {/* Status selector */}
      <div className="grid grid-cols-3 gap-3">
        {WORK_STATUSES.map((s, i) => {
          const isActive = currentWorkStatus === s.key
          const Icon = s.icon
          const isDisabled = !canUpdate || updating

          return (
            <motion.button
              key={s.key}
              onClick={() => handleStatusChange(s.key)}
              disabled={isDisabled}
              whileHover={!isDisabled && !isActive ? { scale: 1.03, y: -2 } : {}}
              whileTap={!isDisabled ? { scale: 0.97 } : {}}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`
                relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200
                ${isActive
                  ? `${s.activeBg} ${s.border} ring-2 ${s.ring} shadow-lg`
                  : `bg-white/3 border-white/10 ${!isDisabled ? s.hoverBg + ' hover:border-white/20 cursor-pointer' : 'cursor-not-allowed opacity-60'}`
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeWorkStatus"
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${s.gradient} pointer-events-none`}
                />
              )}

              {/* Icon */}
              <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? s.bg : 'bg-white/5'}`}>
                <Icon className={`w-5 h-5 ${isActive ? s.text : 'text-gray-500'} ${s.spin && isActive ? 'animate-spin' : ''}`}
                  style={s.spin && isActive ? { animationDuration: '2s' } : {}} />
              </div>

              {/* Label */}
              <div className="relative z-10 text-center">
                <div className={`text-xs font-semibold leading-tight ${isActive ? s.text : 'text-gray-400'}`}>
                  {s.shortLabel}
                </div>
              </div>

              {/* Active checkmark */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute top-2 right-2 w-4 h-4 rounded-full ${s.bg} ${s.border} border flex items-center justify-center`}
                >
                  <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Description of current status */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWorkStatus}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl ${currentConfig.bg} border ${currentConfig.border}`}
        >
          <currentConfig.icon className={`w-3.5 h-3.5 ${currentConfig.text} shrink-0 ${currentConfig.spin ? 'animate-spin' : ''}`}
            style={currentConfig.spin ? { animationDuration: '2s' } : {}} />
          <span className={`text-xs ${currentConfig.text}`}>{currentConfig.description}</span>
        </motion.div>
      </AnimatePresence>

      {/* Comment box — shown when marking complete */}
      <AnimatePresence>
        {showComment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-1 space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white font-medium">Add completion note</span>
                <span className="text-xs text-gray-500">(optional)</span>
              </div>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Describe what was done to resolve this complaint..."
                className="input-dark w-full h-24 resize-none text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowComment(false); setComment('') }}
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusChange('resolved')}
                  disabled={updating}
                  className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Send className="w-3.5 h-3.5" /> Mark Completed</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Not authorized message */}
      {!canUpdate && (
        <p className="text-center text-gray-600 text-xs">
          Only officers and admins can update work status
        </p>
      )}
    </div>
  )
}
