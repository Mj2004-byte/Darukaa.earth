import React from 'react';
import { Sparkles, Info, CheckCircle2 } from 'lucide-react';

interface AIInsightCardProps {
  title: string;
  content: string;
  type?: 'POSITIVE' | 'NEUTRAL' | 'INFO';
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ title, content, type = 'POSITIVE' }) => {
  const badgeStyles = {
    POSITIVE: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300',
    NEUTRAL: 'bg-blue-950/60 border-blue-500/30 text-blue-300',
    INFO: 'bg-slate-800/80 border-slate-700 text-slate-300',
  };

  return (
    <div className={`p-4 rounded-xl border ${badgeStyles[type]} transition-all duration-200`}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
        <h4 className="text-xs font-bold uppercase tracking-wider">{title}</h4>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{content}</p>
    </div>
  );
};
