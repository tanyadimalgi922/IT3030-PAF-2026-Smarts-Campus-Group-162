import { useEffect, useMemo, useState } from "react";
import { getIncidentTickets } from "../../api/incidentApi";

function TechnicianIncidentOverview({ onNavigate, user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTickets() {
      setLoading(true);
      setError("");

      try {
        const data = await getIncidentTickets({ assignedTechnicianId: user.id });
        if (active) {
          setTickets(data || []);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTickets();
    return () => {
      active = false;
    };
  }, [user.id]);

  const analysis = useMemo(() => buildIncidentAnalysis(tickets), [tickets]);

  return (
    <>
      <div className="dark-hero rounded-[2rem] p-7 text-white shadow-panel sm:p-10">
        <p className="text-sm font-black uppercase tracking-[0.32em] text-sky-200">
          Technician Operations
        </p>
        <h1 className="mt-5 text-5xl font-black leading-tight">
          Maintenance work, updates, and resolutions.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78">
          Review your assigned incidents, spot urgent work quickly, and move tickets toward resolution.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Metric label="Assigned" value={loading ? "..." : String(analysis.total)} />
          <Metric label="Active now" value={loading ? "..." : String(analysis.active)} />
          <Metric label="Resolved" value={loading ? "..." : String(analysis.resolved)} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] bg-white p-7 shadow-panel sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-campus-blue">
            Report Analysis
          </p>
          <h2 className="mt-3 text-3xl font-black text-campus-navy">Incident workload snapshot</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            This view summarizes the assigned incident queue so technicians can see workload pressure and response progress at a glance.
          </p>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              {error}
            </div>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AnalysisCard label="Open Queue" tone="amber" value={loading ? "..." : analysis.open} />
            <AnalysisCard label="In Progress" tone="sky" value={loading ? "..." : analysis.inProgress} />
            <AnalysisCard label="Critical" tone="red" value={loading ? "..." : analysis.critical} />
            <AnalysisCard label="Closed" tone="slate" value={loading ? "..." : analysis.closed} />
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-3">
            <InsightCard
              detail={loading ? "Loading current ticket distribution." : analysis.loadMessage}
              title="Current Load"
            />
            <InsightCard
              detail={loading ? "Preparing progress summary." : analysis.progressMessage}
              title="Progress Trend"
            />
            <InsightCard
              detail={loading ? "Preparing next action." : analysis.priorityMessage}
              title="Next Priority"
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-blue-100 bg-white p-7 shadow-panel sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-campus-blue">
            Assigned Work
          </p>
          <h2 className="mt-3 text-3xl font-black text-campus-navy">Incident queue workspace</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Open assigned tickets, add progress notes, update status, and keep comments clear for admin follow-up.
          </p>

          <div className="mt-5 grid gap-3">
            {loading ? (
              <div className="rounded-2xl border border-blue-100 bg-[#f8fbff] p-4 text-sm font-semibold text-campus-blue">
                Loading assigned incidents...
              </div>
            ) : tickets.length > 0 ? (
              tickets.slice(0, 3).map((ticket) => (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4" key={ticket.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${statusTone(ticket.status)}`}>
                      {formatLabel(ticket.status)}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${priorityTone(ticket.priority)}`}>
                      {formatLabel(ticket.priority)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-campus-navy">{ticket.resourceName}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{ticket.category}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">{ticket.resourceLocation}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                No assigned incident tickets yet.
              </div>
            )}
          </div>

          <button
            className="primary-action mt-6 min-h-12 rounded-2xl px-6 text-sm font-black text-white"
            onClick={() => onNavigate("/technician/tickets")}
            type="button"
          >
            View Assigned Tickets
          </button>
        </section>
      </div>
    </>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/62">{label}</p>
      <p className="mt-3 text-2xl font-black">{value}</p>
    </div>
  );
}

function AnalysisCard({ label, tone, value }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${analysisTone(tone)}`}>
      <p className="text-xs font-black uppercase tracking-[0.14em]">{label}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </div>
  );
}

function InsightCard({ detail, title }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-campus-blue">{title}</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">{detail}</p>
    </div>
  );
}

function buildIncidentAnalysis(tickets) {
  const summary = tickets.reduce((result, ticket) => {
    result.total += 1;
    if (ticket.status === "OPEN") result.open += 1;
    if (ticket.status === "IN_PROGRESS") result.inProgress += 1;
    if (ticket.status === "RESOLVED") result.resolved += 1;
    if (ticket.status === "CLOSED") result.closed += 1;
    if (ticket.priority === "CRITICAL") result.critical += 1;
    return result;
  }, {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    critical: 0,
  });

  const active = summary.open + summary.inProgress;
  const loadMessage = summary.total === 0
    ? "No incidents are assigned right now."
    : active > 3
      ? `${active} tickets need active attention right now.`
      : `${active} tickets are currently active and manageable.`;
  const progressMessage = summary.resolved + summary.closed > 0
    ? `${summary.resolved + summary.closed} tickets are already moved toward completion.`
    : "No completed ticket movement yet in the current queue.";
  const priorityMessage = summary.critical > 0
    ? `${summary.critical} critical incident${summary.critical > 1 ? "s need" : " needs"} immediate attention.`
    : summary.open > 0
      ? "Open tickets should be reviewed and moved into progress."
      : "Keep resolved work documented clearly for closure.";

  return {
    ...summary,
    active,
    loadMessage,
    progressMessage,
    priorityMessage,
  };
}

function analysisTone(tone) {
  if (tone === "amber") return "border-amber-100 bg-amber-50 text-amber-800";
  if (tone === "sky") return "border-sky-100 bg-sky-50 text-sky-800";
  if (tone === "red") return "border-red-100 bg-red-50 text-red-800";
  return "border-slate-200 bg-slate-50 text-slate-800";
}

function formatLabel(value) {
  return (value || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusTone(status) {
  if (status === "OPEN") return "bg-amber-50 text-amber-700";
  if (status === "IN_PROGRESS") return "bg-sky-50 text-sky-700";
  if (status === "RESOLVED") return "bg-emerald-50 text-emerald-700";
  if (status === "CLOSED") return "bg-slate-100 text-slate-700";
  return "bg-rose-50 text-rose-700";
}

function priorityTone(priority) {
  if (priority === "CRITICAL") return "bg-red-50 text-red-700";
  if (priority === "HIGH") return "bg-orange-50 text-orange-700";
  if (priority === "MEDIUM") return "bg-blue-50 text-blue-700";
  return "bg-emerald-50 text-emerald-700";
}

export default TechnicianIncidentOverview;
