import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Mail, Phone, Calendar, MapPin, Shield, FileText } from "lucide-react";
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

  const Section = ({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) => (
    <motion.div
      className="card"
      style={{ marginBottom: 16 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 + delay }}
      whileHover={{ y: -2 }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </motion.div>
  );

  const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || "-"}</span>
    </div>
  );

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
            <Users size={32} className="icon" color="var(--accent)" />
            {data.name}
          </h1>
          <p className="page-subtitle">Pensioner Details</p>
        </div>
        <Link to={`/pensioners/${id}/edit`}>
          <motion.button
            className="btn btn-secondary"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            Edit
          </motion.button>
        </Link>
      </motion.div>

      <div className="detail-grid">
        <Section title="Personal Information" delay={0}>
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

        <Section title="Employment Information" delay={0.1}>
          <Field label="Department" value={data.department} />
          <Field label="Designation" value={data.designation} />
          <Field label="Date of Joining" value={data.dateOfJoining?.slice(0, 10)} />
          <Field label="Date of Retirement" value={data.dateOfRetirement?.slice(0, 10)} />
          <Field label="Pension Type" value={data.pensionType} />
        </Section>

        <Section title="Bank Details" delay={0.2}>
          <Field label="Account Holder" value={data.bankAccountHolderName} />
          <Field label="Account Number" value={data.bankAccountNumber} />
          <Field label="IFSC Code" value={data.bankIfscCode} />
          <Field label="Account Type" value={data.bankAccountType} />
          <Field label="Branch Name" value={data.bankBranchName} />
          <Field label="Branch Address" value={data.bankBranchAddress} />
        </Section>

        <Section title="Nominee Details" delay={0.3}>
          <Field label="Nominee Name" value={data.nomineeName} />
          <Field label="Relation" value={data.nomineeRelation} />
          <Field label="Share" value={data.nomineeShare} />
        </Section>

        <Section title="Current Pension" delay={0.4}>
          <Field label="PPO Number" value={p?.ppoNumber} />
          <Field label="Category" value={p?.category} />
          <Field label="Pension Amount" value={p ? `₹${p.pensionAmount}` : "-"} />
          <Field label="Effective From" value={p?.effectiveFrom?.slice(0, 10)} />
          <Field label="Bank Name" value={p?.bankName} />
        </Section>

        <Section title="Documents" delay={0.5}>
          <Field label="Profile Photo" value={data.profilePhotoUrl} />
          <Field label="ID Card" value={data.idCardUrl} />
        </Section>
      </div>

        <motion.div
          className="card"
          style={{ marginTop: 24 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ y: -2 }}
        >
          <h3 style={{ marginTop: 0 }}>Recent Records</h3>
          <motion.div
            className="cards"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
            }}
          >
            {data.pensionSlips && (
              <motion.div className="card" variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3 }} whileHover={{ y: -2 }}>
                <h4>Pension Slips ({data.pensionSlips?.length || 0})</h4>
                {(data.pensionSlips || []).slice(0, 5).map((s: any, i: number) => (
                  <motion.div
                    key={s.id}
                    style={{ padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.03 }}
                  >
                    {s.month}/{s.year} - ₹{s.netAmount}
                  </motion.div>
                ))}
              </motion.div>
            )}
            {data.policies && (
              <motion.div className="card" variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3 }} whileHover={{ y: -2 }}>
                <h4>Policies ({data.policies?.length || 0})</h4>
                {(data.policies || []).slice(0, 5).map((p: any, i: number) => (
                  <motion.div
                    key={p.id}
                    style={{ padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.03 }}
                  >
                    {p.policy?.title || "Policy"} {p.acknowledgedAt ? "✓" : ""}
                  </motion.div>
                ))}
              </motion.div>
            )}
            {data.grievances && (
              <motion.div className="card" variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.3 }} whileHover={{ y: -2 }}>
                <h4>Grievances ({data.grievances?.length || 0})</h4>
                {(data.grievances || []).slice(0, 5).map((g: any, i: number) => (
                  <motion.div
                    key={g.id}
                    style={{ padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.03 }}
                  >
                    {g.subject} - <b>{g.status}</b>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
    </motion.div>
  );
}
