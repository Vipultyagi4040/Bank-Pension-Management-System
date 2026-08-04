# Vercel Setup

## Prerequisites

- Vercel account
- Code pushed to GitHub/GitLab
- API deployed and accessible (see `RENDER_SETUP.md`)

---

## Admin Portal

### Step 1: Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** next to your repository
3. Select the **Admin** project to import

### Step 2: Configure Project

Vercel auto-detects Vite. Verify these settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Step 3: Set Environment Variables

In project settings > **Environment Variables**:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_API_URL` | `https://api.your-domain.com/api/v1` | Production |

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Note your deployment URL (e.g., `https://admin-project.vercel.app`)

---

## Portal

### Step 1: Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** next to your repository
3. Select the **Portal** project to import

### Step 2: Configure Project

Vercel auto-detects Vite. Verify these settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Step 3: Set Environment Variables

In project settings > **Environment Variables**:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_API_URL` | `https://api.your-domain.com/api/v1` | Production |

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Note your deployment URL (e.g., `https://portal-project.vercel.app`)

---

## Post-Deployment

### Update CORS on API

After both frontends are deployed, update the API's `CORS_ORIGINS`:

```
https://admin-project.vercel.app,https://portal-project.vercel.app
```

### Update Frontend Environment Variables

If your API URL changed, update `VITE_API_URL` in both Vercel projects and trigger a redeploy.

---

## Custom Domains (Optional)

1. Go to project > **Settings** > **Domains**
2. Add your custom domain
3. Update DNS records as instructed by Vercel
