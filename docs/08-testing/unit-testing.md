# Unit testing

## Purpose

Test isolated business behaviour quickly.

## Concept and application

API unit tests are Jest `*.spec.ts` files colocated with their module. Run them
with `npm --workspace apps/api test -- --runInBand` (or target a spec path).
Current Asset/Driver and relationship tests cover paginated list query
construction, omission of driver phone from the list projection, detail
not-found behavior, profile update/deactivation, active-only Trip assignment,
and agreed-rate snapshotting. Routes and contract-pricing regression tests are
also present.

These are service unit tests: Prisma is mocked, so they prove business decisions
and requested query shapes, not PostgreSQL constraints, HTTP routing/DTO pipes,
or browser behavior. Add integration tests against a separately configured
test database to verify real constraints and query results, then a small E2E
workflow to verify browser-to-database behavior. Never point automated tests
at the development database.

## Why it matters and trade-offs

Unit tests are fast but cannot prove database constraints or query behaviour.

## Questions and exercise

Write cases for the first four months of the 3:1 fuel policy.
