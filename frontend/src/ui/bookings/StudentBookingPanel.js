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
          const firstAvailable = data.find((slot) => slot.availableForRequest);
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

  const availableSlots = useMemo(
    () => slots.filter((slot) => slot.availableForRequest),
    [slots]
  );

  const selectedSlotValue = startTime && endTime ? `${startTime}|${endTime}` : "";

  const handleSlotSelect = (value) => {
    const [selectedStartTime, selectedEndTime] = value.split("|");
    setStartTime(selectedStartTime || "");
    setEndTime(selectedEndTime || "");
  };

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
      const data = await getBookingSlots(resource.id, date);
      setSlots(data);
      const firstAvailable = data.find((slot) => slot.availableForRequest);
      setStartTime(firstAvailable?.startTime || "");
      setEndTime(firstAvailable?.endTime || "");
      onBooked?.();
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
            Booking Slots
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            {formatDateLabel(date)}
          </p>
        </div>
        <input
          className="field-input sm:max-w-44"
          min={new Date().toISOString().slice(0, 10)}
          onChange={(event) => setDate(event.target.value)}
          type="date"
          value={date}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="rounded-xl border border-blue-100 bg-white p-4 text-sm font-bold text-campus-blue">
            Loading slots...
          </div>
        ) : slots.length > 0 ? (
          slots.map((slot) => (
            <SlotCard
              key={`${slot.startTime}-${slot.endTime}`}
              selected={selectedSlotValue === `${slot.startTime}|${slot.endTime}`}
              slot={slot}
              onClick={() => {
                if (slot.availableForRequest) {
                  handleSlotSelect(`${slot.startTime}|${slot.endTime}`);
                }
              }}
            />
          ))
        ) : (
          <div className="col-span-full rounded-md border border-slate-200 bg-white p-3 text-sm font-bold text-slate-500">
            No slots for this date.
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <select className="field-input" onChange={(event) => handleSlotSelect(event.target.value)} required value={selectedSlotValue}>
          <option value="">Select available slot</option>
          {availableSlots.map((slot) => (
            <option key={`${slot.startTime}-${slot.endTime}`} value={`${slot.startTime}|${slot.endTime}`}>
              {slot.startTime} - {slot.endTime}
            </option>
          ))}
        </select>
        <input className="field-input" readOnly value={endTime ? `${startTime} - ${endTime}` : "No slot selected"} />
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
        disabled={submitting || loading || !slots.some((slot) => slot.availableForRequest)}
        type="submit"
      >
        {submitting ? "Requesting..." : "Request Booking"}
      </button>
    </form>
  );
}

function SlotCard({ onClick, selected, slot }) {
  const interactive = slot.availableForRequest;
  return (
    <button
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? "border-campus-blue bg-white shadow-[0_0_0_2px_rgba(31,130,255,0.12)]"
          : "border-slate-200 bg-white"
      } ${interactive ? "hover:border-campus-blue" : "opacity-80"}`}
      disabled={!interactive}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-black text-campus-navy">
            {slot.startTime} - {slot.endTime}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Booking window for {formatShortDate(slot.date)}
          </p>
        </div>
        <p
          className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${
            interactive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {interactive ? "Open" : "Full"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs sm:text-sm">
        <Metric label="Left" tone="left" value={slot.leftCount} />
        <Metric label="Pending" tone="pending" value={slot.pendingCount} />
        <Metric label="Booked" tone="booked" value={slot.bookedCount} />
      </div>

      <p className={`mt-4 text-sm font-bold ${interactive ? "text-emerald-700" : "text-red-700"}`}>
        {interactive ? "Available for request" : "Slot capacity full"}
      </p>
    </button>
  );
}

function Metric({ label, tone, value }) {
  const tones = {
    left: {
      container: "border-emerald-200 bg-emerald-50",
      label: "text-emerald-700",
      value: "text-emerald-900",
    },
    pending: {
      container: "border-amber-200 bg-amber-50",
      label: "text-amber-700",
      value: "text-amber-900",
    },
    booked: {
      container: "border-rose-200 bg-rose-50",
      label: "text-rose-700",
      value: "text-rose-900",
    },
  };

  const palette = tones[tone] || {
    container: "border-blue-100 bg-campus-pale",
    label: "text-slate-500",
    value: "text-campus-navy",
  };

  return (
    <div className={`rounded-lg border px-3 py-2 ${palette.container}`}>
      <p className={`text-[11px] font-black uppercase tracking-[0.08em] ${palette.label}`}>
        {label}
      </p>
      <p className={`mt-1 text-base font-black ${palette.value}`}>{value}</p>
    </div>
  );
}

function formatDateLabel(value) {
  if (!value) return "";

  const parsed = new Date(`${value}T00:00:00`);
  return parsed.toLocaleDateString("en-CA", {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatShortDate(value) {
  if (!value) return "";

  const parsed = new Date(`${value}T00:00:00`);
  return parsed.toLocaleDateString("en-CA", {
    month: "short",
    day: "2-digit",
  });
}

export default StudentBookingPanel;
