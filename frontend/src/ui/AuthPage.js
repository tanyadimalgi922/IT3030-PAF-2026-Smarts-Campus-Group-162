import { useEffect, useMemo, useState } from "react";
import { login, registerStudent, registerTechnician } from "../api/authApi";
import Field from "./Field";

const tabs = [
  { id: "login", label: "Login" },
  { id: "student", label: "Student Registration" },
  { id: "technician", label: "Technician Registration" },
];

const emptyForms = {
  login: { email: "", password: "" },
  student: {
    fullName: "",
    email: "",
    password: "",
    registrationNumber: "",
    faculty: "",
  },
  technician: {
    fullName: "",
    email: "",
    password: "",
    specialization: "",
  },
};

function AuthPage({ initialTab = "login", onAuthenticated, onNavigateTab }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [forms, setForms] = useState(emptyForms);
  const [status, setStatus] = useState({ tone: "idle", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const title = useMemo(() => {
    if (activeTab === "student") return "Create student account";
    if (activeTab === "technician") return "Create technician account";
    return "Sign in to Smart Campus";
  }, [activeTab]);

  const handleChange = (formName, field, value) => {
    setForms((current) => ({
      ...current,
      [formName]: {
        ...current[formName],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ tone: "idle", message: "" });

    try {
      const data = await submitActiveForm(activeTab, forms[activeTab]);

      setStatus({
        tone: "success",
        message: `${data.message} Welcome ${data.fullName} (${data.role}).`,
      });
      onAuthenticated(data);
    } catch (error) {
      setStatus({ tone: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell min-h-screen px-5 py-8 text-campus-ink sm:px-8 lg:px-12">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-campus-blue">
            Smart Campus Operations Hub
          </p>
          <h1 className="text-4xl font-black leading-tight text-campus-ink sm:text-5xl">
            Facility booking and incident workflows for one connected campus.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            Start with role-based access for students, technicians, and admins before building the
            facilities and maintenance modules.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["A", "Facilities catalogue"],
              ["B", "Asset booking"],
              ["C", "Maintenance tracking"],
            ].map(([code, label]) => (
              <div key={code} className="rounded-lg border border-white/80 bg-white/70 p-4 shadow-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-campus-blue text-sm font-black text-white">
                  {code}
                </span>
                <p className="mt-3 text-sm font-bold text-campus-navy">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-lg p-5 shadow-panel sm:p-7">
          <div className="mb-6 flex flex-wrap gap-2 rounded-lg bg-campus-cloud p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`min-h-11 flex-1 rounded-md px-3 text-sm font-bold transition ${
                  activeTab === tab.id
                    ? "bg-campus-blue text-white shadow-sm"
                    : "text-campus-navy hover:bg-white"
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setStatus({ tone: "idle", message: "" });
                  onNavigateTab(tab.id);
                }}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-campus-ink">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Admin demo: admin@smartcampus.lk / Admin@123
            </p>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            {activeTab !== "login" && (
              <Field
                label="Full name"
                onChange={(value) => handleChange(activeTab, "fullName", value)}
                placeholder="Enter full name"
                value={forms[activeTab].fullName}
              />
            )}

            <Field
              label="Email address"
              onChange={(value) => handleChange(activeTab, "email", value)}
              placeholder="studentname@gmail.com"
              type="email"
              value={forms[activeTab].email}
            />

            <Field
              label="Password"
              onChange={(value) => handleChange(activeTab, "password", value)}
              placeholder="Minimum 6 characters"
              type="password"
              value={forms[activeTab].password}
            />

            {activeTab === "student" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Registration number"
                  onChange={(value) => handleChange("student", "registrationNumber", value)}
                  pattern="it23[0-9]{6}"
                  placeholder="it23123456"
                  title="Use format it23xxxxxx, for example it23123456"
                  value={forms.student.registrationNumber}
                />
                <Field
                  label="Faculty"
                  onChange={(value) => handleChange("student", "faculty", value)}
                  placeholder="Computing"
                  value={forms.student.faculty}
                />
              </div>
            )}

            {activeTab === "technician" && (
              <div className="grid gap-4">
                <Field
                  label="Specialization"
                  onChange={(value) => handleChange("technician", "specialization", value)}
                  placeholder="Electrical, HVAC, IT"
                  value={forms.technician.specialization}
                />
              </div>
            )}

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
              className="primary-action mt-2 min-h-12 rounded-md px-5 text-base font-black text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
              type="submit"
            >
              {loading ? "Please wait..." : activeTab === "login" ? "Login" : "Create Account"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function submitActiveForm(activeTab, payload) {
  if (activeTab === "student") {
    return registerStudent(payload);
  }

  if (activeTab === "technician") {
    return registerTechnician(payload);
  }

  return login(payload);
}

export default AuthPage;
