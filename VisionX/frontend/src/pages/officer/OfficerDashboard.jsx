import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardList, CheckCircle, Clock, AlertTriangle, UserCheck } from 'lucide-react'
import { fetchComplaints, fetchComplaintStats, updateComplaint } from '@/store/slices/complaintsSlice'
import KPICard from '@/components/ui/KPICard'
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/StatusBadge'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function OfficerDashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { list: complaints, stats, loading } = useSelector(state => state.complaints)

  useEffect(() => {
    dispatch(fetchComplaints())
    dispatch(fetchComplaintStats())
  }, [dispatch])

  const myComplaints = complaints.filter(c => c.officer_name === user?.full_name)
  const unassigned = complaints.filter(c => !c.officer_name)
  const urgent = complaints.filter(c => c.priority === 'critical' || c.is_emergency)
  const pending = complaints.filter(c => ['submitted', 'under_review', 'in_progress'].includes(c.status))
  const overdue = complaints.filter(c => c.is_overdue)

  const handleSelfAssign = async (id) => {
    const result = await dispatch(updateComplaint({ id, data: { assigned_officer: user?.id, status: 'under_review' } }))
    if (updateComplaint.fulfilled.match(result)) {
      toast.success('Complaint assigned to you!')
      dispatch(fetchComplaints())
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Officer Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome, {user?.full_name} — {user?.officer_profile?.department_name || 'All Departments'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-medium">On Duty</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="All Complaints" value={complaints.length} icon={ClipboardList} color="blue" index={0} />
        <KPICard title="Resolved" value={stats?.resolved || 0} icon={CheckCircle} color="green" index={1} />
        <KPICard title="Pending" value={pending.length} icon={Clock} color="yellow" index={2} />
        <KPICard title="Overdue" value={overdue.length} icon={AlertTriangle} color="red" glowing index={3} />
      </div>

      {/* Performance score */}
      <div className="glass-card-dark p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">My Performance Score</h3>
            <p className="text-gray-500 text-sm">Based on resolution rate and SLA compliance</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-400">
              {user?.officer_profile?.performance_score?.toFixed(1) || '0.0'}
            </div>
            <div className="text-gray-500 text-xs">/ 100</div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${user?.officer_profile?.performance_score || 0}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-green-500"
          />
        </div>
      </div>

      {/* Urgent complaints */}
      {urgent.length > 0 && (
        <div className="glass-card-dark p-5 border border-red-500/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-white font-semibold">Urgent Attention Required</h3>
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">{urgent.length}</span>
          </div>
          <div className="space-y-3">
            {urgent.slice(0, 3).map((c, i) => (
              <Link key={c.id} to={`/officer/complaints/${c.id}`}>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{c.title}</div>
                    <div className="text-gray-500 text-xs">{c.ticket_number} · {c.district}</div>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Unassigned complaints */}
      {unassigned.length > 0 && (
        <div className="glass-card-dark p-5 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-5 h-5 text-yellow-400" />
            <h3 className="text-white font-semibold">Unassigned Complaints</h3>
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">{unassigned.length}</span>
          </div>
          <div className="space-y-3">
            {unassigned.slice(0, 5).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{c.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <CategoryBadge category={c.category} />
                    <span className="text-gray-600 text-xs">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <PriorityBadge priority={c.priority} />
                  <button
                    onClick={() => handleSelfAssign(c.id)}
                    className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg px-2 py-1 hover:bg-blue-500/30 transition-colors"
                  >
                    Assign to me
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent assigned */}
      <div className="glass-card-dark p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">All Complaints</h3>
          <Link to="/officer/complaints" className="text-blue-400 text-sm hover:text-blue-300">View all →</Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No complaints yet</div>
        ) : (
          <div className="space-y-3">
            {pending.slice(0, 5).map((c, i) => (
              <Link key={c.id} to={`/officer/complaints/${c.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{c.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <CategoryBadge category={c.category} />
                      <span className="text-gray-600 text-xs">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </span>
                      {c.officer_name && <span className="text-xs text-green-400">→ {c.officer_name}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
