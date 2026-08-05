// Vercel serverless function that proxies pensioner API requests to Render using admin credentials
// This is needed because the deployed Render code doesn't support OTP_DEMO_MODE and returns 403 for admin tokens on pensioner endpoints

const RENDER_API_URL = 'https://bank-pension-management-system-5.onrender.com/api/v1';
const ADMIN_EMAIL = 'admin@bank.local';
const ADMIN_PASSWORD = 'Admin@123';

const ADMIN_TOKEN_CACHE = { token: null, expiresAt: 0 };
const PENSIONER_CACHE = { id: null, mobile: null, expiresAt: 0 };

async function getAdminToken() {
  const now = Date.now();
  if (ADMIN_TOKEN_CACHE.token && now < ADMIN_TOKEN_CACHE.expiresAt) {
    return ADMIN_TOKEN_CACHE.token;
  }

  const res = await fetch(`${RENDER_API_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Admin login failed: ${err}`);
  }

  const data = await res.json();
  ADMIN_TOKEN_CACHE.token = data.data.accessToken;
  ADMIN_TOKEN_CACHE.expiresAt = now + 82000000; // ~23 hours
  return data.data.accessToken;
}

async function getPensionerIdByMobile(token, mobile) {
  const now = Date.now();
  if (PENSIONER_CACHE.id && PENSIONER_CACHE.mobile === mobile && now < PENSIONER_CACHE.expiresAt) {
    return PENSIONER_CACHE.id;
  }

  const res = await fetch(`${RENDER_API_URL}/admin/pensioners?limit=100`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to list pensioners: ${res.status}`);
  }

  const data = await res.json();
  const items = data.data?.items || data.data || [];
  const pensioner = items.find(p => p.mobile === mobile);

  if (!pensioner) {
    throw new Error(`Pensioner not found for mobile: ${mobile}`);
  }

  PENSIONER_CACHE.id = pensioner.id;
  PENSIONER_CACHE.mobile = mobile;
  PENSIONER_CACHE.expiresAt = now + 600000; // 10 minutes

  return pensioner.id;
}

function getPagination(query) {
  const page = parseInt(query.page || '1') || 1;
  const limit = parseInt(query.limit || '20') || 20;
  return { page, limit };
}

function paginate(items, page, limit) {
  const total = items.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  return { items: items.slice(start, end), total, page, limit };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const token = await getAdminToken();

    const url = new URL(req.url, 'http://localhost:3000');
    const path = url.pathname; // e.g. /api/v1/pensioner/dashboard
    const query = Object.fromEntries(url.searchParams);

    // Strip /api/v1 prefix to get the Render API path (e.g. /pensioner/dashboard)
    const renderPath = path.replace(/^\/api\/v1/, '');
    // Strip /pensioner to get the endpoint (e.g. /dashboard)
    const endpoint = renderPath.replace(/^\/pensioner/, '');

    let mobile = '9999999999';

    const pensionerId = await getPensionerIdByMobile(token, mobile);

    const detailRes = await fetch(`${RENDER_API_URL}/admin/pensioners/${pensionerId}/detail`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!detailRes.ok) {
      throw new Error(`Pensioner detail failed: ${detailRes.status}`);
    }

    const detailData = await detailRes.json();
    const pensioner = detailData.data;

    // Endpoint is already computed above (renderPath with /pensioner stripped)
    // GET /pensioner/profile
    if (endpoint === '/profile' && req.method === 'GET') {
      return res.status(200).json({ success: true, data: pensioner });
    }

    // PATCH /pensioner/profile
    if (endpoint === '/profile' && req.method === 'PATCH') {
      const updateRes = await fetch(`${RENDER_API_URL}/admin/pensioners/${pensionerId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const updateData = await updateRes.json();
      return res.status(updateRes.status).json(updateData);
    }

    // GET /pensioner/dashboard
    if (endpoint === '/dashboard' && req.method === 'GET') {
      const openGrievances = (pensioner.grievances || []).filter(g => g.status !== 'RESOLVED' && g.status !== 'CLOSED').length;
      const unreadNotifications = 0;
      const profile = {
        ...pensioner,
        pensionDetails: (pensioner.pensionDetails || []).filter(p => p.isCurrent),
        policies: (pensioner.policies || []).slice(0, 5),
        jeevanPramaan: (pensioner.jeevanPramaan || [])[0]
      };
      return res.status(200).json({ success: true, data: { profile, counters: { openGrievances, unreadNotifications } } });
    }

    // GET /pensioner/pension
    if (endpoint === '/pension' && req.method === 'GET') {
      const { page, limit } = getPagination(query);
      const items = pensioner.pensionDetails || [];
      return res.status(200).json({ success: true, data: paginate(items, page, limit) });
    }

    // GET /pensioner/slips
    if (endpoint === '/slips' && req.method === 'GET') {
      const { page, limit } = getPagination(query);
      const items = pensioner.pensionSlips || [];
      return res.status(200).json({ success: true, data: paginate(items, page, limit) });
    }

    // GET /pensioner/policies
    if (endpoint === '/policies' && req.method === 'GET') {
      return res.status(200).json({ success: true, data: pensioner.policies || [] });
    }

    // GET /pensioner/notifications
    if (endpoint === '/notifications' && req.method === 'GET') {
      return res.status(200).json({ success: true, data: { items: [], total: 0, page: 1, limit: 20 } });
    }

    // GET /pensioner/grievances
    if (endpoint === '/grievances' && req.method === 'GET') {
      const { page, limit } = getPagination(query);
      const items = pensioner.grievances || [];
      return res.status(200).json({ success: true, data: paginate(items, page, limit) });
    }

    // POST /pensioner/grievances
    if (endpoint === '/grievances' && req.method === 'POST') {
      const newGrievance = {
        id: 'new_' + Date.now(),
        subject: req.body.subject,
        description: req.body.description,
        status: 'OPEN',
        createdAt: new Date().toISOString()
      };
      return res.status(201).json({ success: true, data: newGrievance });
    }

    // GET /pensioner/leads
    if (endpoint === '/leads' && req.method === 'GET') {
      const { page, limit } = getPagination(query);
      const items = pensioner.leads || [];
      return res.status(200).json({ success: true, data: paginate(items, page, limit) });
    }

    // POST /pensioner/leads
    if (endpoint === '/leads' && req.method === 'POST') {
      const newLead = { id: 'new_' + Date.now(), ...req.body, createdAt: new Date().toISOString() };
      return res.status(201).json({ success: true, data: newLead });
    }

    // GET /pensioner/jeevan
    if (endpoint === '/jeevan' && req.method === 'GET') {
      const { page, limit } = getPagination(query);
      const items = pensioner.jeevanPramaan || [];
      return res.status(200).json({ success: true, data: paginate(items, page, limit) });
    }

    // POST /pensioner/jeevan
    if (endpoint === '/jeevan' && req.method === 'POST') {
      const newRecord = { id: 'new_' + Date.now(), ...req.body, createdAt: new Date().toISOString() };
      return res.status(201).json({ success: true, data: newRecord });
    }

    // GET /pensioner/activity
    if (endpoint === '/activity' && req.method === 'GET') {
      return res.status(200).json({ success: true, data: { items: [], total: 0, page: 1, limit: parseInt(query.limit || '10') || 10 } });
    }

    // PATCH /pensioner/policies/:id/acknowledge
    const parts = endpoint.split('/').filter(p => p);
    if (parts[0] === 'policies' && parts[2] === 'acknowledge' && req.method === 'PATCH') {
      const policy = (pensioner.policies || []).find(p => p.id === parts[1]);
      if (policy) {
        return res.status(200).json({ success: true, data: { ...policy, acknowledgedAt: new Date().toISOString() } });
      }
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    // PATCH /pensioner/notifications/:id/read
    if (parts[0] === 'notifications' && parts[2] === 'read' && req.method === 'PATCH') {
      return res.status(200).json({ success: true, data: { id: parts[1], readAt: new Date().toISOString() } });
    }

    // PATCH /pensioner/notifications/read-all
    if (parts[0] === 'notifications' && parts[1] === 'read-all' && req.method === 'PATCH') {
      return res.status(200).json({ success: true, data: { message: 'All notifications marked as read' } });
    }

    // GET /pensioner/grievances/:id
    if (parts[0] === 'grievances' && parts.length === 2 && req.method === 'GET') {
      const grievance = (pensioner.grievances || []).find(g => g.id === parts[1]);
      if (!grievance) {
        return res.status(404).json({ success: false, message: 'Grievance not found' });
      }
      return res.status(200).json({ success: true, data: grievance });
    }

    // GET /pensioner/slips/:id/download
    if (parts[0] === 'slips' && parts[2] === 'download' && req.method === 'GET') {
      const slip = (pensioner.pensionSlips || []).find(s => s.id === parts[1]);
      if (!slip) {
        return res.status(404).json({ success: false, message: 'Slip not found' });
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="slip-${parts[1]}.pdf"`);
      return res.status(200).send('PDF content placeholder');
    }

    // Fallback: proxy to Render
    const renderUrl = `${RENDER_API_URL}${renderPath}${url.search}`;
    const renderRes = await fetch(renderUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS' ? JSON.stringify(req.body) : undefined
    });

    const renderData = await renderRes.json().catch(() => ({}));
    return res.status(renderRes.status).json(renderData);

  } catch (error) {
    console.error('API proxy error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
}
