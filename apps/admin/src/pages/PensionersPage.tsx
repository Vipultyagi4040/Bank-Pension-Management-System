import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Users } from "lucide-react";
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

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pensioners</h1>
          <p className="page-subtitle">Manage pensioner records and approvals</p>
        </div>
        <Link to="/pensioners/new">
          <button className="btn btn-primary">
            <Users size={18} />
            Add Pensioner
          </button>
        </Link>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search">
            <Search />
            <input
              type="text"
              placeholder="Search name, employee ID, mobile..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="table-filters">
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option>PENDING</option>
              <option>APPROVED</option>
              <option>REJECTED</option>
              <option>SUSPENDED</option>
              <option>INACTIVE</option>
            </select>
            <input
              type="text"
              placeholder="Department"
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
              style={{ padding: "9px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.9rem", width: 160 }}
            />
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
                  <td style={{ fontWeight: 600, color: "var(--text)" }}>{item.employeeId}</td>
                  <td>
                    <Link to={`/pensioners/${item.id}`} style={{ color: "var(--primary)", fontWeight: 500 }}>
                      {item.name}
                    </Link>
                  </td>
                  <td>{item.mobile}</td>
                  <td>{item.department || "-"}</td>
                  <td>{item.designation || "-"}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {item.pensionDetails?.[0] ? `₹${Number(item.pensionDetails[0].pensionAmount).toLocaleString()}` : "-"}
                  </td>
                  <td>
                    <div className="actions">
                      <Link to={`/pensioners/${item.id}/edit`}>
                        <button className="btn btn-secondary btn-sm">Edit</button>
                      </Link>
                      {!item.deletedAt ? (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => { if (confirm("Approve this pensioner?")) updateStatus.mutate({ id: item.id, status: "APPROVED" }); }}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => { if (confirm("Reject this pensioner?")) updateStatus.mutate({ id: item.id, status: "REJECTED" }); }}
                          >
                            Reject
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => { if (confirm("Delete this pensioner?")) remove.mutate(item.id); }}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => { if (confirm("Restore this pensioner?")) restore.mutate(item.id); }}
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!query.data?.items || query.data.items.length === 0) && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <Users size={48} />
                      <h3>No pensioners found</h3>
                      <p>Try adjusting your search or filters, or add a new pensioner.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <div className="pagination-info">
            Page {query.data?.page || 1} of {totalPages} ({query.data?.total || 0} total)
          </div>
          <div className="pagination-buttons">
            <button
              className="pagination-btn"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              ←
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${page === pageNum ? "active" : ""}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="pagination-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
