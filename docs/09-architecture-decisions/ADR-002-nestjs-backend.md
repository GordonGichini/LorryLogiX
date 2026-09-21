# ADR: NestJS backend

## Status
Accepted — Phase 1 foundation.

## Context
The browser must not reach PostgreSQL and the backend will grow domain modules.

## Problem
Choose an approach that is production-oriented, understandable and appropriate for the current stage.

## Decision
Use NestJS with controllers, validation and services.

## Alternatives considered
Next API routes; rejected because Nest better supports the intended learning and modular backend.

## Consequences
A framework structure is introduced, with clear dependency injection.

## Questions and exercise
What new evidence would cause this decision to be revisited?
