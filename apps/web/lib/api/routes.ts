import { apiFetch } from "./client";
import type { Route } from "./types";

export async function getRoutes(): Promise<Route[]> {
  return apiFetch<Route[]>("/routes");
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
  return apiFetch<Route>("/routes", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateRoute(id: string, payload: Pick<RoutePayload, "origin" | "destination">): Promise<Route> {
  return apiFetch<Route>(`/routes/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deactivateRoute(id: string): Promise<Route> {
  return apiFetch<Route>(`/routes/${id}`, { method: "DELETE" });
}

export async function updateRoutePricing(contractId: string, routePricingId: string, payload: Omit<RoutePayload, "origin" | "destination" | "contractId">): Promise<unknown> {
  return apiFetch(`/contracts/${contractId}/routes/${routePricingId}`, { method: "PATCH", body: JSON.stringify(payload) });
}
