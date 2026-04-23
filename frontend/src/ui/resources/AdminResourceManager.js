import ResourceBrowser from "./ResourceBrowser";

function AdminResourceManager({ onCreate }) {
  return (
    <section className="mt-8">
      <div className="glass-panel rounded-lg p-5 shadow-glow">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-campus-violet">
              Resource Command Center
            </p>
            <h2 className="mt-1 text-2xl font-black text-campus-ink">
              Manage facilities and assets
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Create bookable halls, labs, meeting rooms, and equipment with images,
              availability windows, status, and searchable metadata.
            </p>
          </div>
          <button
            className="primary-action min-h-12 rounded-md px-6 text-sm font-black text-white transition hover:scale-[1.01]"
            onClick={onCreate}
            type="button"
          >
            Create Resource
          </button>
        </div>
      </div>

      <ResourceBrowser />
    </section>
  );
}

export default AdminResourceManager;
