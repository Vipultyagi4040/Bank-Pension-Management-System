import { useState } from "react";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../api";
import FormField from "../components/FormField";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@bank.local");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function validate() {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address");
      valid = false;
    }
    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    }
    return valid;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/admin/login", { email, password });
      localStorage.setItem("adminToken", response.data.data.accessToken);
      location.href = "/";
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Lock size={32} />
          </div>
          <h1>Pension Admin</h1>
          <p>Bank Pension Management System</p>
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

        <form onSubmit={submit}>
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
              error={emailError}
              placeholder="admin@bank.local"
              autoComplete="email"
              autoFocus
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <FormField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
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
              required
              error={passwordError}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </motion.div>

          <motion.button
            type="submit"
            className={`btn btn-primary ${loading ? "btn-loading" : ""}`}
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="btn-text">{loading ? "Signing in..." : "Sign In"}</span>
            <span className="btn-spinner">
              <div style={{ width: 16, height: 16, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} />
            </span>
          </motion.button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Demo: admin@bank.local / Admin@123
        </p>
      </div>
    </div>
  );
}
