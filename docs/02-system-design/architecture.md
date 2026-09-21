# Architecture

## Purpose
Define the Phase 1 modular-monolith boundary.

## Concept and application
Browser → Next.js → NestJS REST API → Prisma → PostgreSQL. Only the API accesses PostgreSQL. Nest follows controller → DTO validation → service → Prisma. Initial modules are Health and Prisma; future modules cover clients, contracts, assets, drivers, routes, trips, deliveries, fuel, expenses and reports.

## Why it matters and trade-offs
One deployable backend provides simple consistency and debugging. Microservices, queues, caching and event sourcing are deferred until measured requirements justify their cost.

## Questions and exercise
Where should an allocation-overpayment check live, and why should a controller not perform it?
