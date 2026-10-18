import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { AdminApiService } from '../services/adminApi.service';
import { AdminUser } from '../types/admin.types';

interface AdminLoginScreenProps {
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('sysadmin@vitatrack.com');
  const [password, setPassword] = useState('SuperSecretAdmin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { user } = await AdminApiService.login(email.trim(), password);
      onLoginSuccess(user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed. Please verify administrative credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('sysadmin@vitatrack.com');
    setPassword('SuperSecretAdmin123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-6 relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Placeholder */}
      <div className="w-full max-w-md pt-4 flex items-center justify-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Zero-PHI Administrative Access Control</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md my-auto relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Logo & Heading */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden bg-white p-1.5 shadow-xl shadow-amber-500/25 border border-amber-500/30 flex items-center justify-center">
              <img src="/logo.png" alt="VitaTrack Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                VitaTrack <span className="text-xs bg-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">Admin</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">Technical Operations & Telemetry Portal</p>
            </div>
          </div>

          {/* Privacy Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Zero-PHI Restricted:</strong> Access requires verified administrator role (<code className="bg-emerald-950/60 px-1 py-0.5 rounded text-emerald-200">role: admin</code>). Non-admin patient credentials will be rejected.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sysadmin@vitatrack.com"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleQuickDemo}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autofill Sysadmin Credentials</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{loading ? 'Authenticating Administrator...' : 'Sign In to Operations Portal'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-md pb-4 text-center text-[11px] text-slate-600 space-y-1">
        <p>VitaTrack Clinical Platform &bull; Academic Origin: VGU Jaipur</p>
        <p>Strictly for Infrastructure Telemetry & Operational Health (Zero-PHI)</p>
      </footer>
    </div>
  );
};
