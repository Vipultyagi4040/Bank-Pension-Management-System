import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api";

export default function PensionersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["pensioners", search, status, department, page],
    queryFn: async () =>
      (await api.get("/admin/pensioners", {
        params: { search, status: status || undefined, department: department || undefined, page, limit }
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

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / query.data.limit)) : 1;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Pensioners</h1>
        <Link to="/pensioners/new"><button>Add Pensioner</button></Link>
      </div>
      <div className="toolbar">
        <div>
          <label>Search</label>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Name, employee ID, mobile, email, PAN" />
        </div>
        <div>
          <label>Status</label>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option>PENDING</option>
            <option>APPROVED</option>
            <option>REJECTED</option>
            <option>SUSPENDED</option>
            <option>INACTIVE</option>
          </select>
        </div>
        <div>
          <label>Department</label>
          <input value={department} onChange={e => { setDepartment(e.target.value); setPage(1); }} placeholder="Department" />
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Current Pension</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.items.map((item: any) => (
              <tr key={item.id}>
                <td>{item.employeeId}</td>
                <td><Link to={`/pensioners/${item.id}`}>{item.name}</Link></td>
                <td>{item.mobile}</td>
                <td>{item.department || "-"}</td>
                <td>{item.designation || "-"}</td>
                <td>{item.status}</td>
                <td>{item.pensionDetails?.[0] ? `₹${item.pensionDetails[0].pensionAmount}` : "-"}</td>
                <td className="actions">
                  <Link to={`/pensioners/${item.id}/edit`}><button className="secondary">Edit</button></Link>
                  {!item.deletedAt ? (
                    <>
                      <button onClick={() => { if (confirm("Approve this pensioner?")) updateStatus.mutate({ id: item.id, status: "APPROVED" }); }}>Approve</button>
                      <button className="danger" onClick={() => { if (confirm("Reject this pensioner?")) updateStatus.mutate({ id: item.id, status: "REJECTED" }); }}>Reject</button>
                      <button className="danger" onClick={() => { if (confirm("Delete this pensioner?")) remove.mutate(item.id); }}>Delete</button>
                    </>
                  ) : (
                    <button onClick={() => { if (confirm("Restore this pensioner?")) restore.mutate(item.id); }}>Restore</button>
                  )}
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
          <button
            className="secondary"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <button
            className="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
