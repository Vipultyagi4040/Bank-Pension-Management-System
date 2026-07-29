import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

type Notification = {
  id: string;
  title: string;
  message: string;
  audience: string;
  publishedAt: string;
  createdById: string;
  receipts: { pensioner: { employeeId: string; name: string; mobile: string }; readAt: string }[];
};

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [pensionerIds, setPensionerIds] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"create" | "history">("create");
  const [submitting, setSubmitting] = useState(false);
  const client = useQueryClient();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setResult("");
    setSubmitting(true);
    try {
      const ids = audience === "SELECTED" ? pensionerIds.split(",").map(s => s.trim()).filter(Boolean) : [];
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
      setResult("Notification published.");
      client.invalidateQueries({ queryKey: ["notifications"] });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to publish notification");
    } finally {
      setSubmitting(false);
    }
  }

  const historyQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/admin/notifications")).data.data
  });

  if (historyQuery.isLoading) return <p>Loading...</p>;
  if (historyQuery.error) return <p className="error">Failed to load notifications</p>;

  return (
    <div className="page">
      <h1>Notifications</h1>
      <div className="toolbar">
        <button className={tab === "create" ? "" : "secondary"} onClick={() => setTab("create")}>Create</button>
        <button className={tab === "history" ? "" : "secondary"} onClick={() => setTab("history")}>History</button>
      </div>

      {tab === "create" && (
        <form className="card" onSubmit={submit}>
          <div className="form-group">
            <label>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea rows={6} value={message} onChange={e => setMessage(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Audience</label>
            <select value={audience} onChange={e => setAudience(e.target.value)}>
              <option value="ALL">All Approved Pensioners</option>
              <option value="SELECTED">Selected Pensioners</option>
            </select>
          </div>
          {audience === "SELECTED" && (
            <div className="form-group">
              <label>Pensioner IDs (comma separated)</label>
              <input value={pensionerIds} onChange={e => setPensionerIds(e.target.value)} placeholder="id1, id2, id3" />
            </div>
          )}
          <button type="submit" disabled={submitting}>{submitting ? "Publishing..." : "Publish Notification"}</button>
          {result && <p>{result}</p>}
          {error && <p className="error">{error}</p>}
        </form>
      )}

      {tab === "history" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Audience</th>
                <th>Published</th>
                <th>Recipients</th>
              </tr>
            </thead>
            <tbody>
              {historyQuery.data?.items?.map((item: Notification) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.audience}</td>
                  <td>{new Date(item.publishedAt).toLocaleString()}</td>
                  <td>{item.receipts?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
