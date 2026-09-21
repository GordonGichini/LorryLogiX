# Business requirements

## Purpose
Capture the business outcome before database or API design.

## Concept and application
The product manages a Big Canter serving Nevila from Kumpar warehouse, initially on three routes: Industrial Area (KES 19,000), Thika (KES 25,000), and Ngong (KES 25,000). Kumpar is a location, not a customer. The design must scale from one asset to a fleet.

## Why it matters and trade-offs
Clear language prevents a location becoming a client record or a changed contract rate altering history. We choose normalized entities over a single trip spreadsheet; that costs more initial modelling but preserves auditability.

## Questions and exercise
Explain why a Trip needs a contract-route reference and a copied agreed rate. Sketch a weekly income and cost report.
