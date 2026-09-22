import { apiFetch } from "./client";
import type { Contract } from "./types";

export async function getContracts(): Promise<Contract[]> {
  return apiFetch<Contract[]>("/contracts");
}
