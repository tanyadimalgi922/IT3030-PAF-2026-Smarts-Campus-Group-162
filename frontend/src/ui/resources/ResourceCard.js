function ResourceCard({ resource }) {
  return (
    <article className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-glow">
      <div className="aspect-[16/9] bg-campus-cloud">
        {resource.imageDataUrl ? (
          <img
            alt={resource.name}
            className="h-full w-full object-cover"
            src={resource.imageDataUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-bold text-campus-blue">
            No image
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-campus-ink">{resource.name}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-600">{formatType(resource.type)}</p>
          </div>
          <span
            className={`rounded-md px-2 py-1 text-xs font-black ${
              resource.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {formatStatus(resource.status)}
          </span>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-slate-700">
          <p>
            <span className="font-bold text-campus-navy">Capacity:</span> {resource.capacity}
          </p>
          <p>
            <span className="font-bold text-campus-navy">Location:</span> {resource.location}
          </p>
        </div>

        <div className="mt-4 rounded-md bg-campus-pale p-3">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
            Availability
          </p>
          <div className="mt-2 grid gap-1 text-sm font-semibold text-campus-navy">
            {(resource.availabilityWindows || []).length > 0 ? (
              resource.availabilityWindows.map((window, index) => (
                <p key={`${window.date}-${window.startTime}-${index}`}>
                  {formatWindow(window)}
                </p>
              ))
            ) : (
              <p>Not provided</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function formatType(type) {
  return (type || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatStatus(status) {
  return (status || "").replaceAll("_", " ");
}

function formatWindow(window) {
  const startDate = window.startDate || window.date || "Start date";
  const endDate = window.endDate || window.date || "End date";
  return `${startDate} to ${endDate} / ${window.startTime} - ${window.endTime}`;
}

export default ResourceCard;
