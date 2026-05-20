import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Building2, TrendingUp, Users, Clock, Star } from 'lucide-react'
import { fetchDepartmentAnalytics } from '@/store/slices/analyticsSlice'
import api from '@/services/api'

export default function DepartmentManagement() {
  const dispatch = useDispatch()
  const { departments } = useSelector(state => state.analytics)

  useEffect(() => {
    dispatch(fetchDepartmentAnalytics())
  }, [dispatch])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Department Management</h1>
        <p className="text-gray-400 text-sm mt-1">{departments.length} active departments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {departments.map((dept, i) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-dark p-5 hover:border-blue-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${dept.color}20` }}>
                  <Building2 className="w-5 h-5" style={{ color: dept.color }} />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{dept.name}</div>
                  <div className="text-gray-500 text-xs font-mono">{dept.code}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{dept.performance_score?.toFixed(1)}</div>
                <div className="text-xs text-gray-500">score</div>
              </div>
            </div>

            {/* Performance bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Performance</span>
                <span>{dept.performance_score?.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dept.performance_score || 0}%` }}
                  transition={{ duration: 1, delay: i * 0.05 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${dept.color}, ${dept.color}88)` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/5 rounded-xl p-2">
                <div className="text-white font-bold">{dept.total_complaints}</div>
                <div className="text-gray-500 text-xs">Total</div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-2">
                <div className="text-green-400 font-bold">{dept.resolved_complaints}</div>
                <div className="text-gray-500 text-xs">Resolved</div>
              </div>
              <div className="bg-yellow-500/10 rounded-xl p-2">
                <div className="text-yellow-400 font-bold">{dept.pending_complaints}</div>
                <div className="text-gray-500 text-xs">Pending</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1e2d4a]">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{dept.avg_resolution_time}h avg</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <Star className="w-3 h-3" />
                <span>{dept.citizen_satisfaction?.toFixed(1)}/5</span>
              </div>
              <div className="text-xs text-blue-400">{dept.resolution_rate}% resolved</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
