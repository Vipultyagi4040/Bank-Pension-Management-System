import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Users, Shield, Clock, MessageSquare,
  FileText, BarChart3, FileBarChart, Bell, AlertCircle, FileCheck,
  TrendingUp, PieChart, Activity
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip, PieChart as RePieChart, Pie, Cell,
  LineChart, Line, Area, AreaChart
} from "recharts";
import { api } from "../api";

const gradientColors = [
  "linear-gradient(135deg, #0c2340 0%, #173763 100%)",
  "linear-gradient(135deg, #1a4f8b 0%, #2962a3 100%)",
  "linear-gradient(135deg, #b9975b 0%, #d4af37 100%)",
  "linear-gradient(135deg, #2c5282 0%, #4a5568 100%)",
  "linear-gradient(135deg, #166534 0%, #16a34a 100%)",
  "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)"
];

const pieColors = ["#0c2340", "#1a4f8b", "#b9975b", "#2c5282", "#166534", "#991b1b"];

export default function DashboardPage() {
  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/admin/dashboard")).data.data,
    staleTime: 60_000
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => (await api.get("/management/dashboard/stats")).data.data,
    staleTime: 60_000
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: async () => (await api.get("/management/reports/summary")).data.data,
    staleTime: 120_000
  });

  const { data: recentPensioners } = useQuery({
    queryKey: ["recentPensioners"],
    queryFn: async () => (await api.get("/admin/pensioners", { params: { limit: 5 } })).data.data,
    staleTime: 60_000
  });

  const { data: recentNotifications } = useQuery({
    queryKey: ["recentNotifications"],
    queryFn: async () => (await api.get("/admin/notifications", { params: { limit: 5 } })).data.data,
    staleTime: 60_000
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: async () => (await api.get("/admin/audit-logs", { params: { limit: 8 } })).data.data,
    staleTime: 30_000
  });

  const isLoading = dashLoading || statsLoading || summaryLoading;

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="cards">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card">
              <div className="card-header">
                <div className="skeleton skeleton-text" style={{ width: "50%" }} />
                <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "var(--radius)" }} />
              </div>
              <div className="skeleton skeleton-text" style={{ width: "70%", height: 32, marginTop: 12 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const gradientCards = [
    {
      label: "Active Pensioners",
      value: dashboard?.approved ?? 0,
      icon: Users,
      gradient: gradientColors[0],
      sub: `${dashboard?.total ?? 0} total registered`
    },
    {
      label: "Pending Approval",
      value: dashboard?.pending ?? 0,
      icon: Clock,
      gradient: gradientColors[2],
      sub: "Awaiting review"
    },
    {
      label: "Monthly Pension",
      value: `₹${(stats?.totalMonthlyPension ?? 0).toLocaleString()}`,
      icon: BarChart3,
      gradient: gradientColors[1],
      sub: `${stats?.currentMonthProcessed ?? 0} processed`
    },
    {
      label: "Total Grievances",
      value: dashboard?.openGrievances ?? 0,
      icon: MessageSquare,
      gradient: gradientColors[3],
      sub: "Open & in-progress"
    },
    {
      label: "Policies",
      value: summary?.policies ?? 0,
      icon: Shield,
      gradient: gradientColors[4],
      sub: "All policies"
    },
    {
      label: "Notifications",
      value: recentNotifications?.total ?? 0,
      icon: Bell,
      gradient: gradientColors[5],
      sub: "Total sent"
    }
  ];

  const quickActions = [
    { label: "Add Pensioner", to: "/pensioners/new", icon: Users, color: "#1a4f8b" },
    { label: "New Pension Detail", to: "/pension-details/new", icon: FileText, color: "#10b981" },
    { label: "Create Notification", to: "/notifications", icon: Bell, color: "#8b5cf6" },
    { label: "Process Monthly", to: "/processing", icon: Clock, color: "#f59e0b" },
    { label: "Reports", to: "/reports", icon: BarChart3, color: "#ef4444" },
    { label: "Import CSV", to: "/import", icon: FileCheck, color: "#3b82f6" }
  ];

  const monthlyTrendData = (stats?.monthlyTrend || []).map((item: any) => ({
    month: item.month,
    amount: Number(item.amount || 0)
  }));

  const grievanceStatusData = summary?.grievances
    ? summary.grievances.map((g: any) => ({
        status: g.status.replace("_", " "),
        count: Number(g._count?._all || 0)
      }))
    : [];

  const pensionCategoryData = monthlyTrendData.length > 0
    ? monthlyTrendData.map((item: any) => ({
        name: item.month,
        value: item.amount
      }))
    : [];

  const processingData = recentActivity?.items
    ? recentActivity.items.map((h: any) => ({
        month: `${h.month || new Date(h.createdAt).getMonth() + 1}/${h.year || new Date(h.createdAt).getFullYear()}`,
        count: h.processedCount || 0
      }))
    : [];

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">
            <LayoutDashboard size={32} className="icon" color="var(--accent)" />
            Dashboard
          </h1>
          <p className="page-subtitle">Bank Pension Management System - Real-time Overview</p>
        </div>
      </div>

      {/* Gradient Statistic Cards */}
      <motion.div
        className="cards"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
        }}
      >
        {gradientCards.map((card, i) => (
          <motion.div
            key={card.label}
            className="card"
            style={{
              background: card.gradient,
              color: "white",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)"
            }}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.98 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="card-header" style={{ borderBottom: "rgba(255,255,255,0.2) solid 1px", paddingBottom: 12, marginBottom: 16 }}>
              <span className="card-title" style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem" }}>
                {card.label}
              </span>
              <motion.div className="card-icon" style={{
                background: "rgba(255,255,255,0.2)",
                color: "white"
              }} whileHover={{ scale: 1.2, rotate: 10 }}>
                {(() => { const Icon = card.icon; return <Icon size={24} />; })()}
              </motion.div>
            </div>
            <div className="card-value" style={{ fontSize: "2rem", fontWeight: 800 }}>{card.value}</div>
            <p style={{ fontSize: "0.8rem", opacity: 0.85, marginTop: 4 }}>{card.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
        }}
      >
        {/* Monthly Pension Trend */}
        <motion.div className="card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3 }} whileHover={{ y: -3 }}>
          <div className="card-header">
            <span className="card-title">Monthly Pension Trend</span>
            <motion.div className="card-icon" whileHover={{ scale: 1.15 }}>
              <TrendingUp size={24} />
            </motion.div>
          </div>
          <div style={{ height: 220, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="pensionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a4f8b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1a4f8b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b1" fontSize={12} />
                <YAxis stroke="#94a3b1" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#1a4f8b"
                  fill="url(#pensionGradient)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Grievance Status */}
        <motion.div className="card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3, delay: 0.1 }} whileHover={{ y: -3 }}>
          <div className="card-header">
            <span className="card-title">Grievance Status</span>
            <motion.div className="card-icon" whileHover={{ scale: 1.15 }}>
              <PieChart size={24} />
            </motion.div>
          </div>
          <div style={{ height: 220, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={grievanceStatusData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {grievanceStatusData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Processing */}
        <motion.div className="card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3, delay: 0.2 }} whileHover={{ y: -3 }}>
          <div className="card-header">
            <span className="card-title">Monthly Processing</span>
            <motion.div className="card-icon" whileHover={{ scale: 1.15 }}>
              <Activity size={24} />
            </motion.div>
          </div>
          <div style={{ height: 220, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b1" fontSize={12} />
                <YAxis stroke="#94a3b1" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Bar dataKey="count" fill="#1a4f8b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pension Category */}
        <motion.div className="card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3, delay: 0.3 }} whileHover={{ y: -3 }}>
          <div className="card-header">
            <span className="card-title">Pension Category</span>
            <motion.div className="card-icon" whileHover={{ scale: 1.15 }}>
              <FileBarChart size={24} />
            </motion.div>
          </div>
          <div style={{ height: 220, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pensionCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b1" fontSize={12} />
                <YAxis stroke="#94a3b1" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions, Recent Pensioners, Notifications, Activity Timeline */}
      <motion.div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: 24 }}
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
        }}
      >
        {/* Quick Actions */}
        <motion.div className="card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3 }} whileHover={{ y: -3 }}>
          <div className="card-header">
            <span className="card-title">Quick Actions</span>
            <motion.div className="card-icon" whileHover={{ scale: 1.15 }}>
              <FileCheck size={24} />
            </motion.div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            {quickActions.map((action, i) => (
              <Link key={action.label} to={action.to}>
                <motion.button
                  className="btn btn-outline"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    borderColor: action.color,
                    color: action.color
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.span whileHover={{ scale: 1.2 }} transition={{ duration: 0.15 }}>
                    <action.icon size={18} />
                  </motion.span>
                  {action.label}
                </motion.button>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Notifications */}
        <motion.div className="card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3 }} whileHover={{ y: -3 }}>
          <div className="card-header">
            <span className="card-title">Recent Notifications</span>
            <motion.div className="card-icon" whileHover={{ scale: 1.15 }}>
              <Bell size={24} />
            </motion.div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            {(recentNotifications?.items || []).slice(0, 5).map((notif: any, i: number) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
                style={{
                  padding: "12px 16px",
                  background: "var(--bg)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border-light)"
                }}
                whileHover={{ x: 4, backgroundColor: "var(--bg-card)" }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>
                  {notif.title}
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4, lineHeight: 1.4 }}>
                  {notif.message.length > 100 ? notif.message.slice(0, 100) + "..." : notif.message}
                </p>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
            {(!recentNotifications?.items || recentNotifications.items.length === 0) && (
              <div className="empty-state" style={{ padding: "32px 12px" }}>
                <Bell size={32} />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Pensioners */}
        <motion.div className="card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3 }} whileHover={{ y: -3 }}>
          <div className="card-header">
            <span className="card-title">Recent Pensioners</span>
            <motion.div className="card-icon" whileHover={{ scale: 1.15 }}>
              <Users size={24} />
            </motion.div>
          </div>
          <div className="table-wrap" style={{ maxHeight: 300, marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Employee ID</th>
                  <th>Mobile</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPensioners?.items?.slice(0, 8).map((item: any, i: number) => (
                  <motion.tr key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.03, duration: 0.2 }}>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>
                      <Link to={`/pensioners/${item.id}`} style={{ color: "var(--accent)" }}>
                        {item.name}
                      </Link>
                    </td>
                    <td>{item.employeeId}</td>
                    <td>{item.mobile}</td>
                    <td>
                      <span className="badge badge-info">{item.status}</span>
                    </td>
                  </motion.tr>
                ))}
                {(!recentPensioners?.items || recentPensioners.items.length === 0) && (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state" style={{ padding: "24px 12px" }}>
                        <Users size={32} />
                        <p>No pensioners found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Activity Timeline */}
        <motion.div className="card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3 }} whileHover={{ y: -3 }}>
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
            <motion.div className="card-icon" whileHover={{ scale: 1.15 }}>
              <Activity size={24} />
            </motion.div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            {(recentActivity?.items || []).slice(0, 8).map((log: any, i: number) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.03, duration: 0.2 }}
                whileHover={{ x: 4, backgroundColor: "var(--bg-card)" }}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "12px 16px",
                  background: "var(--bg)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border-light)"
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    flexShrink: 0
                  }}
                >
                  📊
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text)" }}>
                    {log.action.replace(/_/g, " ")}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {log.entityType} • {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}
            {(!recentActivity?.items || recentActivity.items.length === 0) && (
              <div className="empty-state" style={{ padding: "32px 12px" }}>
                <Activity size={32} />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
