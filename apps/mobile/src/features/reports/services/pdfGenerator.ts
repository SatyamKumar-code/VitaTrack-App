import * as Print from 'expo-print';
import { ClinicianReportPayload, AssessmentHistoryItem } from '../types/report.types';

export const PdfGenerator = {
  /**
   * Generates a clinician-ready PDF document from patient assessment and longitudinal data
   * Reference: TASK-P6-04
   */
  async generateClinicianReportPdf(payload: ClinicianReportPayload): Promise<{ uri: string }> {
    const html = this.buildReportHtml(payload);
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false
    });
    return { uri };
  },

  /**
   * Native print or print preview dialog
   */
  async printReport(payload: ClinicianReportPayload): Promise<void> {
    const html = this.buildReportHtml(payload);
    await Print.printAsync({ html });
  },

  /**
   * Builds clinical HTML/CSS template
   */
  buildReportHtml(payload: ClinicianReportPayload): string {
    const { patient, latestAssessment, assessmentHistory, summaryMetrics, generatedAt } = payload;

    const formattedDate = new Date(generatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const getRiskColor = (tier: string) => {
      switch (tier.toLowerCase()) {
        case 'high':
          return '#EF4444';
        case 'moderate':
          return '#F59E0B';
        default:
          return '#10B981';
      }
    };

    const riskColor = getRiskColor(latestAssessment.riskTier);

    const historyRows = assessmentHistory
      .slice(0, 8)
      .map((item, idx) => {
        const itemDate = new Date(item.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        const badgeColor = getRiskColor(item.riskTier);
        return `
          <tr>
            <td>#${assessmentHistory.length - idx}</td>
            <td><strong>${itemDate}</strong></td>
            <td><span style="font-weight: 700; color: ${badgeColor};">${item.compositeScore} / 100</span></td>
            <td><span class="badge" style="background-color: ${badgeColor}1A; color: ${badgeColor}; border: 1px solid ${badgeColor};">${item.riskTier.toUpperCase()}</span></td>
            <td>${item.subScores.symptomScore}</td>
            <td>${item.subScores.solarDeficitScore}</td>
            <td>${item.subScores.dietaryDeficitScore}</td>
            <td>${item.subScores.medicalMultiplierScore}</td>
            <td>${item.doctorAlert ? '<span style="color:#EF4444; font-weight:700;">YES</span>' : 'No'}</td>
          </tr>
        `;
      })
      .join('');

    const keyContributorsHtml =
      latestAssessment.aiExplanation?.keyContributors &&
      latestAssessment.aiExplanation.keyContributors.length > 0
        ? latestAssessment.aiExplanation.keyContributors
            .map((c) => `<li style="margin-bottom: 4px;">${c}</li>`)
            .join('')
        : '<li>Standard baseline profile evaluated</li>';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>VitaTrack Clinician Health Summary - ${patient.fullName}</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 16mm 16mm 16mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      background-color: #FFFFFF;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #0D9488;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-left {
      flex: 1;
    }
    .brand-title {
      font-size: 20pt;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-title span {
      color: #D97706;
    }
    .brand-subtitle {
      font-size: 9.5pt;
      color: #64748B;
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .header-right {
      text-align: right;
      font-size: 8.5pt;
      color: #64748B;
    }
    .confidential-pill {
      display: inline-block;
      background-color: #FEF2F2;
      color: #DC2626;
      border: 1px solid #FCA5A5;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 8pt;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .section-title {
      font-size: 11.5pt;
      font-weight: 700;
      color: #0F172A;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
    }
    .section-title::before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 14px;
      background-color: #0D9488;
      margin-right: 8px;
      border-radius: 2px;
    }
    .grid-2 {
      display: table;
      width: 100%;
      table-layout: fixed;
      margin-bottom: 10px;
    }
    .grid-col {
      display: table-cell;
      vertical-align: top;
      width: 50%;
      padding-right: 10px;
    }
    .grid-col:last-child {
      padding-right: 0;
      padding-left: 10px;
    }
    .card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 8px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 9.5pt;
    }
    .meta-label {
      color: #64748B;
      font-weight: 500;
    }
    .meta-value {
      color: #0F172A;
      font-weight: 600;
    }
    .score-banner {
      display: table;
      width: 100%;
      background-color: #F8FAFC;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 14px;
    }
    .score-col-main {
      display: table-cell;
      vertical-align: middle;
      width: 35%;
      border-right: 1px solid #E2E8F0;
      padding-right: 14px;
      text-align: center;
    }
    .score-col-details {
      display: table-cell;
      vertical-align: middle;
      width: 65%;
      padding-left: 14px;
    }
    .score-number {
      font-size: 32pt;
      font-weight: 800;
      line-height: 1;
      color: ${riskColor};
    }
    .score-max {
      font-size: 12pt;
      color: #94A3B8;
      font-weight: 500;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin-top: 6px;
      margin-bottom: 10px;
    }
    table.data-table th {
      background-color: #0F172A;
      color: #FFFFFF;
      text-align: left;
      padding: 6px 8px;
      font-weight: 600;
      font-size: 8.5pt;
    }
    table.data-table td {
      border-bottom: 1px solid #E2E8F0;
      padding: 6px 8px;
      color: #334155;
    }
    table.data-table tr:nth-child(even) td {
      background-color: #F8FAFC;
    }
    .doctor-callout {
      background-color: #FFFBEB;
      border-left: 4px solid #D97706;
      border-top: 1px solid #FDE68A;
      border-right: 1px solid #FDE68A;
      border-bottom: 1px solid #FDE68A;
      border-radius: 4px;
      padding: 10px 12px;
      margin-top: 10px;
      font-size: 9pt;
      color: #78350F;
    }
    .doctor-callout strong {
      display: block;
      margin-bottom: 2px;
      color: #92400E;
    }
    .physician-notes-box {
      border: 1px dashed #94A3B8;
      border-radius: 6px;
      background-color: #FAFAFA;
      padding: 8px 12px;
      margin-top: 10px;
      min-height: 60px;
    }
    .physician-notes-title {
      font-size: 8.5pt;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .disclaimer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #E2E8F0;
      font-size: 7.5pt;
      color: #94A3B8;
      line-height: 1.4;
      text-align: justify;
    }
    .disclaimer strong {
      color: #64748B;
    }
  </style>
</head>
<body>

  <!-- Clinical Header -->
  <div class="header">
    <div class="header-left">
      <h1 class="brand-title">Vita<span>Track</span></h1>
      <div class="brand-subtitle">Clinical Vitamin D Deficiency Screening &amp; Health Trajectory</div>
    </div>
    <div class="header-right">
      <div class="confidential-pill">CONFIDENTIAL CLINICIAN SUMMARY</div>
      <div><strong>Generated:</strong> ${formattedDate}</div>
      <div><strong>Patient ID:</strong> ${latestAssessment.id.substring(0, 10).toUpperCase()}</div>
    </div>
  </div>

  <!-- Patient Demographics & Baseline Context -->
  <div class="section-title">Patient Profile &amp; Demographics</div>
  <div class="grid-2">
    <div class="grid-col">
      <div class="card">
        <div class="meta-row">
          <span class="meta-label">Full Name:</span>
          <span class="meta-value">${patient.fullName}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Email:</span>
          <span class="meta-value">${patient.email || 'N/A'}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Estimated Age:</span>
          <span class="meta-value">${patient.age ? `${patient.age} yrs` : 'N/A'}</span>
        </div>
      </div>
    </div>
    <div class="grid-col">
      <div class="card">
        <div class="meta-row">
          <span class="meta-label">Fitzpatrick Skin Phototype:</span>
          <span class="meta-value">${(patient.skinType || 'Type III').toUpperCase()}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Dietary Preference:</span>
          <span class="meta-value">${(patient.dietaryPreference || 'Omnivore').toUpperCase()}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Reported Medical Conditions:</span>
          <span class="meta-value">${
            patient.medicalConditions && patient.medicalConditions.length > 0
              ? patient.medicalConditions.join(', ')
              : 'None declared'
          }</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Current Clinical Evaluation Banner -->
  <div class="section-title">Latest Risk Assessment (#${assessmentHistory.length})</div>
  <div class="score-banner">
    <div class="score-col-main">
      <div class="score-number">${latestAssessment.compositeScore}<span class="score-max">/100</span></div>
      <div style="margin-top: 4px;">
        <span class="badge" style="background-color: ${riskColor}1A; color: ${riskColor}; border: 1px solid ${riskColor}; font-size: 10pt;">
          ${latestAssessment.riskTier.toUpperCase()} RISK
        </span>
      </div>
    </div>
    <div class="score-col-details">
      <div class="meta-row">
        <span class="meta-label">Consultation Urgency:</span>
        <span class="meta-value" style="color: ${riskColor}; font-weight: 700;">
          ${latestAssessment.consultationUrgency.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Physician Review Required:</span>
        <span class="meta-value">${latestAssessment.doctorAlert ? 'YES - CLINICAL WORKUP ADVISED' : 'Routine Monitoring'}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Sub-score Breakdown:</span>
        <span class="meta-value">
          Symptoms: <strong>${latestAssessment.subScores.symptomScore}/45</strong> &bull;
          Solar: <strong>${latestAssessment.subScores.solarDeficitScore}/25</strong> &bull;
          Diet: <strong>${latestAssessment.subScores.dietaryDeficitScore}/20</strong> &bull;
          Multiplier: <strong>${latestAssessment.subScores.medicalMultiplierScore}/10</strong>
        </span>
      </div>
    </div>
  </div>

  <!-- Longitudinal Analytics & Progression Summary -->
  <div class="section-title">Longitudinal Trajectory &amp; Trend Analytics</div>
  <div class="grid-2">
    <div class="grid-col">
      <div class="card">
        <div class="meta-row">
          <span class="meta-label">Total Completed Evaluations:</span>
          <span class="meta-value">${summaryMetrics.totalAssessments} records</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Average Trajectory Score:</span>
          <span class="meta-value">${summaryMetrics.averageScore} / 100</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Score Progression (Delta):</span>
          <span class="meta-value" style="color: ${
            (summaryMetrics.scoreDelta || 0) <= -5 ? '#10B981' : (summaryMetrics.scoreDelta || 0) >= 5 ? '#EF4444' : '#64748B'
          };">
            ${
              summaryMetrics.scoreDelta !== null
                ? `${summaryMetrics.scoreDelta > 0 ? '+' : ''}${summaryMetrics.scoreDelta} pts (${summaryMetrics.trendDirection.toUpperCase()})`
                : 'Initial Baseline'
            }
          </span>
        </div>
      </div>
    </div>
    <div class="grid-col">
      <div class="card">
        <div class="meta-row">
          <span class="meta-label">Score Range:</span>
          <span class="meta-value">Low: ${summaryMetrics.lowestScore ?? '—'} / High: ${summaryMetrics.highestScore ?? '—'}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Stratification Distribution:</span>
          <span class="meta-value">
            Low: ${summaryMetrics.riskDistribution.low} | Mod: ${summaryMetrics.riskDistribution.moderate} | High: ${summaryMetrics.riskDistribution.high}
          </span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Trend Direction Status:</span>
          <span class="meta-value" style="font-weight: 700; text-transform: uppercase;">
            ${summaryMetrics.trendDirection.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Historical Assessments Table -->
  <table class="data-table">
    <thead>
      <tr>
        <th>Record</th>
        <th>Date</th>
        <th>Score</th>
        <th>Tier</th>
        <th>Symptom</th>
        <th>Solar</th>
        <th>Diet</th>
        <th>Mult.</th>
        <th>Doctor Alert</th>
      </tr>
    </thead>
    <tbody>
      ${historyRows}
    </tbody>
  </table>

  <!-- Clinical Explainer & Primary Risk Drivers -->
  <div class="section-title">Clinical Explainer &amp; Primary Risk Factors</div>
  <div class="card">
    <p style="margin: 0 0 6px 0; font-size: 9.5pt; color: #334155;">
      ${latestAssessment.aiExplanation?.summary || 'Multi-factorial analysis indicates score driven by reported lifestyle and symptom indices.'}
    </p>
    <div style="font-size: 9pt; font-weight: 700; color: #0F172A; margin-top: 6px;">Key Contributing Clinical Factors:</div>
    <ul style="margin: 4px 0 0 0; padding-left: 20px; font-size: 8.5pt; color: #475569;">
      ${keyContributorsHtml}
    </ul>
  </div>

  <!-- Attending Physician Guidance -->
  <div class="doctor-callout">
    <strong>RECOMMENDED CLINICIAN CONFIRMATION:</strong>
    Suggested laboratory workup includes total serum 25-hydroxyvitamin D [25(OH)D] chemiluminescence immunoassay (CLIA) or LC-MS/MS. Standard clinical consensus guidelines (Endocrine Society &amp; VGU Clinical Framework) stratify: Deficiency (&lt; 20 ng/mL / &lt; 50 nmol/L), Insufficiency (20&ndash;29 ng/mL / 50&ndash;75 nmol/L), and Sufficiency (&ge; 30 ng/mL / &ge; 75 nmol/L). Consider co-factor status (elemental Magnesium &ge; 350mg/day and Vitamin K2 MK-7 &ge; 100mcg) prior to high-dose ergocalciferol or cholecalciferol therapy.
  </div>

  <!-- Physician Notes Box for Printouts -->
  <div class="physician-notes-box">
    <div class="physician-notes-title">Attending Physician Clinical Notes &amp; Prescription Order</div>
  </div>

  <!-- Mandatory Medical & Research Disclaimer -->
  <div class="disclaimer">
    <strong>DISCLAIMER &amp; ACADEMIC CITATION:</strong> VitaTrack is a patient-facing self-assessment screening and lifestyle educational aid. It does not provide medical diagnoses, clinical prescriptions, or substitute for professional medical advice and laboratory venous blood testing. Always evaluate patient presentation, renal function, calcium metabolism, and serum 25(OH)D before prescribing corrective pharmacological therapies.
    <br>
    <strong>Research Framework:</strong> Supervised by Dr. Hoshiyar Singh, Vivekananda Global University (VGU), Jaipur. Authors: Satyam Kumar &amp; Shilpi Shikha (2026).
  </div>

</body>
</html>
    `;
  }
};
