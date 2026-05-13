import { Handle, Position, type NodeProps } from '@xyflow/react';

interface OutputNodeData {
  label: string;
  outputType?: 'text' | 'file' | 'notification';
  status?: 'pending' | 'running' | 'completed' | 'error';
}

export default function OutputNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as OutputNodeData;
  const outputType = nodeData.outputType || 'text';
  const icons: Record<string, string> = { text: '📃', file: '📊', notification: '🔔' };

  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 bg-white min-w-[160px] transition-all ${
        selected ? 'ring-2 ring-rose-500 ring-offset-2' : ''
      } border-rose-300`}
    >
      <Handle type="target" position={Position.Top} className="!bg-rose-400 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{icons[outputType] || '📃'}</span>
        <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Output</span>
      </div>
      <div className="font-bold text-sm text-gray-800">{nodeData.label || 'Output'}</div>
      <div className="text-xs text-gray-400 mt-1">type: {outputType}</div>
    </div>
  );
}
