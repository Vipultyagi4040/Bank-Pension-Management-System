import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../src/api";

export default function ProfileScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pensionerProfile"],
    queryFn: async () => (await api.get("/pensioner/profile")).data.data
  });

  if (isLoading) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.error}>Failed to load profile</Text></View>;
  }

  const p = data?.pensionDetails?.[0];

  const sections = [
    {
      title: "Personal Information",
      items: [
        ["Employee ID", data?.employeeId],
        ["Name", data?.name],
        ["Mobile", data?.mobile],
        ["Email", data?.email || "-"],
        ["Gender", data?.gender || "-"],
        ["Date of Birth", data?.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : "-"],
        ["Marital Status", data?.maritalStatus || "-"],
        ["Father / Spouse", data?.fatherName || "-"],
        ["PAN", data?.panNumber || "-"],
        ["Aadhaar", data?.aadhaarNumber ? "XXXX-XXXX-" + data.aadhaarNumber.slice(-4) : "-"],
        ["Blood Group", data?.bloodGroup || "-"],
        ["Emergency Contact", data?.emergencyContactName ? `${data.emergencyContactName} (${data.emergencyContactMobile})` : "-"],
        ["Address", data?.address || "-"],
        ["Status", data?.status],
      ]
    },
    {
      title: "Employment Information",
      items: [
        ["Department", data?.department || "-"],
        ["Designation", data?.designation || "-"],
        ["Date of Joining", data?.dateOfJoining ? new Date(data.dateOfJoining).toLocaleDateString() : "-"],
        ["Date of Retirement", data?.dateOfRetirement ? new Date(data.dateOfRetirement).toLocaleDateString() : "-"],
        ["Pension Type", data?.pensionType || "-"],
      ]
    },
    {
      title: "Bank Details",
      items: [
        ["Account Holder", data?.bankAccountHolderName || "-"],
        ["Account Number", data?.bankAccountNumber || "-"],
        ["IFSC Code", data?.bankIfscCode || "-"],
        ["Account Type", data?.bankAccountType || "-"],
        ["Branch Name", data?.bankBranchName || "-"],
        ["Branch Address", data?.bankBranchAddress || "-"],
      ]
    },
    {
      title: "Nominee Details",
      items: [
        ["Nominee Name", data?.nomineeName || "-"],
        ["Relation", data?.nomineeRelation || "-"],
        ["Share", data?.nomineeShare || "-"],
      ]
    },
    {
      title: "Current Pension",
      items: p ? [
        ["PPO Number", p.ppoNumber],
        ["Category", p.category || "-"],
        ["Pension Amount", `₹${p.pensionAmount}`],
        ["Effective From", new Date(p.effectiveFrom).toLocaleDateString()],
        ["Bank Name", p.bankName || "-"],
      ] : [["No pension record", "No active pension detail found"]]
    }
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      {sections.map(section => (
        <View key={section.title} style={styles.card}>
          <Text style={styles.cardTitle}>{section.title}</Text>
          {section.items.map(([label, value]) => (
            <View key={label} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#eef3f9", paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "#dc2626" },
  title: { fontSize: 26, fontWeight: "700", color: "#17345e", marginBottom: 20 },
  card: { backgroundColor: "white", padding: 18, borderRadius: 14, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1d5fd1", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  label: { color: "#667085", fontSize: 13, flex: 1 },
  value: { color: "#172033", fontSize: 13, fontWeight: "600", flex: 1, textAlign: "right" }
});
