import DashboardLayout from "./DashboardLayout";
import InfoCard from "./InfoCard";
import AdminResourceManager from "../resources/AdminResourceManager";

function AdminDashboard({ user, onLogout }) {
  return (
    <DashboardLayout
      eyebrow="Admin Dashboard"
      onLogout={onLogout}
      title={`Welcome, ${user.fullName}`}
    >
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard label="Full name" value={user.fullName} />
        <InfoCard label="Email" value={user.email} />
        <InfoCard label="Role" value="Admin" />
        <InfoCard label="Area" value={user.specialization} />
        <InfoCard label="Access" value="Users, resources, bookings, and incidents" />
        <InfoCard label="System" value="Smart Campus Operations Hub" />
      </div>
      <AdminResourceManager />
    </DashboardLayout>
  );
}

export default AdminDashboard;
