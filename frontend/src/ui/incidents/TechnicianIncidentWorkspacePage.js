import CampusHeader from "../CampusHeader";
import IncidentTicketsPage from "./IncidentTicketsPage";

function TechnicianIncidentWorkspacePage({ onLogout, onNavigate, user }) {
  const handleHeaderNavigate = (item) => {
    if (item === "Dashboard" || item === "Home") {
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

  return (
    <main className="auth-shell min-h-screen text-campus-ink">
      <CampusHeader active="Dashboard" onLogout={onLogout} onNavigate={handleHeaderNavigate} user={user} />
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <IncidentTicketsPage mode="technician" onBack={() => onNavigate("/technician/dashboard")} user={user} />
      </section>
    </main>
  );
}

export default TechnicianIncidentWorkspacePage;
