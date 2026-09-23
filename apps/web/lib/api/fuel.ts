import { apiFetch } from "./client";
import type { FuelObligation } from "./types";

export async function getFuelObligations(): Promise<FuelObligation[]> {
  return apiFetch<FuelObligation[]>("/fuel/obligations");
}
