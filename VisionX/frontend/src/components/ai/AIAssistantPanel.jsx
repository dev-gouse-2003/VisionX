import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDispatch } from 'react-redux'
import {
  X, Send, Bot, User, Sparkles, BarChart3,
  TrendingUp, AlertTriangle, Lightbulb, RefreshCw
} from 'lucide-react'
import { setAIAssistantOpen } from '@/store/slices/uiSlice'
import { aiService } from '@/services/api'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

const SUGGESTIONS = [
  { icon: AlertTriangle, text: 'Which department has highest delays?', color: 'text-red-400' },
  { icon: TrendingUp, text: 'Predict next month complaint trends', color: 'text-blue-400' },
  { icon: BarChart3, text: 'Show department performance rankings', color: 'text-green-400' },
  { icon: Lightbulb, text: 'Suggest governance improvements', color: 'text-yellow-400' },
  { icon: User, text: 'Which officers are overloaded?', color: 'text-purple-400' },
  { icon: Sparkles, text: 'Which services have low satisfaction?', color: 'text-pink-400' },
]

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

function ChartRenderer({ data, chartType }) {
  if (!data || chartType === 'none' || chartType === 'summary') return null

  if (chartType === 'bar' && data.departments) {
    return (
      <div className="mt-3 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.departments.slice(0, 5)}>
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={v => v.split(' ')[0]} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="overdue" fill="#ef4444" radius={[4, 4, 0, 0]} name="Overdue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (chartType === 'bar' && data.districts) {
    return (
      <div className="mt-3 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.districts.slice(0, 6)}>
            <XAxis dataKey="district" tick={{ fill: '#6b7280', fontSize: 10 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Complaints" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (chartType === 'line' && data.monthly_trend) {
    return (
      <div className="mt-3 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.monthly_trend}>
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} name="Complaints" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (chartType === 'pie' && data.categories) {
    return (
      <div className="mt-3 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data.categories.slice(0, 6)} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={60} label={({ category }) => category?.replace('_', ' ')}>
              {data.categories.slice(0, 6).map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (chartType === 'donut' && data.total) {
    const pieData = [
      { name: 'Resolved', value: data.resolved },
      { name: 'Pending', value: data.pending },
    ]
    return (
      <div className="mt-3 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} label={({ name, value }) => `${name}: ${value}`}>
              <Cell fill="#10b981" />
              <Cell fill="#f59e0b" />
            </Pie>
            <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return null
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-600 to-blue-600'
      }`}>
        {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-[#0d1526] border border-[#1e2d4a] text-gray-200 rounded-tl-sm'
        }`}>
          <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
            __html: message.content
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
              .replace(/\n/g, '<br/>')
          }} />
          {message.data && <ChartRenderer data={message.data} chartType={message.chartType} />}
        </div>
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.suggestions.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => message.onSuggestionClick?.(s)}
                className="text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function AIAssistantPanel() {
  const dispatch = useDispatch()
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: '👋 Hello! I\'m your **AI Governance Assistant**.\n\nI can answer questions about complaints, department performance, trends, and provide governance insights. What would you like to know?',
      suggestions: SUGGESTIONS.map(s => s.text),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const query = text || input.trim()
    if (!query || loading) return

    setInput('')
    const userMsg = { id: Date.now(), role: 'user', content: query }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const response = await aiService.askAssistant(query)
      const { answer, data, chart_type, suggestions } = response.data
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: answer,
        data,
        chartType: chart_type,
        suggestions,
        onSuggestionClick: sendMessage,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-96 bg-[#0a0f1e] border-l border-[#1e2d4a] flex flex-col z-30 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1e2d4a] bg-gradient-to-r from-purple-600/10 to-blue-600/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm">AI Governance Assistant</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => dispatch(setAIAssistantOpen(false))}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick suggestions (shown when no messages) */}
      {messages.length <= 1 && (
        <div className="px-4 py-3 border-b border-[#1e2d4a]">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Quick Questions</p>
          <div className="space-y-1.5">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s.text)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-left group"
              >
                <s.icon className={`w-3.5 h-3.5 ${s.color} flex-shrink-0`} />
                <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">{s.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={{ ...msg, onSuggestionClick: sendMessage }}
          />
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-[#0d1526] border border-[#1e2d4a] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-[#1e2d4a]">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about governance analytics..."
            className="flex-1 bg-[#0d1526] border border-[#1e2d4a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            disabled={loading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </motion.button>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">Powered by CivicPulse AI Engine</p>
      </div>
    </motion.div>
  )
}
