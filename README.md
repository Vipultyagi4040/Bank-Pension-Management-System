# Bank Pension Management System

Unified project containing API, Admin Portal, Pensioner Portal, Desktop App and Mobile App.

## One-command web development

From the project root:

```cmd
npm install
npm run dev
```

This starts:
- API: http://localhost:4000
- Admin: http://localhost:5173
- Pensioner Portal: http://localhost:5174
- Desktop: http://localhost:5176

## Database first-time setup

```cmd
cd apps\api
npx prisma generate
npx prisma migrate dev
npm run seed
cd ..\..
```

Admin: admin@bank.local / Admin@123
Pensioner: 9999999999 / OTP 123456

## Applications

- `apps/api`: Express + TypeScript + Prisma + PostgreSQL
- `apps/admin`: Admin portal with charts and reports
- `apps/portal`: Pensioner web portal
- `apps/mobile`: Expo mobile app
- `apps/desktop`: Electron desktop shell

## Run API
```bash
cd apps/api
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

## Run Admin
Create `apps/admin/.env` with `VITE_API_URL=http://localhost:4000/api/v1`, then:
```bash
cd apps/admin
npm install
npm run dev
```

## Run Pensioner Portal
Create `apps/portal/.env` with `VITE_API_URL=http://localhost:4000/api/v1`, then:
```bash
cd apps/portal
npm install
npm run dev -- --port 5174
```

## Run Mobile
Set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` to your PC LAN IP, then:
```bash
cd apps/mobile
npm install
npm start
```

## Run Desktop
```bash
cd apps/desktop
npm install
npm run electron:dev
```

This is a full client-demo MVP. Real SMS, cloud documents, push notifications and production security require client-owned credentials and deployment configuration.

## Documentation

- `docs/roadmap.md` - Production roadmap
- `docs/feature-matrix.md` - Feature status
- `docs/api-endpoints.md` - API reference
- `docs/migration-guide.md` - Legacy migration steps
