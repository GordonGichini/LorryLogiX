# API endpoints

## Purpose

Record the verified HTTP surface and distinguish implemented behavior from
planned work. The API is currently unauthenticated; do not expose it to
untrusted users or networks.

## Routes

| Method | Path | Current behavior |
| --- | --- | --- |
| `POST` | `/routes` | Create a physical route, optionally with initial contract pricing. |
| `GET` | `/routes` | Return a paginated route collection with filters and allow-listed sorting. |
| `PATCH` | `/routes/:id` | Update route origin/destination only. |
| `PATCH` | `/routes/:id/pricing` | Create or update contract pricing/history for a route. |
| `DELETE` | `/routes/:id` | Soft-deactivate by setting `status` to `INACTIVE`; does not delete history. |

### `GET /routes`

Query parameters:

| Parameter | Validation / default | Meaning |
| --- | --- | --- |
| `page` | Integer, minimum 1; default 1 | One-based page number. |
| `pageSize` | Integer 1–100; default 25 | Maximum routes returned. |
| `status` | `ACTIVE`, `INACTIVE`, or `ALL` | Omitted or `ALL` does not filter by status. |
| `search` | 1–120 characters when supplied | Case-insensitive substring search over origin and destination. |
| `sortBy` | `origin`, `destination`, or `status`; default `origin` | Server-side sort key. |
| `sortDirection` | `asc` or `desc`; default `asc` | Server-side sort direction. |

The result has the shape:

```json
{
	"data": [],
	"page": 1,
	"pageSize": 25,
	"total": 0,
	"totalPages": 0
}
```

Ordering includes stable tie-break fields so records do not move arbitrarily
between pages when primary sort values are equal. Rate sorting is not offered:
a physical route can have multiple contract-rate records, and a rate sort needs
an explicit business definition of which rate represents that route.

### Route write payloads and behavior

`POST /routes` requires `origin` and `destination` (2–120 characters). Pricing
is optional; when supplied, `contractId`, `rate`, and `activeFrom` are required
together. `contractId` must be a UUID, `rate` accepts up to two decimal places,
currency is a three-character string, and dates are ISO date strings. The
service rejects an existing physical route with the same origin/destination
and rejects `activeTo` earlier than `activeFrom`.

`PATCH /routes/:id` accepts optional `origin` and/or `destination`. Pricing is
intentionally a separate endpoint because its effective-date history has
different business rules. The UI currently calls both endpoints when editing
both route identity and pricing; this is not an atomic combined operation.

`PATCH /routes/:id/pricing` requires `contractId`, `rate`, and `activeFrom`,
with optional currency and `activeTo`.

`DELETE /routes/:id` changes status to `INACTIVE`. It is currently repeatable:
the service writes `INACTIVE` again if called for an already inactive route.
There is no reactivation endpoint.

Expected application errors include `400` for DTO/business validation, `404`
for missing route/contract records, and `409` for duplicate route/pricing
conflicts. Unexpected database errors are not currently mapped to a stable
application error contract.

## Other verified endpoints

- `GET /health`
- `POST`/`GET` for clients, assets, and drivers
- `GET`/`POST` for contracts, plus contract-route operations
- `GET`/`POST` for trips, plus trip-status updates
- Fuel endpoints in the Fuel module

The client, asset, driver, contract, and fuel list endpoints are not all
paginated yet. See their controllers and DTOs before relying on a particular
query or response shape. A dedicated `GET /routes/:id` endpoint does not
currently exist.

## Security status

No authentication guards, authorization policies, or tenant scoping are
implemented. CORS is not authentication. These controls are required before
the API is used as a multi-user or multi-tenant production service.

## Testing

API unit tests use Jest (`npm --workspace apps/api test`). Current route service
tests exercise selected service behavior; they are not HTTP integration or
browser E2E tests. The E2E test plan is documented separately.
