import CampusHeader from "../CampusHeader";
import InfoCard from "./InfoCard";
import ResourceBrowser from "../resources/ResourceBrowser";

function StudentDashboard({ user, onLogout }) {
  return (
    <main className="auth-shell min-h-screen text-campus-ink">
      <CampusHeader active="Resources" onLogout={onLogout} user={user} />
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-[2rem] bg-white p-7 shadow-panel sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.32em] text-campus-blue">
              Student Workspace
            </p>
            <h1 className="serif-display mt-5 text-5xl font-black leading-tight text-campus-navy">
              Find campus spaces with real availability.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Search lecture halls, labs, meeting rooms, and equipment before planning your next
              class activity or group work.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-campus-navy px-5 py-3 text-sm font-black text-white">
                {user.registrationNumber}
              </span>
              <span className="rounded-full border border-blue-100 bg-[#f8fbff] px-5 py-3 text-sm font-bold text-campus-navy">
                {user.faculty}
              </span>
            </div>
          </div>

          <div className="blue-hero rounded-[2rem] p-6 text-white shadow-panel sm:p-8">
            <h2 className="text-3xl font-black">Resource discovery</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
              Use filters to compare capacity, location, status, and available time windows.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoTile title="Catalogue" value="Rooms and equipment" />
              <InfoTile title="Availability" value="Date and time windows" />
              <InfoTile title="Status" value="Active or out of service" />
              <InfoTile title="Profile" value={user.email} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoCard label="Full name" value={user.fullName} />
          <InfoCard label="Role" value="Student" />
          <InfoCard label="Access" value="Facilities and asset bookings" />
        </div>

        <ResourceBrowser />
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
