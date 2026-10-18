import React from 'react';
import {
  ServerCrash,
  AlertTriangle,
  RefreshCw,
  Terminal,
  ShieldAlert,
  Clock,
  WifiOff,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database
} from 'lucide-react';

export interface ServerIncidentDetails {
  type: 'process_down' | 'db_down' | 'auth_expired' | 'server_error';
  title: string;
  reason: string;
  technicalError: string;
  targetUrl: string;
  timestamp: string;
  serverProcessStatus: 'online' | 'offline';
  serverUptimeSeconds: number | null;
  databaseStatus: 'connected' | 'disconnected' | 'unknown';
  databaseError: string | null;
  suggestedFix: string[];
  retryCount: number;
}

interface ServerIncidentScreenProps {
  incident: ServerIncidentDetails;
  isRetrying: boolean;
  onRetry: () => void;
  onReLogin: () => void;
  onBypassCache?: () => void;
}

export const ServerIncidentScreen: React.FC<ServerIncidentScreenProps> = ({
  incident,
  isRetrying,
  onRetry,
  onReLogin,
  onBypassCache
}) => {
  const isAuth = incident.type === 'auth_expired';
  const isDbDown = incident.type === 'db_down';
  const isProcessDown = incident.type === 'process_down';

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-rose-500/30 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Top Incident Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0 shadow-lg shadow-rose-500/10">
            {isProcessDown ? (
              <ServerCrash className="w-8 h-8 animate-pulse" />
            ) : isDbDown ? (
              <Database className="w-8 h-8 text-rose-400 animate-pulse" />
            ) : isAuth ? (
              <Lock className="w-8 h-8" />
            ) : (
              <AlertTriangle className="w-8 h-8" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                System Incident Active
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(incident.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {incident.title}
            </h2>
            <p className="text-xs text-slate-400">
              Cached metrics suppressed &bull; Live telemetry interrupted at target endpoint
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-xl transition-all flex items-center gap-2 text-xs shadow-lg shadow-rose-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Probing Server...' : 'Check Server Now'}</span>
          </button>
          {isAuth && (
            <button
              onClick={onReLogin}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all flex items-center gap-2 text-xs shadow-lg shadow-amber-500/20"
            >
              <Lock className="w-4 h-4" />
              <span>Re-Authenticate</span>
            </button>
          )}
        </div>
      </div>

      {/* Why Cached Data is Blocked Notice */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-semibold text-slate-200">
            Why is cached dashboard data hidden?
          </h4>
          <p className="text-slate-400 leading-relaxed">
            VitaTrack strictly disallows misleading simulated metrics when the backend API is disconnected. Displaying outdated health counters or latency numbers during an active server crash can mask severe operational incidents.
          </p>
        </div>
      </div>

      {/* Root Cause Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: What Happened */}
        <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <WifiOff className="w-4 h-4" />
            <span>Root Cause Analysis</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {incident.reason}
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-rose-300 space-y-1">
            <div className="text-slate-500 uppercase text-[10px] font-bold">Caught Exception:</div>
            <div className="break-all">{incident.technicalError}</div>
            <div className="text-slate-500 text-[10px] mt-1">Target: {incident.targetUrl}</div>
          </div>
        </div>

        {/* Card 2: Incident Metadata & Health State */}
        <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Backend & Database Diagnostic State</span>
          </div>
          <div className="space-y-2.5 text-xs">
            {/* Backend Process Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Node.js API Server</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span
                  className={`w-2 h-2 rounded-full ${
                    incident.serverProcessStatus === 'online' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                ></span>
                <span
                  className={
                    incident.serverProcessStatus === 'online'
                      ? 'text-emerald-400 font-bold'
                      : 'text-rose-400 font-bold'
                  }
                >
                  {incident.serverProcessStatus.toUpperCase()}
                  {incident.serverUptimeSeconds !== null && ` (${incident.serverUptimeSeconds}s uptime)`}
                </span>
              </div>
            </div>

            {/* MongoDB Connection Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">MongoDB Cluster</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span
                  className={`w-2 h-2 rounded-full ${
                    incident.databaseStatus === 'connected'
                      ? 'bg-emerald-400'
                      : incident.databaseStatus === 'disconnected'
                      ? 'bg-rose-400'
                      : 'bg-slate-500'
                  }`}
                ></span>
                <span
                  className={
                    incident.databaseStatus === 'connected'
                      ? 'text-emerald-400 font-bold'
                      : incident.databaseStatus === 'disconnected'
                      ? 'text-rose-400 font-bold'
                      : 'text-slate-400 font-bold'
                  }
                >
                  {incident.databaseStatus.toUpperCase()}
                </span>
              </div>
            </div>

            {/* If DB disconnected, display exact DB error */}
            {incident.databaseStatus === 'disconnected' && incident.databaseError && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-300 font-mono">
                <span className="text-rose-400 font-bold">DB Error: </span>
                {incident.databaseError}
              </div>
            )}

            {/* Probe Attempt info */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px]">
              <span className="text-slate-400">Active Probe Attempt</span>
              <span className="text-slate-200 font-mono font-bold">#{incident.retryCount} (Auto-probe every 5s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Fixes / Terminal Commands */}
      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>Recommended DevOps Resolution Steps</span>
        </div>
        <ul className="space-y-2.5 text-xs text-slate-300">
          {incident.suggestedFix.map((fix, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span className="font-mono">{fix}</span>
            </li>
          ))}
        </ul>

        {/* Helpful note regarding EADDRINUSE conflict */}
        <div className="mt-4 p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-[11px] text-cyan-300">
          <strong>Tip regarding port 4000:</strong> If you see <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">Error: listen EADDRINUSE :::4000</code>, an existing Node process is already holding port 4000 in background. Close the previous terminal or kill it using <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">npx kill-port 4000</code>, then restart backend.
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Continuously listening for backend recovery on port 4000...</span>
        </div>

        {onBypassCache && (
          <button
            onClick={onBypassCache}
            className="text-slate-400 hover:text-slate-200 underline text-xs transition-colors flex items-center gap-1"
          >
            <span>View Offline Snapshot (Stale Dev Data)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
