import { FormEvent, useState } from "react";
import { api } from "../api";

const example = `employeeId,name,mobile,email,department,designation
EMP002,Ramesh Kumar,9876543210,ramesh@example.com,Operations,Officer`;

export default function ImportPage() {
  const [csv, setCsv] = useState(example);
  const [result, setResult] = useState<any>();
  async function submit(e: FormEvent) {
    e.preventDefault();
    const response = await api.post("/admin/pensioners/import-csv", { csv });
    setResult(response.data.data);
  }
  return     <div className="page">
    <h1>Bulk Data Upload</h1>
    <form className="card" onSubmit={submit}>
      <p>CSV columns: employeeId, name, mobile, email, department, designation</p>
      <textarea rows={12} value={csv} onChange={e => setCsv(e.target.value)} />
      <button style={{marginTop:12}}>Validate & Import</button>
    </form>
    {result && <div className="card" style={{marginTop:16}}>
      <h3>Import Result</h3><p>Imported: {result.imported}</p><p>Failed: {result.failed}</p>
      {result.errors?.map((x:any)=><p className="error" key={x.row}>Row {x.row}: {x.message}</p>)}
    </div>}
    </div>
}
