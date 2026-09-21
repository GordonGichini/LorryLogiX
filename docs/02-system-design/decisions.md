# Decisions

## Purpose
Record Phase 1 decisions.

## Concept and application
We use an npm-workspace monorepo, modular Nest backend, PostgreSQL source of truth and Prisma. Prisma is initialized with no models: schema work waits for a reviewed domain slice. The health endpoint queries PostgreSQL, proving the dependency.

## Why it matters and trade-offs
Deferring schema avoids a speculative migration that is hard to reverse. ADRs contain fuller alternatives.

## Questions and exercise
What evidence would justify adding a background queue?
