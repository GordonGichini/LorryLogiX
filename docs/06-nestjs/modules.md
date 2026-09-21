# NestJS modules

## Purpose
Set boundaries for cohesive backend features.

## Concept and application
HealthModule owns the health route; PrismaModule is global infrastructure. Future modules own their controllers, DTOs and services.

## Why it matters and trade-offs
Modules prevent a single growing application file, but overly granular modules cost navigation time.

## Questions and exercise
What belongs in TripsModule versus ContractsModule?
