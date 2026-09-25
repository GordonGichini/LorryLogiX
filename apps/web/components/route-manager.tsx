"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Pencil, Plus, Search, X } from "lucide-react";
import { createRoute, deactivateRoute, getRoutes, updateRoute, updateRoutePricing } from "../lib/api/routes";
import type { Contract, Route, RoutePricing } from "../lib/api/types";

type FormState = {
  origin: string;
  destination: string;
  contractId: string;
  rate: string;
  currency: string;
  activeFrom: string;
  activeTo: string;
};

const emptyForm: FormState = { origin: "", destination: "", contractId: "", rate: "", currency: "KES", activeFrom: "", activeTo: "" };

export function RouteManager({ initialRoutes, contracts }: { initialRoutes: Route[]; contracts: Contract[] }) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Route | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Route | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState<string | null>(null);

  const visibleRoutes = useMemo(() => routes.filter((route) => `${route.origin} ${route.destination}`.toLowerCase().includes(query.toLowerCase())), [routes, query]);

  function openCreate() {
    setAdding(true);
    setEditing(null);
    setSelected(null);
    setForm(emptyForm);
    setError("");
  }

  function openEdit(route: Route) {
    const pricing = route.contracts?.[0];
    setAdding(false);
    setEditing(route);
    setSelected(null);
    setForm({ origin: route.origin, destination: route.destination, contractId: pricing?.contractId ?? "", rate: pricing?.rate ?? "", currency: pricing?.currency ?? "KES", activeFrom: pricing?.activeFrom?.slice(0, 10) ?? "", activeTo: pricing?.activeTo?.slice(0, 10) ?? "" });
    setError("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const pricingFields = [form.contractId, form.rate, form.activeFrom, form.activeTo].filter(Boolean).length;
      if (!editing && pricingFields > 0 && (!form.contractId || !form.rate || !form.activeFrom)) {
        throw new Error("Choose a contract, rate, and effective-from date to save route pricing.");
      }
      if (editing) {
        await updateRoute(editing.id, { origin: form.origin, destination: form.destination });
        const pricing = editing.contracts?.[0];
        if (pricing && form.rate && form.activeFrom) await updateRoutePricing(pricing.contractId, pricing.id, { rate: form.rate, currency: form.currency, activeFrom: form.activeFrom, ...(form.activeTo ? { activeTo: form.activeTo } : {}) });
      } else {
        await createRoute({ origin: form.origin, destination: form.destination, ...(form.contractId && form.rate && form.activeFrom ? { contractId: form.contractId, rate: form.rate, currency: form.currency, activeFrom: form.activeFrom, ...(form.activeTo ? { activeTo: form.activeTo } : {}) } : {}) });
      }
      setRoutes(await getRoutes());
      setAdding(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The route could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(route: Route) {
    if (!window.confirm(`Deactivate ${route.origin} to ${route.destination}? It will remain in history but stop being active.`)) return;
    setDeactivating(route.id);
    setError("");
    try {
      await deactivateRoute(route.id);
      setRoutes(await getRoutes());
    } catch (deactivateError) {
      setError(deactivateError instanceof Error ? deactivateError.message : "The route could not be deactivated.");
    } finally {
      setDeactivating(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-[#d1d9e0] bg-[#f5f7f8] px-3 py-2 text-sm text-[#6c7782] sm:w-80"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search routes" className="w-full bg-transparent outline-none placeholder:text-[#8b97a2]" /></div>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#172b42] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#27415e]"><Plus size={16} /> Add route</button>
      </div>
      {error ? <div role="alert" className="rounded-lg border border-[#d0baba] bg-[#f3e8e7] px-4 py-3 text-sm text-[#795b5a]">{error}</div> : null}
      {adding || editing ? <RouteForm form={form} setForm={setForm} contracts={contracts} saving={saving} onSubmit={save} onCancel={() => { setAdding(false); setEditing(null); setForm(emptyForm); }} /> : null}
      <div className="data-panel">
        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr><th className="px-4 py-3 font-medium">Origin</th><th className="px-4 py-3 font-medium">Destination</th><th className="px-4 py-3 font-medium">Client / contract</th><th className="px-4 py-3 font-medium">Rate</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead><tbody className="divide-y divide-[#dce2e7]">
          {visibleRoutes.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-[#6c7782]">No routes found.</td></tr> : visibleRoutes.map((route) => { const pricing = route.contracts?.[0]; return <tr key={route.id}><td className="px-4 py-3 font-medium text-[#1c2835]">{route.origin}</td><td className="px-4 py-3 text-[#607080]">{route.destination}</td><td className="px-4 py-3 text-[#607080]">{pricing ? `${pricing.contract.client.name} · ${pricing.contract.reference}` : "No pricing context"}</td><td className="px-4 py-3 text-[#607080]">{pricing ? `${pricing.currency} ${Number(pricing.rate).toLocaleString()}` : "—"}</td><td className="px-4 py-3"><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelected(route)} className="inline-flex items-center gap-1 rounded-md border border-[#d1d9e0] px-2.5 py-1.5 text-xs font-semibold text-[#526b84] hover:bg-[#edf1f4]">View <ArrowUpRight size={13} /></button><button type="button" onClick={() => openEdit(route)} className="inline-flex items-center gap-1 rounded-md border border-[#d1d9e0] px-2.5 py-1.5 text-xs font-semibold text-[#526b84] hover:bg-[#edf1f4]"><Pencil size={13} /> Edit</button><button type="button" disabled={deactivating === route.id || route.status === "INACTIVE"} onClick={() => deactivate(route)} className="rounded-md border border-[#d0baba] px-2.5 py-1.5 text-xs font-semibold text-[#795b5a] disabled:cursor-not-allowed disabled:opacity-50">{route.status === "INACTIVE" ? "Inactive" : deactivating === route.id ? "Deactivating..." : "Deactivate"}</button></div></td></tr>; })}
        </tbody></table></div>
      </div>
      {selected ? <RouteDetails route={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

function RouteForm({ form, setForm, contracts, saving, onSubmit, onCancel }: { form: FormState; setForm: (form: FormState) => void; contracts: Contract[]; saving: boolean; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  const field = (name: keyof FormState) => ({ value: form[name], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [name]: event.target.value }) });
  return <form onSubmit={onSubmit} className="data-panel grid gap-4 p-5 sm:grid-cols-2"><div className="sm:col-span-2 flex items-center justify-between"><div><p className="eyebrow">Route setup</p><h3 className="mt-1 text-lg font-semibold text-[#1c2835]">Commercial route</h3></div><button type="button" onClick={onCancel} aria-label="Cancel route edit" className="text-[#6c7782] hover:text-[#172b42]"><X size={18} /></button></div><label className="text-sm font-medium text-[#52606d]">Origin<input required {...field("origin")} className="form-input" placeholder="Kumpar" /></label><label className="text-sm font-medium text-[#52606d]">Destination<input required {...field("destination")} className="form-input" placeholder="Kariobangi" /></label><label className="text-sm font-medium text-[#52606d]">Client / contract<select {...field("contractId")} className="form-input"><option value="">Physical route only</option>{contracts.map((contract) => <option key={contract.id} value={contract.id}>{contract.client.name} · {contract.reference}</option>)}</select></label><label className="text-sm font-medium text-[#52606d]">Rate<input type="text" inputMode="decimal" {...field("rate")} className="form-input" placeholder="19000" /></label><label className="text-sm font-medium text-[#52606d]">Currency<input maxLength={3} {...field("currency")} className="form-input" /></label><label className="text-sm font-medium text-[#52606d]">Effective from<input type="date" {...field("activeFrom")} className="form-input" /></label><label className="text-sm font-medium text-[#52606d]">Effective to<input type="date" {...field("activeTo")} className="form-input" /></label><div className="flex items-end justify-end gap-2 sm:col-span-2"><button type="button" onClick={onCancel} className="rounded-lg border border-[#d1d9e0] px-4 py-2 text-sm font-semibold text-[#607080]">Cancel</button><button disabled={saving} className="rounded-lg bg-[#172b42] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save route"}</button></div></form>;
}

function RouteDetails({ route, onClose }: { route: Route; onClose: () => void }) {
  return <div className="fixed inset-0 z-10 grid place-items-center bg-[#172b42]/35 p-4"><div className="data-panel w-full max-w-lg p-6"><div className="flex items-start justify-between"><div><p className="eyebrow">Route details</p><h3 className="mt-2 text-2xl font-semibold text-[#1c2835]">{route.origin} → {route.destination}</h3></div><button type="button" onClick={onClose} aria-label="Close route details" className="text-[#6c7782]"><X size={18} /></button></div><div className="mt-6 space-y-3 text-sm">{route.contracts?.length ? route.contracts.map((pricing: RoutePricing) => <div key={pricing.id} className="rounded-lg border border-[#dce2e7] bg-[#edf1f4] p-4"><div className="font-semibold text-[#1c2835]">{pricing.contract.client.name}</div><div className="mt-1 text-[#607080]">{pricing.contract.reference} · {pricing.currency} {Number(pricing.rate).toLocaleString()} / trip</div><div className="mt-1 text-xs text-[#7d8994]">Effective {new Date(pricing.activeFrom).toLocaleDateString()}{pricing.activeTo ? ` to ${new Date(pricing.activeTo).toLocaleDateString()}` : " onward"}</div></div>) : <p className="text-[#6c7782]">No contract-specific pricing is attached.</p>}</div><button type="button" onClick={onClose} className="mt-6 rounded-lg bg-[#172b42] px-4 py-2 text-sm font-semibold text-white">Close</button></div></div>;
}