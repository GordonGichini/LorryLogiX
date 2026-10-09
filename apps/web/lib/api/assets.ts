import { apiFetch } from "./client";
import type { Asset, AssetStatus, PaginatedResponse } from "./types";

export type AssetListParams = {
  page?: number;
  pageSize?: number;
  status?: AssetStatus;
  search?: string;
};

export type AssetInput = Pick<Asset, "registration" | "description">;

export async function getAssets(
  params: AssetListParams = {},
): Promise<PaginatedResponse<Asset>> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined)
    query.set("pageSize", String(params.pageSize));
  if (params.status) query.set("status", params.status);
  if (params.search?.trim()) query.set("search", params.search.trim());
  return apiFetch<PaginatedResponse<Asset>>(
    `/assets${query.size ? `?${query.toString()}` : ""}`,
  );
}

export type AssetDetails = Asset & {
  _count: { trips: number; maintenance: number; documents: number };
};

export async function getAsset(id: string): Promise<AssetDetails> {
  return apiFetch<AssetDetails>(`/assets/${id}`);
}

export async function createAsset(payload: AssetInput): Promise<Asset> {
  return apiFetch<Asset>("/assets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAsset(
  id: string,
  payload: Partial<AssetInput>,
): Promise<Asset> {
  return apiFetch<Asset>(`/assets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deactivateAsset(id: string): Promise<Asset> {
  return apiFetch<Asset>(`/assets/${id}`, { method: "DELETE" });
}
