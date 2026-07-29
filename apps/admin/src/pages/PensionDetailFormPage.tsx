import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

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

export default function PensionDetailFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");

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
      navigate("/pension-details");
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
  }

  const numeric = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const totalPension = numeric(form.basicPension) + numeric(form.da) + numeric(form.hra) + numeric(form.medicalAllowance) + numeric(form.otherAllowances);
  const pensionAmount = totalPension - numeric(form.deductions);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

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
    <div className="page">
      <h1>{isEdit ? "Edit Pension Detail" : "Add Pension Detail"}</h1>
      {error && <div className="error">{error}</div>}
      <form className="card" onSubmit={submit}>
        <h3>Pension Information</h3>
        <div className="form-group">
          <label>Pensioner ID</label>
          <input className="input" value={form.pensionerId} onChange={e => set("pensionerId", e.target.value)} required />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>PPO Number</label>
            <input className="input" value={form.ppoNumber} onChange={e => set("ppoNumber", e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Pension Type</label>
            <select className="input" value={form.pensionType} onChange={e => set("pensionType", e.target.value)}>
              <option value="">Select</option>
              <option>Self</option>
              <option>Family</option>
              <option>Commuted</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Category</label>
          <input className="input" value={form.category} onChange={e => set("category", e.target.value)} />
        </div>
        <h3 style={{ marginTop: 24 }}>Pension Components</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Basic Pension</label>
            <input className="input" type="number" value={form.basicPension} onChange={e => set("basicPension", e.target.value)} />
          </div>
          <div className="form-group">
            <label>DA</label>
            <input className="input" type="number" value={form.da} onChange={e => set("da", e.target.value)} />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>HRA</label>
            <input className="input" type="number" value={form.hra} onChange={e => set("hra", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Medical Allowance</label>
            <input className="input" type="number" value={form.medicalAllowance} onChange={e => set("medicalAllowance", e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Other Allowances</label>
          <input className="input" type="number" value={form.otherAllowances} onChange={e => set("otherAllowances", e.target.value)} />
        </div>
        <div className="form-group">
          <label>Deductions</label>
          <input className="input" type="number" value={form.deductions} onChange={e => set("deductions", e.target.value)} />
        </div>
        <h3 style={{ marginTop: 24 }}>Calculated Values</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Total Pension</label>
            <input className="input" readOnly value={totalPension.toFixed(2)} />
          </div>
          <div className="form-group">
            <label>Pension Amount (Net)</label>
            <input className="input" readOnly value={pensionAmount.toFixed(2)} />
          </div>
        </div>
        <h3 style={{ marginTop: 24 }}>Validity</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Effective From</label>
            <input className="input" type="date" value={form.effectiveFrom} onChange={e => set("effectiveFrom", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Effective To</label>
            <input className="input" type="date" value={form.effectiveTo} onChange={e => set("effectiveTo", e.target.value)} />
          </div>
        </div>
        <h3 style={{ marginTop: 24 }}>Bank Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Bank Name</label>
            <input className="input" value={form.bankName} onChange={e => set("bankName", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Branch Name</label>
            <input className="input" value={form.branchName} onChange={e => set("branchName", e.target.value)} />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Account Last Four Digits</label>
            <input className="input" value={form.accountLastFour} onChange={e => set("accountLastFour", e.target.value)} maxLength={4} />
          </div>
          <div className="form-group">
            <label>Is Current</label>
            <select className="input" value={form.isCurrent ? "true" : "false"} onChange={e => set("isCurrent", e.target.value === "true")}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
        {isEdit && (
          <div className="form-group">
            <label>Status</label>
            <select className="input" value={form.status} onChange={e => set("status", e.target.value)}>
              <option>ACTIVE</option>
              <option>INACTIVE</option>
              <option>EXPIRED</option>
              <option>SUSPENDED</option>
            </select>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : isEdit ? "Update Pension Detail" : "Create Pension Detail"}
          </button>
          <button type="button" className="secondary" onClick={() => navigate("/pension-details")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
