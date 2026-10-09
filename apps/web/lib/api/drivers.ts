import { apiFetch } from "./client";
import type { Driver, PaginatedResponse, RecordStatus } from "./types";

export type DriverListParams = {
  page?: number;
  pageSize?: number;
  status?: RecordStatus;
  search?: string;
};

export type DriverInput = Pick<Driver, "fullName"> & {
  phoneNumber?: string | null;
};

export async function getDrivers(
  params: DriverListParams = {},
): Promise<PaginatedResponse<Driver>> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined)
    query.set("pageSize", String(params.pageSize));
  if (params.status) query.set("status", params.status);
  if (params.search?.trim()) query.set("search", params.search.trim());
  return apiFetch<PaginatedResponse<Driver>>(
    `/drivers${query.size ? `?${query.toString()}` : ""}`,
  );
}

export type DriverDetails = Driver & { _count: { trips: number } };

export async function getDriver(id: string): Promise<DriverDetails> {
  return apiFetch<DriverDetails>(`/drivers/${id}`);
}

export async function createDriver(payload: DriverInput): Promise<Driver> {
  return apiFetch<Driver>("/drivers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDriver(
  id: string,
  payload: Partial<DriverInput>,
): Promise<Driver> {
  return apiFetch<Driver>(`/drivers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deactivateDriver(id: string): Promise<Driver> {
  return apiFetch<Driver>(`/drivers/${id}`, { method: "DELETE" });
}
