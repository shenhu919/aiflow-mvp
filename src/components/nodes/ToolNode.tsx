import { Handle, Position, type NodeProps } from '@xyflow/react';

interface ToolNodeData {
  label: string;
  toolId: string;
  status?: 'pending' | 'running' | 'completed' | 'error';
  description?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 border-gray-300',
  running: 'bg-amber-50 border-amber-400',
  completed: 'bg-green-50 border-green-400',
  error: 'bg-red-50 border-red-400',
};

export default function ToolNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as ToolNodeData;
  const status = nodeData.status || 'pending';
  const borderClass = STATUS_COLORS[status] || STATUS_COLORS.pending;

  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 bg-white min-w-[160px] transition-all ${
        selected ? 'ring-2 ring-amber-500 ring-offset-2' : ''
      } ${borderClass}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-400 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">🛠️</span>
        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Tool</span>
      </div>
      <div className="font-bold text-sm text-gray-800">{nodeData.label || 'Tool'}</div>
      {nodeData.description && (
        <div className="text-xs text-gray-500 mt-1">{nodeData.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-amber-400 !w-3 !h-3" />
    </div>
  );
}
