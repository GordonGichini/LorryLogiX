# Indexes

## Purpose
Plan indexes from access patterns.

## Concept and application
Likely Phase 2 indexes include Trip by contract-route/date, Trip by lorry/date, FuelObligation by status and coverage period, and unique policy/period number. Foreign-key columns used in joins commonly need indexes.

## Why it matters and trade-offs
Indexes improve reads but slow writes and consume space. Use `EXPLAIN ANALYZE` against representative data before report-specific indexes.

## Questions and exercise
Which composite index supports a lorry's recent trips, and in what column order?
