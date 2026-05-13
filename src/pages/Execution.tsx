import { CheckCircle, Clock, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const timeline = [
  {
    stage: '阶段1：需求分析',
    agent: 'Orchestrator',
    status: 'completed',
    time: '14:32:15',
    result: '已解析需求，识别到3个竞品：Notion、Linear、Asana'
  },
  {
    stage: '阶段2：信息收集',
    agent: 'Researcher',
    status: 'completed',
    time: '14:33:42',
    result: '已搜索并抓取3个竞品的核心信息，共收集127条数据'
  },
  {
    stage: '阶段3：数据分析',
    agent: 'Analyzer',
    status: 'running',
    time: '14:35:10',
    result: '正在对比功能矩阵，分析定价策略...'
  },
  {
    stage: '阶段4：报告生成',
    agent: 'Reporter',
    status: 'pending',
    time: '--:--:--',
    result: '等待上一阶段完成...'
  },
]

export default function Execution() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4">
          <ArrowLeft size={20} />
          返回工作台
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">执行监控</h1>
        <p className="text-gray-600">竞品分析报告生成 · 执行ID: #EXEC-2026-05-11-001</p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          执行中...
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-6">
          {timeline.map((item, index) => (
            <div key={index} className={`flex gap-4 ${item.status === 'pending' ? 'opacity-50' : ''}`}>
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                item.status === 'completed' ? 'bg-green-100 text-green-600' :
                item.status === 'running' ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {item.status === 'completed' ? <CheckCircle size={24} /> :
                 item.status === 'running' ? <Clock size={24} className="animate-spin" /> :
                 <Clock size={24} />}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{item.stage}</h3>
                  <span className="text-sm text-gray-500">{item.time}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">{item.agent}</span> · {item.result}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4 justify-center">
        <Link
          to="/results"
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
        >
          查看实时结果
        </Link>
        <button className="bg-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors">
          停止执行
        </button>
      </div>
    </div>
  )
}
