import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, FileText, ArrowRight } from 'lucide-react'
import { fetchComplaints, setFilters } from '@/store/slices/complaintsSlice'
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/StatusBadge'
import { formatDistanceToNow } from 'date-fns'

export default function MyComplaints() {
  const dispatch = useDispatch()
  const { list, loading, filters } = useSelector(state => state.complaints)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchComplaints())
  }, [dispatch])

  const filtered = list.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.ticket_number?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Complaints</h1>
          <p className="text-gray-400 text-sm mt-1">{list.length} total complaints</p>
        </div>
        <Link to="/citizen/submit">
          <motion.button whileHover={{ scale: 1.05 }} className="btn-primary text-sm">
            + New Complaint
          </motion.button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or ticket number..."
            className="input-dark w-full pl-10"
          />
        </div>
        <select
          value={filters.status}
          onChange={e => dispatch(setFilters({ status: e.target.value }))}
          className="input-dark"
        >
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Complaints list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card-dark p-12 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No complaints found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((complaint, i) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link to={`/citizen/complaints/${complaint.id}`}>
                <div className="glass-card-dark p-5 hover:border-blue-500/30 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                          {complaint.ticket_number}
                        </span>
                        {complaint.is_emergency && (
                          <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5 animate-pulse">
                            🚨 Emergency
                          </span>
                        )}
                        {complaint.delay_predicted && (
                          <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full px-2 py-0.5">
                            ⚠️ Delay Risk
                          </span>
                        )}
                      </div>
                      <h3 className="text-white font-medium group-hover:text-blue-300 transition-colors">{complaint.title}</h3>
                      {complaint.ai_summary && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1">{complaint.ai_summary}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <CategoryBadge category={complaint.category} />
                        {complaint.department_name && (
                          <span className="text-xs text-gray-500">{complaint.department_name}</span>
                        )}
                        <span className="text-gray-600 text-xs">
                          {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <StatusBadge status={complaint.status} />
                      <PriorityBadge priority={complaint.priority} />
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
