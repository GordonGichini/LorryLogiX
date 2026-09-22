import { PageHeader } from "../../components/page-header";
import { getContracts } from "../../lib/api/contracts";

export default async function ContractsPage() {
  const contracts = await getContracts().catch(() => []);

  return (
    <div>
      <PageHeader title="Contracts" description="Commercial relationship and route pricing snapshot." />
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Starts</th>
                <th className="px-4 py-3 font-medium">Routes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-slate-500">No contracts found.</td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{contract.client?.name ?? contract.clientId}</td>
                    <td className="px-4 py-3">{contract.reference}</td>
                    <td className="px-4 py-3">{contract.status}</td>
                    <td className="px-4 py-3">{new Date(contract.startsOn).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{contract.routes.length}</td>
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
