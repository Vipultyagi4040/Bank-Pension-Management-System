import { FormEvent, useState } from "react";
import { api } from "../api";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@bank.local");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const response = await api.post("/auth/admin/login", { email, password });
      localStorage.setItem("adminToken", response.data.data.accessToken);
      location.href = "/";
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Login failed");
    }
  }

  return (
    <form className="login page" onSubmit={submit}>
      <h1>Admin Login</h1>
      <div className="form-group">
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}
