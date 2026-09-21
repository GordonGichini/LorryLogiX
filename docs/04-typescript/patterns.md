# TypeScript patterns

## Purpose
Keep implementation readable as modules grow.

## Concept and application
Use small services, DTO classes at boundaries and explicit response types. The shared package contains only genuine cross-application contracts.

## Why it matters and trade-offs
Shared code reduces duplication but can create unwanted coupling; internal Prisma models remain private.

## Questions and exercise
When should a type remain inside the fuel module rather than move to shared?
