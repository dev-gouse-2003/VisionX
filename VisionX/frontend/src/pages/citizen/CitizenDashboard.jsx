import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, CheckCircle, Clock, Plus, ArrowRight, Bell, Star } from 'lucide-react'
import { fetchComplaints, fetchComplaintStats } from '@/store/slices/complaintsSlice'
import KPICard from '@/components/ui/KPICard'
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/StatusBadge'
import { formatDistanceToNow } from 'date-fns'

export default function CitizenDashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { list: complaints, stats, loading } = useSelector(state => state.complaints)

  useEffect(() => {
    dispatch(fetchComplaints())
    dispatch(fetchComplaintStats())
  }, [dispatch])

  const recentComplaints = complaints.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Track your complaints and service requests</p>
        </div>
        <Link to="/citizen/submit">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Complaint
          </motion.button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Submitted" value={stats?.total || 0} icon={FileText} color="blue" index={0} />
        <KPICard title="Resolved" value={stats?.resolved || 0} icon={CheckCircle} color="green" index={1} />
        <KPICard title="Pending" value={stats?.pending || 0} icon={Clock} color="yellow" index={2} />
        <KPICard title="Critical" value={stats?.critical || 0} icon={Bell} color="red" index={3} />
      </div>

      {/* Recent Complaints */}
      <div className="glass-card-dark p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Recent Complaints</h3>
          <Link to="/citizen/complaints" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No complaints yet</p>
            <Link to="/citizen/submit" className="text-blue-400 text-sm mt-2 inline-block hover:text-blue-300">
              Submit your first complaint →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentComplaints.map((complaint, i) => (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/citizen/complaints/${complaint.id}`}>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500 font-mono">{complaint.ticket_number}</span>
                        {complaint.is_emergency && (
                          <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">Emergency</span>
                        )}
                      </div>
                      <div className="text-white text-sm font-medium truncate">{complaint.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <CategoryBadge category={complaint.category} />
                        <span className="text-gray-600 text-xs">
                          {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={complaint.status} />
                      <PriorityBadge priority={complaint.priority} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Plus, title: 'Submit Complaint', desc: 'Report a new issue', path: '/citizen/submit', color: 'from-blue-600 to-blue-500' },
          { icon: FileText, title: 'My Complaints', desc: 'View all your complaints', path: '/citizen/complaints', color: 'from-purple-600 to-purple-500' },
          { icon: Star, title: 'Track Status', desc: 'Track by ticket number', path: '/citizen/track', color: 'from-green-600 to-green-500' },
        ].map((action, i) => (
          <Link key={i} to={action.path}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br ${action.color} p-0.5 rounded-2xl`}
            >
              <div className="bg-[#0a0f1e] rounded-[14px] p-5 hover:bg-transparent transition-colors group">
                <action.icon className="w-6 h-6 text-white mb-3" />
                <div className="text-white font-semibold">{action.title}</div>
                <div className="text-gray-400 text-sm group-hover:text-gray-200 transition-colors">{action.desc}</div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
