# Schema plan

## Purpose
Document conventions for the first domain migration.

## Concept and application
Tables will use UUID primary keys, timestamps, foreign keys and PostgreSQL numeric for money. Trip `agreed_rate` copies the active contract route rate at creation.

## Why it matters and trade-offs
The copied rate is controlled denormalization for historical truth. It will be documented and tested.

## Questions and exercise
Write a check constraint that prevents a negative allocation amount.
