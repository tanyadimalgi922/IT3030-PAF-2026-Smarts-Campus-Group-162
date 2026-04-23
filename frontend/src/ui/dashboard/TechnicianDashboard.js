import CampusHeader from "../CampusHeader";
import InfoCard from "./InfoCard";

function TechnicianDashboard({ user, onLogout }) {
  return (
    <main className="auth-shell min-h-screen text-campus-ink">
      <CampusHeader active="Home" onLogout={onLogout} user={user} />
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="dark-hero rounded-[2rem] p-7 text-white shadow-panel sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.32em] text-sky-200">
              Technician Operations
            </p>
            <h1 className="mt-5 text-5xl font-black leading-tight">
              Maintenance work, updates, and resolutions.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78">
              Track your service role and prepare for incident handling workflows.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Metric label="Open work" value="0" />
              <Metric label="Today" value="Ready" />
              <Metric label="Status" value="Available" />
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-7 shadow-panel sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.26em] text-campus-blue">
              Technician Profile
            </p>
            <div className="mt-6 grid gap-4">
              <InfoCard label="Full name" value={user.fullName} />
              <InfoCard label="Email" value={user.email} />
              <InfoCard label="Specialization" value={user.specialization} />
              <InfoCard label="Access" value="Maintenance and incident updates" />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-campus-blue">
            Next Module Preview
          </p>
          <h2 className="mt-3 text-3xl font-black text-campus-navy">Incident queue workspace</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            This area is ready for fault reports, technician updates, and resolution records in the
            maintenance module.
          </p>
        </div>
      </section>
    </main>
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

export default TechnicianDashboard;
