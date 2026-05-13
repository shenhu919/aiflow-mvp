// 工作流数据模型
export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: string;
  updatedAt: string;
}

// 流程节点
export interface FlowNode {
  id: string;
  type: 'agent' | 'tool' | 'condition' | 'input' | 'output';
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    agentId?: string;
    config?: Record<string, any>;
    status?: 'pending' | 'running' | 'completed' | 'error';
    description?: string;
  };
}

// 节点连接
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: React.CSSProperties;
}

// 节点类型定义
export const NODE_TYPES = {
  AGENT: 'agent',
  TOOL: 'tool',
  CONDITION: 'condition',
  INPUT: 'input',
  OUTPUT: 'output',
} as const;

export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];

// 节点状态
export const NODE_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

export type NodeStatus = typeof NODE_STATUS[keyof typeof NODE_STATUS];
