import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { siteService, analyticsService } from '../services/api';
import { Site, Analytics } from '../types';
import { MapboxView } from '../components/map/MapboxView';
import { CarbonTrendChart } from '../components/dashboard/CarbonTrendChart';
import { BiodiversityChart } from '../components/dashboard/BiodiversityChart';
import { RiskPrediction } from '../components/ai/RiskPrediction';
import { SiteAnalysis } from '../components/ai/SiteAnalysis';
import { AIChat } from '../components/ai/AIChat';
import { ReportGenerator } from '../components/ai/ReportGenerator';

const DEMO_FALLBACK_SITE: Site = {
  id: 'site-1',
  project_id: 'proj-1',
  name: 'Tapajós Core Restoration Sector A',
  description: 'Dense rainforest sector undergoing high-density enrichment planting of native Brazil nut and Dipteryx trees.',
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [-54.95, -3.20],
      [-54.85, -3.20],
      [-54.85, -3.30],
      [-54.95, -3.30],
      [-54.95, -3.20]
    ]]
  },
  area_hectares: 2450.50,
  status: 'ACTIVE',
  created_at: new Date().toISOString(),
};

const DEMO_ANALYTICS: Analytics[] = [
  { id: 'a1', site_id: 'site-1', recorded_at: '2025-09-22T00:00:00Z', carbon_stock: 210.0, carbon_sequestration: 18.5, biodiversity_score: 78.0, tree_cover_percentage: 76.0, biomass: 190.0, rainfall: 2100.0, temperature: 26.5 },
  { id: 'a2', site_id: 'site-1', recorded_at: '2025-12-21T00:00:00Z', carbon_stock: 222.6, carbon_sequestration: 19.6, biodiversity_score: 82.2, tree_cover_percentage: 78.5, biomass: 201.4, rainfall: 2120.0, temperature: 26.5 },
  { id: 'a3', site_id: 'site-1', recorded_at: '2026-03-21T00:00:00Z', carbon_stock: 235.2, carbon_sequestration: 20.7, biodiversity_score: 86.4, tree_cover_percentage: 81.0, biomass: 212.8, rainfall: 2140.0, temperature: 26.5 },
  { id: 'a4', site_id: 'site-1', recorded_at: '2026-09-17T00:00:00Z', carbon_stock: 247.8, carbon_sequestration: 21.8, biodiversity_score: 90.6, tree_cover_percentage: 83.5, biomass: 224.2, rainfall: 2160.0, temperature: 26.5 }
];

export const SiteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<Site>(DEMO_FALLBACK_SITE);
  const [analytics, setAnalytics] = useState<Analytics[]>(DEMO_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSiteData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [siteData, analyticsData] = await Promise.all([
          siteService.getSite(id),
          analyticsService.getSiteAnalytics(id),
        ]);
        if (siteData) setSite(siteData);
        if (analyticsData && analyticsData.length > 0) setAnalytics(analyticsData);
      } catch (e) {
        console.warn('Site telemetry API warning, using demo dataset telemetry:', e);
        setSite((prev) => ({ ...DEMO_FALLBACK_SITE, id: id || prev.id }));
        setAnalytics(DEMO_ANALYTICS);
      } finally {
        setLoading(false);
      }
    };
    loadSiteData();
  }, [id]);

  const activeSite = site || DEMO_FALLBACK_SITE;
  const activeAnalytics = analytics.length > 0 ? analytics : DEMO_ANALYTICS;

  const latest = activeAnalytics[activeAnalytics.length - 1] || DEMO_ANALYTICS[DEMO_ANALYTICS.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/projects/${activeSite.project_id}`)}
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">{activeSite.name}</h1>
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {activeSite.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{activeSite.description}</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Area</span>
          <p className="text-lg font-bold text-white mt-1">{activeSite.area_hectares} ha</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Carbon Stock</span>
          <p className="text-lg font-bold text-emerald-400 mt-1">{latest.carbon_stock} tCO2e/ha</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Biodiversity</span>
          <p className="text-lg font-bold text-blue-400 mt-1">{latest.biodiversity_score} / 100</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Tree Cover</span>
          <p className="text-lg font-bold text-teal-400 mt-1">{latest.tree_cover_percentage}%</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Annual Rainfall</span>
          <p className="text-lg font-bold text-indigo-400 mt-1">{latest.rainfall} mm</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Temperature</span>
          <p className="text-lg font-bold text-amber-400 mt-1">{latest.temperature} °C</p>
        </div>
      </div>

      {/* Mapbox View */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">PostGIS Spatial Polygon Boundary</h3>
        <MapboxView sites={[activeSite]} height="h-80" />
      </div>

      {/* Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Carbon Telemetry History</h3>
          <CarbonTrendChart analytics={activeAnalytics} />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Biodiversity Telemetry History</h3>
          <BiodiversityChart analytics={activeAnalytics} />
        </div>
      </div>

      {/* PyTorch Deep Learning Risk Model */}
      <RiskPrediction siteId={activeSite.id} siteName={activeSite.name} />

      {/* GenAI Site Analysis */}
      <SiteAnalysis siteId={activeSite.id} siteName={activeSite.name} />

      {/* AI Chat & Report Generator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIChat siteId={activeSite.id} siteName={activeSite.name} />
        <ReportGenerator siteId={activeSite.id} siteName={activeSite.name} />
      </div>
    </div>
  );
};
