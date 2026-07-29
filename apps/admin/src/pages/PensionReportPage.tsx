import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

type DashboardStats = {
  totalPensioners: number;
  totalMonthlyPension: number;
  totalPaid: number;
  pendingPayments: number;
  currentMonthProcessed: number;
  monthlyTrend: Array<{ month: string; amount: number }>;
};

type ReportSummary = {
  monthlyPensions: Array<{ month: number; year: number; _sum: { grossAmount: number; netAmount: number } }>;
};

export default function PensionReportPage() {
  const stats = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => (await api.get("/management/dashboard/stats")).data.data
  });

  const summary = useQuery({
    queryKey: ["reportSummary"],
    queryFn: async () => (await api.get("/management/reports/summary")).data.data
  });

  if (stats.isLoading || summary.isLoading) return <p>Loading...</p>;

  const s = stats.data as DashboardStats | undefined;
  const sm = summary.data as ReportSummary | undefined;

  const rows = [
    ["Total Approved Pensioners", s?.totalPensioners],
    ["Total Monthly Pension", s?.totalMonthlyPension],
    ["Total Paid", s?.totalPaid],
    ["Pending Payments", s?.pendingPayments],
    ["Current Month Processed", s?.currentMonthProcessed],
    ["Monthly Trend", s?.monthlyTrend?.length ? `${s.monthlyTrend.length} months` : "-"],
  ];

  return (
    <div className="page">
      <h1>Pension Expense Report</h1>
      <div className="cards">
        {rows.map(([label, value]) => (
          <div className="card" key={String(label)}>
            <span>{label}</span>
            <strong>{value != null ? (typeof value === "number" ? `₹${Number(value).toLocaleString()}` : String(value)) : "-"}</strong>
          </div>
        ))}
      </div>
      {s?.monthlyTrend && s.monthlyTrend.length > 0 && (
        <>
          <h2 style={{ marginTop: 28 }}>Monthly Breakdown</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Pension Amount</th>
                </tr>
              </thead>
              <tbody>
                {s.monthlyTrend.map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>₹{Number(row.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {sm?.monthlyPensions && sm.monthlyPensions.length > 0 && (
        <>
          <h2 style={{ marginTop: 28 }}>Monthly Pension History</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Gross</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {sm.monthlyPensions.map((row) => (
                  <tr key={`${row.month}-${row.year}`}>
                    <td>{row.month}</td>
                    <td>{row.year}</td>
                    <td>₹{Number(row._sum?.grossAmount || 0).toLocaleString()}</td>
                    <td>₹{Number(row._sum?.netAmount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}