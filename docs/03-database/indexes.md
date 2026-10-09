# Indexes

## Purpose

Plan indexes from access patterns.

## Concept and application

Implemented indexes include:

- unique Asset registration
- Asset `(status, registration)` for status-filtered ordered lists
- unique non-null Driver phone number
- Driver `(status, fullName)` for status-filtered ordered lists
- Trip `(lorryId, occurredAt)`, `(contractRouteId, occurredAt)`, and `(status, occurredAt)`

The Asset and Driver composite indexes support B-tree equality filtering by
status followed by stable ordering. Case-insensitive substring matching uses
contains patterns and is not accelerated by these indexes. Consider PostgreSQL
trigram indexes only after measuring representative search latency and data
volume.

## Why it matters and trade-offs

Indexes improve reads but slow writes and consume space. Use `EXPLAIN ANALYZE` against representative data before report-specific indexes.

## Questions and exercise

Which composite index supports a lorry's recent trips, and in what column order?
