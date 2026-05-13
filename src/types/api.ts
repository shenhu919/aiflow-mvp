// API 通用响应
import type { Workflow, FlowNode, FlowEdge } from './workflow';
import type { Agent } from './node';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 工作流 API
export interface WorkflowListResponse {
  workflows: Workflow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface WorkflowCreateRequest {
  name: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface WorkflowUpdateRequest extends Partial<WorkflowCreateRequest> {
  updatedAt?: string;
}

// 执行 API
export interface ExecutionRequest {
  workflowId: string;
  input?: Record<string, any>;
  config?: {
    maxSteps?: number;
    timeout?: number;
  };
}

export interface ExecutionResponse {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime: string;
  endTime?: string;
  results?: ExecutionResult[];
}

export interface ExecutionResult {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  output?: any;
  error?: string;
  duration?: number;
}

export interface ExecutionStatus {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number; // 0-100
  currentNodeId?: string;
  results: ExecutionResult[];
  startTime: string;
  endTime?: string;
}

// Agent API
export interface AgentListResponse {
  agents: Agent[];
}

export interface AgentExecuteRequest {
  agentId: string;
  input: Record<string, any>;
  config?: Record<string, any>;
}

export interface AgentExecuteResponse {
  result: any;
  duration: number;
  tokenUsage?: {
    input: number;
    output: number;
  };
}
