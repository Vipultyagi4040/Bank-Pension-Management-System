import { FormEvent, useState } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api";
import FormField from "../components/FormField";

const example = `employeeId,name,mobile,email,department,designation
EMP002,Ramesh Kumar,9876543210,ramesh@example.com,Operations,Officer`;

export default function ImportPage() {
  const [csv, setCsv] = useState(example);
  const [result, setResult] = useState<any>();
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setResult(undefined);
    setSubmitting(true);
    try {
      const response = await api.post("/admin/pensioners/import-csv", { csv });
      setResult(response.data.data);
    } catch (err: any) {
      setResult({ error: err.response?.data?.message || "Import failed" });
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <motion.div
      className="animate-fade-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div>
          <h1 className="page-title">
            <Upload size={32} className="icon" color="var(--accent)" />
            Bulk Data Upload
          </h1>
          <p className="page-subtitle">Import pensioner data via CSV</p>
        </div>
      </motion.div>

      <motion.form
        className="form-card"
        onSubmit={submit}
        noValidate
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <motion.h3 style={{ marginTop: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          CSV Content
        </motion.h3>
        <motion.p style={{ color: "var(--text-muted)", marginBottom: 12 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          CSV columns: employeeId, name, mobile, email, department, designation
        </motion.p>

        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <FormField
            label="CSV Data"
            name="csv"
            type="textarea"
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            icon={<FileText size={18} />}
            required
            placeholder="Paste CSV content here..."
            rows={12}
          />
        </motion.div>

        <motion.div
          className="form-actions"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            type="submit"
            className={`btn btn-primary ${submitting ? "btn-loading" : ""}`}
            disabled={submitting}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="btn-text">{submitting ? "Validating & Importing..." : "Validate & Import"}</span>
            <span className="btn-spinner">
              <div style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} />
            </span>
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {result?.error && (
            <motion.div
              className="form-errorsummary"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {result.error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && !result.error && (
            <motion.div
              className="card"
              style={{ marginTop: 16 }}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <h3>Import Result</h3>
              <motion.div style={{ display: "flex", gap: 20, marginBottom: 12 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Imported</span>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16a34a" }}>{result.imported}</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Failed</span>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ef4444" }}>{result.failed}</p>
                </motion.div>
              </motion.div>
              {result.errors?.map((x: any) => (
                <motion.div className="form-error" key={x.row} whileHover={{ x: 4 }}>
                  Row {x.row}: {x.message}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </motion.div>
  );
}
