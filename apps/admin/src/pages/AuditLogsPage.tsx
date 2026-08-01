import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../api";
import DataTable, { ColumnDef, FilterOption } from "../components/DataTable";

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  createdAt: string;
  admin?: { name: string; email: string; role: string };
};

const actionOptions = [
  { value: "PENSIONER_CREATED", label: "Pensioner Created" },
  { value: "PENSIONER_UPDATED", label: "Pensioner Updated" },
  { value: "PENSIONER_DELETED", label: "Pensioner Deleted" },
  { value: "PENSIONER_RESTORED", label: "Pensioner Restored" },
  { value: "NOTIFICATION_CREATED", label: "Notification Created" },
  { value: "POLICY_CREATED", label: "Policy Created" },
  { value: "POLICY_UPDATED", label: "Policy Updated" },
  { value: "POLICY_DELETED", label: "Policy Deleted" }
];

const entityOptions = [
  { value: "Pensioner", label: "Pensioner" },
  { value: "Notification", label: "Notification" },
  { value: "Policy", label: "Policy" },
  { value: "Grievance", label: "Grievance" },
  { value: "MonthlyPension", label: "Monthly Pension" },
  { value: "PensionDetail", label: "Pension Detail" }
];

const getStatusBadge = (action: string) => {
  const variants: Record<string, string> = {
    PENSIONER_CREATED: "badge-success",
    PENSIONER_UPDATED: "badge-info",
    PENSIONER_DELETED: "badge-error",
    PENSIONER_RESTORED: "badge-success",
    NOTIFICATION_CREATED: "badge-success",
    POLICY_CREATED: "badge-success",
    POLICY_UPDATED: "badge-info",
    POLICY_DELETED: "badge-error"
  };
  return variants[action] || "badge-info";
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const query = useQuery({
    queryKey: ["auditLogs", search, action, entityType, startDate, endDate, page, limit],
    queryFn: async () =>
      (await api.get("/admin/audit-logs", {
        params: {
          action: action || undefined,
          entityType: entityType || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page,
          limit
        }
      })).data.data
  });

  const handleSort = (key: string, dir: "asc" | "desc") => {
    setSortKey(key);
    setSortDir(dir);
  };

  const setFilterValue = (key: string, value: string) => {
    if (key === "action") setAction(value);
    else if (key === "entityType") setEntityType(value);
    setPage(1);
  };

  const filters: FilterOption[] = [
    { key: "action", label: "Action", options: actionOptions },
    { key: "entityType", label: "Entity Type", options: entityOptions }
  ];

  const columns: ColumnDef<AuditLog>[] = [
    {
      key: "createdAt",
      label: "Time",
      sortable: true,
      accessor: (row) => new Date(row.createdAt).toLocaleString(),
      width: 180
    },
    {
      key: "admin",
      label: "Admin",
      sortable: false,
      accessor: (row) => row.admin?.name || "-",
      width: 140
    },
    {
      key: "action",
      label: "Action",
      sortable: true,
      accessor: (row) => (
        <span className={`badge ${getStatusBadge(row.action)}`}>
          {row.action.replace(/_/g, " ")}
        </span>
      )
    },
    {
      key: "entityType",
      label: "Entity",
      sortable: true,
      accessor: (row) => row.entityType || "-"
    },
    {
      key: "entityId",
      label: "Entity ID",
      sortable: true,
      accessor: (row) => row.entityId || "-"
    },
    {
      key: "ipAddress",
      label: "IP Address",
      sortable: true,
      accessor: (row) => row.ipAddress || "-"
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
            <Shield size={32} className="icon" color="var(--accent)" />
            Audit Logs
          </h1>
          <p className="page-subtitle">Track system activities and changes</p>
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
          searchPlaceholder="Search by action, entity, admin..."
          searchTerm={search}
          onSearch={(value) => { setSearch(value); setPage(1); }}
          searchFields={["action", "entityType", "entityId", "admin"]}
          filters={filters}
          filterValues={{ action, entityType }}
          setFilterValue={setFilterValue}
          sortKey={sortKey}
          sortDir={sortDir}
          setSort={handleSort}
          enableSorting={false}
          enableSearch={true}
          enableExport={true}
          exportFilename={`audit-logs-${new Date().toISOString().slice(0,10)}`}
          paginated={true}
          page={page}
          limit={limit}
          total={query.data?.total || 0}
          setPage={setPage}
          setLimit={setLimit}
          isLoading={query.isLoading || query.isFetching}
          emptyMessage="No audit logs found"
          emptyIcon={<Shield size={48} />}
          rowKey={(item) => item.id}
        />
      </motion.div>
    </motion.div>
  );
}
