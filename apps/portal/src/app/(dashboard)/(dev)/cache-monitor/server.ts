"use server";

import { getCacheInsights } from "@/modules/collections/utils/cache-monitor";

/**
 * Retrieves cache monitoring insights from the cache utility module.
 *
 * @returns A promise that resolves with cache insights data.
 */
export async function getCacheMonitorData() {
  return await getCacheInsights();
}
