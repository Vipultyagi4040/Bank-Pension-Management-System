const axios = require("axios");
const fs = require("fs");

const BASE = "http://localhost:4000/api/v1";

async function runTests() {
  const results = [];

  function log(method, desc, resp) {
    const status = resp ? resp.status : 0;
    const ok = status >= 200 && status < 300;
    const color = ok ? "\x1b[32m" : "\x1b[33m";
    const reset = "\x1b[0m";
    console.log(`[${color}${ok ? "PASS" : "FAIL"}${reset}] [${method}] ${desc} - Status: ${status}`);
    if (!ok || status === 200) {
      let body = JSON.stringify(resp.data);
      if (body.length > 300) body = body.substring(0, 300) + "...";
      console.log(`  Body: ${body}`);
    }
    console.log("");
    results.push({ method, desc, status, ok });
  }

  async function safeRequest(method, url, token, bodyFile, desc) {
    try {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      if (bodyFile) headers["Content-Type"] = "application/json";
      const body = bodyFile ? fs.readFileSync(bodyFile, "utf8") : undefined;
      const resp = await axios({
        method,
        url: `${BASE}${url}`,
        headers,
        data: body ? JSON.parse(body) : undefined,
        timeout: 10000,
      });
      log(method, desc, resp);
      return resp;
    } catch (err) {
      const status = err.response ? err.response.status : 0;
      log(method, desc, { status, data: err.response ? err.response.data : { error: err.message } });
      return null;
    }
  }

  // Health check
  await safeRequest("GET", "/health", null, null, "Health Check");

  // Admin login
  const adminLogin = await safeRequest("POST", "/auth/admin/login", null, "admin-login.json", "Admin Login");
  const adminToken = adminLogin && adminLogin.data.success ? adminLogin.data.data.accessToken : null;

  if (adminToken) {
    // Admin Dashboard
    await safeRequest("GET", "/admin/dashboard", adminToken, null, "Admin Dashboard");

    // Pensioners list
    await safeRequest("GET", "/admin/pensioners?search=&page=1&limit=20", adminToken, null, "List Pensioners");

    // Pension Details
    await safeRequest("GET", "/management/pension-details?search=&page=1&limit=20", adminToken, null, "List Pension Details");

    // Monthly Pensions
    await safeRequest("GET", "/management/monthly-pensions?page=1&limit=20", adminToken, null, "List Monthly Pensions");

    // Grievances
    await safeRequest("GET", "/admin/grievances?search=&page=1&limit=20", adminToken, null, "List Grievances");

    // Notifications
    await safeRequest("GET", "/admin/notifications?search=&page=1&limit=20", adminToken, null, "List Notifications");

    // Policies
    await safeRequest("GET", "/management/policies?search=&page=1&limit=20", adminToken, null, "List Policies");

    // Jeevan Pramaan
    await safeRequest("GET", "/management/jeevan-pramaan?page=1&limit=20", adminToken, null, "List Jeevan Pramaan");

    // Audit Logs
    await safeRequest("GET", "/admin/audit-logs?search=&page=1&limit=20", adminToken, null, "List Audit Logs");

    // Management Dashboard Stats
    await safeRequest("GET", "/management/dashboard/stats", adminToken, null, "Management Dashboard Stats");

    // Reports Summary
    await safeRequest("GET", "/management/reports/summary", adminToken, null, "Reports Summary");

    // Processing History
    await safeRequest("GET", "/management/processing-history?page=1&limit=20", adminToken, null, "Processing History");

    // Import CSV
    await safeRequest("POST", "/admin/pensioners/import-csv", adminToken, "import-test.json", "Import CSV");

    // Reports Departments
    await safeRequest("GET", "/management/reports/departments", adminToken, null, "Reports - Department");

    // Search
    await safeRequest("GET", "/admin/search?q=test", adminToken, null, "Global Search");
  }

  // Pensioner OTP Request
  await safeRequest("POST", "/auth/pensioner/request-otp", null, "otp-request.json", "Request OTP (Pensioner)");

  // Pensioner OTP Verify
  const otpVerify = await safeRequest("POST", "/auth/pensioner/verify-otp", null, "otp-verify.json", "Verify OTP (Pensioner)");
  const pensionerToken = otpVerify && otpVerify.data.success ? otpVerify.data.data.accessToken : null;

  if (pensionerToken) {
    // Pensioner Dashboard
    await safeRequest("GET", "/pensioner/dashboard", pensionerToken, null, "Pensioner Dashboard");

    // Pensioner Profile
    await safeRequest("GET", "/pensioner/profile", pensionerToken, null, "Pensioner Profile");

    // Pension History
    await safeRequest("GET", "/pensioner/pension", pensionerToken, null, "Pension History");

    // Pension Slips
    await safeRequest("GET", "/pensioner/slips", pensionerToken, null, "Pension Slips");

    // My Policies
    await safeRequest("GET", "/pensioner/policies", pensionerToken, null, "My Policies");

    // My Notifications
    await safeRequest("GET", "/pensioner/notifications?search=&page=1&limit=20", pensionerToken, null, "My Notifications");

    // My Grievances
    await safeRequest("GET", "/pensioner/grievances", pensionerToken, null, "My Grievances");

    // My Leads
    await safeRequest("GET", "/pensioner/leads", pensionerToken, null, "My Leads");

    // My Jeevan Pramaan
    await safeRequest("GET", "/pensioner/jeevan", pensionerToken, null, "My Jeevan Pramaan");

    // My Activity
    await safeRequest("GET", "/pensioner/activity?search=&page=1&limit=20", pensionerToken, null, "My Activity");
  }

  // Summary
  console.log("\n=== QA Summary ===");
  const pass = results.filter(r => r.ok).length;
  const fail = results.filter(r => !r.ok).length;
  console.log(`Total: ${results.length}, Passed: ${pass}, Failed: ${fail}`);
}

runTests().catch(console.error);
