import InfoCard from "./InfoCard";
import CampusFooter from "../CampusFooter";
import CampusHeader from "../CampusHeader";
import TechnicianIncidentOverview from "../incidents/TechnicianIncidentOverview";
import TechnicianIncidentWorkspacePage from "../incidents/TechnicianIncidentWorkspacePage";

function TechnicianDashboard({ user, onLogout, onNavigate, path }) {
  const handleHeaderNavigate = (item) => {
    if (item === "Home") {
      onNavigate("/");
      return;
    }

    if (item === "Dashboard") {
      onNavigate("/technician/dashboard");
      return;
    }

    if (item === "About Us") {
      onNavigate("/about");
      return;
    }

    if (item === "Resources") {
      onNavigate("/technician/tickets");
      return;
    }

    onNavigate("/technician/dashboard");
  };

  if (path === "/technician/tickets") {
    return <TechnicianIncidentWorkspacePage onLogout={onLogout} onNavigate={onNavigate} user={user} />;
  }

  return (
    <main className="auth-shell flex min-h-screen flex-col text-campus-ink">
      <CampusHeader active="Dashboard" onLogout={onLogout} onNavigate={handleHeaderNavigate} user={user} />
      <section className="mx-auto max-w-7xl flex-1 px-5 py-8 sm:px-8 lg:px-12">
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
      <CampusFooter onNavigate={onNavigate} user={user} />
    </main>
  );
}

export default TechnicianDashboard;
