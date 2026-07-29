import { FormEvent, useEffect, useState } from "react";
import { Navigate, Route, Routes, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

function Login(){
  const [mobile,setMobile]=useState("9999999999"),[otp,setOtp]=useState(""),[stage,setStage]=useState(false),[dev,setDev]=useState(""),[error,setError]=useState("");
  async function submit(e:FormEvent){e.preventDefault();setError("");try{if(!stage){const r=await api.post("/auth/pensioner/request-otp",{mobile});setDev(r.data.data.developmentOtp||"");setStage(true)}else{const r=await api.post("/auth/pensioner/verify-otp",{mobile,otp});localStorage.setItem("pensionerToken",r.data.data.accessToken);location.href="/"}}catch(e:any){setError(e.response?.data?.message||"Request failed")}}
  return (
    <form className="login" onSubmit={submit}>
      <h1>Pensioner Login</h1>
      <p className="muted">Registered mobile number se secure login karein.</p>
      {!stage ? (
        <input className="input" value={mobile} onChange={e=>setMobile(e.target.value)} maxLength={10} />
      ) : (
        <>
          <input className="input" placeholder="OTP" value={otp} onChange={e=>setOtp(e.target.value)} maxLength={6} />
          {dev && <p>Development OTP: {dev}</p>}
        </>
      )}
      {error && <p className="error">{error}</p>}
      <button className="btn">{stage ? "Verify OTP" : "Send OTP"}</button>
    </form>
  );
}
function Register(){
  const [f,setF]=useState({employeeId:"",mobile:"",email:"",address:""}),[msg,setMsg]=useState(""),[error,setError]=useState("");
  async function go(e:FormEvent){e.preventDefault();setError("");setMsg("");try{const r=await api.post("/auth/pensioner/register",f);setMsg(r.data.message);setF({employeeId:"",mobile:"",email:"",address:""})}catch(e:any){setError(e.response?.data?.message||"Registration failed")}}
  return (
    <form className="login" onSubmit={go}>
      <h1>Complete Registration</h1>
      {Object.keys(f).map(k=>(
        <input className="input" key={k} placeholder={k} value={(f as any)[k]} onChange={e=>setF({...f,[k]:e.target.value})} />
      ))}
      <button className="btn">Submit for Approval</button>
      {msg && <p>{msg}</p>}
      {error && <p className="error">{error}</p>}
      <p><Link to="/login">Back to login</Link></p>
    </form>
  );
}
function Layout({children}:{children:any}){return <div className="shell"><div className="header"><div><h2>Bank Pensioner Portal</h2><span className="muted">Pension services at one place</span></div><button className="btn" onClick={()=>{localStorage.removeItem("pensionerToken");location.href="/login"}}>Logout</button></div><div className="tabs"><Link to="/">Dashboard</Link><Link to="/profile">Profile</Link><Link to="/pension">Pension</Link><Link to="/slips">Slips</Link><Link to="/policies">Policies</Link><Link to="/notifications">Notifications</Link><Link to="/grievances">Grievances</Link><Link to="/leads">Lead</Link><Link to="/jeevan">Jeevan Pramaan</Link></div>{children}</div>}
function Dash(){
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/pensioner/dashboard")).data.data
  });

  if (isLoading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p className="error">Failed to load dashboard</p></Layout>;

  const p = data?.profile?.pensionDetails?.[0];

  return (
    <Layout>
      <h1>Welcome, {data?.profile?.name}</h1>
      <div className="cards">
        <div className="card">
          <span className="muted">Current Pension</span>
          <div className="amount">₹{p?.pensionAmount ?? "-"}</div>
          <p>PPO: {p?.ppoNumber || "-"}</p>
        </div>
        <div className="card">
          <span>Open Grievances</span>
          <div className="amount">{data?.counters?.openGrievances ?? 0}</div>
        </div>
        <div className="card">
          <span>Unread Notifications</span>
          <div className="amount">{data?.counters?.unreadNotifications ?? 0}</div>
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

  if (isLoading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p className="error">Failed to load profile</p></Layout>;

  const p = data?.pensionDetails?.[0];

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Profile</h1>
        {!editing && <button className="secondary" onClick={() => setEditing(true)}>Edit Profile</button>}
      </div>
      {msg && <p style={{ color: "#16a34a", marginBottom: 12 }}>{msg}</p>}

      {editing ? (
        <form className="card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={3} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : "Save Changes"}</button>
            <button type="button" className="secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Personal Information</h3>
            <p><b>Employee ID:</b> {data.employeeId}</p>
            <p><b>Name:</b> {data.name}</p>
            <p><b>Mobile:</b> {data.mobile}</p>
            <p><b>Email:</b> {data.email || "-"}</p>
            <p><b>Gender:</b> {data.gender || "-"}</p>
            <p><b>Date of Birth:</b> {data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : "-"}</p>
            <p><b>Marital Status:</b> {data.maritalStatus || "-"}</p>
            <p><b>Father / Spouse Name:</b> {data.fatherName || "-"}</p>
            <p><b>PAN Number:</b> {data.panNumber || "-"}</p>
            <p><b>Aadhaar Number:</b> {data.aadhaarNumber ? "XXXX-XXXX-" + data.aadhaarNumber.slice(-4) : "-"}</p>
            <p><b>Blood Group:</b> {data.bloodGroup || "-"}</p>
            <p><b>Emergency Contact:</b> {data.emergencyContactName ? `${data.emergencyContactName} (${data.emergencyContactMobile})` : "-"}</p>
            <p><b>Address:</b> {data.address || "-"}</p>
            <p><b>Status:</b> {data.status}</p>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Employment Information</h3>
            <p><b>Department:</b> {data.department || "-"}</p>
            <p><b>Designation:</b> {data.designation || "-"}</p>
            <p><b>Date of Joining:</b> {data.dateOfJoining ? new Date(data.dateOfJoining).toLocaleDateString() : "-"}</p>
            <p><b>Date of Retirement:</b> {data.dateOfRetirement ? new Date(data.dateOfRetirement).toLocaleDateString() : "-"}</p>
            <p><b>Pension Type:</b> {data.pensionType || "-"}</p>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Bank Details</h3>
            <p><b>Account Holder:</b> {data.bankAccountHolderName || "-"}</p>
            <p><b>Account Number:</b> {data.bankAccountNumber || "-"}</p>
            <p><b>IFSC Code:</b> {data.bankIfscCode || "-"}</p>
            <p><b>Account Type:</b> {data.bankAccountType || "-"}</p>
            <p><b>Branch Name:</b> {data.bankBranchName || "-"}</p>
            <p><b>Branch Address:</b> {data.bankBranchAddress || "-"}</p>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Nominee Details</h3>
            <p><b>Nominee Name:</b> {data.nomineeName || "-"}</p>
            <p><b>Relation:</b> {data.nomineeRelation || "-"}</p>
            <p><b>Share:</b> {data.nomineeShare || "-"}</p>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Current Pension</h3>
            {p ? (
              <>
                <p><b>PPO Number:</b> {p.ppoNumber}</p>
                <p><b>Category:</b> {p.category || "-"}</p>
                <p><b>Pension Amount:</b> ₹{p.pensionAmount}</p>
                <p><b>Effective From:</b> {new Date(p.effectiveFrom).toLocaleDateString()}</p>
                <p><b>Bank Name:</b> {p.bankName || "-"}</p>
              </>
            ) : (
              <p>No pension record available.</p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
function PensionHistory(){
  const { data, isLoading, error } = useQuery({
    queryKey: ["pensionHistory"],
    queryFn: async () => (await api.get("/pensioner/pension")).data.data
  });

  if (isLoading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p className="error">Failed to load pension history</p></Layout>;
  if (!data?.length) return <Layout><p>No pension history available.</p></Layout>;

  return (
    <Layout>
      <h1>Pension History</h1>
      <div className="cards">
        {data.map((item: any) => (
          <div className="card" key={item.id}>
            <h3>PPO: {item.ppoNumber}</h3>
            <p><b>Type:</b> {item.pensionType || "-"}</p>
            <p><b>Category:</b> {item.category || "-"}</p>
            <p><b>Basic Pension:</b> ₹{item.basicPension}</p>
            <p><b>DA:</b> ₹{item.da}</p>
            <p><b>HRA:</b> ₹{item.hra}</p>
            <p><b>Medical Allowance:</b> ₹{item.medicalAllowance}</p>
            <p><b>Other Allowances:</b> ₹{item.otherAllowances}</p>
            <p><b>Deductions:</b> ₹{item.deductions}</p>
            <p><b>Pension Amount:</b> ₹{item.pensionAmount}</p>
            <p><b>Effective From:</b> {item.effectiveFrom ? new Date(item.effectiveFrom).toLocaleDateString() : "-"}</p>
            <p><b>Effective To:</b> {item.effectiveTo ? new Date(item.effectiveTo).toLocaleDateString() : "-"}</p>
            <p><b>Status:</b> {item.status}</p>
          </div>
        ))}
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

  if (isLoading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p className="error">Failed to load slips</p></Layout>;
  if (!data?.length) return <Layout><p>No pension slips available.</p></Layout>;

  return (
    <Layout>
      <h1>Pension Slips</h1>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Year</th>
              <th>Gross</th>
              <th>Deductions</th>
              <th>Net</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <tr key={item.id}>
                <td>{item.month}</td>
                <td>{item.year}</td>
                <td>₹{item.grossAmount}</td>
                <td>₹{item.deductions}</td>
                <td>₹{item.netAmount}</td>
                <td>{item.status || "Pending"}</td>
                <td><button className="secondary" onClick={() => download(item.id)}>Download PDF</button></td>
              </tr>
            ))}
          </tbody>
        </table>
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

  if (isLoading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p className="error">Failed to load policies</p></Layout>;

  return (
    <Layout>
      <h1>Policies</h1>
      <div className="cards">
        {data?.map((item: any) => (
          <div className="card" key={item.id}>
            <h3>{item.policy?.title || "Policy"}</h3>
            <p><b>Policy Number:</b> {item.policy?.policyNumber || "-"}</p>
            <p><b>Coverage:</b> {item.policy?.coverageDetails || "No details available"}</p>
            <p><b>Valid From:</b> {item.policy?.validFrom ? new Date(item.policy.validFrom).toLocaleDateString() : "-"}</p>
            <p><b>Valid To:</b> {item.policy?.validTo ? new Date(item.policy.validTo).toLocaleDateString() : "-"}</p>
            {item.acknowledgedAt ? (
              <p style={{ color: "#16a34a" }}>Acknowledged on {new Date(item.acknowledgedAt).toLocaleDateString()}</p>
            ) : (
              <button onClick={() => acknowledge.mutate(item.id)}>Acknowledge & Consent</button>
            )}
          </div>
        ))}
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

  if (isLoading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p className="error">Failed to load notifications</p></Layout>;

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Notifications</h1>
        <button className="secondary" onClick={markAllRead}>Mark All Read</button>
      </div>
      <div className="toolbar">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>
      <div className="cards">
        {data?.items?.map((item: any) => (
          <div className="card" key={item.id} style={{ opacity: item.readAt ? 0.7 : 1 }}>
            <h3>{item.notification?.title}</h3>
            <p>{item.notification?.message}</p>
            <p style={{ fontSize: 12, color: "#667085" }}>{item.notification?.createdAt ? new Date(item.notification.createdAt).toLocaleString() : ""}</p>
            {!item.readAt && <button onClick={() => markRead(item.id)}>Mark as Read</button>}
          </div>
        ))}
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
