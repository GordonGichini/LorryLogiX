# Scalability

## Purpose
Plan growth without premature infrastructure.

## Concept and application
Foreign keys let one lorry become many. Pagination and indexes support growing trip and transaction lists; reports should use database aggregation before application memory. The monolith can scale vertically and later into stateless API instances.

## Why it matters and trade-offs
Caching and queues add invalidation and delivery semantics. They are deferred until report latency or integrations make them necessary.

## Questions and exercise
Which queries deserve an index after observing a trip-list screen? Why is an index not pagination?
