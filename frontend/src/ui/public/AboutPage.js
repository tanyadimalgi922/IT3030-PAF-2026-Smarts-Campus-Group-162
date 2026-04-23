import CampusHeader from "../CampusHeader";

function AboutPage({ onLogout, onNavigate, user }) {
  return (
    <main className="public-shell min-h-screen text-campus-ink">
      <CampusHeader
        active="About Us"
        onLogout={onLogout}
        onNavigate={(item) => handlePageNavigate(item, onNavigate, user)}
        user={user}
      />

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-8 lg:px-12">
        <div className="about-hero rounded-[2rem] p-7 text-white shadow-panel sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.32em] text-amber-200">About Us</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <h1 className="serif-display text-5xl font-black leading-[1.02] sm:text-6xl">
                We design campus systems that feel more human, not more complicated.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/82">
                Smart Campus brings together resource access, service response, and daily coordination
                in one calmer digital experience for everyone on campus.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <AboutStat value="3 Roles" label="Students, technicians, admins" />
              <AboutStat value="1 Flow" label="Bookings, incidents, and support" />
              <AboutStat value="Clear UI" label="Focused screens for real tasks" />
              <AboutStat value="Live Action" label="Track updates without confusion" />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-[2rem] bg-white p-7 shadow-panel sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-campus-blue">Our Story</p>
            <h2 className="mt-4 text-4xl font-black text-campus-navy">Built around the moments that slow campuses down.</h2>
            <p className="mt-5 text-sm leading-8 text-slate-600">
              Booking a room should not feel uncertain. Reporting a maintenance issue should not disappear
              into silence. Managing campus resources should not require scattered tools. This platform was
              shaped around those everyday pain points and redesigned to feel direct, visible, and reliable.
            </p>
            <div className="mt-6 grid gap-4">
              {[
                ["Visible availability", "Users can understand what is available and what is not without extra back-and-forth."],
                ["Stronger accountability", "Incident progress stays visible from the first report to the final closure."],
                ["Better coordination", "Different campus roles move through connected workflows instead of separate silos."],
              ].map(([title, copy]) => (
                <div className="rounded-2xl border border-slate-100 bg-[#fbfdff] p-5" key={title}>
                  <h3 className="text-xl font-black text-campus-navy">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-7 shadow-panel sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-campus-blue">What We Believe</p>
            <div className="mt-5 grid gap-4">
              {[
                ["Clarity before complexity", "Users should understand where to go and what to do next in seconds."],
                ["Progress should be visible", "Bookings and incidents need clear statuses, ownership, and follow-through."],
                ["Campus software should feel welcoming", "Utility does not have to look dull or intimidating."],
              ].map(([title, copy]) => (
                <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5" key={title}>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-campus-blue">Core Principle</p>
                  <h3 className="mt-3 text-2xl font-black text-campus-navy">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{copy}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="public-ribbon mt-8 rounded-[2rem] p-7 text-white shadow-panel sm:p-9">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-200">How We Work</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <MethodCard number="01" title="Observe" copy="We start with the real operational friction people face on campus." />
            <MethodCard number="02" title="Simplify" copy="We turn those pain points into fewer steps and cleaner decisions." />
            <MethodCard number="03" title="Support" copy="We keep students, technicians, and admins connected through one workflow." />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-[2rem] border border-blue-100 bg-white p-7 shadow-panel sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-campus-blue">Who This Helps</p>
            <div className="mt-5 grid gap-4">
              <AudienceCard title="Students" copy="Browse resources, create bookings, report facility issues, and track outcomes." />
              <AudienceCard title="Technicians" copy="Review workloads, update incident status, and keep repair progress transparent." />
              <AudienceCard title="Admins" copy="Manage resources, coordinate ticket flow, and keep campus operations organized." />
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-7 shadow-panel sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-campus-blue">Ready To Explore?</p>
            <h2 className="mt-4 text-4xl font-black text-campus-navy">Step into the platform with the role that fits you.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600">
              Whether you are booking a space, resolving a technical issue, or coordinating the whole campus,
              the experience is designed to stay clear, modern, and task-focused.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="primary-action min-h-12 rounded-full px-6 text-sm font-black text-white"
                onClick={() => onNavigate(user ? getDashboardPath(user.role) : "/login")}
                type="button"
              >
                {user ? "Back to Dashboard" : "Sign In"}
              </button>
              {!user && (
                <>
                  <button
                    className="min-h-12 rounded-full border border-blue-200 bg-white px-6 text-sm font-black text-campus-navy"
                    onClick={() => onNavigate("/register/student")}
                    type="button"
                  >
                    Create Student Account
                  </button>
                  <button
                    className="min-h-12 rounded-full border border-blue-200 bg-white px-6 text-sm font-black text-campus-navy"
                    onClick={() => onNavigate("/register/technician")}
                    type="button"
                  >
                    Create Technician Account
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function handlePageNavigate(item, onNavigate, user) {
  if (item === "Home") onNavigate("/");
  if (item === "Dashboard") onNavigate(getDashboardPath(user?.role));
  if (item === "About Us") onNavigate("/about");
  if (item === "Resources") onNavigate(user ? getDashboardPath(user.role) : "/login");
  if (item === "Sign in") onNavigate("/login");
  if (item === "Get started") onNavigate(user ? getDashboardPath(user.role) : "/register/student");
}

function getDashboardPath(role) {
  if (role === "STUDENT") return "/student/dashboard";
  if (role === "TECHNICIAN") return "/technician/dashboard";
  return "/admin/dashboard";
}

function AboutStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/14 bg-white/10 p-4">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-2 text-sm font-bold text-white/80">{label}</p>
    </div>
  );
}

function MethodCard({ copy, number, title }) {
  return (
    <div className="rounded-2xl border border-white/14 bg-white/10 p-5">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-200">{number}</p>
      <h3 className="mt-3 text-2xl font-black">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/82">{copy}</p>
    </div>
  );
}

function AudienceCard({ copy, title }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-5">
      <h3 className="text-2xl font-black text-campus-navy">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{copy}</p>
    </div>
  );
}

export default AboutPage;
