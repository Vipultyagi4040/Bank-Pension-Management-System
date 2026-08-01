import { FormEvent, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Calendar, User, Hash, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../api";
import FormField from "../components/FormField";
import DataTable, { ColumnDef } from "../components/DataTable";

type JeevanRecord = {
  id: string;
  pensionerId: string;
  pensioner: { employeeId: string; name: string; mobile: string };
  applicationNumber: string;
  submissionDate: string;
  verificationDate: string;
  status: string;
  remarks: string;
};

const statuses = ["NOT_SUBMITTED", "SUBMITTED", "VERIFIED", "REJECTED", "EXPIRED"];

const statusOptions = [
  { value: "NOT_SUBMITTED", label: "Not Submitted" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "VERIFIED", label: "Verified" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" }
];

const getStatusBadge = (s: string) => {
  const variants: Record<string, string> = {
    NOT_SUBMITTED: "badge-warning",
    SUBMITTED: "badge-info",
    VERIFIED: "badge-success",
    REJECTED: "badge-error",
    EXPIRED: "badge-error"
  };
  return variants[s] || "badge-info";
};

export default function JeevanPramaanPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["jeevan"],
    queryFn: async () => (await api.get("/management/jeevan-pramaan")).data.data as JeevanRecord[]
  });

  const [form, setForm] = useState({
    id: "",
    pensionerId: "",
    applicationNumber: "",
    status: "NOT_SUBMITTED",
    submissionDate: "",
    verificationDate: "",
    remarks: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingId && data) {
      const item = data.find(r => r.id === editingId);
      if (item) {
        setForm({
          id: item.id,
          pensionerId: item.pensionerId,
          applicationNumber: item.applicationNumber || "",
          status: item.status,
          submissionDate: item.submissionDate ? item.submissionDate.slice(0, 10) : "",
          verificationDate: item.verificationDate ? item.verificationDate.slice(0, 10) : "",
          remarks: item.remarks || ""
        });
      }
    } else if (!editingId) {
      setForm({
        id: "",
        pensionerId: "",
        applicationNumber: "",
        status: "NOT_SUBMITTED",
        submissionDate: "",
        verificationDate: "",
        remarks: ""
      });
    }
  }, [editingId, data]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setErrors({});

    if (!form.pensionerId) {
      setErrors({ pensionerId: "Pensioner ID is required" });
      return;
    }

    try {
      const payload: any = {
        pensionerId: form.pensionerId,
        applicationNumber: form.applicationNumber || undefined,
        status: form.status,
        remarks: form.remarks || undefined
      };
      if (form.submissionDate) payload.submissionDate = form.submissionDate;
      if (form.verificationDate) payload.verificationDate = form.verificationDate;

      setSubmitting(true);
      if (editingId) {
        await api.patch(`/management/jeevan-pramaan/${editingId}`, payload);
      } else {
        await api.post("/management/jeevan-pramaan", payload);
      }
      setSuccessMsg("Record saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setForm({
        id: "",
        pensionerId: "",
        applicationNumber: "",
        status: "NOT_SUBMITTED",
        submissionDate: "",
        verificationDate: "",
        remarks: ""
      });
      queryClient.invalidateQueries({ queryKey: ["jeevan"] });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to save record");
    } finally {
      setSubmitting(false);
    }
  }

  function handleStatusChange(status: string) {
    setForm(prev => ({
      ...prev,
      status,
      verificationDate: status === "VERIFIED" ? new Date().toISOString().slice(0, 10) : prev.verificationDate
    }));
  }

  function startEdit(item: JeevanRecord) {
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      id: "",
      pensionerId: "",
      applicationNumber: "",
      status: "NOT_SUBMITTED",
      submissionDate: "",
      verificationDate: "",
      remarks: ""
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this record?")) return;
    await api.delete(`/management/jeevan-pramaan/${id}`);
    queryClient.invalidateQueries({ queryKey: ["jeevan"] });
  }

  if (isLoading) return <p>Loading...</p>;

  const columns: ColumnDef<JeevanRecord>[] = [
    {
      key: "pensioner",
      label: "Pensioner",
      sortable: true,
      accessor: (row) => <span style={{ fontWeight: 600 }}>{row.pensioner?.name} ({row.pensioner?.employeeId})</span>
    },
    { key: "applicationNumber", label: "Application", sortable: true, accessor: (row) => row.applicationNumber || "-" },
    {
      key: "status",
      label: "Status",
      sortable: true,
      accessor: (row) => <span className={`badge ${getStatusBadge(row.status)}`}>{row.status.replace("_", " ")}</span>
    },
    { key: "submissionDate", label: "Submission Date", sortable: true, accessor: (row) => row.submissionDate ? new Date(row.submissionDate).toLocaleDateString() : "-" },
    { key: "verificationDate", label: "Verification Date", sortable: true, accessor: (row) => row.verificationDate ? new Date(row.verificationDate).toLocaleDateString() : "-" },
    { key: "remarks", label: "Remarks", sortable: false, accessor: (row) => row.remarks || "-" }
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
            <FileText size={32} className="icon" color="var(--accent)" />
            Jeevan Pramaan
          </h1>
          <p className="page-subtitle">Manage Jeevan Pramaan records</p>
        </div>
      </motion.div>

      <motion.form
        className="form-card"
        onSubmit={submit}
        style={{ marginBottom: 24 }}
        noValidate
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <motion.h3 style={{ marginTop: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {editingId ? "Edit Record" : "Add Record"}
        </motion.h3>

        <motion.div className="form-row" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
          <FormField
            label="Pensioner ID"
            name="pensionerId"
            value={form.pensionerId}
            onChange={(e) => setForm({ ...form, pensionerId: e.target.value })}
            icon={<Hash size={18} />}
            required
            error={errors.pensionerId}
            placeholder="Enter pensioner ID"
          />
          <FormField
            label="Application Number"
            name="applicationNumber"
            value={form.applicationNumber}
            onChange={(e) => setForm({ ...form, applicationNumber: e.target.value })}
            icon={<FileText size={18} />}
            placeholder="Enter application number"
          />
        </motion.div>

        <motion.div className="form-row" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <FormField
            label="Status"
            name="status"
            type="select"
            options={statusOptions}
            value={form.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            placeholder="Select"
          />
          <FormField
            label="Submission Date"
            name="submissionDate"
            type="date"
            value={form.submissionDate}
            onChange={(e) => setForm({ ...form, submissionDate: e.target.value })}
            icon={<Calendar size={18} />}
          />
          <FormField
            label="Verification Date"
            name="verificationDate"
            type="date"
            value={form.verificationDate}
            onChange={(e) => setForm({ ...form, verificationDate: e.target.value })}
            icon={<Calendar size={18} />}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <FormField
            label="Remarks"
            name="remarks"
            type="textarea"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            placeholder="Enter remarks"
            rows={3}
          />
        </motion.div>

        {errorMsg && (
          <motion.div className="form-error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            {errorMsg}
          </motion.div>
        )}
        {successMsg && (
          <motion.div className="form-success-message" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <CheckCircle size={16} />
            {successMsg}
          </motion.div>
        )}

        <motion.div
          className="form-actions"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            type="button"
            className="btn btn-secondary"
            onClick={cancelEdit}
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
              {submitting ? "Saving..." : (editingId ? "Update Record" : "Save Record")}
            </span>
            <span className="btn-spinner">
              <div style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} />
            </span>
          </motion.button>
        </motion.div>
      </motion.form>

      <motion.div
        className="table-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <DataTable
          data={data || []}
          columns={columns}
          enableSearch={true}
          searchFields={["pensioner.name", "applicationNumber", "status"]}
          searchPlaceholder="Search..."
          enableSorting={true}
          enableExport={true}
          exportFilename={`jeevan-pramaan-${new Date().toISOString().slice(0,10)}`}
          paginated={false}
          isLoading={false}
          emptyMessage="No records found"
          emptyIcon={<FileText size={48} />}
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
        />
      </motion.div>
    </motion.div>
  );
}
