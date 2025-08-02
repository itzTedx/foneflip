import { Badge } from "@ziron/ui/badge";

import { MainWrapper } from "@/components/layout/main-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermission } from "@/modules/auth/actions/data-access";
import { InviteModal } from "@/modules/vendors/components/invite-modal";
import { InvitationHistory } from "@/modules/vendors/components/views/invitation-history";

export default async function VendorsPage() {
  await hasPermission({
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
              All <Badge>0{/* {allVendors.length} */}</Badge>
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

        <TabsContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" value="all">
          {/* {allVendors.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <IconEmpty className="mb-4 size-60" />
              <div className="text-lg text-muted-foreground">No vendors found.</div>
              <Button asChild className="mt-4">
                <Link href="/vendors/invite?new=true">
                  <IconVendors className="mr-2 h-4 w-4" />
                  Invite your first vendor
                </Link>
              </Button>
            </div>
          ) : (
            allVendors.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} />)
          )} */}
        </TabsContent>
        <TabsContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" value="pending">
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
