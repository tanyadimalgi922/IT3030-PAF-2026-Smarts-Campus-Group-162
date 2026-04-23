import React from "react";
import "./App.css";
import AuthPage from "./ui/AuthPage";
import Dashboard from "./ui/Dashboard";
import AboutPage from "./ui/public/AboutPage";
import HomePage from "./ui/public/HomePage";

const routes = {
  home: "/",
  about: "/about",
  login: "/login",
  studentRegister: "/register/student",
  technicianRegister: "/register/technician",
  studentDashboard: "/student/dashboard",
  studentResources: "/student/resources",
  studentBookings: "/student/bookings",
  studentTickets: "/student/tickets",
  technicianDashboard: "/technician/dashboard",
  technicianTickets: "/technician/tickets",
  adminDashboard: "/admin/dashboard",
  adminBookings: "/admin/bookings",
  adminIncidents: "/admin/incidents",
  adminCreateResource: "/admin/resources/create",
  adminEditResource: "/admin/resources/edit",
};

function App() {
  const [path, setPath] = usePath();
  const [currentUser, setCurrentUser] = React.useState(() => getStoredUser());

  const navigate = (nextPath) => {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  };

  const handleAuthenticated = (user) => {
    setCurrentUser(user);
    localStorage.setItem("smartCampusUser", JSON.stringify(user));
    navigate(getDashboardPath(user.role));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("smartCampusUser");
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

    return <Dashboard onLogout={handleLogout} onNavigate={navigate} path={path} user={currentUser} />;
  }

  if (path === routes.home) {
    return <HomePage onLogout={handleLogout} onNavigate={navigate} user={currentUser} />;
  }

  if (path === routes.about) {
    return <AboutPage onLogout={handleLogout} onNavigate={navigate} user={currentUser} />;
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
  const [path, setPath] = React.useState(normalizePath(window.location.pathname));

  React.useEffect(() => {
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
  return path || routes.home;
}

function getAuthTab(path) {
  if (path === routes.studentRegister) return "student";
  if (path === routes.technicianRegister) return "technician";
  return "login";
}

function getAuthPath(tab) {
  if (tab === "home") return routes.home;
  if (tab === "about") return routes.about;
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
    routes.studentResources,
    routes.studentBookings,
    routes.studentTickets,
    routes.technicianDashboard,
    routes.technicianTickets,
    routes.adminDashboard,
    routes.adminBookings,
    routes.adminIncidents,
    routes.adminCreateResource,
  ].includes(path)
    || path.startsWith(`${routes.studentTickets}/create/`)
    || path.startsWith(`${routes.adminEditResource}/`);
}

function getStoredUser() {
  try {
    const user = localStorage.getItem("smartCampusUser");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export default App;
