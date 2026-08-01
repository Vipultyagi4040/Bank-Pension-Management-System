import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, X, Paperclip, Send, Search, ClipboardEdit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api";
import FormField from "../components/FormField";
import DataTable, { ColumnDef, FilterOption } from "../components/DataTable";

type Grievance = {
  id: string;
  subject: string;
  description: string;
  status: string;
  adminReply: string;
  assignedTo: string;
  createdAt: string;
  pensioner: { name: string; employeeId: string; mobile: string };
  attachments: { id: string; filename: string; url: string }[];
  history: { id: string; action: string; fromStatus: string; toStatus: string; note: string; performedAt: string }[];
};

const statusOptions = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" }
];

const getStatusBadge = (s: string) => {
  const variants: Record<string, string> = {
    OPEN: "badge-error",
    IN_PROGRESS: "badge-warning",
    RESOLVED: "badge-success",
    CLOSED: "badge-info"
  };
  return variants[s] || "badge-info";
};

export default function GrievancesPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Grievance | null>(null);
  const [reply, setReply] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ["grievances", status, search, page],
    queryFn: async () => (await api.get("/admin/grievances", {
      params: { status: status || undefined, search: search || undefined, page, limit }
    })).data.data
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => api.patch(`/admin/grievances/${id}`, data).then(r => r.data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["grievances"] });
      if (selected) {
        api.get(`/admin/grievances/${selected.id}`).then(r => setSelected(r.data.data));
      }
    }
  });

  const attachMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => api.post(`/admin/grievances/${id}/attachments`, data).then(r => r.data),
    onSuccess: () => {
      if (selected) {
        api.get(`/admin/grievances/${selected.id}`).then(r => setSelected(r.data.data));
      }
    }
  });

  function handleUpdate() {
    if (!selected) return;
    if (!confirm("Update grievance status and reply?")) return;
    updateMutation.mutate({
      id: selected.id,
      data: { status: newStatus || undefined, adminReply: reply || undefined }
    });
    setReply("");
    setNewStatus("");
  }

  function handleAttach() {
    if (!selected) return;
    const url = prompt("Attachment URL:");
    if (!url) return;
    const filename = prompt("Filename:") || "attachment";
    attachMutation.mutate({
      id: selected.id,
      data: { filename, url, contentType: "application/pdf", size: 0 }
    });
  }

  const handleSort = (key: string, dir: "asc" | "desc") => {
    setSortKey(key);
    setSortDir(dir);
  };

  const handleStatusFilter = (key: string, value: string) => {
    setStatus(value);
    setPage(1);
  };

  const filters: FilterOption[] = [
    { key: "status", label: "Status", options: statusOptions }
  ];

  const columns: ColumnDef<Grievance>[] = [
    {
      key: "pensioner",
      label: "Pensioner",
      sortable: true,
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--text)" }}>{row.pensioner?.name}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{row.pensioner?.employeeId}</div>
        </div>
      )
    },
    {
      key: "subject",
      label: "Subject",
      sortable: true
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      accessor: (row) => (
        <span className={`badge ${getStatusBadge(row.status)}`}>
          {row.status.replace("_", " ")}
        </span>
      )
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      accessor: (row) => new Date(row.createdAt).toLocaleDateString()
    }
  ];

  const historyColumns: ColumnDef<Grievance["history"][0]>[] = [
    { key: "action", label: "Action", sortable: false, accessor: (row) => <span style={{ fontWeight: 500 }}>{row.action}</span> },
    { key: "fromStatus", label: "From", sortable: false, accessor: (row) => row.fromStatus || "-" },
    { key: "toStatus", label: "To", sortable: false, accessor: (row) => row.toStatus || "-" },
    { key: "note", label: "Note", sortable: false, accessor: (row) => row.note || "-" },
    { key: "performedAt", label: "Date", sortable: false, accessor: (row) => new Date(row.performedAt).toLocaleString() }
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
            <MessageSquare size={32} className="icon" color="var(--accent)" />
            Grievances
          </h1>
          <p className="page-subtitle">Manage and resolve pensioner grievances</p>
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
          searchPlaceholder="Search grievances..."
          searchTerm={search}
          onSearch={(value) => { setSearch(value); setPage(1); }}
          searchFields={["subject", "pensioner.name", "pensioner.employeeId"]}
          filters={filters}
          filterValues={{ status }}
          setFilterValue={handleStatusFilter}
          sortKey={sortKey}
          sortDir={sortDir}
          setSort={handleSort}
          enableSorting={false}
          enableSearch={true}
          enableExport={true}
          exportFilename={`grievances-${new Date().toISOString().slice(0,10)}`}
          paginated={true}
          page={page}
          limit={limit}
          total={query.data?.total || 0}
          setPage={setPage}
          isLoading={query.isLoading || query.isFetching}
          emptyMessage="No grievances found"
          emptyIcon={<MessageSquare size={48} />}
          actions={(item) => (
            <motion.button
              className="btn btn-primary btn-sm"
              onClick={() => { setSelected(item); setNewStatus(item.status); setReply(item.adminReply || ""); }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View
            </motion.button>
          )}
          rowKey={(item) => item.id}
        />
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="modal"
              style={{ maxWidth: 700 }}
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 className="modal-title">{selected.subject}</h2>
                <motion.button
                  className="modal-close"
                  onClick={() => setSelected(null)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
              <div className="modal-body">
                <motion.div
                  style={{ display: "grid", gap: 16, marginBottom: 24 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <motion.div whileHover={{ x: 4 }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Pensioner</span>
                      <p style={{ fontWeight: 600 }}>{selected.pensioner.name}</p>
                    </motion.div>
                    <motion.div whileHover={{ x: 4 }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</span>
                      <p><span className={`badge ${getStatusBadge(selected.status)}`}>{selected.status.replace("_", " ")}</span></p>
                    </motion.div>
                  </div>
                  <motion.div whileHover={{ x: 4 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Description</span>
                    <p style={{ marginTop: 4, color: "var(--text-secondary)" }}>{selected.description}</p>
                  </motion.div>
                  {selected.adminReply && (
                    <motion.div
                      style={{ background: "var(--bg)", padding: 16, borderRadius: "var(--radius)" }}
                      whileHover={{ backgroundColor: "var(--bg-card)" }}
                    >
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Admin Reply</span>
                      <p style={{ marginTop: 4, color: "var(--text-secondary)" }}>{selected.adminReply}</p>
                    </motion.div>
                  )}
                </motion.div>

                <h3 style={{ marginBottom: 12, fontSize: "1rem" }}>Timeline</h3>
                <div className="table-container" style={{ marginBottom: 24 }}>
                  <div className="table-wrap" style={{ maxHeight: 200 }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Action</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Note</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.history?.map((h: any, i: number) => (
                          <motion.tr
                            key={h.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.03 }}
                          >
                            <td style={{ fontWeight: 500 }}>{h.action}</td>
                            <td>{h.fromStatus || "-"}</td>
                            <td>{h.toStatus || "-"}</td>
                            <td>{h.note || "-"}</td>
                            <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{new Date(h.performedAt).toLocaleString()}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <h3 style={{ marginBottom: 12, fontSize: "1rem" }}>Attachments</h3>
                <motion.div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                  <motion.button
                    className="btn btn-secondary btn-sm"
                    onClick={handleAttach}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Paperclip size={16} />
                    Add Attachment
                  </motion.button>
                  {selected.attachments?.map((att: any) => (
                    <motion.a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      {att.filename}
                    </motion.a>
                  ))}
                </motion.div>

                <h3 style={{ marginBottom: 12, fontSize: "1rem" }}>Update Status & Reply</h3>
                <FormField
                  label="Status"
                  name="newStatus"
                  type="select"
                  options={statusOptions}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  icon={<ClipboardEdit size={18} />}
                  placeholder="Select"
                />
                <FormField
                  label="Reply / Note"
                  name="reply"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  icon={<MessageSquare size={18} />}
                  placeholder="Enter your reply..."
                  rows={4}
                  type="textarea"
                />
                <motion.button
                  className="btn btn-primary"
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Send size={16} />
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
