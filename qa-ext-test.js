const axios = require("axios");
const fs = require("fs");
const BASE = "http://localhost:4000/api/v1";

async function runExtendedTests() {
  const login = JSON.parse(fs.readFileSync("admin-login.json", "utf8"));
  const adminLogin = await axios.post(BASE + "/auth/admin/login", login, {
    headers: { "Content-Type": "application/json" }
  });
  const adminToken = adminLogin.data.data.accessToken;
  const h = { Authorization: "Bearer " + adminToken };

  // Test pensioner detail (extended)
  const pensioners = await axios.get(BASE + "/admin/pensioners", {
    params: { page: 1, limit: 1 },
    headers: h
  });
  const pid = pensioners.data.data.items[0].id;
  console.log("Testing pensioner detail...");
  const detail = await axios.get(BASE + "/admin/pensioners/" + pid + "/detail", { headers: h });
  console.log("  Status:", detail.status);
  console.log("  Data keys:", Object.keys(detail.data.data));
  console.log("  Pension details:", detail.data.data.pensionDetails?.length || 0);
  console.log("  Policies:", detail.data.data.policies?.length || 0);

  // Test extended update
  console.log("Testing extended update...");
  const extUpdate = await axios.patch(
    BASE + "/admin/pensioners/" + pid + "/extended",
    { address: "Test extended update" },
    { headers: h }
  );
  console.log("  Status:", extUpdate.status);

  // Test notification by ID
  const notifs = await axios.get(BASE + "/admin/notifications", {
    params: { page: 1, limit: 1 },
    headers: h
  });
  const nid = notifs.data.data.items[0].id;
  console.log("Testing notification detail...");
  const notif = await axios.get(BASE + "/admin/notifications/" + nid, { headers: h });
  console.log("  Status:", notif.status);

  // Test pagination
  console.log("Testing grievances pagination...");
  const g1 = await axios.get(BASE + "/admin/grievances", {
    params: { page: 1, limit: 5 },
    headers: h
  });
  console.log("  Page 1: total=" + g1.data.data.total + ", items=" + g1.data.data.items.length);
  const g2 = await axios.get(BASE + "/admin/grievances", {
    params: { page: 2, limit: 5 },
    headers: h
  });
  console.log("  Page 2: total=" + g2.data.data.total + ", items=" + g2.data.data.items.length);
  console.log("  Has pagination info:", g1.data.data.page, g1.data.data.limit);

  // Test pension slip download
  console.log("Testing monthly pension slip download...");
  const mps = await axios.get(BASE + "/management/monthly-pensions", {
    params: { page: 1, limit: 1 },
    headers: h
  });
  const mpid = mps.data.data.items[0].id;
  const slip = await axios.get(BASE + "/management/monthly-pensions/" + mpid + "/slip", {
    headers: h,
    responseType: "arraybuffer"
  });
  console.log("  Status:", slip.status, "Content-Type:", slip.headers["content-type"]);

  // Test latest slip download
  console.log("Testing latest slip download...");
  const profileResp = await axios.get(BASE + "/pensioner/profile", {
    headers: { Authorization: "Bearer " + adminToken }
  });

  // Get pensioner ID
  const pensionerId = pensioners.data.data.items[0].id;
  const latest = await axios.get(
    BASE + "/management/pensioners/" + pensionerId + "/latest-slip",
    { headers: h, responseType: "arraybuffer" }
  );
  console.log("  Status:", latest.status);

  console.log("\nAll extended tests completed!");
}

runExtendedTests().catch(console.error);
