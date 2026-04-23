import { useEffect, useMemo, useState } from "react";
import { createBooking, getBookingSlots } from "../../api/bookingApi";

function StudentBookingPanel({ onBooked, resource, user }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [expectedAttendees, setExpectedAttendees] = useState("1");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSlots() {
      if (!date || !resource?.id) return;

      setLoading(true);
      setError("");
      setMessage("");

      try {
        const data = await getBookingSlots(resource.id, date);
        if (active) {
          setSlots(data);
          const firstAvailable = data.find((slot) => slot.state === "AVAILABLE");
          setStartTime(firstAvailable?.startTime || "");
          setEndTime(firstAvailable?.endTime || "");
        }
      } catch (requestError) {
        if (active) {
          setSlots([]);
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSlots();
    return () => {
      active = false;
    };
  }, [date, resource?.id]);

  const availableStartTimes = useMemo(
    () => slots.filter((slot) => slot.state === "AVAILABLE").map((slot) => slot.startTime),
    [slots]
  );

  const availableEndTimes = useMemo(
    () => slots.filter((slot) => slot.state === "AVAILABLE").map((slot) => slot.endTime),
    [slots]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await createBooking({
        resourceId: resource.id,
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        date,
        startTime,
        endTime,
        purpose,
        expectedAttendees: Number(expectedAttendees || 1),
      });
      setMessage("Booking request sent for admin approval.");
      setPurpose("");
      onBooked?.();
      const data = await getBookingSlots(resource.id, date);
      setSlots(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mt-4 rounded-lg border border-blue-100 bg-[#f8fbff] p-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-campus-violet">
            Book this resource
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">Select a date to see left, pending, and booked slots.</p>
        </div>
        <input
          className="field-input sm:max-w-44"
          min={new Date().toISOString().slice(0, 10)}
          onChange={(event) => setDate(event.target.value)}
          type="date"
          value={date}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {loading ? (
          <SlotPill label="Loading" state="LOADING" />
        ) : slots.length > 0 ? (
          slots.map((slot) => (
            <SlotPill
              key={`${slot.startTime}-${slot.endTime}`}
              label={`${slot.startTime}-${slot.endTime}`}
              state={slot.state}
            />
          ))
        ) : (
          <div className="col-span-full rounded-md border border-slate-200 bg-white p-3 text-sm font-bold text-slate-500">
            No slots for this date.
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <select className="field-input" onChange={(event) => setStartTime(event.target.value)} required value={startTime}>
          <option value="">Start time</option>
          {availableStartTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        <select className="field-input" onChange={(event) => setEndTime(event.target.value)} required value={endTime}>
          <option value="">End time</option>
          {availableEndTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        <input
          className="field-input"
          min="1"
          max={resource.capacity}
          onChange={(event) => setExpectedAttendees(event.target.value)}
          placeholder="Expected attendees"
          required
          type="number"
          value={expectedAttendees}
        />
        <input
          className="field-input"
          onChange={(event) => setPurpose(event.target.value)}
          placeholder="Purpose"
          required
          value={purpose}
        />
      </div>

      {error && <p className="mt-3 text-sm font-bold text-red-700">{error}</p>}
      {message && <p className="mt-3 text-sm font-bold text-emerald-700">{message}</p>}

      <button
        className="primary-action mt-4 min-h-11 w-full rounded-md px-4 text-sm font-black text-white disabled:opacity-60"
        disabled={submitting || loading || !slots.some((slot) => slot.state === "AVAILABLE")}
        type="submit"
      >
        {submitting ? "Requesting..." : "Request Booking"}
      </button>
    </form>
  );
}

function SlotPill({ label, state }) {
  const styles = {
    AVAILABLE: "border-emerald-200 bg-emerald-50 text-emerald-700",
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    BOOKED: "border-red-200 bg-red-50 text-red-700",
    LOADING: "border-blue-100 bg-white text-campus-blue",
  };

  const text = state === "AVAILABLE" ? "Left" : state === "LOADING" ? "Loading" : titleCase(state);

  return (
    <div className={`rounded-md border px-3 py-2 text-xs font-black ${styles[state] || styles.LOADING}`}>
      <span>{label}</span>
      <span className="ml-2 uppercase">{text}</span>
    </div>
  );
}

function titleCase(value) {
  return (value || "").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default StudentBookingPanel;
