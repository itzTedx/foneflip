"use client";

import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/lib/orpc";

export default function Test() {
  const healthCheck = useQuery({
    queryKey: ["healthCheck"],
    queryFn: () => orpc.healthCheck.queryOptions(),
  });

  return <div>{JSON.stringify(healthCheck.data)}</div>;
}
