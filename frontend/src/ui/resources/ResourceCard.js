import { useState } from "react";
import StudentBookingPanel from "../bookings/StudentBookingPanel";

function ResourceCard({ adminMode = false, bookingMode = false, onBooked, onDelete, onEdit, resource, user }) {
  const amenities = resource.amenities || [];
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-glow">
      <div className="aspect-[16/8] bg-campus-cloud">
        {resource.imageDataUrl ? (
          <img
            alt={resource.name}
            className="h-full w-full object-cover"
            src={resource.imageDataUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-bold text-campus-blue">
            No image
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-black leading-tight text-campus-ink">{resource.name}</h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-600">{formatType(resource.type)}</p>
          </div>
          <span
            className={`rounded-md px-2 py-1 text-[11px] font-black ${
              resource.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {formatStatus(resource.status)}
          </span>
        </div>

        <div className="mt-3 grid gap-1.5 text-xs text-slate-700">
          <p>
            <span className="font-bold text-campus-navy">Capacity:</span> {resource.capacity}
          </p>
          <p>
            <span className="font-bold text-campus-navy">Location:</span> {resource.location}
          </p>
          <p>
            <span className="font-bold text-campus-navy">Building:</span>{" "}
            {resource.building || "Not mapped"}
          </p>
          <p>
            <span className="font-bold text-campus-navy">Floor / Room:</span>{" "}
            {[resource.floor, resource.roomNumber].filter(Boolean).join(" / ") || "Not mapped"}
          </p>
        </div>

        <div className="mt-3">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
            Amenities
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {amenities.length > 0 ? (
              amenities.map((amenity) => (
                <span
                  className="rounded-full border border-blue-100 bg-[#f8fbff] px-2.5 py-0.5 text-[11px] font-bold text-campus-blue"
                  key={amenity}
                >
                  {amenity}
                </span>
              ))
            ) : (
              <span className="text-xs font-semibold text-slate-500">No amenities listed</span>
            )}
          </div>
        </div>

        <div className="mt-3 rounded-md bg-campus-pale p-2.5">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
            Availability
          </p>
          <div className="mt-1.5 grid gap-1 text-xs font-semibold leading-5 text-campus-navy">
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

        {adminMode && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              className="min-h-10 rounded-md bg-campus-navy px-3 text-xs font-black text-white transition hover:bg-campus-blue"
              onClick={onEdit}
              type="button"
            >
              Update
            </button>
            <button
              className="min-h-10 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-black text-red-700 transition hover:bg-red-100"
              onClick={onDelete}
              type="button"
            >
              Delete
            </button>
          </div>
        )}

        {bookingMode && resource.status === "ACTIVE" && (
          <>
            <button
              className="primary-action mt-3 min-h-10 w-full rounded-md px-3 text-xs font-black text-white transition hover:scale-[1.01]"
              onClick={() => setBookingOpen((current) => !current)}
              type="button"
            >
              {bookingOpen ? "Hide Booking" : "Book Now"}
            </button>
            {bookingOpen && (
              <StudentBookingPanel
                onBooked={() => {
                  onBooked?.();
                  setBookingOpen(false);
                }}
                resource={resource}
                user={user}
              />
            )}
          </>
        )}
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
