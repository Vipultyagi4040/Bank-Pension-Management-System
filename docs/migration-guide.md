# Migration Guide

## From Legacy Bank Record System to New Platform

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for rate limiting)

### Step 1: Database Migration

```sql
-- 1. Create new database
CREATE DATENSION pension_db;

-- 2. Run Prisma migrations
cd apps/api
npx prisma generate
npx prisma migrate dev

-- 3. Seed initial data
npm run seed
```

### Step 2: Data Migration

Use the provided migration script to import existing pensioner records:

```bash
cd apps/api
npx ts-node scripts/migrate-legacy.ts \
  --source legacy-db-connection-string \
  --target postgresql://postgres:Admin%40123@localhost:5432/pension_db
```

The script handles:
- Pensioner master data
- Pension calculation history
- Document metadata (paths remain on existing storage)
- User credentials mapping

### Step 3: Configuration

Update environment variables in each app:

```env
# apps/api/.env
DATABASE_URL=postgresql://postgres:Admin%40123@localhost:5432/pension_db?schema=public
JWT_ACCESS_SECRET=<strong-random-secret>
JWT_ACCESS_EXPIRES_IN=1d
OTP_TTL_MINUTES=5
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:8081

# apps/admin/.env
VITE_API_URL=http://localhost:4000/api/v1

# apps/portal/.env
VITE_API_URL=http://localhost:4000/api/v1

# apps/mobile/.env
EXPO_PUBLIC_API_URL=http://your-pc-lan-ip:4000/api/v1
```

### Step 4: Verification

1. Start API server
2. Start admin portal
3. Start pensioner portal
4. Verify login flows
5. Check data integrity

### Rollback Plan

Keep the legacy system running in parallel. The new platform uses separate database tables, so rollback is immediate by switching DNS/load balancer back to legacy URLs.

### Common Issues

- **Port conflicts**: Change Vite ports in package.json scripts
- **CORS errors**: Update CORS_ORIGINS in API .env
- **Token errors**: Clear localStorage and re-login
- **Mobile connection**: Use PC LAN IP, not localhost
