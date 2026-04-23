import CampusHeader from "../CampusHeader";
import CampusFooter from "../CampusFooter";
import IncidentTicketsPage from "./IncidentTicketsPage";

function TechnicianIncidentWorkspacePage({ onLogout, onNavigate, user }) {
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

  return (
    <main className="auth-shell flex min-h-screen flex-col text-campus-ink">
      <CampusHeader active="Dashboard" onLogout={onLogout} onNavigate={handleHeaderNavigate} user={user} />
      <section className="mx-auto max-w-7xl flex-1 px-5 py-8 sm:px-8 lg:px-12">
        <IncidentTicketsPage mode="technician" onBack={() => onNavigate("/technician/dashboard")} user={user} />
      </section>
      <CampusFooter onNavigate={onNavigate} user={user} />
    </main>
  );
}

export default TechnicianIncidentWorkspacePage;
