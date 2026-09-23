import { apiFetch } from "./client";
import type { Asset } from "./types";

export async function getAssets(): Promise<Asset[]> {
  return apiFetch<Asset[]>("/assets");
}
