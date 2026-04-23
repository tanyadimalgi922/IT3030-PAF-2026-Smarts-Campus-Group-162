import { useEffect, useState } from "react";
import "./App.css";
import AuthPage from "./ui/AuthPage";
import Dashboard from "./ui/Dashboard";

const routes = {
  login: "/login",
  studentRegister: "/register/student",
  technicianRegister: "/register/technician",
  studentDashboard: "/student/dashboard",
  technicianDashboard: "/technician/dashboard",
  adminDashboard: "/admin/dashboard",
};

function App() {
  const [path, setPath] = usePath();
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = (nextPath) => {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  };

  const handleAuthenticated = (user) => {
    setCurrentUser(user);
    navigate(getDashboardPath(user.role));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate(routes.login);
  };

  if (isDashboardPath(path)) {
    if (!currentUser) {
      return (
        <AuthPage
          initialTab="login"
          onAuthenticated={handleAuthenticated}
          onNavigateTab={(tab) => navigate(getAuthPath(tab))}
        />
      );
    }

    return <Dashboard onLogout={handleLogout} user={currentUser} />;
  }

  return (
    <AuthPage
      initialTab={getAuthTab(path)}
      onAuthenticated={handleAuthenticated}
      onNavigateTab={(tab) => navigate(getAuthPath(tab))}
    />
  );
}

function usePath() {
  const [path, setPath] = useState(normalizePath(window.location.pathname));

  useEffect(() => {
    if (window.location.pathname !== path) {
      window.history.replaceState({}, "", path);
    }

    const handlePopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [path]);

  return [path, setPath];
}

function normalizePath(path) {
  return path && path !== "/" ? path : routes.login;
}

function getAuthTab(path) {
  if (path === routes.studentRegister) return "student";
  if (path === routes.technicianRegister) return "technician";
  return "login";
}

function getAuthPath(tab) {
  if (tab === "student") return routes.studentRegister;
  if (tab === "technician") return routes.technicianRegister;
  return routes.login;
}

function getDashboardPath(role) {
  if (role === "STUDENT") return routes.studentDashboard;
  if (role === "TECHNICIAN") return routes.technicianDashboard;
  return routes.adminDashboard;
}

function isDashboardPath(path) {
  return [
    routes.studentDashboard,
    routes.technicianDashboard,
    routes.adminDashboard,
  ].includes(path);
}

export default App;
