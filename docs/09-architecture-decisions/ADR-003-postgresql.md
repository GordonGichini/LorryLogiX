# ADR: PostgreSQL

## Status
Accepted — Phase 1 foundation.

## Context
The product needs transactional, relational financial truth.

## Problem
Choose an approach that is production-oriented, understandable and appropriate for the current stage.

## Decision
Use PostgreSQL 17 as the source of truth.

## Alternatives considered
Document stores; rejected because relations, constraints and financial transactions are central.

## Consequences
Docker provides consistent local development; operational backups are future work.

## Questions and exercise
What new evidence would cause this decision to be revisited?
