import { hasPermission } from "@/modules/auth/actions/data-access";
import CacheMonitorPage from "./cache-monitor";

/**
 * Renders the cache monitoring page after checking user permissions for product-related actions.
 *
 * This component verifies whether the user has permission to create, delete, or update products before displaying the cache monitor interface.
 */
export default async function CachePage() {
  const { res } = await hasPermission({
    permissions: {
      products: ["create", "delete", "update"],
    },
  });
  console.log(res);
  return <CacheMonitorPage />;
}
