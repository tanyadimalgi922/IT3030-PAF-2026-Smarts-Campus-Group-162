function CampusHeader({ active = "Home", onLogout, onNavigate, user }) {
  return (
    <header className="campus-header sticky top-0 z-20 px-5 py-4 text-white sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="campus-logo flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black text-[#07111f]">
            CH
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.36em] text-sky-200">
              Campus Hub
            </p>
            <p className="text-sm font-bold text-white/90">
              {user ? "Dashboard workspace" : "Smart campus resource coordination"}
            </p>
          </div>
        </div>

        <nav className="flex w-full justify-center lg:w-auto">
          <div className="flex rounded-full border border-white/10 bg-white/8 p-1 text-sm font-bold text-white/80">
            {["Home", "About Us", "Resources"].map((item) => (
              <button
                key={item}
                className={`min-h-10 rounded-full px-5 transition ${
                  active === item ? "bg-white text-[#07111f]" : "hover:bg-white/10"
                }`}
                onClick={() => onNavigate?.(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden rounded-full border border-white/20 px-4 py-2 text-sm font-black sm:block">
                {user.fullName}
              </div>
              <button
                className="min-h-11 rounded-full border border-white/20 px-5 text-sm font-black transition hover:bg-white/10"
                onClick={onLogout}
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="min-h-11 rounded-full border border-white/20 px-5 text-sm font-black transition hover:bg-white/10"
                onClick={() => onNavigate?.("Sign in")}
                type="button"
              >
                Sign in
              </button>
              <button
                className="primary-action min-h-11 rounded-full px-5 text-sm font-black text-white"
                onClick={() => onNavigate?.("Get started")}
                type="button"
              >
                Get started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default CampusHeader;
