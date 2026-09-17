import React from 'react';
import { Settings as SettingsIcon, ShieldCheck, Key, Database, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Settings: React.FC = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-emerald-400" />
          System & Account Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Platform configuration, roles, and AI provider parameters</p>
      </div>

      {/* Account Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          Authenticated Profile
        </h3>
        <div className="flex items-center gap-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={user?.name}
            className="w-12 h-12 rounded-full object-cover border border-slate-700"
          />
          <div>
            <h4 className="font-bold text-white text-sm">{user?.name}</h4>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <div className="mt-1 flex items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                ROLE: {user?.role}
              </span>
              <span className="text-slate-500">Google Subject ID: {user?.google_sub}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI & ML Engine Parameters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          AI & Deep Learning Configuration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 font-semibold block mb-0.5">AI Mode</span>
            <span className="text-emerald-400 font-bold">Grounded Demo Mode (Active)</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 font-semibold block mb-0.5">LLM Provider</span>
            <span className="text-slate-200 font-mono font-bold">OpenAI / Mock Grounded</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 font-semibold block mb-0.5">Deep Learning Model</span>
            <span className="text-blue-400 font-bold">PyTorch EnvironmentalRiskNet</span>
          </div>
        </div>
      </div>

      {/* Database & Spatial Index */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          Geospatial Spatial Engine
        </h3>
        <div className="text-xs space-y-2 text-slate-300">
          <p><strong>Database dialect:</strong> PostgreSQL + PostGIS extension (`geometry(Polygon, 4326)`)</p>
          <p><strong>Area calculation algorithm:</strong> PostGIS `ST_Area` / Geodesic spherical projection</p>
          <p><strong>Vector tiles & drawing:</strong> Mapbox GL JS + Mapbox GL Draw</p>
        </div>
      </div>
    </div>
  );
};
