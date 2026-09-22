# Frontend architecture

## Purpose
The frontend is the user-facing operational layer for LorryLogix. It consumes the NestJS REST API, renders real operational and financial data, and keeps the authoritative business rules on the backend.

## Component boundaries
- Server components: used for data fetching and page composition where the app needs to render API-backed data on initial load.
- Client components: reserved for lightweight interaction like filters, forms, and future mutation flows.
- API layer: all HTTP access is centralized under `lib/api/` so backend endpoints are not scattered across UI files.

## Why the backend remains authoritative
The domain rules for validation, financial snapshotting, obligations, and settlement checks live in NestJS + Prisma. The frontend can format and display values, but it must not independently calculate contract, settlement, or coverage logic. This matches the system design and prevents drift between the UI and the database.

## Data flow and state
The frontend uses a typed REST client with a single base URL from `NEXT_PUBLIC_API_URL`. Pages request data on the server when possible, with explicit loading and empty states. Client-side state is limited to UI concerns such as filter controls and interaction state; it does not duplicate the backend source of truth.

## Loading, empty, and error handling
Each feature page is expected to handle: loading while the request is pending, an empty state when the API returns no records, and a human-readable error if the request fails. The shell is intentionally simple and optimistic without pretending that reports or financial modules are implemented when the backend does not expose them.

## Multi-client and role readiness
The UI does not assume a single client or single operator. It relies on API payloads for client names and contract relationships and keeps route, contract, and trip data generic. Navigation is structured for future role-aware access, with administrative actions left isolated and not treated as available to every user.

## Current milestone
This first slice implements the working foundation: application shell, dashboard, clients, contracts, routes, and trips backed by the real NestJS API contracts that currently exist.
