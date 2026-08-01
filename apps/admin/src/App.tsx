import { useState, lazy, Suspense } from "react";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
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
import { motion, AnimatePresence } from "framer-motion";

import LoginPage from "./pages/LoginPage";
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const PensionersPage = lazy(() => import("./pages/PensionersPage"));
const PensionerFormPage = lazy(() => import("./pages/PensionerFormPage"));
const PensionerDetailPage = lazy(() => import("./pages/PensionerDetailPage"));
const GrievancesPage = lazy(() => import("./pages/GrievancesPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const PoliciesPage = lazy(() => import("./pages/PoliciesPage"));
const JeevanPramaanPage = lazy(() => import("./pages/JeevanPramaanPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const ImportPage = lazy(() => import("./pages/ImportPage"));
const PensionDetailsPage = lazy(() => import("./pages/PensionDetailsPage"));
const PensionDetailFormPage = lazy(() => import("./pages/PensionDetailFormPage"));
const MonthlyProcessingPage = lazy(() => import("./pages/MonthlyProcessingPage"));
const MonthlyPensionsPage = lazy(() => import("./pages/MonthlyPensionsPage"));
const PensionReportPage = lazy(() => import("./pages/PensionReportPage"));
const AuditLogsPage = lazy(() => import("./pages/AuditLogsPage"));

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/pensioners", icon: Users, label: "Pensioners" },
  { to: "/pension-details", icon: FileText, label: "Pension Details" },
  { to: "/grievances", icon: MessageSquare, label: "Grievances" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/policies", icon: Shield, label: "Policies" },
  { to: "/monthly-pensions", icon: FileBarChart, label: "Monthly Pensions" },
  { to: "/processing", icon: Clock, label: "Monthly Processing" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/audit-logs", icon: ScrollText, label: "Audit Logs" },
  { to: "/import", icon: Upload, label: "Bulk Upload" },
  { to: "/jeevan-pramaan", icon: FileText, label: "Jeevan Pramaan" },
  { to: "/pension-report", icon: ScrollText, label: "Pension Report" }
];

const sidebarVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, delay: i * 0.05 }
  })
};

function ProtectedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        initial={{ x: -250 }}
        animate={{ x: sidebarOpen ? 0 : -250 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="sidebar-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2>
            <span className="logo-icon">🏦</span>
            Bank Pension Admin
          </h2>
        </motion.div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => (
            <motion.div
              key={item.to}
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              custom={i}
              whileHover={{ x: 4 }}
            >
              <NavLink
                to={item.to}
                end={item.to === "/"}
                onClick={() => setSidebarOpen(false)}
              >
                <motion.span whileHover={{ scale: 1.1 }}>
                  <item.icon size={20} />
                </motion.span>
                {item.label}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <motion.div
          className="sidebar-footer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <motion.button
            onClick={() => {
              localStorage.removeItem("adminToken");
              window.location.href = "/login";
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <LogOut size={20} />
            Logout
          </motion.button>
        </motion.div>
      </motion.aside>

      <div className="main-content">
        <motion.header
          className="top-navbar"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="navbar-left">
            <motion.button
              className="nav-icon-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Menu size={20} />
            </motion.button>
            <h1>
              {navItems.find(
                (item) =>
                  location.pathname === item.to ||
                  (item.to !== "/" && location.pathname.startsWith(item.to))
              )?.label || "Dashboard"}
            </h1>
          </div>
          <div className="navbar-right">
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>
            <motion.button
              className="nav-icon-btn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={20} />
            </motion.button>
            <div className="profile-btn">
              <motion.div
                className="profile-avatar"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                A
              </motion.div>
              <div className="profile-info">
                <span className="profile-name">Admin</span>
                <span className="profile-role">Super Admin</span>
              </div>
            </div>
          </div>
        </motion.header>

        <main className="content">
          <motion.div
            className="breadcrumbs"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <span>Home</span> / <span>{location.pathname.split("/")[1] || "Dashboard"}</span>
          </motion.div>

          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={<div className="skeleton-loader">Loading...</div>}>
              <Outlet />
            </Suspense>
          </motion.div>
        </main>

        <motion.footer
          className="app-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <p>&copy; {new Date().getFullYear()} Bank Pension Management System. All rights reserved.</p>
        </motion.footer>
      </div>
    </>
  );
}

export default function App() {
  const token = localStorage.getItem("adminToken");
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {token ? (
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/pensioners" element={<PensionersPage />} />
          <Route path="/pensioners/new" element={<PensionerFormPage />} />
          <Route path="/pensioners/:id" element={<PensionerDetailPage />} />
          <Route path="/pensioners/:id/edit" element={<PensionerFormPage />} />
          <Route path="/grievances" element={<GrievancesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/jeevan-pramaan" element={<JeevanPramaanPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/pension-details" element={<PensionDetailsPage />} />
          <Route path="/pension-details/new" element={<PensionDetailFormPage />} />
          <Route path="/pension-details/:id/edit" element={<PensionDetailFormPage />} />
          <Route path="/processing" element={<MonthlyProcessingPage />} />
          <Route path="/monthly-pensions" element={<MonthlyPensionsPage />} />
          <Route path="/pension-report" element={<PensionReportPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}
