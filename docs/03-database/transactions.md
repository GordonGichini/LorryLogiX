# Transactions

## Purpose
Protect multi-row financial operations from partial writes and races.

## Concept and application
Creating a settlement and allocations must occur in one database transaction. Each obligation's outstanding amount is checked and updated atomically so it cannot become negative. Health only uses `SELECT 1` connectivity validation.

## Why it matters and trade-offs
Transactions provide consistency but must stay short. Allocation code will choose isolation and locking after concurrency tests.

## Questions and exercise
Describe the race when two settlement requests both read the same outstanding balance.
