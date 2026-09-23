import { apiFetch } from "./client";
import type { Driver } from "./types";

export async function getDrivers(): Promise<Driver[]> {
  return apiFetch<Driver[]>("/drivers");
}
