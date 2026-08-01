import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, Hash, Calendar, Banknote, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../api";
import FormField from "../components/FormField";

type FormState = {
  pensionerId: string;
  ppoNumber: string;
  category: string;
  pensionType: string;
  basicPension: string;
  da: string;
  hra: string;
  medicalAllowance: string;
  otherAllowances: string;
  deductions: string;
  effectiveFrom: string;
  effectiveTo: string;
  bankName: string;
  branchName: string;
  accountLastFour: string;
  isCurrent: boolean;
  status: string;
};

const emptyForm: FormState = {
  pensionerId: "",
  ppoNumber: "",
  category: "",
  pensionType: "",
  basicPension: "",
  da: "",
  hra: "",
  medicalAllowance: "",
  otherAllowances: "",
  deductions: "",
  effectiveFrom: "",
  effectiveTo: "",
  bankName: "",
  branchName: "",
  accountLastFour: "",
  isCurrent: true,
  status: "ACTIVE"
};

const pensionTypeOptions = [
  { value: "Self", label: "Self" },
  { value: "Family", label: "Family" },
  { value: "Commuted", label: "Commuted" },
  { value: "Other", label: "Other" }
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "EXPIRED", label: "Expired" },
  { value: "SUSPENDED", label: "Suspended" }
];

const isCurrentOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" }
];

export default function PensionDetailFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");

  const isEdit = Boolean(id);

  const { data, isLoading } = useQuery({
    queryKey: ["pension-detail", id],
    queryFn: async () => (await api.get(`/management/pension-details/${id}`)).data.data,
    enabled: isEdit
  });

  const mutation = useMutation({
    mutationFn: async (payload: Partial<FormState>) => {
      if (isEdit) {
        return api.patch(`/management/pension-details/${id}`, payload);
      }
      return api.post("/management/pension-details", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pension-details"] });
      setSuccessMsg("Pension detail saved successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        navigate("/pension-details");
      }, 1500);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Operation failed");
    }
  });

  useEffect(() => {
    if (data) {
      setForm({
        pensionerId: data.pensionerId || "",
        ppoNumber: data.ppoNumber || "",
        category: data.category || "",
        pensionType: data.pensionType || "",
        basicPension: data.basicPension?.toString() || "",
        da: data.da?.toString() || "",
        hra: data.hra?.toString() || "",
        medicalAllowance: data.medicalAllowance?.toString() || "",
        otherAllowances: data.otherAllowances?.toString() || "",
        deductions: data.deductions?.toString() || "",
        effectiveFrom: data.effectiveFrom ? data.effectiveFrom.slice(0, 10) : "",
        effectiveTo: data.effectiveTo ? data.effectiveTo.slice(0, 10) : "",
        bankName: data.bankName || "",
        branchName: data.branchName || "",
        accountLastFour: data.accountLastFour || "",
        isCurrent: data.isCurrent ?? true,
        status: data.status || "ACTIVE"
      });
    }
  }, [data]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors(e => { const copy = { ...e }; delete copy[key]; return copy; });
    }
  }

  const numeric = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const totalPension = numeric(form.basicPension) + numeric(form.da) + numeric(form.hra) + numeric(form.medicalAllowance) + numeric(form.otherAllowances);
  const pensionAmount = totalPension - numeric(form.deductions);

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!form.pensionerId) newErrors.pensionerId = "Pensioner ID is required";
    if (!form.ppoNumber) newErrors.ppoNumber = "PPO Number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    const payload: Record<string, unknown> = {
      ...form,
      basicPension: numeric(form.basicPension),
      da: numeric(form.da),
      hra: numeric(form.hra),
      medicalAllowance: numeric(form.medicalAllowance),
      otherAllowances: numeric(form.otherAllowances),
      deductions: numeric(form.deductions),
      pensionAmount
    };

    Object.keys(payload).forEach(k => {
      if (payload[k] === "" || payload[k] === undefined) {
        payload[k] = null;
      }
    });

    try {
      await mutation.mutateAsync(payload);
    } catch (err: any) {
      setError(err.response?.data?.message || "Operation failed");
    }
  }

  if (isEdit && isLoading) return <p>Loading...</p>;

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
            {isEdit ? "Edit Pension Detail" : "Add Pension Detail"}
          </h1>
          <p className="page-subtitle">{isEdit ? "Update pension detail information" : "Add a new pension detail record"}</p>
        </div>
      </motion.div>

      {error && (
        <motion.div className="form-error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          {error}
        </motion.div>
      )}
      {successMsg && (
        <motion.div className="form-success-message" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <CheckCircle size={16} />
          {successMsg}
        </motion.div>
      )}

      <motion.form
        className="form-card"
        onSubmit={submit}
        noValidate
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <div className="form-section">
          <div className="form-section-title">Pension Information</div>
          <FormField
            label="Pensioner ID"
            name="pensionerId"
            value={form.pensionerId}
            onChange={(e) => set("pensionerId", e.target.value)}
            icon={<Hash size={18} />}
            required
            error={errors.pensionerId}
            placeholder="Enter pensioner ID"
          />

          <div className="form-row">
            <FormField
              label="PPO Number"
              name="ppoNumber"
              value={form.ppoNumber}
              onChange={(e) => set("ppoNumber", e.target.value)}
              icon={<Hash size={18} />}
              required
              error={errors.ppoNumber}
              placeholder="Enter PPO number"
            />
            <FormField
              label="Pension Type"
              name="pensionType"
              type="select"
              options={pensionTypeOptions}
              value={form.pensionType}
              onChange={(e) => set("pensionType", e.target.value)}
              placeholder="Select"
            />
          </div>

          <FormField
            label="Category"
            name="category"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            icon={<FileText size={18} />}
            placeholder="e.g. Regular, Enhanced"
          />
        </div>

        <div className="form-section">
          <div className="form-section-title">Pension Components</div>
          <div className="form-row">
            <FormField
              label="Basic Pension"
              name="basicPension"
              type="number"
              value={form.basicPension}
              onChange={(e) => set("basicPension", e.target.value)}
              icon={<Banknote size={18} />}
              placeholder="0.00"
              min={0}
              step={0.01}
            />
            <FormField
              label="DA"
              name="da"
              type="number"
              value={form.da}
              onChange={(e) => set("da", e.target.value)}
              icon={<Banknote size={18} />}
              placeholder="0.00"
              min={0}
              step={0.01}
            />
          </div>

          <div className="form-row">
            <FormField
              label="HRA"
              name="hra"
              type="number"
              value={form.hra}
              onChange={(e) => set("hra", e.target.value)}
              icon={<Banknote size={18} />}
              placeholder="0.00"
              min={0}
              step={0.01}
            />
            <FormField
              label="Medical Allowance"
              name="medicalAllowance"
              type="number"
              value={form.medicalAllowance}
              onChange={(e) => set("medicalAllowance", e.target.value)}
              icon={<Banknote size={18} />}
              placeholder="0.00"
              min={0}
              step={0.01}
            />
          </div>

          <FormField
            label="Other Allowances"
            name="otherAllowances"
            type="number"
            value={form.otherAllowances}
            onChange={(e) => set("otherAllowances", e.target.value)}
            icon={<Banknote size={18} />}
            placeholder="0.00"
            min={0}
            step={0.01}
          />

          <FormField
            label="Deductions"
            name="deductions"
            type="number"
            value={form.deductions}
            onChange={(e) => set("deductions", e.target.value)}
            icon={<Banknote size={18} />}
            placeholder="0.00"
            min={0}
            step={0.01}
          />
        </div>

        <div className="form-section">
          <div className="form-section-title">Calculated Values</div>
          <div className="form-row">
            <FormField
              label="Total Pension"
              name="totalPension"
              type="number"
              value={totalPension.toFixed(2)}
              readOnly
              placeholder="Auto-calculated"
            />
            <FormField
              label="Pension Amount (Net)"
              name="pensionAmount"
              type="number"
              value={pensionAmount.toFixed(2)}
              readOnly
              placeholder="Auto-calculated"
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Validity</div>
          <div className="form-row">
            <FormField
              label="Effective From"
              name="effectiveFrom"
              type="date"
              value={form.effectiveFrom}
              onChange={(e) => set("effectiveFrom", e.target.value)}
              icon={<Calendar size={18} />}
            />
            <FormField
              label="Effective To"
              name="effectiveTo"
              type="date"
              value={form.effectiveTo}
              onChange={(e) => set("effectiveTo", e.target.value)}
              icon={<Calendar size={18} />}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Bank Details</div>
          <div className="form-row">
            <FormField
              label="Bank Name"
              name="bankName"
              value={form.bankName}
              onChange={(e) => set("bankName", e.target.value)}
              icon={<Banknote size={18} />}
              placeholder="Enter bank name"
            />
            <FormField
              label="Branch Name"
              name="branchName"
              value={form.branchName}
              onChange={(e) => set("branchName", e.target.value)}
              icon={<Banknote size={18} />}
              placeholder="Enter branch name"
            />
          </div>

          <div className="form-row">
            <FormField
              label="Account Last Four Digits"
              name="accountLastFour"
              value={form.accountLastFour}
              onChange={(e) => set("accountLastFour", e.target.value)}
              icon={<Hash size={18} />}
              maxLength={4}
              placeholder="Last 4 digits"
            />
            <FormField
              label="Is Current"
              name="isCurrent"
              type="select"
              options={isCurrentOptions}
              value={form.isCurrent ? "true" : "false"}
              onChange={(e) => set("isCurrent", e.target.value === "true")}
              placeholder="Select"
            />
          </div>

          {isEdit && (
            <FormField
              label="Status"
              name="status"
              type="select"
              options={statusOptions}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              placeholder="Select"
            />
          )}
        </div>

        <motion.div
          className="form-actions"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/pension-details")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            className={`btn btn-primary ${mutation.isPending ? "btn-loading" : ""}`}
            disabled={mutation.isPending}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="btn-text">
              {mutation.isPending ? "Saving..." : (isEdit ? "Update Pension Detail" : "Create Pension Detail")}
            </span>
            <span className="btn-spinner">
              <div style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} />
            </span>
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}
