import { useQuery } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../src/api";
import { Paths } from "expo-file-system";
import { writeAsStringAsync } from "expo-file-system/legacy";

export default function PensionSlipsScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pensionSlips"],
    queryFn: async () => (await api.get("/pensioner/slips")).data.data
  });

  async function downloadPdf(id: string) {
    try {
      const token = await SecureStore.getItemAsync("pensionerToken");
      const url = `${process.env.EXPO_PUBLIC_API_URL}/pensioner/slips/${id}/download`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const fileUri = Paths.document.uri + `pension-slip-${id}.pdf`;
        await writeAsStringAsync(fileUri, base64, { encoding: "base64" });
        Alert.alert("Success", `PDF saved to ${fileUri}`);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to download slip");
    }
  }

  if (isLoading) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.error}>Failed to load slips</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pension Slips</Text>
      {(data || []).map((item: any) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Month</Text>
            <Text style={styles.value}>{item.month.toString().padStart(2, "0")}/{item.year}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Gross Amount</Text>
            <Text style={styles.value}>₹{item.grossAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Deductions</Text>
            <Text style={styles.value}>₹{item.deductions}</Text>
          </View>
          <View style={[styles.row, styles.highlight]}>
            <Text style={styles.highlightLabel}>Net Amount</Text>
            <Text style={styles.highlightValue}>₹{item.netAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{item.status || "Pending"}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => downloadPdf(item.id)}>
            <Text style={styles.buttonText}>Download PDF</Text>
          </TouchableOpacity>
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
  highlightValue: { color: "#1d5fd1", fontSize: 16, fontWeight: "700", flex: 1, textAlign: "right" },
  button: { backgroundColor: "#1d5fd1", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 16 },
  buttonText: { color: "white", fontWeight: "700", fontSize: 14 }
});
