# End-to-end testing

## Purpose

Test visible workflows across browser, API and database.

## Concept and application

No browser E2E suite is currently installed. API service unit tests do not
prove the complete UI-to-database workflow. A first E2E slice should create an
Asset, create a Driver using synthetic contact data, confirm both appear in
their paginated lists, and then verify that an inactive Asset or Driver cannot
be used by a trip-creation request. The test must run against an isolated test
database, not the development database.

## Why it matters and trade-offs

E2E tests give high confidence but are slower and more brittle, so keep them focused.

## Questions and exercise

Choose one dispatch-to-delivery scenario for the first E2E test.
