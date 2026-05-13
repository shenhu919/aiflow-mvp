import { Download, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Results() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/execution" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4">
          ← 返回执行监控
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">竞品分析报告</h1>
        <p className="text-gray-600">执行时间：2026-05-11 14:32 · 总耗时：8分37秒</p>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 执行摘要</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-indigo-50 rounded-xl">
            <p className="text-2xl font-extrabold text-indigo-600">3</p>
            <p className="text-sm text-gray-600 mt-1">竞品数量</p>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <p className="text-2xl font-extrabold text-emerald-600">127</p>
            <p className="text-sm text-gray-600 mt-1">收集数据条数</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-2xl font-extrabold text-blue-600">94.2%</p>
            <p className="text-sm text-gray-600 mt-1">成功率</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <p className="text-2xl font-extrabold text-amber-600">8min</p>
            <p className="text-sm text-gray-600 mt-1">总耗时</p>
          </div>
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 竞品对比矩阵</h2>
        
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">功能特性对比</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li><strong>Notion</strong>：强在文档协作，AI功能完善，但项目管理较弱</li>
            <li><strong>Linear</strong>：最强的issue tracking，UI/UX业界顶尖，但学习曲线陡</li>
            <li><strong>Asana</strong>：功能最全面，适合大型企业，但价格较高</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">定价策略</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li><strong>Notion</strong>：$10/月（个人）→ $18/月（团队）</li>
            <li><strong>Linear</strong>：$8/月（基础）→ $16/月（进阶）</li>
            <li><strong>Asana</strong>：免费（基础）→ $10.99/月（进阶）</li>
          </ul>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">💡 核心洞察</h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2">
          <li><strong>市场缺口</strong>：轻量级、AI优先的项目管理工具仍有机会</li>
          <li><strong>定价趋势</strong>：AI功能成为溢价点，用户接受度较高</li>
          <li><strong>差异化方向</strong>：自动化工作流 + 多智能体协作是未来趋势</li>
        </ol>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📥 导出选项</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
            <Download size={18} />
            下载 Markdown
          </button>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
            <Download size={18} />
            下载 PDF
          </button>
          <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors inline-flex items-center gap-2">
            <Share2 size={18} />
            分享报告
          </button>
        </div>
      </div>
    </div>
  )
}
