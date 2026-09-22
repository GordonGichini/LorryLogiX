import { PageHeader } from "../../components/page-header";
import { getTrips } from "../../lib/api/trips";

export default async function TripsPage() {
  const trips = await getTrips({ page: 1, pageSize: 20 }).catch(() => ({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }));

  return (
    <div>
      <PageHeader title="Trips" description="Operational trip list with the historical agreed rate snapshot." />
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Trip</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Lorry</th>
                <th className="px-4 py-3 font-medium">Rate</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {trips.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-slate-500">No trips found.</td>
                </tr>
              ) : (
                trips.data.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{trip.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">{new Date(trip.occurredAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{trip.contractRoute?.route.origin} → {trip.contractRoute?.route.destination}</td>
                    <td className="px-4 py-3">Nevila</td>
                    <td className="px-4 py-3">{trip.lorry?.registration ?? "—"}</td>
                    <td className="px-4 py-3">KES {Number(trip.agreedRate).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{trip.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
