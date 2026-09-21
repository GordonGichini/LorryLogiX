# ADR: npm workspace monorepo

## Status
Accepted — Phase 1 foundation.

## Context
Web, API and small shared packages need one atomic change set.

## Problem
Choose an approach that is production-oriented, understandable and appropriate for the current stage.

## Decision
Use npm workspaces with apps/* and packages/*.

## Alternatives considered
Separate repositories; rejected because coordination exceeds present needs.

## Consequences
Shared tooling and lockfile; boundaries still need discipline.

## Questions and exercise
What new evidence would cause this decision to be revisited?
