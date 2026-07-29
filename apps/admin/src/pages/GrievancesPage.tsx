import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

  return (
    <div className="page">
      <h1>Grievances</h1>
      <div className="toolbar">
        <div>
          <label>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All</option>
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
                <td>{item.pensioner.name} ({item.pensioner.employeeId})</td>
                <td>{item.subject}</td>
                <td>{item.status}</td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="actions">
                  <button onClick={() => { setSelected(item); setNewStatus(item.status); setReply(item.adminReply || ""); }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="card" style={{ marginTop: 24, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ marginTop: 0 }}>{selected.subject}</h2>
            <button className="secondary" onClick={() => setSelected(null)}>Close</button>
          </div>
          <p><b>Pensioner:</b> {selected.pensioner.name} ({selected.pensioner.employeeId})</p>
          <p><b>Status:</b> {selected.status}</p>
          <p><b>Description:</b> {selected.description}</p>
          {selected.adminReply && <p><b>Admin Reply:</b> {selected.adminReply}</p>}
          {selected.assignedTo && <p><b>Assigned To:</b> {selected.assignedTo}</p>}

          <h3 style={{ marginTop: 20 }}>Timeline</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Action</th><th>From</th><th>To</th><th>Note</th><th>Date</th></tr></thead>
              <tbody>
                {selected.history?.map((h: any) => (
                  <tr key={h.id}>
                    <td>{h.action}</td>
                    <td>{h.fromStatus || "-"}</td>
                    <td>{h.toStatus || "-"}</td>
                    <td>{h.note || "-"}</td>
                    <td>{new Date(h.performedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ marginTop: 20 }}>Attachments</h3>
          <div className="actions" style={{ marginBottom: 12 }}>
            <button className="secondary" onClick={handleAttach}>Add Attachment</button>
          </div>
          <div className="cards">
            {selected.attachments?.map((att: any) => (
              <div className="card" key={att.id}>
                <a href={att.url} target="_blank" rel="noreferrer">{att.filename}</a>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: 20 }}>Update Status</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <select className="input" value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ width: 200 }}>
              <option>OPEN</option>
              <option>IN_PROGRESS</option>
              <option>RESOLVED</option>
              <option>CLOSED</option>
            </select>
            <input className="input" placeholder="Reply / Note" value={reply} onChange={e => setReply(e.target.value)} style={{ flex: 1 }} />
            <button onClick={handleUpdate} disabled={updateMutation.isPending}>Update</button>
          </div>
        </div>
      )}
    </div>
  );
}
