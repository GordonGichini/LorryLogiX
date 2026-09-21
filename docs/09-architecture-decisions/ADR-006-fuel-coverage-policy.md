# ADR: Fuel coverage policy

## Status
Accepted — Phase 1 foundation.

## Context
Fuel coverage is a 3 operator month, 1 client month repeating agreement.

## Problem
Choose an approach that is production-oriented, understandable and appropriate for the current stage.

## Decision
Represent policy, calculated periods, payer, obligation, settlement and allocation separately.

## Alternatives considered
A manually entered eligibility date; rejected because it hides the repeating rule and cannot model reconciliation.

## Consequences
Direct client payment versus reimbursement remains TBD; the model supports either.

## Questions and exercise
What new evidence would cause this decision to be revisited?
