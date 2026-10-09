# Current schema

## Purpose

Document the implemented data model and its integrity rules.

## Concept and application

The canonical schema is `database/schema.prisma`. Assets use UUID IDs,
registration (unique), description, `AssetStatus`, and timestamps. Drivers use
UUID IDs, full name, nullable unique phone number, `RecordStatus`, and
timestamps. No VIN, licence, insurance, or ownership fields are currently
required by confirmed business requirements, so they are not stored.

Trip has a required foreign key to Asset with `ON DELETE RESTRICT`, and an
optional foreign key to Driver with `ON DELETE SET NULL`. Application deletion
endpoints deactivate rather than physically delete records. Trip
`agreed_rate` copies the selected contract-route rate at creation.

## Why it matters and trade-offs

The copied rate is controlled denormalization for historical truth. It will be documented and tested.

`Route.status` uses the shared `RecordStatus` enum. Deactivation preserves the
row. Asset list queries use `(status, registration)` and Driver list queries
use `(status, fullName)` composite B-tree indexes for status filtering and
ordered pagination. These indexes do not accelerate case-insensitive
substring search; measure that workload before considering trigram indexes.

Driver phone is omitted from list projections and included only by the detail
query. This is minimization, not encryption or access control. The application
currently has no authentication or authorization.

The indexes are added by migration
`20261009090000_asset_driver_list_indexes`; existing records are unaffected.

## Questions and exercise

Write a check constraint that prevents a negative allocation amount.
