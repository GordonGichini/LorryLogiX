# Integration testing

## Purpose
Verify database and module collaboration.

## Concept and application
Phase 1 verification uses Docker PostgreSQL and a health query. Phase 2 integration tests should assert transaction rollback, foreign keys and constraints.

## Why it matters and trade-offs
Integration tests are slower but catch ORM and SQL differences that mocks cannot.

## Questions and exercise
How would you prove over-allocation leaves no settlement records behind?
