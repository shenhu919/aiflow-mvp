import { Link } from 'react-router-dom'
import { ArrowRight, Bot, GitBranch, Wrench, Plug, Layers, Zap } from 'lucide-react'

const features = [
  {
    icon: GitBranch,
    title: '可视化编排',
    description: '拖拽式工作流设计，无需编程即可构建复杂的多智能体协作流程',
    color: 'bg-violet-100 text-violet-600',
  },
  {
    icon: Bot,
    title: '6大智能体',
    description: 'Orchestrator、Researcher、Coder、Analyzer、Executor、Reporter，各司其职',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Wrench,
    title: '丰富工具集',
    description: '内置Web搜索、网页抓取、文件操作、代码执行、Git、Slack等工具',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Zap,
    title: '实时监听',
    description: 'Hook机制让你在工作流执行的关键节点插入自定义逻辑',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Plug,
    title: 'MCP协议支持',
    description: '兼容Model Context Protocol，可扩展接入更多工具和数据源',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Layers,
    title: '工作流模板',
    description: '研究报告、代码审查、数据管道、内容创作等开箱即用的模板',
    color: 'bg-indigo-100 text-indigo-600',
  },
]

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            让AI智能体团队协作
            <br />
            <span className="text-indigo-200">像搭积木一样简单</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-indigo-100 max-w-2xl mx-auto">
            可视化编排多智能体工作流，自动化完成复杂任务。从研究到创作，从分析到执行，一站式解决。
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/dashboard"
              className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              开始使用 →
            </Link>
            <Link
              to="/editor"
              className="border-2 border-white/30 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300"
            >
              查看演示
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-4">
            为什么选择 AIFlow？
          </h2>
          <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            强大的多智能体编排能力，让AI真正为你工作
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            准备好开始了吗？
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            免费开始使用，无需信用卡
          </p>
          <Link
            to="/dashboard"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2"
          >
            立即开始 <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p>© 2026 AIFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
