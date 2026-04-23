import DashboardLayout from "./DashboardLayout";
import InfoCard from "./InfoCard";

function TechnicianDashboard({ user, onLogout }) {
  return (
    <DashboardLayout
      eyebrow="Technician Dashboard"
      onLogout={onLogout}
      title={`Welcome, ${user.fullName}`}
    >
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard label="Full name" value={user.fullName} />
        <InfoCard label="Email" value={user.email} />
        <InfoCard label="Role" value="Technician" />
        <InfoCard label="Specialization" value={user.specialization} />
        <InfoCard label="Access" value="Maintenance and incident updates" />
        <InfoCard label="Current status" value="Available" />
      </div>
    </DashboardLayout>
  );
}

export default TechnicianDashboard;
