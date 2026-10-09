import { apiFetch } from "./client";
import type { PaginatedResponse, Route } from "./types";

export type RouteListParams = {
  page?: number;
  pageSize?: number;
  status?: "ACTIVE" | "INACTIVE" | "ALL";
  search?: string;
  sortBy?: "origin" | "destination" | "status";
  sortDirection?: "asc" | "desc";
};

export async function getRoutes(
  params: RouteListParams = {},
): Promise<PaginatedResponse<Route>> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined)
    query.set("pageSize", String(params.pageSize));
  if (params.status && params.status !== "ALL") query.set("status", params.status);
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortDirection)
    query.set("sortDirection", params.sortDirection);

  return apiFetch<PaginatedResponse<Route>>(
    `/routes${query.toString() ? `?${query.toString()}` : ""}`,
  );
}

export type RoutePayload = {
  origin: string;
  destination: string;
  contractId?: string;
  rate?: string;
  currency?: string;
  activeFrom?: string;
  activeTo?: string;
};

export async function createRoute(payload: RoutePayload): Promise<Route> {
  return apiFetch<Route>("/routes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRoute(
  id: string,
  payload: Pick<RoutePayload, "origin" | "destination">,
): Promise<Route> {
  return apiFetch<Route>(`/routes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deactivateRoute(id: string): Promise<Route> {
  return apiFetch<Route>(`/routes/${id}`, { method: "DELETE" });
}

export async function updateRoutePricing(
  routeId: string,
  payload: Required<Pick<RoutePayload, "contractId" | "rate" | "activeFrom">> &
    Pick<RoutePayload, "currency" | "activeTo">,
): Promise<unknown> {
  return apiFetch(`/routes/${routeId}/pricing`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
