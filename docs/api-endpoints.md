# API Endpoints

Base URL: `/api/v1`

## Authentication
- `POST /auth/pensioner/request-otp`
- `POST /auth/pensioner/verify-otp`
- `POST /auth/admin/login`

## Pensioner
- `GET /pensioner/dashboard`
- `GET /pensioner/profile`
- `PATCH /pensioner/profile`
- `GET /pensioner/pension`
- `GET /pensioner/slips`
- `GET /pensioner/policies`
- `GET /pensioner/notifications`
- `GET /pensioner/grievances`
- `POST /pensioner/grievances`
- `POST /pensioner/leads`

## Admin
- `GET /admin/dashboard`
- `GET /admin/pensioners`
- `PATCH /admin/pensioners/:id/status`
- `POST /admin/notifications`
- `GET /admin/grievances`
- `PATCH /admin/grievances/:id`
