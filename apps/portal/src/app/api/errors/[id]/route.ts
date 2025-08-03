import { NextRequest, NextResponse } from "next/server";

import { getErrorInfo } from "@/lib/error-handler";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const errorId = params.id;

    if (!errorId) {
      return NextResponse.json({ error: "Error ID is required" }, { status: 400 });
    }

    const errorInfo = await getErrorInfo(errorId);

    if (!errorInfo) {
      return NextResponse.json({ error: "Error information not found" }, { status: 404 });
    }

    // Return only user-friendly information, not sensitive details
    return NextResponse.json({
      id: errorInfo.id,
      type: errorInfo.type,
      message: errorInfo.message,
      status: errorInfo.status,
      timestamp: errorInfo.timestamp,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to retrieve error information" }, { status: 500 });
  }
}
