import Link from "next/link";
import { getClients } from "../lib/api/clients";
import { getContracts } from "../lib/api/contracts";
import { getRoutes } from "../lib/api/routes";
import { getTrips } from "../lib/api/trips";

export default async function HomePage() {
  const [clients, contracts, routes, trips] = await Promise.all([
    getClients().catch(() => []),
    getContracts().catch(() => []),
    getRoutes().catch(() => []),
    getTrips({ page: 1, pageSize: 5 }).catch(() => ({ data: [], total: 0, page: 1, pageSize: 5, totalPages: 0 })),
  ]);

  const totalRevenue = trips.data.reduce((sum, trip) => sum + Number(trip.agreedRate || 0), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Operational overview</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">Today</span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">This week</span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">This month</span>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total trips" value={String(trips.total)} subtitle="Across active contracts" />
        <StatCard title="Clients" value={String(clients.length)} subtitle="Active relationships" />
        <StatCard title="Contracts" value={String(contracts.length)} subtitle="Commercial agreements" />
        <StatCard title="Routes" value={String(routes.length)} subtitle="Operational corridors" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Revenue snapshot</h3>
            <span className="text-sm text-slate-500">KES</span>
          </div>
          <div className="text-3xl font-semibold text-slate-900">KES {Number(totalRevenue).toLocaleString()}</div>
          <p className="mt-2 text-sm text-slate-600">Based on the most recent trip rate snapshots returned by the API.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Commercial context</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li><strong className="text-slate-900">Current client:</strong> Nevila</li>
            <li><strong className="text-slate-900">Origin:</strong> Kumpar warehouse</li>
            <li><strong className="text-slate-900">Cargo:</strong> Lime mineral</li>
            <li><strong className="text-slate-900">Routes:</strong> Thika / Ngong / Industrial Area</li>
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent trips</h3>
          <Link href="/trips" className="text-sm font-medium text-sky-700 hover:text-sky-800">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="py-2 pr-4 font-medium">Trip</th>
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Route</th>
                <th className="py-2 pr-4 font-medium">Rate</th>
                <th className="py-2 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {trips.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-slate-500">No trips found.</td>
                </tr>
              ) : (
                trips.data.map((trip) => (
                  <tr key={trip.id} className="text-slate-700">
                    <td className="py-3 pr-4 font-medium text-slate-900">{trip.id.slice(0, 8)}</td>
                    <td className="py-3 pr-4">{new Date(trip.occurredAt).toLocaleDateString()}</td>
                    <td className="py-3 pr-4">{trip.contractRoute?.route.origin} → {trip.contractRoute?.route.destination}</td>
                    <td className="py-3 pr-4">KES {Number(trip.agreedRate).toLocaleString()}</td>
                    <td className="py-3 pr-4"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{trip.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
