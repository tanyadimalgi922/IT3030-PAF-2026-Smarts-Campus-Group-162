import CampusHeader from "../CampusHeader";
import InfoCard from "./InfoCard";
import StudentBookingList from "../bookings/StudentBookingList";
import StudentResourcesPage from "./StudentResourcesPage";
import IncidentTicketsPage from "../incidents/IncidentTicketsPage";

function StudentDashboard({ user, onLogout, onNavigate, path }) {
  const handleHeaderNavigate = (item) => {
    if (item === "Resources") {
      onNavigate("/student/resources");
      return;
    }

    if (item === "Home") {
      onNavigate("/student/dashboard");
      return;
    }

    onNavigate(item);
  };

  if (path === "/student/resources") {
    return (
      <StudentResourcesPage
        onBack={() => onNavigate("/student/dashboard")}
        onLogout={onLogout}
        onNavigate={onNavigate}
        user={user}
      />
    );
  }

  if (path === "/student/bookings") {
    return (
      <main className="auth-shell min-h-screen text-campus-ink">
        <CampusHeader active="Home" onLogout={onLogout} onNavigate={handleHeaderNavigate} user={user} />
        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
          <div className="dark-hero rounded-[2rem] p-7 text-white shadow-panel sm:p-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.32em] text-sky-200">
                  Student Bookings
                </p>
                <h1 className="mt-4 text-4xl font-black sm:text-5xl">
                  View and manage your booking requests.
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-white/80">
                  Track pending, approved, rejected, and cancelled requests in one place.
                </p>
              </div>
              <button
                className="min-h-12 rounded-2xl bg-white px-6 text-sm font-black text-campus-navy"
                onClick={() => onNavigate("/student/dashboard")}
                type="button"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <StudentBookingList onNavigate={onNavigate} user={user} />
        </section>
      </main>
    );
  }

  if (path === "/student/tickets" || path.startsWith("/student/tickets/create/")) {
    const preselectedResourceId = path.startsWith("/student/tickets/create/")
      ? path.replace("/student/tickets/create/", "")
      : "";

    return (
      <main className="auth-shell min-h-screen text-campus-ink">
        <CampusHeader active="Home" onLogout={onLogout} onNavigate={handleHeaderNavigate} user={user} />
        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
          <IncidentTicketsPage
            mode="student"
            onBack={() => onNavigate("/student/dashboard")}
            preselectedResourceId={preselectedResourceId}
            user={user}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell min-h-screen text-campus-ink">
      <CampusHeader active="Home" onLogout={onLogout} onNavigate={handleHeaderNavigate} user={user} />
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-[2rem] bg-white p-7 shadow-panel sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.32em] text-campus-blue">
              Student Workspace
            </p>
            <h1 className="serif-display mt-5 text-5xl font-black leading-tight text-campus-navy">
              Student dashboard
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              View your account details and open the resource catalogue when you need to find
              rooms, labs, meeting spaces, or equipment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-campus-navy px-5 py-3 text-sm font-black text-white">
                {user.registrationNumber}
              </span>
              <span className="rounded-full border border-blue-100 bg-[#f8fbff] px-5 py-3 text-sm font-bold text-campus-navy">
                {user.faculty}
              </span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                className="primary-action min-h-12 rounded-md px-6 text-sm font-black text-white transition hover:scale-[1.01]"
                onClick={() => onNavigate("/student/resources")}
                type="button"
              >
                Resources
              </button>
              <button
                className="min-h-12 rounded-md border border-blue-200 bg-white px-6 text-sm font-black text-campus-navy transition hover:border-campus-blue hover:text-campus-blue"
                onClick={() => onNavigate("/student/bookings")}
                type="button"
              >
                My Bookings
              </button>
              <button
                className="min-h-12 rounded-md border border-blue-200 bg-white px-6 text-sm font-black text-campus-navy transition hover:border-campus-blue hover:text-campus-blue"
                onClick={() => onNavigate("/student/tickets")}
                type="button"
              >
                Incident Tickets
              </button>
            </div>
          </div>

          <div className="blue-hero rounded-[2rem] p-6 text-white shadow-panel sm:p-8">
            <h2 className="text-3xl font-black">My campus profile</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
              Keep your student information visible here while resource browsing stays on its own
              focused page.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoTile title="Student ID" value={user.registrationNumber} />
              <InfoTile title="Faculty" value={user.faculty} />
              <InfoTile title="Email" value={user.email} />
              <InfoTile title="Status" value="Active account" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoCard label="Full name" value={user.fullName} />
          <InfoCard label="Role" value="Student" />
          <InfoCard label="Access" value="Facilities, bookings, and incident reporting" />
        </div>
      </section>
    </main>
  );
}

function InfoTile({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-100">{title}</p>
      <p className="mt-3 text-lg font-black">{value}</p>
    </div>
  );
}

export default StudentDashboard;
