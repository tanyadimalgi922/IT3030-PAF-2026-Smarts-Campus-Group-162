import { useEffect, useState } from "react";
import { approveBooking, cancelBooking, getBookings, rejectBooking } from "../../api/bookingApi";

const statuses = ["", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

function AdminBookingManager({ user }) {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      setLoading(true);
      setError("");

      try {
        const data = await getBookings({ status, date });
        if (active) {
          setBookings(data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBookings();
    return () => {
      active = false;
    };
  }, [status, date, refreshKey]);

  const review = async (booking, action) => {
    const fallbackReason = action === "approve" ? "Approved for campus use." : "Request cannot be accommodated.";
    const reason = window.prompt("Review reason", fallbackReason);
    if (!reason) return;

    try {
      if (action === "approve") {
        await approveBooking(booking.id, reason, user.fullName);
      } else if (action === "reject") {
        await rejectBooking(booking.id, reason, user.fullName);
      } else {
        await cancelBooking(booking.id, reason, user.fullName);
      }
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-campus-violet">
            Booking Management
          </p>
          <h2 className="mt-1 text-2xl font-black text-campus-ink">Review booking requests</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <select className="field-input" onChange={(event) => setStatus(event.target.value)} value={status}>
            {statuses.map((item) => (
              <option key={item || "all"} value={item}>
                {item ? formatStatus(item) : "All statuses"}
              </option>
            ))}
          </select>
          <input className="field-input" onChange={(event) => setDate(event.target.value)} type="date" value={date} />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      )}

      <div className="mt-5 grid gap-4">
        {loading ? (
          <div className="rounded-lg border border-blue-100 bg-white p-5 text-sm font-bold text-campus-blue">
            Loading bookings...
          </div>
        ) : bookings.length > 0 ? (
          bookings.map((booking) => (
            <article className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm" key={booking.id}>
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-campus-ink">{booking.resourceName}</h3>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    {booking.date} / {booking.startTime} - {booking.endTime}
                  </p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <p>
                      <span className="font-bold text-campus-navy">Student:</span> {booking.userName}
                    </p>
                    <p>
                      <span className="font-bold text-campus-navy">Email:</span> {booking.userEmail}
                    </p>
                    <p>
                      <span className="font-bold text-campus-navy">Attendees:</span> {booking.expectedAttendees}
                    </p>
                    <p>
                      <span className="font-bold text-campus-navy">Purpose:</span> {booking.purpose}
                    </p>
                  </div>
                  {booking.reviewReason && (
                    <p className="mt-3 rounded-md bg-campus-pale p-3 text-sm font-semibold text-campus-navy">
                      {booking.reviewReason}
                    </p>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-3 lg:min-w-80">
                  <button
                    className="min-h-11 rounded-md bg-emerald-600 px-4 text-sm font-black text-white disabled:opacity-50"
                    disabled={booking.status !== "PENDING"}
                    onClick={() => review(booking, "approve")}
                    type="button"
                  >
                    Approve
                  </button>
                  <button
                    className="min-h-11 rounded-md bg-red-600 px-4 text-sm font-black text-white disabled:opacity-50"
                    disabled={booking.status !== "PENDING"}
                    onClick={() => review(booking, "reject")}
                    type="button"
                  >
                    Reject
                  </button>
                  <button
                    className="min-h-11 rounded-md border border-amber-200 bg-amber-50 px-4 text-sm font-black text-amber-800 disabled:opacity-50"
                    disabled={booking.status !== "APPROVED"}
                    onClick={() => review(booking, "cancel")}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-blue-100 bg-white p-5 text-sm font-bold text-slate-600">
            No bookings found.
          </div>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700",
    APPROVED: "bg-emerald-50 text-emerald-700",
    REJECTED: "bg-red-50 text-red-700",
    CANCELLED: "bg-slate-100 text-slate-700",
  };

  return (
    <span className={`rounded-md px-2 py-1 text-xs font-black ${styles[status] || styles.CANCELLED}`}>
      {formatStatus(status)}
    </span>
  );
}

function formatStatus(status) {
  return (status || "").replaceAll("_", " ");
}

export default AdminBookingManager;
