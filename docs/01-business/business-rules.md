# Business rules

## Purpose

State the facts that future services and database constraints enforce.

## Concept and application

Trip agreed rates are snapshots: route edits never rewrite history. Parking and weighbridge are Nevila responsibilities; driver salary and garage costs are operator responsibilities. Fuel repeats three operator-covered months then one client-covered month from an explicit start date. Physical payer and economic responsibility are distinct.

## Why it matters and trade-offs

Rules belong in services and constraints, never in a UI. Client coverage might mean direct payment or reimbursement; settlement behaviour is **TBD**, not inferred.

## Route status and contract synchronization

Routes are physical origin/destination corridors. Commercial ownership and pricing belong to the contract-route relationship. A route can be deactivated without deleting its historical record.

When route pricing is reassigned to another contract, the previous pricing period is closed when the new effective date is later. Contract route counts represent currently active pricing relationships, while historical relationships remain available for audit and historical trip context.

### Inactive route pricing

The chosen lifecycle rule is:

- An inactive route cannot receive a new contract-pricing relationship or have pricing reassigned to another contract.
- Existing contract-pricing rows remain stored for historical trips and audit context.
- For an inactive route, an existing pricing row may only have its `activeTo` date shortened. Its contract, rate, currency, and `activeFrom` date remain unchanged.
- Creating a new trip against an inactive route is rejected, even if its contract-pricing date range would otherwise allow the trip date.
- Deactivation does not automatically rewrite existing contract-pricing dates; a user may explicitly close the period using the allowed shortening operation.

## Assets and drivers

The current Asset record contains registration, description, operational status,
and timestamps. Registration is unique. `UNDER_MAINTENANCE` is not eligible for
a new trip; only an `ACTIVE` asset may be assigned.

The current Driver record contains full name, optional phone number, status,
and timestamps. A non-null phone number is unique in the database. Only an
`ACTIVE` driver may be assigned to a new trip. Phone numbers are personal data:
they are omitted from driver list responses and shown only by the detail API
and detail UI. Authentication and authorization do not yet exist, so the
application is not suitable for production use with real personal data.

Assets and drivers are deactivated rather than physically deleted through the
API. Repeated deactivation writes the inactive status again. No reactivation
endpoint exists yet. Existing Trips preserve their Asset relationship and
optional Driver relationship; profile deactivation does not delete or rewrite
historical trips. A Trip may have no driver because `Trip.driverId` is nullable.

The current model does not establish a permanent driver-to-lorry assignment.
The selected asset and optional driver are recorded per trip. The schema has a
`DriverAssignment` relation, but no assignment workflow currently consumes it;
adding time-bounded assignment rules requires a confirmed operational need.

## Questions and exercise

What data proves who paid fuel versus who ultimately owes it?
