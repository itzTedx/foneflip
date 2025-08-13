import type { NextRequest } from "next/server";

import { RPCHandler } from "@orpc/server/fetch";

import { router } from "@ziron/api";

const handler = new RPCHandler(router);

async function handleRequest(req: NextRequest) {
  const { response } = await handler.handle(req, {
    prefix: "/rpc",
    context: {},
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
