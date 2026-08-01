import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { User, Mail, Phone, Calendar, MapPin, CreditCard, Banknote, Users, CheckCircle, FileText, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../api";
import FormField from "../components/FormField";

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

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" }
];

const maritalStatusOptions = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Widowed", label: "Widowed" },
  { value: "Divorced", label: "Divorced" }
];

const bloodGroupOptions = [
  { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
  { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" }, { value: "O-", label: "O-" }
];

const pensionTypeOptions = [
  { value: "Self", label: "Self" },
  { value: "Family", label: "Family" },
  { value: "Commuted", label: "Commuted" },
  { value: "Other", label: "Other" }
];

const bankAccountTypeOptions = [
  { value: "Savings", label: "Savings" },
  { value: "Current", label: "Current" }
];

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "INACTIVE", label: "Inactive" }
];

export default function PensionerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");

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
      setSuccessMsg("Pensioner saved successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        navigate("/pensioners");
      }, 1500);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Operation failed");
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
    if (errors[key]) {
      setErrors(e => { const copy = { ...e }; delete copy[key]; return copy; });
    }
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!form.employeeId) newErrors.employeeId = "Employee ID is required";
    if (!form.name) newErrors.name = "Full name is required";
    if (!form.mobile || !/^[6-9]\d{9}$/.test(form.mobile)) newErrors.mobile = "Valid 10-digit mobile number required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Valid email is required";
    if (!form.fatherName) newErrors.fatherName = "Father/Spouse name is required";
    if (form.aadhaarNumber && !/^\d{12}$/.test(form.aadhaarNumber)) newErrors.aadhaarNumber = "12-digit Aadhaar required";
    if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) newErrors.panNumber = "Valid PAN number required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function clearError() {
    setError("");
    setErrors({});
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    clearError();

    if (!validate()) return;

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
            <User size={32} className="icon" color="var(--accent)" />
            {isEdit ? "Edit Pensioner" : "Add Pensioner"}
          </h1>
          <p className="page-subtitle">{isEdit ? "Update pensioner information" : "Register a new pensioner"}</p>
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
        <motion.div className="form-section" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="form-section-title">Personal Information</div>
          <div className="form-row">
            <FormField
              label="Employee ID"
              name="employeeId"
              value={form.employeeId}
              onChange={(e) => set("employeeId", e.target.value)}
              icon={<Hash size={18} />}
              required
              error={errors.employeeId}
              placeholder="e.g. EMP001"
            />
            <FormField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              icon={<User size={18} />}
              required
              error={errors.name}
              placeholder="Enter full name"
            />
          </div>

          <div className="form-row">
            <FormField
              label="Mobile"
              name="mobile"
              value={form.mobile}
              onChange={(e) => set("mobile", e.target.value)}
              icon={<Phone size={18} />}
              required
              error={errors.mobile}
              placeholder="10-digit mobile number"
              maxLength={10}
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              icon={<Mail size={18} />}
              error={errors.email}
              placeholder="name@example.com"
            />
          </div>

          <div className="form-row">
            <FormField
              label="Gender"
              name="gender"
              type="select"
              options={genderOptions}
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
              placeholder="Select"
            />
            <FormField
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
              icon={<Calendar size={18} />}
            />
            <FormField
              label="Marital Status"
              name="maritalStatus"
              type="select"
              options={maritalStatusOptions}
              value={form.maritalStatus}
              onChange={(e) => set("maritalStatus", e.target.value)}
              placeholder="Select"
            />
          </div>

          <FormField
            label="Father / Spouse Name"
            name="fatherName"
            value={form.fatherName}
            onChange={(e) => set("fatherName", e.target.value)}
            icon={<Users size={18} />}
            required
            error={errors.fatherName}
            placeholder="Enter father/spouse name"
          />

          <div className="form-row">
            <FormField
              label="PAN Number"
              name="panNumber"
              value={form.panNumber}
              onChange={(e) => set("panNumber", e.target.value)}
              icon={<CreditCard size={18} />}
              error={errors.panNumber}
              placeholder="e.g. ABCDE1234F"
              maxLength={10}
            />
            <FormField
              label="Aadhaar Number"
              name="aadhaarNumber"
              value={form.aadhaarNumber}
              onChange={(e) => set("aadhaarNumber", e.target.value)}
              icon={<Hash size={18} />}
              error={errors.aadhaarNumber}
              placeholder="12-digit aadhaar"
              maxLength={12}
            />
          </div>

          <div className="form-row">
            <FormField
              label="Blood Group"
              name="bloodGroup"
              type="select"
              options={bloodGroupOptions}
              value={form.bloodGroup}
              onChange={(e) => set("bloodGroup", e.target.value)}
              placeholder="Select"
            />
            <FormField
              label="Emergency Contact Name"
              name="emergencyContactName"
              value={form.emergencyContactName}
              onChange={(e) => set("emergencyContactName", e.target.value)}
              icon={<User size={18} />}
              placeholder="Enter contact name"
            />
          </div>

          <FormField
            label="Emergency Contact Mobile"
            name="emergencyContactMobile"
            value={form.emergencyContactMobile}
            onChange={(e) => set("emergencyContactMobile", e.target.value)}
            icon={<Phone size={18} />}
            placeholder="10-digit mobile number"
            maxLength={10}
          />

          <FormField
            label="Address"
            name="address"
            type="textarea"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            icon={<MapPin size={18} />}
            placeholder="Enter full address"
              rows={3}
            />
          </motion.div>

          <motion.div className="form-section" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="form-section-title">Employment Information</div>
          <div className="form-row">
            <FormField
              label="Department"
              name="department"
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
              icon={<MapPin size={18} />}
              placeholder="Enter department"
            />
            <FormField
              label="Designation"
              name="designation"
              value={form.designation}
              onChange={(e) => set("designation", e.target.value)}
              icon={<User size={18} />}
              placeholder="Enter designation"
            />
          </div>

          <div className="form-row">
            <FormField
              label="Date of Joining"
              name="dateOfJoining"
              type="date"
              value={form.dateOfJoining}
              onChange={(e) => set("dateOfJoining", e.target.value)}
              icon={<Calendar size={18} />}
            />
            <FormField
              label="Date of Retirement"
              name="dateOfRetirement"
              type="date"
              value={form.dateOfRetirement}
              onChange={(e) => set("dateOfRetirement", e.target.value)}
              icon={<Calendar size={18} />}
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
          </motion.div>

          <motion.div className="form-section" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <div className="form-section-title">Bank Details</div>
          <div className="form-row">
            <FormField
              label="Account Holder Name"
              name="bankAccountHolderName"
              value={form.bankAccountHolderName}
              onChange={(e) => set("bankAccountHolderName", e.target.value)}
              icon={<User size={18} />}
              placeholder="Enter account holder name"
            />
            <FormField
              label="Account Number"
              name="bankAccountNumber"
              value={form.bankAccountNumber}
              onChange={(e) => set("bankAccountNumber", e.target.value)}
              icon={<Banknote size={18} />}
              placeholder="Enter account number"
            />
          </div>

          <div className="form-row">
            <FormField
              label="IFSC Code"
              name="bankIfscCode"
              value={form.bankIfscCode}
              onChange={(e) => set("bankIfscCode", e.target.value)}
              icon={<Hash size={18} />}
              placeholder="e.g. SBIN0001234"
              maxLength={11}
            />
            <FormField
              label="Account Type"
              name="bankAccountType"
              type="select"
              options={bankAccountTypeOptions}
              value={form.bankAccountType}
              onChange={(e) => set("bankAccountType", e.target.value)}
              placeholder="Select"
            />
          </div>

          <FormField
            label="Branch Name"
            name="bankBranchName"
            value={form.bankBranchName}
            onChange={(e) => set("bankBranchName", e.target.value)}
            icon={<Banknote size={18} />}
            placeholder="Enter branch name"
          />

          <FormField
            label="Branch Address"
            name="bankBranchAddress"
            type="textarea"
            value={form.bankBranchAddress}
            onChange={(e) => set("bankBranchAddress", e.target.value)}
            icon={<MapPin size={18} />}
            placeholder="Enter branch address"
            rows={2}
            />
          </motion.div>

          <motion.div className="form-section" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <div className="form-section-title">Nominee Details</div>
          <div className="form-row">
            <FormField
              label="Nominee Name"
              name="nomineeName"
              value={form.nomineeName}
              onChange={(e) => set("nomineeName", e.target.value)}
              icon={<User size={18} />}
              placeholder="Enter nominee name"
            />
            <FormField
              label="Relation"
              name="nomineeRelation"
              value={form.nomineeRelation}
              onChange={(e) => set("nomineeRelation", e.target.value)}
              icon={<Users size={18} />}
              placeholder="e.g. Son, Daughter, Spouse"
            />
            <FormField
              label="Share (%)"
              name="nomineeShare"
              value={form.nomineeShare}
              onChange={(e) => set("nomineeShare", e.target.value)}
              icon={<Banknote size={18} />}
              placeholder="e.g. 100"
              type="number"
              min={0}
              max={100}
            />
          </div>
        </motion.div>

        <motion.div className="form-section" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <div className="form-section-title">Document Links</div>
          <div className="form-row">
            <FormField
              label="Profile Photo URL"
              name="profilePhotoUrl"
              value={form.profilePhotoUrl}
              onChange={(e) => set("profilePhotoUrl", e.target.value)}
              icon={<FileText size={18} />}
              placeholder="https://..."
            />
            <FormField
              label="ID Card URL"
              name="idCardUrl"
              value={form.idCardUrl}
              onChange={(e) => set("idCardUrl", e.target.value)}
              icon={<FileText size={18} />}
              placeholder="https://..."
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
        </motion.div>

        <motion.div className="form-actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <motion.button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/pensioners")}
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
              {mutation.isPending ? "Saving..." : (isEdit ? "Update Pensioner" : "Create Pensioner")}
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
