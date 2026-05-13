import { Handle, Position, type NodeProps } from '@xyflow/react';

interface InputNodeData {
  label: string;
  inputType?: 'text' | 'file' | 'api';
  status?: 'pending' | 'running' | 'completed' | 'error';
}

export default function InputNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as InputNodeData;
  const inputType = nodeData.inputType || 'text';
  const icons: Record<string, string> = { text: '📝', file: '📄', api: '🔌' };

  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 bg-white min-w-[160px] transition-all ${
        selected ? 'ring-2 ring-cyan-500 ring-offset-2' : ''
      } border-cyan-300`}
    >
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{icons[inputType] || '📝'}</span>
        <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">Input</span>
      </div>
      <div className="font-bold text-sm text-gray-800">{nodeData.label || 'Input'}</div>
      <div className="text-xs text-gray-400 mt-1">type: {inputType}</div>
    </div>
  );
}
