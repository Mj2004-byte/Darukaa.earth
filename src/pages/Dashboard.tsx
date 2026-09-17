import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  MapPin,
  Trees,
  CloudRain,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { analyticsService, projectService, siteService } from '../services/api';
import { DashboardStats, Project, Site } from '../types';
import { KPICard } from '../components/dashboard/KPICard';
import { CarbonTrendChart } from '../components/dashboard/CarbonTrendChart';
import { BiodiversityChart } from '../components/dashboard/BiodiversityChart';
import { TreeCoverChart } from '../components/dashboard/TreeCoverChart';
import { AIInsightCard } from '../components/dashboard/AIInsightCard';
import { MapboxView } from '../components/map/MapboxView';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, projectsData] = await Promise.all([
          analyticsService.getDashboardStats(),
          projectService.getProjects(),
        ]);
        setStats(statsData);
        setProjects(projectsData);

        if (projectsData.length > 0) {
          const siteList = await siteService.getProjectSites(projectsData[0].id);
          setSites(siteList);
        }
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Environmental Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial analytics, PostGIS vector spatial indexing, and grounded AI insights
          </p>
        </div>
        <button
          onClick={() => navigate('/ai')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Darukaa Intelligence AI</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Projects"
          value={stats?.total_projects || 3}
          subtitle={`${stats?.active_projects || 3} Active`}
          icon={FolderKanban}
          iconColor="text-emerald-400"
        />
        <KPICard
          title="Active Sites"
          value={stats?.total_sites || 5}
          subtitle="PostGIS Geometries"
          icon={MapPin}
          iconColor="text-blue-400"
        />
        <KPICard
          title="Total Area"
          value={`${(stats?.total_area_ha || 8971.5).toLocaleString()} ha`}
          subtitle="Registered Polygons"
          icon={Trees}
          iconColor="text-emerald-400"
          change="+8.4%"
          isPositive={true}
        />
        <KPICard
          title="Carbon Sequestered"
          value={`${(stats?.total_carbon_sequestered || 124.5).toLocaleString()} tCO2e`}
          subtitle="Annual Sequestration"
          icon={TrendingUp}
          iconColor="text-indigo-400"
          change="+12.1%"
          isPositive={true}
        />
        <KPICard
          title="Avg Biodiversity"
          value={`${stats?.avg_biodiversity_score || 82.4} / 100`}
          subtitle="Ecological Index"
          icon={ShieldCheck}
          iconColor="text-emerald-400"
          change="+4.5%"
          isPositive={true}
        />
        <KPICard
          title="Canopy Cover"
          value="78.5%"
          subtitle="Mean Tree Cover"
          icon={CloudRain}
          iconColor="text-teal-400"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Carbon Stock & Sequestration Trend</h3>
            <span className="text-[10px] text-slate-400 font-medium">Multi-Year Telemetry</span>
          </div>
          <CarbonTrendChart />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Tree Canopy Composition</h3>
            <span className="text-[10px] text-slate-400 font-medium">PostGIS Density</span>
          </div>
          <TreeCoverChart />
        </div>
      </div>

      {/* Mapbox Explorer & Biodiversity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Interactive Spatial Map Explorer</h3>
            <button
              onClick={() => navigate('/map')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
            >
              <span>Full Explorer</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <MapboxView sites={sites} height="h-72" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Biodiversity Index Recovery</h3>
            <span className="text-[10px] text-slate-400 font-medium">0-100 Score</span>
          </div>
          <BiodiversityChart />
        </div>
      </div>

      {/* AI Insights Callout Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white">AI Automated Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats?.recent_insights.map((insight, idx) => (
            <AIInsightCard
              key={idx}
              title={insight.title}
              content={insight.content}
              type={insight.type as any}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
