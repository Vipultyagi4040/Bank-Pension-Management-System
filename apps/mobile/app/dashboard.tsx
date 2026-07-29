import { useEffect, useState } from "react";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../src/api";

export default function DashboardScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const response = await api.get("/pensioner/dashboard");
      setData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await SecureStore.deleteItemAsync("pensionerToken");
    router.replace("/");
  }

  if (loading) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;
  }

  const currentPension = data?.profile?.pensionDetails?.[0];

  const menuItems = [
    { title: "Profile", screen: "/profile" },
    { title: "Pension History", screen: "/pension" },
    { title: "Pension Slips", screen: "/slips" },
    { title: "Policies", screen: "/policies" },
    { title: "Notifications", screen: "/notifications" },
    { title: "Grievances", screen: "/grievances" },
    { title: "Lead Generation", screen: "/leads" },
    { title: "Jeevan Pramaan", screen: "/jeevan" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.hello}>Welcome, {data?.profile?.name}</Text>
        <Text style={styles.employee}>{data?.profile?.employeeId}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Current Pension</Text>
        <Text style={styles.amount}>₹{currentPension?.pensionAmount ?? "Not available"}</Text>
        <Text style={styles.cardSub}>PPO: {currentPension?.ppoNumber ?? "-"}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.smallCard}>
          <Text style={styles.count}>{data?.counters?.openGrievances ?? 0}</Text>
          <Text style={styles.smallLabel}>Open Grievances</Text>
        </View>
        <View style={styles.smallCard}>
          <Text style={styles.count}>{data?.counters?.unreadNotifications ?? 0}</Text>
          <Text style={styles.smallLabel}>Notifications</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Services</Text>
      <View style={styles.menuList}>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => router.push(item.screen as any)}
          >
            <Text style={styles.menuText}>{item.title}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

import { TouchableOpacity } from "react-native";

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#eef3f9", minHeight: "100%" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  error: { color: "#dc2626", textAlign: "center" },
  header: { marginBottom: 20 },
  hello: { fontSize: 26, fontWeight: "700", color: "#17345e" },
  employee: { color: "#667085", marginTop: 4 },
  card: { backgroundColor: "#17345e", padding: 20, borderRadius: 16, marginBottom: 16 },
  cardLabel: { color: "#cddaf0", fontSize: 12, textTransform: "uppercase" },
  amount: { color: "white", fontSize: 32, fontWeight: "700", marginVertical: 8 },
  cardSub: { color: "#cddaf0", fontSize: 12 },
  grid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  smallCard: { flex: 1, backgroundColor: "white", padding: 16, borderRadius: 14, alignItems: "center" },
  count: { fontSize: 28, fontWeight: "700", color: "#1d5fd1" },
  smallLabel: { color: "#667085", marginTop: 4, fontSize: 12, textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#17345e", marginBottom: 12 },
  menuList: { gap: 10, marginBottom: 24 },
  menuItem: { backgroundColor: "white", padding: 18, borderRadius: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  menuText: { fontWeight: "600", color: "#172033", fontSize: 15 },
  menuArrow: { fontSize: 22, color: "#667085", fontWeight: "300" },
  logout: { backgroundColor: "#dc2626", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 8 },
  logoutText: { color: "white", fontWeight: "700", fontSize: 15 }
});
