import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle2, UserCheck, RefreshCw, Clock, Loader2 } from 'lucide-react'
import { fetchComplaints, updateComplaint } from '@/store/slices/complaintsSlice'
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/StatusBadge'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

/* Work status options shown inline on each card */
const WORK_OPTIONS = [
  {
    key: 'under_review',
    label: 'Not Started',
    icon: Clock,
    style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/35 hover:bg-yellow-500/25',
    activeStyle: 'bg-yellow-500/25 text-yellow-300 border-yellow-400/60 ring-1 ring-yellow-500/30',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    icon: Loader2,
    spin: true,
    style: 'bg-blue-500/15 text-blue-400 border-blue-500/35 hover:bg-blue-500/25',
    activeStyle: 'bg-blue-500/25 text-blue-300 border-blue-400/60 ring-1 ring-blue-500/30',
  },
  {
    key: 'resolved',
    label: 'Completed',
    icon: CheckCircle2,
    style: 'bg-green-500/15 text-green-400 border-green-500/35 hover:bg-green-500/25',
    activeStyle: 'bg-green-500/25 text-green-300 border-green-400/60 ring-1 ring-green-500/30',
  },
]

function toWorkKey(status) {
  if (status === 'resolved' || status === 'closed') return 'resolved'
  if (status === 'in_progress') return 'in_progress'
  return 'under_review'
}

export default function AssignedComplaints() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(state => state.complaints)
  const { user } = useSelector(state => state.auth)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [assignFilter, setAssignFilter] = useState('all')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    dispatch(fetchComplaints())
  }, [dispatch])

  const filtered = list.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.ticket_number?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || c.status === statusFilter
    const matchAssign =
      assignFilter === 'all' ? true :
      assignFilter === 'mine' ? c.officer_name === user?.full_name :
      assignFilter === 'unassigned' ? !c.officer_name : true
    return matchSearch && matchStatus && matchAssign
  })

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(id)
    const result = await dispatch(updateComplaint({ id, data: { status: newStatus } }))
    if (updateComplaint.fulfilled.match(result)) {
      toast.success(`Status updated to ${newStatus}`)
    }
    setUpdating(null)
  }

  const handleSelfAssign = async (id) => {
    setUpdating(id)
    const result = await dispatch(updateComplaint({ id, data: { assigned_officer: user?.id, status: 'under_review' } }))
    if (updateComplaint.fulfilled.match(result)) {
      toast.success('Complaint assigned to you!')
      dispatch(fetchComplaints())
    }
    setUpdating(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Complaints</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} complaints</p>
        </div>
        <button
          onClick={() => dispatch(fetchComplaints())}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-white/5 border border-white/10 rounded-xl px-3 py-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search complaints..." className="input-dark w-full pl-10" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-dark">
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <div className="flex rounded-xl overflow-hidden border border-[#1e2d4a]">
          {[['all', 'All'], ['mine', 'Mine'], ['unassigned', 'Unassigned']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setAssignFilter(val)}
              className={`px-4 py-2 text-sm transition-colors ${
                assignFilter === val
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#0d1526] text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card-dark p-12 text-center">
          <div className="text-gray-500 text-lg mb-2">No complaints found</div>
          <p className="text-gray-600 text-sm">Try changing your filters or check back later</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card-dark p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-gray-500">{c.ticket_number}</span>
                    {c.is_emergency && (
                      <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">
                        Emergency
                      </span>
                    )}
                    {c.is_overdue && (
                      <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full px-2 py-0.5">
                        Overdue
                      </span>
                    )}
                    {!c.officer_name && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full px-2 py-0.5">
                        Unassigned
                      </span>
                    )}
                    {c.officer_name && (
                      <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2 py-0.5">
                        → {c.officer_name}
                      </span>
                    )}
                  </div>
                  <Link to={`/officer/complaints/${c.id}`}>
                    <h3 className="text-white font-medium hover:text-blue-300 transition-colors">{c.title}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <CategoryBadge category={c.category} />
                    <span className="text-gray-600 text-xs">{c.district}</span>
                    <span className="text-gray-600 text-xs">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                    {c.citizen_name && (
                      <span className="text-gray-600 text-xs">by {c.citizen_name}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />

                  {/* ── Work Status Buttons ── */}
                  <div className="flex gap-1 mt-1">
                    {WORK_OPTIONS.map(opt => {
                      const isActive = toWorkKey(c.status) === opt.key
                      const Icon = opt.icon
                      return (
                        <motion.button
                          key={opt.key}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => !isActive && handleStatusUpdate(c.id, opt.key)}
                          disabled={updating === c.id || isActive}
                          title={opt.label}
                          className={`
                            flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium
                            transition-all duration-200
                            ${isActive ? opt.activeStyle : opt.style}
                            ${isActive ? 'cursor-default' : 'cursor-pointer'}
                            disabled:opacity-60
                          `}
                        >
                          {updating === c.id && isActive ? (
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Icon className={`w-3 h-3 ${opt.spin && isActive ? 'animate-spin' : ''}`}
                              style={opt.spin && isActive ? { animationDuration: '2s' } : {}} />
                          )}
                          <span className="hidden sm:inline">{opt.label}</span>
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Self-assign if unassigned */}
                  {!c.officer_name && (
                    <button
                      onClick={() => handleSelfAssign(c.id)}
                      disabled={updating === c.id}
                      className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg px-2 py-1 hover:bg-purple-500/30 transition-colors flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3" /> Assign to me
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
