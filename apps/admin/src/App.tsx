import { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Server, 
  Database, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function App() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [backendData, setBackendData] = useState<{
    uptimeSeconds?: number;
    environment?: string;
    phase?: string;
    database?: { status: string };
  } | null>(null);

  useEffect(() => {
    // Attempt connecting to local backend health check
    fetch('http://localhost:4000/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setBackendStatus('online');
        setBackendData(data);
      })
      .catch(() => {
        setBackendStatus('offline');
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Activity className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-['Outfit'] tracking-tight flex items-center gap-2">
              VitaSun <span className="text-xs bg-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">Phase 1 Foundation</span>
            </h1>
            <p className="text-xs text-slate-400">Technical Operations & Telemetry Portal</p>
          </div>
        </div>

        {/* Zero-PHI Invariant Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Zero-PHI Safeguard Active</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">System Scaffolding Verified</h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Phase 1 foundation is operational. This dashboard is dedicated strictly to technical observability, API latency, server uptime, and macro-level anonymized metrics ($N \ge 10$).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Node Runtime:</span>
            <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded text-slate-200">Express + TypeScript</span>
          </div>
        </div>

        {/* Telemetry Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Backend Status Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Backend API</span>
              <Server className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {backendStatus === 'online' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-xl font-bold text-emerald-400">Online</span>
                  </>
                ) : backendStatus === 'checking' ? (
                  <>
                    <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                    <span className="text-xl font-bold text-amber-400">Probing...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-slate-500" />
                    <span className="text-xl font-bold text-slate-400">Standby</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Port 4000 /health</p>
            </div>
          </div>

          {/* Database Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Database Connector</span>
              <Database className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-200">
                {backendData?.database?.status === 'connected' ? 'Connected' : 'Configured'}
              </span>
              <p className="text-xs text-slate-500 mt-1">MongoDB 7.0 + Mongoose Retry</p>
            </div>
          </div>

          {/* Architecture Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Folder Structure</span>
              <Cpu className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <span className="text-xl font-bold text-amber-400">Feature-Based</span>
              <p className="text-xs text-slate-500 mt-1">Vertical Slice Modules</p>
            </div>
          </div>

          {/* Active Phase Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Roadmap Status</span>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-200">Phase 1</span>
              <p className="text-xs text-slate-500 mt-1">Foundation & Scaffolding</p>
            </div>
          </div>
        </div>

        {/* Feature Modules Inventory */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Scaffolded Feature Modules (Phase 1 Ready)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800/80 space-y-1">
              <span className="font-semibold text-amber-400">apps/mobile</span>
              <p className="text-slate-400">Expo SDK 52 + Expo Router file-based layout + feature modules under src/features.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800/80 space-y-1">
              <span className="font-semibold text-amber-400">apps/backend</span>
              <p className="text-slate-400">Express + TypeScript layered API with core middleware, Mongoose connection retry & /health.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800/80 space-y-1">
              <span className="font-semibold text-amber-400">apps/admin</span>
              <p className="text-slate-400">React 18 + Vite + Tailwind CSS shell adhering strictly to Zero-PHI telemetry rules.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        VitaSun Clinical Platform &bull; Academic Research Origin: VGU Jaipur &bull; Strictly for Technical Observability (Zero-PHI)
      </footer>
    </div>
  );
}
