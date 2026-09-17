import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Filter, Trees, Layers, ArrowRight } from 'lucide-react';
import { projectService, siteService } from '../services/api';
import { Project, Site } from '../types';
import { MapboxView } from '../components/map/MapboxView';

export const MapExplorer: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAllGeospatial = async () => {
      setLoading(true);
      try {
        const projList = await projectService.getProjects();
        setProjects(projList);

        let allSites: Site[] = [];
        for (const p of projList) {
          const pSites = await siteService.getProjectSites(p.id);
          allSites = [...allSites, ...pSites];
        }
        setSites(allSites);
        if (allSites.length > 0) {
          setSelectedSite(allSites[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadAllGeospatial();
  }, []);

  const filteredSites = selectedProjectId
    ? sites.filter((s) => s.project_id === selectedProjectId)
    : sites;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            Map Explorer & Spatial Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">PostGIS geometry layers with real-time vector tile rendering</p>
        </div>

        {/* Filter Dropdown */}
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Managed Projects ({sites.length} Sites)</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Map + Side Panel Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Mapbox Canvas */}
        <div className="lg:col-span-2 h-full">
          <MapboxView
            sites={filteredSites}
            selectedSiteId={selectedSite?.id}
            onSelectSite={(s) => setSelectedSite(s)}
            height="h-full"
          />
        </div>

        {/* Selected Site Side Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between overflow-y-auto">
          {selectedSite ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {selectedSite.status}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">{selectedSite.name}</h3>
                <p className="text-slate-400 mt-1">{selectedSite.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold">Area</span>
                  <p className="text-base font-bold text-white mt-0.5">{selectedSite.area_hectares} ha</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold">Geometry</span>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">Polygon</p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/sites/${selectedSite.id}`)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Open Full Site Telemetry & AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">Click a polygon site on the map to inspect telemetry</div>
          )}

          {/* Quick List */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider mb-2">
              Visible Sites ({filteredSites.length})
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {filteredSites.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSite(s)}
                  className={`p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between text-xs ${
                    selectedSite?.id === s.id
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="truncate max-w-[180px]">{s.name}</span>
                  <span className="font-mono text-[11px] text-slate-400">{s.area_hectares} ha</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
