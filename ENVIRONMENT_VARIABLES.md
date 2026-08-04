# Environment Variables

## API (`apps/api/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `4000` | Server port |
| `DATABASE_URL` | **Yes** | - | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | **Yes** | - | JWT signing secret (min 32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | No | `1d` | JWT token expiry |
| `OTP_TTL_MINUTES` | No | `5` | OTP validity period |
| `CORS_ORIGINS` | No | `http://localhost:5173,http://localhost:5174` | Allowed CORS origins (comma-separated) |

### Production Values

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech:5432/pension_db?sslmode=require
JWT_ACCESS_SECRET=replace-with-a-strong-random-secret-minimum-32-characters
JWT_ACCESS_EXPIRES_IN=1d
OTP_TTL_MINUTES=5
CORS_ORIGINS=https://admin.your-domain.com,https://portal.your-domain.com
```

---

## Admin Frontend (`apps/admin/.env.production`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | **Yes** | Backend API base URL |

### Production Value

```env
VITE_API_URL=https://api.your-domain.com/api/v1
```

---

## Portal Frontend (`apps/portal/.env.production`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | **Yes** | Backend API base URL |

### Production Value

```env
VITE_API_URL=https://api.your-domain.com/api/v1
```

---

## Notes

- `VITE_` prefix variables are exposed to the browser in Vite builds.
- `DATABASE_URL` must include `?sslmode=require` for Neon PostgreSQL.
- `CORS_ORIGINS` must be a comma-separated list with no spaces around commas.
- `JWT_ACCESS_SECRET` should be at least 32 random characters.
