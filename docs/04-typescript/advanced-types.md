# Advanced types

## Purpose
Prepare expressive types for future domain rules.

## Concept and application
String-literal unions will model statuses; branded IDs can prevent mixing Trip and Contract IDs; discriminated unions can represent settlement behaviour once the fuel question is answered.

## Why it matters and trade-offs
Types prevent invalid code paths but cannot replace database constraints.

## Questions and exercise
Model a FuelCoverageParty union and use exhaustive switching.
