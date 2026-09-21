# DTO validation

## Purpose
Reject malformed requests before domain logic.

## Concept and application
The app has a global ValidationPipe with transform, whitelist and forbidden unknown properties. Future DTOs use class-validator and class-transformer decorators.

## Why it matters and trade-offs
DTO validation improves API safety but database constraints still protect all write paths.

## Questions and exercise
Create a DTO rule that requires a positive fuel amount.
