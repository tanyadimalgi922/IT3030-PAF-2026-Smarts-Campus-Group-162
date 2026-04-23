import { useEffect, useState } from "react";
import CampusHeader from "../CampusHeader";

const slides = [
  {
    title: "Smart lecture halls built for focus",
    caption: "Reserve learning spaces, track availability, and respond to issues before they disrupt the day.",
    image:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Campus operations with live visibility",
    caption: "Students, technicians, and admins stay aligned through one coordinated platform.",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Spaces, equipment, and support in one flow",
    caption: "From resource booking to incident follow-up, the experience stays clear and fast.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
  },
];

function HomePage({ onNavigate }) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="public-shell min-h-screen text-campus-ink">
      <CampusHeader active="Home" onNavigate={(item) => handlePublicNavigate(item, onNavigate)} />

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="public-hero-card rounded-[2rem] p-7 text-white shadow-panel sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.32em] text-amber-200">
              Smart Campus Platform
            </p>
            <h1 className="serif-display mt-5 text-5xl font-black leading-[1.02] sm:text-6xl">
              A cleaner digital campus for rooms, resources, and real-time support.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
              Manage campus spaces with less friction. Book resources, report incidents, and keep
              operations moving with one connected system.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                className="min-h-12 rounded-full bg-white px-6 text-sm font-black text-[#11213d]"
                onClick={() => onNavigate("/register/student")}
                type="button"
              >
                Get Started
              </button>
              <button
                className="min-h-12 rounded-full border border-white/20 px-6 text-sm font-black text-white"
                onClick={() => onNavigate("/about")}
                type="button"
              >
                Explore About Us
              </button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <HeroMetric label="Faster booking" value="Real-time" />
              <HeroMetric label="Incident flow" value="Tracked" />
              <HeroMetric label="Campus roles" value="Unified" />
            </div>
          </div>

          <div className="glass-panel overflow-hidden rounded-[2rem] border border-white/70 p-4 shadow-panel sm:p-5">
            <div className="relative h-[420px] overflow-hidden rounded-[1.6rem]">
              {slides.map((slide, index) => (
                <div
                  className={`absolute inset-0 transition-all duration-700 ${
                    index === activeSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                  }`}
                  key={slide.title}
                >
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `linear-gradient(180deg, rgba(10, 20, 38, 0.08), rgba(10, 20, 38, 0.62)), url(${slide.image})` }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="text-xs font-black uppercase tracking-[0.26em] text-sky-100">
                      Featured Experience
                    </p>
                    <h2 className="mt-3 text-3xl font-black">{slide.title}</h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-white/86">{slide.caption}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {slides.map((slide, index) => (
                  <button
                    aria-label={`Show slide ${index + 1}`}
                    className={`h-3 rounded-full transition-all ${
                      index === activeSlide ? "w-10 bg-campus-blue" : "w-3 bg-slate-300"
                    }`}
                    key={slide.title}
                    onClick={() => setActiveSlide(index)}
                    type="button"
                  />
                ))}
              </div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                {String(activeSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Book smarter", "Students can discover rooms, labs, and equipment without guesswork."],
            ["Respond faster", "Technicians follow incidents with better visibility and clear progress states."],
            ["Operate clearly", "Admins manage resources, bookings, and service workflows from one system."],
          ].map(([title, copy]) => (
            <div className="rounded-[1.75rem] border border-blue-100 bg-white p-6 shadow-sm" key={title}>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-campus-blue">Platform Benefit</p>
              <h3 className="mt-4 text-2xl font-black text-campus-navy">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>

        <div className="public-ribbon mt-8 rounded-[2rem] p-7 text-white shadow-panel sm:p-9">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-200">Why It Works</p>
              <h2 className="mt-4 text-4xl font-black leading-tight">A workflow that feels calm, clear, and ready for scale.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <RibbonCard label="Spaces" value="Live resource visibility" />
              <RibbonCard label="Incidents" value="Track from report to closure" />
              <RibbonCard label="Access" value="Student, technician, admin flows" />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] bg-white p-7 shadow-panel sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-campus-blue">Inside The Platform</p>
            <h2 className="mt-4 text-4xl font-black text-campus-navy">Designed to reduce campus friction.</h2>
            <div className="mt-6 grid gap-4">
              {[
                ["Transparent booking", "See availability and request resources through a consistent experience."],
                ["Connected incident reporting", "Students can report issues with evidence, while technicians and admins coordinate actions."],
                ["Focused dashboards", "Each role gets a workflow that is relevant, readable, and easier to act on."],
              ].map(([title, copy]) => (
                <div className="rounded-2xl border border-slate-100 bg-[#fbfdff] p-5" key={title}>
                  <h3 className="text-xl font-black text-campus-navy">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-blue-100 bg-white p-7 shadow-panel sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-campus-blue">Start Now</p>
            <h2 className="mt-4 text-3xl font-black text-campus-navy">Choose the way you want to enter.</h2>
            <div className="mt-6 grid gap-4">
              <EntryCard
                actionLabel="Sign In"
                copy="Return to your role-based workspace with your existing account."
                onClick={() => onNavigate("/login")}
                title="Already have an account?"
              />
              <EntryCard
                actionLabel="Student Registration"
                copy="Create a student account to book resources and report issues."
                onClick={() => onNavigate("/register/student")}
                title="Join as a student"
              />
              <EntryCard
                actionLabel="Technician Registration"
                copy="Create a technician account to manage service tickets and updates."
                onClick={() => onNavigate("/register/technician")}
                title="Join as a technician"
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function handlePublicNavigate(item, onNavigate) {
  if (item === "Home") onNavigate("/");
  if (item === "About Us") onNavigate("/about");
  if (item === "Resources") onNavigate("/login");
  if (item === "Sign in") onNavigate("/login");
  if (item === "Get started") onNavigate("/register/student");
}

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/14 bg-white/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/64">{label}</p>
      <p className="mt-3 text-2xl font-black">{value}</p>
    </div>
  );
}

function RibbonCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/14 bg-white/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-white/64">{label}</p>
      <p className="mt-3 text-lg font-black">{value}</p>
    </div>
  );
}

function EntryCard({ actionLabel, copy, onClick, title }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-5">
      <h3 className="text-xl font-black text-campus-navy">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{copy}</p>
      <button
        className="mt-4 min-h-11 rounded-full border border-blue-200 bg-white px-5 text-sm font-black text-campus-navy transition hover:border-campus-blue hover:text-campus-blue"
        onClick={onClick}
        type="button"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default HomePage;
