# API design

## Purpose
Set REST conventions before feature endpoints exist.

## Concept and application
Use nouns, resource IDs, JSON contracts, validated DTOs and paginated collections. Financial writes require idempotency and transactional services in Phase 2.

## Why it matters and trade-offs
REST is understandable for the web client; versioning is deferred while the interface evolves internally.

## Questions and exercise
What makes a POST settlement retry-safe?
