import { useState } from "react";
import { createResource } from "../../api/resourceApi";
import Field from "../Field";
import ResourceBrowser from "./ResourceBrowser";

const initialForm = {
  name: "",
  type: "LECTURE_HALL",
  capacity: "",
  location: "",
  status: "ACTIVE",
  imageDataUrl: "",
  availabilityWindows: [{ startDate: "", endDate: "", startTime: "", endTime: "" }],
};

function AdminResourceManager() {
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState({ tone: "idle", message: "" });
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus({ tone: "idle", message: "" });

    try {
      await createResource({
        ...form,
        capacity: Number(form.capacity),
        availabilityWindows: form.availabilityWindows.filter(
          (window) => window.startDate && window.endDate && window.startTime && window.endTime
        ),
      });
      setForm(initialForm);
      setShowForm(false);
      setRefreshKey((current) => current + 1);
      setStatus({ tone: "success", message: "Resource created successfully." });
    } catch (error) {
      setStatus({ tone: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-8">
      <div className="glass-panel rounded-lg p-5 shadow-glow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-campus-violet">
              Admin Resource Studio
            </p>
            <h2 className="mt-1 text-2xl font-black text-campus-ink">
              Facilities & assets control
            </h2>
          </div>
          <button
            className="primary-action min-h-12 rounded-md px-5 text-sm font-black text-white transition hover:scale-[1.01]"
            onClick={() => setShowForm((current) => !current)}
            type="button"
          >
            {showForm ? "Close Form" : "Create Resource"}
          </button>
        </div>

        {showForm && (
        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
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
              placeholder="Block A, Floor 2"
              value={form.location}
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
              className="h-40 w-full rounded-lg border border-blue-100 object-cover md:w-80"
              src={form.imageDataUrl}
            />
          )}

          <div className="rounded-lg border border-blue-100 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-black text-campus-navy">Availability windows</h3>
              <button
                className="min-h-10 rounded-md bg-campus-blue px-4 text-sm font-black text-white"
                onClick={addWindow}
                type="button"
              >
                Add window
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {form.availabilityWindows.map((window, index) => (
                <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
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

          <button
            className="primary-action min-h-12 rounded-md px-5 text-base font-black text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={saving}
            type="submit"
          >
            {saving ? "Saving..." : "Create Resource"}
          </button>
        </form>
        )}
      </div>

      <ResourceBrowser refreshKey={refreshKey} />
    </section>
  );
}

export default AdminResourceManager;
