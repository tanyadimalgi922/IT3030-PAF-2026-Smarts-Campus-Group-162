import DashboardLayout from "./DashboardLayout";
import InfoCard from "./InfoCard";

function StudentDashboard({ user, onLogout }) {
  return (
    <DashboardLayout
      eyebrow="Student Dashboard"
      onLogout={onLogout}
      title={`Welcome, ${user.fullName}`}
    >
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard label="Full name" value={user.fullName} />
        <InfoCard label="Email" value={user.email} />
        <InfoCard label="Role" value="Student" />
        <InfoCard label="Registration number" value={user.registrationNumber} />
        <InfoCard label="Faculty" value={user.faculty} />
        <InfoCard label="Access" value="Facilities and asset bookings" />
      </div>
    </DashboardLayout>
  );
}

export default StudentDashboard;
