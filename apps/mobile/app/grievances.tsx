import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../src/api";

export default function GrievancesScreen() {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["grievances"],
    queryFn: async () => (await api.get("/pensioner/grievances")).data.data
  });

  const createMutation = useMutation({
    mutationFn: async () => (await api.post("/pensioner/grievances", { subject, description })).data,
    onSuccess: () => {
      setSubject("");
      setDescription("");
      refetch();
    }
  });

  function handleCreate() {
    if (!subject.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    createMutation.mutate();
  }

  if (isLoading) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.error}>Failed to load grievances</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Grievances</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Submit New Grievance</Text>
        <TextInput
          style={styles.input}
          placeholder="Subject"
          value={subject}
          onChangeText={setSubject}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={createMutation.isPending}>
          <Text style={styles.buttonText}>{createMutation.isPending ? "Submitting..." : "Submit Grievance"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My Grievances</Text>
      {(data || []).map((item: any) => (
        <TouchableOpacity key={item.id} style={styles.card} onPress={() => setSelected(item)}>
          <Text style={styles.grievanceTitle}>{item.subject}</Text>
          <Text style={styles.grievanceDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.status}>{item.status}</Text>
            {item.adminReply && <Text style={styles.reply}>Has reply</Text>}
          </View>
        </TouchableOpacity>
      ))}

      {selected && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selected.subject}</Text>
            <Text style={styles.modalDesc}>{selected.description}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{selected.status}</Text>
            </View>
            {selected.adminReply && (
              <View style={styles.replyBox}>
                <Text style={styles.replyLabel}>Admin Reply:</Text>
                <Text style={styles.replyText}>{selected.adminReply}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelected(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#eef3f9", paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "#dc2626" },
  title: { fontSize: 26, fontWeight: "700", color: "#17345e", marginBottom: 20 },
  card: { backgroundColor: "white", padding: 18, borderRadius: 14, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1d5fd1", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", padding: 14, borderRadius: 10, marginBottom: 12, fontSize: 14 },
  textArea: { height: 100, textAlignVertical: "top" },
  button: { backgroundColor: "#1d5fd1", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "700", fontSize: 14 },
  grievanceTitle: { fontSize: 15, fontWeight: "700", color: "#17345e", marginBottom: 6 },
  grievanceDesc: { color: "#4b5563", fontSize: 13, lineHeight: 18, marginBottom: 10 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  status: { color: "#1d5fd1", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  reply: { color: "#16a34a", fontSize: 12, fontWeight: "600" },
  modal: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "white", padding: 24, borderRadius: 16, width: "100%", maxHeight: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#17345e", marginBottom: 12 },
  modalDesc: { color: "#4b5563", fontSize: 14, lineHeight: 20, marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  label: { color: "#667085", fontSize: 14 },
  value: { color: "#172033", fontSize: 14, fontWeight: "600" },
  replyBox: { backgroundColor: "#f0f7ff", padding: 14, borderRadius: 10, marginTop: 16, marginBottom: 16 },
  replyLabel: { color: "#1d5fd1", fontWeight: "700", fontSize: 13, marginBottom: 6 },
  replyText: { color: "#172033", fontSize: 14, lineHeight: 20 },
  closeButton: { backgroundColor: "#1d5fd1", padding: 14, borderRadius: 10, alignItems: "center" },
  closeButtonText: { color: "white", fontWeight: "700", fontSize: 14 }
});
