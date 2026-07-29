import { FormEvent, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

type JeevanRecord = {
  id: string;
  pensionerId: string;
  pensioner: { employeeId: string; name: string; mobile: string };
  applicationNumber: string;
  submissionDate: string;
  verificationDate: string;
  status: string;
  remarks: string;
};

const statuses = ["NOT_SUBMITTED", "SUBMITTED", "VERIFIED", "REJECTED", "EXPIRED"];

export default function JeevanPramaanPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["jeevan"],
    queryFn: async () => (await api.get("/management/jeevan-pramaan")).data.data as JeevanRecord[]
  });

  const [form, setForm] = useState({
    id: "",
    pensionerId: "",
    applicationNumber: "",
    status: "NOT_SUBMITTED",
    submissionDate: "",
    verificationDate: "",
    remarks: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (editingId && data) {
      const item = data.find(r => r.id === editingId);
      if (item) {
        setForm({
          id: item.id,
          pensionerId: item.pensionerId,
          applicationNumber: item.applicationNumber || "",
          status: item.status,
          submissionDate: item.submissionDate ? item.submissionDate.slice(0, 10) : "",
          verificationDate: item.verificationDate ? item.verificationDate.slice(0, 10) : "",
          remarks: item.remarks || ""
        });
      }
    } else if (!editingId) {
      setForm({
        id: "",
        pensionerId: "",
        applicationNumber: "",
        status: "NOT_SUBMITTED",
        submissionDate: "",
        verificationDate: "",
        remarks: ""
      });
    }
  }, [editingId, data]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    try {
      const payload: any = {
        pensionerId: form.pensionerId,
        applicationNumber: form.applicationNumber || undefined,
        status: form.status,
        remarks: form.remarks || undefined
      };
      if (form.submissionDate) payload.submissionDate = form.submissionDate;
      if (form.verificationDate) payload.verificationDate = form.verificationDate;

      if (editingId) {
        await api.patch(`/management/jeevan-pramaan/${editingId}`, payload);
      } else {
        await api.post("/management/jeevan-pramaan", payload);
      }
      setEditingId(null);
      setForm({
        id: "",
        pensionerId: "",
        applicationNumber: "",
        status: "NOT_SUBMITTED",
        submissionDate: "",
        verificationDate: "",
        remarks: ""
      });
      queryClient.invalidateQueries({ queryKey: ["jeevan"] });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to save record");
    }
  }

  function handleStatusChange(status: string) {
    setForm(prev => ({
      ...prev,
      status,
      verificationDate: status === "VERIFIED" ? new Date().toISOString().slice(0, 10) : prev.verificationDate
    }));
  }

  function startEdit(item: JeevanRecord) {
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      id: "",
      pensionerId: "",
      applicationNumber: "",
      status: "NOT_SUBMITTED",
      submissionDate: "",
      verificationDate: "",
      remarks: ""
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this record?")) return;
    await api.delete(`/management/jeevan-pramaan/${id}`);
    queryClient.invalidateQueries({ queryKey: ["jeevan"] });
  }

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="page">
      <h1>Jeevan Pramaan</h1>
      <form className="card" onSubmit={submit} style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Record" : "Add Record"}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Pensioner ID</label>
            <input value={form.pensionerId} onChange={e => setForm({ ...form, pensionerId: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Application Number</label>
            <input value={form.applicationNumber} onChange={e => setForm({ ...form, applicationNumber: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => handleStatusChange(e.target.value)}>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Submission Date</label>
            <input type="date" value={form.submissionDate} onChange={e => setForm({ ...form, submissionDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Verification Date</label>
            <input type="date" value={form.verificationDate} onChange={e => setForm({ ...form, verificationDate: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Remarks</label>
          <textarea value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} rows={2} />
        </div>
        {errorMsg && <p className="error">{errorMsg}</p>}
        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={isLoading}>{editingId ? "Update Record" : "Save Record"}</button>
          {editingId && (
            <button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>
          )}
        </div>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Pensioner</th>
              <th>Application</th>
              <th>Status</th>
              <th>Submission Date</th>
              <th>Verification Date</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((x: JeevanRecord) => (
              <tr key={x.id}>
                <td>{x.pensioner.name} ({x.pensioner.employeeId})</td>
                <td>{x.applicationNumber || "-"}</td>
                <td>{x.status}</td>
                <td>{x.submissionDate ? new Date(x.submissionDate).toLocaleDateString() : "-"}</td>
                <td>{x.verificationDate ? new Date(x.verificationDate).toLocaleDateString() : "-"}</td>
                <td>{x.remarks || "-"}</td>
                <td className="actions">
                  <button className="secondary" onClick={() => startEdit(x)}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(x.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
