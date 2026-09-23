import { PageHeader } from "../../components/page-header";
import { getRoutes } from "../../lib/api/routes";

export default async function RoutesPage() {
  const routes = await getRoutes().catch(() => []);

  return (
    <div>
      <PageHeader title="Routes" description="Physical route context separate from contract pricing." />
      <div className="data-panel">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Origin</th>
                <th className="px-4 py-3 font-medium">Destination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {routes.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-slate-500">No routes found.</td>
                </tr>
              ) : (
                routes.map((route) => (
                  <tr key={route.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{route.origin}</td>
                    <td className="px-4 py-3">{route.destination}</td>
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
