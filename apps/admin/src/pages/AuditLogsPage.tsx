import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export default function AuditLogsPage() {
  const query = useQuery({
    queryKey: ["auditLogs"],
    queryFn: async () => (await api.get("/admin/audit-logs")).data.data
  });

  return (
    <div className="page">
      <h1>Audit Logs</h1>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.items?.map((item: any) => (
              <tr key={item.id}>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td>{item.admin?.name || "-"}</td>
                <td>{item.action}</td>
                <td>{item.entityType || "-"}</td>
                <td>{item.entityId || "-"}</td>
                <td>{item.ipAddress || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
