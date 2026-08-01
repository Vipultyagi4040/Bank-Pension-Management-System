import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../api";
import FormField from "../components/FormField";
import DataTable, { ColumnDef } from "../components/DataTable";

export default function MonthlyProcessingPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const queryClient = useQueryClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const processMutation = useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) =>
      (await api.post("/management/process-monthly", { month, year })).data,
    onSuccess: () => {
      setMessage({ type: "success", text: "Monthly pension processed successfully!" });
      queryClient.invalidateQueries({ queryKey: ["processing-history"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-pensions"] });
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err.response?.data?.message || "Processing failed" });
    }
  });

  const { data: historyData } = useQuery({
    queryKey: ["processing-history", page, limit],
    queryFn: async () => (await api.get("/management/processing-history", { params: { page, limit } })).data.data
  });

  function handleProcess() {
    setMessage(null);
    processMutation.mutate({ month: selectedMonth, year: selectedYear });
  }

  const columns: ColumnDef<any>[] = [
    { key: "id", label: "ID", sortable: true, accessor: (row) => <span style={{ fontWeight: 500 }}>{row.id}</span> },
    { key: "month", label: "Month", sortable: true },
    { key: "year", label: "Year", sortable: true },
    {
      key: "processedAt",
      label: "Processed At",
      sortable: true,
      accessor: (row) => row.processedAt ? new Date(row.processedAt).toLocaleString().slice(0, 19).replace("T", " ") : "-"
    },
    {
      key: "processedBy",
      label: "Processed By",
      sortable: true,
      accessor: (row) => row.processedBy?.name || "-"
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      accessor: (row) => (
        <span className={`badge ${row.status === "SUCCESS" ? "badge-success" : "badge-error"}`}>
          {row.status}
        </span>
      )
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
            <Clock size={32} className="icon" color="var(--accent)" />
            Monthly Pension Processing
          </h1>
          <p className="page-subtitle">Process monthly pension payments</p>
        </div>
      </motion.div>

      {message && (
        <motion.div
          className={message.type === "success" ? "badge badge-success" : "form-error"}
          style={{ marginBottom: 16, padding: "12px 16px" }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {message.text}
        </motion.div>
      )}

      <motion.div
        className="form-card"
        style={{ marginBottom: 24 }}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        whileHover={{ y: -2 }}
      >
        <h3 style={{ marginTop: 0 }}>Process Monthly Pension</h3>
        <p style={{ color: "var(--text-muted)", marginTop: -8, marginBottom: 16 }}>
          Current month/year: <b>{currentMonth}/{currentYear}</b>
        </p>
        <div className="form-row">
          <FormField
            label="Month"
            name="month"
            type="select"
            options={Array.from({ length: 12 }, (_, i) => {
              const m = i + 1;
              const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
              return { value: String(m), label: `${m} - ${monthNames[i]}` };
            })}
            value={String(selectedMonth)}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            icon={<Calendar size={18} />}
            placeholder="Select"
            required
          />
          <FormField
            label="Year"
            name="year"
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            icon={<Calendar size={18} />}
            placeholder="e.g. 2025"
            min={2000}
            max={2100}
            required
          />
        </div>

        <motion.div className="form-actions" style={{ marginTop: 24, padding: 0, border: "none" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            className={`btn btn-primary ${processMutation.isPending ? "btn-loading" : ""}`}
            onClick={handleProcess}
            disabled={processMutation.isPending}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="btn-text">
              {processMutation.isPending ? "Processing..." : "Process Monthly Pension"}
            </span>
              <span className="btn-spinner">
                <div style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} />
              </span>
            </motion.button>
            {processMutation.isPending && (
              <motion.p
                style={{ color: "var(--text-muted)", marginTop: 8 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Processing, please wait...
              </motion.p>
            )}
        </motion.div>
      </motion.div>

        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h3 style={{ marginTop: 0 }}>Processing History</h3>
          <DataTable
            data={historyData?.items || []}
            columns={columns}
            enableSearch={true}
            searchFields={["id", "status", "processedBy.name"]}
            searchPlaceholder="Search..."
            enableSorting={true}
            enableExport={true}
            exportFilename={`processing-history-${new Date().toISOString().slice(0,10)}`}
            paginated={true}
            page={page}
            limit={limit}
            total={historyData?.total || 0}
            setPage={setPage}
            setLimit={setLimit}
            isLoading={historyData ? false : true}
            emptyMessage="No processing history found"
            emptyIcon={<Clock size={48} />}
            rowKey={(item) => item.id}
          />
        </motion.div>
      </motion.div>
  );
}
