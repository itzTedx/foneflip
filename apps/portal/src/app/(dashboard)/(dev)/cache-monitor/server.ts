"use server";

import { getCacheInsights } from "@/features/collections/utils/cache-monitor";

export async function getCacheMonitorData() {
  return await getCacheInsights();
}
