import { apiFetch } from "./client";
import type { Client, PaginatedResponse, Route, Trip } from "./types";

export interface TripRouteOption {
  id: string;
  contractId: string;
  routeId: string;
  rate: string;
  currency: string;
  activeFrom: string;
  activeTo?: string | null;
  route: Route;
  contract: {
    id: string;
    reference: string;
    client: Client;
  };
}

export async function getTripRouteOptions(
  activeOn: string,
): Promise<PaginatedResponse<TripRouteOption>> {
  const query = new URLSearchParams({ activeOn, page: "1", pageSize: "100" });
  return apiFetch<PaginatedResponse<TripRouteOption>>(
    `/contracts/routes?${query.toString()}`,
  );
}

export async function getTrips(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<PaginatedResponse<Trip>> {
  const search = new URLSearchParams();

  if (params?.page) search.set("page", String(params.page));
  if (params?.pageSize) search.set("pageSize", String(params.pageSize));
  if (params?.status) search.set("status", params.status);

  const query = search.toString();
  return apiFetch<PaginatedResponse<Trip>>(`/trips${query ? `?${query}` : ""}`);
}

export type CreateTripInput = Pick<
  Trip,
  "contractRouteId" | "lorryId" | "occurredAt" | "cargoDescription"
> &
  Partial<Pick<Trip, "driverId" | "cargoQuantity" | "cargoUnit" | "notes">>;

export async function createTrip(payload: CreateTripInput): Promise<Trip> {
  return apiFetch<Trip>("/trips", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
