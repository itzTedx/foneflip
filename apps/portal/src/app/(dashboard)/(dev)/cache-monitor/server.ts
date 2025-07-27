"use server";

import { getCacheInsights } from "@/modules/collections/utils/cache-monitor";

export async function getCacheMonitorData() {
  return await getCacheInsights();
}
