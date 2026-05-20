import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie
} from 'recharts'
import {
  fetchDepartmentAnalytics, fetchHeatmap,
  fetchOfficerPerformance, fetchTransparency, fetchMonthlyTrend
} from '@/store/slices/analyticsSlice'
import { Building2, Users, MapPin, Shield, TrendingUp } from 'lucide-react'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0d1526] border border-[#1e2d4a] rounded-xl p-3 shadow-xl text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const dispatch = useDispatch()
  const { departments, heatmap, officers, transparency, monthlyTrend } = useSelector(state => state.analytics)

  useEffect(() => {
    dispatch(fetchDepartmentAnalytics())
    dispatch(fetchHeatmap())
    dispatch(fetchOfficerPerformance())
    dispatch(fetchTransparency())
    dispatch(fetchMonthlyTrend(12))
  }, [dispatch])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics & Intelligence</h1>
        <p className="text-gray-400 text-sm mt-1">Deep governance analytics and performance insights</p>
      </div>

      {/* Transparency Index */}
      {transparency && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Transparency Index', value: `${transparency.transparency_index}%`, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Resolution Rate', value: `${transparency.resolution_rate}%`, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
            { label: 'SLA Compliance', value: `${transparency.sla_compliance}%`, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
            { label: 'Citizen Satisfaction', value: `${transparency.citizen_satisfaction}/5`, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border p-5 ${item.bg}`}
            >
              <div className="text-gray-400 text-xs mb-2">{item.label}</div>
              <div className={`text-3xl font-bold ${item.color}`}>{item.value}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Monthly trend - 12 months */}
      <div className="glass-card-dark p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold">12-Month Complaint Trend</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyTrend}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="resolvedGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#totalGrad)" strokeWidth={2} name="Total" />
            <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#resolvedGrad2)" strokeWidth={2} name="Resolved" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Department Performance */}
      <div className="glass-card-dark p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-yellow-400" />
          <h3 className="text-white font-semibold">Department Performance Comparison</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={departments} layout="vertical">
            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} domain={[0, 100]} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} width={140} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Bar dataKey="performance_score" name="Performance Score" radius={[0, 4, 4, 0]}>
              {departments.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department table */}
      <div className="glass-card-dark overflow-hidden">
        <div className="p-5 border-b border-[#1e2d4a]">
          <h3 className="text-white font-semibold">Department Rankings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Department</th>
                <th>Total</th>
                <th>Resolved</th>
                <th>Pending</th>
                <th>Avg Time (hrs)</th>
                <th>Performance</th>
                <th>Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, i) => (
                <tr key={dept.id}>
                  <td>
                    <span className={`font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-600'}`}>
                      #{i + 1}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: dept.color }} />
                      <span className="text-white">{dept.name}</span>
                    </div>
                  </td>
                  <td className="text-gray-300">{dept.total_complaints}</td>
                  <td className="text-green-400">{dept.resolved_complaints}</td>
                  <td className="text-yellow-400">{dept.pending_complaints}</td>
                  <td className="text-gray-300">{dept.avg_resolution_time}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden w-16">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                          style={{ width: `${dept.performance_score}%` }}
                        />
                      </div>
                      <span className="text-white text-xs">{dept.performance_score?.toFixed(1)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-yellow-400">{'⭐'.repeat(Math.round(dept.citizen_satisfaction))}</span>
                    <span className="text-gray-500 text-xs ml-1">{dept.citizen_satisfaction?.toFixed(1)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Officer Performance */}
      <div className="glass-card-dark p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">Officer Performance Leaderboard</h3>
        </div>
        <div className="space-y-3">
          {officers.slice(0, 10).map((officer, i) => (
            <div key={officer.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                i === 1 ? 'bg-gray-400/20 text-gray-400' :
                i === 2 ? 'bg-orange-500/20 text-orange-400' :
                'bg-white/5 text-gray-500'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{officer.name}</span>
                  <span className="text-xs text-gray-500">{officer.department}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Active: <span className="text-white">{officer.active_complaints}</span></span>
                  <span>Resolved: <span className="text-green-400">{officer.resolved}</span></span>
                  <span>Rate: <span className="text-blue-400">{officer.resolution_rate}%</span></span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{officer.performance_score?.toFixed(1)}</div>
                <div className="text-xs text-gray-500">score</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* District Heatmap */}
      <div className="glass-card-dark p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-red-400" />
          <h3 className="text-white font-semibold">District Complaint Heatmap</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {heatmap.slice(0, 12).map((d, i) => {
            const maxCount = Math.max(...heatmap.map(x => x.total))
            const intensity = d.total / maxCount
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl p-4 border"
                style={{
                  background: `rgba(239, 68, 68, ${intensity * 0.3})`,
                  borderColor: `rgba(239, 68, 68, ${intensity * 0.5})`,
                }}
              >
                <div className="text-white font-medium text-sm">{d.district || 'Unknown'}</div>
                <div className="text-gray-400 text-xs">{d.state}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{d.total}</span>
                  <div className="text-right text-xs">
                    <div className="text-green-400">{d.resolved} resolved</div>
                    <div className="text-yellow-400">{d.pending} pending</div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
