import { Link, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <header style={{ background: "#0f172a", color: "#fff", padding: "16px 24px" }}>
        <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 600 }}>
          Bank Pension System
        </Link>
      </header>
      <main style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Placeholder title="Admin Portal" />} />
          <Route path="/pensioner" element={<Placeholder title="Pensioner Portal" />} />
        </Routes>
      </main>
    </div>
  );
}

function Landing() {
  return (
    <div>
      <h1 style={{ marginBottom: 12 }}>Desktop App</h1>
      <p style={{ marginBottom: 16, color: "#475569" }}>
        Use this window to access the admin or pensioner portals.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <a href="http://localhost:5173" style={{ color: "#1d5fd1" }}>Open Admin</a>
        <a href="http://localhost:5174" style={{ color: "#1d5fd1" }}>Open Pensioner Portal</a>
      </div>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <h1 style={{ marginBottom: 12 }}>{title}</h1>
      <p style={{ color: "#475569" }}>This module is available in the web portal.</p>
    </div>
  );
}
