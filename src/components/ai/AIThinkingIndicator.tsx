import React from 'react';
import { Brain, Cpu, Database } from 'lucide-react';

interface AIThinkingIndicatorProps {
  statusText?: string;
}

export const AIThinkingIndicator: React.FC<AIThinkingIndicatorProps> = ({
  statusText = 'Analyzing project & site telemetry...',
}) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 animate-pulse">
      <div className="relative">
        <Brain className="w-5 h-5 text-emerald-400 animate-bounce" />
        <Cpu className="w-3 h-3 text-emerald-300 absolute -bottom-1 -right-1" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold">{statusText}</p>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-emerald-400/80">
          <Database className="w-3 h-3" />
          <span>PostGIS Query Execution → Grounded LLM</span>
        </div>
      </div>
    </div>
  );
};
