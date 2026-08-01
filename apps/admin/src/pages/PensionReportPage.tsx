import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../api";
import DataTable, { ColumnDef } from "../components/DataTable";

type DashboardStats = {
  totalPensioners: number;
  totalMonthlyPension: number;
  totalPaid: number;
  pendingPayments: number;
  currentMonthProcessed: number;
  monthlyTrend: Array<{ month: string; amount: number }>;
};

type ReportSummary = {
  monthlyPensions: Array<{ month: number; year: number; _sum: { grossAmount: number; netAmount: number } }>;
};

export default function PensionReportPage() {
  const stats = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => (await api.get("/management/dashboard/stats")).data.data
  });

  const summary = useQuery({
    queryKey: ["reportSummary"],
    queryFn: async () => (await api.get("/management/reports/summary")).data.data
  });

  if (stats.isLoading || summary.isLoading) return <p>Loading...</p>;

  const s = stats.data as DashboardStats | undefined;
  const sm = summary.data as ReportSummary | undefined;

  const rows = [
    ["Total Approved Pensioners", s?.totalPensioners],
    ["Total Monthly Pension", s?.totalMonthlyPension],
    ["Total Paid", s?.totalPaid],
    ["Pending Payments", s?.pendingPayments],
    ["Current Month Processed", s?.currentMonthProcessed],
    ["Monthly Trend", s?.monthlyTrend?.length ? `${s.monthlyTrend.length} months` : "-"]
  ];

  const monthlyTrendColumns: ColumnDef<any>[] = [
    { key: "month", label: "Month", sortable: true },
    {
      key: "amount",
      label: "Pension Amount",
      sortable: true,
      accessor: (row) => `₹${Number(row.amount).toLocaleString()}`
    }
  ];

  const monthlyHistoryColumns: ColumnDef<any>[] = [
    { key: "month", label: "Month", sortable: true },
    { key: "year", label: "Year", sortable: true },
    {
      key: "_sum.grossAmount",
      label: "Gross",
      sortable: false,
      accessor: (row) => `₹${Number(row._sum?.grossAmount || 0).toLocaleString()}`
    },
    {
      key: "_sum.netAmount",
      label: "Net",
      sortable: false,
      accessor: (row) => `₹${Number(row._sum?.netAmount || 0).toLocaleString()}`
    }
  ];

  return (
    <motion.div
      className="animate-fade-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div>
          <h1 className="page-title">
          <BarChart3 size={32} className="icon" color="var(--accent)" />
          Pension Expense Report
        </h1>
          <p className="page-subtitle">Overview of pension expenses and trends</p>
        </div>
      </motion.div>

      <motion.div
        className="cards"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } }
        }}
      >
        {rows.map(([label, value]) => (
          <motion.div
            key={String(label)}
            className="stat-card"
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.98 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -3, scale: 1.03 }}
          >
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value != null ? (typeof value === "number" ? `₹${Number(value).toLocaleString()}` : String(value)) : "-"}</div>
          </motion.div>
        ))}
      </motion.div>
      {s?.monthlyTrend && s.monthlyTrend.length > 0 && (
        <motion.div
          className="card"
          style={{ marginTop: 28 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ y: -2 }}
        >
          <h3 style={{ marginTop: 0 }}>Monthly Breakdown</h3>
          <DataTable
            data={s.monthlyTrend}
            columns={monthlyTrendColumns}
            enableSearch={true}
            searchFields={["month"]}
            searchPlaceholder="Search month..."
            enableSorting={true}
            enableExport={true}
            exportFilename={`monthly-trend-${new Date().toISOString().slice(0,10)}`}
            paginated={false}
            isLoading={false}
            emptyMessage="No monthly data"
            emptyIcon={<TrendingUp size={48} />}
            rowKey={(item, i) => `${item.month}-${i}`}
          />
        </motion.div>
      )}
      {sm?.monthlyPensions && sm.monthlyPensions.length > 0 && (
        <motion.div
          className="card"
          style={{ marginTop: 28 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ y: -2 }}
        >
          <h3 style={{ marginTop: 0 }}>Monthly Pension History</h3>
          <DataTable
            data={sm.monthlyPensions}
            columns={monthlyHistoryColumns}
            enableSearch={true}
            searchFields={["month", "year"]}
            searchPlaceholder="Search..."
            enableSorting={true}
            enableExport={true}
            exportFilename={`pension-history-${new Date().toISOString().slice(0,10)}`}
            paginated={false}
            isLoading={false}
            emptyMessage="No pension history"
            emptyIcon={<Calendar size={48} />}
            rowKey={(item, i) => `${item.month}-${item.year}-${i}`}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
