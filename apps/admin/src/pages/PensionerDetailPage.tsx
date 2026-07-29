import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

export default function PensionerDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["pensioner", id],
    queryFn: async () => (await api.get(`/admin/pensioners/${id}`)).data.data
  });

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>Pensioner not found</p>;

  const p = data.pensionDetails?.[0];

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );

  const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div style={{ marginBottom: 8 }}>
      <span style={{ color: "#667085", fontSize: 13 }}>{label}</span>
      <div style={{ fontWeight: 500 }}>{value || "-"}</div>
    </div>
  );

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{data.name}</h1>
        <Link to={`/pensioners/${id}/edit`}><button>Edit</button></Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        <Section title="Personal Information">
          <Field label="Employee ID" value={data.employeeId} />
          <Field label="Mobile" value={data.mobile} />
          <Field label="Email" value={data.email} />
          <Field label="Gender" value={data.gender} />
          <Field label="Date of Birth" value={data.dateOfBirth?.slice(0, 10)} />
          <Field label="Marital Status" value={data.maritalStatus} />
          <Field label="Father / Spouse Name" value={data.fatherName} />
          <Field label="PAN Number" value={data.panNumber} />
          <Field label="Aadhaar Number" value={data.aadhaarNumber} />
          <Field label="Blood Group" value={data.bloodGroup} />
          <Field label="Emergency Contact" value={data.emergencyContactName ? `${data.emergencyContactName} (${data.emergencyContactMobile})` : "-"} />
          <Field label="Address" value={data.address} />
          <Field label="Status" value={data.status} />
          <Field label="Registered At" value={data.createdAt?.slice(0, 10)} />
          <Field label="Approved At" value={data.approvedAt?.slice(0, 10)} />
        </Section>

        <Section title="Employment Information">
          <Field label="Department" value={data.department} />
          <Field label="Designation" value={data.designation} />
          <Field label="Date of Joining" value={data.dateOfJoining?.slice(0, 10)} />
          <Field label="Date of Retirement" value={data.dateOfRetirement?.slice(0, 10)} />
          <Field label="Pension Type" value={data.pensionType} />
        </Section>

        <Section title="Bank Details">
          <Field label="Account Holder" value={data.bankAccountHolderName} />
          <Field label="Account Number" value={data.bankAccountNumber} />
          <Field label="IFSC Code" value={data.bankIfscCode} />
          <Field label="Account Type" value={data.bankAccountType} />
          <Field label="Branch Name" value={data.bankBranchName} />
          <Field label="Branch Address" value={data.bankBranchAddress} />
        </Section>

        <Section title="Nominee Details">
          <Field label="Nominee Name" value={data.nomineeName} />
          <Field label="Relation" value={data.nomineeRelation} />
          <Field label="Share" value={data.nomineeShare} />
        </Section>

        <Section title="Current Pension">
          <Field label="PPO Number" value={p?.ppoNumber} />
          <Field label="Category" value={p?.category} />
          <Field label="Pension Amount" value={p ? `₹${p.pensionAmount}` : "-"} />
          <Field label="Effective From" value={p?.effectiveFrom?.slice(0, 10)} />
          <Field label="Bank Name" value={p?.bankName} />
        </Section>

        <Section title="Documents">
          <Field label="Profile Photo" value={data.profilePhotoUrl} />
          <Field label="ID Card" value={data.idCardUrl} />
        </Section>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Recent Records</h3>
        <div className="cards">
          <div className="card">
            <h4>Pension Slips ({data.pensionSlips?.length || 0})</h4>
            {(data.pensionSlips || []).slice(0, 5).map((s: any) => (
              <div key={s.id} style={{ padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}>
                {s.month}/{s.year} - ₹{s.netAmount}
              </div>
            ))}
          </div>
          <div className="card">
            <h4>Policies ({data.policies?.length || 0})</h4>
            {(data.policies || []).slice(0, 5).map((p: any) => (
              <div key={p.id} style={{ padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}>
                {p.policy?.title || "Policy"} {p.acknowledgedAt ? "✓" : ""}
              </div>
            ))}
          </div>
          <div className="card">
            <h4>Grievances ({data.grievances?.length || 0})</h4>
            {(data.grievances || []).slice(0, 5).map((g: any) => (
              <div key={g.id} style={{ padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}>
                {g.subject} - <b>{g.status}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
