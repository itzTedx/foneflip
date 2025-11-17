import { Metadata } from "next";

import { TRPCDemo } from "@/components/examples/trpc-demo";
import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "tRPC Demo | Foneflip",
  description: "Testing tRPC implementation in the portal",
};

export default function TRPCDemoPage() {
  return (
    <MainWrapper>
      <PageHeader badge="Demo" title="tRPC Demo">
        <p className="text-muted-foreground">Testing tRPC implementation with filtering and data fetching</p>
      </PageHeader>
      <TRPCDemo />
    </MainWrapper>
  );
}
