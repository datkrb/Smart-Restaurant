# Restaurant Management System

## Features

- Modular monorepo: Backend (Node.js, Express, TypeScript, PostgreSQL, Prisma, Passport.js JWT, Socket.IO, Redis, Stripe, Docker) and Frontend (React, TypeScript, Vite, React Router, Zustand/Redux Toolkit, Axios, Socket.IO client, TailwindCSS, Chart.js/Recharts)
- Strict MVC+Service+Repository for backend, module-based for frontend
- Single database, single backend service
- JWT authentication, role-based access control, table session with QR code, order lifecycle, WebSocket events, Stripe payment, Redis caching, input validation, error handling

## Getting Started

### Prerequisites

- Docker & Docker Compose

### Setup

```sh
git clone <repo-url>
cd <project-root>
docker-compose up --build
```

- Backend: http://localhost:4000
- Frontend: http://localhost:3000

### Environment Variables

See `.env.example` in backend for required variables.

### Database

- Prisma schema in `backend/prisma/schema.prisma`
- Run migrations: `npx prisma migrate dev`

### Example API Endpoints

- `POST /api/auth/login`
- `GET /api/menu`
- `POST /api/order`
- `POST /api/payment/stripe`

### WebSocket Events

- `order:new`
- `order:statusUpdate`
- `kitchen:ready`

### Bonus

- Seed mock data: `npx prisma db seed`
- CI/CD: See `.github/workflows/ci.yml`
- Logging/monitoring: Placeholder in backend

## Folder Structure

See project for details.
