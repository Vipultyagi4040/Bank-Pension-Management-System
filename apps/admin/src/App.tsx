import {
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
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

function ProtectedLayout() {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Pension Admin</h2>

        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/pensioners">Pensioners</NavLink>
        <NavLink to="/grievances">Grievances</NavLink>
        <NavLink to="/notifications">Notifications</NavLink>
        <NavLink to="/policies">Policies</NavLink>
        <NavLink to="/jeevan-pramaan">Jeevan Pramaan</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/import">Bulk Upload</NavLink>
        <NavLink to="/pension-details">Pension Details</NavLink>
        <NavLink to="/processing">Monthly Processing</NavLink>
        <NavLink to="/monthly-pensions">Monthly Pensions</NavLink>
        <NavLink to="/pension-report">Pension Report</NavLink>
        <NavLink to="/audit-logs">Audit Logs</NavLink>

        <button
          className="secondary"
          style={{ marginTop: 20, width: "100%" }}
          onClick={() => {
            localStorage.removeItem("adminToken");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
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
