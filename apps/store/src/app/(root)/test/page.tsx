"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/lib/trpc/react";

export default function Test() {
  const trpc = useTRPC();
  const { data: posts } = useSuspenseQuery(trpc.auth.getSecretMessage.queryOptions());
  return <div>{JSON.stringify(posts)}</div>;
}
