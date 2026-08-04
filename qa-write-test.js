const axios = require("axios");
const fs = require("fs");

const BASE = "http://localhost:4000/api/v1";

async function runWriteTests() {
  const results = [];

  function log(method, desc, resp) {
    const status = resp ? resp.status : 0;
    const ok = status >= 200 && status < 300;
    const color = ok ? "\x1b[32m" : "\x1b[33m";
    const reset = "\x1b[0m";
    console.log(`[${color}${ok ? "PASS" : "FAIL"}${reset}] [${method}] ${desc} - Status: ${status}`);
    if (!ok) {
      let body = JSON.stringify(resp.data);
      if (body.length > 300) body = body.substring(0, 300) + "...";
      console.log(`  Body: ${body}`);
    }
    console.log("");
    results.push({ method, desc, status, ok });
  }

  async function safeRequest(method, url, token, bodyObj, desc) {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (bodyObj) headers["Content-Type"] = "application/json";
      const resp = await axios({
        method,
        url: `${BASE}${url}`,
        headers,
        data: bodyObj,
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

  // Admin Login
  const loginResp = await axios.post(`${BASE}/auth/admin/login`, JSON.parse(fs.readFileSync("admin-login.json", "utf8")));
  const adminToken = loginResp.data.data.accessToken;
  console.log("[INFO] Admin token obtained");

  // Get first pensioner ID
  const pensionersResp = await axios.get(`${BASE}/admin/pensioners?search=&page=1&limit=1`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const pensioner = pensionersResp.data.data.items[0];
  const pensionerId = pensioner.id;
  console.log(`[INFO] Using pensioner: ${pensioner.name} (${pensionerId})`);

  // Get the grievance ID (skip create since admin can't create grievances - use existing test grievance)
  const grievancesResp = await axios.get(`${BASE}/admin/grievances?search=QA`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const testGrievance = grievancesResp.data.data.items?.find(g => g.subject.includes("QA"));
  if (testGrievance) {
    // Test: Reply to Grievance
    await safeRequest("PATCH", `/admin/grievances/${testGrievance.id}/reply`, adminToken, {
      adminReply: "QA Test Reply"
    }, "Reply to Grievance");

    // Test: Update Grievance Status
    await safeRequest("PATCH", `/admin/grievances/${testGrievance.id}`, adminToken, {
      status: "IN_PROGRESS"
    }, "Update Grievance Status");

    // Test: Add Attachment
    await safeRequest("POST", `/admin/grievances/${testGrievance.id}/attachments`, adminToken, {
      filename: "test.pdf",
      url: "https://example.com/test.pdf"
    }, "Add Grievance Attachment");

    // Cleanup: Delete the test grievance
    await safeRequest("DELETE", `/admin/grievances/${testGrievance.id}`, adminToken, null, "Delete Grievance");
  } else {
    console.log("[WARN] Could not find test grievance for update tests");
  }

  // Test: Create Notification
  await safeRequest("POST", "/admin/notifications", adminToken, {
    title: "QA Test Notification",
    message: "This is a test notification from QA",
    audience: "ALL"
  }, "Create Notification");

  // Get the notification ID
  const notificationsResp = await axios.get(`${BASE}/admin/notifications?search=QA Test`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const testNotification = notificationsResp.data.data.items?.find(n => n.title === "QA Test Notification");
  if (testNotification) {
    // Cleanup: Delete notification (if supported)
    console.log(`[INFO] Created notification: ${testNotification.id}`);
  }

  // Test: Create Policy
  await safeRequest("POST", "/management/policies", adminToken, {
    policyNumber: "POL-QA-001",
    title: "QA Test Policy",
    coverageDetails: "Test coverage details",
    claimGuidelines: "Test claim guidelines",
    validFrom: "2026-01-01T00:00:00.000Z",
    validTo: "2026-12-31T00:00:00.000Z",
    consentRequired: true,
    isPublished: true
  }, "Create Policy");

  // Get the policy ID
  const policiesResp = await axios.get(`${BASE}/management/policies?search=QA Test`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const testPolicy = policiesResp.data.data.find(p => p.title === "QA Test Policy");
  if (testPolicy) {
    // Test: Update Policy
    await safeRequest("PATCH", `/management/policies/${testPolicy.id}`, adminToken, {
      title: "QA Test Policy Updated"
    }, "Update Policy");

    // Cleanup: Delete Policy
    await safeRequest("DELETE", `/management/policies/${testPolicy.id}`, adminToken, null, "Delete Policy");
  }

  // Test: Create Jeevan Pramaan Record
  await safeRequest("POST", "/management/jeevan-pramaan", adminToken, {
    pensionerId: pensionerId,
    applicationNumber: "JEE-QA-001",
    submissionDate: "2026-07-01T00:00:00.000Z",
    status: "SUBMITTED"
  }, "Create Jeevan Pramaan");

  // Get the JP record ID
  const jeevanResp = await axios.get(`${BASE}/management/jeevan-pramaan?search=JEE-QA`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const testJeevan = jeevanResp.data.data.find(j => j.applicationNumber === "JEE-QA-001");
  if (testJeevan) {
    // Test: Update JP Record
    await safeRequest("PATCH", `/management/jeevan-pramaan/${testJeevan.id}`, adminToken, {
      status: "VERIFIED",
      remarks: "QA verified"
    }, "Update Jeevan Pramaan");

    // Cleanup: Delete JP Record
    await safeRequest("DELETE", `/management/jeevan-pramaan/${testJeevan.id}`, adminToken, null, "Delete Jeevan Pramaan");
  }

  // Test: Process Monthly Pension
  await safeRequest("POST", "/management/process-monthly", adminToken, {
    month: 7,
    year: 2026
  }, "Process Monthly Pension");

  // Test: Mark Monthly Pension as Paid
  const monthlyResp = await axios.get(`${BASE}/management/monthly-pensions?page=1&limit=20`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (monthlyResp.data.data.items.length > 0) {
    const mp = monthlyResp.data.data.items[0];
    await safeRequest("PATCH", `/management/monthly-pensions/${mp.id}/paid`, adminToken, null, "Mark Monthly Pension as Paid");
  }

  // Test: Create Pension Detail
  await safeRequest("POST", "/management/pension-details", adminToken, {
    pensionerId: pensionerId,
    ppoNumber: "PPO-QA-001",
    category: "Superannuation",
    pensionType: "Superannuation",
    basicPension: 15000,
    da: 4500,
    hra: 1500,
    medicalAllowance: 500,
    otherAllowances: 1000,
    deductions: 500,
    totalPension: 20500,
    pensionAmount: 20000,
    effectiveFrom: "2026-01-01T00:00:00.000Z",
    bankName: "Test Bank",
    branchName: "Test Branch",
    accountLastFour: "1234",
    status: "ACTIVE"
  }, "Create Pension Detail");

  // Pensioner Portal Write Tests
  const otpResp = await axios.post(`${BASE}/auth/pensioner/request-otp`, JSON.parse(fs.readFileSync("otp-request.json", "utf8")));
  const otp = otpResp.data.data.developmentOtp;
  fs.writeFileSync("otp-verify.json", JSON.stringify({ mobile: "9999999999", otp: otp }));

  const otpVerifyResp = await axios.post(`${BASE}/auth/pensioner/verify-otp`, JSON.parse(fs.readFileSync("otp-verify.json", "utf8")));
  const pensionerToken = otpVerifyResp.data.data.accessToken;
  console.log("[INFO] Pensioner token obtained");

  // Test: Create Grievance (Pensioner)
  await safeRequest("POST", "/pensioner/grievances", pensionerToken, {
    subject: "QA Test Pensioner Grievance",
    description: "This is a test grievance from pensioner portal"
  }, "Create Grievance (Pensioner)");

  // Test: Create Jeevan Pramaan (Pensioner)
  await safeRequest("POST", "/pensioner/jeevan", pensionerToken, {
    applicationNumber: "JEE-PEN-QA-001",
    status: "SUBMITTED",
    submissionDate: "2026-07-01T00:00:00.000Z"
  }, "Create Jeevan Pramaan (Pensioner)");

  // Test: Update Profile (Pensioner)
  await safeRequest("PATCH", "/pensioner/profile", pensionerToken, {
    address: "Updated address from QA test"
  }, "Update Profile (Pensioner)");

  // Test: Create Lead (Pensioner)
  await safeRequest("POST", "/pensioner/leads", pensionerToken, {
    name: "QA Lead Test",
    mobile: "9876500999",
    product: "Health Insurance",
    remarks: "Interested in family floater"
  }, "Create Lead (Pensioner)");

  // Test: Mark Notification as Read (Pensioner)
  const notifResp = await axios.get(`${BASE}/pensioner/notifications?limit=5`, {
    headers: { Authorization: `Bearer ${pensionerToken}` }
  });
  if (notifResp.data.data.items && notifResp.data.data.items.length > 0) {
    const unread = notifResp.data.data.items.find(n => !n.readAt);
    if (unread) {
      await safeRequest("PATCH", `/pensioner/notifications/${unread.id}/read`, pensionerToken, null, "Mark Notification Read (Pensioner)");
    }
  }

  // Test: Mark All Notifications Read (Pensioner)
  await safeRequest("PATCH", "/pensioner/notifications/read-all", pensionerToken, null, "Mark All Notifications Read (Pensioner)");

  // Test: Acknowledge Policy (Pensioner)
  const policiesResp2 = await axios.get(`${BASE}/pensioner/policies`, {
    headers: { Authorization: `Bearer ${pensionerToken}` }
  });
  if (policiesResp2.data.data && policiesResp2.data.data.length > 0) {
    const policy = policiesResp2.data.data[0];
    if (!policy.acknowledgedAt) {
      await safeRequest("PATCH", `/pensioner/policies/${policy.id}/acknowledge`, pensionerToken, null, "Acknowledge Policy (Pensioner)");
    }
  }

  // Summary
  console.log("\n=== QA Write Test Summary ===");
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

runWriteTests().catch(console.error);
