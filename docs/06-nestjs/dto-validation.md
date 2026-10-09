# DTO validation

## Purpose

Reject malformed requests before domain logic.

## Concept and application

The app has a global `ValidationPipe` with transform, whitelist, and rejection
of unknown request properties. Asset and Driver create/update DTOs use
`class-validator` for string bounds, enum status values, and the optional
driver phone format. List DTOs validate page/pageSize and status/search values.
TypeScript types alone do not validate untrusted JSON at runtime; decorators
are executed by Nest's validation pipe before controller logic.

## Why it matters and trade-offs

DTO validation improves API safety but database constraints still protect all write paths.

## Questions and exercise

Create a DTO rule that requires a positive fuel amount.
