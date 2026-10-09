# ERD direction

## Purpose

Describe the current implemented domain relationships.

## Concept and application

Client 1:N Contract; Contract and Route connect through ContractRoute; ContractRoute and Asset connect to Trip, while Driver is an optional Trip relationship. An Asset has many Trips over time; a Driver may have many Trips over time. Asset deletion is restricted while referenced by Trips; Driver is nullable with `ON DELETE SET NULL`, but API lifecycle operations deactivate profiles instead of deleting them. Trip list queries continue to return historical trips with the current related profile status.

The schema also defines a DriverAssignment relationship between Drivers and
Assets, but no assignment API or UI currently uses it. Trips record a driver
and lorry independently; no permanent or time-bounded assignment rule is
enforced. Trip has at most one DeliveryNote and many fuel transactions and
expenses. FuelCoveragePolicy has periods; each FuelObligation references one
period. Settlements and obligations connect through SettlementAllocation.

## Why it matters and trade-offs

The allocation table models the real many-to-many settlement relationship and is implemented in the canonical Prisma schema.

## Questions and exercise

Why cannot a single settlement ID on an obligation model partial settlements?
