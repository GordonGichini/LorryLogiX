# LorryLogix

LorryLogix is a logistics operations and financial management platform. Phase 1 establishes a modular-monolith foundation for the Big Canter serving Nevila.

## Run locally

1. `npm install`
2. Copy `.env.example` to `.env` and adjust values if required.
3. `docker compose up -d` (PostgreSQL is exposed on port 5433 to avoid a local PostgreSQL service already using 5432.)
4. `npm run prisma:generate`
5. `npm run dev:web` (port 3000)
6. In another terminal, `npm run dev:api` (port 3001)
7. Visit `http://localhost:3001/health`.

`npm run prisma:validate`, `npm run build`, `npm run lint`, and `npm test` verify the workspace. Never commit `.env` files or tracking credentials.

## Deliberately deferred

No business tables, migrations, trip UI, authentication, or tracking integrations exist yet. Prisma is initialized only for Phase 1 infrastructure verification.
