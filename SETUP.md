# RCCMS UI - Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200`

3. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── app/
│   ├── auth/              # Authentication module (placeholder)
│   ├── core/              # Core services and interceptors
│   │   └── services/
│   │       └── api.service.ts
│   ├── pages/             # Page components
│   │   └── home/
│   │       └── home.component.*
│   ├── shared/            # Shared components
│   │   └── components/
│   │       ├── header/
│   │       └── footer/
│   ├── app.component.*    # Root component
│   ├── app.module.ts      # Root module
│   └── app-routing.module.ts
├── assets/                # Static assets
├── environments/          # Environment configurations
│   ├── environment.ts
│   └── environment.prod.ts
├── styles.scss            # Global styles
└── main.ts                # Application entry point
```

## Key Features

- **Angular 16+** with TypeScript
- **Angular Material** with custom government theme
- **Responsive Layout** (desktop + mobile)
- **Modular Architecture** (core, shared, pages, auth)
- **API Service** with environment-based configuration
- **Routing** configured with default route to home

## Environment Configuration

Update API URLs in:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

## Default Route

- `/` → redirects to `/home`
- `/home` → Home page component

