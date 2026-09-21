# Normalization

## Purpose
Use normalized entities while preserving financial snapshots.

## Concept and application
Clients, routes, contracts and assets are separate because each changes independently. ContractRoute holds route-specific terms. Fuel payer, coverage responsibility and settlement are separate facts. Trip agreed rate is a snapshot, not a replacement for ContractRoute.

## Why it matters and trade-offs
Normalization avoids update anomalies; snapshots preserve agreements at a point in time. Reports may use views only after query evidence supports them.

## Questions and exercise
Contrast a Route table with storing destination text on every Trip.
