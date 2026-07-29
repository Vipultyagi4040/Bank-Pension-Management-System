import { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("pensionerToken");
      setAuthed(!!token);
      setChecking(false);
    })();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1d5fd1" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerTitleAlign: "center", contentStyle: { backgroundColor: "#eef3f9" } }}>
      {!authed ? (
        <>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="verify" options={{ title: "Verify OTP" }} />
          <Stack.Screen name="register" options={{ title: "Register" }} />
        </>
      ) : (
        <>
          <Stack.Screen name="dashboard" options={{ title: "Dashboard", headerLeft: () => null }} />
          <Stack.Screen name="profile" options={{ title: "Profile" }} />
          <Stack.Screen name="pension" options={{ title: "Pension History" }} />
          <Stack.Screen name="slips" options={{ title: "Pension Slips" }} />
          <Stack.Screen name="policies" options={{ title: "Policies" }} />
          <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
          <Stack.Screen name="grievances" options={{ title: "Grievances" }} />
          <Stack.Screen name="leads" options={{ title: "Lead Generation" }} />
          <Stack.Screen name="jeevan" options={{ title: "Jeevan Pramaan" }} />
        </>
      )}
    </Stack>
  );
}
