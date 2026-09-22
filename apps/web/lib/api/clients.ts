import { apiFetch } from "./client";
import type { Client } from "./types";

export async function getClients(): Promise<Client[]> {
  return apiFetch<Client[]>("/clients");
}
