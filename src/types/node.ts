// Agent 定义
export interface Agent {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  type: 'orchestrator' | 'researcher' | 'coder' | 'analyzer' | 'executor' | 'reporter';
}

// 可用 Agent 列表（从现有 Editor.tsx 迁移）
export const AGENTS: Agent[] = [
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    icon: '⚙️',
    color: 'bg-blue-500',
    description: '调度主管',
    type: 'orchestrator',
  },
  {
    id: 'researcher',
    name: 'Researcher',
    icon: '🔍',
    color: 'bg-green-500',
    description: '信息收集',
    type: 'researcher',
  },
  {
    id: 'coder',
    name: 'Coder',
    icon: '💻',
    color: 'bg-purple-500',
    description: '代码生成',
    type: 'coder',
  },
  {
    id: 'analyzer',
    name: 'Analyzer',
    icon: '📊',
    color: 'bg-orange-500',
    description: '数据分析',
    type: 'analyzer',
  },
  {
    id: 'executor',
    name: 'Executor',
    icon: '⚡',
    color: 'bg-red-500',
    description: '任务执行',
    type: 'executor',
  },
  {
    id: 'reporter',
    name: 'Reporter',
    icon: '📝',
    color: 'bg-teal-500',
    description: '报告生成',
    type: 'reporter',
  },
];

// 节点配置
export interface NodeConfig {
  id: string;
  nodeId: string;
  promptTemplate?: string;
  model?: string;
  temperature?: number;
  maxTokes?: number;
  timeout?: number;
  retryCount?: number;
}

// 拖拽数据
export interface DragData {
  type: 'agent' | 'tool' | 'condition';
  agentId?: string;
  toolId?: string;
}
