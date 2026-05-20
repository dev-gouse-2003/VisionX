import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileBarChart, Download, Bot, Loader2, Calendar } from 'lucide-react'
import { aiService, analyticsService } from '@/services/api'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false)
  const [report, setReport] = useState(null)

  const generateReport = async () => {
    setGenerating(true)
    try {
      const queries = [
        'general stats overview',
        'highest delays department',
        'complaint trends',
        'governance improvements',
        'low satisfaction services',
      ]
      const results = {}
      for (const query of queries) {
        const res = await aiService.askAssistant(query)
        results[res.data.intent] = res.data
      }
      setReport(results)
      toast.success('AI Report generated successfully!')
    } catch (e) {
      toast.error('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const exportCSV = async () => {
    try {
      const response = await analyticsService.exportReport()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'civicpulse_report.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('CSV exported!')
    } catch (e) {
      toast.error('Export failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Reports</h1>
          <p className="text-gray-400 text-sm mt-1">Generate intelligent governance reports</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateReport}
            disabled={generating}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            Generate AI Report
          </motion.button>
        </div>
      </div>

      {!report && !generating && (
        <div className="glass-card-dark p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">AI Governance Report</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Generate a comprehensive AI-powered governance report with insights on complaints, departments, officers, and recommendations.
          </p>
          <button onClick={generateReport} className="btn-primary">
            Generate Report Now
          </button>
        </div>
      )}

      {generating && (
        <div className="glass-card-dark p-12 text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">AI is analyzing governance data...</p>
        </div>
      )}

      {report && (
        <div className="space-y-4">
          {Object.entries(report).map(([intent, data], i) => (
            <motion.div
              key={intent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-dark p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium capitalize">
                  {intent.replace(/_/g, ' ')}
                </span>
              </div>
              <div
                className="text-gray-300 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: data.answer
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
