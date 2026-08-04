const axios = require("axios");
const fs = require("fs");

const BASE = "http://localhost:4000/api/v1";

async function runEdgeCaseTests() {
  const results = [];

  function log(method, desc, resp) {
    const status = resp ? resp.status : 0;
    const ok = status >= 200 && status < 400;
    const color = ok ? "\x1b[32m" : "\x1b[33m";
    const reset = "\x1b[0m";
    console.log(`[${color}${ok ? "PASS" : "FAIL"}${reset}] [${method}] ${desc} - Status: ${status}`);
    if (resp.data) {
      let body = JSON.stringify(resp.data);
      if (body.length > 200) body = body.substring(0, 200) + "...";
      console.log(`  Body: ${body}`);
    }
    console.log("");
    results.push({ method, desc, status, ok });
  }

  async function safeRequest(method, url, token, bodyObj, desc, expectFail = false) {
    try {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      if (bodyObj !== null && bodyObj !== undefined) {
        headers["Content-Type"] = "application/json";
      }
      const resp = await axios({
        method,
        url: `${BASE}${url}`,
        headers,
        data: bodyObj,
        timeout: 10000,
        validateStatus: () => true,
      });
      const ok = expectFail ? (resp.status >= 400) : (resp.status >= 200 && resp.status < 400);
      const color = ok ? "\x1b[32m" : "\x1b[33m";
      const reset = "\x1b[0m";
      console.log(`[${color}${ok ? "PASS" : "FAIL"}${reset}] [${method}] ${desc} - Status: ${resp.status}`);
      if (resp.data) {
        let body = JSON.stringify(resp.data);
        if (body.length > 200) body = body.substring(0, 200) + "...";
        console.log(`  Body: ${body}`);
      }
      console.log("");
      results.push({ method, desc, status: resp.status, ok });
      return resp;
    } catch (err) {
      console.log(`[ERROR] [${method}] ${desc} - ${err.message}`);
      console.log("");
      results.push({ method, desc, status: 0, ok: false });
      return null;
    }
  }

  // Test: Invalid admin login (wrong password)
  await safeRequest("POST", "/auth/admin/login", null, {
    email: "admin@bank.local",
    password: "wrongpassword"
  }, "Admin Login - Wrong Password", true);

  // Test: Invalid admin login (non-existent email)
  await safeRequest("POST", "/auth/admin/login", null, {
    email: "nonexistent@bank.local",
    password: "Admin@123"
  }, "Admin Login - Non-existent Email", true);

  // Test: OTP for non-existent mobile
  await safeRequest("POST", "/auth/pensioner/request-otp", null, {
    mobile: "1234567890"
  }, "OTP Request - Invalid Mobile Format", true);

  // Test: OTP for valid format but non-existent pensioner
  await safeRequest("POST", "/auth/pensioner/request-otp", null, {
    mobile: "9999999998"
  }, "OTP Request - Non-existent Pensioner", true);

  // Test: Verify OTP with wrong OTP
  await safeRequest("POST", "/auth/pensioner/verify-otp", null, {
    mobile: "9999999999",
    otp: "000000"
  }, "OTP Verify - Wrong OTP", true);

  // Test: Access admin endpoint without token
  await safeRequest("GET", "/admin/dashboard", null, null, "Admin Dashboard - No Token", true);

  // Test: Access pensioner endpoint without token
  await safeRequest("GET", "/pensioner/dashboard", null, null, "Pensioner Dashboard - No Token", true);

  // Test: Access admin endpoint with pensioner token
  const otpResp = await axios.post(`${BASE}/auth/pensioner/request-otp`, JSON.parse(fs.readFileSync("otp-request.json", "utf8")));
  const otp = otpResp.data.data.developmentOtp;
  fs.writeFileSync("otp-verify.json", JSON.stringify({ mobile: "9999999999", otp: otp }));
  const otpVerifyResp = await axios.post(`${BASE}/auth/pensioner/verify-otp`, JSON.parse(fs.readFileSync("otp-verify.json", "utf8")));
  const pensionerToken = otpVerifyResp.data.data.accessToken;

  await safeRequest("GET", "/admin/dashboard", pensionerToken, null, "Admin Dashboard - Pensioner Token (should fail)", true);

  // Test: Non-existent pensioner detail
  const adminLoginResp = await axios.post(`${BASE}/auth/admin/login`, JSON.parse(fs.readFileSync("admin-login.json", "utf8")));
  const adminToken = adminLoginResp.data.data.accessToken;

  await safeRequest("GET", "/admin/pensioners/nonexistentid123", adminToken, null, "Get Pensioner - Non-existent ID", true);

  // Test: Non-existent grievance
  await safeRequest("GET", "/admin/grievances/nonexistentid123", adminToken, null, "Get Grievance - Non-existent ID", true);

  // Test: Non-existent notification
  await safeRequest("GET", "/admin/notifications/nonexistentid123", adminToken, null, "Get Notification - Non-existent ID", true);

  // Test: Invalid JSON body
  await safeRequest("POST", "/auth/admin/login", null, "{bad json", "Admin Login - Invalid JSON", true);

  // Test: Missing required fields
  await safeRequest("POST", "/auth/admin/login", null, {
    email: "admin@bank.local"
  }, "Admin Login - Missing Password", true);

  // Test: Invalid email format
  await safeRequest("POST", "/auth/admin/login", null, {
    email: "not-an-email",
    password: "Admin@123"
  }, "Admin Login - Invalid Email", true);

  // Test: Export CSV report
  await safeRequest("GET", "/management/reports/export/csv?type=pensioners", adminToken, null, "Export CSV Report");

  // Test: Export PDF report
  await safeRequest("GET", "/management/reports/export/pdf?type=pensioners", adminToken, null, "Export PDF Report");

  // Test: Pensioner register
  await safeRequest("POST", "/pensioner/register", null, {
    employeeId: "EMP-REG-001",
    name: "Registration Test",
    mobile: "9876500111",
    email: "regtest@example.com",
    aadhaarNumber: "123456789012",
    panNumber: "ABCDE1234F",
    dateOfBirth: "1970-01-01",
    department: "Test Dept",
    designation: "Test Designation"
  }, "Pensioner Registration");

  // Test: Monthly pension slip download
  const mpResp = await axios.get(`${BASE}/management/monthly-pensions?page=1&limit=1`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (mpResp.data.data.items && mpResp.data.data.items.length > 0) {
    const mp = mpResp.data.data.items[0];
    await safeRequest("GET", `/management/monthly-pensions/${mp.id}/slip`, adminToken, null, "Download Monthly Pension Slip");
  }

  // Test: Pensioner latest slip download
  const profileResp = await axios.get(`${BASE}/pensioner/profile`, {
    headers: { Authorization: `Bearer ${pensionerToken}` }
  });
  const pensionerId = profileResp.data.data.id;
  await safeRequest("GET", `/management/pensioners/${pensionerId}/latest-slip`, adminToken, null, "Pensioner Latest Slip Download");

  // Pensioner: Update Profile to revert (clean up)
  await safeRequest("PATCH", "/pensioner/profile", { Authorization: `Bearer ${pensionerToken}` }, {
    address: "123 Main Street, New Delhi, India - 110001"
  }, "Update Profile - Revert (Pensioner)");

  // Pensioner: Create a grievance for cleanup
  const grievanceCreateResp = await axios.post(`${BASE}/pensioner/grievances`, {
    subject: "QA Test Grievance for Cleanup",
    description: "Test description"
  }, {
    headers: { Authorization: `Bearer ${pensionerToken}` }
  });

  if (grievanceCreateResp.data.success) {
    const grievanceId = grievanceCreateResp.data.data.id;
    await safeRequest("GET", `/pensioner/grievances/${grievanceId}`, pensionerToken, null, "Get Pensioner Grievance Detail");

    // Get grievances to find the QA test grievance
    const grievancesList = await axios.get(`${BASE}/admin/grievances?search=QA Test`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    // Test: Reply to grievance
    const qaGrievance = grievancesList.data.data?.find(g => g.subject === "QA Test Pensioner Grievance for Cleanup");
    // Note: the admin grievances query might be paginated differently, let's just use the pensioner grievance
    await safeRequest("PATCH", `/pensioner/grievances/${grievanceId}`, pensionerToken, {
      subject: "Updated Subject",
      description: "Updated description",
      status: "RESOLVED"
    }, "Update Pensioner Grievance", false);
  }

  // Summary
  console.log("\n=== QA Edge Case Test Summary ===");
  const pass = results.filter(r => r.ok).length;
  const fail = results.filter(r => !r.ok).length;
  console.log(`Total: ${results.length}, Passed: ${pass}, Failed: ${fail}`);

  if (fail > 0) {
    console.log("\nFailed tests:");
    results.filter(r => !r.ok).forEach(r => {
      console.log(`  - [${r.method}] ${r.desc} - Status: ${r.status}`);
    });
  }
}

runEdgeCaseTests().catch(console.error);
