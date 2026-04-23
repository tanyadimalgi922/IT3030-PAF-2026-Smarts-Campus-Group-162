function CampusFooter({ onNavigate, user }) {
  const year = new Date().getFullYear();

  return (
    <footer className="campus-footer mt-10 px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.34em] text-sky-200">
            Campus Hub
          </p>
          <h2 className="mt-3 text-2xl font-black sm:text-3xl">
            Smart campus spaces, bookings, and support in one place.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
            Browse resources, manage requests, and follow incident progress through one connected campus workflow.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-100">Quick Links</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <FooterButton label="Home" onClick={() => onNavigate?.("/")} />
              <FooterButton label="About Us" onClick={() => onNavigate?.("/about")} />
              <FooterButton
                label={user ? "Dashboard" : "Sign In"}
                onClick={() => onNavigate?.(user ? getDashboardPath(user.role) : "/login")}
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-100">Platform</p>
            <p className="mt-4 text-sm leading-7 text-white/78">
              Built for students, technicians, and admins who need a clearer way to coordinate campus operations.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-5 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Campus Hub. Smart campus management.</p>
        <p>Designed for resources, bookings, and incident tracking.</p>
      </div>
    </footer>
  );
}

function FooterButton({ label, onClick }) {
  return (
    <button
      className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm font-black text-white transition hover:bg-white/14"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function getDashboardPath(role) {
  if (role === "STUDENT") return "/student/dashboard";
  if (role === "TECHNICIAN") return "/technician/dashboard";
  return "/admin/dashboard";
}

export default CampusFooter;
