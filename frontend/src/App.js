import "./App.css";

function App() {
  return (
    <main className="min-h-screen overflow-hidden bg-sand text-ink">
      <section className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.35),_transparent_34%),linear-gradient(135deg,_#fff7ed_0%,_#ecfeff_48%,_#fef3c7_100%)]" />
        <div className="absolute left-8 top-10 h-32 w-32 rounded-full bg-lagoon/20 blur-2xl" />
        <div className="absolute bottom-8 right-8 h-44 w-44 rounded-full bg-mango/30 blur-3xl" />

        <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white/75 shadow-glow backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden bg-ink p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-14 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                <span className="h-2.5 w-2.5 rounded-full bg-lagoon" />
                Smarts Campus Admin
              </div>
              <h1 className="max-w-md text-5xl font-black leading-tight tracking-tight">
                Manage campus work with calm control.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-white/70">
                A dummy admin login screen ready for your real backend
                connection, dashboard routing, and authentication logic.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {["Students", "Courses", "Reports"].map((item, index) => (
                <div
                  className="rounded-3xl border border-white/10 bg-white/10 p-4"
                  key={item}
                >
                  <p className="text-2xl font-black">{index + 12}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/50">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-9 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-ocean">
                    Admin Login
                  </p>
                  <h2 className="mt-3 text-4xl font-black tracking-tight">
                    Welcome back
                  </h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean text-2xl font-black text-white shadow-lg shadow-teal-700/20">
                  A
                </div>
              </div>

              <form className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Email address
                  </span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold outline-none transition focus:border-lagoon focus:ring-4 focus:ring-teal-100"
                    placeholder="admin@smartscampus.lk"
                    type="email"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Password
                  </span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold outline-none transition focus:border-lagoon focus:ring-4 focus:ring-teal-100"
                    placeholder="Enter password"
                    type="password"
                  />
                </label>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 font-semibold text-slate-600">
                    <input
                      className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"
                      type="checkbox"
                    />
                    Remember me
                  </label>
                  <button
                    className="font-bold text-ocean hover:text-lagoon"
                    type="button"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  className="group w-full rounded-2xl bg-ocean px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-white shadow-xl shadow-teal-800/20 transition hover:-translate-y-0.5 hover:bg-teal-700"
                  type="button"
                >
                  Login Admin
                  <span className="ml-2 inline-block transition group-hover:translate-x-1">
                    -&gt;
                  </span>
                </button>
              </form>

              <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                <strong>Demo only:</strong> this screen is frontend UI only. Add
                API login validation when your backend auth endpoint is ready.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
