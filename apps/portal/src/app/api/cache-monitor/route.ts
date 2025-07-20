import { getCacheInsights } from "@/features/collections/utils/cache-monitor";

export async function GET() {
  try {
    const data = await getCacheInsights();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch cache metrics" },
      { status: 500 },
    );
  }
}
