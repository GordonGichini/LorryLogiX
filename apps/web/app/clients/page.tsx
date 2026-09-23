import { PageHeader } from "../../components/page-header";
import { getClients } from "../../lib/api/clients";

export default async function ClientsPage() {
  const clients = await getClients().catch(() => []);

  return (
    <div>
      <PageHeader title="Clients" description="Managed customer relationships and contract coverage." />
      <div className="data-panel">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-slate-500">No clients found.</td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{client.name}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">{client.status}</span></td>
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
