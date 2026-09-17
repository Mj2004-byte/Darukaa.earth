import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe2, Sparkles, Shield, Database, BrainCircuit, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const { loginAsDemo, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      {/* Radial Gradient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-600/15 via-emerald-900/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="p-6 flex items-center justify-between max-w-7xl w-full mx-auto z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Globe2 className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Darukaa<span className="text-emerald-400">.Earth</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loginAsDemo('ANALYST')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold border border-slate-800 transition-colors"
          >
            Analyst Demo Login
          </button>
          <button
            onClick={() => loginAsDemo('ADMIN')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-900/40 transition-colors"
          >
            Admin Demo Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 flex flex-col items-center justify-center text-center z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span>AI-Powered Geospatial Carbon & Biodiversity Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Quantify Climate Impact with <span className="text-emerald-400 underline decoration-emerald-500/40">PostGIS & Agentic AI</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
          Manage carbon projects, model environmental risks using PyTorch deep learning, draw PostGIS site boundaries on Mapbox, and run grounded GenAI site analysis.
        </p>

        {/* Primary Google Auth Callout */}
        <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl max-w-md w-full space-y-4">
          <h2 className="text-lg font-bold text-white">Get Started with Darukaa</h2>
          <p className="text-xs text-slate-400">Google OAuth 2.0 OpenID Connect Authentication</p>

          <button
            onClick={() => loginAsDemo('ADMIN')}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-semibold">Or Quick Demo Evaluation</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => loginAsDemo('ADMIN')}
              className="w-full py-2.5 px-3 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <span>Admin Role</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => loginAsDemo('ANALYST')}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <span>Analyst Role</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full pt-8 text-left">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <Database className="w-6 h-6 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">PostGIS Spatial Engine</h3>
            <p className="text-xs text-slate-400">ST_Area, polygon centroid calculations, vector tile indexing.</p>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <BrainCircuit className="w-6 h-6 text-blue-400" />
            <h3 className="font-bold text-white text-sm">Darukaa Agentic AI</h3>
            <p className="text-xs text-slate-400">Tool execution mesh for multi-step cross-site analytical queries.</p>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h3 className="font-bold text-white text-sm">PyTorch Deep Learning</h3>
            <p className="text-xs text-slate-400">Neural Network environmental degradation risk classifier.</p>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Role-Aware Authorization</h3>
            <p className="text-xs text-slate-400">ADMIN & ANALYST role enforcement with Google OAuth JWT.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-slate-900 text-center text-xs text-slate-500 z-10">
        © 2026 Darukaa.Earth — AI-Powered Geospatial Carbon & Biodiversity Platform. Hiring Hackathon Project.
      </footer>
    </div>
  );
};
