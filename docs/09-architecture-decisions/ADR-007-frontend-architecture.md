# ADR: Frontend architecture

## Status
Accepted — Phase 1 frontend foundation.

## Context
The monorepo already includes a NestJS API and PostgreSQL-backed domain. The front end must be production-oriented, API-backed, and able to grow from the current single-client/single-lorry operating context to a larger fleet and multi-role platform.

## Problem
Choose an architecture that keeps business logic on the server, avoids duplicated domain logic, supports real API data, and remains easy to extend without visual redesign.

## Decision
Use the standard Next.js app router with a thin UI shell, server-rendered data pages, and a centralized typed REST client under `lib/api`. Only authenticated or backend-authoritative operations are delegated to mutations; pages will fetch real data from the API and display loading, empty, and error states consistently.

## Alternatives considered
- Building a fully client-side data store with duplicated API logic; rejected because it would drift from the backend authority.
- Rendering static mock screens; rejected because the requirement is to work with real API contracts and expose real operational data.
- Embedding fetch calls throughout feature components; rejected because it would make the application hard to maintain and scale.

## Consequences
The frontend remains focused on presentation and UX while backend rules remain the source of truth. The architecture is ready for future role-aware navigation and more advanced report flows without a redesign.

## Questions and exercise
What additional API endpoints will be needed to move from the current operational dashboard to a full role-aware finance and reporting surface?
