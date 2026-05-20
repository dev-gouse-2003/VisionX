import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Download, Eye, UserCheck, X, AlertTriangle, RefreshCw, Clock, Loader2, CheckCircle2 } from 'lucide-react'
import { fetchComplaints, updateComplaint } from '@/store/slices/complaintsSlice'
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/StatusBadge'
import { formatDistanceToNow } from 'date-fns'
import { analyticsService } from '@/services/api'
import api from '@/services/api'
import toast from 'react-hot-toast'

const WORK_OPTIONS = [
  { key: 'under_review', label: 'Not Started', icon: Clock,        style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/35', activeStyle: 'bg-yellow-500/25 text-yellow-300 border-yellow-400/60 ring-1 ring-yellow-500/30' },
  { key: 'in_progress',  label: 'In Progress', icon: Loader2,      style: 'bg-blue-500/15 text-blue-400 border-blue-500/35',       activeStyle: 'bg-blue-500/25 text-blue-300 border-blue-400/60 ring-1 ring-blue-500/30', spin: true },
  { key: 'resolved',     label: 'Completed',   icon: CheckCircle2, style: 'bg-green-500/15 text-green-400 border-green-500/35',    activeStyle: 'bg-green-500/25 text-green-300 border-green-400/60 ring-1 ring-green-500/30' },
]
function toWorkKey(status) {
  if (status === 'resolved' || status === 'closed') return 'resolved'
  if (status === 'in_progress') return 'in_progress'
  return 'under_review'
}

export default function ComplaintsManagement() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(state => state.complaints)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' })
  const [officers, setOfficers] = useState([])
  const [assignModal, setAssignModal] = useState(null)
  const [selectedOfficer, setSelectedOfficer] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [updatingWork, setUpdatingWork] = useState(null)

  useEffect(() => {
    dispatch(fetchComplaints(filters))
  }, [dispatch, filters])

  // Fetch officers list for dropdown
  useEffect(() => {
    api.get('/auth/users/officers_list/').then(r => setOfficers(r.data)).catch((e) => {
      console.error('Failed to load officers:', e)
    })
  }, [])

  const filtered = list.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
    c.citizen_name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleExport = async () => {
    try {
      const response = await analyticsService.exportReport()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'civicpulse_complaints.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Report exported successfully')
    } catch (e) {
      toast.error('Export failed')
    }
  }

  const openAssignModal = (complaint) => {
    setAssignModal(complaint)
    setSelectedOfficer(complaint.officer_name ? '' : '')
  }

  const handleAssign = async () => {
    if (!selectedOfficer) { toast.error('Please select an officer'); return }
    setAssigning(true)
    const result = await dispatch(updateComplaint({
      id: assignModal.id,
      data: { assigned_officer: selectedOfficer, status: assignModal.status === 'submitted' ? 'under_review' : assignModal.status }
    }))
    if (updateComplaint.fulfilled.match(result)) {
      toast.success('Officer assigned successfully!')
      setAssignModal(null)
      setSelectedOfficer('')
      dispatch(fetchComplaints(filters))
    } else {
      toast.error('Failed to assign officer')
    }
    setAssigning(false)
  }

  const handleWorkStatus = async (complaintId, newStatusKey) => {
    setUpdatingWork(complaintId)
    const result = await dispatch(updateComplaint({
      id: complaintId,
      data: { status: newStatusKey, comment: `Status set to ${newStatusKey} by admin.` }
    }))
    if (updateComplaint.fulfilled.match(result)) {
      const cfg = WORK_OPTIONS.find(o => o.key === newStatusKey)
      toast.success(`Work status → "${cfg.label}"`)
    } else {
      toast.error('Failed to update status')
    }
    setUpdatingWork(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Complaints Management</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} complaints</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch(fetchComplaints(filters))}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, ticket, citizen..." className="input-dark w-full pl-10" />
        </div>
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="input-dark">
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
          <option value="closed">Closed</option>
        </select>
        <select value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })} className="input-dark">
          <option value="">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} className="input-dark">
          <option value="">All Categories</option>
          <option value="water">Water</option>
          <option value="roads">Roads</option>
          <option value="electricity">Electricity</option>
          <option value="healthcare">Healthcare</option>
          <option value="sanitation">Sanitation</option>
          <option value="transport">Transport</option>
          <option value="emergency">Emergency</option>
          <option value="public_safety">Public Safety</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Title / Citizen</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>District</th>
                <th>Assigned Officer</th>
                <th>Work Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j}><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td>
                    <span className="font-mono text-xs text-blue-400">{c.ticket_number}</span>
                    {c.is_emergency && <AlertTriangle className="w-3 h-3 text-red-400 inline ml-1" />}
                  </td>
                  <td>
                    <div className="max-w-48 truncate text-white text-sm">{c.title}</div>
                    <div className="text-xs text-gray-500">{c.citizen_name}</div>
                  </td>
                  <td><CategoryBadge category={c.category} /></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td><PriorityBadge priority={c.priority} /></td>
                  <td className="text-gray-400 text-sm">{c.district || '—'}</td>
                  <td>
                    {c.officer_name ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white">
                          {c.officer_name?.charAt(0)}
                        </div>
                        <span className="text-green-400 text-xs">{c.officer_name}</span>
                      </div>
                    ) : (
                      <span className="text-yellow-500 text-xs italic">Unassigned</span>
                    )}
                  </td>
                  {/* Work Status inline buttons */}
                  <td>
                    <div className="flex gap-1">
                      {WORK_OPTIONS.map(opt => {
                        const isActive = toWorkKey(c.status) === opt.key
                        const Icon = opt.icon
                        return (
                          <motion.button
                            key={opt.key}
                            whileHover={!isActive ? { scale: 1.08 } : {}}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => !isActive && handleWorkStatus(c.id, opt.key)}
                            disabled={updatingWork === c.id}
                            title={opt.label}
                            className={`
                              flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium
                              transition-all duration-150
                              ${isActive ? opt.activeStyle : opt.style + ' hover:opacity-90 cursor-pointer'}
                              ${updatingWork === c.id ? 'opacity-50 cursor-wait' : ''}
                            `}
                          >
                            {updatingWork === c.id && isActive ? (
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Icon className={`w-3 h-3 ${opt.spin && isActive ? 'animate-spin' : ''}`}
                                style={opt.spin && isActive ? { animationDuration: '2s' } : {}} />
                            )}
                            <span className="hidden lg:inline">{opt.label}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </td>
                  <td className="text-gray-500 text-xs">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Link to={`/admin/complaints/${c.id}`}>
                        <button className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 flex items-center justify-center transition-colors" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => openAssignModal(c)}
                        className="w-7 h-7 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center justify-center transition-colors"
                        title="Assign Officer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">No complaints found</div>
        )}
      </div>

      {/* Assign Officer Modal */}
      <AnimatePresence>
        {assignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setAssignModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0d1526] border border-[#1e2d4a] rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Assign Officer</h3>
                    <p className="text-gray-500 text-xs">Select an officer for this complaint</p>
                  </div>
                </div>
                <button onClick={() => setAssignModal(null)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Complaint Info */}
              <div className="bg-white/5 rounded-xl p-4 mb-5 border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-blue-400 mb-1">{assignModal.ticket_number}</div>
                    <div className="text-white text-sm font-medium truncate">{assignModal.title}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <CategoryBadge category={assignModal.category} />
                      <PriorityBadge priority={assignModal.priority} />
                    </div>
                  </div>
                </div>
                {assignModal.officer_name && (
                  <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400">
                    Currently assigned to: <span className="text-green-400">{assignModal.officer_name}</span>
                  </div>
                )}
              </div>

              {/* Officer Select */}
              <div className="mb-5">
                <label className="text-sm text-gray-300 font-medium mb-2 block">Select Officer</label>
                {officers.length === 0 ? (
                  <div className="text-gray-500 text-sm text-center py-4">Loading officers...</div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {officers.map(o => (
                      <button
                        key={o.id}
                        onClick={() => setSelectedOfficer(o.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          selectedOfficer === o.id
                            ? 'border-green-500/50 bg-green-500/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {o.full_name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium">{o.full_name}</div>
                          <div className="text-gray-500 text-xs">{o.designation} · {o.department}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-xs font-medium ${o.is_available ? 'text-green-400' : 'text-red-400'}`}>
                            {o.is_available ? 'Available' : 'Busy'}
                          </div>
                          <div className="text-gray-600 text-xs">{o.total_assigned} assigned</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setAssignModal(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assigning || !selectedOfficer}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {assigning ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><UserCheck className="w-4 h-4" /> Assign</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
