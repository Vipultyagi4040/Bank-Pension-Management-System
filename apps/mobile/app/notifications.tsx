import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../src/api";

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: async () => (await api.get("/pensioner/notifications", { params: { read: filter || undefined } })).data.data
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => (await api.patch(`/pensioner/notifications/${id}/read`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
  });

  const markAllRead = useMutation({
    mutationFn: async () => (await api.patch("/pensioner/notifications/read-all")).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
  });

  if (isLoading) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.error}>Failed to load notifications</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity style={styles.markAllButton} onPress={() => markAllRead.mutate()}>
          <Text style={styles.markAllText}>Mark All Read</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {["", "false", "true"].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "" ? "All" : f === "false" ? "Unread" : "Read"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {(data?.items || []).map((item: any) => (
        <View key={item.id} style={[styles.card, !item.readAt && styles.unreadCard]}>
          <Text style={styles.notifTitle}>{item.notification?.title}</Text>
          <Text style={styles.notifMessage}>{item.notification?.message}</Text>
          <Text style={styles.notifDate}>
            {item.notification?.createdAt ? new Date(item.notification.createdAt).toLocaleString() : ""}
          </Text>
          {!item.readAt && (
            <TouchableOpacity style={styles.readButton} onPress={() => markRead.mutate(item.id)}>
              <Text style={styles.readButtonText}>Mark as Read</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

import { useState } from "react";

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#eef3f9", paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "#dc2626" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "700", color: "#17345e" },
  markAllButton: { backgroundColor: "#1d5fd1", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  markAllText: { color: "white", fontSize: 12, fontWeight: "600" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "white", borderWidth: 1, borderColor: "#d0d7ee" },
  filterChipActive: { backgroundColor: "#1d5fd1", borderColor: "#1d5fd1" },
  filterText: { color: "#667085", fontSize: 13, fontWeight: "600" },
  filterTextActive: { color: "white" },
  card: { backgroundColor: "white", padding: 18, borderRadius: 14, marginBottom: 12 },
  unreadCard: { borderLeftWidth: 4, borderLeftColor: "#1d5fd1" },
  notifTitle: { fontSize: 15, fontWeight: "700", color: "#17345e", marginBottom: 6 },
  notifMessage: { color: "#4b5563", fontSize: 13, lineHeight: 18, marginBottom: 10 },
  notifDate: { color: "#667085", fontSize: 11, marginBottom: 10 },
  readButton: { backgroundColor: "#1d5fd1", padding: 10, borderRadius: 8, alignItems: "center" },
  readButtonText: { color: "white", fontWeight: "700", fontSize: 13 }
});
