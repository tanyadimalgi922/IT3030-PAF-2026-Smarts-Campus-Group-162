import { useEffect, useMemo, useState } from "react";
import { login, registerStudent, registerTechnician } from "../api/authApi";
import CampusHeader from "./CampusHeader";
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
    <main className="auth-shell min-h-screen text-campus-ink">
      <CampusHeader
        active={activeTab === "login" ? "Home" : "Resources"}
        onNavigate={(item) => {
          if (item === "Home") onNavigateTab("home");
          if (item === "About Us") onNavigateTab("about");
          if (item === "Resources") onNavigateTab("login");
          if (item === "Get started") onNavigateTab("student");
          if (item === "Sign in") onNavigateTab("login");
        }}
      />

      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-12">
        <div className="rounded-[2rem] bg-white p-6 shadow-panel sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.32em] text-campus-blue">
            Campus Hub
          </p>
          <h1 className="mt-5 text-4xl font-black text-campus-navy sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Access your campus account and continue to your role-based workspace.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 rounded-2xl bg-[#eef6ff] p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`min-h-11 flex-1 rounded-xl px-3 text-sm font-bold transition ${
                  activeTab === tab.id
                    ? "bg-campus-navy text-white shadow-sm"
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

          <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
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
              className="mt-2 min-h-14 rounded-2xl bg-campus-navy px-5 text-base font-black text-white transition hover:bg-[#123f7a] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
              type="submit"
            >
              {loading ? "Please wait..." : activeTab === "login" ? "Login" : "Create Account"}
            </button>

            <div className="rounded-2xl border border-blue-100 bg-[#f8fbff] p-4 text-sm text-slate-600">
              <span className="font-black text-campus-navy">Admin demo:</span>{" "}
              admin@smartcampus.lk / Admin@123
            </div>
          </form>
        </div>

        <div className="dark-hero rounded-[2rem] p-6 text-white shadow-panel sm:p-8">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <div className="flex aspect-[16/9] items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-sky-200 via-blue-300 to-campus-blue text-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-campus-navy">
                  Campus Life
                </p>
                <p className="mt-2 text-3xl font-black text-white">Spaces that work</p>
              </div>
            </div>
            <h2 className="mt-5 text-2xl font-black">University Campus Life</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/80">
              Discover available rooms, equipment, capacity, and operational updates from one
              smart campus workspace.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["Find the right place", "Search by location, room type, and capacity."],
              ["Book with confidence", "Availability windows and status stay visible."],
            ].map(([heading, copy]) => (
              <div key={heading} className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <h3 className="text-xl font-black">{heading}</h3>
                <p className="mt-3 text-sm leading-6 text-white/75">{copy}</p>
              </div>
            ))}
          </div>
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
