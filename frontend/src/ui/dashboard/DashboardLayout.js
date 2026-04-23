function DashboardLayout({ children, eyebrow, title, onLogout }) {
  return (
    <main className="auth-shell min-h-screen px-5 py-8 text-campus-ink sm:px-8 lg:px-12">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="w-full rounded-lg bg-white p-6 shadow-panel sm:p-8">
          <div className="flex flex-col gap-4 border-b border-blue-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-campus-blue">
                {eyebrow}
              </p>
              <h1 className="mt-2 text-3xl font-black text-campus-ink sm:text-4xl">
                {title}
              </h1>
            </div>
            <button
              className="min-h-11 rounded-md border border-blue-200 px-5 text-sm font-bold text-campus-blue transition hover:bg-campus-cloud"
              onClick={onLogout}
              type="button"
            >
              Logout
            </button>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}

export default DashboardLayout;
