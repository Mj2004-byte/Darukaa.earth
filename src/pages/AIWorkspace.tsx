import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Bot,
  Sparkles,
  Scale,
  Cpu,
  FileText,
} from 'lucide-react';
import { projectService, siteService } from '../services/api';
import { Site } from '../types';
import { AIChat } from '../components/ai/AIChat';
import { SiteAnalysis } from '../components/ai/SiteAnalysis';
import { SiteComparison } from '../components/ai/SiteComparison';
import { RiskPrediction } from '../components/ai/RiskPrediction';
import { ReportGenerator } from '../components/ai/ReportGenerator';

export const AIWorkspace: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis' | 'compare' | 'risk' | 'report'>('chat');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllSites = async () => {
      try {
        const projects = await projectService.getProjects();
        let all: Site[] = [];
        for (const p of projects) {
          const pSites = await siteService.getProjectSites(p.id);
          all = [...all, ...pSites];
        }
        setSites(all);
        if (all.length > 0) {
          setSelectedSiteId(all[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadAllSites();
  }, []);

  const selectedSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  const tabs = [
    { id: 'chat', label: 'Ask Darukaa AI', icon: Bot },
    { id: 'analysis', label: 'Site Analysis', icon: Sparkles },
    { id: 'compare', label: 'Compare Sites', icon: Scale },
    { id: 'risk', label: 'PyTorch Risk Model', icon: Cpu },
    { id: 'report', label: 'Generate AI Report', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-emerald-400" />
            Darukaa Intelligence AI Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Integrated GenAI Analyst, Agentic Tool Mesh, PyTorch Neural Risk Prediction, and Audit Reports
          </p>
        </div>

        {/* Site Selector Dropdown */}
        {sites.length > 0 && (
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                Target Site: {s.name} ({s.area_hectares} ha)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="space-y-4">
        {activeTab === 'chat' && <AIChat siteId={selectedSite?.id} siteName={selectedSite?.name} />}
        {activeTab === 'analysis' && selectedSite && <SiteAnalysis siteId={selectedSite.id} siteName={selectedSite.name} />}
        {activeTab === 'compare' && <SiteComparison sites={sites} />}
        {activeTab === 'risk' && selectedSite && <RiskPrediction siteId={selectedSite.id} siteName={selectedSite.name} />}
        {activeTab === 'report' && selectedSite && <ReportGenerator siteId={selectedSite.id} siteName={selectedSite.name} />}
      </div>
    </div>
  );
};
