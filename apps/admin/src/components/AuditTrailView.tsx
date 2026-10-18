import React from 'react';
import { CheckCircle2, AlertOctagon, UserCheck } from 'lucide-react';
import { AdminAuditLogEntry } from '../types/admin.types';

interface AuditTrailViewProps {
  logs: AdminAuditLogEntry[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      {/* RBAC Governance Matrix */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Role-Based Access Control (RBAC) Boundaries</h3>
          </div>
          <p className="text-xs text-slate-400">
            Strict isolation enforced at the JWT authentication and router level.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-850/80 text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-4 font-semibold">Role</th>
                <th className="py-2.5 px-4 font-semibold">Permitted Operations</th>
                <th className="py-2.5 px-4 font-semibold">Strictly Forbidden Capabilities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/80 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-bold text-amber-400 whitespace-nowrap">DevOps Admin</td>
                <td className="py-3 px-4">
                  View server health, latency metrics, DB connection pool, CPU/memory, rate limits
                </td>
                <td className="py-3 px-4 text-rose-400 font-medium">
                  Viewing patient profiles, individual assessment answers, querying clinical collections
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-cyan-400 whitespace-nowrap">Support Auditor</td>
                <td className="py-3 px-4">
                  Inspect sanitized error traces, verify email delivery status, inspect audit ledger
                </td>
                <td className="py-3 px-4 text-rose-400 font-medium">
                  Viewing passwords, reading user questionnaires, decrypting biometric feeds
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-400 whitespace-nowrap">Patient User</td>
                <td className="py-3 px-4">
                  Access own profile, submit self-assessments, view own history & reports
                </td>
                <td className="py-3 px-4 text-rose-400 font-medium">
                  Accessing any /api/v1/admin/* routes (Rejected with 403 Forbidden)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Ledger */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-white">Administrative Audit Ledger</h3>
            <p className="text-xs text-slate-400">
              Immutable log of administrative logins, privilege checks, and telemetry queries.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{logs.length} Recorded Events</span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-500">
            No administrative audit events recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-850/80 text-slate-400 border-b border-slate-800 font-semibold">
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/80 font-mono text-slate-300">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200 font-sans">{log.adminEmail}</td>
                    <td className="py-3 px-4 text-cyan-400 font-semibold">{log.action}</td>
                    <td className="py-3 px-4 text-slate-400">{log.ipAddress}</td>
                    <td className="py-3 px-4">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 text-[11px] font-bold">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          FAILURE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans max-w-xs truncate">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
