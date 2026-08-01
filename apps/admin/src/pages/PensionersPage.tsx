import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Users, Edit, Trash2, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../api";
import DataTable, { ColumnDef, FilterOption } from "../components/DataTable";

type Pensioner = {
  id: string;
  employeeId: string;
  name: string;
  mobile: string;
  department?: string;
  designation?: string;
  status: string;
  deletedAt?: string | null;
  pensionDetails?: { pensionAmount: number }[];
};

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "INACTIVE", label: "Inactive" }
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    PENDING: "badge-warning",
    APPROVED: "badge-success",
    REJECTED: "badge-error",
    SUSPENDED: "badge-error",
    INACTIVE: "badge-info"
  };
  return variants[status] || "badge-info";
};

export default function PensionersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["pensioners", search, status, department, page, limit, sortKey, sortDir],
    queryFn: async () =>
      (await api.get("/admin/pensioners", {
        params: { search, status: status || undefined, department: department || undefined, page, limit, sortBy: sortKey || undefined, sortOrder: sortKey ? sortDir : undefined }
      })).data.data
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/pensioners/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pensioners"] })
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/pensioners/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pensioners"] })
  });

  const restore = useMutation({
    mutationFn: async (id: string) => api.patch(`/admin/pensioners/${id}/restore`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pensioners"] })
  });

  const handleSort = (key: string, dir: "asc" | "desc") => {
    setSortKey(key);
    setSortDir(dir);
  };

  const columns: ColumnDef<Pensioner>[] = [
    {
      key: "employeeId",
      label: "Employee ID",
      sortable: true,
      accessor: (row) => (
        <span style={{ fontWeight: 600, color: "var(--text)" }}>{row.employeeId}</span>
      )
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      accessor: (row) => (
        <Link to={`/pensioners/${row.id}`} style={{ color: "var(--accent)", fontWeight: 500 }}>
          {row.name}
        </Link>
      )
    },
    {
      key: "mobile",
      label: "Mobile",
      sortable: true
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
      accessor: (row) => row.department || "-"
    },
    {
      key: "designation",
      label: "Designation",
      sortable: true,
      accessor: (row) => row.designation || "-"
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      accessor: (row) => (
        <span className={`badge ${getStatusBadge(row.status)}`}>
          {row.status}
        </span>
      )
    },
    {
      key: "pensionAmount",
      label: "Current Pension",
      sortable: false,
      accessor: (row) => (
        <span style={{ fontWeight: 600, color: "var(--accent)" }}>
          {row.pensionDetails?.[0] ? `₹${Number(row.pensionDetails[0].pensionAmount).toLocaleString()}` : "-"}
        </span>
      )
    }
  ];

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: statusOptions
    },
    {
      key: "department",
      label: "Department",
      options: []
    }
  ];

  const setFilterValue = (key: string, value: string) => {
    if (key === "status") { setStatus(value); }
    else if (key === "department") { setDepartment(value); }
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
            <Users size={32} className="icon" color="var(--accent)" />
            Pensioners
          </h1>
          <p className="page-subtitle">Manage pensioner records and approvals</p>
        </div>
        <Link to="/pensioners/new">
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Users size={18} />
            Add Pensioner
          </motion.button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <DataTable
          data={query.data?.items || []}
          columns={columns}
          searchPlaceholder="Search name, employee ID, mobile..."
          searchTerm={search}
          onSearch={(value) => { setSearch(value); setPage(1); }}
          searchFields={["name", "employeeId", "mobile"]}
          filters={filters}
          filterValues={{ status, department }}
          setFilterValue={setFilterValue}
          sortKey={sortKey}
          sortDir={sortDir}
          setSort={handleSort}
          enableSorting={true}
          enableSearch={true}
          enableExport={true}
          exportFilename={`pensioners-${new Date().toISOString().slice(0,10)}`}
          paginated={true}
          page={page}
          limit={limit}
          total={query.data?.total || 0}
          setPage={setPage}
          setLimit={setLimit}
          isLoading={query.isLoading || query.isFetching}
          emptyMessage="No pensioners found"
          emptyIcon={<Users size={48} />}
          actions={(item) => (
            <div className="actions">
              <Link to={`/pensioners/${item.id}/edit`}>
                <motion.button className="btn btn-outline btn-sm btn-icon" title="Edit" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Edit size={16} />
                </motion.button>
              </Link>

              {item.deletedAt ? (
                <motion.button
                  className="btn btn-success btn-sm btn-icon"
                  title="Restore"
                  onClick={() => { if (confirm("Restore this pensioner?")) restore.mutate(item.id); }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.span whileHover={{ scale: 1.2 }}>
                    <Check size={16} />
                  </motion.span>
                </motion.button>
              ) : (
                <motion.button
                  className="btn btn-danger btn-sm btn-icon"
                  title="Delete"
                  onClick={() => { if (confirm("Delete this pensioner?")) remove.mutate(item.id); }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={16} />
                </motion.button>
              )}
            </div>
          )}
          rowKey={(item) => item.id}
        />
      </motion.div>
    </motion.div>
  );
}
