# System requirements

## Purpose
Translate business expectations into technical constraints.

## Concept and application
Node 20+, npm workspaces, Next.js, NestJS, PostgreSQL 17, Prisma and REST form the initial stack. API is port 3001, web 3000 and database 5432. Money will use numeric values, UUIDs identify rows, and inputs will be validated.

## Why it matters and trade-offs
Explicit constraints prevent direct browser database access and inconsistent money types. Authentication is intentionally later, so local CORS only permits the configured web origin.

## Questions and exercise
Map three financial-record requirements to technical mechanisms.
