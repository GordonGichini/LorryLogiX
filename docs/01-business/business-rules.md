# Business rules

## Purpose
State the facts that future services and database constraints enforce.

## Concept and application
Trip agreed rates are snapshots: route edits never rewrite history. Parking and weighbridge are Nevila responsibilities; driver salary and garage costs are operator responsibilities. Fuel repeats three operator-covered months then one client-covered month from an explicit start date. Physical payer and economic responsibility are distinct.

## Why it matters and trade-offs
Rules belong in services and constraints, never in a UI. Client coverage might mean direct payment or reimbursement; settlement behaviour is **TBD**, not inferred.

## Questions and exercise
What data proves who paid fuel versus who ultimately owes it?
