import React from 'react';
import {
  Users,
  Calendar,
  FileCheck2,
  Watch,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Lock,
  HeartCrack,
  FileText,
  Activity
} from 'lucide-react';
import { MacroPopulationMetrics } from '../types/admin.types';

interface MacroAnalyticsViewProps {
  metrics: MacroPopulationMetrics;
}

export const MacroAnalyticsView: React.FC<MacroAnalyticsViewProps> = ({ metrics }) => {
  const dist = metrics.distribution;
  const hasValidSample = dist.privacyGuaranteed && dist.lowRiskPercentage !== null;

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              Macro Aggregate Population Telemetry &bull; Zero-PHI Compliant
            </h4>
            <p className="text-slate-400">
              Only high-level anonymized counters ($N \ge 10$) are calculated. Individual patient identities, symptom answers, composite scores, and wearable feeds are mathematically excluded from administrative routes.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
            N &ge; 10 Rule Enforced
          </span>
        </div>
      </div>

      {/* Aggregate Population Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Users */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalUsers.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Active patient accounts</p>
        </div>

        {/* Daily Active Users (DAU) */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daily Active Users (DAU)</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.dau.toLocaleString()}</div>
          <p className="text-[11px] text-emerald-400 font-medium">Activity in past 24 hours</p>
        </div>

        {/* Monthly Active Users (MAU) */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monthly Active Users (MAU)</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.mau.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Engagement in past 30 days</p>
        </div>

        {/* Total Assessments Completed */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Self-Assessments</span>
            <FileCheck2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalAssessments.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Validated questionnaires</p>
        </div>
      </div>

      {/* Aggregate Population Risk Distribution & Wearable Adoption */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Population Risk Distribution Card (2 Columns) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Population Risk Tier Distribution (Macro Aggregation)
              </h3>
              <p className="text-xs text-slate-400">
                Aggregated percentages across total population &bull; Sample size: {dist.sampleSize} assessments
              </p>
            </div>
            {hasValidSample ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Sample Verified (N &ge; 10)
              </span>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Differential Privacy Active
              </span>
            )}
          </div>

          {hasValidSample ? (
            <div className="space-y-4">
              {/* Segmented Distribution Bar */}
              <div className="w-full bg-slate-800 rounded-xl h-5 flex overflow-hidden p-0.5">
                <div
                  title={`Low Risk: ${dist.lowRiskPercentage}%`}
                  style={{ width: `${dist.lowRiskPercentage}%` }}
                  className="bg-emerald-500 h-full rounded-l-lg transition-all"
                ></div>
                <div
                  title={`Moderate Risk: ${dist.moderateRiskPercentage}%`}
                  style={{ width: `${dist.moderateRiskPercentage}%` }}
                  className="bg-amber-500 h-full transition-all"
                ></div>
                <div
                  title={`High Risk: ${dist.highRiskPercentage}%`}
                  style={{ width: `${dist.highRiskPercentage}%` }}
                  className="bg-rose-500 h-full rounded-r-lg transition-all"
                ></div>
              </div>

              {/* Granular Percentage Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Low Risk Population</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400">{dist.lowRiskPercentage}%</div>
                  <p className="text-[10px] text-slate-500">Symptom score &le; 39 pts</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Moderate Risk</span>
                  </div>
                  <div className="text-xl font-bold text-amber-400">{dist.moderateRiskPercentage}%</div>
                  <p className="text-[10px] text-slate-500">Symptom score 40–69 pts</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span>High Risk</span>
                  </div>
                  <div className="text-xl font-bold text-rose-400">{dist.highRiskPercentage}%</div>
                  <p className="text-[10px] text-slate-500">Symptom score &ge; 70 pts</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center space-y-2">
              <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="text-sm font-semibold text-white">Risk Tier Breakdown Suppressed</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {dist.privacyNotice ||
                  'Differential privacy safeguard: When completed assessments N < 10, population percentages are suppressed to prevent re-identification.'}
              </p>
              <div className="text-xs font-mono text-amber-400/90 pt-1">
                Current Sample: {dist.sampleSize} / Minimum Required: 10
              </div>
            </div>
          )}
        </div>

        {/* Wearable Adoption Card (1 Column) */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Watch className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Wearable Sync Adoption</h3>
            </div>
            <p className="text-xs text-slate-400">Health Connect device adoption rate</p>
          </div>

          <div className="py-2 text-center">
            <div className="text-4xl font-extrabold text-white tracking-tight">
              {metrics.wearableAdoptionRate}%
            </div>
            <p className="text-xs text-cyan-400 font-medium mt-1">Active Smartwatch Integrations</p>
          </div>

          <div className="space-y-1.5">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metrics.wearableAdoptionRate, 100)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Normalized daily steps, resting heart rate, sleep duration & SpO2
            </p>
          </div>
        </div>
      </div>

      {/* Strictly Prohibited Views Architectural Enforcement Warning */}
      <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
        <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
          <Ban className="w-4 h-4" />
          <span>Architecturally Prohibited Data Views (Zero-PHI Invariants)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The VitaTrack Admin Portal has no routes or database controllers capable of querying individual patient records. The following categories are permanently blocked by architecture:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-rose-500/20 flex items-center space-x-2.5 text-slate-400">
            <Lock className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Patient Names & Email Lists</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-rose-500/20 flex items-center space-x-2.5 text-slate-400">
            <HeartCrack className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Individual Symptoms (Fatigue, Bone Pain)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-rose-500/20 flex items-center space-x-2.5 text-slate-400">
            <FileText className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Clinician PDF Health Reports</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-rose-500/20 flex items-center space-x-2.5 text-slate-400">
            <Activity className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Continuous Heart Rate, SpO2 & Sleep Streams</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-rose-500/20 flex items-center space-x-2.5 text-slate-400">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Personal Risk Tier Classifications</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-rose-500/20 flex items-center space-x-2.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Pure Differential Privacy Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
