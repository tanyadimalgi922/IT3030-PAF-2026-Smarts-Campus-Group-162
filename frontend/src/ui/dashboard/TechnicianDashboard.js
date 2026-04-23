import InfoCard from "./InfoCard";
import CampusHeader from "../CampusHeader";
import TechnicianIncidentOverview from "../incidents/TechnicianIncidentOverview";
import TechnicianIncidentWorkspacePage from "../incidents/TechnicianIncidentWorkspacePage";

function TechnicianDashboard({ user, onLogout, onNavigate, path }) {
  if (path === "/technician/tickets") {
    return <TechnicianIncidentWorkspacePage onLogout={onLogout} onNavigate={onNavigate} user={user} />;
  }

  return (
    <main className="auth-shell min-h-screen text-campus-ink">
      <CampusHeader active="Home" onLogout={onLogout} user={user} />
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <TechnicianIncidentOverview onNavigate={onNavigate} user={user} />

        <div className="mt-6 rounded-[2rem] bg-white p-7 shadow-panel sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.26em] text-campus-blue">
            Technician Profile
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard label="Full name" value={user.fullName} />
            <InfoCard label="Email" value={user.email} />
            <InfoCard label="Specialization" value={user.specialization} />
            <InfoCard label="Access" value="Maintenance and incident updates" />
          </div>
        </div>
      </section>
    </main>
  );
}

export default TechnicianDashboard;
