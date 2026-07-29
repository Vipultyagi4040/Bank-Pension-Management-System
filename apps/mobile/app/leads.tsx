import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../src/api";

export default function LeadsScreen() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", mobile: "", product: "", remarks: "" });
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: async () => (await api.post("/pensioner/leads", form)).data,
    onSuccess: () => {
      setMessage("Lead submitted successfully");
      setForm({ name: "", mobile: "", product: "", remarks: "" });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  });

  function handleSubmit() {
    if (!form.name.trim() || !form.mobile.trim()) {
      Alert.alert("Error", "Name and mobile are required");
      return;
    }
    mutation.mutate();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Lead Generation</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={form.name}
          onChangeText={text => setForm({ ...form, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          value={form.mobile}
          onChangeText={text => setForm({ ...form, mobile: text })}
          keyboardType="phone-pad"
          maxLength={10}
        />
        <TextInput
          style={styles.input}
          placeholder="Product / Service"
          value={form.product}
          onChangeText={text => setForm({ ...form, product: text })}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Remarks"
          value={form.remarks}
          onChangeText={text => setForm({ ...form, remarks: text })}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={mutation.isPending}>
          <Text style={styles.buttonText}>{mutation.isPending ? "Submitting..." : "Submit Lead"}</Text>
        </TouchableOpacity>
        {message ? <Text style={styles.success}>{message}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#eef3f9", paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "#dc2626" },
  title: { fontSize: 26, fontWeight: "700", color: "#17345e", marginBottom: 20 },
  card: { backgroundColor: "white", padding: 18, borderRadius: 14 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", padding: 14, borderRadius: 10, marginBottom: 12, fontSize: 14 },
  textArea: { height: 100, textAlignVertical: "top" },
  button: { backgroundColor: "#1d5fd1", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 8 },
  buttonText: { color: "white", fontWeight: "700", fontSize: 14 },
  success: { color: "#16a34a", textAlign: "center", marginTop: 14, fontWeight: "600" }
});
