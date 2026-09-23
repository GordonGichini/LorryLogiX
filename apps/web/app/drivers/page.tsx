import { PageHeader } from "../../components/page-header";
import { getDrivers } from "../../lib/api/drivers";

export default async function DriversPage() {
  const drivers = await getDrivers().catch(() => []);

  return (
    <div>
      <PageHeader title="Drivers" description="Operational driving team and assignment status." />
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-slate-500">No drivers found.</td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{driver.fullName}</td>
                    <td className="px-4 py-3">{driver.phoneNumber ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">{driver.status}</span>
                    </td>
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
