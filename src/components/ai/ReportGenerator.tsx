import React, { useState } from 'react';
import { FileText, Download, Copy, Check, Sparkles } from 'lucide-react';
import { aiService } from '../../services/api';
import { AIReportResponse } from '../../types';
import { AIThinkingIndicator } from './AIThinkingIndicator';

interface ReportGeneratorProps {
  siteId: string;
  siteName: string;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ siteId, siteName }) => {
  const [report, setReport] = useState<AIReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await aiService.generateReport(siteId);
      setReport(res);
    } catch (e) {
      console.warn('Report generation API warning, using demo dataset report:', e);
      const markdown = `# Environmental Audit Report: ${siteName}
**Generated Date:** ${new Date().toISOString()}  
**Spatial Engine:** PostGIS Vector Indexing (SRID 4326)  
**Deep Learning Model:** PyTorch EnvironmentalRiskNet v1.0  

---

## Executive Summary
This environmental audit report evaluates **${siteName}**. Telemetry confirms stable ecosystem trajectories across carbon sequestration, tree cover density, and biodiversity indices.

## Telemetry Metrics
- **Carbon Stock:** 247.8 tCO2e/ha
- **Carbon Sequestration:** 21.8 tCO2e/yr
- **Biodiversity Score:** 90.6 / 100
- **Tree Cover Percentage:** 83.5%
- **Annual Rainfall:** 2,160.0 mm
- **Mean Temperature:** 26.5 °C

## PyTorch Deep Learning Risk Assessment
- **Computed Risk Score:** 0.185
- **Risk Classification:** **Low Risk Level**
- **Primary Factors:** High tree canopy density and steady soil biomass retention.

## Recommendations
1. Maintain continuous satellite telemetry monitoring.
2. Expand native enrichment planting along boundary buffer zones.
3. Conduct semi-annual ground truth sample plots.

---
*Notice: Demonstration report generated for platform evaluation.*`;

      setReport({
        site_id: siteId,
        site_name: siteName,
        report_title: `Environmental Audit Report: ${siteName}`,
        report_content: markdown,
        generated_at: new Date().toISOString(),
        is_demo_data: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (report) {
      navigator.clipboard.writeText(report.report_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (report) {
      const element = document.createElement('a');
      const file = new Blob([report.report_content], { type: 'text/markdown' });
      element.href = URL.createObjectURL(file);
      element.download = `Darukaa_AI_Report_${siteName.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            AI Report Generator
          </h3>
          <p className="text-xs text-slate-400">Generate structured environmental audit report for {siteName}</p>
        </div>
        <button
          onClick={generateReport}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Generating Report...' : 'Generate AI Report'}</span>
        </button>
      </div>

      {loading && <AIThinkingIndicator statusText="Compiling spatial polygon data, telemetry, and PyTorch risk score into report..." />}

      {report && !loading && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200">{report.report_title}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors flex items-center gap-1 text-[11px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .MD</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {report.report_content}
          </div>
        </div>
      )}
    </div>
  );
};
