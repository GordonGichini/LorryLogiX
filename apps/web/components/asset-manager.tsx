"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Search, X } from "lucide-react";
import {
  createAsset,
  deactivateAsset,
  getAsset,
  getAssets,
  updateAsset,
} from "../lib/api/assets";
import type { Asset, AssetStatus, PaginatedResponse } from "../lib/api/types";

const PAGE_SIZE = 25;
type AssetDetails = Asset & {
  _count: { trips: number; maintenance: number; documents: number };
};
type AssetForm = { registration: string; description: string };
const emptyForm: AssetForm = { registration: "", description: "" };

export function AssetManager({ initialPage }: { initialPage: PaginatedResponse<Asset> }) {
  const [result, setResult] = useState(initialPage);
  const [page, setPage] = useState(initialPage.page);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AssetStatus | "ALL">("ALL");
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState<AssetForm>(emptyForm);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [details, setDetails] = useState<AssetDetails | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await getAssets({
          page,
          pageSize: PAGE_SIZE,
          status: status === "ALL" ? undefined : status,
          search,
        });
        if (!active) return;
        if (response.totalPages > 0 && page > response.totalPages) {
          setPage(response.totalPages);
        } else {
          setResult(response);
          setError("");
        }
      } catch (loadError) {
        if (active)
          setError(loadError instanceof Error ? loadError.message : "Could not load lorries.");
      } finally {
        if (active) setLoading(false);
      }
    }, search ? 250 : 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [page, refresh, search, status]);

  function beginEdit(asset: Asset) {
    setEditing(asset);
    setForm({ registration: asset.registration, description: asset.description });
    setError("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) await updateAsset(editing.id, form);
      else await createAsset(form);
      setEditing(null);
      setForm(emptyForm);
      setPage(1);
      setRefresh((version) => version + 1);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save lorry.");
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(asset: Asset) {
    if (!window.confirm(`Deactivate lorry ${asset.registration}? Existing trips will remain in history.`)) return;
    try {
      await deactivateAsset(asset.id);
      setRefresh((version) => version + 1);
    } catch (deactivateError) {
      setError(deactivateError instanceof Error ? deactivateError.message : "Could not deactivate lorry.");
    }
  }

  async function showDetails(asset: Asset) {
    try {
      setDetails(await getAsset(asset.id));
      setError("");
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "Could not load lorry details.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border border-[#d1d9e0] bg-white px-3 py-2 text-sm">
          <Search size={15} />
          <input className="w-full bg-transparent outline-none" value={search} placeholder="Search registration or description" onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </label>
        <select className="form-input !mt-0 !w-auto" value={status} onChange={(event) => { setStatus(event.target.value as AssetStatus | "ALL"); setPage(1); }}>
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="UNDER_MAINTENANCE">Under maintenance</option>
        </select>
        <button type="button" className="inline-flex items-center gap-2 rounded-md bg-[#172b42] px-4 py-2 text-sm font-semibold text-white" onClick={() => { setEditing(null); setForm(emptyForm); setError(""); }}>
          <Plus size={16} /> Add lorry
        </button>
      </div>

      {error ? <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}

      <form onSubmit={save} className="data-panel grid gap-3 p-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Registration<input required minLength={2} maxLength={40} className="form-input" value={form.registration} onChange={(event) => setForm({ ...form, registration: event.target.value })} /></label>
        <label className="text-sm font-medium">Description<input required minLength={2} maxLength={200} className="form-input" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <div className="flex justify-end gap-2 sm:col-span-2">
          {editing ? <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel edit</button> : null}
          <button disabled={saving} className="rounded-md bg-[#172b42] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : editing ? "Save changes" : "Create lorry"}</button>
        </div>
      </form>

      <div className="data-panel overflow-x-auto" aria-busy={loading}>
        <table className="min-w-full text-left text-sm">
          <thead><tr><th className="px-4 py-3">Registration</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-[#dce2e7]">
            {result.data.length === 0 ? <tr><td colSpan={4} className="px-4 py-7 text-center text-[#6c7782]">{loading ? "Loading lorries..." : "No lorries found."}</td></tr> : result.data.map((asset) => (
              <tr key={asset.id}>
                <td className="px-4 py-3 font-medium">{asset.registration}</td><td className="px-4 py-3">{asset.description}</td><td className="px-4 py-3">{asset.status.replaceAll("_", " ")}</td>
                <td className="px-4 py-3"><div className="flex justify-end gap-2">
                  <button type="button" className="rounded border px-2 py-1" onClick={() => void showDetails(asset)}>Details</button>
                  <button type="button" className="inline-flex items-center gap-1 rounded border px-2 py-1" onClick={() => beginEdit(asset)}><Pencil size={13} /> Edit</button>
                  <button type="button" disabled={asset.status === "INACTIVE"} className="rounded border border-red-200 px-2 py-1 text-red-800 disabled:opacity-50" onClick={() => void deactivate(asset)}>Deactivate</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <footer className="flex items-center justify-between border-t px-4 py-3 text-sm text-[#607080]">
          <span>{loading ? "Loading..." : `${result.total} lorries · page ${result.page} of ${Math.max(result.totalPages, 1)}`}</span>
          <div className="flex gap-2">
            <button disabled={loading || page <= 1} className="rounded border px-3 py-1.5 disabled:opacity-50" onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
            <button disabled={loading || page >= result.totalPages} className="rounded border px-3 py-1.5 disabled:opacity-50" onClick={() => setPage((current) => current + 1)}>Next</button>
          </div>
        </footer>
      </div>

      {details ? <div className="fixed inset-0 z-20 grid place-items-center bg-black/30 p-4"><section role="dialog" aria-modal="true" className="data-panel w-full max-w-md p-5"><header className="flex justify-between"><h2 className="text-lg font-semibold">Lorry details</h2><button aria-label="Close" onClick={() => setDetails(null)}><X size={18} /></button></header><p className="mt-4">{details.registration} · {details.description}</p><p className="mt-2 text-sm text-[#607080]">{details._count.trips} trips · {details._count.maintenance} maintenance records · {details._count.documents} documents</p></section></div> : null}
    </div>
  );
}
