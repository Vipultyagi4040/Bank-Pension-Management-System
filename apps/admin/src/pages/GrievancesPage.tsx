import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, X, Paperclip, Send, Search } from "lucide-react";
import { api } from "../api";

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

export default function GrievancesPage() {
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Grievance | null>(null);
  const [reply, setReply] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ["grievances", status],
    queryFn: async () => (await api.get("/admin/grievances", { params: { status: status || undefined } })).data.data
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

  const getStatusBadge = (s: string) => {
    const variants: Record<string, string> = {
      OPEN: "badge-error",
      IN_PROGRESS: "badge-warning",
      RESOLVED: "badge-success",
      CLOSED: "badge-info"
    };
    return variants[s] || "badge-info";
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Grievances</h1>
          <p className="page-subtitle">Manage and resolve pensioner grievances</p>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search">
            <Search />
            <input type="text" placeholder="Search grievances..." />
          </div>
          <div className="table-filters">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Status</option>
              <option>OPEN</option>
              <option>IN_PROGRESS</option>
              <option>RESOLVED</option>
              <option>CLOSED</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pensioner</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data?.items?.map((item: Grievance) => (
                <tr key={item.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text)" }}>{item.pensioner.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.pensioner.employeeId}</div>
                    </div>
                  </td>
                  <td>{item.subject}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(item.status)}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => { setSelected(item); setNewStatus(item.status); setReply(item.adminReply || ""); }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {(!query.data?.items || query.data.items.length === 0) && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <MessageSquare size={48} />
                      <h3>No grievances found</h3>
                      <p>All grievances will appear here when submitted by pensioners.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2 className="modal-title">{selected.subject}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: "grid", gap: 16, marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Pensioner</span>
                    <p style={{ fontWeight: 600 }}>{selected.pensioner.name}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</span>
                    <p><span className={`badge ${getStatusBadge(selected.status)}`}>{selected.status.replace("_", " ")}</span></p>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Description</span>
                  <p style={{ marginTop: 4, color: "var(--text-secondary)" }}>{selected.description}</p>
                </div>
                {selected.adminReply && (
                  <div style={{ background: "var(--bg)", padding: 16, borderRadius: "var(--radius)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Admin Reply</span>
                    <p style={{ marginTop: 4, color: "var(--text-secondary)" }}>{selected.adminReply}</p>
                  </div>
                )}
              </div>

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
                      {selected.history?.map((h: any) => (
                        <tr key={h.id}>
                          <td style={{ fontWeight: 500 }}>{h.action}</td>
                          <td>{h.fromStatus || "-"}</td>
                          <td>{h.toStatus || "-"}</td>
                          <td>{h.note || "-"}</td>
                          <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{new Date(h.performedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <h3 style={{ marginBottom: 12, fontSize: "1rem" }}>Attachments</h3>
              <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                <button className="btn btn-secondary btn-sm" onClick={handleAttach}>
                  <Paperclip size={16} />
                  Add Attachment
                </button>
                {selected.attachments?.map((att: any) => (
                  <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                    {att.filename}
                  </a>
                ))}
              </div>

              <h3 style={{ marginBottom: 12, fontSize: "1rem" }}>Update Status & Reply</h3>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Status</label>
                  <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option>OPEN</option>
                    <option>IN_PROGRESS</option>
                    <option>RESOLVED</option>
                    <option>CLOSED</option>
                  </select>
                </div>
                <div style={{ flex: 2 }}>
                  <label className="form-label">Reply / Note</label>
                  <input className="form-input" placeholder="Enter your reply..." value={reply} onChange={(e) => setReply(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={handleUpdate} disabled={updateMutation.isPending}>
                  <Send size={16} />
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
