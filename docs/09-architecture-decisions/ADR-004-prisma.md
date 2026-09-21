# ADR: Prisma

## Status
Accepted — Phase 1 foundation.

## Context
The API needs typed database access and migrations after schema review.

## Problem
Choose an approach that is production-oriented, understandable and appropriate for the current stage.

## Decision
Use Prisma, initialized without domain models in Phase 1.

## Alternatives considered
Raw SQL only; rejected because typed models and migration workflow are valuable.

## Consequences
Prisma does not replace PostgreSQL constraints or transaction design.

## Questions and exercise
What new evidence would cause this decision to be revisited?
