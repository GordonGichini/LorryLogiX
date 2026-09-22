import { apiFetch } from "./client";
import type { PaginatedResponse, Trip } from "./types";

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
