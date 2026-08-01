import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileBarChart, Download, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../api";
import DataTable, { ColumnDef, FilterOption } from "../components/DataTable";

export default function MonthlyPensionsPage() {
  const [month, setMonth] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const query = useQuery({
    queryKey: ["monthly-pensions", month, year, status, page, limit, sortKey, sortDir],
    queryFn: async () =>
      (await api.get("/management/monthly-pensions", {
        params: {
          month: month || undefined,
          year: year || undefined,
          status: status || undefined,
          page,
          limit,
          sortBy: sortKey || undefined,
          sortOrder: sortKey ? sortDir : undefined
        }
      })).data.data
  });

  const handleSort = (key: string, dir: "asc" | "desc") => {
    setSortKey(key);
    setSortDir(dir);
  };

  const handleDownload = async (id: string) => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/management/monthly-pensions/${id}/slip`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pension-slip-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to download slip");
    }
  };

  const getStatusBadge = (s: string) => {
    const variants: Record<string, string> = {
      PENDING: "badge-warning",
      PROCESSED: "badge-info",
      PAID: "badge-success",
      FAILED: "badge-error"
    };
    return variants[s] || "badge-info";
  };

  const columns: ColumnDef<any>[] = [
    { key: "month", label: "Month", sortable: true, accessor: (row) => `${row.month}/${row.year}` },
    { key: "pensioner.employeeId", label: "Employee ID", sortable: true, accessor: (row) => row.pensioner?.employeeId || "-" },
    { key: "pensioner.name", label: "Name", sortable: true, accessor: (row) => row.pensioner?.name || "-" },
    { key: "basicPension", label: "Basic", sortable: true, accessor: (row) => `₹${row.basicPension}` },
    { key: "da", label: "DA", sortable: true, accessor: (row) => `₹${row.da}` },
    { key: "hra", label: "HRA", sortable: true, accessor: (row) => `₹${row.hra}` },
    { key: "medicalAllowance", label: "Medical", sortable: true, accessor: (row) => `₹${row.medicalAllowance}` },
    { key: "otherAllowances", label: "Other", sortable: true, accessor: (row) => `₹${row.otherAllowances}` },
    { key: "grossAmount", label: "Gross", sortable: true, accessor: (row) => `₹${row.grossAmount}` },
    { key: "deductions", label: "Deductions", sortable: true, accessor: (row) => <span style={{ color: "#e53e3e" }}>₹{row.deductions}</span> },
    { key: "netAmount", label: "Net", sortable: true, accessor: (row) => <span style={{ fontWeight: 700, color: "#22543d" }}>₹{row.netAmount}</span> },
    {
      key: "status",
      label: "Status",
      sortable: true,
      accessor: (row) => (
        <span className={`badge ${getStatusBadge(row.status)}`}>
          {row.status}
        </span>
      )
    }
  ];

  const filters: FilterOption[] = [
    {
      key: "month",
      label: "Month",
      options: Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: new Date(2024, i, 1).toLocaleString("en-US", { month: "long" })
      }))
    },
    {
      key: "year",
      label: "Year",
      options: Array.from({ length: 10 }, (_, i) => {
        const y = new Date().getFullYear() - i;
        return { value: String(y), label: String(y) };
      })
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "PENDING", label: "Pending" },
        { value: "PROCESSED", label: "Processed" },
        { value: "PAID", label: "Paid" },
        { value: "FAILED", label: "Failed" }
      ]
    }
  ];

  const setFilterValue = (key: string, value: string) => {
    if (key === "month") setMonth(value ? Number(value) : "");
    else if (key === "year") setYear(value ? Number(value) : "");
    else if (key === "status") setStatus(value);
    setPage(1);
  };

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
            <FileBarChart size={32} className="icon" color="var(--accent)" />
            Monthly Pensions
          </h1>
          <p className="page-subtitle">View and manage monthly pension records</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <DataTable
          data={query.data?.items || []}
          columns={columns}
          searchPlaceholder="Search name, employee ID..."
          searchTerm={status}
          onSearch={(v) => { setMonth(""); setYear(""); setStatus(""); }}
          searchFields={["pensioner.name", "pensioner.employeeId"]}
          filters={filters}
          filterValues={{
            month: month ? String(month) : "",
            year: year ? String(year) : "",
            status
          }}
          setFilterValue={setFilterValue}
          sortKey={sortKey}
          sortDir={sortDir}
          setSort={handleSort}
          enableSorting={true}
          enableSearch={true}
          enableExport={true}
          exportFilename={`monthly-pensions-${new Date().toISOString().slice(0,10)}`}
          paginated={true}
          page={page}
          limit={limit}
          total={query.data?.total || 0}
          setPage={setPage}
          setLimit={setLimit}
          isLoading={query.isLoading || query.isFetching}
          emptyMessage="No pension records found"
          emptyIcon={<FileBarChart size={48} />}
          actions={(item) => (
            <div className="actions">
              {item.status !== "PAID" && (
                <motion.button
                  className="btn btn-success btn-sm"
                  onClick={() => { if (confirm("Mark this pension as paid?")) api.patch(`/management/monthly-pensions/${item.id}/paid`).then(() => query.refetch()).catch(() => alert("Failed to update status")); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Mark as Paid
                </motion.button>
              )}
              <motion.button
                className="btn btn-secondary btn-sm"
                onClick={() => handleDownload(item.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={14} />
                Download Slip
              </motion.button>
            </div>
          )}
          rowKey={(item) => item.id}
        />
      </motion.div>
    </motion.div>
  );
}
