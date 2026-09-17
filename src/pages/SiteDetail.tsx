import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Trees, ShieldCheck, CloudRain, Thermometer, Activity } from 'lucide-react';
import { siteService, analyticsService } from '../services/api';
import { Site, Analytics } from '../types';
import { MapboxView } from '../components/map/MapboxView';
import { CarbonTrendChart } from '../components/dashboard/CarbonTrendChart';
import { BiodiversityChart } from '../components/dashboard/BiodiversityChart';
import { RiskPrediction } from '../components/ai/RiskPrediction';
import { SiteAnalysis } from '../components/ai/SiteAnalysis';
import { AIChat } from '../components/ai/AIChat';
import { ReportGenerator } from '../components/ai/ReportGenerator';

export const SiteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSiteData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [siteData, analyticsData] = await Promise.all([
          siteService.getSite(id),
          analyticsService.getSiteAnalytics(id),
        ]);
        setSite(siteData);
        setAnalytics(analyticsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadSiteData();
  }, [id]);

  if (loading || !site) {
    return <div className="p-6 text-slate-400">Loading site telemetry...</div>;
  }

  const latest = analytics[analytics.length - 1] || {
    carbon_stock: 220.0,
    carbon_sequestration: 18.5,
    biodiversity_score: 82.0,
    tree_cover_percentage: 76.0,
    biomass: 190.0,
    rainfall: 1400.0,
    temperature: 24.0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/projects/${site.project_id}`)}
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">{site.name}</h1>
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {site.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{site.description}</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Area</span>
          <p className="text-lg font-bold text-white mt-1">{site.area_hectares} ha</p>
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
        <MapboxView sites={[site]} height="h-80" />
      </div>

      {/* Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Carbon Telemetry History</h3>
          <CarbonTrendChart analytics={analytics} />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Biodiversity Telemetry History</h3>
          <BiodiversityChart analytics={analytics} />
        </div>
      </div>

      {/* PyTorch Deep Learning Risk Model */}
      <RiskPrediction siteId={site.id} siteName={site.name} />

      {/* GenAI Site Analysis */}
      <SiteAnalysis siteId={site.id} siteName={site.name} />

      {/* AI Chat & Report Generator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIChat siteId={site.id} siteName={site.name} />
        <ReportGenerator siteId={site.id} siteName={site.name} />
      </div>
    </div>
  );
};
