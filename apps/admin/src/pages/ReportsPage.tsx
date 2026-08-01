import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Shield, Users, MessageSquare, FileText, BarChart3, FileDown,
  Calendar, TrendingUp, PieChart as PieIcon, Download, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area
} from "recharts";
import { api } from "../api";
import FormField from "../components/FormField";
import DataTable, { ColumnDef } from "../components/DataTable";
import ToastContainer, { toastStore } from "../components/ToastContainer";

const pieColors = ["#0c2340", "#1a4f8b", "#b9975b", "#2c5282", "#166534", "#991b1b"];

const gradientColors = [
  "linear-gradient(135deg, #0c2340 0%, #173763 100%)",
  "linear-gradient(135deg, #1a4f8b 0%, #2962a3 100%)",
  "linear-gradient(135deg, #b9975b 0%, #d4af37 100%)",
  "linear-gradient(135deg, #2c5282 0%, #4a5568 100%)",
  "linear-gradient(135deg, #166534 0%, #16a34a 100%)",
  "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)"
];

export default function ReportsPage() {
  const client = useQueryClient();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const summary = useQuery({
    queryKey: ["reports"],
    queryFn: async () => (await api.get("/management/reports/summary")).data.data
  });

  const departments = useQuery({
    queryKey: ["reports", "departments"],
    queryFn: async () => (await api.get("/management/reports/departments")).data.data
  });

  const stats = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => (await api.get("/management/dashboard/stats")).data.data
  });

  const downloadCsv = async (type: string) => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/management/reports/export/csv?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toastStore.add({
        type: "success",
        title: "CSV Downloaded",
        message: `${type} report exported successfully.`
      });
    } catch (err: any) {
      toastStore.add({
        type: "error",
        title: "Export Failed",
        message: err.message || "Failed to download CSV"
      });
    }
  };

  const downloadPdf = async (type: string) => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/management/reports/export/pdf?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toastStore.add({
        type: "success",
        title: "PDF Downloaded",
        message: `${type} report exported as PDF.`
      });
    } catch (err: any) {
      toastStore.add({
        type: "error",
        title: "Export Failed",
        message: err.message || "Failed to download PDF"
      });
    }
  };

  if (summary.isLoading || departments.isLoading || stats.isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <BarChart3 size={32} className="icon" color="var(--accent)" />
              Reports & Analytics
            </h1>
            <p className="page-subtitle">View reports and export data</p>
          </div>
        </div>
        <div className="cards">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="skeleton skeleton-text" style={{ width: "50%" }} />
              <div className="skeleton skeleton-text" style={{ width: "70%", height: 32, marginTop: 12 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (summary.error || departments.error) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">
            <BarChart3 size={32} className="icon" color="var(--accent)" />
            Reports & Analytics
          </h1>
        </div>
        <p className="form-error">Failed to load reports data</p>
      </div>
    );
  }

  const sm = summary.data;
  const deptData = departments.data?.departments || [];

  const totalPensioners = sm?.users?.reduce((s: number, u: any) => s + (u._count?._all || 0), 0) || 0;
  const totalLeads = sm?.leads?.reduce((s: number, u: any) => s + (u._count?._all || 0), 0) || 0;
  const openGrievances = sm?.grievances?.find((g: any) => g.status === "OPEN")?._count?._all || 0;
  const resolvedGrievances = sm?.grievances?.find((g: any) => g.status === "RESOLVED")?._count?._all || 0;
  const totalPolicies = sm?.policies || 0;
  const totalDisbursed = Number(sm?.totalPensionDisbursed || 0);
  const totalGross = Number(sm?.totalGrossPension || 0);

  const monthlyData = (sm?.monthlyPensions || []).map((item: any) => ({
    name: `${item.month?.toString().padStart(2, "0") || "?"}/${item.year}`,
    gross: Number(item._sum?.grossAmount || 0),
    net: Number(item._sum?.netAmount || 0)
  }));

  const trendData = (stats.data?.monthlyTrend || []).map((item: any) => ({
    month: item.month,
    amount: Number(item.amount || 0)
  }));

  const grievanceStatusData = (sm?.grievances || []).map((g: any) => ({
    status: g.status.replace("_", " "),
    count: Number(g._count?._all || 0)
  }));

  const statCards = [
    { label: "Total Pensioners", value: totalPensioners, icon: Users, gradient: gradientColors[0], sub: "Registered users" },
    { label: "Total Leads", value: totalLeads, icon: Users, gradient: gradientColors[1], sub: "Generated leads" },
    { label: "Open Grievances", value: openGrievances, icon: MessageSquare, gradient: gradientColors[2], sub: "Pending resolution" },
    { label: "Policies", value: totalPolicies, icon: Shield, gradient: gradientColors[3], sub: "Active policies" },
    { label: "Total Disbursed", value: `₹${totalDisbursed.toLocaleString()}`, icon: BarChart3, gradient: gradientColors[4], sub: "Lifetime payments" },
    { label: "Total Gross", value: `₹${totalGross.toLocaleString()}`, icon: FileText, gradient: gradientColors[5], sub: "Gross pension" }
  ];

  const deptColumns: ColumnDef<any>[] = [
    {
      key: "department",
      label: "Department",
      sortable: true,
      accessor: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={16} color="var(--accent)" />
          <span style={{ fontWeight: 600 }}>{row.department || "-"}</span>
        </div>
      )
    },
    {
      key: "_count._all",
      label: "Pensioners",
      sortable: true,
      accessor: (row) => (
        <span style={{ fontWeight: 600, color: "var(--accent)" }}>{row._count?._all || 0}</span>
      )
    }
  ];

  const exportButtons = [
    { label: "Pensioners CSV", icon: FileDown, onClick: () => downloadCsv("pensioners") },
    { label: "Monthly CSV", icon: FileDown, onClick: () => downloadCsv("monthly") },
    { label: "Grievances CSV", icon: FileDown, onClick: () => downloadCsv("grievances") },
    { label: "Pensioners PDF", icon: FileText, onClick: () => downloadPdf("pensioners") },
    { label: "Monthly PDF", icon: FileText, onClick: () => downloadPdf("monthly") },
    { label: "Grievances PDF", icon: FileText, onClick: () => downloadPdf("grievances") }
  ];

  return (
    <motion.div
      className="animate-fade-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ToastContainer />

      <motion.div
        className="page-header"
        style={{ marginBottom: 28 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div>
          <h1 className="page-title">
            <BarChart3 size={32} className="icon" color="var(--accent)" />
            Reports & Analytics
          </h1>
          <p className="page-subtitle">Comprehensive analytics and reporting dashboard</p>
        </div>
      </motion.div>

      {/* Date Filters */}
      <motion.div
        className="card"
        style={{ marginBottom: 24 }}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        whileHover={{ y: -2 }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Date Range Filter</h3>
        <div className="form-row">
          <FormField
            label="From Date"
            name="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            icon={<Calendar size={18} />}
            placeholder="Select start date"
          />
          <FormField
            label="To Date"
            name="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            icon={<Calendar size={18} />}
            placeholder="Select end date"
          />
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="cards"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
        }}
      >
        {statCards.map((card) => (
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
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="card-header" style={{ borderBottom: "rgba(255,255,255,0.2) solid 1px", paddingBottom: 12, marginBottom: 16 }}>
              <span className="card-title" style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem" }}>
                {card.label}
              </span>
              <motion.div className="card-icon" style={{ background: "rgba(255,255,255,0.2)", color: "white" }} whileHover={{ scale: 1.2, rotate: 10 }}>
                {(() => { const Icon = card.icon; return <Icon size={24} />; })()}
              </motion.div>
            </div>
            <div className="card-value" style={{ fontSize: "2rem", fontWeight: 800 }}>{card.value}</div>
            <p style={{ fontSize: "0.8rem", opacity: 0.85, marginTop: 4 }}>{card.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 28 }}
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
        }}
      >
        {/* Monthly Pension Bar Chart */}
        <motion.div className="card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3 }} whileHover={{ y: -3 }}>
          <div className="card-header">
            <span className="card-title">Monthly Pension Disbursement</span>
            <motion.div className="card-icon" whileHover={{ scale: 1.15 }}>
              <BarChart3 size={24} />
            </motion.div>
          </div>
          <div style={{ height: 260, marginTop: 8 }}>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "var(--radius)"
                    }}
                  />
                  <Bar dataKey="gross" fill="#1a4f8b" radius={[6, 6, 0, 0]} name="Gross" />
                  <Bar dataKey="net" fill="#10b981" radius={[6, 6, 0, 0]} name="Net" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: "100%", padding: "20px 12px" }}>
                <BarChart3 size={48} />
                <p>No monthly data available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Grievance Status Pie Chart */}
        <motion.div className="card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3, delay: 0.1 }} whileHover={{ y: -3 }}>
          <div className="card-header">
            <span className="card-title">Grievance Breakdown</span>
            <motion.div className="card-icon" whileHover={{ scale: 1.15 }}>
              <PieIcon size={24} />
            </motion.div>
          </div>
          <div style={{ height: 260, marginTop: 8 }}>
            {grievanceStatusData.length > 0 && grievanceStatusData.some((g: any) => g.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={grievanceStatusData.filter((g: any) => g.count > 0)}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {grievanceStatusData.map((_g: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: "100%", padding: "20px 12px" }}>
                <MessageSquare size={48} />
                <p>No grievance data available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pension Trend Area Chart */}
        <motion.div className="card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3, delay: 0.2 }} whileHover={{ y: -3 }}>
          <div className="card-header">
            <span className="card-title">Pension Trend (Last 6 Months)</span>
            <motion.div className="card-icon" whileHover={{ scale: 1.15 }}>
              <TrendingUp size={24} />
            </motion.div>
          </div>
          <div style={{ height: 260, marginTop: 8 }}>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="reportTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a4f8b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1a4f8b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
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
                    fill="url(#reportTrendGradient)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: "100%", padding: "20px 12px" }}>
                <TrendingUp size={48} />
                <p>No trend data available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div className="card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3, delay: 0.3 }} whileHover={{ y: -3 }}>
          <div className="card-header">
            <span className="card-title">Payment Overview</span>
            <motion.div className="card-icon" whileHover={{ scale: 1.15 }}>
              <Clock size={24} />
            </motion.div>
          </div>
          <div style={{ display: "grid", gap: 16, marginTop: 8 }}>
            <motion.div whileHover={{ x: 4 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Paid</span>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}>
                ₹{Number(stats.data?.totalPaid || 0).toLocaleString()}
              </p>
            </motion.div>
            <motion.div whileHover={{ x: 4 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Pending Payments</span>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f59e0b" }}>
                ₹{Number(stats.data?.pendingPayments || 0).toLocaleString()}
              </p>
            </motion.div>
            <motion.div whileHover={{ x: 4 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Current Month Processed</span>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#10b981" }}>
                {stats.data?.currentMonthProcessed || 0}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Export Reports */}
      <motion.div
        className="card"
        style={{ marginTop: 28 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.45 }}
        whileHover={{ y: -2 }}
      >
        <div className="card-header">
          <span className="card-title">Export Reports</span>
          <motion.div className="card-icon" whileHover={{ scale: 1.15 }}>
            <Download size={24} />
          </motion.div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          {exportButtons.map((btn, i) => (
            <motion.button
              key={btn.label}
              className={`btn btn-sm ${btn.label.includes("PDF") ? "btn-primary" : "btn-secondary"}`}
              onClick={btn.onClick}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span whileHover={{ scale: 1.2 }} transition={{ duration: 0.15 }}>
                <btn.icon size={14} />
              </motion.span>
              {btn.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Department Breakdown */}
      <motion.div
        className="card"
        style={{ marginTop: 28 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.55 }}
        whileHover={{ y: -2 }}
      >
        <div className="card-header">
          <span className="card-title">Department-wise Breakdown</span>
          <motion.div className="card-icon" whileHover={{ scale: 1.15 }}>
            <Users size={24} />
          </motion.div>
        </div>
        <div style={{ marginTop: 12 }}>
          <DataTable
            data={deptData}
            columns={deptColumns}
            enableSearch={true}
            searchFields={["department"]}
            searchPlaceholder="Search department..."
            enableSorting={true}
            enableExport={true}
            exportFilename={`departments-${new Date().toISOString().slice(0, 10)}`}
            paginated={false}
            isLoading={departments.isLoading}
            emptyMessage="No departments found"
            emptyIcon={<Users size={48} />}
            rowKey={(item, i) => `${item.department}-${i}`}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
