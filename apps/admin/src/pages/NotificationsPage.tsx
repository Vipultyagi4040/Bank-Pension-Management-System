import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, FileText, Users, CheckCircle, Search, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api";
import FormField from "../components/FormField";
import ToastContainer, { toastStore } from "../components/ToastContainer";

type Notification = {
  id: string;
  title: string;
  message: string;
  audience: string;
  publishedAt: string;
  createdById: string;
  receipts: { pensioner: { employeeId: string; name: string; mobile: string }; readAt: string }[];
};

type FilterType = "all" | "unread" | "read";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [pensionerIds, setPensionerIds] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"create" | "history">("history");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const client = useQueryClient();

  const unreadCount = (n: Notification) =>
    n.receipts?.filter((r) => !r.readAt).length ?? 0;
  const readCount = (n: Notification) =>
    n.receipts?.filter((r) => r.readAt).length ?? 0;

  function getPriority(n: Notification): "high" | "medium" | "low" {
    const total = n.receipts?.length ?? 0;
    const unread = unreadCount(n);
    if (total === 0) return "low";
    const ratio = unread / total;
    if (ratio > 0.5) return "high";
    if (ratio > 0.1) return "medium";
    return "low";
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!title || !message) {
      setError("Title and message are required");
      return;
    }
    setSubmitting(true);
    try {
      const ids = audience === "SELECTED" ? pensionerIds.split(",").map((s) => s.trim()).filter(Boolean) : [];
      if (audience === "SELECTED" && ids.length === 0) {
        setError("Select at least one pensioner");
        setSubmitting(false);
        return;
      }
      await api.post("/admin/notifications", { title, message, audience, pensionerIds: ids });
      setTitle("");
      setMessage("");
      setPensionerIds("");
      setAudience("ALL");
      toastStore.add({
        type: "success",
        title: "Notification Published",
        message: "The notification was sent successfully."
      });
      client.invalidateQueries({ queryKey: ["notifications"] });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to publish notification");
      toastStore.add({
        type: "error",
        title: "Publish Failed",
        message: err.response?.data?.message || "Failed to publish notification"
      });
    } finally {
      setSubmitting(false);
    }
  }

  const historyQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/admin/notifications")).data.data
  });

  if (historyQuery.isLoading) return <p>Loading...</p>;
  if (historyQuery.error) return <p className="form-error">Failed to load notifications</p>;

  const allNotifications = historyQuery.data?.items || [];

  const filtered = allNotifications
    .filter((n: Notification) => {
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" ||
        (filter === "unread" && unreadCount(n) > 0) ||
        (filter === "read" && unreadCount(n) === 0);
      return matchesSearch && matchesFilter;
    });

  return (
    <motion.div
      className="animate-fade-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ToastContainer />

      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div>
          <h1 className="page-title">
            <Bell size={32} className="icon" color="var(--accent)" />
            Notifications
          </h1>
          <p className="page-subtitle">Send and manage notifications</p>
        </div>
      </motion.div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-filters">
            <motion.button
              className={`btn ${tab === "create" ? "btn-primary" : "btn-secondary"} btn-sm`}
              onClick={() => setTab("create")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create
            </motion.button>
            <motion.button
              className={`btn ${tab === "history" ? "btn-primary" : "btn-secondary"} btn-sm`}
              onClick={() => setTab("history")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              History
            </motion.button>
          </div>
        </div>

        {tab === "create" && (
          <AnimatePresence>
            <motion.form
              className="form-card"
              onSubmit={submit}
              noValidate
              key="create-form"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h3 style={{ marginTop: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                Create Notification
              </motion.h3>

              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                <FormField
                  label="Title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  icon={<Bell size={18} />}
                  required
                  placeholder="Enter notification title"
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <FormField
                  label="Message"
                  name="message"
                  type="textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  icon={<FileText size={18} />}
                  required
                  placeholder="Enter notification message..."
                  rows={6}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                <FormField
                  label="Audience"
                  name="audience"
                  type="select"
                  options={[
                    { value: "ALL", label: "All Approved Pensioners" },
                    { value: "SELECTED", label: "Selected Pensioners" }
                  ]}
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Select"
                />
              </motion.div>

              <AnimatePresence>
                {audience === "SELECTED" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.25, delay: 0.05 }}
                  >
                    <FormField
                      label="Pensioner IDs (comma separated)"
                      name="pensionerIds"
                      value={pensionerIds}
                      onChange={(e) => setPensionerIds(e.target.value)}
                      icon={<Users size={18} />}
                      placeholder="e.g. id1, id2, id3"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div
                    className="form-error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="form-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  type="submit"
                  className={`btn btn-primary ${submitting ? "btn-loading" : ""}`}
                  disabled={submitting}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="btn-text">{submitting ? "Publishing..." : "Publish Notification"}</span>
                  <span className="btn-spinner">
                    <div style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} />
                  </span>
                </motion.button>
              </motion.div>
            </motion.form>
          </AnimatePresence>
        )}

        {tab === "history" && (
          <AnimatePresence>
            <motion.div
              key="history-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <div className="notification-toolbar">
                <motion.div className="datatable-search" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </motion.div>
                <div className="notification-filters">
                  <motion.button
                    className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setFilter("all")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye size={14} />
                    All
                  </motion.button>
                  <motion.button
                    className={`btn btn-sm ${filter === "unread" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setFilter("unread")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell size={14} />
                    Unread
                  </motion.button>
                  <motion.button
                    className={`btn btn-sm ${filter === "read" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setFilter("read")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CheckCircle size={14} />
                    Read
                  </motion.button>
                </div>
              </div>

              {filtered.length > 0 ? (
                <div className="notification-panel">
                  {filtered.map((n: Notification, i: number) => {
                    const priority = getPriority(n);
                    const unread = unreadCount(n);
                    const total = n.receipts?.length || 0;
                    const isUnread = unread > 0;
                    const priorityLabel =
                      priority === "high" ? "High Priority" :
                      priority === "medium" ? "Medium Priority" : "Low Priority";

                    return (
                      <motion.div
                        key={n.id}
                        className={`notification-card ${isUnread ? "unread" : "read"}`}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
                      >
                        <div className="notification-card-header">
                          <motion.h3 className="notification-card-title" whileHover={{ x: 3 }}>
                            {n.title}
                          </motion.h3>
                          <div className="notification-card-meta">
                            <motion.span
                              className={`notification-badge priority-${priority} notification-badge-priority`}
                              title={priorityLabel}
                              whileHover={{ scale: 1.05 }}
                            >
                              {priorityLabel}
                            </motion.span>
                            <span className="notification-audience-badge">
                              {n.audience === "ALL" ? "All Pensioners" : "Selected"}
                            </span>
                            <span className="notification-badge unread">
                              {unread} unread
                            </span>
                          </div>
                        </div>

                        <div
                          className="notification-card-message"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {n.message}
                        </div>

                        <div className="notification-card-stats">
                          <span className="notification-card-stat">
                            <Bell size={14} />
                            Published: {new Date(n.publishedAt).toLocaleDateString()}
                          </span>
                          <span className="notification-card-stat">
                            <Users size={14} />
                            {total} recipients
                          </span>
                          <span className="notification-card-stat">
                            <CheckCircle size={14} style={{ color: unread > 0 ? "#f59e0b" : "#10b981" }} />
                            {total - unread} read
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <motion.div
                  className="empty-state"
                  style={{ padding: "48px 24px" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Bell size={48} />
                  <h3>No notifications found</h3>
                  <p>
                    {search || filter !== "all"
                      ? "Try adjusting your search or filter"
                      : "Notifications you send will appear here"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
