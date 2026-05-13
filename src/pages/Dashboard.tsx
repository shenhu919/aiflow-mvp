import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

const Dashboard = () => {
  const stats = [
    { label: '工作流总数', value: '12' },
    { label: '本月执行', value: '347' },
    { label: '成功率', value: '94.2%' },
    { label: '节省时间', value: '126h' },
  ]

  const workflows = [
    { id: 1, name: '竞品分析报告生成', status: 'active', lastExec: '2小时前', execCount: 89 },
    { id: 2, name: '代码审查助手', status: 'active', lastExec: '1天前', execCount: 156 },
    { id: 3, name: '技术博客自动生成', status: 'draft', lastExec: '3天前', execCount: 45 },
    { id: 4, name: '市场趋势分析', status: 'completed', lastExec: '5天前', execCount: 67 },
  ]

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-700',
      draft: 'bg-amber-100 text-amber-700',
      completed: 'bg-blue-100 text-blue-700',
    }
    const labels = {
      active: '活跃',
      draft: '草稿',
      completed: '已完成',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">我的工作台</h1>
        <Link
          to="/editor"
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
        >
          <Plus size={20} />
          新建工作流
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
            <p className="text-3xl font-extrabold text-indigo-600">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Workflows */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">我的工作流</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {workflows.map((wf) => (
            <div key={wf.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{wf.name}</h3>
                  <p className="text-sm text-gray-500">
                    最后执行：{wf.lastExec} · 执行次数：{wf.execCount}
                  </p>
                </div>
                {getStatusBadge(wf.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
