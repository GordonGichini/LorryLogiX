# Architecture

## Purpose

Define the Phase 1 modular-monolith boundary.

## Concept and application

Browser → Next.js → NestJS REST API → Prisma → PostgreSQL. Only the API accesses PostgreSQL. Nest follows controller → DTO validation → service → Prisma. Initial modules are Health and Prisma; future modules cover clients, contracts, assets, drivers, routes, trips, deliveries, fuel, expenses and reports.

### Current implementation status

Current implementation is a modular monolith with real, working request boundaries for health, master data, contracts, trips, and fuel. The Routes flow behaves as a classic request pipeline:

```text
UI component
  -> frontend API client
  -> HTTP request
  -> NestJS controller
  -> DTO validation
  -> service logic
  -> Prisma query
  -> PostgreSQL
  -> JSON response
  -> frontend state update
```

## Route and status behaviour

Routes are stored with a physical route identity and optional contract-specific pricing. The important business distinction is:

- Route = physical corridor
- ContractRoute = contract rate for that corridor
- Trip = historical snapshot of a route pricing decision at the time of travel

The current system uses a soft deactivation model: `ACTIVE -> INACTIVE` with historical records preserved. This is implemented via the `RecordStatus` enum and the `Route.status` column.

## Pagination and filtering

Routes currently support server-side pagination through the `GET /routes` API with:

- `page` and `pageSize`
- optional `status` filter (`ACTIVE`, `INACTIVE`, or `ALL`)
- optional `search` query for origin/destination matching
- allow-listed server-side sorting by origin, destination, or status
- deterministic tie-break ordering for stable pages
- `total` and `totalPages` metadata in the response

The Routes screen sends its search, status, sorting, and page state to the API
and displays the returned pagination metadata. Other list endpoints are not
all paginated yet. Rate sorting is not supported because each physical route
can have multiple contract-specific pricing records; the business meaning of
"sort by rate" must be decided before implementing it.

This is intentionally kept simple and production-appropriate for the current scale while avoiding unbounded list queries.

## Security and tenancy direction

Current status:

- No authentication is implemented.
- No authorization layer is implemented.
- No tenant identity exists in the data model.

Planned direction:

- A user model and auth module.
- JWT or session-based auth.
- RBAC or permission-based authorization.
- Shared-schema multi-tenancy with `tenantId` on tenant-owned records.

Proposed relationship:

```text
User -> Tenant -> Role/Permission -> Resource -> Prisma query
```

This is a future architecture direction and should not be treated as already implemented.

## Why it matters and trade-offs

One deployable backend provides simple consistency and debugging. Microservices, queues, caching and event sourcing are deferred until measured requirements justify their cost.

## Questions and exercise

Where should an allocation-overpayment check live, and why should a controller not perform it?
