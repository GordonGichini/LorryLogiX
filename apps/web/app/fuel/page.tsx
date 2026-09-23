import { PageHeader } from "../../components/page-header";
import { getFuelObligations } from "../../lib/api/fuel";

export default async function FuelPage() {
  const obligations = await getFuelObligations().catch(() => []);

  return (
    <div>
      <PageHeader title="Fuel obligations" description="Outstanding fuel responsibility and settlement state." />
      <div className="data-panel">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Responsible party</th>
                <th className="px-4 py-3 font-medium">Original</th>
                <th className="px-4 py-3 font-medium">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {obligations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-slate-500">No fuel obligations found.</td>
                </tr>
              ) : (
                obligations.map((obligation) => {
                  const outstanding = Number(obligation.amount) - Number(obligation.settledAmount);
                  return (
                    <tr key={obligation.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{new Date(obligation.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">{obligation.status}</span>
                      </td>
                      <td className="px-4 py-3">{obligation.responsibleParty}</td>
                      <td className="px-4 py-3">KES {Number(obligation.amount).toLocaleString()}</td>
                      <td className="px-4 py-3">KES {outstanding.toLocaleString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
