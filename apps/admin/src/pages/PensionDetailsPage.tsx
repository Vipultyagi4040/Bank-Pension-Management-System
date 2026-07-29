import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api";

export default function PensionDetailsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["pension-details", search, status, page],
    queryFn: async () =>
      (await api.get("/management/pension-details", {
        params: { search, status: status || undefined, page, limit }
      })).data.data
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/management/pension-details/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pension-details"] })
  });

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / query.data.limit)) : 1;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Pension Details</h1>
        <Link to="/pension-details/new"><button>Add Pension Detail</button></Link>
      </div>
      <div className="toolbar">
        <div>
          <label>Search PPO Number</label>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="PPO Number" />
        </div>
        <div>
          <label>Status</label>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option>ACTIVE</option>
            <option>INACTIVE</option>
            <option>EXPIRED</option>
            <option>SUSPENDED</option>
          </select>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>PPO Number</th>
              <th>Pensioner Name</th>
              <th>Type</th>
              <th>Basic Pension</th>
              <th>DA</th>
              <th>HRA</th>
              <th>Medical</th>
              <th>Other</th>
              <th>Deductions</th>
              <th>Total Pension</th>
              <th>Effective From</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.items.map((item: any) => (
              <tr key={item.id}>
                <td>{item.ppoNumber}</td>
                <td>{item.pensioner?.name || "-"}</td>
                <td>{item.pensionType}</td>
                <td>{item.basicPension}</td>
                <td>{item.da}</td>
                <td>{item.hra}</td>
                <td>{item.medicalAllowance}</td>
                <td>{item.otherAllowances}</td>
                <td>{item.deductions}</td>
                <td>{item.pensionAmount}</td>
                <td>{item.effectiveFrom?.slice(0, 10)}</td>
                <td>{item.status}</td>
                <td className="actions">
                  <Link to={`/pension-details/${item.id}/edit`}><button className="secondary">Edit</button></Link>
                  <button className="danger" onClick={() => { if (confirm("Delete this record?")) remove.mutate(item.id); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span className="muted">
          Page {query.data?.page || 1} of {totalPages} ({query.data?.total || 0} total)
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <button className="secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
