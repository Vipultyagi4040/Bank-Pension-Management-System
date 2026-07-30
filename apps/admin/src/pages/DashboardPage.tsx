import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users, Shield, Clock, MessageSquare, FileText, BarChart3, FileBarChart, Settings } from "lucide-react";
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

  if (isLoading || statsLoading) {
    return (
      <div>
        <div className="cards">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card">
              <div className="skeleton skeleton-text" style={{ width: "40%", height: 14 }} />
              <div className="skeleton skeleton-text" style={{ width: "70%", height: 32, marginTop: 12 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Pensioners", value: data?.total ?? 0, icon: Users, change: "+12%", positive: true },
    { label: "Approved", value: data?.approved ?? 0, icon: Shield, change: "+5%", positive: true },
    { label: "Pending Approval", value: data?.pending ?? 0, icon: Clock, change: "0%", positive: true },
    { label: "Open Grievances", value: data?.openGrievances ?? 0, icon: MessageSquare, change: "-8%", positive: false },
    { label: "Pending Jeevan Pramaan", value: data?.pendingJeevanPramaan ?? 0, icon: FileText, change: "+3%", positive: true }
  ];

  const managementCards = [
    { label: "Total Pensioners (Stats)", value: stats?.totalPensioners ?? 0, icon: Users },
    { label: "Total Monthly Pension", value: `₹${(stats?.totalMonthlyPension ?? 0).toLocaleString()}`, icon: BarChart3 },
    { label: "Total Paid", value: `₹${(stats?.totalPaid ?? 0).toLocaleString()}`, icon: FileBarChart },
    { label: "Pending Payments", value: stats?.pendingPayments ?? 0, icon: Clock },
    { label: "Current Month Processed", value: stats?.currentMonthProcessed ?? 0, icon: Settings }
  ];

  const monthlyTrend = stats?.monthlyTrend || [];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome to Pension Admin Portal</p>
        </div>
      </div>

      <div className="cards">
        {statCards.map((stat) => (
          <div key={stat.label} className="card">
            <div className="card-header">
              <span className="card-title">{stat.label}</span>
              <div className="card-icon">
                <stat.icon size={24} />
              </div>
            </div>
            <div className="card-value">{stat.value}</div>
            {stat.change && (
              <span className={`card-change ${stat.positive ? "positive" : "negative"}`}>
                {stat.positive ? "↑" : "↓"} {stat.change}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="cards">
        {managementCards.map((stat) => (
          <div key={stat.label} className="card">
            <div className="card-header">
              <span className="card-title">{stat.label}</span>
              <div className="card-icon">
                <stat.icon size={24} />
              </div>
            </div>
            <div className="card-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {monthlyTrend.length > 0 && (
        <div className="card animate-fade-in" style={{ marginTop: 28 }}>
          <div className="card-header">
            <span className="card-title" style={{ fontSize: "1rem", textTransform: "none", letterSpacing: 0 }}>Monthly Pension Trend</span>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#718096" fontSize={12} />
                  <YAxis stroke="#718096" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      background: "white", 
                      border: "1px solid #e2e8f0", 
                      borderRadius: "10px",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                    }} 
                  />
                  <Bar dataKey="amount" fill="url(#colorAmount)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0a3d62" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#1e5fbf" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
