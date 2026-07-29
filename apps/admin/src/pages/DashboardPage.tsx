import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/admin/dashboard")).data.data
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => (await api.get("/management/dashboard/stats")).data.data
  });

  if (isLoading || statsLoading) return <p>Loading...</p>;

  const cards = [
    ["Total Pensioners", data.total],
    ["Pending Approval", data.pending],
    ["Approved", data.approved],
    ["Open Grievances", data.openGrievances],
    ["Pending Jeevan Pramaan", data.pendingJeevanPramaan],
    ["Total Pensioners (Stats)", stats?.totalPensioners],
    ["Total Monthly Pension", stats?.totalMonthlyPension],
    ["Total Paid", stats?.totalPaid],
    ["Pending Payments", stats?.pendingPayments],
    ["Current Month Processed", stats?.currentMonthProcessed]
  ];

  const monthlyTrend = stats?.monthlyTrend || [];

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="cards">
        {cards.map(([label, value]) => (
          <div className="card" key={String(label)}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      {monthlyTrend.length > 0 && (
        <>
          <h2 style={{ marginTop: 28 }}>Monthly Pension Trend</h2>
          <div className="card" style={{ padding: 24 }}>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#1d5fd1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}