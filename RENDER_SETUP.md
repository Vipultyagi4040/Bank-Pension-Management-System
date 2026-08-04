# Render Setup

## Step 1: Create Neon PostgreSQL Database

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (it will look like `postgresql://user:password@ep-xxx.region.aws.neon.tech:5432/pension_db`)
4. Ensure `?sslmode=require` is appended to the connection string

## Step 2: Deploy API to Render

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub/GitLab
2. Go to [dashboard.render.com](https://dashboard.render.com)
3. Click **New** > **Blueprint**
4. Connect your repository
5. Render will automatically detect `render.yaml`
6. Configure the environment variables (see below)
7. Click **Apply**

### Option B: Manual Setup

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New** > **Web Service**
3. Connect your repository
4. Configure:
   - **Name**: `bank-pension-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free (or higher for production)
5. Add a PostgreSQL database:
   - Click **New** > **PostgreSQL**
   - Name: `pension_db`
   - Plan: Free
6. Connect the database to your web service

## Step 3: Configure Environment Variables

In Render dashboard, go to your web service > **Environment**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | (from Neon) |
| `JWT_ACCESS_SECRET` | (generate a strong random string) |
| `JWT_ACCESS_EXPIRES_IN` | `1d` |
| `OTP_TTL_MINUTES` | `5` |
| `CORS_ORIGINS` | `https://admin.your-project.vercel.app,https://portal.your-project.vercel.app` |

## Step 4: Run Migrations

Render runs `npx prisma migrate deploy` automatically before each deploy via `preDeployCommand`.

Alternatively, run manually:
```bash
npx prisma migrate deploy
```

## Step 5: Verify Deployment

```bash
curl https://your-api-name.onrender.com/api/v1/health
```

Expected response:
```json
{"success": true, "service": "bank-pension-api"}
```

## Custom Domain (Optional)

1. Go to your web service > **Settings** > **Custom Domains**
2. Add your domain (e.g., `api.your-domain.com`)
3. Update DNS records as instructed by Render
