# Arrays

## Purpose
Learn ordered collections through operations data.

## Concept and application
API lists of trips and settlement allocations are arrays with pagination. Append is cheap; arbitrary search is linear without an index or map.

## Why it matters and trade-offs
Arrays suit response ordering, not durable financial truth; PostgreSQL owns persistence.

## Questions and exercise
Implement a test that sums allocation amounts without floating point.
