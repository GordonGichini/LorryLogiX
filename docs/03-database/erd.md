# ERD direction

## Purpose
Describe target relationships before Phase 2 schema implementation.

## Concept and application
Client 1:N Contract; Contract and Route connect through ContractRoute; ContractRoute, Lorry and Driver connect to Trip. Trip has at most one DeliveryNote and many fuel transactions and expenses. FuelCoveragePolicy has periods; each FuelObligation references one period. Settlements and obligations connect through SettlementAllocation.

## Why it matters and trade-offs
The allocation table models the real many-to-many settlement relationship. This is conceptual only; no tables are implemented.

## Questions and exercise
Why cannot a single settlement ID on an obligation model partial settlements?
