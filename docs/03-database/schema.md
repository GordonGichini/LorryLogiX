# Schema plan

## Purpose
Document conventions for the first domain migration.

## Concept and application
Tables will use UUID primary keys, timestamps, foreign keys and PostgreSQL numeric for money. Trip `agreed_rate` copies the active contract route rate at creation.

## Why it matters and trade-offs
The copied rate is controlled denormalization for historical truth. It will be documented and tested.

`Route.status` uses the shared `RecordStatus` enum. Deactivation is a soft-delete operation and preserves the route row. Contract-specific rates remain in `ContractRoute`; reassignment creates or updates the active pricing relationship while preserving prior effective periods where dates allow. Contract route listings and counts filter to active effective periods so the Contracts and Routes views remain synchronized.

## Questions and exercise
Write a check constraint that prevents a negative allocation amount.
