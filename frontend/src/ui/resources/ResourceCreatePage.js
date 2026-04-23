import { useEffect, useState } from "react";
import { createResource, getResource, updateResource } from "../../api/resourceApi";
import CampusHeader from "../CampusHeader";
import Field from "../Field";

const amenities = ["Wi-Fi", "Air conditioning", "Smart board", "Whiteboard", "Sound system"];
const buildings = ["Main Academic Block", "Science Complex", "Engineering Block", "Library Building", "Sports Center"];
const floors = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"];

const initialForm = {
  name: "",
  type: "LECTURE_HALL",
  capacity: "",
  location: "",
  building: "Main Academic Block",
  floor: "Ground Floor",
  roomNumber: "",
  amenities: [],
  status: "ACTIVE",
  imageDataUrl: "",
  availabilityWindows: [{ startDate: "", endDate: "", startTime: "", endTime: "" }],
};

function ResourceCreatePage({ onBack, onLogout, resourceId, user }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ tone: "idle", message: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(resourceId));
  const isEditMode = Boolean(resourceId);

  useEffect(() => {
    let active = true;

    async function loadResource() {
      if (!resourceId) {
        setForm(initialForm);
        setLoading(false);
        return;
      }

      setLoading(true);
      setStatus({ tone: "idle", message: "" });

      try {
        const resource = await getResource(resourceId);
        if (active) {
          setForm({
            ...initialForm,
            ...resource,
            capacity: resource.capacity ? String(resource.capacity) : "",
            amenities: resource.amenities || [],
            availabilityWindows:
              (resource.availabilityWindows || []).length > 0
                ? resource.availabilityWindows
                : initialForm.availabilityWindows,
          });
        }
      } catch (error) {
        if (active) {
          setStatus({ tone: "error", message: error.message });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadResource();

    return () => {
      active = false;
    };
  }, [resourceId]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateWindow = (index, field, value) => {
    setForm((current) => ({
      ...current,
      availabilityWindows: current.availabilityWindows.map((window, currentIndex) =>
        currentIndex === index ? { ...window, [field]: value } : window
      ),
    }));
  };

  const addWindow = () => {
    setForm((current) => ({
      ...current,
      availabilityWindows: [
        ...current.availabilityWindows,
        { startDate: "", endDate: "", startTime: "", endTime: "" },
      ],
    }));
  };

  const removeWindow = (index) => {
    setForm((current) => ({
      ...current,
      availabilityWindows: current.availabilityWindows.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const handleImage = (file) => {
    if (!file) {
      updateField("imageDataUrl", "");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateField("imageDataUrl", reader.result);
    reader.readAsDataURL(file);
  };

  const toggleAmenity = (amenity) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus({ tone: "idle", message: "" });

    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        availabilityWindows: form.availabilityWindows.filter(
          (window) => window.startDate && window.endDate && window.startTime && window.endTime
        ),
      };

      if (isEditMode) {
        await updateResource(resourceId, payload);
        setStatus({ tone: "success", message: "Resource updated successfully." });
      } else {
        await createResource(payload);
        setForm(initialForm);
        setStatus({ tone: "success", message: "Resource created successfully." });
      }
    } catch (error) {
      setStatus({ tone: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="auth-shell min-h-screen text-campus-ink">
      <CampusHeader active="Resources" onLogout={onLogout} user={user} />
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <div className="dark-hero rounded-[2rem] p-7 text-white shadow-panel sm:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.32em] text-sky-200">
                {isEditMode ? "Update Resource" : "Create Resource"}
              </p>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">
                {isEditMode ? "Update resource details" : "Add a new bookable resource"}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/80">
                Manage resource image, capacity, building map details, amenities, availability
                date range, active hours, and operational status.
              </p>
            </div>
            <button
              className="min-h-12 rounded-2xl bg-white px-6 text-sm font-black text-campus-navy"
              onClick={onBack}
              type="button"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

      {loading ? (
        <div className="mt-6 rounded-lg border border-blue-100 bg-white p-5 text-sm font-black text-campus-blue">
          Loading resource details...
        </div>
      ) : (
      <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
        <div className="glass-panel rounded-lg p-5">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-campus-violet">
            Resource Details
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field
              label="Resource name"
              onChange={(value) => updateField("name", value)}
              placeholder="Main Lecture Hall"
              value={form.name}
            />
            <label>
              <span className="field-label">Resource type</span>
              <select
                className="field-input"
                onChange={(event) => updateField("type", event.target.value)}
                value={form.type}
              >
                <option value="LECTURE_HALL">Lecture hall</option>
                <option value="LAB">Lab</option>
                <option value="MEETING_ROOM">Meeting room</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </label>
            <Field
              label="Capacity"
              onChange={(value) => updateField("capacity", value)}
              placeholder="120"
              type="number"
              value={form.capacity}
            />
            <Field
              label="Location"
              onChange={(value) => updateField("location", value)}
              placeholder="Near main stairway"
              value={form.location}
            />
            <label>
              <span className="field-label">Building</span>
              <select
                className="field-input"
                onChange={(event) => updateField("building", event.target.value)}
                value={form.building}
              >
                {buildings.map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Floor</span>
              <select
                className="field-input"
                onChange={(event) => updateField("floor", event.target.value)}
                value={form.floor}
              >
                {floors.map((floor) => (
                  <option key={floor} value={floor}>
                    {floor}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Room number"
              onChange={(value) => updateField("roomNumber", value)}
              placeholder="A-204"
              value={form.roomNumber}
            />
            <label>
              <span className="field-label">Status</span>
              <select
                className="field-input"
                onChange={(event) => updateField("status", event.target.value)}
                value={form.status}
              >
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of service</option>
              </select>
            </label>
            <label>
              <span className="field-label">Resource image</span>
              <input
                accept="image/*"
                className="field-input"
                onChange={(event) => handleImage(event.target.files[0])}
                type="file"
              />
            </label>
          </div>

          {form.imageDataUrl && (
            <img
              alt="Resource preview"
              className="mt-4 h-56 w-full rounded-lg border border-blue-100 object-cover shadow-sm"
              src={form.imageDataUrl}
            />
          )}
        </div>

        <div className="glass-panel rounded-lg p-5">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-campus-violet">
            Amenities / Features
          </p>
          <h3 className="mt-1 text-xl font-black text-campus-navy">
            Select available facilities
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {amenities.map((amenity) => {
              const selected = form.amenities.includes(amenity);
              return (
                <button
                  className={`min-h-12 rounded-lg border px-4 text-sm font-black transition ${
                    selected
                      ? "border-campus-blue bg-campus-blue text-white shadow-glow"
                      : "border-blue-100 bg-white text-campus-navy hover:bg-campus-cloud"
                  }`}
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  type="button"
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-panel rounded-lg p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-campus-violet">
                Availability
              </p>
              <h3 className="mt-1 text-xl font-black text-campus-navy">
                Date range and active hours
              </h3>
            </div>
            <button
              className="min-h-10 rounded-md bg-campus-navy px-4 text-sm font-black text-white"
              onClick={addWindow}
              type="button"
            >
              Add Window
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {form.availabilityWindows.map((window, index) => (
              <div key={index} className="grid gap-3 rounded-lg border border-blue-100 bg-white/80 p-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                <input
                  className="field-input"
                  onChange={(event) => updateWindow(index, "startDate", event.target.value)}
                  required
                  type="date"
                  value={window.startDate}
                />
                <input
                  className="field-input"
                  onChange={(event) => updateWindow(index, "endDate", event.target.value)}
                  required
                  type="date"
                  value={window.endDate}
                />
                <input
                  className="field-input"
                  onChange={(event) => updateWindow(index, "startTime", event.target.value)}
                  required
                  type="time"
                  value={window.startTime}
                />
                <input
                  className="field-input"
                  onChange={(event) => updateWindow(index, "endTime", event.target.value)}
                  required
                  type="time"
                  value={window.endTime}
                />
                <button
                  className="min-h-11 rounded-md border border-blue-200 px-4 text-sm font-bold text-campus-blue disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={form.availabilityWindows.length === 1}
                  onClick={() => removeWindow(index)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {status.message && (
          <div
            className={`rounded-md border px-4 py-3 text-sm font-semibold ${
              status.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="primary-action min-h-12 rounded-md px-6 text-base font-black text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={saving}
            type="submit"
          >
            {saving ? "Saving..." : isEditMode ? "Update Resource" : "Create Resource"}
          </button>
          <button
            className="min-h-12 rounded-md border border-blue-200 bg-white/80 px-6 text-base font-black text-campus-blue transition hover:bg-campus-cloud"
            onClick={onBack}
            type="button"
          >
            Cancel
          </button>
        </div>
      </form>
      )}
      </section>
    </main>
  );
}

export default ResourceCreatePage;
