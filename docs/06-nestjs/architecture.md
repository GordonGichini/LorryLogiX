# NestJS architecture

## Purpose
Explain backend layering.

## Concept and application
AppModule composes config, Prisma and health. Controllers map HTTP requests, services hold behaviour, and PrismaService owns connectivity.

## Why it matters and trade-offs
This separates transport from business rules without needless abstraction.

## Questions and exercise
Where would a future FuelService be registered?
