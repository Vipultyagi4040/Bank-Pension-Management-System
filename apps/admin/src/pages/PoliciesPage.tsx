import { FormEvent, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

type Policy = {
  id: string;
  policyNumber: string;
  title: string;
  coverageDetails: string | null;
  claimGuidelines: string | null;
  validFrom: string;
  validTo: string;
  isPublished: boolean;
  consentRequired: boolean;
};

export default function PoliciesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => (await api.get("/management/policies")).data.data as Policy[]
  });

  const [form, setForm] = useState({
    id: "",
    policyNumber: "",
    title: "",
    validFrom: "",
    validTo: "",
    coverageDetails: "",
    claimGuidelines: "",
    isPublished: false,
    consentRequired: false
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (editingId && data) {
      const item = data.find(p => p.id === editingId);
      if (item) {
        setForm({
          id: item.id,
          policyNumber: item.policyNumber,
          title: item.title,
          validFrom: item.validFrom ? item.validFrom.slice(0, 10) : "",
          validTo: item.validTo ? item.validTo.slice(0, 10) : "",
          coverageDetails: item.coverageDetails || "",
          claimGuidelines: item.claimGuidelines || "",
          isPublished: item.isPublished,
          consentRequired: item.consentRequired
        });
      }
    } else if (!editingId) {
      setForm({
        id: "",
        policyNumber: "",
        title: "",
        validFrom: "",
        validTo: "",
        coverageDetails: "",
        claimGuidelines: "",
        isPublished: false,
        consentRequired: false
      });
    }
  }, [editingId, data]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    try {
      if (editingId) {
        await api.patch(`/management/policies/${editingId}`, form);
      } else {
        await api.post("/management/policies", form);
      }
      setEditingId(null);
      setForm({
        id: "",
        policyNumber: "",
        title: "",
        validFrom: "",
        validTo: "",
        coverageDetails: "",
        claimGuidelines: "",
        isPublished: false,
        consentRequired: false
      });
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to save policy");
    }
  }

  function startEdit(item: Policy) {
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      id: "",
      policyNumber: "",
      title: "",
      validFrom: "",
      validTo: "",
      coverageDetails: "",
      claimGuidelines: "",
      isPublished: false,
      consentRequired: false
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this policy?")) return;
    await api.delete(`/management/policies/${id}`);
    queryClient.invalidateQueries({ queryKey: ["policies"] });
  }

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="page">
      <h1>Policy Management</h1>
      <form className="card" onSubmit={submit}>
        <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Policy" : "Create Policy"}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Policy Number</label>
            <input value={form.policyNumber} onChange={e => setForm({ ...form, policyNumber: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Valid From</label>
            <input type="date" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Valid To</label>
            <input type="date" value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })} required />
          </div>
        </div>
        <div className="form-group">
          <label>Coverage Details</label>
          <textarea value={form.coverageDetails} onChange={e => setForm({ ...form, coverageDetails: e.target.value })} rows={3} />
        </div>
        <div className="form-group">
          <label>Claim Guidelines</label>
          <textarea value={form.claimGuidelines} onChange={e => setForm({ ...form, claimGuidelines: e.target.value })} rows={3} />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} />
            Published
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" checked={form.consentRequired} onChange={e => setForm({ ...form, consentRequired: e.target.checked })} />
            Consent Required
          </label>
        </div>
        {errorMsg && <p className="error">{errorMsg}</p>}
        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit">{editingId ? "Update Policy" : "Create Policy"}</button>
          {editingId && (
            <button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>
          )}
        </div>
      </form>
      <div className="table-wrap" style={{ marginTop: 24 }}>
        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>Title</th>
              <th>Valid From</th>
              <th>Valid To</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((x: Policy) => (
              <tr key={x.id}>
                <td>{x.policyNumber}</td>
                <td>{x.title}</td>
                <td>{x.validFrom ? new Date(x.validFrom).toLocaleDateString() : "-"}</td>
                <td>{x.validTo ? new Date(x.validTo).toLocaleDateString() : "-"}</td>
                <td>{x.isPublished ? "Yes" : "No"}</td>
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
