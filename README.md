# LorryLogix

LorryLogix is a logistics operations platform for managing clients, contracts, commercial routes, lorries, drivers, trips, fuel, and future monthly billing and financial reporting.

The project is an existing npm monorepo built as a modular monolith. The current product is data-backed and uses PostgreSQL through the NestJS API. The frontend never connects directly to PostgreSQL or Prisma.

## Product Direction

The target operational flow is:

```text
Client
  -> Contract
  -> Route and contract-specific rate
  -> Delivery note
  -> Trip
  -> Delivered trip
  -> Delivery payment record
  -> Monthly invoice
  -> Paid or not paid
  -> Financial reporting
```

Operating costs are associated with the operation:

```text
Trip
  -> Fuel
  -> Expenses

Revenue - Operating expenses = Operating profit
```

Revenue earned, cash collected, and outstanding revenue remain separate concepts.

## System Architecture

```text
Browser
  -> Next.js App Router frontend
  -> Typed frontend API client
  -> NestJS REST API
  -> DTO validation and domain services
  -> Prisma ORM
  -> PostgreSQL
```

### Frontend

Location: `apps/web`

- Next.js and React with TypeScript
- Server-rendered pages fetch real API data
- Client components handle interactive forms, filtering, sorting, and mutation feedback
- `apps/web/lib/api/client.ts` is the shared HTTP boundary
- `NEXT_PUBLIC_API_URL` controls the backend URL, defaulting to `http://localhost:3001`
- No Prisma client or database credentials are imported into the frontend

### Backend

Location: `apps/api`

NestJS modules currently include:

- `HealthModule`
- `PrismaModule`
- `MasterDataModule` for clients, assets, drivers, and physical routes
- `ContractsModule` for contracts and contract-specific route pricing
- `TripsModule` for trip creation, listing, and status transitions
- `FuelModule` for fuel policies, fuel transactions, obligations, and historical settlements

The application is bootstrapped in `apps/api/src/main.ts` with:

- Global `ValidationPipe`
- Whitelist validation
- Rejection of unknown request fields
- CORS configured from `WEB_ORIGIN`
- API port configured from `API_PORT`

### Database

The source-of-truth Prisma schema is `database/schema.prisma`.

The database uses:

- PostgreSQL UUID primary keys
- Foreign keys and restrictive deletes for financial history
- PostgreSQL `Decimal` values for money, litres, and tonnage
- Database check constraints for positive amounts and valid date ranges
- Prisma migrations under `database/migrations`

The database is exposed locally on port `5433` to avoid conflicts with a PostgreSQL service on port `5432`.

## Local Development

Prerequisites:

- Node.js 20 or newer
- npm
- Docker Desktop

Commands:

```powershell
npm install
docker compose up -d postgres
npm run prisma:generate
npm run seed
npm run dev:api
npm run dev:web
```

Run the API and web commands in separate terminals.

Local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Health check: `http://localhost:3001/health`
- PostgreSQL: `localhost:5433`

Useful verification commands:

```powershell
npm run prisma:validate
npx prisma migrate status --schema database/schema.prisma
npm run build
npm run lint
npm test
```

## Route and Pricing Model

Routes deliberately have two layers:

```text
Route
  Physical origin and destination

ContractRoute
  Contract/client relationship
  Rate
  Currency
  Effective dates

Trip
  agreedRate snapshot copied at trip creation
```

The rate does not belong directly to the physical route because different clients or contracts may pay different rates for the same corridor.

Historical trip rates are snapshots. Editing a current route rate must not rewrite the rate on existing trips.

Current seed/demo route relationships include:

- Kumpar -> Industrial Area: KES 19,000
- Kumpar -> Thika: KES 25,000
- Kumpar -> Ngong: KES 25,000

Additional destinations are created through the UI and are not hard-coded.

## Implemented Route CRUD

The Routes page currently supports:

- Add route
- Edit physical origin and destination
- Edit contract-specific client/rate context
- View route details
- Search routes
- Filter by `ACTIVE` or `INACTIVE`
- Sort by origin, destination, rate, or status
- Toggle ascending/descending order
- Deactivate a route without deleting historical data
- Clear API validation errors
- Refetch authoritative data after every mutation

Current route endpoints:

```text
GET    /routes
POST   /routes
PATCH  /routes/:id
PATCH  /routes/:id/pricing
DELETE /routes/:id       # soft-deactivates; does not hard-delete
```

Contract pricing can also be managed through the existing contract boundary:

```text
POST  /contracts/:contractId/routes
PATCH /contracts/:contractId/routes/:routeId
```

### Route create algorithm

The route creation service follows this sequence:

1. Validate origin and destination through the DTO.
2. Detect whether pricing fields were supplied.
3. If pricing was supplied, require contract, rate, and effective-from date together.
4. Validate the effective date range.
5. Check the compound unique key `(origin, destination)` to prevent duplicate physical routes.
6. Start a Prisma transaction.
7. Create the physical route.
8. If a contract was supplied, verify that the contract exists.
9. Create the `ContractRoute` pricing relationship.
10. Return the route with contract and client context.

If any step fails, the transaction rolls back and a controlled HTTP error is returned.

### Route update algorithm

Physical route editing:

1. Find the route.
2. Calculate the proposed origin/destination pair.
3. Check the compound unique key against another route.
4. Update only the physical route fields.
5. Return the route with pricing context.

Contract reassignment and rate editing:

1. Find the route and its pricing relationships ordered by newest effective date.
2. Verify that the target contract exists.
3. Validate the new effective date range.
4. Reject duplicate active pricing for the target contract.
5. If the new contract starts at or before the current pricing period, update the current relationship in place.
6. If the new contract starts later, close the previous pricing period one day before the new start date.
7. Create the new `ContractRoute` relationship for the new contract.
8. Return the new current pricing relationship.

This is a small domain algorithm using indexed lookups, a transaction, and date-range preservation. It is not a graph or path-finding algorithm: route management stores and validates commercial corridors; it does not calculate the shortest road route.

### Route deactivation algorithm

`DELETE /routes/:id` is intentionally a soft delete:

1. Find the route.
2. Return `404` if it does not exist.
3. Set `Route.status` to `INACTIVE`.
4. Preserve the route, pricing history, and future historical references.

The migration is `database/migrations/20260925070000_route_status/migration.sql`.

## Current API and Business Algorithms

### Pagination

Trips use offset pagination:

```text
skip = (page - 1) * pageSize
take = pageSize
```

The API returns the page data and total count.

### Trip rate snapshot

When a trip is created:

1. Validate the contract route exists.
2. Validate the lorry exists.
3. Validate the driver if supplied.
4. Validate that the trip date is within the contract route effective dates.
5. Copy `ContractRoute.rate` into `Trip.agreedRate`.

This preserves historical revenue truth when a contract rate changes later.

### Trip status transitions

The current implementation still contains the broader original enum and transition table. Delivery-note enforcement and the simplified client workflow of `DISPATCHED -> DELIVERED` are planned work, not yet complete.

### Fuel coverage

Fuel policy period generation:

1. Load the policy and existing periods.
2. Start after the last existing period, or at the policy start date.
3. Create monthly periods through the requested date.
4. Use modulo arithmetic over the cycle length to determine the responsible party.
5. Persist periods with a unique `(policyId, periodNumber)` constraint.

Fuel settlement validation currently checks:

- Allocation total equals settlement total
- No duplicate obligation in one settlement
- Obligation exists
- Allocation does not exceed remaining balance
- Settlement reference is unique

The product direction is to make simple fuel capture primary and deprecate the old fuel obligation/settlement workflow from the active UI while preserving historical tables and records.

## Data Currently Seeded

The deterministic seed script is `database/seeds/seed.mjs`.

It currently creates or reuses:

- Nevila client
- Kumpar routes
- Lorry and driver records
- Active contract
- Contract route rates
- Fuel coverage policy and periods
- A Thika demo trip

The seed is idempotent for its known records. The requested delivery notes, expenses, invoices, payments, and full reporting demo seed still need to be added.

## Completed Work

- Repository and configuration audit
- Backend TypeScript/build configuration cleanup
- PostgreSQL Docker setup and Prisma initialization
- Seed verification against live PostgreSQL
- Frontend-to-API architecture verification
- Central frontend API client
- CRUD smoke testing for existing create/read endpoints
- Fuel settlement rule validation against live data
- Duplicate settlement reference validation
- Navy/blue frontend visual redesign
- Route create, view, edit, search, and soft-deactivation flow
- Contract-specific route pricing synchronization
- Route status migration
- Route status filtering and sorting
- API and web production builds

## Current In Progress

The next implementation phase is master-data CRUD using the route-management pattern:

- Client add/edit/deactivate UI
- Lorry/asset add/edit/deactivate UI
- Driver add/edit and lorry assignment UI
- Clear mutation feedback and refetch behavior

## Remaining Product Work

### Delivery notes and trips

- Add delivery-note module, DTOs, service, controller, and UI
- Require sender-signed delivery note before dispatch
- Require receiver signature before delivery
- Add delivery note number and delivery date to the trip table
- Enforce tonnage greater than zero and at most 11 tonnes
- Add trip create/edit/status UI

### Fuel

- Add simple fuel transaction CRUD
- Add petrol station
- Add lorry/date filters
- Add monthly and yearly totals
- Add configurable benchmark assumptions such as approximately 4 km/litre and 40 litres/day
- Remove old settlement obligations from the primary user workflow without deleting historical data

### Expenses and finance

- Add expense module and UI
- Add requested categories and frequency metadata
- Add lorry/trip/date/category filters
- Add maintenance and document workflows
- Add real operating-cost aggregation

### Payments and invoices

- Add delivery payment records tied to trips/delivery notes
- Add `PAID` and `NOT_PAID`
- Add invoice line items
- Generate monthly invoices from eligible delivered trips
- Prevent duplicate billing
- Keep invoice totals separate from cash collected

### Reports and dashboard

- Add trips, fuel, and profit report endpoints
- Replace generic dashboard metrics with backend-derived business metrics
- Define and document:

```text
Operating profit = revenue from delivered trips - operating expenses
```

### Quality and testing

- Add backend unit and integration tests
- Add trip/delivery validation tests
- Add invoice duplicate-prevention tests
- Add report aggregation tests
- Add browser-level CRUD tests
- Add loading, retry, and richer error states

## Mentor Interview Summary

### Explain the architecture in one minute

“LorryLogix is a TypeScript npm monorepo with a Next.js frontend and a NestJS modular-monolith backend. The browser calls a centralized typed API client. The frontend never talks to PostgreSQL. NestJS validates DTOs, services apply business rules, Prisma handles persistence, and PostgreSQL enforces relational constraints and numeric checks. Route pricing is stored separately from physical routes, and trips snapshot the agreed rate for historical accuracy.”

### Explain the route design

“A Route represents a physical corridor such as Kumpar to Industrial Area. ContractRoute represents the commercial relationship between that corridor and a particular contract, including rate, currency, and effective dates. This prevents us from incorrectly assuming one universal rate for every client. When a route is reassigned to another contract, the service uses a transaction to preserve the old pricing period and create or update the new active relationship.”

### Explain why the frontend refetches after mutations

“The API is authoritative. After Add, Edit, contract reassignment, or deactivation, the client refetches the route list rather than guessing the resulting nested contract state locally. That keeps the Routes page synchronized with the Contracts page and avoids stale derived data.”

### Explain soft deletion

“Routes are operational records referenced by commercial and historical data, so deletion is implemented as deactivation. The row remains in PostgreSQL, but its status becomes INACTIVE. This protects history and allows filtering inactive routes without losing context.”

### Explain validation ownership

“DTOs handle request shape and basic field validation. Services handle cross-record business rules such as duplicate routes, contract existence, effective-date consistency, contract reassignment, and transaction boundaries. PostgreSQL handles durable invariants such as uniqueness, positive amounts, and valid ranges. React displays the errors but does not reimplement the business rules.”

## Important Limitations

The following are not complete and should not be presented as complete in a demo:

- Delivery notes and signature-driven trip transitions
- Monthly billing and invoice generation
- Delivery payments
- Expenses and profit reporting
- Full master-data CRUD
- Automated test coverage
- Authentication and authorization
- External document storage
- Telematics/tracking integrations

Never commit `.env` files, database credentials, or generated secrets.
