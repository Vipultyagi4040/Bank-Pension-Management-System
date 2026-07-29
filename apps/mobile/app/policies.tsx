import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../src/api";

export default function PoliciesScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => (await api.get("/pensioner/policies")).data.data
  });

  const acknowledge = useMutation({
    mutationFn: async (id: string) => (await api.patch(`/pensioner/policies/${id}/acknowledge`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["policies"] })
  });

  function handleAcknowledge(id: string) {
    Alert.alert("Confirm", "Do you want to acknowledge and consent to this policy?", [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", onPress: () => acknowledge.mutate(id) }
    ]);
  }

  if (isLoading) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.error}>Failed to load policies</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Policies</Text>
      {(data || []).map((item: any) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.policyTitle}>{item.policy?.title || "Policy"}</Text>
          <Text style={styles.policyNumber}>{item.policy?.policyNumber || "-"}</Text>
          <Text style={styles.policyDesc} numberOfLines={3}>{item.policy?.coverageDetails || "No details available"}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Valid From</Text>
            <Text style={styles.value}>{item.policy?.validFrom ? new Date(item.policy.validFrom).toLocaleDateString() : "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Valid To</Text>
            <Text style={styles.value}>{item.policy?.validTo ? new Date(item.policy.validTo).toLocaleDateString() : "-"}</Text>
          </View>
          {item.acknowledgedAt ? (
            <Text style={styles.acknowledged}>Acknowledged on {new Date(item.acknowledgedAt).toLocaleDateString()}</Text>
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => handleAcknowledge(item.id)}>
              <Text style={styles.buttonText}>Acknowledge & Consent</Text>
            </TouchableOpacity>
          )}
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
  policyTitle: { fontSize: 16, fontWeight: "700", color: "#17345e", marginBottom: 4 },
  policyNumber: { fontSize: 12, color: "#667085", marginBottom: 10 },
  policyDesc: { color: "#4b5563", fontSize: 13, lineHeight: 18, marginBottom: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  label: { color: "#667085", fontSize: 13 },
  value: { color: "#172033", fontSize: 13, fontWeight: "600" },
  acknowledged: { color: "#16a34a", fontSize: 13, marginTop: 12, fontWeight: "600" },
  button: { backgroundColor: "#1d5fd1", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 14 },
  buttonText: { color: "white", fontWeight: "700", fontSize: 14 }
});
