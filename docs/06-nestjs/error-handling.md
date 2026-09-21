# Error handling

## Purpose
Plan consistent API failure responses.

## Concept and application
Nest converts validation and uncaught exceptions into HTTP responses. Future domain services should return meaningful errors without exposing database details.

## Why it matters and trade-offs
Stable errors help clients; leaked internals harm security.

## Questions and exercise
What status should an allocation that exceeds outstanding balance return?
