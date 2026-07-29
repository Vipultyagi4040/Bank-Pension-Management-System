import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Linking } from "expo-linking";

export default function JeevanScreen() {
  const openPortal = async () => {
    const url = "https://jeevanpramaan.gov.in/";
    try {
      await Linking.openURL(url);
    } catch {
      alert("Unable to open link");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Jeevan Pramaan</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Official Portal</Text>
        <Text style={styles.cardDesc}>
          Submit or verify your Jeevan Pramaan certificate through the official government portal.
        </Text>
        <TouchableOpacity style={styles.portalButton} onPress={openPortal}>
          <Text style={styles.portalButtonText}>Open Jeevan Pramaan Portal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.infoTitle}>How it works</Text>
        <Text style={styles.infoText}>
          Your verification status will be updated by the admin on the dashboard based on the records
          uploaded by the bank. Please ensure you have submitted your Jeevan Pramaan certificate
          through the official portal.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#eef3f9", paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "700", color: "#17345e", marginBottom: 20 },
  card: { backgroundColor: "white", padding: 18, borderRadius: 14, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#17345e", marginBottom: 8 },
  cardDesc: { color: "#4b5563", fontSize: 13, lineHeight: 18, marginBottom: 14 },
  portalButton: { backgroundColor: "#1d5fd1", padding: 14, borderRadius: 10, alignItems: "center" },
  portalButtonText: { color: "white", fontWeight: "700", fontSize: 14 },
  infoTitle: { fontSize: 16, fontWeight: "700", color: "#17345e", marginBottom: 8 },
  infoText: { color: "#4b5563", fontSize: 13, lineHeight: 20 }
});
