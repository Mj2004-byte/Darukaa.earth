import React, { useState } from 'react';
import { Cpu, AlertTriangle, ShieldCheck, Activity, Info } from 'lucide-react';
import { mlService } from '../../services/api';
import { RiskPredictionResponse } from '../../types';
import { AIThinkingIndicator } from './AIThinkingIndicator';

interface RiskPredictionProps {
  siteId: string;
  siteName: string;
}

export const RiskPrediction: React.FC<RiskPredictionProps> = ({ siteId, siteName }) => {
  const [prediction, setPrediction] = useState<RiskPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const runPrediction = async () => {
    setLoading(true);
    try {
      const res = await mlService.predictRisk(siteId);
      setPrediction(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const riskBadgeStyles = {
    Low: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
    Moderate: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
    High: 'bg-rose-950/80 border-rose-500/40 text-rose-300',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              Environmental Risk Prediction
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Experimental AI Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            PyTorch Multi-Layer Perceptron (`EnvironmentalRiskNet v1.0`)
          </p>
        </div>
        <button
          onClick={runPrediction}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg transition-all"
        >
          <Activity className="w-4 h-4" />
          <span>{loading ? 'Running Model...' : 'Run Risk Prediction'}</span>
        </button>
      </div>

      {loading && <AIThinkingIndicator statusText="Running PyTorch neural network forward pass & computing feature contributions..." />}

      {prediction && !loading && (
        <div className="space-y-4 text-xs">
          {/* Risk Gauge Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border flex flex-col justify-center items-center text-center ${riskBadgeStyles[prediction.risk_level]}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider mb-1">Computed Risk Level</span>
              <span className="text-3xl font-extrabold tracking-tight">{prediction.risk_level}</span>
              <span className="text-xs mt-1 opacity-90 font-mono">Score: {prediction.risk_score}</span>
            </div>

            {/* Risk Explanation */}
            <div className="md:col-span-2 p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] mb-1">AI Model Explanation</h4>
                <p className="leading-relaxed">{prediction.ai_explanation}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2">
                <Info className="w-3 h-3 text-amber-400" />
                <span>Demonstration Deep Learning model — Not a scientific prediction or environmental certification.</span>
              </div>
            </div>
          </div>

          {/* Feature Importance Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Feature Stress Contributions</h4>
            <div className="space-y-2">
              {Object.entries(prediction.feature_contributions).map(([feat, weight]) => {
                const pct = Math.round(weight * 100);
                return (
                  <div key={feat} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-slate-400">
                      <span className="capitalize">{feat.replace(/_/g, ' ')}</span>
                      <span className="font-mono">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
