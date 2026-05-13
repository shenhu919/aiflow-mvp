import { Handle, Position, type NodeProps } from '@xyflow/react';

interface ConditionNodeData {
  label: string;
  condition?: string;
  status?: 'pending' | 'running' | 'completed' | 'error';
}

export default function ConditionNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as ConditionNodeData;
  const status = nodeData.status || 'pending';

  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 bg-white min-w-[180px] transition-all ${
        selected ? 'ring-2 ring-purple-500 ring-offset-2' : ''
      } ${
        status === 'running' ? 'border-purple-400 bg-purple-50' : 'border-gray-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-purple-400 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">🔀</span>
        <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Condition</span>
      </div>
      <div className="font-bold text-sm text-gray-800">{nodeData.label || 'Condition'}</div>
      {nodeData.condition && (
        <div className="text-xs text-gray-500 mt-1 font-mono bg-purple-50 p-1 rounded">
          {nodeData.condition}
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <Handle type="source" position={Position.Bottom} id="true" className="!bg-green-400 !w-3 !h-3" />
        <Handle type="source" position={Position.Bottom} id="false" className="!bg-red-400 !w-3 !h-3" />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>✓ true</span>
        <span>✗ false</span>
      </div>
    </div>
  );
}
