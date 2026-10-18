import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Server,
  Activity,
  Users,
  AlertTriangle,
  LayoutDashboard,
  Cpu,
  Layers,
  FileCheck2,
  Lock
} from 'lucide-react';
import { AdminHeader } from './components/AdminHeader';
import { AdminLoginScreen } from './components/AdminLoginScreen';
import { InfrastructureHealthView } from './components/InfrastructureHealthView';
import { ApiTelemetryView } from './components/ApiTelemetryView';
import { MacroAnalyticsView } from './components/MacroAnalyticsView';
import { AuditTrailView } from './components/AuditTrailView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ServerIncidentScreen, ServerIncidentDetails } from './components/ServerIncidentScreen';
import { AdminApiService } from './services/adminApi.service';
import {
  AdminHealthData,
  AdminMetricsData,
  AdminAuditLogEntry,
  AdminUser
} from './types/admin.types';

type TabType = 'overview' | 'infrastructure' | 'telemetry' | 'macro' | 'audit';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => AdminApiService.getStoredUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [healthData, setHealthData] = useState<AdminHealthData>(() => AdminApiService.getFallbackHealth());
  const [metricsData, setMetricsData] = useState<AdminMetricsData>(() => AdminApiService.getFallbackMetrics());
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>(() => AdminApiService.getFallbackAuditLogs());

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [pollInterval, setPollInterval] = useState<number>(10); // default 10 seconds
  const [serverIncident, setServerIncident] = useState<ServerIncidentDetails | null>(null);
  const [showBypassCache, setShowBypassCache] = useState(false);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);

    try {
      // Parallel fetch from API
      const [health, metrics, logs] = await Promise.all([
        AdminApiService.fetchHealth(),
        AdminApiService.fetchMetrics(),
        AdminApiService.fetchAuditLogs()
      ]);

      setHealthData(health);
      setMetricsData(metrics);
      setAuditLogs(logs);
      setIsLiveConnected(true);
      setServerIncident(null);
      setShowBypassCache(false);
      retryCountRef.current = 0;
    } catch (err: unknown) {
      setIsLiveConnected(false);
      const errMsg = err instanceof Error ? err.message : String(err);
      retryCountRef.current++;

      // Probe backend directly via unauthenticated /health endpoint to get real status
      const probe = await AdminApiService.probeServerHealth();

      let incident: ServerIncidentDetails;

      if (!probe.isProcessRunning) {
        // Node.js backend process is completely down / not listening
        incident = {
          type: 'process_down',
          title: 'Backend API Process Offline / Terminated',
          reason:
            'Node.js backend server at http://localhost:4000 is not reachable. The server process was stopped (e.g., Ctrl+C / SIGINT) or has crashed.',
          technicalError: probe.rawError || 'TypeError: Failed to fetch (ECONNREFUSED)',
          targetUrl: 'http://localhost:4000/health',
          timestamp: new Date().toISOString(),
          serverProcessStatus: 'offline',
          serverUptimeSeconds: null,
          databaseStatus: 'unknown',
          databaseError: null,
          suggestedFix: [
            'In terminal, run: npm run backend:dev',
            'If you see "Error: listen EADDRINUSE: :::4000", an orphan node process is holding port 4000. Run: npx kill-port 4000',
            'Check terminal logs to see why the process stopped'
          ],
          retryCount: retryCountRef.current
        };
      } else if (probe.healthData?.database?.status === 'disconnected') {
        // Backend process is alive, but MongoDB is disconnected
        const dbErr =
          probe.healthData.database.lastError ||
          `MongoDB is disconnected (readyState: ${probe.healthData.database.readyState})`;
        incident = {
          type: 'db_down',
          title: 'Database Disconnected: MongoDB Connection Lost',
          reason:
            'Node.js backend server is running, but the MongoDB database connection is disconnected or failed to connect.',
          technicalError: `Database Error: ${dbErr}`,
          targetUrl: 'http://localhost:4000/health',
          timestamp: new Date().toISOString(),
          serverProcessStatus: 'online',
          serverUptimeSeconds: probe.healthData.uptimeSeconds,
          databaseStatus: 'disconnected',
          databaseError: dbErr,
          suggestedFix: [
            'Ensure MongoDB service is running (mongod or net start MongoDB)',
            'Verify MONGO_URI in .env file (default: mongodb://127.0.0.1:27017/vitatrack)',
            'Check MongoDB server logs'
          ],
          retryCount: retryCountRef.current
        };
      } else if (errMsg.startsWith('AUTH_REQUIRED')) {
        // Backend & DB are online, but JWT token is invalid or expired
        const parts = errMsg.split(':');
        const code = parts[1] || '401';
        const detail = parts.slice(2).join(':') || 'Invalid or expired authentication token.';
        incident = {
          type: 'auth_expired',
          title: `Administrator Session Expired (HTTP ${code})`,
          reason:
            'Backend server and MongoDB are both ONLINE, but the admin session token was rejected. (Server may have been restarted, resetting tokens).',
          technicalError: `HTTP ${code} Unauthorized: ${detail}`,
          targetUrl: 'http://localhost:4000/api/v1/admin/*',
          timestamp: new Date().toISOString(),
          serverProcessStatus: 'online',
          serverUptimeSeconds: probe.healthData?.uptimeSeconds ?? null,
          databaseStatus: 'connected',
          databaseError: null,
          suggestedFix: [
            'Click "Re-Authenticate" above to generate a fresh token',
            'Default SysAdmin: sysadmin@vitatrack.com / SuperSecretAdmin123!'
          ],
          retryCount: retryCountRef.current
        };
      } else {
        // Specific backend route error
        const parts = errMsg.split(':');
        const detail = parts.slice(2).join(':') || errMsg;
        incident = {
          type: 'server_error',
          title: 'Backend Route Execution Error',
          reason: 'Backend server returned an error while processing administrative telemetry.',
          technicalError: detail,
          targetUrl: 'http://localhost:4000/api/v1/admin/metrics',
          timestamp: new Date().toISOString(),
          serverProcessStatus: 'online',
          serverUptimeSeconds: probe.healthData?.uptimeSeconds ?? null,
          databaseStatus:
            probe.healthData?.database?.status === 'connected' ? 'connected' : 'disconnected',
          databaseError: probe.healthData?.database?.lastError ?? null,
          suggestedFix: [
            'Inspect backend terminal output for error traces',
            'Click "Check Server Now" once the backend service stabilizes'
          ],
          retryCount: retryCountRef.current
        };
      }

      setServerIncident(incident);
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle auto-polling
  useEffect(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    if (pollInterval > 0) {
      pollTimerRef.current = setInterval(() => {
        loadData(true);
      }, pollInterval * 1000);
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [pollInterval, loadData]);

  const handleLogout = () => {
    AdminApiService.clearAuth();
    setCurrentUser(null);
    loadData();
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    loadData();
  };

  // Strict Authentication Guard: If not logged in, show ONLY the Login Screen
  if (!currentUser) {
    return <AdminLoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Operations Header */}
      <AdminHeader
        user={currentUser}
        isLive={isLiveConnected}
        pollInterval={pollInterval}
        onPollIntervalChange={setPollInterval}
        onRefresh={() => loadData(false)}
        isRefreshing={isRefreshing}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {/* Incident Diagnostics View: Active when server is offline or crashed */}
        {!isLiveConnected && serverIncident && !showBypassCache ? (
          <ServerIncidentScreen
            incident={serverIncident}
            isRetrying={isRefreshing}
            onRetry={() => loadData(false)}
            onReLogin={() => {
              AdminApiService.clearAuth();
              setCurrentUser(null);
            }}
            onBypassCache={() => setShowBypassCache(true)}
          />
        ) : (
          <>
            {/* Show return to incident banner if user is viewing stale bypass cache */}
            {!isLiveConnected && showBypassCache && serverIncident && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-xs text-amber-200 shadow-md">
                <span>
                  <strong>Stale Cache View:</strong> Displaying snapshot telemetry while server is offline. Real-time data is stopped.
                </span>
                <button
                  onClick={() => setShowBypassCache(false)}
                  className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
                >
                  Return to Incident Diagnostics
                </button>
              </div>
            )}

            {/* Global KPI Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Backend Health */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Backend API</span>
              <Server className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xl font-bold text-white capitalize">
                  {healthData.services.api}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">Uptime: {healthData.system.uptimeFormatted}</p>
            </div>
          </div>

          {/* Card 2: Mobile API Avg Latency */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Mobile API Latency</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {metricsData.apiTelemetry.avgLatencyMs} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
              <p className="text-xs text-emerald-400 font-mono mt-1">
                P95: {metricsData.apiTelemetry.p95LatencyMs}ms (Target &le; 300ms)
              </p>
            </div>
          </div>

          {/* Card 3: Total Users (Macro) */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Total Users (Macro)</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {metricsData.macroAnalytics.totalUsers.toLocaleString()} <span className="text-xs font-normal text-slate-400">Patients</span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                DAU: {metricsData.macroAnalytics.dau.toLocaleString()} &bull; MAU: {metricsData.macroAnalytics.mau.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Card 4: 5xx Error Rate */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Mobile 5xx Errors</span>
              <AlertTriangle className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-emerald-400">
                {metricsData.apiTelemetry.errorRate5xxPercentage}%
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {metricsData.apiTelemetry.statusCodeDistribution['5xx']} events / {metricsData.apiTelemetry.totalRequests24h.toLocaleString()} calls
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
              activeTab === 'overview'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('infrastructure')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
              activeTab === 'infrastructure'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Infrastructure & Health</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
              activeTab === 'telemetry'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Mobile API & Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('macro')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
              activeTab === 'macro'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Macro Analytics (N &ge; 10)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
              activeTab === 'audit'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Audit Trail & RBAC</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overview combines Module 1 and Module 3 highlights */}
            <InfrastructureHealthView health={healthData} />
            <MacroAnalyticsView metrics={metricsData.macroAnalytics} />
          </div>
        )}

        {activeTab === 'infrastructure' && (
          <InfrastructureHealthView health={healthData} />
        )}

        {activeTab === 'telemetry' && (
          <ApiTelemetryView
            telemetry={metricsData.apiTelemetry}
            errors={metricsData.recentErrorStream}
          />
        )}

        {activeTab === 'macro' && (
          <MacroAnalyticsView metrics={metricsData.macroAnalytics} />
        )}

        {activeTab === 'audit' && (
          <AuditTrailView logs={auditLogs} />
        )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        VitaTrack Operations Portal &bull; Phase 9 Complete &bull; Zero-PHI Telemetry Verified &bull; Academic Origin: VGU Jaipur
      </footer>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
