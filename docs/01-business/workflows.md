# Workflows

## Purpose
Describe flows that later become vertical API slices.

## Concept and application
A dispatch creates a Trip with a rate snapshot, delivery details progress approved status transitions, and a delivery note records both signatures. Fuel is recorded with the payment party, linked to a calculated coverage period, then represented by an obligation. A settlement allocates money to one or more obligations in one transaction.

## Why it matters and trade-offs
Explicit states are easier to audit than free-text status. We will not build workflow screens until their data model is reviewed.

## Questions and exercise
Draw the path from fuel purchase to settlement. Which step needs the policy cycle start date?
