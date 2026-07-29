import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export default function ReportsPage() {
  const summary = useQuery({
    queryKey: ["reports"],
    queryFn: async () => (await api.get("/management/reports/summary")).data.data
  });

  const departments = useQuery({
    queryKey: ["reports", "departments"],
    queryFn: async () => (await api.get("/management/reports/departments")).data.data
  });

  const downloadCsv = async (type: string) => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/management/reports/export/csv?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to download CSV");
    }
  };

  const downloadPdf = async (type: string) => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/management/reports/export/pdf?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to download PDF");
    }
  };

  if (summary.isLoading || departments.isLoading) return <p>Loading...</p>;

  return (
    <div className="page">
      <h1>Reports & Analytics</h1>

      <div className="cards" style={{ marginBottom: 24 }}>
        <div className="card">
          <span>Total Pensioners</span>
          <strong>{summary.data?.users?.reduce((s: number, u: any) => s + (u._count?._all || 0), 0) || 0}</strong>
        </div>
        <div className="card">
          <span>Total Leads</span>
          <strong>{summary.data?.leads?.reduce((s: number, u: any) => s + (u._count?._all || 0), 0) || 0}</strong>
        </div>
        <div className="card">
          <span>Open Grievances</span>
          <strong>{summary.data?.grievances?.find((g: any) => g.status === "OPEN")?._count?._all || 0}</strong>
        </div>
        <div className="card">
          <span>Policies</span>
          <strong>{summary.data?.policies || 0}</strong>
        </div>
        <div className="card">
          <span>Total Disbursed</span>
          <strong>₹{Number(summary.data?.totalPensionDisbursed || 0).toLocaleString()}</strong>
        </div>
        <div className="card">
          <span>Total Gross</span>
          <strong>₹{Number(summary.data?.totalGrossPension || 0).toLocaleString()}</strong>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>Monthly Pension Trend</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {summary.data?.monthlyPensions?.map((item: any) => (
            <div key={`${item.month}-${item.year}`} className="card" style={{ flex: "1 1 180px", textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#667085" }}>{item.month.toString().padStart(2, "0")}/{item.year}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>₹{Number(item._sum.netAmount || 0).toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "#667085" }}>Net</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>Export Reports</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="secondary" onClick={() => downloadCsv("pensioners")}>Pensioners CSV</button>
          <button className="secondary" onClick={() => downloadCsv("monthly")}>Monthly Pension CSV</button>
          <button className="secondary" onClick={() => downloadCsv("grievances")}>Grievances CSV</button>
          <button onClick={() => downloadPdf("pensioners")}>Pensioners PDF</button>
          <button onClick={() => downloadPdf("monthly")}>Monthly Pension PDF</button>
          <button onClick={() => downloadPdf("grievances")}>Grievances PDF</button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Department-wise Breakdown</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Pensioners</th>
              </tr>
            </thead>
            <tbody>
              {departments.data?.departments?.map((d: any) => (
                <tr key={d.department}>
                  <td>{d.department || "-"}</td>
                   <td>{d._count?._all || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
