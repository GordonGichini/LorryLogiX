# Hash tables

## Purpose
Understand fast in-memory lookup.

## Concept and application
A Map keyed by route ID can enrich a small import batch in expected O(1) lookup time. PostgreSQL unique indexes serve a durable lookup role.

## Why it matters and trade-offs
Maps are process-local and disappear on restart, so they are not database uniqueness.

## Questions and exercise
Build a Map from route ID to rate and explain duplicate-key behaviour.
