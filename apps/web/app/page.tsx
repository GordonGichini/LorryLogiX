import Link from "next/link";
import { ArrowUpRight, Fuel, Route, Truck, UsersRound } from "lucide-react";
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
    <div className="space-y-7">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Thursday, 24 September 2026</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-[#292b27]">Good morning, Nevila.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#777970]">A quiet view of the fleet, the commercial book, and what needs attention next.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#65685f]">
          <span className="rounded-lg border border-[#b9cbd9] bg-[#d8e3ec] px-3 py-2 text-[#36536c]">Today</span>
          <span className="rounded-lg border border-[#d1d9e0] bg-[#f5f7f8] px-3 py-2">This week</span>
          <span className="rounded-lg border border-[#d1d9e0] bg-[#f5f7f8] px-3 py-2">This month</span>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ArrowUpRight} title="Total trips" value={String(trips.total)} subtitle="Across active contracts" />
        <StatCard icon={UsersRound} title="Clients" value={String(clients.length)} subtitle="Active relationships" />
        <StatCard icon={Truck} title="Contracts" value={String(contracts.length)} subtitle="Commercial agreements" />
        <StatCard icon={Route} title="Routes" value={String(routes.length)} subtitle="Operational corridors" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="data-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="eyebrow">Commercial pulse</p><h3 className="mt-2 text-lg font-semibold text-[#1c2835]">Revenue snapshot</h3></div>
            <Fuel size={19} className="text-[#5c7894]" />
          </div>
          <div className="text-4xl font-semibold tracking-[-0.05em] text-[#1c2835]">KES {Number(totalRevenue).toLocaleString()}</div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#dce2e7]"><div className="h-full w-[68%] rounded-full bg-[#5c7894]" /></div>
          <p className="mt-3 text-sm text-[#6c7782]">Based on the most recent trip rate snapshots returned by the API.</p>
        </div>

        <div className="data-panel p-6">
          <p className="eyebrow">Current lane</p>
          <h3 className="mt-2 text-lg font-semibold text-[#1c2835]">Commercial context</h3>
          <ul className="mt-5 space-y-3 text-sm text-[#607080]">
            <li className="flex justify-between gap-4 border-b border-[#dce2e7] pb-3"><strong className="font-medium text-[#1c2835]">Client</strong> Nevila</li>
            <li className="flex justify-between gap-4 border-b border-[#dce2e7] pb-3"><strong className="font-medium text-[#1c2835]">Origin</strong> Kumpar warehouse</li>
            <li className="flex justify-between gap-4 border-b border-[#dce2e7] pb-3"><strong className="font-medium text-[#1c2835]">Cargo</strong> Lime mineral</li>
            <li className="flex justify-between gap-4"><strong className="font-medium text-[#1c2835]">Routes</strong> Thika / Ngong / Industrial Area</li>
          </ul>
        </div>
      </section>

      <section className="data-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <div><p className="eyebrow">Live activity</p><h3 className="mt-2 text-lg font-semibold text-[#292b27]">Recent trips</h3></div>
          <Link href="/trips" className="flex items-center gap-1 text-sm font-semibold text-[#5c7894] hover:text-[#27415e]">View all <ArrowUpRight size={15} /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e1e0d8] text-left text-sm">
            <thead className="text-[#777970]">
              <tr>
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
                    <td className="py-3 pr-4 font-medium text-[#292b27]">{trip.id.slice(0, 8)}</td>
                    <td className="py-3 pr-4 text-[#65685f]">{new Date(trip.occurredAt).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 text-[#65685f]">{trip.contractRoute?.route.origin} → {trip.contractRoute?.route.destination}</td>
                    <td className="py-3 pr-4 text-[#65685f]">KES {Number(trip.agreedRate).toLocaleString()}</td>
                    <td className="py-3 pr-4"><span className="rounded-full bg-[#dfe2d9] px-2 py-1 text-xs font-semibold text-[#5e6955]">{trip.status}</span></td>
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

function StatCard({ icon: Icon, title, value, subtitle }: { icon: typeof ArrowUpRight; title: string; value: string; subtitle: string }) {
  return (
    <div className="data-panel p-5">
      <div className="flex items-center justify-between"><p className="text-sm font-medium text-[#777970]">{title}</p><Icon size={18} className="text-[#8d9581]" /></div>
      <div className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#292b27]">{value}</div>
      <p className="mt-1 text-sm text-[#777970]">{subtitle}</p>
    </div>
  );
}
