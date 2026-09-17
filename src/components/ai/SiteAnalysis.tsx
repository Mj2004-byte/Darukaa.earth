import React, { useState } from 'react';
import { Sparkles, CheckCircle, AlertTriangle, Lightbulb, FileText } from 'lucide-react';
import { aiService } from '../../services/api';
import { SiteAnalysisResponse } from '../../types';
import { AIThinkingIndicator } from './AIThinkingIndicator';

interface SiteAnalysisProps {
  siteId: string;
  siteName: string;
}

export const SiteAnalysis: React.FC<SiteAnalysisProps> = ({ siteId, siteName }) => {
  const [analysis, setAnalysis] = useState<SiteAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await aiService.analyzeSite(siteId);
      setAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            AI Environmental Analyst
          </h3>
          <p className="text-xs text-slate-400">Grounded analysis based strictly on retrieved telemetry for {siteName}</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Analyzing...' : 'Analyze Site with AI'}</span>
        </button>
      </div>

      {loading && <AIThinkingIndicator statusText="Building dataset snapshot & querying grounded LLM..." />}

      {analysis && !loading && (
        <div className="space-y-4 text-xs">
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 text-slate-200">
            <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] mb-1">Executive Summary</h4>
            <p className="leading-relaxed">{analysis.executive_summary}</p>
          </div>

          {/* Grid Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <h4 className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">Carbon Analysis</h4>
              <p className="text-slate-300 leading-relaxed">{analysis.carbon_analysis}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">Biodiversity Analysis</h4>
              <p className="text-slate-300 leading-relaxed">{analysis.biodiversity_analysis}</p>
            </div>
          </div>

          {/* Environmental Factors */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">Environmental Factors</h4>
            <p className="text-slate-300 leading-relaxed">{analysis.environmental_factors}</p>
          </div>

          {/* Monitoring & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-2">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Areas to Monitor
              </h4>
              <ul className="space-y-1 text-slate-300">
                {analysis.areas_to_monitor.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-2">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Data-Driven Recommendations
              </h4>
              <ul className="space-y-1 text-slate-300">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 italic text-center pt-2">
            {analysis.grounding_note}
          </p>
        </div>
      )}
    </div>
  );
};
