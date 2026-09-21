# NestJS controllers

## Purpose
Keep HTTP handling small and explicit.

## Concept and application
HealthController delegates GET /health to HealthService. Future controllers parse validated DTOs and return response contracts.

## Why it matters and trade-offs
Controllers are easy to test when they do not contain financial calculations or direct Prisma calls.

## Questions and exercise
Design a route for paginated trips without implementing it.
