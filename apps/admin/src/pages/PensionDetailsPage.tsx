import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FileText, Edit, Trash2, Search } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../api";
import DataTable, { ColumnDef } from "../components/DataTable";

export default function PensionDetailsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["pension-details", search, status, page, limit],
    queryFn: async () =>
      (await api.get("/management/pension-details", {
        params: { search, status: status || undefined, page, limit }
      })).data.data
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/management/pension-details/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pension-details"] })
  });

  const handleSort = (key: string, dir: "asc" | "desc") => {
    setSortKey(key);
    setSortDir(dir);
  };

  const columns: ColumnDef<any>[] = [
    { key: "ppoNumber", label: "PPO Number", sortable: true, accessor: (row) => <span style={{ fontWeight: 600 }}>{row.ppoNumber}</span> },
    { key: "pensioner", label: "Pensioner Name", sortable: true, accessor: (row) => row.pensioner?.name || "-" },
    { key: "pensionType", label: "Type", sortable: true, accessor: (row) => row.pensionType || "-" },
    { key: "basicPension", label: "Basic Pension", sortable: true, accessor: (row) => `₹${row.basicPension}` },
    { key: "da", label: "DA", sortable: false, accessor: (row) => `₹${row.da}` },
    { key: "hra", label: "HRA", sortable: false, accessor: (row) => `₹${row.hra}` },
    { key: "medicalAllowance", label: "Medical", sortable: false, accessor: (row) => `₹${row.medicalAllowance}` },
    { key: "otherAllowances", label: "Other", sortable: false, accessor: (row) => `₹${row.otherAllowances}` },
    { key: "deductions", label: "Deductions", sortable: false, accessor: (row) => `₹${row.deductions}` },
    { key: "pensionAmount", label: "Total Pension", sortable: true, accessor: (row) => <span style={{ fontWeight: 700, color: "#22543d" }}>₹{row.pensionAmount}</span> },
    { key: "effectiveFrom", label: "Effective From", sortable: true, accessor: (row) => row.effectiveFrom?.slice(0, 10) || "-" },
    {
      key: "status",
      label: "Status",
      sortable: true,
      accessor: (row) => <span className="badge badge-info">{row.status}</span>
    }
  ];

  const statusFilters = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "EXPIRED", label: "Expired" },
    { value: "SUSPENDED", label: "Suspended" }
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
            <FileText size={32} className="icon" color="var(--accent)" />
            Pension Details
          </h1>
          <p className="page-subtitle">Manage pension detail records</p>
        </div>
        <Link to="/pension-details/new">
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <FileText size={18} />
            Add Pension Detail
          </motion.button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <DataTable
          data={query.data?.items || []}
          columns={columns}
          searchPlaceholder="Search PPO Number..."
          searchTerm={search}
          onSearch={(value) => { setSearch(value); setPage(1); }}
          searchFields={["ppoNumber", "pensioner.name"]}
          filters={[{ key: "status", label: "Status", options: statusFilters }]}
          filterValues={{ status }}
          setFilterValue={(key, value) => { setStatus(value); setPage(1); }}
          sortKey={sortKey}
          sortDir={sortDir}
          setSort={handleSort}
          enableSorting={true}
          enableSearch={true}
          enableExport={true}
          exportFilename={`pension-details-${new Date().toISOString().slice(0,10)}`}
          paginated={true}
          page={page}
          limit={limit}
          total={query.data?.total || 0}
          setPage={setPage}
          setLimit={setLimit}
          isLoading={query.isLoading || query.isFetching}
          emptyMessage="No pension details found"
          emptyIcon={<FileText size={48} />}
          actions={(item) => (
            <div className="actions">
              <Link to={`/pension-details/${item.id}/edit`}>
                <motion.button className="btn btn-secondary btn-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Edit
                </motion.button>
              </Link>
              <motion.button
                className="btn btn-danger btn-sm"
                onClick={() => { if (confirm("Delete this record?")) remove.mutate(item.id); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Delete
              </motion.button>
            </div>
          )}
          rowKey={(item) => item.id}
        />
      </motion.div>
    </motion.div>
  );
}
