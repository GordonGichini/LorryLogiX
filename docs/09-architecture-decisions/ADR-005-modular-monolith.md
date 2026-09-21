# ADR: Modular monolith

## Status
Accepted — Phase 1 foundation.

## Context
One lorry and one team do not demonstrate a need for distributed services.

## Problem
Choose an approach that is production-oriented, understandable and appropriate for the current stage.

## Decision
Use one Nest deployable split into cohesive feature modules.

## Alternatives considered
Microservices; rejected because they add deployment and consistency complexity.

## Consequences
Modules can be extracted later if bounded contexts need independent scaling.

## Questions and exercise
What new evidence would cause this decision to be revisited?
