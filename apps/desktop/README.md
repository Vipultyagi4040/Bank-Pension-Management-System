# Desktop App

Electron shell for the Bank Pension System.

## Setup

```bash
cd apps/desktop
npm install
```

## Development

```bash
npm run electron:dev
```

This starts Vite at http://localhost:5176 and opens the Electron window.

## Production Build

```bash
npm run electron:build
```

Output will be in the `dist/` directory.

## Environment

No additional environment variables required. The desktop app loads the web portals by URL.
