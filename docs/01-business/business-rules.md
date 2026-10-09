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

## Questions and exercise

What data proves who paid fuel versus who ultimately owes it?
