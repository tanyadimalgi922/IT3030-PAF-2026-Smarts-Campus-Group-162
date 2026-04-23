import CampusHeader from "../CampusHeader";
import InfoCard from "./InfoCard";
import ResourceTypeChart from "./ResourceTypeChart";
import AdminResourceManager from "../resources/AdminResourceManager";
import ResourceCreatePage from "../resources/ResourceCreatePage";
import AdminBookingManager from "../bookings/AdminBookingManager";

function AdminDashboard({ user, onLogout, onNavigate, path }) {
  const editMatch = path.match(/^\/admin\/resources\/edit\/(.+)$/);

  if (path === "/admin/resources/create" || editMatch) {
    return (
      <ResourceCreatePage
        onBack={() => onNavigate("/admin/dashboard")}
        onLogout={onLogout}
        resourceId={editMatch?.[1]}
        user={user}
      />
    );
  }

  if (path === "/admin/bookings") {
    return (
      <main className="auth-shell min-h-screen text-campus-ink">
        <CampusHeader active="Home" onLogout={onLogout} user={user} />
        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
          <div className="dark-hero rounded-[2rem] p-6 text-white shadow-panel sm:p-9">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.32em] text-sky-200">
                  Admin Bookings
                </p>
                <h1 className="mt-4 text-4xl font-black sm:text-5xl">
                  Review booking requests in one focused page.
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-white/82">
                  Approve, reject, and cancel requests here without crowding the main admin dashboard.
                </p>
              </div>
              <button
                className="min-h-12 rounded-2xl bg-white px-6 text-sm font-black text-campus-navy"
                onClick={() => onNavigate("/admin/dashboard")}
                type="button"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <AdminBookingManager user={user} />
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell min-h-screen text-campus-ink">
      <CampusHeader active="Home" onLogout={onLogout} user={user} />
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <div className="dark-hero rounded-[2rem] p-6 text-white shadow-panel sm:p-9">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.32em] text-sky-200">
                Admin
              </p>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">Admin dashboard</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-white/82">
                A cleaner control center for accounts, resources, bookings, and campus service
                visibility.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#07111f]">
                  ADMIN
                </span>
                <span className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white/85">
                  {user.email}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="min-h-12 rounded-2xl bg-white px-6 text-sm font-black text-campus-navy" type="button">
                Refresh
              </button>
              <button
                className="min-h-12 rounded-2xl border border-white/20 px-6 text-sm font-black text-white"
                onClick={onLogout}
                type="button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="blue-hero mt-6 rounded-[2rem] p-6 text-white shadow-panel sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-white/25 px-5 py-2 text-xs font-black uppercase tracking-[0.24em] text-white">
                Admin Control Center
              </p>
              <h2 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                Manage resources without crowding one screen.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/82">
                Each admin task opens into its own focused page so resource creation, bookings,
                and operations stay easy to manage.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Resources", () => onNavigate("/admin/resources/create")],
                ["Bookings", () => onNavigate("/admin/bookings")],
                ["Reports", null],
                ["Support", null],
              ].map(([label, action]) => (
                <button
                  key={label}
                  className={`min-h-20 rounded-2xl border border-white/20 px-4 text-sm font-black transition ${
                    ["Resources", "Bookings"].includes(label) ? "bg-white text-campus-navy" : "bg-white/8 text-white hover:bg-white/14"
                  }`}
                  onClick={action || undefined}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoCard label="Admin name" value={user.fullName} />
          <InfoCard label="System area" value={user.specialization} />
          <InfoCard label="Workspace" value="Resources, bookings, and incidents" />
        </div>

        <ResourceTypeChart />
        <AdminResourceManager
          onCreate={() => onNavigate("/admin/resources/create")}
          onEdit={(resourceId) => onNavigate(`/admin/resources/edit/${resourceId}`)}
        />
      </section>
    </main>
  );
}

export default AdminDashboard;
