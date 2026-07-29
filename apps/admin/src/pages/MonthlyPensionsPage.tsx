import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api";

export default function MonthlyPensionsPage() {
  const [month, setMonth] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const query = useQuery({
    queryKey: ["monthly-pensions", month, year, status, page],
    queryFn: async () =>
      (await api.get("/management/monthly-pensions", {
        params: {
          month: month || undefined,
          year: year || undefined,
          status: status || undefined,
          page,
          limit
        }
      })).data.data
  });

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / query.data.limit)) : 1;

  const handleDownload = async (id: string) => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/management/monthly-pensions/${id}/slip`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pension-slip-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to download slip");
    }
  };

  return (
    <div className="page">
      <h1>Monthly Pensions</h1>
      <div className="toolbar">
        <div>
          <label>Month</label>
          <select value={month} onChange={e => { setMonth(e.target.value ? Number(e.target.value) : ""); setPage(1); }}>
            <option value="">All</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Year</label>
          <input type="number" value={year} onChange={e => { setYear(e.target.value ? Number(e.target.value) : ""); setPage(1); }} placeholder="Year" />
        </div>
        <div>
          <label>Status</label>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option>PENDING</option>
            <option>PROCESSED</option>
            <option>PAID</option>
            <option>FAILED</option>
          </select>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Month/Year</th>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Basic</th>
              <th>DA</th>
              <th>HRA</th>
              <th>Medical</th>
              <th>Other</th>
              <th>Gross</th>
              <th>Deductions</th>
              <th>Net</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.items.map((item: any) => (
              <tr key={item.id}>
                <td>{item.month}/{item.year}</td>
                <td>{item.pensioner?.employeeId || "-"}</td>
                <td>{item.pensioner?.name || "-"}</td>
                <td>{item.basicPension}</td>
                <td>{item.da}</td>
                <td>{item.hra}</td>
                <td>{item.medicalAllowance}</td>
                <td>{item.otherAllowances}</td>
                <td>{item.grossAmount}</td>
                <td>{item.deductions}</td>
                <td>{item.netAmount}</td>
                <td>{item.status}</td>
                <td className="actions">
                  {item.status !== "PAID" && (
                    <button onClick={() => { if (confirm("Mark this pension as paid?")) api.patch(`/management/monthly-pensions/${item.id}/paid`).then(() => query.refetch()).catch(() => alert("Failed to update status")); }}>Mark as Paid</button>
                  )}
                  <button className="secondary" onClick={() => handleDownload(item.id)}>Download Slip</button>
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
