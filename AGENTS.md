# Agent Guide

## Project Structure
- `apps/admin/` - Admin portal (Vite + React + TypeScript)
- `apps/portal/` - Pensioner portal (Vite + React + TypeScript)

## Build & Verification

### Typecheck
```bash
# From either apps/admin or apps/portal:
npx tsc --noEmit
```

### Build
```bash
# From either apps/admin or apps/portal:
npm run build
```

## Notes
- No ESLint configured in this project. Use `npx tsc --noEmit` for type safety.
- Both portals use Framer Motion for animations.
- CSS is hand-written in `src/styles.css` (no CSS modules or Tailwind).
- Components are co-located in `src/components/`.
- Pages are in `src/pages/`.
