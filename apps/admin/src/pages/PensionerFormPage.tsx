import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

type FormState = {
  employeeId: string;
  mobile: string;
  email: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  fatherName: string;
  panNumber: string;
  aadhaarNumber: string;
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactMobile: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  dateOfRetirement: string;
  pensionType: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankAccountHolderName: string;
  bankBranchName: string;
  bankBranchAddress: string;
  bankAccountType: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeShare: string;
  address: string;
  profilePhotoUrl: string;
  idCardUrl: string;
  status: string;
};

const emptyForm: FormState = {
  employeeId: "",
  mobile: "",
  email: "",
  name: "",
  gender: "",
  dateOfBirth: "",
  maritalStatus: "",
  fatherName: "",
  panNumber: "",
  aadhaarNumber: "",
  bloodGroup: "",
  emergencyContactName: "",
  emergencyContactMobile: "",
  department: "",
  designation: "",
  dateOfJoining: "",
  dateOfRetirement: "",
  pensionType: "",
  bankAccountNumber: "",
  bankIfscCode: "",
  bankAccountHolderName: "",
  bankBranchName: "",
  bankBranchAddress: "",
  bankAccountType: "",
  nomineeName: "",
  nomineeRelation: "",
  nomineeShare: "",
  address: "",
  profilePhotoUrl: "",
  idCardUrl: "",
  status: "PENDING"
};

export default function PensionerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");

  const isEdit = Boolean(id);

  const { data, isLoading } = useQuery({
    queryKey: ["pensioner", id],
    queryFn: async () => (await api.get(`/admin/pensioners/${id}`)).data.data,
    enabled: isEdit
  });

  const mutation = useMutation({
    mutationFn: async (payload: Partial<FormState>) => {
      if (isEdit) {
        return api.patch(`/admin/pensioners/${id}`, payload);
      }
      return api.post("/admin/pensioners", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pensioners"] });
      navigate("/pensioners");
    }
  });

  useEffect(() => {
    if (data) {
      setForm({
        employeeId: data.employeeId || "",
        mobile: data.mobile || "",
        email: data.email || "",
        name: data.name || "",
        gender: data.gender || "",
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : "",
        maritalStatus: data.maritalStatus || "",
        fatherName: data.fatherName || "",
        panNumber: data.panNumber || "",
        aadhaarNumber: data.aadhaarNumber || "",
        bloodGroup: data.bloodGroup || "",
        emergencyContactName: data.emergencyContactName || "",
        emergencyContactMobile: data.emergencyContactMobile || "",
        department: data.department || "",
        designation: data.designation || "",
        dateOfJoining: data.dateOfJoining ? data.dateOfJoining.slice(0, 10) : "",
        dateOfRetirement: data.dateOfRetirement ? data.dateOfRetirement.slice(0, 10) : "",
        pensionType: data.pensionType || "",
        bankAccountNumber: data.bankAccountNumber || "",
        bankIfscCode: data.bankIfscCode || "",
        bankAccountHolderName: data.bankAccountHolderName || "",
        bankBranchName: data.bankBranchName || "",
        bankBranchAddress: data.bankBranchAddress || "",
        bankAccountType: data.bankAccountType || "",
        nomineeName: data.nomineeName || "",
        nomineeRelation: data.nomineeRelation || "",
        nomineeShare: data.nomineeShare || "",
        address: data.address || "",
        profilePhotoUrl: data.profilePhotoUrl || "",
        idCardUrl: data.idCardUrl || "",
        status: data.status || "PENDING"
      });
    }
  }, [data]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const payload: Record<string, unknown> = { ...form };
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
      <h1>{isEdit ? "Edit Pensioner" : "Add Pensioner"}</h1>
      {error && <div className="error">{error}</div>}
      <form className="card" onSubmit={submit}>
        <h3>Personal Information</h3>
        <div className="form-group">
          <label>Employee ID</label>
          <input className="input" value={form.employeeId} onChange={e => set("employeeId", e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Full Name</label>
          <input className="input" value={form.name} onChange={e => set("name", e.target.value)} required />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Mobile</label>
            <input className="input" value={form.mobile} onChange={e => set("mobile", e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" value={form.email} onChange={e => set("email", e.target.value)} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label>Gender</label>
            <select className="input" value={form.gender} onChange={e => set("gender", e.target.value)}>
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input className="input" type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Marital Status</label>
            <select className="input" value={form.maritalStatus} onChange={e => set("maritalStatus", e.target.value)}>
              <option value="">Select</option>
              <option>Single</option>
              <option>Married</option>
              <option>Widowed</option>
              <option>Divorced</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Father / Spouse Name</label>
          <input className="input" value={form.fatherName} onChange={e => set("fatherName", e.target.value)} />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>PAN Number</label>
            <input className="input" value={form.panNumber} onChange={e => set("panNumber", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Aadhaar Number</label>
            <input className="input" value={form.aadhaarNumber} onChange={e => set("aadhaarNumber", e.target.value)} />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Blood Group</label>
            <select className="input" value={form.bloodGroup} onChange={e => set("bloodGroup", e.target.value)}>
              <option value="">Select</option>
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option>
              <option>O+</option><option>O-</option>
            </select>
          </div>
          <div className="form-group">
            <label>Emergency Contact Name</label>
            <input className="input" value={form.emergencyContactName} onChange={e => set("emergencyContactName", e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Emergency Contact Mobile</label>
          <input className="input" value={form.emergencyContactMobile} onChange={e => set("emergencyContactMobile", e.target.value)} />
        </div>
        <div className="form-group">
          <label>Address</label>
          <textarea className="input" rows={3} value={form.address} onChange={e => set("address", e.target.value)} />
        </div>

        <h3 style={{ marginTop: 24 }}>Employment Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Department</label>
            <input className="input" value={form.department} onChange={e => set("department", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Designation</label>
            <input className="input" value={form.designation} onChange={e => set("designation", e.target.value)} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label>Date of Joining</label>
            <input className="input" type="date" value={form.dateOfJoining} onChange={e => set("dateOfJoining", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Date of Retirement</label>
            <input className="input" type="date" value={form.dateOfRetirement} onChange={e => set("dateOfRetirement", e.target.value)} />
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

        <h3 style={{ marginTop: 24 }}>Bank Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Account Holder Name</label>
            <input className="input" value={form.bankAccountHolderName} onChange={e => set("bankAccountHolderName", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Account Number</label>
            <input className="input" value={form.bankAccountNumber} onChange={e => set("bankAccountNumber", e.target.value)} />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>IFSC Code</label>
            <input className="input" value={form.bankIfscCode} onChange={e => set("bankIfscCode", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Account Type</label>
            <select className="input" value={form.bankAccountType} onChange={e => set("bankAccountType", e.target.value)}>
              <option value="">Select</option>
              <option>Savings</option>
              <option>Current</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Branch Name</label>
          <input className="input" value={form.bankBranchName} onChange={e => set("bankBranchName", e.target.value)} />
        </div>
        <div className="form-group">
          <label>Branch Address</label>
          <textarea className="input" rows={2} value={form.bankBranchAddress} onChange={e => set("bankBranchAddress", e.target.value)} />
        </div>

        <h3 style={{ marginTop: 24 }}>Nominee Details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label>Nominee Name</label>
            <input className="input" value={form.nomineeName} onChange={e => set("nomineeName", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Relation</label>
            <input className="input" value={form.nomineeRelation} onChange={e => set("nomineeRelation", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Share (%)</label>
            <input className="input" value={form.nomineeShare} onChange={e => set("nomineeShare", e.target.value)} />
          </div>
        </div>

        <h3 style={{ marginTop: 24 }}>Other</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Profile Photo URL</label>
            <input className="input" value={form.profilePhotoUrl} onChange={e => set("profilePhotoUrl", e.target.value)} />
          </div>
          <div className="form-group">
            <label>ID Card URL</label>
            <input className="input" value={form.idCardUrl} onChange={e => set("idCardUrl", e.target.value)} />
          </div>
        </div>
        {isEdit && (
          <div className="form-group">
            <label>Status</label>
            <select className="input" value={form.status} onChange={e => set("status", e.target.value)}>
              <option>PENDING</option>
              <option>APPROVED</option>
              <option>REJECTED</option>
              <option>SUSPENDED</option>
              <option>INACTIVE</option>
            </select>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : isEdit ? "Update Pensioner" : "Create Pensioner"}
          </button>
          <button type="button" className="secondary" onClick={() => navigate("/pensioners")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
