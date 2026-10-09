"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createTrip, getTripRouteOptions } from "../lib/api/trips";
import type { TripRouteOption } from "../lib/api/trips";
import type { Asset, Driver } from "../lib/api/types";

type TripFormState = {
  contractRouteId: string;
  lorryId: string;
  driverId: string;
  tripDate: string;
  cargoDescription: string;
  cargoQuantity: string;
  cargoUnit: string;
  notes: string;
};

const initialForm: TripFormState = {
  contractRouteId: "",
  lorryId: "",
  driverId: "",
  tripDate: new Date().toISOString().slice(0, 10),
  cargoDescription: "",
  cargoQuantity: "",
  cargoUnit: "",
  notes: "",
};

export function TripCreateForm({
  assets,
  drivers,
}: {
  assets: Asset[];
  drivers: Driver[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [routeOptions, setRouteOptions] = useState<TripRouteOption[]>([]);
  const [loadingRouteOptions, setLoadingRouteOptions] = useState(false);
  const [routeOptionsError, setRouteOptionsError] = useState("");

  useEffect(() => {
    let active = true;
    setLoadingRouteOptions(true);
    setRouteOptionsError("");
    getTripRouteOptions(form.tripDate)
      .then((result) => {
        if (active) setRouteOptions(result.data);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setRouteOptionsError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load effective route pricing.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingRouteOptions(false);
      });
    return () => {
      active = false;
    };
  }, [form.tripDate]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await createTrip({
        contractRouteId: form.contractRouteId,
        lorryId: form.lorryId,
        ...(form.driverId ? { driverId: form.driverId } : {}),
        occurredAt: `${form.tripDate}T00:00:00.000Z`,
        cargoDescription: form.cargoDescription,
        ...(form.cargoQuantity ? { cargoQuantity: form.cargoQuantity } : {}),
        ...(form.cargoUnit ? { cargoUnit: form.cargoUnit } : {}),
        ...(form.notes ? { notes: form.notes } : {}),
      });
      setForm({ ...initialForm, tripDate: form.tripDate });
      setSuccess("Trip created.");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create trip.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="data-panel mb-5 grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
      <div className="sm:col-span-2 xl:col-span-3">
        <p className="eyebrow">Dispatch</p>
        <h2 className="mt-1 text-lg font-semibold text-[#1c2835]">Create trip</h2>
      </div>
      {error || routeOptionsError ? <div role="alert" className="sm:col-span-2 xl:col-span-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error || routeOptionsError}</div> : null}
      {success ? <div role="status" className="sm:col-span-2 xl:col-span-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{success}</div> : null}
      <label className="text-sm font-medium text-[#52606d]">
        Trip date
        <input required type="date" className="form-input" value={form.tripDate} onChange={(event) => setForm({ ...form, tripDate: event.target.value, contractRouteId: "" })} />
      </label>
      <label className="text-sm font-medium text-[#52606d]">
        Contract route
        <select required className="form-input" value={form.contractRouteId} onChange={(event) => setForm({ ...form, contractRouteId: event.target.value })}>
          <option value="">Select an effective route</option>
          {routeOptions.map(({ id, contract, route, rate, currency }) => (
            <option key={id} value={id}>
              {route.origin} → {route.destination} · {contract.reference} · {currency} {rate}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-[#52606d]">
        Lorry
        <select required className="form-input" value={form.lorryId} onChange={(event) => setForm({ ...form, lorryId: event.target.value })}>
          <option value="">Select an active lorry</option>
          {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.registration} · {asset.description}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium text-[#52606d]">
        Driver (optional)
        <select className="form-input" value={form.driverId} onChange={(event) => setForm({ ...form, driverId: event.target.value })}>
          <option value="">Unassigned</option>
          {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.fullName}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium text-[#52606d]">
        Cargo description
        <input required minLength={2} maxLength={500} className="form-input" value={form.cargoDescription} onChange={(event) => setForm({ ...form, cargoDescription: event.target.value })} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm font-medium text-[#52606d]">
          Quantity
          <input type="number" min="0.001" step="0.001" className="form-input" value={form.cargoQuantity} onChange={(event) => setForm({ ...form, cargoQuantity: event.target.value })} />
        </label>
        <label className="text-sm font-medium text-[#52606d]">
          Unit
          <input maxLength={30} className="form-input" value={form.cargoUnit} onChange={(event) => setForm({ ...form, cargoUnit: event.target.value })} />
        </label>
      </div>
      <div className="flex items-end justify-end xl:col-span-3">
        <button disabled={saving || loadingRouteOptions || routeOptions.length === 0 || assets.length === 0} className="rounded-md bg-[#172b42] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? "Creating..." : "Create trip"}
        </button>
      </div>
      {loadingRouteOptions ? (
        <p className="text-xs text-[#6c7782] sm:col-span-2 xl:col-span-3">Loading contract routes for this date...</p>
      ) : routeOptions.length === 0 || assets.length === 0 ? (
        <p className="text-xs text-[#6c7782] sm:col-span-2 xl:col-span-3">
          A trip requires an active lorry and a route pricing period effective on the selected date.
        </p>
      ) : null}
    </form>
  );
}
