import { PageHeader } from "../../components/page-header";
import { getAssets } from "../../lib/api/assets";
import { AssetManager } from "../../components/asset-manager";

export default async function AssetsPage() {
  const assets = await getAssets({ page: 1, pageSize: 25 }).catch(() => ({
    data: [],
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0,
  }));

  return (
    <div>
      <PageHeader
        title="Lorries"
        description="Fleet assets and maintenance context."
      />
      <AssetManager initialPage={assets} />
    </div>
  );
}
