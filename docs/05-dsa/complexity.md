# Complexity

## Purpose
Relate algorithmic cost to operational code.

## Concept and application
Database indexed lookups are usually better than scanning every trip in memory. Pagination bounds work per request.

## Why it matters and trade-offs
Use the database for set operations, not hand-written loops where SQL is better.

## Questions and exercise
Compare O(n) in-memory filtering with an indexed database query.
