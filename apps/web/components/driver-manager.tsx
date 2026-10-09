"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Search, X } from "lucide-react";
import {
  createDriver,
  deactivateDriver,
  getDriver,
  getDrivers,
  updateDriver,
} from "../lib/api/drivers";
import type { Driver, PaginatedResponse, RecordStatus } from "../lib/api/types";

const PAGE_SIZE = 25;
type DriverDetails = Driver & { _count: { trips: number } };
type DriverForm = { fullName: string; phoneNumber: string };
const emptyForm: DriverForm = { fullName: "", phoneNumber: "" };

export function DriverManager({ initialPage }: { initialPage: PaginatedResponse<Driver> }) {
  const [result, setResult] = useState(initialPage);
  const [page, setPage] = useState(initialPage.page);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RecordStatus | "ALL">("ALL");
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState<DriverForm>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [details, setDetails] = useState<DriverDetails | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await getDrivers({
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
          setError(loadError instanceof Error ? loadError.message : "Could not load drivers.");
      } finally {
        if (active) setLoading(false);
      }
    }, search ? 250 : 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [page, refresh, search, status]);

  async function beginEdit(driver: Driver) {
    setEditing(driver);
    setFormOpen(true);
    setForm({ fullName: driver.fullName, phoneNumber: "" });
    setError("");
    try {
      const detail = await getDriver(driver.id);
      setForm({
        fullName: detail.fullName,
        phoneNumber: detail.phoneNumber ?? "",
      });
    } catch (detailError) {
      setError(
        detailError instanceof Error
          ? detailError.message
          : "Could not load driver contact details.",
      );
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = editing
      ? { fullName: form.fullName, phoneNumber: form.phoneNumber.trim() || null }
      : {
          fullName: form.fullName,
          ...(form.phoneNumber.trim()
            ? { phoneNumber: form.phoneNumber.trim() }
            : {}),
        };
    try {
      if (editing) await updateDriver(editing.id, payload);
      else await createDriver(payload);
      setEditing(null);
      setFormOpen(false);
      setForm(emptyForm);
      setPage(1);
      setRefresh((version) => version + 1);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save driver.");
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(driver: Driver) {
    if (!window.confirm(`Deactivate ${driver.fullName}? Existing trips will retain their driver relationship.`)) return;
    try {
      await deactivateDriver(driver.id);
      setRefresh((version) => version + 1);
    } catch (deactivateError) {
      setError(deactivateError instanceof Error ? deactivateError.message : "Could not deactivate driver.");
    }
  }

  async function showDetails(driver: Driver) {
    try {
      setDetails(await getDriver(driver.id));
      setError("");
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "Could not load driver details.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border border-[#d1d9e0] bg-white px-3 py-2 text-sm">
          <Search size={15} />
          <input className="w-full bg-transparent outline-none" value={search} placeholder="Search driver name" onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </label>
        <select className="form-input !mt-0 !w-auto" value={status} onChange={(event) => { setStatus(event.target.value as RecordStatus | "ALL"); setPage(1); }}>
          <option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
        </select>
        <button type="button" className="inline-flex items-center gap-2 rounded-md bg-[#172b42] px-4 py-2 text-sm font-semibold text-white" onClick={() => { setEditing(null); setForm(emptyForm); setFormOpen(true); setError(""); }}><Plus size={16} /> Add driver</button>
      </div>

      {error ? <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}

      {formOpen ? <form onSubmit={save} className="data-panel grid gap-3 p-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Full name<input required minLength={2} maxLength={120} className="form-input" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label>
        <label className="text-sm font-medium">Phone number (optional)<input type="tel" minLength={7} maxLength={20} pattern="\+?[0-9 -]{7,20}" className="form-input" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} /></label>
        <p className="text-xs text-[#6c7782] sm:col-span-2">Phone numbers are personal information. Access controls are not yet implemented; use synthetic data during development.</p>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={() => { setEditing(null); setForm(emptyForm); setFormOpen(false); }}>Cancel</button>
          <button disabled={saving} className="rounded-md bg-[#172b42] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : editing ? "Save changes" : "Create driver"}</button>
        </div>
      </form> : null}

      <div className="data-panel overflow-x-auto" aria-busy={loading}>
        <table className="min-w-full text-left text-sm">
          <thead><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-[#dce2e7]">
            {result.data.length === 0 ? <tr><td colSpan={3} className="px-4 py-7 text-center text-[#6c7782]">{loading ? "Loading drivers..." : "No drivers found."}</td></tr> : result.data.map((driver) => (
              <tr key={driver.id}>
                <td className="px-4 py-3 font-medium">{driver.fullName}</td><td className="px-4 py-3">{driver.status}</td>
                <td className="px-4 py-3"><div className="flex justify-end gap-2">
                  <button type="button" className="rounded border px-2 py-1" onClick={() => void showDetails(driver)}>Details</button>
                  <button type="button" className="inline-flex items-center gap-1 rounded border px-2 py-1" onClick={() => void beginEdit(driver)}><Pencil size={13} /> Edit</button>
                  <button type="button" disabled={driver.status === "INACTIVE"} className="rounded border border-red-200 px-2 py-1 text-red-800 disabled:opacity-50" onClick={() => void deactivate(driver)}>Deactivate</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <footer className="flex items-center justify-between border-t px-4 py-3 text-sm text-[#607080]">
          <span>{loading ? "Loading..." : `${result.total} drivers · page ${result.page} of ${Math.max(result.totalPages, 1)}`}</span>
          <div className="flex gap-2">
            <button disabled={loading || page <= 1} className="rounded border px-3 py-1.5 disabled:opacity-50" onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
            <button disabled={loading || page >= result.totalPages} className="rounded border px-3 py-1.5 disabled:opacity-50" onClick={() => setPage((current) => current + 1)}>Next</button>
          </div>
        </footer>
      </div>

      {details ? <div className="fixed inset-0 z-20 grid place-items-center bg-black/30 p-4"><section role="dialog" aria-modal="true" className="data-panel w-full max-w-md p-5"><header className="flex justify-between"><h2 className="text-lg font-semibold">Driver details</h2><button aria-label="Close" onClick={() => setDetails(null)}><X size={18} /></button></header><p className="mt-4">{details.fullName}</p><p className="mt-2 text-sm">Phone: {details.phoneNumber ?? "Not recorded"}</p><p className="mt-2 text-sm text-[#607080]">{details._count.trips} historical trips</p></section></div> : null}
    </div>
  );
}
