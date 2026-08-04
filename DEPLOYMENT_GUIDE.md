# Deployment Guide

## Overview

This project is a monorepo with three deployable components:

| Component | Type | Platform | Directory |
|-----------|------|----------|-----------|
| API | Node.js + Express | Render | `apps/api` |
| Admin | Vite + React | Vercel | `apps/admin` |
| Portal | Vite + React | Vercel | `apps/portal` |

Database: Neon PostgreSQL

---

## Prerequisites

- Node.js >= 20
- npm >= 10
- Neon PostgreSQL database
- Vercel account
- Render account

---

## Build Commands

```bash
# Install dependencies
npm install

# Build all apps
npm run build

# Or build individually
npm --workspace apps/api run build
npm --workspace apps/admin run build
npm --workspace apps/portal run build
```

---

## Start Commands

```bash
# API (development)
npm --workspace apps/api run dev

# API (production)
npm --workspace apps/api run start:prod
```

---

## Deployment Order

1. **Database** - Create Neon PostgreSQL instance
2. **API** - Deploy to Render (see `RENDER_SETUP.md`)
3. **Admin** - Deploy to Vercel (see `VERCEL_SETUP.md`)
4. **Portal** - Deploy to Vercel (see `VERCEL_SETUP.md`)

---

## Environment Variables

See `ENVIRONMENT_VARIABLES.md` for the complete list.

---

## Migration Commands

```bash
# Development
npm --workspace apps/api run prisma:migrate

# Production (Render)
npx prisma migrate deploy

# Generate Prisma client
npm --workspace apps/api run prisma:generate
```

---

## Production URLs

After deployment, update the following with your actual URLs:

- `apps/api/.env.production` - `DATABASE_URL`, `JWT_ACCESS_SECRET`, `CORS_ORIGINS`
- `apps/admin/.env.production` - `VITE_API_URL`
- `apps/portal/.env.production` - `VITE_API_URL`

---

## CORS Configuration

The API uses `CORS_ORIGINS` environment variable (comma-separated). Ensure it includes your Vercel deployment URLs:

```
https://admin.your-project.vercel.app,https://portal.your-project.vercel.app
```

---

## Security Checklist

- [ ] Change `JWT_ACCESS_SECRET` to a strong random value (minimum 32 characters)
- [ ] Use Neon PostgreSQL with SSL (`sslmode=require`)
- [ ] Set `NODE_ENV=production` on all services
- [ ] Configure CORS to only allow trusted origins
- [ ] Enable HTTPS on all deployments (Vercel and Render handle this automatically)
- [ ] Review and remove any `.env` files from version control

---

## Post-Deployment Verification

```bash
# Health check
curl https://api.your-domain.com/api/v1/health

# Expected response
{"success":true,"service":"bank-pension-api"}
```
