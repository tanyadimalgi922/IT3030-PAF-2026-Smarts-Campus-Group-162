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
    <form className="mt-3 rounded-lg border border-blue-100 bg-[#f8fbff] p-3" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-campus-violet">
            Booking Slots
          </p>
          <p className="mt-0.5 text-xs font-semibold text-slate-600">
            {formatDateLabel(date)}
          </p>
        </div>
        <input
          className="field-input text-xs sm:max-w-40"
          min={new Date().toISOString().slice(0, 10)}
          onChange={(event) => setDate(event.target.value)}
          type="date"
          value={date}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {loading ? (
          <div className="rounded-xl border border-blue-100 bg-white p-3 text-xs font-bold text-campus-blue">
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
          <div className="col-span-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-500">
            No slots for this date.
          </div>
        )}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <select className="field-input text-xs" onChange={(event) => handleSlotSelect(event.target.value)} required value={selectedSlotValue}>
          <option value="">Select available slot</option>
          {availableSlots.map((slot) => (
            <option key={`${slot.startTime}-${slot.endTime}`} value={`${slot.startTime}|${slot.endTime}`}>
              {slot.startTime} - {slot.endTime}
            </option>
          ))}
        </select>
        <input className="field-input text-xs" readOnly value={endTime ? `${startTime} - ${endTime}` : "No slot selected"} />
        <input
          className="field-input text-xs"
          min="1"
          max={resource.capacity}
          onChange={(event) => setExpectedAttendees(event.target.value)}
          placeholder="Expected attendees"
          required
          type="number"
          value={expectedAttendees}
        />
        <input
          className="field-input text-xs"
          onChange={(event) => setPurpose(event.target.value)}
          placeholder="Purpose"
          required
          value={purpose}
        />
      </div>

      {error && <p className="mt-2.5 text-xs font-bold text-red-700">{error}</p>}
      {message && <p className="mt-2.5 text-xs font-bold text-emerald-700">{message}</p>}

      <button
        className="primary-action mt-3 min-h-10 w-full rounded-md px-3 text-xs font-black text-white disabled:opacity-60"
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
      className={`rounded-2xl border bg-white p-3.5 text-left transition ${
        selected
          ? "border-campus-blue shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
          : "border-slate-200 shadow-sm"
      } ${interactive ? "hover:-translate-y-0.5 hover:border-campus-blue hover:shadow-md" : "cursor-not-allowed opacity-75"}`}
      disabled={!interactive}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-black tracking-tight text-campus-navy">
            {slot.startTime} - {slot.endTime}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            {formatShortDate(slot.date)} booking window
          </p>
        </div>
        <p
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
            interactive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {interactive ? "Open" : "Full"}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Metric label="Left" tone="left" value={slot.leftCount} />
        <Metric label="Pending" tone="pending" value={slot.pendingCount} />
        <Metric label="Booked" tone="booked" value={slot.bookedCount} />
      </div>

      {interactive && (
        <p className="mt-3 text-sm font-bold text-emerald-700">
          Available for request
        </p>
      )}
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
    <div className={`rounded-xl border px-2 py-2 text-center ${palette.container}`}>
      <p className={`text-[9px] font-black uppercase tracking-[0.12em] ${palette.label}`}>
        {label}
      </p>
      <p className={`mt-1 text-lg leading-none font-black ${palette.value}`}>{value}</p>
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
    day: "numeric",
  });
}

export default StudentBookingPanel;
