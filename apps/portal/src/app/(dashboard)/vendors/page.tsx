import { Suspense } from "react";

import { OnboardingDataDisplay } from "@/components/debug/onboarding-data-display";
import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { getVendors } from "@/modules/vendors/actions/queries";
import { InviteModal } from "@/modules/vendors/components/ui/invite-modal";
import { VendorCard } from "@/modules/vendors/components/ui/vendor-card";
import { InvitationHistory } from "@/modules/vendors/views/invitation-history";

export default async function VendorsPage() {
  const { session } = await hasPermission({
    permissions: {
      vendors: ["create", "delete", "invite"],
    },
  });

  return (
    <MainWrapper>
      <PageHeader title="Vendors">
        <InviteModal />
      </PageHeader>
      <Tabs className="mt-1 w-full px-6" defaultValue="all">
        <TabsList className="flex h-auto w-full justify-between rounded-none border-b bg-transparent p-0">
          <div>
            <TabsTrigger
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
              value="all"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
              value="pending"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
              value="approved"
            >
              Approved
            </TabsTrigger>
            <TabsTrigger
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
              value="rejected"
            >
              Rejected
            </TabsTrigger>
          </div>
          <TabsTrigger
            className="!flex-0 relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
            value="invitation-history"
          >
            Invitation History
          </TabsTrigger>
        </TabsList>

        <TabsContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3" value="all">
          <Suspense fallback={<div>Loading...</div>}>
            <SuspendedVendors />
          </Suspense>
        </TabsContent>
        <TabsContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" value="pending">
          <div className="col-span-full">
            <OnboardingDataDisplay userId={session?.user?.id} />
          </div>
          {/* {pendingVendors.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <IconEmpty className="mb-4 size-60" />
              <div className="text-lg text-muted-foreground">No pending vendors.</div>
            </div>
          ) : (
            pendingVendors.map((vendor) => <VendorCard key={vendor.id} showActions vendor={vendor} />)
          )} */}
        </TabsContent>
        <TabsContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" value="approved">
          {/* {approvedVendors.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <IconEmpty className="mb-4 size-60" />
              <div className="text-lg text-muted-foreground">No approved vendors.</div>
            </div>
          ) : (
            approvedVendors.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} />)
          )} */}
        </TabsContent>
        <TabsContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" value="rejected">
          {/* {rejectedVendors.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <IconEmpty className="mb-4 size-60" />
              <div className="text-lg text-muted-foreground">No rejected vendors.</div>
            </div>
          ) : (
            rejectedVendors.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} />)
          )} */}
        </TabsContent>
        <TabsContent value="invitation-history">
          <InvitationHistory />
        </TabsContent>
      </Tabs>
    </MainWrapper>
  );
}

async function SuspendedVendors() {
  const vendors = await getVendors();

  return vendors.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} />);
}
