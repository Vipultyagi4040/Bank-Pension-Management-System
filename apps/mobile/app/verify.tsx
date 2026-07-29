import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../src/api";

export default function VerifyScreen() {
  const params = useLocalSearchParams<{ mobile: string; devOtp?: string }>();
  const [otp, setOtp] = useState(params.devOtp ?? "");

  async function verify() {
    try {
      const response = await api.post("/auth/pensioner/verify-otp", {
        mobile: params.mobile,
        otp
      });
      await SecureStore.setItemAsync("pensionerToken", response.data.data.accessToken);
      router.replace("/dashboard");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message ?? "OTP verification failed");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>OTP sent to {params.mobile}</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          placeholder="6-digit OTP"
        />
        <TouchableOpacity style={styles.button} onPress={verify}>
          <Text style={styles.buttonText}>Verify and Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef3f9", justifyContent: "center", padding: 20 },
  card: { backgroundColor: "white", padding: 24, borderRadius: 16 },
  title: { fontSize: 26, fontWeight: "700" },
  subtitle: { marginVertical: 14, color: "#667085" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", padding: 14, borderRadius: 10, marginBottom: 14 },
  button: { backgroundColor: "#1d5fd1", padding: 15, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "700" }
});
