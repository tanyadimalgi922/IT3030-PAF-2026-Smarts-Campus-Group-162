import CampusHeader from "../CampusHeader";
import CampusMapView from "../resources/CampusMapView";
import ResourceBrowser from "../resources/ResourceBrowser";

function StudentResourcesPage({ onBack, onLogout, onNavigate, user }) {
  const handleHeaderNavigate = (item) => {
    if (item === "Home") {
      onBack();
      return;
    }

    if (item === "Resources") {
      return;
    }

    onNavigate?.(item);
  };

  return (
    <main className="auth-shell min-h-screen text-campus-ink">
      <CampusHeader active="Resources" onLogout={onLogout} onNavigate={handleHeaderNavigate} user={user} />
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <div className="dark-hero rounded-[2rem] p-7 text-white shadow-panel sm:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.32em] text-sky-200">
                Student Resources
              </p>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">
                Browse campus rooms and equipment.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/80">
                Use the map, filters, amenities, capacity, and availability windows to find the
                right place before making a booking request.
              </p>
            </div>
            <button
              className="min-h-12 rounded-2xl bg-white px-6 text-sm font-black text-campus-navy"
              onClick={onBack}
              type="button"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <CampusMapView />
        <ResourceBrowser bookingMode onReportIncident={(resourceId) => onNavigate?.(`/student/tickets/create/${resourceId}`)} user={user} />
      </section>
    </main>
  );
}

export default StudentResourcesPage;
