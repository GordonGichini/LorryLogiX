import { PageHeader } from "../../components/page-header";
import { getContracts } from "../../lib/api/contracts";
import { getRoutes } from "../../lib/api/routes";
import { RouteManager } from "../../components/route-manager";

export default async function RoutesPage() {
  const [routes, contracts] = await Promise.all([getRoutes().catch(() => []), getContracts().catch(() => [])]);

  return (
    <div>
      <PageHeader title="Routes" description="Manage physical corridors and client-specific commercial rates." />
      <RouteManager initialRoutes={routes} contracts={contracts} />
    </div>
  );
}
