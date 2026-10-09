import { PageHeader } from "../../components/page-header";
import { getDrivers } from "../../lib/api/drivers";
import { DriverManager } from "../../components/driver-manager";

export default async function DriversPage() {
  const drivers = await getDrivers({ page: 1, pageSize: 25 }).catch(() => ({
    data: [],
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0,
  }));

  return (
    <div>
      <PageHeader
        title="Drivers"
        description="Operational driving team and assignment status."
      />
      <DriverManager initialPage={drivers} />
    </div>
  );
}
