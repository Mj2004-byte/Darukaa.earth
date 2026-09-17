import React, { useState } from 'react';
import { Scale, Sparkles, ArrowRightLeft } from 'lucide-react';
import { aiService } from '../../services/api';
import { Site, CompareSitesResponse } from '../../types';
import { AIThinkingIndicator } from './AIThinkingIndicator';

interface SiteComparisonProps {
  sites: Site[];
}

export const SiteComparison: React.FC<SiteComparisonProps> = ({ sites }) => {
  const [siteAId, setSiteAId] = useState<string>(sites[0]?.id || '');
  const [siteBId, setSiteBId] = useState<string>(sites[1]?.id || sites[0]?.id || '');
  const [comparison, setComparison] = useState<CompareSitesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!siteAId || !siteBId) return;
    setLoading(true);
    try {
      const res = await aiService.compareSites(siteAId, siteBId);
      setComparison(res);
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
            <Scale className="w-5 h-5 text-emerald-400" />
            Site Comparison AI
          </h3>
          <p className="text-xs text-slate-400">Side-by-side environmental telemetry comparison</p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Select Site A</label>
          <select
            value={siteAId}
            onChange={(e) => setSiteAId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.area_hectares} ha)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Select Site B</label>
          <select
            value={siteBId}
            onChange={(e) => setSiteBId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.area_hectares} ha)
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={loading || !siteAId || !siteBId}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
      >
        <ArrowRightLeft className="w-4 h-4" />
        <span>Compare with AI</span>
      </button>

      {loading && <AIThinkingIndicator statusText="Fetching side-by-side PostGIS metrics & generating comparison..." />}

      {comparison && !loading && (
        <div className="space-y-4 pt-2 text-xs">
          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                  <th className="p-3 font-semibold">Metric</th>
                  <th className="p-3 font-semibold text-emerald-400">{comparison.site_a_name}</th>
                  <th className="p-3 font-semibold text-blue-400">{comparison.site_b_name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/50 text-slate-200">
                {Object.entries(comparison.metrics_comparison).map(([metric, vals]) => (
                  <tr key={metric} className="hover:bg-slate-800/40">
                    <td className="p-3 font-medium text-slate-300">{metric}</td>
                    <td className="p-3 font-mono">{vals['Site A']}</td>
                    <td className="p-3 font-mono">{vals['Site B']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Summary */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 text-slate-300 space-y-1">
            <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Comparative Summary
            </h4>
            <p className="leading-relaxed">{comparison.ai_summary}</p>
          </div>
        </div>
      )}
    </div>
  );
};
