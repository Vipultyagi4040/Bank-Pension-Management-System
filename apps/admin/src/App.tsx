import { useState } from "react";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  User,
  Users,
  FileText,
  MessageSquare,
  Shield,
  BarChart3,
  Upload,
  Settings,
  Clock,
  FileBarChart,
  ScrollText
} from "lucide-react";
import {
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PensionersPage from "./pages/PensionersPage";
import PensionerFormPage from "./pages/PensionerFormPage";
import PensionerDetailPage from "./pages/PensionerDetailPage";
import GrievancesPage from "./pages/GrievancesPage";
import NotificationsPage from "./pages/NotificationsPage";
import PoliciesPage from "./pages/PoliciesPage";
import JeevanPramaanPage from "./pages/JeevanPramaanPage";
import ReportsPage from "./pages/ReportsPage";
import ImportPage from "./pages/ImportPage";
import PensionDetailsPage from "./pages/PensionDetailsPage";
import PensionDetailFormPage from "./pages/PensionDetailFormPage";
import MonthlyProcessingPage from "./pages/MonthlyProcessingPage";
import MonthlyPensionsPage from "./pages/MonthlyPensionsPage";
import PensionReportPage from "./pages/PensionReportPage";
import AuditLogsPage from "./pages/AuditLogsPage";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/pensioners", icon: Users, label: "Pensioners" },
  { to: "/grievances", icon: MessageSquare, label: "Grievances" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/policies", icon: Shield, label: "Policies" },
  { to: "/jeevan-pramaan", icon: FileText, label: "Jeevan Pramaan" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/import", icon: Upload, label: "Bulk Upload" },
  { to: "/pension-details", icon: Settings, label: "Pension Details" },
  { to: "/processing", icon: Clock, label: "Monthly Processing" },
  { to: "/monthly-pensions", icon: FileBarChart, label: "Monthly Pensions" },
  { to: "/pension-report", icon: ScrollText, label: "Pension Report" },
  { to: "/audit-logs", icon: ScrollText, label: "Audit Logs" }
];

function ProtectedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const item = navItems.find(item => location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to)));
    return item?.label || "Dashboard";
  };

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>
            <span className="logo-icon">🏦</span>
            Pension Admin
          </h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
          <button
            className="secondary"
            style={{ marginTop: 20 }}
            onClick={() => {
              localStorage.removeItem("adminToken");
              window.location.href = "/login";
            }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>

      <div className="main-content">
        <header className="top-navbar">
          <div className="navbar-left">
            <button
              className="nav-icon-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: "none" }}
            >
              <Menu size={20} />
            </button>
            <h1>{getPageTitle()}</h1>
          </div>
          <div className="navbar-right">
            <div className="search-box">
              <Search />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="nav-icon-btn">
              <Bell size={20} />
              <span className="badge"></span>
            </button>
            <button className="profile-btn">
              <div className="profile-avatar">A</div>
              <div className="profile-info">
                <span className="profile-name">Admin</span>
                <span className="profile-role">Super Admin</span>
              </div>
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />

        <Route path="/pensioners" element={<PensionersPage />} />
        <Route path="/pensioners/new" element={<PensionerFormPage />} />
        <Route path="/pensioners/:id" element={<PensionerDetailPage />} />
        <Route
          path="/pensioners/:id/edit"
          element={<PensionerFormPage />}
        />

        <Route path="/grievances" element={<GrievancesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/policies" element={<PoliciesPage />} />
        <Route
          path="/jeevan-pramaan"
          element={<JeevanPramaanPage />}
        />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/import" element={<ImportPage />} />

        <Route
          path="/pension-details"
          element={<PensionDetailsPage />}
        />
        <Route
          path="/pension-details/new"
          element={<PensionDetailFormPage />}
        />
        <Route
          path="/pension-details/:id/edit"
          element={<PensionDetailFormPage />}
        />

        <Route
          path="/processing"
          element={<MonthlyProcessingPage />}
        />
        <Route
          path="/monthly-pensions"
          element={<MonthlyPensionsPage />}
        />
        <Route
          path="/pension-report"
          element={<PensionReportPage />}
        />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
      </Route>
    </Routes>
  );
}
