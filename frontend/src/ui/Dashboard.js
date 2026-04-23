import AdminDashboard from "./dashboard/AdminDashboard";
import StudentDashboard from "./dashboard/StudentDashboard";
import TechnicianDashboard from "./dashboard/TechnicianDashboard";

function Dashboard({ user, onLogout }) {
  if (user.role === "STUDENT") {
    return <StudentDashboard onLogout={onLogout} user={user} />;
  }

  if (user.role === "TECHNICIAN") {
    return <TechnicianDashboard onLogout={onLogout} user={user} />;
  }

  return <AdminDashboard onLogout={onLogout} user={user} />;
}

export default Dashboard;
