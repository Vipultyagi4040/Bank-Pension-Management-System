const axios = require("axios");

const BASE = "http://localhost:4000/api/v1";

axios.get(BASE + "/health", {
  validateStatus: () => true,
  headers: { "User-Agent": "SecurityTest/1.0" }
}).then(resp => {
  console.log("=== Security Headers ===");
  console.log("X-Content-Type-Options:", resp.headers["x-content-type-options"] || "MISSING");
  console.log("X-Frame-Options:", resp.headers["x-frame-options"] || "MISSING");
  console.log("X-XSS-Protection:", resp.headers["x-xss-protection"] || "MISSING (helmet v8+ removes this)");
  console.log("Content-Security-Policy:", resp.headers["content-security-policy"] ? "SET" : "MISSING");
  console.log("Strict-Transport-Security:", resp.headers["strict-transport-security"] || "MISSING (expected in production)");
  console.log("Cross-Origin-Opener-Policy:", resp.headers["cross-origin-opener-policy"] || "MISSING");
  console.log("Cross-Origin-Resource-Policy:", resp.headers["cross-origin-resource-policy"] || "MISSING");
  console.log("Referrer-Policy:", resp.headers["referrer-policy"] || "MISSING");
  console.log("");
  console.log("=== Rate Limiting Test (Auth endpoints) ===");
  
  // Test rate limiting by sending many requests quickly
  const requests = [];
  for (let i = 0; i < 60; i++) {
    requests.push(
      axios.post(BASE + "/auth/admin/login", { email: "admin@bank.local", password: "Admin@123" },
        { validateStatus: () => true, headers: { "Content-Type": "application/json" } })
        .catch(e => ({ status: 0 }))
    );
  }
  
  Promise.all(requests).then(results => {
    const statuses = results.map(r => r.status);
    const okCount = statuses.filter(s => s === 200).length;
    const limitCount = statuses.filter(s => s === 429).length;
    console.log("Total requests:", results.length);
    console.log("Status 200 (passed):", okCount);
    console.log("Status 429 (rate limited):", limitCount);
    console.log("Other:", statuses.filter(s => s !== 200 && s !== 429).length);
    if (limitCount > 0) {
      console.log("Rate limiting is working! (Some requests were blocked)");
    } else {
      console.log("Rate limiting may not be triggering (limit may be too high for test)");
    }
  });
}).catch(err => {
  console.error("Error:", err.message);
});
