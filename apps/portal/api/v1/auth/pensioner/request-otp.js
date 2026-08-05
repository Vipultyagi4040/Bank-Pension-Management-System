// Vercel serverless function for OTP request endpoint
// Generates a time-based OTP that changes with each request
// The OTP is deterministic based on mobile + timestamp, so it can be verified without shared state

const RENDER_API_URL = 'https://bank-pension-management-system-5.onrender.com/api/v1';

function generateOtp(mobile) {
  // Use mobile + current timestamp as seed for deterministic OTP
  const timestamp = Date.now();
  const timeSlice = Math.floor(timestamp / 60000); // Changes every minute

  // Simple hash function
  let hash = 0;
  const seed = mobile + timeSlice.toString();
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) & 0x7fffffff;
  }

  // Generate 6-digit OTP
  const code = String(100000 + (hash % 900000));

  return { code, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { mobile } = req.body || {};

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number' });
    }

    // Generate OTP
    const { code, expiresAt } = generateOtp(mobile);

    // Also call Render API to sync with database (best effort)
    try {
      await fetch(`${RENDER_API_URL}/auth/pensioner/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
    } catch (e) {
      // Ignore - we handle OTP on our side
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent',
      data: {
        expiresAt,
        developmentOtp: code
      }
    });
  } catch (error) {
    console.error('request-otp error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
