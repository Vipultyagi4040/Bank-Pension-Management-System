import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export default function MonthlyProcessingPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const queryClient = useQueryClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const processMutation = useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) =>
      (await api.post("/management/process-monthly", { month, year })).data,
    onSuccess: () => {
      setMessage({ type: "success", text: "Monthly pension processed successfully!" });
      queryClient.invalidateQueries({ queryKey: ["processing-history"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-pensions"] });
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err.response?.data?.message || "Processing failed" });
    }
  });

  const { data: historyData } = useQuery({
    queryKey: ["processing-history"],
    queryFn: async () => (await api.get("/management/processing-history")).data.data
  });

  function handleProcess() {
    setMessage(null);
    processMutation.mutate({ month: selectedMonth, year: selectedYear });
  }

  return (
    <div className="page">
      <h1>Monthly Pension Processing</h1>

      {message && (
        <div className={message.type === "success" ? "" : "error"} style={{ marginBottom: 16 }}>
          {message.text}
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>Process Monthly Pension</h3>
        <p style={{ color: "#667085", marginTop: -8, marginBottom: 16 }}>
          Current month/year: <b>{currentMonth}/{currentYear}</b>
        </p>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Month</label>
            <select className="input" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Year</label>
            <input className="input" type="number" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} />
          </div>
          <button
            onClick={handleProcess}
            disabled={processMutation.isPending}
          >
            {processMutation.isPending ? "Processing..." : "Process Monthly Pension"}
          </button>
        </div>
        {processMutation.isPending && <p className="muted" style={{ marginTop: 8 }}>Processing, please wait...</p>}
      </div>

      <h2>Processing History</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Month</th>
              <th>Year</th>
              <th>Processed At</th>
              <th>Processed By</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {historyData?.items?.map((record: any) => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.month}</td>
                <td>{record.year}</td>
                <td>{record.processedAt?.slice(0, 19).replace("T", " ")}</td>
                <td>{record.processedBy?.name || "-"}</td>
                <td>{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {historyData?.items?.length === 0 && <p className="muted">No processing history found.</p>}
    </div>
  );
}
