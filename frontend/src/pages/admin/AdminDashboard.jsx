import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  FileText, CheckCircle, Clock, AlertTriangle, Zap,
  Users, Building2, TrendingUp, Shield, Activity,
  BarChart3, MapPin, Star, Bot
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts'
import { fetchDashboard, fetchMonthlyTrend } from '@/store/slices/analyticsSlice'
import KPICard from '@/components/ui/KPICard'
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge'
import { toggleAIAssistant } from '@/store/slices/uiSlice'
import { formatDistanceToNow } from 'date-fns'

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1526] border border-[#1e2d4a] rounded-xl p-3 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const { dashboard, monthlyTrend, loading } = useSelector(state => state.analytics)

  useEffect(() => {
    dispatch(fetchDashboard())
    dispatch(fetchMonthlyTrend(6))
    const interval = setInterval(() => dispatch(fetchDashboard()), 60000)
    return () => clearInterval(interval)
  }, [dispatch])

  const kpis = dashboard?.kpis || {}

  const governanceScore = kpis.governance_score || 0
  const scoreColor = governanceScore >= 80 ? 'text-green-400' : governanceScore >= 60 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Governance Command Center</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time public service intelligence dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Live</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleAIAssistant())}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl px-4 py-2 text-white text-sm font-medium shadow-lg shadow-purple-500/25"
          >
            <Bot className="w-4 h-4" />
            Ask AI Assistant
          </motion.button>
        </div>
      </div>

      {/* Governance Score Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="animated-border p-5"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2d4a" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={governanceScore >= 80 ? '#10b981' : governanceScore >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${governanceScore} ${100 - governanceScore}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-bold ${scoreColor}`}>{Math.round(governanceScore)}</span>
              </div>
            </div>
            <div>
              <div className="text-white font-bold text-lg">Governance Transparency Score</div>
              <div className="text-gray-400 text-sm">Based on resolution rate, SLA compliance & citizen satisfaction</div>
              <div className={`text-sm font-medium mt-1 ${scoreColor}`}>
                {governanceScore >= 80 ? '🏆 Excellent Performance' :
                 governanceScore >= 60 ? '⚡ Good Performance' : '⚠️ Needs Improvement'}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{kpis.resolution_rate || 0}%</div>
              <div className="text-gray-500 text-xs">Resolution Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{kpis.avg_satisfaction || 0}/5</div>
              <div className="text-gray-500 text-xs">Satisfaction</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{kpis.total_departments || 0}</div>
              <div className="text-gray-500 text-xs">Departments</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Complaints" value={kpis.total_complaints || 0} icon={FileText} color="blue" index={0} />
        <KPICard title="Resolved" value={kpis.resolved || 0} icon={CheckCircle} color="green" index={1} />
        <KPICard title="Pending" value={kpis.pending || 0} icon={Clock} color="yellow" index={2} />
        <KPICard title="Critical" value={kpis.critical || 0} icon={AlertTriangle} color="red" glowing index={3} />
        <KPICard title="Today New" value={kpis.today_new || 0} icon={Activity} color="cyan" index={4} />
        <KPICard title="Today Resolved" value={kpis.today_resolved || 0} icon={Zap} color="purple" index={5} />
        <KPICard title="Overdue" value={kpis.overdue || 0} icon={AlertTriangle} color="orange" index={6} />
        <KPICard title="Emergency" value={kpis.emergency || 0} icon={Shield} color="red" glowing index={7} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend */}
        <div className="lg:col-span-2 glass-card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Weekly Complaint Trend</h3>
              <p className="text-gray-500 text-xs">New vs Resolved complaints</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dashboard?.weekly_trend || []}>
              <defs>
                <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
              <Area type="monotone" dataKey="new" stroke="#3b82f6" fill="url(#newGrad)" strokeWidth={2} name="New" />
              <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#resolvedGrad)" strokeWidth={2} name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">By Category</h3>
              <p className="text-gray-500 text-xs">Complaint distribution</p>
            </div>
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={(dashboard?.category_breakdown || []).slice(0, 6)}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={35}
              >
                {(dashboard?.category_breakdown || []).slice(0, 6).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {(dashboard?.category_breakdown || []).slice(0, 4).map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                  <span className="text-gray-400 capitalize">{cat.category?.replace('_', ' ')}</span>
                </div>
                <span className="text-white font-medium">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="glass-card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">6-Month Trend</h3>
              <p className="text-gray-500 text-xs">Monthly complaint volume</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyTrend}>
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Rankings */}
        <div className="glass-card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Department Rankings</h3>
              <p className="text-gray-500 text-xs">Performance scores</p>
            </div>
            <Building2 className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="space-y-3">
            {(dashboard?.top_departments || []).map((dept, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  i === 1 ? 'bg-gray-400/20 text-gray-400' :
                  i === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-white/5 text-gray-500'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white truncate">{dept.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{dept.performance_score?.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.performance_score || 0}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{
                        background: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#f97316' : '#3b82f6'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District Heatmap & Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Heatmap */}
        <div className="glass-card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">District Heatmap</h3>
              <p className="text-gray-500 text-xs">Complaint concentration by district</p>
            </div>
            <MapPin className="w-5 h-5 text-red-400" />
          </div>
          <div className="space-y-2">
            {(dashboard?.district_heatmap || []).slice(0, 8).map((d, i) => {
              const maxCount = Math.max(...(dashboard?.district_heatmap || []).map(x => x.count))
              const pct = (d.count / maxCount) * 100
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-24 truncate">{d.district || 'Unknown'}</span>
                  <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="h-full rounded-full flex items-center justify-end pr-2"
                      style={{
                        background: `linear-gradient(90deg, #3b82f6, ${pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#3b82f6'})`
                      }}
                    >
                      <span className="text-[10px] text-white font-medium">{d.count}</span>
                    </motion.div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="glass-card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Citizen Sentiment</h3>
              <p className="text-gray-500 text-xs">AI-analyzed complaint sentiment</p>
            </div>
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="space-y-3">
            {(dashboard?.sentiment_breakdown || []).map((s, i) => {
              const total = (dashboard?.sentiment_breakdown || []).reduce((a, b) => a + b.count, 0)
              const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
              const sentimentConfig = {
                angry: { emoji: '😠', color: '#ef4444' },
                frustrated: { emoji: '😤', color: '#f97316' },
                urgent: { emoji: '🚨', color: '#f59e0b' },
                neutral: { emoji: '😐', color: '#6b7280' },
                satisfied: { emoji: '😊', color: '#10b981' },
              }
              const config = sentimentConfig[s.sentiment] || { emoji: '😐', color: '#6b7280' }
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{config.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400 capitalize">{s.sentiment}</span>
                      <span className="text-white">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: config.color }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{s.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
