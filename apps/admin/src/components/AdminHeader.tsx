import React from 'react';
import {
  Activity,
  ShieldCheck,
  RefreshCw,
  LogOut,
  UserCheck,
  Radio
} from 'lucide-react';
import { AdminUser } from '../types/admin.types';

interface AdminHeaderProps {
  user: AdminUser | null;
  isLive: boolean;
  pollInterval: number; // in seconds, 0 = off
  onPollIntervalChange: (interval: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  isLive,
  pollInterval,
  onPollIntervalChange,
  onRefresh,
  isRefreshing,
  onLogout,
  onOpenLogin
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-3.5 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Portal Info */}
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Activity className="w-5 h-5 text-slate-950 font-black" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              VitaTrack <span className="text-slate-400 font-normal">Operations Portal</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              Prod
            </span>
            <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
              Phase 9
            </span>
          </div>
          <p className="text-xs text-slate-400">Technical Infrastructure & Telemetry Monitor</p>
        </div>
      </div>

      {/* Center Safeguard & Live Status Badges */}
      <div className="hidden lg:flex items-center space-x-3">
        {/* Zero-PHI Invariant Shield Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Zero-PHI Safeguard Active</span>
        </div>

        {/* Live Heartbeat Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            {isLive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isLive ? 'bg-emerald-500' : 'bg-slate-500'
              }`}
            ></span>
          </span>
          <span className="font-mono text-[11px]">{isLive ? 'Live Stream' : 'Cached View'}</span>
        </div>
      </div>

      {/* Right Controls: Refresh Interval, Manual Refresh, Admin Profile & Session */}
      <div className="flex items-center space-x-3">
        {/* Auto-Refresh Interval Selector */}
        <div className="flex items-center gap-1.5 bg-slate-850 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
          <Radio className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 text-[11px] hidden sm:inline">Poll:</span>
          <select
            value={pollInterval}
            onChange={(e) => onPollIntervalChange(Number(e.target.value))}
            className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
          >
            <option value={0} className="bg-slate-900 text-slate-200">
              Manual
            </option>
            <option value={5} className="bg-slate-900 text-slate-200">
              5s
            </option>
            <option value={10} className="bg-slate-900 text-slate-200">
              10s
            </option>
            <option value={30} className="bg-slate-900 text-slate-200">
              30s
            </option>
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition-all disabled:opacity-50"
          title="Refresh Telemetry Now"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
        </button>

        {/* Admin Account Chip */}
        {user ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-white leading-tight">{user.fullName || user.email}</span>
              <span className="text-[10px] text-amber-400 font-mono">Role: {user.role}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium transition-colors"
              title="Logout from Admin Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shadow-md shadow-amber-500/20 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
