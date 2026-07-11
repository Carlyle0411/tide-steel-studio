import { useMemo } from "react";
import { AlertTriangle, CalendarClock, CircleDollarSign, ClipboardList, Gauge, UsersRound } from "lucide-react";
import { producerManagementAgent } from "../../../mcp/producerAgent/ProducerAgent";
import { ProductionCard, StatusPill } from "./ProductionShell";

export function ProducerDashboardView() {
  const report = useMemo(() => producerManagementAgent.analyzeEpisode("EP01"), []);
  return (
    <div className="space-y-5">
      <ProductionCard className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Producer Dashboard</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">EP01 Production Management</h2>
            <p className="mt-2 text-sm text-slate-400">Virtual producer report. It recommends actions but does not modify assets, timeline, or review gates.</p>
          </div>
          <StatusPill status={report.decision.priority} />
        </div>
      </ProductionCard>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <ProducerStat icon={<Gauge size={18} />} label="Project Health" value={`${report.productionHealth}%`} />
        <ProducerStat icon={<CircleDollarSign size={18} />} label="Budget" value={`$${report.budget.actualCost}/$${report.budget.budgetCap}`} />
        <ProducerStat icon={<AlertTriangle size={18} />} label="Risk" value={report.risk.riskLevel} />
        <ProducerStat icon={<ClipboardList size={18} />} label="Quality" value={`${report.quality.qualityScore}/100`} />
        <ProducerStat icon={<CalendarClock size={18} />} label="Deadline Gate" value="Reference Lock" />
      </section>

      <ProductionCard className="p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Next Action</div>
        <p className="mt-3 text-lg text-white">{report.nextAction}</p>
        <p className="mt-2 text-sm text-slate-400">{report.decision.deadline}</p>
      </ProductionCard>

      <section className="grid gap-4 xl:grid-cols-2">
        <ProductionCard className="overflow-hidden">
          <div className="border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Production Progress</h3>
          </div>
          <div className="divide-y divide-white/10">
            {report.progress.timeline.map((stage) => (
              <div key={stage.stage} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{stage.stage}</span>
                  <StatusPill status={stage.status} />
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-jade" style={{ width: `${stage.progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{stage.note}</p>
              </div>
            ))}
          </div>
        </ProductionCard>

        <ProductionCard className="overflow-hidden">
          <div className="border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Budget Report</h3>
          </div>
          <div className="divide-y divide-white/10">
            {report.budget.lines.map((line) => (
              <div key={line.category} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <div className="text-sm text-white">{line.category}</div>
                  <p className="mt-1 text-xs text-slate-500">{line.note}</p>
                </div>
                <div className="text-right text-sm">
                  <div className="text-jade">${line.estimatedCost}</div>
                  <div className="text-xs text-slate-500">actual ${line.actualCost}</div>
                </div>
              </div>
            ))}
          </div>
        </ProductionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ReportList title="Risk Report" rows={report.risk.risks.map((risk) => ({ id: risk.type, status: risk.severity, body: `${risk.description} Mitigation: ${risk.mitigation}` }))} />
        <ReportList title="Missing Asset Report" rows={report.resources.missingAssets.map((asset) => ({ id: asset.assetId, status: asset.priority, body: asset.reason }))} />
      </section>

      <ProductionCard className="overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <UsersRound size={17} className="text-jade" />
            <h3 className="text-sm font-semibold text-white">Agent Meeting Report</h3>
          </div>
        </div>
        <div className="divide-y divide-white/10">
          {report.meeting.items.map((item) => (
            <div key={`${item.role}-${item.meetingTopic}`} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-white">{item.role}: {item.meetingTopic}</div>
                <StatusPill status="decision" />
              </div>
              <p className="mt-2 text-sm text-slate-300">{item.decision}</p>
              <p className="mt-1 text-xs text-slate-500">{item.reason}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.actionItems.map((action) => <span key={action} className="chip">{action}</span>)}
              </div>
            </div>
          ))}
        </div>
      </ProductionCard>
    </div>
  );
}

function ProducerStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <ProductionCard className="p-4">
      <div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-xs uppercase tracking-wide">{label}</span></div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
    </ProductionCard>
  );
}

function ReportList({ title, rows }: { title: string; rows: Array<{ id: string; status: string; body: string }> }) {
  return (
    <ProductionCard className="overflow-hidden">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="divide-y divide-white/10">
        {rows.map((row) => (
          <div key={row.id} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-jade">{row.id}</span>
              <StatusPill status={row.status} />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">{row.body}</p>
          </div>
        ))}
      </div>
    </ProductionCard>
  );
}
