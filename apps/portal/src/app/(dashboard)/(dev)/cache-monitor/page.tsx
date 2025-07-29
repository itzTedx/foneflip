import { hasPermission } from "@/modules/auth/actions/data-access";
import CacheMonitorPage from "./cache-monitor";

export default async function CachePage() {
  const { res } = await hasPermission({
    permissions: {
      products: ["create", "delete", "update"],
    },
  });
  console.log(res);
  return <CacheMonitorPage />;
}
