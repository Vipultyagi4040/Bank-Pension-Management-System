import { useState } from "react";
import { router } from "expo-router";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../src/api";

export default function RegisterScreen() {
  const [form, setForm] = useState({ employeeId: "", mobile: "", email: "", address: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setMessage("");
    if (!form.employeeId.trim() || !form.mobile.trim()) {
      setError("Employee ID and mobile are required");
      return;
    }
    try {
      setLoading(true);
      const response = await api.post("/auth/pensioner/register", form);
      setMessage(response.data.message || "Registration submitted for approval");
      setForm({ employeeId: "", mobile: "", email: "", address: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Complete Registration</Text>
        <Text style={styles.subtitle}>Submit your details for approval</Text>

        <TextInput
          style={styles.input}
          placeholder="Employee ID"
          value={form.employeeId}
          onChangeText={text => setForm({ ...form, employeeId: text })}
          autoCapitalize="none"
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
          placeholder="Email (optional)"
          value={form.email}
          onChangeText={text => setForm({ ...form, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Address (optional)"
          value={form.address}
          onChangeText={text => setForm({ ...form, address: text })}
          multiline
          numberOfLines={3}
        />

        {message ? <Text style={styles.success}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Submitting..." : "Submit for Approval"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Back to login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef3f9", justifyContent: "center", padding: 20 },
  card: { backgroundColor: "white", padding: 24, borderRadius: 16 },
  title: { fontSize: 26, fontWeight: "700", color: "#17345e", marginBottom: 6 },
  subtitle: { color: "#667085", marginBottom: 24 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", padding: 14, borderRadius: 10, marginBottom: 14, fontSize: 14 },
  textArea: { height: 90, textAlignVertical: "top" },
  button: { backgroundColor: "#1d5fd1", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 8 },
  buttonText: { color: "white", fontWeight: "700", fontSize: 15 },
  backLink: { color: "#1d5fd1", textAlign: "center", marginTop: 16, fontWeight: "600" },
  success: { color: "#16a34a", textAlign: "center", marginBottom: 10, fontWeight: "600" },
  error: { color: "#dc2626", textAlign: "center", marginBottom: 10 }
});
