import { apiFetch } from "./client";
import type { Route } from "./types";

export async function getRoutes(): Promise<Route[]> {
  return apiFetch<Route[]>("/routes");
}
