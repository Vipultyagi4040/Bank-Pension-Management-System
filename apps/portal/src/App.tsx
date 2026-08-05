import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, User, FileText, Bell, MessageSquare, Users, FileBarChart, LogOut, Menu, X, Shield, Smartphone, Search, Calendar, Plus, Send, Clock, AlertCircle, TrendingUp, Download, CheckCircle, Hash, Phone, Mail, MapPin, Banknote, CreditCard, FileText as FileTextIcon, Lock, Eye, EyeOff, Key, Activity, Briefcase } from "lucide-react";
import { api } from "./api";
import DataTable, { ColumnDef, FilterOption } from "./components/DataTable";
import FormField from "./components/FormField";
import ToastContainer, { toastStore } from "./components/ToastContainer";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip, LineChart, Line, AreaChart, Area
} from "recharts";

function Login(){
  const [mobile,setMobile]=useState("9999999999"),[otp,setOtp]=useState(""),[stage,setStage]=useState(false),[dev,setDev]=useState(""),[error,setError]=useState("");
  const [mobileError,setMobileError]=useState("");
  const [otpError,setOtpError]=useState("");
  const [submitting,setSubmitting]=useState(false);

  function validate(){
    let valid=true;
    setMobileError("");setOtpError("");
    if(!stage){
      if(!mobile||!/^[6-9]\d{9}$/.test(mobile)){setMobileError("Enter a valid 10-digit mobile number");valid=false}
    }else{
      if(!otp||otp.length<4){setOtpError("Enter OTP");valid=false}
    }
    return valid
  }

  async function submit(e:FormEvent){
    e.preventDefault();
    if(!validate())return;
    setError("");
    setSubmitting(true);
    try{
      if(!stage){
        const r=await api.post("/auth/pensioner/request-otp",{mobile});
        setDev(r.data.data.developmentOtp||"");setStage(true)
      }else{
        const r=await api.post("/auth/pensioner/verify-otp",{mobile,otp});
        localStorage.setItem("pensionerToken",r.data.data.accessToken);
        location.href="/"
      }
    }catch(e:any){setError(e.response?.data?.message||"Request failed")}finally{setSubmitting(false)}
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Smartphone size={32} />
          </div>
          <h1>Pensioner Portal</h1>
          <p>Secure login with your registered mobile number</p>
        </div>

        {error && (
          <motion.div
            className="form-error"
            initial={{ opacity: 0, scale: 0.9, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -5 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={submit} noValidate>
          {!stage && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <FormField
                label="Mobile Number"
                name="mobile"
                value={mobile}
                onChange={(e)=>setMobile(e.target.value)}
                icon={<Smartphone size={18} />}
                required
                error={mobileError}
                placeholder="9999999999"
                maxLength={10}
                autoComplete="tel"
                autoFocus
              />
            </motion.div>
          )}

          {stage && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <FormField
                label="Enter OTP"
                name="otp"
                value={otp}
                onChange={(e)=>setOtp(e.target.value)}
                icon={<Shield size={18} />}
                required
                error={otpError}
                placeholder="123456"
                maxLength={6}
                autoComplete="one-time-code"
              />
              {dev && (
                <p style={{ color: "var(--accent-dark)", fontSize: "0.85rem", marginTop: 6, marginBottom: 12 }}>
                  Development OTP: <strong>{dev}</strong>
                </p>
              )}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className={`btn btn-primary ${submitting ? "btn-loading" : ""}`}
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="btn-text">{stage ? "Verify OTP" : "Send OTP"}</span>
            <span className="btn-spinner">
              <div style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} />
            </span>
          </motion.button>
        </form>
        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Demo: 9999999999 (new OTP shown on each request)
        </p>
      </div>
    </div>
  );
}

function Register(){
  const [f,setF]=useState({employeeId:"",mobile:"",email:"",address:""});
  const [msg,setMsg]=useState("");
  const [error,setError]=useState("");
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [submitting,setSubmitting]=useState(false);

  function validate(){
    const e:Record<string,string>={};
    if(!f.employeeId)e.employeeId="Employee ID is required";
    if(!f.mobile||!/^[6-9]\d{9}$/.test(f.mobile))e.mobile="Valid 10-digit mobile required";
    if(f.email&&!/\S+@\S+\.\S+/.test(f.email))e.email="Valid email is required";
    setErrors(e);
    return Object.keys(e).length===0;
  }

  async function go(e:FormEvent){
    e.preventDefault();
    setError("");setMsg("");
    if(!validate())return;
    setSubmitting(true);
    try{
      const r=await api.post("/auth/pensioner/register",f);
      setMsg(r.data.message);
      setF({employeeId:"",mobile:"",email:"",address:""});
    }catch(e:any){setError(e.response?.data?.message||"Registration failed")}finally{setSubmitting(false)}
  }

  const formFields = [
    { key:"employeeId", label:"Employee ID", icon:Hash, placeholder:"e.g. EMP001", required:true, type:"text" },
    { key:"mobile", label:"Mobile", icon:Phone, placeholder:"9999999999", required:true, type:"tel", maxLength:10 },
    { key:"email", label:"Email", icon:Mail, placeholder:"name@example.com", required:false, type:"email" },
    { key:"address", label:"Address", icon:MapPin, placeholder:"Enter full address", required:false, type:"textarea" }
  ];

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Smartphone size={32} />
          </div>
          <h1>Complete Registration</h1>
          <p>Submit your details for approval</p>
        </div>

        <form onSubmit={go} noValidate>
          {formFields.map(fld => {
            const Icon=fld.icon;
            return (
              <FormField
                key={fld.key}
                label={fld.label}
                name={fld.key}
                type={fld.type as any}
                value={(f as any)[fld.key]}
                onChange={(e:any)=>setF({...f,[fld.key]:e.target.value})}
                icon={<Icon size={18} />}
                required={fld.required}
                error={errors[fld.key]}
                placeholder={fld.placeholder}
                maxLength={fld.maxLength}
                rows={fld.type==="textarea"?3:undefined}
                autoComplete={fld.key==="email"?"email":"off"}
              />
            );
          })}

          {msg && <div className="form-success-message"><CheckCircle size={16} />{msg}</div>}
          {error && <div className="form-error">{error}</div>}

          <button
            type="submit"
            className={`btn btn-primary ${submitting ? "btn-loading" : ""}`}
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            disabled={submitting}
          >
            <span className="btn-text">{submitting ? "Submitting..." : "Submit for Approval"}</span>
            <span className="btn-spinner">
              <div style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} />
            </span>
          </button>
          <p style={{ textAlign: "center", marginTop: 16, fontSize: "0.9rem" }}>
            <Link to="/login" style={{ color: "var(--primary)" }}>Back to login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/pension", icon: FileText, label: "Pension" },
  { to: "/slips", icon: FileBarChart, label: "Slips" },
  { to: "/policies", icon: Shield, label: "Policies" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/grievances", icon: MessageSquare, label: "Grievances" },
  { to: "/leads", icon: Users, label: "Lead" },
  { to: "/jeevan", icon: FileText, label: "Jeevan Pramaan" }
];

function Layout({ children }: { children: any }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    const item = navItems.find(item => location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to)));
    return item?.label || "Dashboard";
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <motion.nav
        className="top-nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="nav-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <motion.button
              className="nav-icon-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ display: "none", background: "none", color: "white", border: "none" }}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
            <Link to="/" className="nav-brand">
              <motion.span
                className="nav-brand-icon"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                🏦
              </motion.span>
              Pension Portal
            </Link>
          </div>
          <div className="nav-links">
            {navItems.map((item, i) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  to={item.to}
                  className={location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to)) ? "active" : ""}
                >
                  <motion.span whileHover={{ scale: 1.2 }}>
                    <item.icon size={18} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  </motion.span>
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="nav-user">
            <motion.button
              className="nav-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { localStorage.removeItem("pensionerToken"); window.location.href = "/login"; }}
            >
              <LogOut size={18} style={{ marginRight: 6 }} />
              Logout
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <main className="shell" style={{ paddingTop: 24 }}>
        <motion.div
          className="breadcrumbs"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <span>Home</span> / <span>{getPageTitle()}</span>
        </motion.div>
        <motion.div
          className="page-header"
          style={{ marginBottom: 24, padding: 0, borderBottom: "none" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div>
            <h1 className="page-title">
              <motion.span className="icon" whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                {(() => {
                  const item = navItems.find(item => location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to)));
                  const Icon = item?.icon;
                  return Icon ? <Icon size={32} color="var(--accent)" /> : <LayoutDashboard size={32} color="var(--accent)" />;
                })()}
              </motion.span>
              {getPageTitle()}
            </h1>
          </div>
        </motion.div>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      <motion.footer
        className="app-footer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <p>&copy; {new Date().getFullYear()} Bank Pension Management System. Secure Pensioner Portal.</p>
      </motion.footer>
    </div>
  );
}
function Dash(){
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/pensioner/dashboard")).data.data
  });

  const { data: slipsData } = useQuery({
    queryKey: ["pensionerSlips"],
    queryFn: async () => (await api.get("/pensioner/slips")).data.data
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["pensionerNotifications"],
    queryFn: async () => (await api.get("/pensioner/notifications")).data.data
  });

  const { data: grievancesData } = useQuery({
    queryKey: ["pensionerGrievances"],
    queryFn: async () => (await api.get("/pensioner/grievances")).data.data
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="cards">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="skeleton skeleton-text" style={{ width: "40%", height: 14 }} />
              <div className="skeleton skeleton-text" style={{ width: "70%", height: 32, marginTop: 12 }} />
            </div>
          ))}
        </div>
      </Layout>
    );
  }
  if (error) return <Layout><p className="error">Failed to load dashboard</p></Layout>;

  const p = data?.profile?.pensionDetails?.[0];
  const lastSlip = slipsData?.items?.[0];
  const latestNotification = notificationsData?.items?.[0];
  const recentGrievances = (grievancesData?.items || []).slice(0, 5);

   const nextPensionDate = lastSlip?.paymentDate
    ? new Date(lastSlip.paymentDate).toLocaleDateString()
    : "-";

  const monthlyTrendData = (slipsData?.items || []).slice(0, 6).reverse().map((item: any) => ({
    month: new Date(item.paymentDate).toLocaleDateString("en-US", { month: "short" }),
    amount: Number(item.pensionAmount || 0)
  }));

  const statCards = [
    {
      label: "Current Pension",
      value: `₹${p?.pensionAmount ?? "-"}`,
      sub: `PPO: ${p?.ppoNumber || "-"}`,
      icon: FileText,
      gradient: "linear-gradient(135deg, #0c2340 0%, #173763 100%)"
    },
    {
      label: "Last Pension",
      value: `₹${lastSlip?.pensionAmount ?? "-"}`,
      sub: `Paid: ${lastSlip?.paymentDate ? new Date(lastSlip.paymentDate).toLocaleDateString() : "-"}`,
      icon: Calendar,
      gradient: "linear-gradient(135deg, #b9975b 0%, #d4af37 100%)"
    },
    {
      label: "Next Pension Date",
      value: nextPensionDate,
      sub: "Monthly payment cycle",
      icon: Clock,
      gradient: "linear-gradient(135deg, #1a4f8b 0%, #2962a3 100%)"
    },
    {
      label: "Unread Notifications",
      value: data?.counters?.unreadNotifications ?? 0,
      sub: `${notificationsData?.unreadCount ?? 0} unread`,
      icon: Bell,
      gradient: "linear-gradient(135deg, #2c5282 0%, #4a5568 100%)"
    }
  ];

  const quickActions = [
    { label: "View Pension Slips", to: "/slips", icon: FileBarChart, color: "#1a4f8b" },
    { label: "Create Grievance", to: "/grievances", icon: Plus, color: "#166534" },
    { label: "My Notifications", to: "/notifications", icon: Bell, color: "#b9975b" },
    { label: "Update Profile", to: "/profile", icon: User, color: "#2c5282" }
  ];

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Gradient Statistic Cards */}
        <motion.div
          className="cards"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
          }}
        >
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              className="card"
              style={{
                background: card.gradient,
                color: "white",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)"
              }}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.98 },
                visible: { opacity: 1, y: 0, scale: 1 }
              }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
               <motion.div className="card-header" style={{ borderBottom: "rgba(255,255,255,0.2) solid 1px", paddingBottom: 12, marginBottom: 16 }} whileHover={{ scale: 1.1 }}>
                <span className="card-title" style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem" }}>
                  {card.label}
                </span>
                <div className="card-icon" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                  {(() => { const Icon = card.icon; return <Icon size={24} />; })()}
                </div>
              </motion.div>
              <div className="card-value" style={{ fontSize: "2rem", fontWeight: 800 }}>{card.value}</div>
              <p style={{ fontSize: "0.8rem", opacity: 0.85, marginTop: 4 }}>{card.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Two-column layout: Quick Actions + Latest Notification */}
        <div className="grid">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Quick Actions</span>
              <div className="card-icon">
                <Plus size={24} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
              {quickActions.map((action, i) => (
                <Link key={action.label} to={action.to}>
                  <motion.button
                    className="btn btn-outline"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      borderColor: action.color,
                      color: action.color
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <motion.span whileHover={{ scale: 1.2 }}>
                      <action.icon size={18} />
                    </motion.span>
                    {action.label}
                  </motion.button>
                </Link>
              ))}
            </div>
          </div>

          {/* Latest Notification */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Latest Notification</span>
              <div className="card-icon">
                <Bell size={24} />
              </div>
            </div>
            {latestNotification ? (
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", marginBottom: 8 }}>
                  {latestNotification.title}
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: 12 }}>
                  {latestNotification.message}
                </p>
                <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  <Calendar size={14} />
                  <span>{new Date(latestNotification.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "24px 12px" }}>
                <Bell size={32} />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Grid: Personal Information + Recent Grievances */}
        <div className="grid">
          {/* Personal Information */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Personal Information</span>
              <div className="card-icon">
                <User size={24} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 8 }}>
              <div>
                <span className="info-label">Name</span>
                <p className="info-value">{data?.profile?.name || "-"}</p>
              </div>
              <div>
                <span className="info-label">Employee ID</span>
                <p className="info-value">{data?.profile?.employeeId || "-"}</p>
              </div>
              <div>
                <span className="info-label">Mobile</span>
                <p className="info-value">{data?.profile?.mobile || "-"}</p>
              </div>
              <div>
                <span className="info-label">Department</span>
                <p className="info-value">{data?.profile?.department || "-"}</p>
              </div>
              <div>
                <span className="info-label">Designation</span>
                <p className="info-value">{data?.profile?.designation || "-"}</p>
              </div>
              <div>
                <span className="info-label">Status</span>
                <p><span className="badge badge-success">{data?.profile?.status || "-"}</span></p>
              </div>
            </div>
          </div>

          {/* Recent Grievances */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Grievances</span>
              <div className="card-icon">
                <MessageSquare size={24} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              {recentGrievances.map((grievance: any) => (
                <div key={grievance.id} className="grievance-item">
                  <div className="grievance-title">{grievance.subject || grievance.title || "Untitled"}</div>
                  <div className="grievance-desc">{grievance.description?.slice(0, 80)}{grievance.description?.length > 80 && "..."}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <span className={`badge badge-${
                      grievance.status === "resolved" ? "success" :
                      grievance.status === "closed" ? "info" :
                      grievance.status === "rejected" ? "danger" :
                      "warning"
                    }`}>
                      {grievance.status}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {new Date(grievance.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {recentGrievances.length === 0 && (
                <div className="empty-state" style={{ padding: "24px 12px" }}>
                  <MessageSquare size={32} />
                  <p>No grievances filed</p>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Pension Trend Chart */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Monthly Pension Trend</span>
              <div className="card-icon">
                <TrendingUp size={24} />
              </div>
            </div>
            <div style={{ height: 180, marginTop: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData}>
                  <defs>
                    <linearGradient id="portalPensionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a4f8b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1a4f8b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "var(--radius)"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#1a4f8b"
                    fill="url(#portalPensionGradient)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
function Profile(){
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: "", address: "" });
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordErrors, setPasswordErrors] = useState<Record<string,string>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["pensionerProfile"],
    queryFn: async () => (await api.get("/pensioner/profile")).data.data
  });

  const { data: activityData } = useQuery({
    queryKey: ["pensionerActivity"],
    queryFn: async () => (await api.get("/pensioner/activity", { params: { limit: 10 } })).data.data
  });

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({ email: data.email || "", address: data.address || "" });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => (await api.patch("/pensioner/profile", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pensionerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setEditing(false);
      toastStore.add({
        type: "success",
        title: "Profile Updated",
        message: "Your profile has been updated successfully."
      });
    },
    onError: (err: any) => {
      toastStore.add({
        type: "error",
        title: "Update Failed",
        message: err.response?.data?.message || "Failed to update profile"
      });
    }
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const eErrors: Record<string, string> = {};
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) eErrors.email = "Valid email is required";
    setErrors(eErrors);
    if (Object.keys(eErrors).length > 0) return;
    updateMutation.mutate(form);
  }

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    const pErrors: Record<string, string> = {};
    if (!passwordForm.oldPassword) pErrors.oldPassword = "Current password is required";
    if (!passwordForm.newPassword) pErrors.newPassword = "New password is required";
    if (passwordForm.newPassword.length < 8) pErrors.newPassword = "Password must be at least 8 characters";
    if (passwordForm.newPassword !== passwordForm.confirmPassword) pErrors.confirmPassword = "Passwords do not match";
    setPasswordErrors(pErrors);
    if (Object.keys(pErrors).length > 0) return;
    toastStore.add({
      type: "info",
      title: "Feature Coming Soon",
      message: "Password change functionality will be available soon."
    });
  }

  const completionFields = [
    "name", "mobile", "email", "dateOfBirth", "gender", "maritalStatus",
    "fatherName", "panNumber", "aadhaarNumber", "department", "designation",
    "bankAccountNumber", "bankIfscCode", "address"
  ];

  const completion = useMemo(() => {
    if (!data) return 0;
    const filled = completionFields.filter((f) => {
      const v = (data as any)[f];
      return v !== undefined && v !== null && v !== "";
    }).length;
    return Math.round((filled / completionFields.length) * 100);
  }, [data]);

  const getInitials = () => {
    const name = data?.name || "";
    return name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "U";
  };

  const getAvatarColor = (name: string) => {
    const colors = ["#0c2340", "#1a4f8b", "#b9975b", "#2c5282", "#166534", "#991b1b"];
    const idx = name.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[idx % colors.length];
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="cards">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton skeleton-text" style={{ width: "40%", height: 14 }} />
              <div className="skeleton skeleton-text" style={{ width: "70%", height: 32, marginTop: 12 }} />
            </div>
          ))}
        </div>
      </Layout>
    );
  }
  if (error) return <Layout><p className="error">Failed to load profile</p></Layout>;

  const p = data?.pensionDetails?.[0];

  return (
    <Layout>
      <ToastContainer />
      <div className="animate-fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 className="page-title" style={{ marginTop: 0 }}>My Profile</h1>
          {!editing && (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              <User size={18} />
              Edit Profile
            </button>
          )}
        </div>

        {msg && <div className="form-success-message"><CheckCircle size={16} />{msg}</div>}

        {/* Profile Hero Card */}
        <div className="card" style={{ marginBottom: 24, padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: getAvatarColor(data.name || ""),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "2rem",
              fontWeight: 800,
              flexShrink: 0
            }}>
              {getInitials()}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: "1.5rem" }}>{data.name || "-"}</h2>
              <p style={{ margin: "0 0 8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                {data.employeeId || "-"}
              </p>
              <span className={`badge ${data.status === "ACTIVE" ? "badge-success" : "badge-warning"}`}>
                {data.status || "Pending"}
              </span>
            </div>
            <div style={{ textAlign: "right", minWidth: 140 }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Profile Completion</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <div style={{ flex: 1, height: 8, background: "var(--border-light)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      width: `${completion}%`,
                      height: "100%",
                       background: completion < 50 ? "#991b1b" : completion < 80 ? "#b9975b" : "#166534",
                      borderRadius: 4,
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{completion}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Editable Info or View Mode */}
        {editing ? (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>Edit Profile</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e)=>setForm({ ...form, email: e.target.value })}
                  icon={<Mail size={18} />}
                  placeholder="name@example.com"
                  autoComplete="email"
                  error={errors.email}
                />
                <FormField
                  label="Address"
                  name="address"
                  type="textarea"
                  value={form.address}
                  onChange={(e)=>setForm({ ...form, address: e.target.value })}
                  icon={<MapPin size={18} />}
                  placeholder="Enter your address"
                  rows={3}
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="submit" className={`btn btn-primary ${updateMutation.isPending ? "btn-loading" : ""}`} disabled={updateMutation.isPending}>
                  <span className="btn-text">{updateMutation.isPending ? "Saving..." : "Save Changes"}</span>
                  <span className="btn-spinner">
                    <div style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} />
                  </span>
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setErrors({}); }}>Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="profile-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            {/* Personal Information */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Personal Information</span>
                <div className="card-icon"><User size={24} /></div>
              </div>
              <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
                {[
                  ["Employee ID", data.employeeId],
                  ["Name", data.name],
                  ["Mobile", data.mobile],
                  ["Email", data.email || "-"],
                  ["Gender", data.gender || "-"],
                  ["Date of Birth", data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : "-"],
                  ["Marital Status", data.maritalStatus || "-"],
                  ["Father / Spouse", data.fatherName || "-"],
                  ["PAN", data.panNumber || "-"],
                  ["Aadhaar", data.aadhaarNumber ? "XXXX-XXXX-" + data.aadhaarNumber.slice(-4) : "-"],
                  ["Blood Group", data.bloodGroup || "-"],
                  ["Emergency Contact", data.emergencyContactName ? `${data.emergencyContactName} (${data.emergencyContactMobile})` : "-"],
                  ["Address", data.address || "-"]
                ].map(([label, value]) => (
                  <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{label as string}</span>
                    <span style={{ fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{value as any}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Employment & Bank */}
            <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 24 }}>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Employment Information</span>
                  <div className="card-icon"><Briefcase size={24} /></div>
                </div>
                <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
                  {[
                    ["Department", data.department || "-"],
                    ["Designation", data.designation || "-"],
                    ["Date of Joining", data.dateOfJoining ? new Date(data.dateOfJoining).toLocaleDateString() : "-"],
                    ["Date of Retirement", data.dateOfRetirement ? new Date(data.dateOfRetirement).toLocaleDateString() : "-"],
                    ["Pension Type", data.pensionType || "-"]
                  ].map(([label, value]) => (
                    <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{label as string}</span>
                      <span style={{ fontWeight: 500 }}>{value as any}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Bank Details</span>
                  <div className="card-icon"><Banknote size={24} /></div>
                </div>
                <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
                  {[
                    ["Account Holder", data.bankAccountHolderName || "-"],
                    ["Account Number", data.bankAccountNumber || "-"],
                    ["IFSC Code", data.bankIfscCode || "-"],
                    ["Account Type", data.bankAccountType || "-"],
                    ["Branch Name", data.bankBranchName || "-"],
                    ["Branch Address", data.bankBranchAddress || "-"]
                  ].map(([label, value]) => (
                    <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{label as string}</span>
                      <span style={{ fontWeight: 500, textAlign: "right" }}>{value as any}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Nominee Details</span>
                  <div className="card-icon"><User size={24} /></div>
                </div>
                <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
                  {[
                    ["Nominee Name", data.nomineeName || "-"],
                    ["Relation", data.nomineeRelation || "-"],
                    ["Share", data.nomineeShare || "-"]
                  ].map(([label, value]) => (
                    <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{label as string}</span>
                      <span style={{ fontWeight: 500 }}>{value as any}</span>
                    </div>
                  ))}
                </div>
              </div>
              {p && (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Current Pension</span>
                    <div className="card-icon"><FileBarChart size={24} /></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 8 }}>
                    {[
                      ["PPO Number", p.ppoNumber],
                      ["Category", p.category || "-"],
                      ["Pension Amount", `₹${p.pensionAmount}`],
                      ["Effective From", new Date(p.effectiveFrom).toLocaleDateString()],
                      ["Bank Name", p.bankName || "-"]
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label as string}</span>
                        <p style={{ fontWeight: 600, fontSize: "1.1rem", marginTop: 4 }}>{value as any}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security Section */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <span className="card-title">Security & Password</span>
            <div className="card-icon"><Lock size={24} /></div>
          </div>
          <form onSubmit={handlePasswordSubmit} noValidate>
            <FormField
              label="Current Password"
              name="oldPassword"
              type={showPassword ? "text" : "password"}
              value={passwordForm.oldPassword}
              onChange={(e)=>setPasswordForm({...passwordForm, oldPassword: e.target.value})}
              icon={<Lock size={18} />}
              required
              error={passwordErrors.oldPassword}
              placeholder="Enter current password"
              autoComplete="current-password"
              rightIcon={
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
              }
            />
            <div className="form-row">
              <FormField
                label="New Password"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e)=>setPasswordForm({...passwordForm, newPassword: e.target.value})}
                icon={<Lock size={18} />}
                required
                error={passwordErrors.newPassword}
                placeholder="Enter new password (min 8 chars)"
                autoComplete="new-password"
                rightIcon={
                  <motion.button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.button>
                }
              />
              <FormField
                label="Confirm New Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e)=>setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                icon={<Lock size={18} />}
                required
                error={passwordErrors.confirmPassword}
                placeholder="Confirm new password"
                autoComplete="new-password"
                rightIcon={
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.button>
                }
              />
            </div>
            <div className="form-actions" style={{ borderTop: "none", padding: 0, justifyContent: "flex-start" }}>
              <button type="submit" className="btn btn-primary">
                <Key size={16} />
                Change Password
              </button>
            </div>
          </form>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
            <div className="card-icon"><Activity size={24} /></div>
          </div>
          <div style={{ marginTop: 12 }}>
            {activityData?.items?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {activityData.items.map((item: any) => (
                  <div key={item.id} style={{
                    display: "flex",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border-light)"
                  }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(26, 79, 139, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <Activity size={18} color="var(--accent)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{item.action || "Activity"}</div>
                      {item.metadata && (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                          {JSON.stringify(item.metadata)}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "24px 12px" }}>
                <Activity size={32} />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
function PensionHistory(){
  const { data, isLoading, error } = useQuery({
    queryKey: ["pensionHistory"],
    queryFn: async () => (await api.get("/pensioner/pension")).data.data
  });

  if (isLoading) return <Layout><div className="skeleton" style={{ height: 200 }} /></Layout>;
  if (error) return <Layout><p className="error">Failed to load pension history</p></Layout>;
  if (!data?.length) return <Layout><div className="empty-state"><FileText size={48} /><h3>No pension history</h3><p>Your pension history will appear here.</p></div></Layout>;

  return (
    <Layout>
      <div className="animate-fade-in">
        <h1 className="page-title" style={{ marginBottom: 20, marginTop: 0 }}>Pension History</h1>
        <div className="table-container">
          <DataTable
            data={data}
            columns={[
              { key: "ppoNumber", label: "PPO Number", sortable: true, accessor: (row: any) => <span style={{ fontWeight: 600, color: "var(--primary)" }}>{row.ppoNumber}</span> },
              { key: "pensionType", label: "Type", sortable: true, accessor: (row) => row.pensionType || "-" },
              { key: "category", label: "Category", sortable: true, accessor: (row) => row.category || "-" },
              { key: "basicPension", label: "Basic Pension", sortable: false, accessor: (row) => `₹${row.basicPension}` },
              { key: "da", label: "DA", sortable: false, accessor: (row) => `₹${row.da}` },
              { key: "hra", label: "HRA", sortable: false, accessor: (row) => `₹${row.hra}` },
              { key: "medicalAllowance", label: "Medical", sortable: false, accessor: (row) => `₹${row.medicalAllowance}` },
              { key: "otherAllowances", label: "Other", sortable: false, accessor: (row) => `₹${row.otherAllowances}` },
              { key: "deductions", label: "Deductions", sortable: false, accessor: (row) => <span style={{ color: "#e53e3e" }}>₹{row.deductions}</span> },
              { key: "pensionAmount", label: "Net Amount", sortable: true, accessor: (row) => <span style={{ fontWeight: 700, color: "#22543d" }}>₹{row.pensionAmount}</span> },
              { key: "effectiveFrom", label: "From", sortable: true, accessor: (row) => row.effectiveFrom ? new Date(row.effectiveFrom).toLocaleDateString() : "-" },
              { key: "effectiveTo", label: "To", sortable: true, accessor: (row) => row.effectiveTo ? new Date(row.effectiveTo).toLocaleDateString() : "-" },
              {
                key: "status",
                label: "Status",
                sortable: true,
                accessor: (row) => <span className="badge badge-success">{row.status}</span>
              }
            ]}
            searchFields={["ppoNumber", "pensionType", "category"]}
            searchPlaceholder="Search PPO Number..."
            enableSearch={true}
            enableSorting={true}
            enableExport={true}
            exportFilename={`pension-history-${new Date().toISOString().slice(0,10)}`}
            paginated={false}
            isLoading={false}
            emptyMessage="No pension history"
            emptyIcon={<FileText size={48} />}
            rowKey={(item: any) => item.id}
          />
        </div>
      </div>
    </Layout>
  );
}
function PensionSlips(){
  const { data, isLoading, error } = useQuery({
    queryKey: ["pensionSlips"],
    queryFn: async () => (await api.get("/pensioner/slips")).data.data
  });

  const download = async (id: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/pensioner/slips/${id}/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("pensionerToken")}` }
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

  if (isLoading) return <Layout><div className="skeleton" style={{ height: 200 }} /></Layout>;
  if (error) return <Layout><p className="error">Failed to load slips</p></Layout>;
  if (!data?.length) return <Layout><div className="empty-state"><FileBarChart size={48} /><h3>No pension slips</h3><p>Your pension slips will appear here once generated.</p></div></Layout>;

  return (
    <Layout>
      <div className="animate-fade-in">
        <h1 className="page-title" style={{ marginBottom: 20, marginTop: 0 }}>Pension Slips</h1>
        <div className="table-container">
          <DataTable
            data={data}
            columns={[
              { key: "month", label: "Month", sortable: true, accessor: (row: any) => <span style={{ fontWeight: 600 }}>{row.month}</span> },
              { key: "year", label: "Year", sortable: true },
              { key: "grossAmount", label: "Gross Amount", sortable: true, accessor: (row) => `₹${row.grossAmount}` },
              { key: "deductions", label: "Deductions", sortable: true, accessor: (row) => <span style={{ color: "#e53e3e" }}>₹{row.deductions}</span> },
              { key: "netAmount", label: "Net Amount", sortable: true, accessor: (row) => <span style={{ fontWeight: 700, color: "#22543d" }}>₹{row.netAmount}</span> },
              {
                key: "status",
                label: "Status",
                sortable: true,
                accessor: (row) => <span className="badge badge-success">{row.status || "Pending"}</span>
              }
            ]}
            searchFields={["month", "year", "status"]}
            searchPlaceholder="Search slips..."
            enableSearch={true}
            enableSorting={true}
            enableExport={true}
            exportFilename={`pension-slips-${new Date().toISOString().slice(0,10)}`}
            paginated={false}
            isLoading={false}
            emptyMessage="No pension slips"
            emptyIcon={<FileBarChart size={48} />}
            actions={(item: any) => (
              <motion.button
                className="btn btn-primary btn-sm"
                onClick={() => download(item.id)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={14} />
                PDF
              </motion.button>
            )}
            rowKey={(item: any) => item.id}
          />
        </div>
      </div>
    </Layout>
  );
}
function Policies(){
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => (await api.get("/pensioner/policies")).data.data
  });

  const acknowledge = useMutation({
    mutationFn: async (id: string) => (await api.patch(`/pensioner/policies/${id}/acknowledge`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toastStore.add({
        type: "success",
        title: "Policy Acknowledged",
        message: "Policy has been acknowledged successfully."
      });
    },
    onError: () => {
      toastStore.add({
        type: "error",
        title: "Acknowledgement Failed",
        message: "Failed to acknowledge policy."
      });
    }
  });

  if (isLoading) return <Layout><div className="skeleton" style={{ height: 200 }} /></Layout>;
  if (error) return <Layout><p className="error">Failed to load policies</p></Layout>;
  if (!data?.length) return <Layout><div className="empty-state"><Shield size={48} /><h3>No policies</h3><p>You will see available policies here.</p></div></Layout>;

  return (
    <Layout>
      <div className="animate-fade-in">
         <motion.h1 className="page-title" style={{ marginBottom: 20, marginTop: 0 }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>Policies</motion.h1>
         <motion.div
           className="grid"
           initial="hidden"
           animate="visible"
           variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
         >
           {data?.map((item: any, i: number) => (
             <motion.div
               key={item.id}
               className="card"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               whileHover={{ y: -3 }}
             >
              <div className="card-header">
                <span className="card-title">Policy</span>
                <div className="card-icon"><Shield size={24} /></div>
              </div>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>{item.policy?.title || "Policy"}</h3>
              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Policy Number</span>
                  <span style={{ fontWeight: 500 }}>{item.policy?.policyNumber || "-"}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Coverage</span>
                  <p style={{ marginTop: 4, fontSize: "0.9rem" }}>{item.policy?.coverageDetails || "No details available"}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Valid From</span>
                  <span style={{ fontWeight: 500 }}>{item.policy?.validFrom ? new Date(item.policy.validFrom).toLocaleDateString() : "-"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Valid To</span>
                  <span style={{ fontWeight: 500 }}>{item.policy?.validTo ? new Date(item.policy.validTo).toLocaleDateString() : "-"}</span>
                </div>
              </div>
              {item.acknowledgedAt ? (
                <div style={{ background: "#c6f6d5", padding: 12, borderRadius: "var(--radius)", color: "#22543d", fontSize: "0.9rem", fontWeight: 500 }}>
                  Acknowledged on {new Date(item.acknowledgedAt).toLocaleDateString()}
                </div>
              ) : (
                <motion.button
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => acknowledge.mutate(item.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Acknowledge & Consent
                </motion.button>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Layout>
  );
}
function Notifications(){
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: async () => (await api.get("/pensioner/notifications", { params: { read: filter === "all" ? undefined : filter === "read" } })).data.data
  });

  const markRead = async (id: string) => {
    await api.patch(`/pensioner/notifications/${id}/read`);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    toastStore.add({
      type: "success",
      title: "Marked as Read",
      message: "Notification has been marked as read."
    });
  };

  const markAllRead = async () => {
    await api.patch("/pensioner/notifications/read-all");
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    toastStore.add({
      type: "success",
      title: "All Marked as Read",
      message: "All notifications have been marked as read."
    });
  };

  if (isLoading) return <Layout><div className="skeleton" style={{ height: 200 }} /></Layout>;
  if (error) return <Layout><p className="error">Failed to load notifications</p></Layout>;
  if (!data?.items?.length) return <Layout><div className="empty-state"><Bell size={48} /><h3>No notifications</h3><p>You're all caught up!</p></div></Layout>;

  const items = data?.items || [];
  const unreadCount = items.filter((n: any) => !n.readAt).length;

  return (
    <Layout>
      <ToastContainer />
      <div className="animate-fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 className="page-title" style={{ marginTop: 0 }}>Notifications</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {unreadCount > 0 && (
              <span className="badge badge-warning">{unreadCount} unread</span>
            )}
            <motion.button
              className="btn btn-secondary btn-sm"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Bell size={18} />
              Mark All Read
            </motion.button>
          </div>
        </div>

         <motion.div className="notification-toolbar" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
           <div className="datatable-search">
             <Search size={18} />
             <input
               type="text"
               placeholder="Search notifications..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           <div className="notification-filters">
             <motion.button className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-secondary"}`} onClick={() => setFilter("all")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>All</motion.button>
             <motion.button className={`btn btn-sm ${filter === "unread" ? "btn-primary" : "btn-secondary"}`} onClick={() => setFilter("unread")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>Unread</motion.button>
             <motion.button className={`btn btn-sm ${filter === "read" ? "btn-primary" : "btn-secondary"}`} onClick={() => setFilter("read")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>Read</motion.button>
           </div>
         </motion.div>

         <motion.div
           className="notification-panel"
           initial="hidden"
           animate="visible"
           variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
         >
           {items
             .filter((row: any) => {
               const matches = row.notification?.title?.toLowerCase().includes(search.toLowerCase()) ||
                 row.notification?.message?.toLowerCase().includes(search.toLowerCase());
               return matches;
             })
             .map((row: any, idx: number) => {
               const isUnread = !row.readAt;
               const priority = isUnread ? "high" : "low";
               const priorityLabel = isUnread ? "Unread" : "Read";

               return (
                 <motion.div
                   key={row.id}
                   className={`notification-card ${isUnread ? "unread" : "read"}`}
                   onClick={() => !isUnread && markRead(row.id)}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   whileHover={{ x: isUnread ? 5 : 0 }}
                 >
                  <div className="notification-card-header">
                    <h3 className="notification-card-title">{row.notification?.title}</h3>
                    <div className="notification-card-meta">
                      <span className={`notification-badge priority-${priority}`}>
                        {priorityLabel}
                      </span>
                    </div>
                  </div>

                  <div className="notification-card-message">
                    {row.notification?.message}
                  </div>

                  <div className="notification-card-stats">
                    <span className="notification-card-stat">
                      <Calendar size={14} />
                      {row.notification?.createdAt
                        ? new Date(row.notification.createdAt).toLocaleDateString()
                        : "-"}
                    </span>
                    {isUnread && (
                      <motion.button
                        className="btn btn-primary btn-sm"
                        style={{ marginLeft: "auto" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead(row.id);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <CheckCircle size={14} />
                        Mark Read
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            }              )}
            </motion.div>
          </div>
        </Layout>
      );
}
function Grievances(){
  const [selectedId, setSelectedId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);

  const loadList = () => api.get("/pensioner/grievances").then(r => setList(r.data.data.items || []));
  const loadDetail = (id: string) => api.get(`/pensioner/grievances/${id}`).then(r => { setDetail(r.data.data); setSelectedId(id); });

  useEffect(() => { void loadList(); }, []);

  async function create(e:FormEvent){
    e.preventDefault();
    setError("");setMsg("");
    const errs: Record<string, string> = {};
    if (!subject) errs.subject = "Subject is required";
    if (!description) errs.description = "Description is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    try{
      await api.post("/pensioner/grievances",{subject,description});
      setMsg("Grievance submitted successfully");
      setSubject("");setDescription("");
      setErrors({});
      loadList();
    }catch(err:any){setError(err.response?.data?.message||"Failed")}finally{setSubmitting(false)}
  }

  return (
    <Layout>
         <h1 className="page-title" style={{ marginTop: 0 }}>Grievances</h1>
       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
         <form className="card" onSubmit={create} noValidate>
           <FormField
             label="Subject"
             name="subject"
             value={subject}
             onChange={(e)=>setSubject(e.target.value)}
             icon={<MessageSquare size={18} />}
             required
             error={errors.subject}
             placeholder="Enter grievance subject"
           />
           <FormField
             label="Description"
             name="description"
             type="textarea"
             value={description}
             onChange={(e)=>setDescription(e.target.value)}
             icon={<FileText size={18} />}
             required
             error={errors.description}
             placeholder="Enter detailed description..."
             rows={4}
           />
           {error && <div className="form-error">{error}</div>}
           {msg && <div className="form-success-message"><CheckCircle size={16} />{msg}</div>}
           <motion.button
            type="submit"
            className={`btn btn-primary ${submitting ? "btn-loading" : ""}`}
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="btn-text">{submitting ? "Submitting..." : "Submit Grievance"}</span>
            <span className="btn-spinner">
              <div style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} />
            </span>
          </motion.button>
        </form>
      </motion.div>

      <h2 style={{ marginTop: 32 }}>My Grievances</h2>
      <motion.div
        className="cards"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
      >
        {list.map((v, i) => (
          <motion.div
            className="card"
            key={v.id}
            style={{ cursor: "pointer" }}
            onClick={() => loadDetail(v.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3, boxShadow: "var(--shadow-lg)" }}
          >
            <h3>{v.subject}</h3>
            <p>{v.description}</p>
            <b>{v.status}</b>
            {v.adminReply && <p style={{ color: "#16a34a" }}>Admin reply: {v.adminReply}</p>}
          </motion.div>
        ))}
      </motion.div>

      {selectedId && detail && (
        <motion.div
          className="card"
          style={{ marginTop: 24, padding: 24 }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ marginTop: 0 }}>{detail.subject}</h2>
            <motion.button className="btn btn-secondary btn-sm" onClick={() => { setSelectedId(""); setDetail(null); }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Close</motion.button>
          </div>
          <p><b>Status:</b> {detail.status}</p>
          <p><b>Description:</b> {detail.description}</p>
          {detail.adminReply && <p><b>Admin Reply:</b> {detail.adminReply}</p>}
           <h3 style={{ marginTop: 20 }}>Timeline</h3>
           <div className="table-container" style={{ marginTop: 0 }}>
             <DataTable
               data={detail.history || []}
               columns={[
                 { key: "action", label: "Action", sortable: false, accessor: (row: any) => <span style={{ fontWeight: 500 }}>{row.action}</span> },
                 { key: "fromStatus", label: "From", sortable: false, accessor: (row) => row.fromStatus || "-" },
                 { key: "toStatus", label: "To", sortable: false, accessor: (row) => row.toStatus || "-" },
                 { key: "note", label: "Note", sortable: false, accessor: (row) => row.note || "-" },
                 { key: "performedAt", label: "Date", sortable: false, accessor: (row) => new Date(row.performedAt).toLocaleString() }
               ]}
               enableSearch={false}
               enableSorting={false}
               enableExport={false}
               paginated={false}
               isLoading={false}
               emptyMessage="No history"
               rowKey={(item: any) => item.id}
             />
           </div>
           <h3 style={{ marginTop: 20 }}>Attachments</h3>
           <motion.div
             className="cards"
             initial="hidden"
             animate="visible"
             variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
           >
             {detail.attachments?.map((att: any, idx: number) => (
               <motion.div
                 className="card"
                 key={att.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.03 }}
                 whileHover={{ y: -2 }}
               >
                 <a href={att.url} target="_blank" rel="noreferrer">{att.filename}</a>
               </motion.div>
             ))}
           </motion.div>
        </motion.div>
      )}
    </Layout>
  );
}
function Lead(){
  const [f,setF]=useState({name:"",mobile:"",product:"",remarks:""});
  const [msg,setMsg]=useState("");
  const [error,setError]=useState("");
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [submitting,setSubmitting]=useState(false);

  const formFields = [
    { key:"name" as const, label:"Name", icon:User, placeholder:"Enter your name", required:true },
    { key:"mobile" as const, label:"Mobile", icon:Phone, placeholder:"9999999999", required:true, type:"tel" as const, maxLength:10 },
    { key:"product" as const, label:"Product", icon:FileText, placeholder:"e.g. Pension Policy", required:true },
    { key:"remarks" as const, label:"Remarks", icon:MessageSquare, placeholder:"Enter remarks", required:false, type:"textarea" as const }
  ];

  function validate(){
    const e:Record<string,string>={};
    if(!f.name)e.name="Name is required";
    if(!f.mobile||!/^[6-9]\d{9}$/.test(f.mobile))e.mobile="Valid 10-digit mobile required";
    if(!f.product)e.product="Product is required";
    setErrors(e);
    return Object.keys(e).length===0;
  }

  async function go(e:FormEvent){
    e.preventDefault();
    setError("");setMsg("");
    if(!validate())return;
    setSubmitting(true);
    try{
      await api.post("/pensioner/leads",{...f,mobile:f.mobile});
      setMsg("Lead submitted successfully");
      setF({name:"",mobile:"",product:"",remarks:""});
    }catch(e:any){setError(e.response?.data?.message||"Submission failed")}finally{setSubmitting(false)}
  }

  return (
    <Layout>
      <h1 className="page-title" style={{ marginTop: 0 }}>Lead Generation</h1>
      <form className="card" onSubmit={go} noValidate>
        {formFields.map(fld => {
          const Icon=fld.icon;
          return (
            <FormField
              key={fld.key}
              label={fld.label}
              name={fld.key}
              type={fld.type || "text"}
              value={(f as any)[fld.key]}
              onChange={(e:any)=>setF({...f,[fld.key]:e.target.value})}
              icon={<Icon size={18} />}
              required={fld.required}
              error={errors[fld.key]}
              placeholder={fld.placeholder}
              maxLength={fld.maxLength}
              rows={fld.type==="textarea"?3:undefined}
              autoComplete="off"
            />
          );
        })}
        {msg && <div className="form-success-message"><CheckCircle size={16} />{msg}</div>}
        {error && <div className="form-error">{error}</div>}
        <button type="submit" className={`btn btn-primary ${submitting ? "btn-loading" : ""}`} disabled={submitting}>
          <span className="btn-text">{submitting ? "Submitting..." : "Submit Lead"}</span>
          <span className="btn-spinner">
            <div style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} />
          </span>
        </button>
      </form>
    </Layout>
  );
}
function Jeevan(){
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["jeevan"],
    queryFn: async () => (await api.get("/pensioner/jeevan")).data.data.items
  });

  const [form, setForm] = useState({ applicationNumber: "", status: "NOT_SUBMITTED", submissionDate: "", remarks: "" });
  const [msg, setMsg] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => (await api.post("/pensioner/jeevan", form)).data,
    onSuccess: () => {
      setMsg("Record submitted successfully");
      setForm({ applicationNumber: "", status: "NOT_SUBMITTED", submissionDate: "", remarks: "" });
      queryClient.invalidateQueries({ queryKey: ["jeevan"] });
    }
  });

  if (isLoading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p className="error">Failed to load Jeevan Pramaan records</p></Layout>;

  const records = data || [];

  return (
    <Layout>
      <h1 className="page-title" style={{ marginTop: 0 }}>Jeevan Pramaan</h1>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Official Government Portal</h3>
        <p style={{ marginBottom: 14 }}>
          Submit or verify your Jeevan Pramaan certificate through the official government portal.
        </p>
        <a
          href="https://jeevanpramaan.gov.in/"
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          Open Jeevan Pramaan Portal
        </a>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Submit New Record</h3>
        <FormField
          label="Application Number"
          name="applicationNumber"
          value={form.applicationNumber}
          onChange={(e)=>setForm({ ...form, applicationNumber: e.target.value })}
          icon={<FileText size={18} />}
          placeholder="Enter application number"
        />
        <FormField
          label="Status"
          name="status"
          type="select"
          options={[
            { value: "NOT_SUBMITTED", label: "Not Submitted" },
            { value: "SUBMITTED", label: "Submitted" },
            { value: "VERIFIED", label: "Verified" },
            { value: "REJECTED", label: "Rejected" },
            { value: "EXPIRED", label: "Expired" }
          ]}
          value={form.status}
          onChange={(e)=>setForm({ ...form, status: e.target.value })}
          placeholder="Select"
        />
        <FormField
          label="Submission Date"
          name="submissionDate"
          type="date"
          value={form.submissionDate}
          onChange={(e)=>setForm({ ...form, submissionDate: e.target.value })}
          icon={<Calendar size={18} />}
        />
        <FormField
          label="Remarks"
          name="remarks"
          type="textarea"
          value={form.remarks}
          onChange={(e)=>setForm({ ...form, remarks: e.target.value })}
          icon={<FileText size={18} />}
          placeholder="Enter remarks"
          rows={2}
        />
        {msg && <div className="form-success-message"><CheckCircle size={16} />{msg}</div>}
        <button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className={`btn btn-primary ${createMutation.isPending ? "btn-loading" : ""}`}
        >
          <span className="btn-text">{createMutation.isPending ? "Submitting..." : "Submit Record"}</span>
          <span className="btn-spinner">
            <div style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} />
          </span>
        </button>
      </div>

      <h2 style={{ marginTop: 32 }}>Your Records</h2>
      <div className="cards">
        {records.map((item: any) => (
          <div className="card" key={item.id}>
            <p><b>Application Number:</b> {item.applicationNumber || "-"}</p>
            <p><b>Status:</b> {item.status}</p>
            <p><b>Submission Date:</b> {item.submissionDate ? new Date(item.submissionDate).toLocaleDateString() : "-"}</p>
            <p><b>Remarks:</b> {item.remarks || "-"}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
export default function App(){const t=localStorage.getItem("pensionerToken");return <Routes><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>{t?<><Route path="/" element={<Dash/>}/><Route path="/profile" element={<Profile/>}/><Route path="/pension" element={<PensionHistory/>}/><Route path="/slips" element={<PensionSlips/>}/><Route path="/policies" element={<Policies/>}/><Route path="/notifications" element={<Notifications/>}/><Route path="/grievances" element={<Grievances/>}/><Route path="/leads" element={<Lead/>}/><Route path="/jeevan" element={<Jeevan/>}/></>:<Route path="*" element={<Navigate to="/login"/>}/>}</Routes>}
