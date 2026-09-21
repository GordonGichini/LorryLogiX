# Security

## Purpose
Set safe defaults before tracking and financial integrations arrive.

## Concept and application
Secrets use environment variables and `.env` is ignored. PIN tracking credentials and future provider tokens never enter source, seeds or docs. The browser reaches REST endpoints, not PostgreSQL; validation is global and CORS permits the configured web origin.

## Why it matters and trade-offs
Environment configuration is simple locally but needs a managed secret store in deployment. Authentication, authorization, audit logging and rate limiting remain future work.

## Questions and exercise
How would you rotate a compromised tracking credential without a code change?
