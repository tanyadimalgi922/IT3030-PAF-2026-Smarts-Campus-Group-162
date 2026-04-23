import { useEffect, useState } from "react";
import { cancelBooking, getBookings } from "../../api/bookingApi";

function StudentBookingList({ refreshKey = 0, user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localRefreshKey, setLocalRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      setLoading(true);
      setError("");

      try {
        const data = await getBookings({ userId: user.id });
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
  }, [user.id, refreshKey, localRefreshKey]);

  const handleCancel = async (booking) => {
    const reason = window.prompt("Cancellation reason", "Cancelled by student.");
    if (!reason) return;

    try {
      await cancelBooking(booking.id, reason, user.fullName);
      setLocalRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="mt-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-campus-violet">
          My Bookings
        </p>
        <h2 className="mt-1 text-2xl font-black text-campus-ink">Track your requests</h2>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {loading ? (
          <div className="rounded-lg border border-blue-100 bg-white p-5 text-sm font-bold text-campus-blue">
            Loading bookings...
          </div>
        ) : bookings.length > 0 ? (
          bookings.map((booking) => (
            <article className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm" key={booking.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-campus-ink">{booking.resourceName}</h3>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    {booking.date} / {booking.startTime} - {booking.endTime}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{booking.purpose}</p>
                  {booking.reviewReason && (
                    <p className="mt-2 text-sm font-semibold text-campus-navy">{booking.reviewReason}</p>
                  )}
                </div>
                <button
                  className="min-h-10 rounded-md border border-amber-200 bg-amber-50 px-4 text-sm font-black text-amber-800 disabled:opacity-50"
                  disabled={booking.status !== "APPROVED"}
                  onClick={() => handleCancel(booking)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-blue-100 bg-white p-5 text-sm font-bold text-slate-600">
            No booking requests yet.
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
      {(status || "").replaceAll("_", " ")}
    </span>
  );
}

export default StudentBookingList;
