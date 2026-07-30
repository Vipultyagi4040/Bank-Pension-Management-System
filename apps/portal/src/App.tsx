import { FormEvent, useEffect, useState } from "react";
import { Navigate, Route, Routes, Link, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, User, FileText, Bell, MessageSquare, Users, FileBarChart, LogOut, Menu, X, Shield, Smartphone, Search } from "lucide-react";
import { api } from "./api";

function Login(){
  const [mobile,setMobile]=useState("9999999999"),[otp,setOtp]=useState(""),[stage,setStage]=useState(false),[dev,setDev]=useState(""),[error,setError]=useState("");
  async function submit(e:FormEvent){e.preventDefault();setError("");try{if(!stage){const r=await api.post("/auth/pensioner/request-otp",{mobile});setDev(r.data.data.developmentOtp||"");setStage(true)}else{const r=await api.post("/auth/pensioner/verify-otp",{mobile,otp});localStorage.setItem("pensionerToken",r.data.data.accessToken);location.href="/"}}catch(e:any){setError(e.response?.data?.message||"Request failed")}}
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🏦</div>
          <h1>Pensioner Portal</h1>
          <p>Secure login with your registered mobile number</p>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div style={{ position: "relative" }}>
              <Smartphone size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input className="form-input" style={{ paddingLeft: 44 }} value={mobile} onChange={e=>setMobile(e.target.value)} maxLength={10} placeholder="Enter 10-digit mobile number" required />
            </div>
          </div>
          {stage && (
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input className="form-input" placeholder="Enter 6-digit OTP" value={otp} onChange={e=>setOtp(e.target.value)} maxLength={6} required />
              {dev && <p style={{ color: "var(--primary)", fontSize: "0.85rem", marginTop: 6 }}>Development OTP: <strong>{dev}</strong></p>}
            </div>
          )}
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
            {stage ? "Verify OTP" : "Send OTP"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Demo: 9999999999 / OTP 123456
        </p>
      </div>
    </div>
  );
}
function Register(){
  const [f,setF]=useState({employeeId:"",mobile:"",email:"",address:""}),[msg,setMsg]=useState(""),[error,setError]=useState("");
  async function go(e:FormEvent){e.preventDefault();setError("");setMsg("");try{const r=await api.post("/auth/pensioner/register",f);setMsg(r.data.message);setF({employeeId:"",mobile:"",email:"",address:""})}catch(e:any){setError(e.response?.data?.message||"Registration failed")}}
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🏦</div>
          <h1>Complete Registration</h1>
          <p>Submit your details for approval</p>
        </div>
        <form onSubmit={go}>
          {Object.keys(f).map(k=>(
            <div className="form-group" key={k}>
              <label className="form-label" style={{ textTransform: "capitalize" }}>{k}</label>
              <input className="form-input" placeholder={k} value={(f as any)[k]} onChange={e=>setF({...f,[k]:e.target.value})} required />
            </div>
          ))}
          {msg && <div style={{ color: "#16a34a", fontSize: "0.9rem", marginBottom: 12 }}>{msg}</div>}
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>Submit for Approval</button>
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

  const getPageTitle = () => {
    const item = navItems.find(item => location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to)));
    return item?.label || "Dashboard";
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav className="top-nav">
        <div className="nav-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              className="nav-icon-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: "none", background: "none", color: "white", border: "none" }}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="nav-brand">
              <span className="nav-brand-icon">🏦</span>
              Pension Portal
            </Link>
          </div>
          <div className="nav-links">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to)) ? "active" : ""}
              >
                <item.icon size={18} style={{ marginRight: 6, verticalAlign: "middle" }} />
                {item.label}
              </Link>
            ))}
          </div>
          <div className="nav-user">
            <button
              className="nav-links"
              onClick={() => { localStorage.removeItem("pensionerToken"); window.location.href = "/login"; }}
              style={{ background: "rgba(255,255,255,0.15)", borderRadius: "var(--radius)", padding: "8px 14px" }}
            >
              <LogOut size={18} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="shell" style={{ paddingTop: 24 }}>
        <div className="page-header" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
function Dash(){
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/pensioner/dashboard")).data.data
  });

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
  if (error) return <Layout><p className="error">Failed to load dashboard</p></Layout>;

  const p = data?.profile?.pensionDetails?.[0];

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="cards">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Current Pension</span>
              <div className="card-icon"><FileText size={24} /></div>
            </div>
            <div className="card-value">₹{p?.pensionAmount ?? "-"}</div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>PPO: {p?.ppoNumber || "-"}</p>
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Open Grievances</span>
              <div className="card-icon"><MessageSquare size={24} /></div>
            </div>
            <div className="card-value">{data?.counters?.openGrievances ?? 0}</div>
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Unread Notifications</span>
              <div className="card-icon"><Bell size={24} /></div>
            </div>
            <div className="card-value">{data?.counters?.unreadNotifications ?? 0}</div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Personal Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Name</span>
              <p style={{ fontWeight: 600 }}>{data?.profile?.name || "-"}</p>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Employee ID</span>
              <p style={{ fontWeight: 600 }}>{data?.profile?.employeeId || "-"}</p>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Mobile</span>
              <p style={{ fontWeight: 600 }}>{data?.profile?.mobile || "-"}</p>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Department</span>
              <p style={{ fontWeight: 600 }}>{data?.profile?.department || "-"}</p>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Designation</span>
              <p style={{ fontWeight: 600 }}>{data?.profile?.designation || "-"}</p>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</span>
              <p><span className="badge badge-success">{data?.profile?.status || "-"}</span></p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
function Profile(){
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["pensionerProfile"],
    queryFn: async () => (await api.get("/pensioner/profile")).data.data
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ email: "", address: "" });
  const [msg, setMsg] = useState("");

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
      setMsg("Profile updated successfully");
      setTimeout(() => setMsg(""), 3000);
    }
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateMutation.mutate(form);
  }

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
      <div className="animate-fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 className="page-title">My Profile</h1>
          {!editing && (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              <User size={18} />
              Edit Profile
            </button>
          )}
        </div>
        {msg && <div className="card" style={{ marginBottom: 20, background: "#c6f6d5", border: "1px solid #9ae6b4", color: "#22543d" }}>{msg}</div>}

        {editing ? (
          <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>Edit Profile</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-textarea" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={3} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid">
            <div className="card">
              <div className="card-header">
                <span className="card-title">Personal Information</span>
                <div className="card-icon"><User size={24} /></div>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
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
                  ["Address", data.address || "-"],
                  ["Status", <span key="status" className="badge badge-success">{data.status}</span>]
                ].map(([label, value]) => (
                  <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{label as string}</span>
                    <span style={{ fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{value as any}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Employment Information</span>
                <div className="card-icon"><Users size={24} /></div>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
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
                <div className="card-icon"><FileText size={24} /></div>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
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
              <div style={{ display: "grid", gap: 12 }}>
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
              <div className="card" style={{ gridColumn: "1 / -1" }}>
                <div className="card-header">
                  <span className="card-title">Current Pension</span>
                  <div className="card-icon"><FileBarChart size={24} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
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
        )}
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
        <h1 className="page-title" style={{ marginBottom: 20 }}>Pension History</h1>
        <div className="table-container">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PPO Number</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Basic Pension</th>
                  <th>DA</th>
                  <th>HRA</th>
                  <th>Medical</th>
                  <th>Other</th>
                  <th>Deductions</th>
                  <th>Net Amount</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item: any) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: "var(--primary)" }}>{item.ppoNumber}</td>
                    <td>{item.pensionType || "-"}</td>
                    <td>{item.category || "-"}</td>
                    <td>₹{item.basicPension}</td>
                    <td>₹{item.da}</td>
                    <td>₹{item.hra}</td>
                    <td>₹{item.medicalAllowance}</td>
                    <td>₹{item.otherAllowances}</td>
                    <td style={{ color: "#e53e3e" }}>₹{item.deductions}</td>
                    <td style={{ fontWeight: 700, color: "#22543d" }}>₹{item.pensionAmount}</td>
                    <td>{item.effectiveFrom ? new Date(item.effectiveFrom).toLocaleDateString() : "-"}</td>
                    <td>{item.effectiveTo ? new Date(item.effectiveTo).toLocaleDateString() : "-"}</td>
                    <td><span className="badge badge-success">{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        <h1 className="page-title" style={{ marginBottom: 20 }}>Pension Slips</h1>
        <div className="table-container">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Gross Amount</th>
                  <th>Deductions</th>
                  <th>Net Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item: any) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.month}</td>
                    <td>{item.year}</td>
                    <td>₹{item.grossAmount}</td>
                    <td style={{ color: "#e53e3e" }}>₹{item.deductions}</td>
                    <td style={{ fontWeight: 700, color: "#22543d" }}>₹{item.netAmount}</td>
                    <td><span className="badge badge-success">{item.status || "Pending"}</span></td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => download(item.id)}>
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["policies"] })
  });

  if (isLoading) return <Layout><div className="skeleton" style={{ height: 200 }} /></Layout>;
  if (error) return <Layout><p className="error">Failed to load policies</p></Layout>;
  if (!data?.length) return <Layout><div className="empty-state"><Shield size={48} /><h3>No policies</h3><p>You will see available policies here.</p></div></Layout>;

  return (
    <Layout>
      <div className="animate-fade-in">
        <h1 className="page-title" style={{ marginBottom: 20 }}>Policies</h1>
        <div className="grid">
          {data?.map((item: any) => (
            <div key={item.id} className="card">
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
                <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => acknowledge.mutate(item.id)}>
                  Acknowledge & Consent
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
function Notifications(){
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: async () => (await api.get("/pensioner/notifications", { params: { read: filter || undefined } })).data.data
  });

  const markRead = async (id: string) => {
    await api.patch(`/pensioner/notifications/${id}/read`);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markAllRead = async () => {
    await api.patch("/pensioner/notifications/read-all");
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  if (isLoading) return <Layout><div className="skeleton" style={{ height: 200 }} /></Layout>;
  if (error) return <Layout><p className="error">Failed to load notifications</p></Layout>;
  if (!data?.items?.length) return <Layout><div className="empty-state"><Bell size={48} /><h3>No notifications</h3><p>You're all caught up!</p></div></Layout>;

  return (
    <Layout>
      <div className="animate-fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 className="page-title">Notifications</h1>
          <button className="btn btn-secondary" onClick={markAllRead}>
            <Bell size={18} />
            Mark All Read
          </button>
        </div>
        <div className="table-container">
          <div className="table-toolbar">
            <div className="table-search">
              <Search />
              <input type="text" placeholder="Search notifications..." />
            </div>
            <div className="table-filters">
              <select value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="">All</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </select>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.map((item: any) => (
                  <tr key={item.id} style={{ opacity: item.readAt ? 0.7 : 1 }}>
                    <td style={{ fontWeight: 600 }}>{item.notification?.title}</td>
                    <td style={{ maxWidth: 400 }}>{item.notification?.message}</td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{item.notification?.createdAt ? new Date(item.notification.createdAt).toLocaleString() : "-"}</td>
                    <td>
                      <span className={`badge ${item.readAt ? "badge-success" : "badge-warning"}`}>
                        {item.readAt ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td>
                      {!item.readAt && (
                        <button className="btn btn-primary btn-sm" onClick={() => markRead(item.id)}>
                          Mark as Read
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
function Grievances(){
  const [selectedId, setSelectedId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);

  const loadList = () => api.get("/pensioner/grievances").then(r => setList(r.data.data));
  const loadDetail = (id: string) => api.get(`/pensioner/grievances/${id}`).then(r => { setDetail(r.data.data); setSelectedId(id); });

  useEffect(() => { void loadList(); }, []);

  async function create(e:FormEvent){e.preventDefault();setError("");try{await api.post("/pensioner/grievances",{subject,description});setSubject("");setDescription("");loadList()}catch(err:any){setError(err.response?.data?.message||"Failed")}}

  return (
    <Layout>
      <h1>Grievances</h1>
      <form className="card" onSubmit={create}>
        <div className="form-group">
          <label>Subject</label>
          <input className="input" placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea className="input" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} required />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn">Submit Grievance</button>
      </form>

      <h2 style={{ marginTop: 32 }}>My Grievances</h2>
      <div className="cards">
        {list.map(v=>(
          <div className="card" key={v.id} style={{cursor:"pointer"}} onClick={()=>loadDetail(v.id)}>
            <h3>{v.subject}</h3>
            <p>{v.description}</p>
            <b>{v.status}</b>
            {v.adminReply && <p style={{color:"#16a34a"}}>Admin reply: {v.adminReply}</p>}
          </div>
        ))}
      </div>

      {selectedId && detail && (
        <div className="card" style={{ marginTop: 24, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ marginTop: 0 }}>{detail.subject}</h2>
            <button className="secondary" onClick={() => { setSelectedId(""); setDetail(null); }}>Close</button>
          </div>
          <p><b>Status:</b> {detail.status}</p>
          <p><b>Description:</b> {detail.description}</p>
          {detail.adminReply && <p><b>Admin Reply:</b> {detail.adminReply}</p>}
          <h3 style={{ marginTop: 20 }}>Timeline</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Action</th><th>From</th><th>To</th><th>Note</th><th>Date</th></tr></thead>
              <tbody>
                {detail.history?.map((h: any) => (
                  <tr key={h.id}>
                    <td>{h.action}</td>
                    <td>{h.fromStatus || "-"}</td>
                    <td>{h.toStatus || "-"}</td>
                    <td>{h.note || "-"}</td>
                    <td>{new Date(h.performedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 style={{ marginTop: 20 }}>Attachments</h3>
          <div className="cards">
            {detail.attachments?.map((att: any) => (
              <div className="card" key={att.id}>
                <a href={att.url} target="_blank" rel="noreferrer">{att.filename}</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
function Lead(){
  const [f,setF]=useState({name:"",mobile:"",product:"",remarks:""}),[msg,setMsg]=useState("");
  async function go(e:FormEvent){e.preventDefault();await api.post("/pensioner/leads",f);setMsg("Lead submitted successfully");setF({name:"",mobile:"",product:"",remarks:""})}
  return (
    <Layout>
      <h1>Lead Generation</h1>
      <form className="card" onSubmit={go}>
        {Object.keys(f).map(k=>(
          <input className="input" key={k} placeholder={k} value={(f as any)[k]} onChange={e=>setF({...f,[k]:e.target.value})} />
        ))}
        <button className="btn">Submit Lead</button>
        {msg && <p>{msg}</p>}
      </form>
    </Layout>
  );
}
function Jeevan(){
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["jeevan"],
    queryFn: async () => (await api.get("/pensioner/jeevan")).data.data
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

  return (
    <Layout>
      <h1>Jeevan Pramaan</h1>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Official Government Portal</h3>
        <p style={{ marginBottom: 14 }}>
          Submit or verify your Jeevan Pramaan certificate through the official government portal.
        </p>
        <a
          href="https://jeevanpramaan.gov.in/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            background: "#1d5fd1",
            color: "white",
            padding: "12px 18px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600
          }}
        >
          Open Jeevan Pramaan Portal
        </a>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Submit New Record</h3>
        <div className="form-group">
          <label>Application Number</label>
          <input className="input" value={form.applicationNumber} onChange={e => setForm({ ...form, applicationNumber: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="NOT_SUBMITTED">Not Submitted</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
        <div className="form-group">
          <label>Submission Date</label>
          <input className="input" type="date" value={form.submissionDate} onChange={e => setForm({ ...form, submissionDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Remarks</label>
          <textarea className="input" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} rows={2} />
        </div>
        {msg && <p style={{ color: "#16a34a", marginBottom: 12 }}>{msg}</p>}
        <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          {createMutation.isPending ? "Submitting..." : "Submit Record"}
        </button>
      </div>

      <h2 style={{ marginTop: 32 }}>Your Records</h2>
      <div className="cards">
        {data?.map((item: any) => (
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
