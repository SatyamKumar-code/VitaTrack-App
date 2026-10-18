import React from 'react';
import {
  Server,
  Database,
  Cpu,
  Clock,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { AdminHealthData } from '../types/admin.types';

interface InfrastructureHealthViewProps {
  health: AdminHealthData;
}

export const InfrastructureHealthView: React.FC<InfrastructureHealthViewProps> = ({ health }) => {
  const heapPct = Math.round(
    (health.system.processMemory.heapUsedMB / health.system.processMemory.heapTotalMB) * 100
  );
  const poolPct = Math.round((health.database.activeConnections / health.database.poolSize) * 100);

  return (
    <div className="space-y-6">
      {/* Live Service Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Backend API Service */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Backend API</p>
              <h4 className="text-sm font-bold text-white capitalize">{health.services.api}</h4>
            </div>
          </div>
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
        </div>

        {/* MongoDB Replica Set */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">MongoDB 7.0</p>
              <h4 className="text-sm font-bold text-white capitalize">{health.services.database}</h4>
            </div>
          </div>
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
        </div>

        {/* Redis Cache */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Redis Cluster</p>
              <h4 className="text-sm font-bold text-white capitalize">{health.services.redis}</h4>
            </div>
          </div>
          <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50"></span>
        </div>

        {/* AI Explainer Proxy */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">AI Proxy Engine</p>
              <h4 className="text-sm font-bold text-white capitalize">{health.services.aiProxy}</h4>
            </div>
          </div>
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
        </div>
      </div>

      {/* System Resources & Runtime Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node.js Heap & Memory Usage */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Node.js Process Memory</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {health.system.processMemory.heapUsedMB} MB / {health.system.processMemory.heapTotalMB} MB
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Heap Allocation</span>
              <span className="font-semibold text-slate-200">{heapPct}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  heapPct > 85 ? 'bg-rose-500' : heapPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(heapPct, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Resident Set Size (RSS):</span>
            <span className="font-mono text-slate-200 font-medium">{health.system.processMemory.rssMB} MB</span>
          </div>
        </div>

        {/* Mongoose Connection Pool Monitor */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">DB Connection Pool</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {health.database.activeConnections} / {health.database.poolSize} slots
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Pool Utilization</span>
              <span className="font-semibold text-slate-200">{poolPct}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(poolPct, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Ready State:</span>
            <span className="font-mono text-emerald-400 font-medium">ReadyState: {health.database.readyState} (Connected)</span>
          </div>
        </div>

        {/* CPU & Uptime Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">CPU & SLA Availability</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-medium">
              {health.system.cpuUtilizationPercent}% Load
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>CPU Utilization</span>
              <span className="font-semibold text-slate-200">{health.system.cpuUtilizationPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(health.system.cpuUtilizationPercent, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Continuous Uptime:</span>
            </span>
            <span className="font-mono text-slate-200 font-medium">{health.system.uptimeFormatted}</span>
          </div>
        </div>
      </div>

      {/* Deployment & Invariant Notes */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Active Architecture: Vertical Slice Modular Monolith (Express 4 + TypeScript 5)</span>
        </div>
        <div className="flex items-center space-x-4 font-mono text-[11px]">
          <span>Node: {health.system.nodeVersion}</span>
          <span>Environment: {health.system.environment}</span>
          <span>Pool Max: {health.database.poolSize}</span>
        </div>
      </div>
    </div>
  );
};
