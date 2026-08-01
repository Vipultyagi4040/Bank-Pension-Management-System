import { FormEvent, useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Shield, FileText, Calendar, Hash, CheckCircle, Save } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../api";
import FormField from "../components/FormField";
import DataTable, { ColumnDef } from "../components/DataTable";

type Policy = {
  id: string;
  policyNumber: string;
  title: string;
  coverageDetails: string | null;
  claimGuidelines: string | null;
  validFrom: string;
  validTo: string;
  isPublished: boolean;
  consentRequired: boolean;
};

export default function PoliciesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => (await api.get("/management/policies")).data.data as Policy[]
  });

  const [form, setForm] = useState({
    id: "",
    policyNumber: "",
    title: "",
    validFrom: "",
    validTo: "",
    coverageDetails: "",
    claimGuidelines: "",
    isPublished: false,
    consentRequired: false
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingId && data) {
      const item = data.find(p => p.id === editingId);
      if (item) {
        setForm({
          id: item.id,
          policyNumber: item.policyNumber,
          title: item.title,
          validFrom: item.validFrom ? item.validFrom.slice(0, 10) : "",
          validTo: item.validTo ? item.validTo.slice(0, 10) : "",
          coverageDetails: item.coverageDetails || "",
          claimGuidelines: item.claimGuidelines || "",
          isPublished: item.isPublished,
          consentRequired: item.consentRequired
        });
      }
    } else if (!editingId) {
      setForm({
        id: "",
        policyNumber: "",
        title: "",
        validFrom: "",
        validTo: "",
        coverageDetails: "",
        claimGuidelines: "",
        isPublished: false,
        consentRequired: false
      });
    }
  }, [editingId, data]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.policyNumber) newErrors.policyNumber = "Policy number is required";
    if (!form.title) newErrors.title = "Title is required";
    if (!form.validFrom) newErrors.validFrom = "Valid from date is required";
    if (!form.validTo) newErrors.validTo = "Valid to date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/management/policies/${editingId}`, form);
      } else {
        await api.post("/management/policies", form);
      }
      setEditingId(null);
      setForm({
        id: "",
        policyNumber: "",
        title: "",
        validFrom: "",
        validTo: "",
        coverageDetails: "",
        claimGuidelines: "",
        isPublished: false,
        consentRequired: false
      });
      setErrors({});
      setSuccessMsg("Policy saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to save policy");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(item: Policy) {
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      id: "",
      policyNumber: "",
      title: "",
      validFrom: "",
      validTo: "",
      coverageDetails: "",
      claimGuidelines: "",
      isPublished: false,
      consentRequired: false
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this policy?")) return;
    await api.delete(`/management/policies/${id}`);
    queryClient.invalidateQueries({ queryKey: ["policies"] });
  }

  if (isLoading) return <p>Loading...</p>;

  const columns: ColumnDef<Policy>[] = [
    { key: "policyNumber", label: "Number", sortable: true, accessor: (row) => <span style={{ fontWeight: 600 }}>{row.policyNumber}</span> },
    { key: "title", label: "Title", sortable: true },
    { key: "validFrom", label: "Valid From", sortable: true, accessor: (row) => row.validFrom ? new Date(row.validFrom).toLocaleDateString() : "-" },
    { key: "validTo", label: "Valid To", sortable: true, accessor: (row) => row.validTo ? new Date(row.validTo).toLocaleDateString() : "-" },
    {
      key: "isPublished",
      label: "Published",
      sortable: true,
      accessor: (row) => <span className={`badge ${row.isPublished ? "badge-success" : "badge-warning"}`}>{row.isPublished ? "Yes" : "No"}</span>
    }
  ];

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
            <Shield size={32} className="icon" color="var(--accent)" />
            Policy Management
          </h1>
          <p className="page-subtitle">Create and manage insurance policies</p>
        </div>
      </motion.div>

      <motion.form
        className="form-card"
        onSubmit={submit}
        noValidate
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        whileHover={{ y: -2 }}
      >
        <motion.h3
          style={{ marginTop: 0 }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {editingId ? "Edit Policy" : "Create Policy"}
        </motion.h3>

        {errorMsg && (
          <motion.div
            className="form-error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {errorMsg}
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            className="form-success-message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <CheckCircle size={16} />
            {successMsg}
          </motion.div>
        )}

        <div className="form-progress">
          <div className="form-progress-label">
            <span>Policy Details</span>
            <motion.span
              animate={{ color: form.policyNumber ? "#10b981" : "inherit" }}
              transition={{ duration: 0.2 }}
            >
              {form.policyNumber ? "Ready" : "Incomplete"}
            </motion.span>
          </div>
          <div className="form-progress-steps">
            <motion.div
              className={`form-progress-step ${form.policyNumber ? "form-progress-step-complete" : ""}`}
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className={`form-progress-step ${form.title ? "form-progress-step-complete" : ""}`}
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className={`form-progress-step ${form.validFrom ? "form-progress-step-complete" : ""}`}
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className={`form-progress-step ${form.validTo ? "form-progress-step-complete" : ""}`}
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>

        <motion.div className="form-row" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
          <FormField
            label="Policy Number"
            name="policyNumber"
            value={form.policyNumber}
            onChange={(e) => setForm({ ...form, policyNumber: e.target.value })}
            icon={<Hash size={18} />}
            required
            error={errors.policyNumber}
            placeholder="e.g. POL001"
          />
          <FormField
            label="Title"
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            icon={<Shield size={18} />}
            required
            error={errors.title}
            placeholder="Enter policy title"
          />
        </motion.div>

        <motion.div className="form-row" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <FormField
            label="Valid From"
            name="validFrom"
            type="date"
            value={form.validFrom}
            onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
            icon={<Calendar size={18} />}
            required
            error={errors.validFrom}
          />
          <FormField
            label="Valid To"
            name="validTo"
            type="date"
            value={form.validTo}
            onChange={(e) => setForm({ ...form, validTo: e.target.value })}
            icon={<Calendar size={18} />}
            required
            error={errors.validTo}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <FormField
            label="Coverage Details"
            name="coverageDetails"
            type="textarea"
            value={form.coverageDetails}
            onChange={(e) => setForm({ ...form, coverageDetails: e.target.value })}
            icon={<FileText size={18} />}
            placeholder="Enter coverage details..."
            rows={3}
          />

          <FormField
            label="Claim Guidelines"
            name="claimGuidelines"
            type="textarea"
            value={form.claimGuidelines}
            onChange={(e) => setForm({ ...form, claimGuidelines: e.target.value })}
            icon={<FileText size={18} />}
            placeholder="Enter claim guidelines..."
            rows={3}
          />
        </motion.div>

        <motion.div
          style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <FormField
            label="Published"
            name="isPublished"
            type="select"
            options={[
              { value: "true", label: "Yes" },
              { value: "false", label: "No" }
            ]}
            value={form.isPublished ? "true" : "false"}
            onChange={(e) => setForm({ ...form, isPublished: e.target.value === "true" })}
            icon={<CheckCircle size={18} />}
            layout="horizontal"
            fullWidth={false}
          />
          <FormField
            label="Consent Required"
            name="consentRequired"
            type="select"
            options={[
              { value: "true", label: "Yes" },
              { value: "false", label: "No" }
            ]}
            value={form.consentRequired ? "true" : "false"}
            onChange={(e) => setForm({ ...form, consentRequired: e.target.value === "true" })}
            icon={<CheckCircle size={18} />}
            layout="horizontal"
            fullWidth={false}
          />
        </motion.div>

        <motion.div
          className="form-actions"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <motion.button
            type="button"
            className="btn btn-secondary"
            onClick={cancelEdit}
            disabled={submitting}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            className={`btn btn-primary ${submitting ? "btn-loading" : ""}`}
            disabled={submitting}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="btn-text">
              {submitting ? "Saving..." : (editingId ? "Update Policy" : "Create Policy")}
            </span>
            <span className="btn-spinner">
              <div style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} />
            </span>
          </motion.button>
        </motion.div>
      </motion.form>

      <motion.div
        className="table-container"
        style={{ marginTop: 24 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <DataTable
          data={data || []}
          columns={columns}
          enableSearch={false}
          enableSorting={false}
          enableExport={true}
          exportFilename={`policies-${new Date().toISOString().slice(0,10)}`}
          paginated={false}
          isLoading={false}
          emptyMessage="No policies found"
          emptyIcon={<Shield size={48} />}
          actions={(item) => (
            <div className="actions">
              <motion.button
                className="btn btn-secondary btn-sm"
                onClick={() => startEdit(item)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Edit
              </motion.button>
              <motion.button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(item.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Delete
              </motion.button>
            </div>
          )}
          rowKey={(item) => item.id}
          tableStyle={{ marginTop: 0 }}
        />
      </motion.div>
    </motion.div>
  );
}
