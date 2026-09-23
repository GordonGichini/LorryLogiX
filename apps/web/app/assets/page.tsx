import { PageHeader } from "../../components/page-header";
import { getAssets } from "../../lib/api/assets";

export default async function AssetsPage() {
  const assets = await getAssets().catch(() => []);

  return (
    <div>
      <PageHeader title="Lorries" description="Fleet assets and maintenance context." />
      <div className="data-panel">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Registration</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-slate-500">No lorries found.</td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{asset.registration}</td>
                    <td className="px-4 py-3">{asset.description}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">{asset.status}</span>
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
