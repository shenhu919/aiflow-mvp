import { useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AgentNode from '../components/nodes/AgentNode';
import ToolNode from '../components/nodes/ToolNode';
import ConditionNode from '../components/nodes/ConditionNode';
import InputNode from '../components/nodes/InputNode';
import OutputNode from '../components/nodes/OutputNode';
import { AGENTS } from '../types/node';

const nodeTypes = {
  agent: AgentNode,
  tool: ToolNode,
  condition: ConditionNode,
  input: InputNode,
  output: OutputNode,
};

const AGENT_COLORS: Record<string, string> = {
  orchestrator: '#7c3aed',
  researcher: '#2563eb',
  coder: '#059669',
  analyzer: '#d97706',
  executor: '#dc2626',
  reporter: '#0d9488',
};

type DragType = 'agent' | 'tool' | 'condition' | 'input' | 'output';

interface DragData {
  type: DragType;
  agentId?: string;
}

type NodeStatus = 'pending' | 'running' | 'completed' | 'error';

export default function Editor() {
  const [nodes, setNodes] = useState<Node[]>(() => {
    const saved = localStorage.getItem('aiflow-nodes');
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return [
      { id: 'input-1', type: 'input', position: { x: 80, y: 80 },
        data: { label: '用户输入', inputType: 'text' } },
      { id: 'agent-1', type: 'agent', position: { x: 320, y: 80 },
        data: { label: 'Orchestrator', agentId: 'orchestrator', description: '调度主管' } },
      { id: 'agent-2', type: 'agent', position: { x: 560, y: 80 },
        data: { label: 'Researcher', agentId: 'researcher', description: '信息收集' } },
      { id: 'output-1', type: 'output', position: { x: 800, y: 80 },
        data: { label: '输出结果', outputType: 'text' } },
    ];
  });

  const [edges, setEdges] = useState<Edge[]>(() => {
    const saved = localStorage.getItem('aiflow-edges');
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return [
      { id: 'e1-2', source: 'input-1', target: 'agent-1' },
      { id: 'e2-3', source: 'agent-1', target: 'agent-2' },
      { id: 'e3-4', source: 'agent-2', target: 'output-1' },
    ];
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [execStatus, setExecStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  // 持久化
  const save = useCallback((ns: Node[], es: Edge[]) => {
    localStorage.setItem('aiflow-nodes', JSON.stringify(ns));
    localStorage.setItem('aiflow-edges', JSON.stringify(es));
  }, []);

  const updateNodeData = useCallback((nodeId: string, newData: Record<string, unknown>) => {
    setNodes((nds) => {
      const next = nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n);
      save(next, edges);
      return next;
    });
  }, [edges, save]);

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((nds) => {
      const next = nds.filter((n) => n.id !== selectedNodeId);
      save(next, edges);
      return next;
    });
    setEdges((eds) => {
      const next = eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId);
      save(nodes, next);
      return next;
    });
    setSelectedNodeId(null);
  }, [selectedNodeId, edges, nodes, save]);

  const onNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const next = applyNodeChanges(changes, nds);
      save(next, edges);
      // 同步选中状态
      const selected = next.find((n) => n.selected);
      setSelectedNodeId(selected?.id || null);
      return next;
    });
  }, [edges, save]);

  const onEdgesChange: OnEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => {
      const next = applyEdgeChanges(changes, eds);
      save(nodes, next);
      return next;
    });
  }, [nodes, save]);

  const onConnect: OnConnect = useCallback((connection) => {
    setEdges((eds) => {
      const next = addEdge({ ...connection, id: `e-${Date.now()}` }, eds);
      save(nodes, next);
      return next;
    });
  }, [nodes, save]);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // 拖拽悬停
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 放置节点
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const dataStr = event.dataTransfer.getData('application/aiflow');
    if (!dataStr) return;
    const data: DragData = JSON.parse(dataStr);
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;
    const position = {
      x: event.clientX - bounds.left - 80,
      y: event.clientY - bounds.top - 30,
    };
    const id = `${data.type}-${Date.now()}`;
    let newNode: Node;
    if (data.type === 'agent' && data.agentId) {
      const agent = AGENTS.find((a) => a.id === data.agentId);
      newNode = { id, type: 'agent', position, data: { label: agent?.name || data.agentId, agentId: data.agentId, description: agent?.description || '' } };
    } else if (data.type === 'tool') {
      newNode = { id, type: 'tool', position, data: { label: 'Tool', toolId: 'unknown' } };
    } else if (data.type === 'condition') {
      newNode = { id, type: 'condition', position, data: { label: 'Condition', condition: '' } };
    } else if (data.type === 'input') {
      newNode = { id, type: 'input', position, data: { label: 'Input', inputType: 'text' } };
    } else if (data.type === 'output') {
      newNode = { id, type: 'output', position, data: { label: 'Output', outputType: 'text' } };
    } else return;
    setNodes((nds) => { const next = [...nds, newNode]; save(next, edges); return next; });
  }, [edges, save]);

  // 运行工作流 —— 同步执行模式
  const runWorkflow = useCallback(() => {
    setExecStatus('running');
    fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges }),
    })
      .then(res => res.json())
      .then(data => {
        // 根据结果更新节点状态
        if (data.results && Array.isArray(data.results)) {
          setNodes((nds) =>
            nds.map((n) => {
              const r = data.results.find((r: any) => r.nodeId === n.id);
              if (r) return { ...n, data: { ...n.data, status: r.status, output: r.output } };
              return n;
            })
          );
        }
        setExecStatus(data.status || 'completed');
        
        // 2秒后重置状态
        setTimeout(() => {
          setExecStatus('idle');
          setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: 'pending' } })));
        }, 2000);
      })
      .catch(() => {
        setExecStatus('idle');
        // 重置节点状态
        setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: 'pending' } })));
      });
  }, [nodes, edges]);

  const defaultEdgeOptions = { animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } };

  // 渲染右侧配置面板
  const renderConfigPanel = () => {
    if (!selectedNode) {
      return (
        <div className="text-xs text-gray-400">
          <p>点击画布中的节点进行配置</p>
        </div>
      );
    }
    const commonFields = (
      <>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">节点名称</label>
          <input
            type="text"
            value={(selectedNode.data as any).label ?? ''}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">状态</label>
          <select
            value={(selectedNode.data as any).status ?? 'pending'}
            onChange={(e) => updateNodeData(selectedNode.id, { status: e.target.value as NodeStatus })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="pending">⚪ 等待中</option>
            <option value="running">🔵 运行中</option>
            <option value="completed">🟢 已完成</option>
            <option value="error">🔴 错误</option>
          </select>
        </div>
      </>
    );

    const nodeType = selectedNode.type;
    let specificFields: React.ReactNode = null;

    if (nodeType === 'agent') {
      const data = selectedNode.data as Record<string, unknown>;
      specificFields = (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Agent 类型</label>
            <select
              value={(data.agentId as string) || ''}
              onChange={(e) => {
                const agent = AGENTS.find((a) => a.id === e.target.value);
                updateNodeData(selectedNode.id, { agentId: e.target.value, label: agent?.name || e.target.value });
              }}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {AGENTS.map((a) => (
                <option key={a.id} value={a.id}>{a.icon} {a.name} — {a.description}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">描述</label>
            <textarea
              value={(data.description as string) || ''}
              onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
              rows={2}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">提示词模板</label>
            <textarea
              defaultValue="请执行任务：\n- 输入：{input}\n- 输出：结构化结果"
              rows={3}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-xs"
            />
          </div>
        </>
      );
    } else if (nodeType === 'tool') {
      const data = selectedNode.data as Record<string, unknown>;
      specificFields = (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">工具 ID</label>
            <input
              type="text"
              value={(data.toolId as string) || ''}
              onChange={(e) => updateNodeData(selectedNode.id, { toolId: e.target.value })}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">描述</label>
            <textarea
              value={(data.description as string) || ''}
              onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
              rows={2}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>
        </>
      );
    } else if (nodeType === 'condition') {
      const data = selectedNode.data as Record<string, unknown>;
      specificFields = (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">条件表达式</label>
            <textarea
              value={(data.condition as string) || ''}
              onChange={(e) => updateNodeData(selectedNode.id, { condition: e.target.value })}
              rows={3}
              placeholder="例：result.score > 80"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono"
            />
          </div>
          <div className="text-xs text-gray-400 bg-purple-50 p-2 rounded-lg">
            💡 条件为真时走 <span className="text-green-600 font-bold">✓ true</span> 分支<br/>
            条件为假时走 <span className="text-red-600 font-bold">✗ false</span> 分支
          </div>
        </>
      );
    } else if (nodeType === 'input') {
      const data = selectedNode.data as Record<string, unknown>;
      specificFields = (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">输入类型</label>
          <select
            value={(data.inputType as string) || 'text'}
            onChange={(e) => updateNodeData(selectedNode.id, { inputType: e.target.value })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="text">📝 文本</option>
            <option value="file">📄 文件</option>
            <option value="api">🔌 API</option>
          </select>
        </div>
      );
    } else if (nodeType === 'output') {
      const data = selectedNode.data as Record<string, unknown>;
      specificFields = (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">输出类型</label>
          <select
            value={(data.outputType as string) || 'text'}
            onChange={(e) => updateNodeData(selectedNode.id, { outputType: e.target.value })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="text">📃 文本</option>
            <option value="file">📊 文件</option>
            <option value="notification">🔔 通知</option>
          </select>
        </div>
      );
    }

    const typeLabels: Record<string, string> = {
      agent: '🤖 Agent 节点',
      tool: '🛠️ Tool 节点',
      condition: '🔀 Condition 节点',
      input: '📥 Input 节点',
      output: '📤 Output 节点',
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700">{typeLabels[nodeType || ''] || '节点'}配置</h3>
          <button
            onClick={deleteSelectedNode}
            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
            title="删除节点"
          >
            🗑️ 删除
          </button>
        </div>
        <div className="text-xs text-gray-400">ID: <span className="font-mono">{selectedNode.id}</span></div>
        {commonFields}
        {specificFields}
        <button
          onClick={() => alert('配置已保存！')}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          💾 保存配置
        </button>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-800">AIFlow 工作流编辑器</h1>
          <p className="text-xs text-gray-500">拖拽左侧节点到画布，连接节点构建工作流</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runWorkflow}
            disabled={execStatus === 'running'}
            className={`px-5 py-2 rounded-lg font-semibold text-white transition-colors inline-flex items-center gap-2 ${
              execStatus === 'running' ? 'bg-gray-400 cursor-not-allowed' : execStatus === 'done' ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {execStatus === 'running' ? '⏳ 运行中...' : execStatus === 'done' ? '✅ 完成' : '▶ 运行工作流'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-60 bg-white border-r flex flex-col shadow-sm">
          <div className="p-4 border-b"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">智能体</h3></div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {AGENTS.map((agent) => (
              <div
                key={agent.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/aiflow', JSON.stringify({ type: 'agent', agentId: agent.id } as DragData));
                  e.dataTransfer.effectAllowed = 'move';
                }}
                className="p-3 border-2 border-gray-100 rounded-xl cursor-grab hover:border-indigo-300 hover:shadow-md transition-all active:cursor-grabbing bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm shadow-sm" style={{ backgroundColor: AGENT_COLORS[agent.id] || '#6366f1' }}>
                    {agent.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{agent.name}</div>
                    <div className="text-xs text-gray-500">{agent.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">工具节点</h3>
            {[
              { type: 'tool' as DragType, label: '🔧 Tool', desc: '工具调用节点' },
              { type: 'condition' as DragType, label: '🔀 Condition', desc: '条件分支节点' },
              { type: 'input' as DragType, label: '📥 Input', desc: '输入节点' },
              { type: 'output' as DragType, label: '📤 Output', desc: '输出节点' },
            ].map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/aiflow', JSON.stringify({ type: item.type } as DragData));
                  e.dataTransfer.effectAllowed = 'move';
                }}
                className="p-2 border border-gray-100 rounded-lg cursor-grab hover:border-indigo-300 transition-colors mb-2 text-sm bg-gray-50 hover:bg-white"
              >
                <div className="font-medium text-gray-700">{item.label}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* React Flow Canvas */}
        <main className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            className="bg-gray-50"
          >
            <Background color="#e0e7ff" gap={20} size={1} />
            <Controls className="!bg-white !shadow-lg !rounded-xl !border !border-gray-200" />
            <MiniMap
              nodeColor={(node) => {
                const colors: Record<string, string> = { agent: '#6366f1', tool: '#f59e0b', condition: '#a855f7', input: '#06b6d4', output: '#f43f5e' };
                return colors[node.type || ''] || '#94a3b8';
              }}
              className="!bg-white !border !border-gray-200 !rounded-xl !shadow-lg"
            />
          </ReactFlow>
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-gray-400 text-lg font-medium bg-white/80 px-6 py-3 rounded-2xl">
                🎯 从左侧拖拽节点到此处开始构建工作流
              </div>
            </div>
          )}
        </main>

        {/* Right Panel - Node Config */}
        <aside className="w-72 bg-white border-l shadow-sm p-4 overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-700 mb-3">节点配置</h3>
          {renderConfigPanel()}
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">工作流统计</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div>节点数：<span className="font-bold text-indigo-600">{nodes.length}</span></div>
              <div>连接数：<span className="font-bold text-indigo-600">{edges.length}</span></div>
              <div>选中：<span className="font-bold text-indigo-600">{selectedNodeId || '无'}</span></div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">快捷键</h4>
            <div className="space-y-1 text-xs text-gray-500">
              <div>🖱️ 拖拽：移动节点</div>
              <div>🔗 拖拽手柄：连接节点</div>
              <div>⌫：删除选中节点</div>
              <div>📋 点击画布空白：取消选中</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
