import { Handle, Position, type NodeProps } from '@xyflow/react';

interface AgentNodeData {
  label: string;
  agentId: string;
  status?: 'pending' | 'running' | 'completed' | 'error';
  description?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 border-gray-300',
  running: 'bg-blue-50 border-blue-400 shadow-blue-100',
  completed: 'bg-green-50 border-green-400',
  error: 'bg-red-50 border-red-400',
};

const STATUS_DOTS: Record<string, string> = {
  pending: 'bg-gray-400',
  running: 'bg-blue-400 animate-pulse',
  completed: 'bg-green-500',
  error: 'bg-red-500',
};

export default function AgentNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as AgentNodeData;
  const status = nodeData.status || 'pending';
  const borderClass = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const dotClass = STATUS_DOTS[status] || STATUS_DOTS.pending;

  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 bg-white min-w-[180px] transition-all ${
        selected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
      } ${borderClass}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-400 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-3 h-3 rounded-full ${dotClass}`} />
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Agent</span>
      </div>
      <div className="font-bold text-sm text-gray-800">{nodeData.label || 'Agent'}</div>
      {nodeData.description && (
        <div className="text-xs text-gray-500 mt-1">{nodeData.description}</div>
      )}
      <div className="text-xs text-gray-400 mt-1">ID: {nodeData.agentId}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400 !w-3 !h-3" />
    </div>
  );
}
