# NestJS services

## Purpose
Place business actions near dependencies.

## Concept and application
HealthService tests the database through Prisma. Future FuelService will calculate coverage, create obligations and allocate settlements transactionally.

## Why it matters and trade-offs
Services are reusable from controllers or jobs; generic repositories wait for a demonstrated need.

## Questions and exercise
List the inputs and outputs of allocateSettlement.
