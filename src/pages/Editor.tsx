import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Play, Trash2 } from 'lucide-react'

// 智能体数据
const AGENTS = [
  { id: 'orchestrator', name: 'Orchestrator', icon: '⚙️', color: 'bg-violet-100 text-violet-600', desc: '调度主管' },
  { id: 'researcher', name: 'Researcher', icon: '🔍', color: 'bg-blue-100 text-blue-600', desc: '信息检索' },
  { id: 'coder', name: 'Coder', icon: '💻', color: 'bg-emerald-100 text-emerald-600', desc: '代码生成' },
  { id: 'analyzer', name: 'Analyzer', icon: '📊', color: 'bg-amber-100 text-amber-600', desc: '数据分析' },
  { id: 'executor', name: 'Executor', icon: '⚡', color: 'bg-pink-100 text-pink-600', desc: '任务执行' },
  { id: 'reporter', name: 'Reporter', icon: '📝', color: 'bg-indigo-100 text-indigo-600', desc: '报告生成' },
]

// 可拖拽的智能体卡片
function DraggableAgent({ agent }: { agent: typeof AGENTS[0] }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: agent.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 border-2 border-gray-200 rounded-lg cursor-move hover:border-indigo-300 transition-colors bg-white"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-8 h-8 rounded-lg ${agent.color} flex items-center justify-center text-sm`}>
          {agent.icon}
        </div>
        <span className="font-medium text-sm">{agent.name}</span>
      </div>
      <p className="text-xs text-gray-500">{agent.desc}</p>
    </div>
  )
}

// 工作流阶段卡片
function StageCard({ stage, isSelected, onClick }: { stage: any; isSelected: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: stage.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const agent = AGENTS.find((a: any) => a.id === stage.agentId)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
        isSelected ? 'border-indigo-500 shadow-md' : 'hover:border-gray-300 bg-white'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            stage.status === 'completed' ? 'bg-green-500 text-white' :
            stage.status === 'running' ? 'bg-blue-500 text-white' :
            'bg-gray-200 text-gray-600'
          }`}>
            {stage.id}
          </div>
          <h3 className="font-semibold">{stage.name}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          stage.status === 'completed' ? 'bg-green-100 text-green-700' :
          stage.status === 'running' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {agent?.name || '未配置'}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500 ml-11">
        <span>✓ 配置完成</span>
        <span>✓ 工具已连接</span>
      </div>
    </div>
  )
}

export default function Editor() {
  const [stages, setStages] = useState(() => {
    // 从LocalStorage加载数据
    const saved = localStorage.getItem('aiflow-stages')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse saved stages:', e)
      }
    }
    // 默认数据
    return [
      { id: 'stage-1', name: '需求分析', agentId: 'orchestrator', status: 'completed' },
      { id: 'stage-2', name: '信息收集', agentId: 'researcher', status: 'running' },
      { id: 'stage-3', name: '数据分析', agentId: 'analyzer', status: 'pending' },
      { id: 'stage-4', name: '报告生成', agentId: 'reporter', status: 'pending' },
    ]
  })
  const [selectedStageId, setSelectedStageId] = useState(stages[0]?.id || '')

  // 保存数据到LocalStorage
  useEffect(() => {
    localStorage.setItem('aiflow-stages', JSON.stringify(stages))
  }, [stages])

  // 传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 处理拖拽结束
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setStages((items: any[]) => {
        const oldIndex = items.findIndex((i: any) => i.id === active.id)
        const newIndex = items.findIndex((i: any) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // 添加新阶段
  function addStage(agentId: string) {
    const newStage = {
      id: `stage-${Date.now()}`,
      name: '新阶段',
      agentId: agentId,
      status: 'pending',
    }
    setStages([...stages, newStage])
  }

  const selectedStage = stages.find((s: any) => s.id === selectedStageId)

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">竞品分析报告生成</h1>
          <p className="text-sm text-gray-500">可视化编排你的AI工作流</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
          <Play className="w-4 h-4" />
          运行工作流
        </button>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Agents */}
          <aside className="w-64 bg-white border-r overflow-y-auto p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              智能体（拖拽到画布）
            </h3>
            <div className="space-y-2">
              {AGENTS.map((agent) => (
                <DraggableAgent key={agent.id} agent={agent} />
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                工具
              </h3>
              <div className="space-y-2">
                <div className="p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span>🌐</span>
                    <span className="text-sm">WebSearch</span>
                  </div>
                </div>
                <div className="p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span>📄</span>
                    <span className="text-sm">WebFetch</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Center - Canvas */}
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto">
              <SortableContext items={stages} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {stages.map((stage: any, index: number) => (
                    <div key={stage.id}>
                      <StageCard
                        stage={stage}
                        isSelected={selectedStageId === stage.id}
                        onClick={() => setSelectedStageId(stage.id)}
                      />
                      {index < stages.length - 1 && (
                        <div className="flex justify-center py-2">
                          <div className="w-0.5 h-8 bg-gray-300"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>

              {/* Add Stage Button */}
              <button
                onClick={() => addStage('orchestrator')}
                className="mt-4 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                + 添加阶段
              </button>
            </div>
          </main>

          {/* Right Panel - Config */}
          <aside className="w-80 bg-white border-l overflow-y-auto p-6">
            <h3 className="text-lg font-semibold mb-4">阶段配置</h3>
            {selectedStage ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">阶段名称</label>
                  <input
                    type="text"
                    value={selectedStage.name}
                    onChange={(e) => {
                      setStages(stages.map((s: any) =>
                        s.id === selectedStage.id ? { ...s, name: e.target.value } : s
                      ))
                      setSelectedStageId(selectedStage.id)
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">智能体</label>
                  <select
                    value={selectedStage.agentId}
                    onChange={(e) => {
                      setStages(stages.map((s: any) =>
                        s.id === selectedStage.id ? { ...s, agentId: e.target.value } : s
                      ))
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {AGENTS.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">提示词模板</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                    defaultValue={`请搜索 {product_name} 的以下信息：\n1. 核心功能特性\n2. 定价策略\n3. 用户评价`}
                  />
                </div>
                <button
                  onClick={() => alert('配置已保存！')}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  保存配置
                </button>
                <button
                  onClick={() => {
                    setStages(stages.filter((s: any) => s.id !== selectedStage.id))
                    setSelectedStageId(stages[0]?.id || '')
                  }}
                  className="w-full bg-red-50 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  删除阶段
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">请选择一个阶段进行配置</p>
            )}
          </aside>
        </div>
      </DndContext>
    </div>
  )
}
