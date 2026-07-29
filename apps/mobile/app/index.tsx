import { useState } from "react";
import { router } from "expo-router";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../src/api";

export default function LoginScreen() {
  const [mobile, setMobile] = useState("9999999999");
  const [loading, setLoading] = useState(false);

  async function requestOtp() {
    try {
      setLoading(true);
      const response = await api.post("/auth/pensioner/request-otp", { mobile });
      const devOtp = response.data.data?.developmentOtp;
      router.push({ pathname: "/verify", params: { mobile, devOtp: devOtp || "" } });
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message ?? "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bank Pensioner</Text>
        <Text style={styles.subtitle}>Login using your registered mobile number</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          maxLength={10}
          value={mobile}
          onChangeText={setMobile}
          placeholder="10-digit mobile number"
        />
        <TouchableOpacity style={styles.button} onPress={requestOtp} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Sending..." : "Send OTP"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.registerLink}>New user? Complete Registration</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef3f9", justifyContent: "center", padding: 20 },
  card: { backgroundColor: "white", padding: 28, borderRadius: 16 },
  title: { fontSize: 28, fontWeight: "700", color: "#17345e" },
  subtitle: { marginTop: 8, marginBottom: 24, color: "#667085" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", padding: 14, borderRadius: 10, marginBottom: 14, fontSize: 16 },
  button: { backgroundColor: "#1d5fd1", padding: 15, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
  registerLink: { color: "#1d5fd1", textAlign: "center", marginTop: 16, fontWeight: "600", fontSize: 14 }
});
