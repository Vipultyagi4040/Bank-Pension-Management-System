import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../src/api";

export default function PensionHistoryScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pensionHistory"],
    queryFn: async () => (await api.get("/pensioner/pension")).data.data
  });

  if (isLoading) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.error}>Failed to load pension history</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pension History</Text>
      {(data || []).map((item: any) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>PPO Number</Text>
            <Text style={styles.value}>{item.ppoNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{item.pensionType || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{item.category || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Basic Pension</Text>
            <Text style={styles.value}>₹{item.basicPension}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>DA</Text>
            <Text style={styles.value}>₹{item.da}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>HRA</Text>
            <Text style={styles.value}>₹{item.hra}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Medical Allowance</Text>
            <Text style={styles.value}>₹{item.medicalAllowance}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Other Allowances</Text>
            <Text style={styles.value}>₹{item.otherAllowances}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Deductions</Text>
            <Text style={styles.value}>₹{item.deductions}</Text>
          </View>
          <View style={[styles.row, styles.highlight]}>
            <Text style={styles.highlightLabel}>Pension Amount</Text>
            <Text style={styles.highlightValue}>₹{item.pensionAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Effective From</Text>
            <Text style={styles.value}>{item.effectiveFrom ? new Date(item.effectiveFrom).toLocaleDateString() : "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Effective To</Text>
            <Text style={styles.value}>{item.effectiveTo ? new Date(item.effectiveTo).toLocaleDateString() : "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{item.status}</Text>
          </View>
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
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  label: { color: "#667085", fontSize: 14, flex: 1 },
  value: { color: "#172033", fontSize: 14, fontWeight: "600", flex: 1, textAlign: "right" },
  highlight: { backgroundColor: "#f0f7ff", paddingHorizontal: 12, marginHorizontal: -18, borderBottomWidth: 0 },
  highlightLabel: { color: "#1d5fd1", fontSize: 14, fontWeight: "700", flex: 1 },
  highlightValue: { color: "#1d5fd1", fontSize: 16, fontWeight: "700", flex: 1, textAlign: "right" }
});
